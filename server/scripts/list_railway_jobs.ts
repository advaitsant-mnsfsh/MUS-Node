import { db } from '../src/lib/db.js';
import { auditJobs } from '../src/db/schema.js';
import { desc } from 'drizzle-orm';

async function listRailwayJobs() {
    console.log('🔍 Fetching latest 20 audits from Railway (Lite)...');

    try {
        const jobs = await db.select({
            id: auditJobs.id,
            status: auditJobs.status,
            user_id: auditJobs.user_id,
            error_message: auditJobs.error_message,
            created_at: auditJobs.created_at
        })
            .from(auditJobs)
            .orderBy(desc(auditJobs.created_at))
            .limit(20);

        const formattedJobs = jobs.map(j => {
            return {
                ID: j.id.substring(0, 8) + '...',
                Status: j.status,
                User: j.user_id ? j.user_id.substring(0, 8) + '...' : 'GUEST',
                Created: j.created_at.toLocaleString(),
                Error: j.error_message ? j.error_message.substring(0, 40) + '...' : 'None'
            };
        });

        console.table(formattedJobs);
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to fetch jobs:', error);
        process.exit(1);
    }
}

listRailwayJobs();
