
import { Router } from "express";
import { z } from "zod";
import { pool } from "../lib/db";

const router = Router();

const eventSchema = z.object({
    eventId: z.string().min(1).max(200),
    type: z.string().min(1).max(100),
    payload: z.record(z.string(), z.unknown()),
});


router.post("/", async (req, res) => {
    const parsed = eventSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid event data",
            details: parsed.error.flatten(),
        });
    }

    const { eventId, type, payload } = parsed.data;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Insert the event if its ID doesn't already exist.
        const result = await client.query(
            `INSERT INTO events (event_id, event_type, payload)
       VALUES ($1, $2, $3::jsonb)
       ON CONFLICT (event_id) DO NOTHING
       RETURNING event_id, event_type, payload, status, created_at`,
            [eventId, type, JSON.stringify(payload)]
        );

        if (result.rowCount === 0) {
            // An event with this ID already exists.
            const existing = await client.query(
                `SELECT event_id, event_type, payload, status, created_at,
                (event_type = $2 AND payload = $3::jsonb) AS same_event
         FROM events
         WHERE event_id = $1`,
                [eventId, type, JSON.stringify(payload)]
            );

            await client.query("COMMIT");

            if (existing.rows[0]?.same_event) {
                return res.status(200).json({
                    message: "Event already accepted",
                    duplicate: true,
                    event: existing.rows[0],
                });
            }

            return res.status(409).json({
                error: "Event ID already exists with a different type or payload",
                eventId,
            });
        }

        // Insert the matching outbox record in the SAME transaction.
        await client.query(
            `INSERT INTO outbox (event_id, event_type, payload)
       VALUES ($1, $2, $3::jsonb)`,
            [eventId, type, JSON.stringify(payload)]
        );

        // Both inserts become permanent together.
        await client.query("COMMIT");

        return res.status(201).json({
            message: "Event accepted",
            duplicate: false,
            event: result.rows[0],
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Event ingestion failed:", error);

        return res.status(500).json({
            error: "Failed to accept event",
        });
    } finally {
        client.release();
    }
});


router.get("/:eventId", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT event_id, event_type, payload, status, created_at
       FROM events
       WHERE event_id = $1`,
            [req.params.eventId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                error: "Event not found",
            });
        }

        return res.status(200).json({
            event: result.rows[0],
        });
    } catch (error) {
        console.error("Event lookup failed:", error);

        return res.status(500).json({
            error: "Failed to retrieve event",
        });
    }
});

export default router;
