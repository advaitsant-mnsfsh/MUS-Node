import { Router } from 'express';
import { JobService } from '../services/jobService.js';

const router = Router();

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

// GET /api/public/jobs/:jobId
// Public endpoint to fetch completed job report data for sharing
router.get('/jobs/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;
        console.log(`[Public API] Fetching job: ${jobId}`);

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
