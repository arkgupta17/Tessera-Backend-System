
import { eventQueue } from "./queues/eventQueue";
import { redis } from "./lib/redis";
import { pool } from "./lib/db";

async function testRetries() {
    try {
        const eventId = `retry_test_${Date.now()}`;

        // 1. Create a real event in PostgreSQL.
        await pool.query(
            `INSERT INTO events (event_id, event_type, payload, status)
       VALUES ($1, $2, $3::jsonb, 'RECEIVED')`,
            [
                eventId,
                "RetryTest",
                JSON.stringify({ test: true }),
            ]
        );

        console.log("Test event created:", eventId);

        // 2. Enqueue a job for that event.
        const job = await eventQueue.add(
            "process-event",
            { eventId },
            {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 1000,
                },
                jobId: `retry-test-${eventId}`,
            }
        );

        console.log("Test job added:", job.id);
    } catch (error) {
        console.error("Retry test setup failed:", error);
        process.exitCode = 1;
    } finally {
        await eventQueue.close();
        await pool.end();
        await redis.quit();
    }
}

void testRetries();
