import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { JobProcessor } from '../services/jobProcessor';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

export const startWorker = () => {
    console.log('[Worker] Starting Audit Worker...');

    // Concurrency: 1 means this worker instance runs 1 job at a time.
    // Scale by adding more Worker Instances (Railway Replicas).
    const worker = new Worker('audit-queue', async (job) => {
        const counts = await worker.getJobCounts();
        console.log(`[Worker] Picking up job ${job.id} (Data ID: ${job.data.jobId})`);
        console.log(`[Queue] Status: Active: ${counts.active}, Waiting: ${counts.waiting}, Concurrency: ${process.env.WORKER_CONCURRENCY || 1}`);

        try {
            // The job data contains { jobId: string of database ID }
            const dbJobId = job.data.jobId;
            if (!dbJobId) throw new Error("Job Data missing 'jobId'");

            await JobProcessor.processJob(dbJobId);
            console.log(`[Worker] Job ${job.id} (DB: ${dbJobId}) finished successfully.`);
        } catch (error) {
            console.error(`[Worker] Job ${job.id} failed:`, error);
            throw error; // Triggers BullMQ retry
        }

    }, {
        connection,
        concurrency: parseInt(process.env.WORKER_CONCURRENCY || '1', 10) // Allow env override
    });

    worker.on('completed', job => {
        console.log(`[Worker] Job ${job.id} completed!`);
    });

    worker.on('failed', (job, err) => {
        console.error(`[Worker] Job ${job?.id} failed with ${err.message}`);
    });

    console.log('[Worker] Audit Worker Listening.');
    return worker;
};
