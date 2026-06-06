import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

// Use the environment variable DB_URL (or fallback to DATABASE_URL if that's what Render uses)
const connectionString = process.env.DB_URL || process.env.DATABASE_URL;

if (!connectionString) {
    console.error("CRITICAL DATABASE ERROR: DB_URL or DATABASE_URL is not set in the environment variables!");
}

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        console.error("Database connection failed:", err.stack);
    } else {
        console.log("Database connected successfully to Render!");
        release();
    }
});

export default {
    query: (text, params) => pool.query(text, params),
    pool
};
