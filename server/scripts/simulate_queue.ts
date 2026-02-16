import { db } from '../src/lib/db.js';
import { auditQueue, auditJobs } from '../src/db/schema.js';
import crypto from 'crypto';

/**
 * SIMULATE QUEUE DEPTH
 * Run this script to insert 5 fake "waiting" jobs into the database.
 * This will trigger the "High traffic" message on the frontend for the 6th submission.
 */
async function simulateQueue() {
    console.log("🚀 Simulating high traffic queue (adding 15 jobs)...");

    for (let i = 1; i <= 15; i++) {
        const jobId = crypto.randomUUID();
        const queueId = crypto.randomUUID();

        // 1. Create a dummy job record
        await db.insert(auditJobs).values({
            id: jobId,
            status: 'pending',
            input_data: { inputs: [{ url: `https://test-${i}.com` }] },
            audit_type: 'standard'
        });

        // 2. Add to queue
        await db.insert(auditQueue).values({
            id: queueId,
            job_id: jobId,
            status: 'waiting',
            queue_type: 'realtime',
            priority: 100,
            payload: { inputs: [{ url: `https://test-${i}.com` }] }
        });

        console.log(`[${i}] Mock job added: ${jobId}`);
    }

    console.log("\n✅ Done! Now try submitting a real audit from the frontend.");
    console.log("It should show: 'High volume detected. You are in position 6. We will email you results.'");
    process.exit(0);
}

simulateQueue().catch(err => {
    console.error("Simulation failed:", err);
    process.exit(1);
});
