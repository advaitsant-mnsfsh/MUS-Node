import { db } from '../src/lib/db.js';
import { auditJobs } from '../src/db/schema.js';
import { eq, or, and } from 'drizzle-orm';

async function updateRailwayJobs() {
    const TARGET_JOB_ID = 'c856e7b9-2da0-4794-baf5-5704fe762428';
    console.log('🔄 Connecting to Railway Database...');

    try {
        console.log(`📊 Searching for Target Job: ${TARGET_JOB_ID}...`);

        const job = await db.select()
            .from(auditJobs)
            .where(eq(auditJobs.id, TARGET_JOB_ID));

        if (job.length > 0) {
            console.log(`🎯 Found job with status: ${job[0].status}. Marking as failed...`);

            await db.update(auditJobs)
                .set({
                    status: 'failed',
                    error_message: 'Manually stopped by administrator to resolve database access issues.'
                })
                .where(eq(auditJobs.id, TARGET_JOB_ID));

            console.log(`✅ Successfully stopped job ${TARGET_JOB_ID}.`);
        } else {
            console.log(`❌ Job ID ${TARGET_JOB_ID} not found in database.`);
        }

        console.log('🏁 Operation complete.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Operation failed:', error);
        process.exit(1);
    }
}

updateRailwayJobs();
