
import { createHash } from "node:crypto";
import { pool } from "../lib/db";
import { redis } from "../lib/redis";
import { eventQueue } from "../queues/eventQueue";

const LEASE_TIMEOUT_MS = 5 * 60 * 1000;
const POLL_INTERVAL_MS = 5000;
const BATCH_SIZE = 100;

type StaleEvent = {
    event_id: string;
    processing_started_at: Date | null;
};

let shuttingDown = false;

async function scanForStaleEvents(): Promise<number> {
    const result = await pool.query<StaleEvent>(
        `SELECT event_id, processing_started_at
     FROM events
     WHERE status = 'PROCESSING'
       AND (
         processing_started_at IS NULL
         OR processing_started_at <
            NOW() - ($1::int * INTERVAL '1 millisecond')
       )
     ORDER BY processing_started_at NULLS FIRST
     LIMIT $2`,
        [LEASE_TIMEOUT_MS, BATCH_SIZE]
    );

    for (const event of result.rows) {
        // Generate a stable ID for this particular processing lease.
        // Repeated scans of the same stale lease won't create new jobs.
        const leaseKey = event.processing_started_at
            ? new Date(event.processing_started_at).toISOString()
            : "missing-timestamp";

        const jobHash = createHash("sha256")
            .update(`${event.event_id}:${leaseKey}`)
            .digest("hex")
            .slice(0, 32);

        const job = await eventQueue.add(
            "process-event",
            { eventId: event.event_id },
            {
                jobId: `recovery-${jobHash}`,
            }
        );

        console.log(
            `Recovery job scheduled for ${event.event_id}: ${job.id}`
        );
    }

    return result.rows.length;
}

async function main() {
    console.log("Tessera recovery scanner is running");

    while (!shuttingDown) {
        try {
            const count = await scanForStaleEvents();

            if (count > 0) {
                console.log(`Found ${count} stale event(s)`);
            }
        } catch (error) {
            console.error("Recovery scan failed:", error);
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
    console.log("Shutting down recovery scanner...");

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
