import express from 'express';
import { db } from '../lib/db.js';
import { auditJobs } from '../db/schema.js';
import { requireUserAuth, AuthenticatedRequest } from '../middleware/apiAuth.js';
import { eq, desc, and } from 'drizzle-orm';

const router = express.Router();

// GET /api/user/audits
router.get('/audits', requireUserAuth, async (req, res) => {
    try {
        const user = (req as AuthenticatedRequest).user;

        // Use Drizzle Query to fetch audits for this user.
        const audits = await db
            .select({
                id: auditJobs.id,
                created_at: auditJobs.created_at,
                status: auditJobs.status,
                input_data: auditJobs.input_data,
                error_message: auditJobs.error_message,
                api_key_id: auditJobs.api_key_id,
                thumbnail_url: auditJobs.thumbnail_url,
            })
            .from(auditJobs)
            .where(eq(auditJobs.user_id, user.id))
            .orderBy(desc(auditJobs.created_at))
            .limit(100);

        res.json(audits);
    } catch (e: any) {
        console.error('Fetch Audits Error:', e);
        res.status(500).json({ error: e.message });
    }
});

// PATCH /api/user/audits/:id
router.patch('/audits/:id', requireUserAuth, async (req, res) => {
    try {
        const user = (req as AuthenticatedRequest).user;
        const { id } = req.params;
        const updates = req.body;

        const audit = await db.query.auditJobs.findFirst({
            where: and(eq(auditJobs.id, id), eq(auditJobs.user_id, user.id))
        });

        if (!audit) return res.status(404).json({ error: 'Audit not found' });

        const newInputData: any = { ...(audit.input_data as object), ...updates };

        await db.update(auditJobs)
            .set({ input_data: newInputData })
            .where(eq(auditJobs.id, id));

        res.json({ success: true });
    } catch (e: any) {
        console.error('Update Audit Error:', e);
        res.status(500).json({ error: e.message });
    }
});

export default router;
