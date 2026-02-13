import { db } from '../lib/db.js';
import { auditQueue } from '../db/schema.js';
import { eq, sql, desc, and } from 'drizzle-orm';
import crypto from 'crypto';

export class QueueService {
    /**
     * Adds a new job to the persistent DB queue.
     */
    static async addJobToQueue(jobId: string, payload: any, userId?: string | null) {
        const queueId = crypto.randomUUID();

        // Calculate initial priority based on current queue depth
        const waitingCount = await this.getWaitingCount();
        const queueType = waitingCount < 4 ? 'realtime' : 'email';
        const priority = queueType === 'realtime' ? 100 : 50;

        await db.insert(auditQueue).values({
            id: queueId,
            job_id: jobId,
            status: 'waiting',
            queue_type: queueType,
            priority: priority,
            payload: payload
        });

        console.log(`[QueueService] Job ${jobId} added to queue at position ${waitingCount + 1}`);
        return { queueId, position: waitingCount + 1, queueType };
    }

    /**
     * Finds the next eligible job to process.
     * Sorts by priority (desc) and then creation time (asc).
     */
    static async getNextJob() {
        const [nextJob] = await db.select()
            .from(auditQueue)
            .where(eq(auditQueue.status, 'waiting'))
            .orderBy(desc(auditQueue.priority), auditQueue.created_at)
            .limit(1);

        return nextJob || null;
    }

    /**
     * Marks a job as being processed and assigns a browser key.
     */
    static async startProcessing(queueId: string, browserKey: number) {
        await db.update(auditQueue)
            .set({
                status: 'processing',
                browser_key: browserKey,
                started_at: new Date()
            })
            .where(eq(auditQueue.id, queueId));
    }

    /**
     * Finalizes a job in the queue record.
     */
    static async completeJob(queueId: string, success: boolean, errorMsg?: string) {
        await db.update(auditQueue)
            .set({
                status: success ? 'completed' : 'failed',
                completed_at: new Date(),
                error_log: errorMsg
            })
            .where(eq(auditQueue.id, queueId));
    }

    static async getWaitingCount(): Promise<number> {
        const [result] = await db.select({ count: sql<number>`count(*)` })
            .from(auditQueue)
            .where(eq(auditQueue.status, 'waiting'));

        return Number(result?.count || 0);
    }

    static async getInProgressCount(): Promise<number> {
        const [result] = await db.select({ count: sql<number>`count(*)` })
            .from(auditQueue)
            .where(eq(auditQueue.status, 'processing'));

        return Number(result?.count || 0);
    }

    /**
     * Finds jobs stuck in 'processing' (e.g. from a previous server crash/restart)
     * and marks them as failed so they don't block the UI/Queue.
     */
    static async cleanupStuckJobs() {
        try {
            const stuckJobs = await db.select()
                .from(auditQueue)
                .where(eq(auditQueue.status, 'processing'));

            if (stuckJobs.length === 0) return;

            console.log(`[QueueService] Found ${stuckJobs.length} stuck jobs. Cleaning up...`);

            const { JobService } = await import('./jobService.js');

            for (const job of stuckJobs) {
                // 1. Mark in Queue as failed
                await this.completeJob(job.id, false, "System restart: Job abandoned.");

                // 2. Mark in AuditJobs as failed (this stops the UI spinner)
                await JobService.updateJobStatus(job.job_id, 'failed', null, "The system was restarted while this audit was in progress. Please try again.");

                console.log(`[QueueService] 🧹 Cleaned up stuck job: ${job.job_id}`);
            }
        } catch (e) {
            console.error("[QueueService] Failed to cleanup stuck jobs:", e);
        }
    }
}
