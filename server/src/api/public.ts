import { Router } from 'express';
import { JobService } from '../services/jobService';

const router = Router();

// Test endpoint to verify router is working
router.get('/test', (req, res) => {
    res.json({ message: 'Public API is working!' });
});

// GET /api/public/jobs/:jobId
// Public endpoint to fetch completed job report data for sharing
router.get('/jobs/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;

        // Fetch Job
        const job = await JobService.getJob(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Only allow fetching COMPLETED jobs (security: don't expose pending/failed)
        if (job.status !== 'completed') {
            return res.status(403).json({
                message: 'Job not ready yet',
                status: job.status
            });
        }

        // Return the report data (no authentication required for sharing)
        res.json({
            id: job.id,
            status: job.status,
            report_data: job.report_data,
            created_at: job.created_at,
            updated_at: job.updated_at
        });

    } catch (error: any) {
        console.error('Public Job Fetch Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
