
import { redis } from "./lib/redis";

async function testRedis() {
  try {
    const response = await redis.ping();
    console.log("Redis connected:", response);

    await redis.set("tessera:test", "connected");
    const value = await redis.get("tessera:test");

    console.log("Stored value:", value);
  } catch (error) {
    console.error("Redis test failed:", error);
    process.exitCode = 1;
  } finally {
    await redis.quit();
  }
}

testRedis();
