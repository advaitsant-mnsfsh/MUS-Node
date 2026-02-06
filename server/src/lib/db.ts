import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../db/schema';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('❌ [CRITICAL] DATABASE_URL is missing from environment variables. You MUST add this in the Railway/Platform "Variables" dashboard.');
    } else {
        console.warn('⚠️ DATABASE_URL is missing (Check your .env file). Database Connection will fail.');
    }
}

// Use a connection pool for better performance handling multiple requests
const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds to stay fresh
    connectionTimeoutMillis: 5000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
});

// Error handling for the pool to prevent crashes
pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
});

// Pre-warm the pool to avoid cold-start latency on first request
export const preWarmDatabase = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            await pool.query('SELECT 1');
            console.log('✓ Database connection pre-warmed and ready.');
            return;
        } catch (err: any) {
            console.warn(`⚠️ Database pre-warm attempt ${i + 1} failed: ${err.message}`);
            if (i === retries - 1) throw err;
            await new Promise(r => setTimeout(r, 2000));
        }
    }
};

export const db = drizzle(pool, { schema });
