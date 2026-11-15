
import { pool } from "./lib/db";

async function testConnection() {
    try {
        const result = await pool.query(
            "SELECT current_database() AS database, NOW() AS time"
        );

        console.log("Database connected:", result.rows[0]);
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

testConnection();
