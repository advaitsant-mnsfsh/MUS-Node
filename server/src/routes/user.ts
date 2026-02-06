import express from 'express';
import { db } from '../lib/db';
import { auditJobs } from '../db/schema';
import { requireUserAuth, AuthenticatedRequest } from '../middleware/apiAuth';
import { eq, desc, and } from 'drizzle-orm';

const router = express.Router();

// GET /api/user/audits
router.get('/audits', requireUserAuth, async (req, res) => {
    try {
        const user = (req as AuthenticatedRequest).user;

        // Use Drizzle Query to fetch audits for this user.
        // We only show COMPLETED audits in the dashboard.
        const audits = await db
            .select({
                id: auditJobs.id,
                created_at: auditJobs.created_at,
                status: auditJobs.status,
                input_data: auditJobs.input_data,
                error_message: auditJobs.error_message,
                api_key_id: auditJobs.api_key_id,
            })
            .from(auditJobs)
            .where(
                and(
                    eq(auditJobs.user_id, user.id),
                    eq(auditJobs.status, 'completed')
                )
            )
            .orderBy(desc(auditJobs.created_at))
            .limit(50);

        res.json(audits);
    } catch (e: any) {
        console.error('Fetch Audits Error:', e);
        res.status(500).json({ error: e.message });
    }
});

export default router;
