
import { pool } from "../lib/db";
import { redis } from "../lib/redis";
import { eventQueue } from "../queues/eventQueue";

const BATCH_SIZE = 10;
const POLL_INTERVAL_MS = 2000;

type OutboxRecord = {
    id: string;
    event_id: string;
    event_type: string;
    payload: Record<string, unknown>;
};

let shuttingDown = false;

async function publishPendingEvents(): Promise<number> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Lock pending rows so concurrent publishers don't
        // select the same records at the same time.
        const result = await client.query<OutboxRecord>(
            `SELECT id, event_id, event_type, payload
       FROM outbox
       WHERE status = 'PENDING'
       ORDER BY id
       LIMIT $1
       FOR UPDATE SKIP LOCKED`,
            [BATCH_SIZE]
        );

        const records = result.rows;

        for (const record of records) {
            // Use a stable job ID so a retry of this publication
            // doesn't create another job while the original is retained.
            await eventQueue.add(
                "process-event",
                { eventId: record.event_id },
                {
                    jobId: `outbox-${record.id}`,
                }
            );

            await client.query(
                `UPDATE outbox
         SET status = 'PUBLISHED',
             published_at = NOW()
         WHERE id = $1`,
                [record.id]
            );

            console.log(
                `Published outbox record ${record.id} for event ${record.event_id}`
            );
        }

        await client.query("COMMIT");

        return records.length;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function main() {
    console.log("Tessera outbox publisher is running");

    while (!shuttingDown) {
        try {
            const count = await publishPendingEvents();

            if (count > 0) {
                console.log(`Published ${count} outbox record(s)`);
            }
        } catch (error) {
            console.error("Outbox publishing failed:", error);
        }

        if (!shuttingDown) {
            await new Promise((resolve) =>
                setTimeout(resolve, POLL_INTERVAL_MS)
            );
        }
    }
}

async function shutdown() {
    if (shuttingDown) return;

    shuttingDown = true;
    console.log("Shutting down outbox publisher...");

    await eventQueue.close();
    await pool.end();
    await redis.quit();
}

process.on("SIGINT", () => {
    void shutdown();
});

process.on("SIGTERM", () => {
    void shutdown();
});

void main();
