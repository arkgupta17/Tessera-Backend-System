
import request from "supertest";
import app from "../src/app";
import { pool } from "../src/lib/db";

describe("POST /events", () => {
    const eventId = `test_event_${Date.now()}`;

    afterAll(async () => {
        await pool.query(
            "DELETE FROM outbox WHERE event_id LIKE 'test_event_%'"
        );
        await pool.query(
            "DELETE FROM events WHERE event_id LIKE 'test_event_%'"
        );
        await pool.end();
    });

    it("accepts a valid event and creates an outbox record", async () => {
        const response = await request(app)
            .post("/events")
            .send({
                eventId,
                type: "OrderPlaced",
                payload: { orderId: "order_test_123", amount: 1500 },
            });

        expect(response.status).toBe(201);
        expect(response.body.duplicate).toBe(false);

        const event = await pool.query(
            "SELECT * FROM events WHERE event_id = $1",
            [eventId]
        );
        const outbox = await pool.query(
            "SELECT * FROM outbox WHERE event_id = $1",
            [eventId]
        );

        expect(event.rowCount).toBe(1);
        expect(event.rows[0].status).toBe("RECEIVED");
        expect(outbox.rowCount).toBe(1);
        expect(outbox.rows[0].status).toBe("PENDING");
    });

    it("recognizes an identical event as a duplicate", async () => {
        const body = {
            eventId,
            type: "OrderPlaced",
            payload: { orderId: "order_test_123", amount: 1500 },
        };

        const response = await request(app).post("/events").send(body);

        expect(response.status).toBe(200);
        expect(response.body.duplicate).toBe(true);
    });

    it("rejects the same event ID with different data", async () => {
        const response = await request(app)
            .post("/events")
            .send({
                eventId,
                type: "OrderPlaced",
                payload: { orderId: "order_test_123", amount: 9999 },
            });

        expect(response.status).toBe(409);
        expect(response.body.error).toMatch(/different type or payload/i);
    });

    it("handles concurrent requests with the same event ID", async () => {
        const eventId = `test_event_concurrent_${Date.now()}`;

        const payload = {
            eventId,
            type: "ConcurrentTest",
            payload: { source: "concurrency-test" },
        };

        const responses = await Promise.all(
            Array.from({ length: 5 }, () =>
                request(app).post("/events").send(payload)
            )
        );

        expect(responses.filter((res) => res.status === 201)).toHaveLength(1);
        expect(responses.filter((res) => res.status === 200)).toHaveLength(4);

        const eventResult = await pool.query(
            "SELECT event_id FROM events WHERE event_id = $1",
            [eventId]
        );

        const outboxResult = await pool.query(
            "SELECT event_id FROM outbox WHERE event_id = $1",
            [eventId]
        );

        expect(eventResult.rowCount).toBe(1);
        expect(outboxResult.rowCount).toBe(1);
    });

    it("rejects invalid event data", async () => {
        const response = await request(app)
            .post("/events")
            .send({
                eventId: "",
                type: "OrderPlaced",
                payload: {},
            });

        expect(response.status).toBe(400);
    });

});
