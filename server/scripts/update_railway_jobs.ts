import { db } from '../src/lib/db.js';
import { auditJobs } from '../src/db/schema.js';
import { eq, or, and } from 'drizzle-orm';

async function updateRailwayJobs() {
    console.log('🔄 Connecting to Railway Database...');
    console.log('🧹 Cleaning up ALL stuck jobs in "processing" status...\n');

    try {
        // Find all jobs stuck in 'processing'
        const stuckJobs = await db.select()
            .from(auditJobs)
            .where(eq(auditJobs.status, 'processing'));

        if (stuckJobs.length === 0) {
            console.log('✨ No stuck jobs found. Database is clean!');
            process.exit(0);
            return;
        }

        console.log(`🎯 Found ${stuckJobs.length} stuck job(s):\n`);

        // Show what we found
        stuckJobs.forEach((job, index) => {
            const createdAt = new Date(job.created_at).toLocaleString();
            console.log(`   ${index + 1}. Job ID: ${job.id.substring(0, 12)}...`);
            console.log(`      Created: ${createdAt}`);
            console.log(`      User: ${job.user_id ? job.user_id.substring(0, 12) + '...' : 'GUEST'}\n`);
        });

        console.log('👷 Marking all as failed...\n');

        // Update all stuck jobs
        const result = await db.update(auditJobs)
            .set({
                status: 'failed',
                error_message: 'System cleanup: Job was interrupted and did not complete. Please try again.'
            })
            .where(eq(auditJobs.status, 'processing'))
            .returning({ id: auditJobs.id });

        console.log(`✅ Successfully cleaned up ${result.length} stuck job(s).`);
        result.forEach((job, index) => {
            console.log(`   ${index + 1}. ${job.id}`);
        });

        console.log('\n🏁 Cleanup complete. Your dashboard should now be clear!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    }
}

updateRailwayJobs();
