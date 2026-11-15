
import { Worker } from "bullmq";
import { redis } from "../lib/redis";
import { pool } from "../lib/db";

type EventJobData = {
    eventId: string;
};

const LEASE_TIMEOUT_MS = 5 * 60 * 1000;

const worker = new Worker<EventJobData>(
    "event-processing",
    async (job) => {
        const { eventId } = job.data;

        if (typeof eventId !== "string" || eventId.length === 0) {
            throw new Error("Invalid job: eventId is required");
        }

        const client = await pool.connect();
        let claimedAt: Date;

        try {
            await client.query("BEGIN");

            const result = await client.query(
                `SELECT event_id, event_type, payload, status,
                processing_started_at
         FROM events
         WHERE event_id = $1
         FOR UPDATE`,
                [eventId]
            );

            if (result.rowCount === 0) {
                throw new Error(`Event not found: ${eventId}`);
            }

            const event = result.rows[0];

            if (event.status === "COMPLETED") {
                await client.query("COMMIT");

                console.log(`Event ${eventId} already completed; skipping.`);

                return {
                    success: true,
                    skipped: true,
                    eventId,
                };
            }

            if (
                event.status !== "RECEIVED" &&
                event.status !== "PROCESSING"
            ) {
                throw new Error(
                    `Cannot process event ${eventId} from status ${event.status}`
                );
            }

            if (event.status === "PROCESSING") {
                const startedAt = event.processing_started_at
                    ? new Date(event.processing_started_at).getTime()
                    : 0;

                const leaseExpired =
                    startedAt === 0 ||
                    Date.now() - startedAt > LEASE_TIMEOUT_MS;

                if (!leaseExpired) {
                    await client.query("COMMIT");

                    console.log(
                        `Event ${eventId} already has an active processing lease; skipping.`
                    );

                    return {
                        success: true,
                        skipped: true,
                        reason: "active-lease",
                        eventId,
                    };
                }

                console.log(`Recovering stale event ${eventId}`);
            }

            // Claim the event and commit BEFORE doing the work.
            claimedAt = new Date();

            await client.query(
                `UPDATE events
         SET status = 'PROCESSING',
             processing_started_at = $2
         WHERE event_id = $1`,
                [eventId, claimedAt]
            );

            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }

        // Simulated business processing.
        // Keep external side effects out of this example for now.
        console.log(`Processing event: ${eventId}`);

        const result = await pool.query(
            `SELECT event_type, payload
       FROM events
       WHERE event_id = $1`,
            [eventId]
        );

        if (result.rowCount === 0) {
            throw new Error(`Event disappeared: ${eventId}`);
        }

        console.log("Event data:", {
            eventId,
            type: result.rows[0].event_type,
            payload: result.rows[0].payload,
        });

        // Complete only if this job still owns the claim.
        const completion = await pool.query(
            `UPDATE events
       SET status = 'COMPLETED',
           processing_started_at = NULL
       WHERE event_id = $1
         AND status = 'PROCESSING'
         AND processing_started_at = $2
       RETURNING event_id`,
            [eventId, claimedAt!]
        );

        if (completion.rowCount === 0) {
            throw new Error(
                `Lost processing claim for event ${eventId}; completion rejected`
            );
        }

        console.log(`Event ${eventId} marked as COMPLETED`);

        return {
            success: true,
            eventId,
        };
    },
    {
        connection: redis,
        concurrency: 5,
    }
);

worker.on("completed", (job, result) => {
    console.log(`Job ${job.id} completed:`, result);
});

worker.on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed:`, error.message);
});

console.log("Tessera event worker is running");

async function shutdown() {
    console.log("Shutting down worker...");

    await worker.close();
    await pool.end();
    await redis.quit();
}

process.on("SIGINT", () => {
    void shutdown();
});

process.on("SIGTERM", () => {
    void shutdown();
});
