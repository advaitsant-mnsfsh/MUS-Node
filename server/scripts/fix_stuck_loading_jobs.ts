import { db } from '../src/lib/db.js';
import { auditJobs } from '../src/db/schema.js';
import { eq, and, isNull, or } from 'drizzle-orm';

async function fixStuckLoadingJobs() {
    console.log('🔄 Connecting to Railway Database...');
    console.log('🔍 Finding jobs stuck in "pending" or "processing" without completed reports...\n');

    try {
        // Find jobs that are:
        // 1. Status is 'pending' or 'processing'
        // 2. report_data is NULL or doesn't have a complete report
        const stuckJobs = await db.select()
            .from(auditJobs)
            .where(
                or(
                    eq(auditJobs.status, 'pending'),
                    eq(auditJobs.status, 'processing')
                )
            );

        if (stuckJobs.length === 0) {
            console.log('✨ No stuck loading jobs found. All jobs have proper status!');
            process.exit(0);
            return;
        }

        console.log(`🎯 Found ${stuckJobs.length} job(s) stuck in loading state:\n`);

        // Show what we found
        stuckJobs.forEach((job, index) => {
            const createdAt = new Date(job.created_at).toLocaleString();
            const hasReport = job.report_data && typeof job.report_data === 'object' &&
                Object.keys(job.report_data as object).length > 5;

            console.log(`   ${index + 1}. Job ID: ${job.id.substring(0, 12)}...`);
            console.log(`      Status: ${job.status}`);
            console.log(`      Created: ${createdAt}`);
            console.log(`      Has Report Data: ${hasReport ? 'YES (will keep)' : 'NO (will mark as failed)'}`);
            console.log(`      User: ${job.user_id ? job.user_id.substring(0, 12) + '...' : 'GUEST'}\n`);
        });

        console.log('👷 Marking incomplete jobs as failed...\n');

        let fixedCount = 0;
        let keptCount = 0;

        for (const job of stuckJobs) {
            const hasReport = job.report_data && typeof job.report_data === 'object' &&
                Object.keys(job.report_data as object).length > 5;

            if (hasReport) {
                // Job has report data, mark as completed
                await db.update(auditJobs)
                    .set({
                        status: 'completed'
                    })
                    .where(eq(auditJobs.id, job.id));
                keptCount++;
                console.log(`   ✅ Kept job ${job.id.substring(0, 12)}... (has report data, marked as completed)`);
            } else {
                // No report data, mark as failed
                await db.update(auditJobs)
                    .set({
                        status: 'failed',
                        error_message: 'System cleanup: Job did not complete successfully. Please try again.'
                    })
                    .where(eq(auditJobs.id, job.id));
                fixedCount++;
                console.log(`   ❌ Failed job ${job.id.substring(0, 12)}... (no report data)`);
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   ✅ Jobs with reports (marked completed): ${keptCount}`);
        console.log(`   ❌ Jobs without reports (marked failed): ${fixedCount}`);
        console.log('\n🏁 Cleanup complete. All jobs now have proper final status!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    }
}

fixStuckLoadingJobs();
