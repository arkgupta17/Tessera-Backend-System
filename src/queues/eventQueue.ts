
import { Queue } from "bullmq";
import { redis } from "../lib/redis";

export const eventQueue = new Queue("event-processing", {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 1000,
        },
        removeOnComplete: 1000,
        removeOnFail: 5000,
    },
});
