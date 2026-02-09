
import { Queue, Worker, Job } from 'bullmq';
import { JobProcessor } from '../services/jobProcessor.js';
import { JobService } from '../services/jobService.js';
import { db } from './db.js'; // Ensure db is initialized if needed inside worker context
import { auditJobs } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// Redis connection options
const redisOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
};

// Create a new queue
export const auditQueue = new Queue('audit-queue', { connection: redisOptions });

// Worker to process jobs
const worker = new Worker('audit-queue', async (job: Job) => {
    const { auditJobId } = job.data;
    console.log(`[Worker] Processing job ${job.id} (Audit ID: ${auditJobId})`);

    try {
        await JobProcessor.processJob(auditJobId);
        console.log(`[Worker] Job ${job.id} completed successfully`);
    } catch (error) {
        console.error(`[Worker] Job ${job.id} failed:`, error);
        throw error;
    }
}, {
    connection: redisOptions,
    concurrency: 5 // Process up to 5 jobs concurrently 
});

worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} has completed!`);
});

worker.on('failed', async (job, err) => {
    console.error(`[Worker] Job ${job?.id} has failed with ${err.message}`);
    // Optional: Update DB status here if needed, though processJob usually handles it.
});

export default auditQueue;
