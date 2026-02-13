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
        const browser1 = secrets['BROWSER_WS_ENDPOINT_PRIMARY'] || process.env.BROWSER_WS_ENDPOINT_PRIMARY;
        const browser2 = secrets['BROWSER_WS_ENDPOINT_COMPETITOR'] || process.env.BROWSER_WS_ENDPOINT_COMPETITOR;

        // 2. Find which keys are currently "processing" in the queue
        const activeJobs = await db.select({
            browser_key: auditQueue.browser_key
        })
            .from(auditQueue)
            .where(eq(auditQueue.status, 'processing'));

        const busyKeys = new Set(activeJobs.map(j => j.browser_key));

        if (!busyKeys.has(1) && browser1) {
            return { key: 1, endpoint: browser1 };
        }

        if (!busyKeys.has(2) && browser2) {
            return { key: 2, endpoint: browser2 };
        }

        return null; // Both busy or not configured
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
