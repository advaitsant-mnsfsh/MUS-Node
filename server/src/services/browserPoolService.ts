import { db } from '../lib/db.js';
import { browserUsageLogs, auditQueue } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'crypto';
import { SecretService } from './secretService.js';

export class BrowserPoolService {
    /**
     * Finds a browser key (1 or 2) that is not currently busy.
     * Fetches endpoints from DB secrets first, then falls back to env vars.
     */
    static async acquireKey(): Promise<{ key: number; endpoint: string } | null> {
        // 1. Fetch available endpoints from DB and Env
        const secrets = await SecretService.getSecrets();

        // Dynamic Concurrency Limit (Default 2)
        const maxConcurrent = Number(secrets['MAX_CONCURRENT_JOBS'] || process.env.MAX_CONCURRENT_JOBS) || 2;

        // 2. Find which keys are currently "processing" in the queue
        const activeJobs = await db.select({
            browser_key: auditQueue.browser_key
        })
            .from(auditQueue)
            .where(eq(auditQueue.status, 'processing'));

        const busyKeys = new Set(activeJobs.map(j => j.browser_key));

        // 3. Iterate through available slots [1...maxConcurrent]
        for (let i = 1; i <= maxConcurrent; i++) {
            if (!busyKeys.has(i)) {
                // Determine which endpoint to use for this key
                // Priority: Specific key -> Global DB Secret -> Global Env Var
                let endpoint = secrets[`BROWSER_WS_ENDPOINT_${i}`]
                    || process.env[`BROWSER_WS_ENDPOINT_${i}`]
                    || secrets['PUPPETEER_BROWSER_ENDPOINT']
                    || process.env.PUPPETEER_BROWSER_ENDPOINT;

                if (endpoint) {
                    return { key: i, endpoint };
                }
            }
        }

        return null; // All keys busy or not configured
    }

    /**
     * Logs the acquisition for debugging purposes.
     * The actual "busy" state is managed by the status of the job in audit_queue.
     */
    static async logAction(key: number, jobId: string, action: 'acquired' | 'released') {
        try {
            await db.insert(browserUsageLogs).values({
                id: crypto.randomUUID(),
                browser_key: key,
                job_id: jobId,
                action: action
            });
        } catch (e) {
            console.error(`[BrowserPool] Failed to log action:`, e);
        }
    }
}
