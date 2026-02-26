import { Router } from 'express';
import { JobService } from '../services/jobService.js';

const router = Router();

// POST /api/public/verify-beta
router.post('/verify-beta', (req, res) => {
    const { code } = req.body;
    const betaCode = process.env.BETA_AUTH_CODE;
    const adminCode = process.env.ADMIN_AUTH_CODE;

    if (!betaCode && !adminCode) {
        console.error('[Beta Auth] BETA_AUTH_CODE and ADMIN_AUTH_CODE not set in environment');
        return res.status(500).json({ message: 'Server configuration error' });
    }

    if (code === betaCode || (adminCode && code === adminCode)) {
        const type = (adminCode && code === adminCode) ? 'admin' : 'beta';

        // Use the same auth cookie for both to retain core application flow logic
        res.setHeader('Set-Cookie', `beta_authorized=true; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax`);

        return res.json({ success: true, type });
    }

    return res.status(401).json({ message: 'Invalid access code' });
});

// POST /api/public/beta-waitlist
router.post('/beta-waitlist', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ message: 'Valid email is required' });
        }

        const { db } = await import('../lib/db.js');
        const { betaEnquiries } = await import('../db/schema.js');

        await db.insert(betaEnquiries).values({
            id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
            email: email.toLowerCase().trim()
        }).onConflictDoNothing();

        res.json({ success: true });
    } catch (error: any) {
        console.error('Beta Waitlist Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Test endpoint to verify router is working
router.get('/test', (req, res) => {
    res.json({ message: 'Public API is working!' });
});

// DEBUG: List recent jobs (to verify DB access)
router.get('/debug', async (req, res) => {
    try {
        const { db } = await import('../lib/db.js');
        const { auditJobs } = await import('../db/schema.js');
        const { desc } = await import('drizzle-orm');

        const recentJobs = await db.query.auditJobs.findMany({
            orderBy: [desc(auditJobs.created_at)],
            limit: 5
        });
        res.json({ data: recentJobs });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// DEBUG: List uploads (to verify filesystem)
router.get('/debug/uploads', async (req, res) => {
    try {
        const fs = await import('fs');
        const path = await import('path');
        const uploadsDir = path.join(process.cwd(), 'uploads');

        if (!fs.existsSync(uploadsDir)) {
            return res.json({ message: 'Uploads directory does not exist' });
        }

        const items = fs.readdirSync(uploadsDir, { recursive: true });
        res.json({ uploadsDir, items });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/public/jobs/:jobId/logs
// Dedicated endpoint for lightweight log polling
router.get('/jobs/:jobId/logs', async (req, res) => {
    try {
        const { jobId } = req.params;
        const { db } = await import('../lib/db.js');
        const { auditJobLogs } = await import('../db/schema.js');
        const { eq, desc } = await import('drizzle-orm');

        const logs = await db.select({
            id: auditJobLogs.id,
            message: auditJobLogs.message,
            timestamp: auditJobLogs.created_at
        })
            .from(auditJobLogs)
            .where(eq(auditJobLogs.job_id, jobId))
            .orderBy(desc(auditJobLogs.created_at), desc(auditJobLogs.id));

        res.json({ logs });
    } catch (error: any) {
        console.error('Public Log Fetch Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /api/public/jobs/:jobId
// Public endpoint to fetch completed job report data for sharing
router.get('/jobs/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;

        // Fetch Job
        const job = await JobService.getJob(jobId);
        if (!job) {
            console.error(`[Public API] Job not found: ${jobId}`);
            return res.status(404).json({ message: 'Job not found' });
        }

        // Return basic status and report_data (including logs) even during processing
        res.json({
            id: job.id,
            status: job.status,
            report_data: job.report_data,
            errorMessage: job.error_message,
            inputs: (job.input_data as any)?.inputs || job.input_data,
            customName: (job.input_data as any)?.customName,
            customFavicon: (job.input_data as any)?.customFavicon,
            created_at: job.created_at,
            updated_at: job.updated_at
        });

        return;

    } catch (error: any) {
        console.error('Public Job Fetch Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
