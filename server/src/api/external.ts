import express from 'express';
import { ApiKeyService } from '../services/apiKeyService';
import { JobService } from '../services/jobService';
import { auditQueue } from '../lib/queue'; // Import Queue

const router = express.Router();

// POST /api/external/audit
// This is the endpoint the Widget submits to.
router.post('/audit', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const origin = req.headers.origin;

        // 1. Validate API Key
        const keyDetails = await ApiKeyService.validateKey(authHeader || '', origin);
        if (!keyDetails) {
            return res.status(401).json({ message: 'Unauthorized: Invalid API Key or Origin not allowed.' });
        }

        const { inputs, auditMode } = req.body;
        if (!inputs || !Array.isArray(inputs) || inputs.length === 0) {
            return res.status(400).json({ message: 'Invalid input: "inputs" array is required.' });
        }

        // 2. Create Job
        // We store the raw inputs. The main app will pick this up.
        const job = await JobService.createJob({
            apiKeyId: keyDetails.id,
            inputData: { inputs, auditMode: auditMode || 'standard' }
        });

        // 3. Construct Redirect URL
        // Priority: 1. CLIENT_URL env var 2. Request Origin (if trusted) 3. Localhost
        const frontendBaseUrl = process.env.CLIENT_URL || origin || 'http://localhost:5173';
        const redirectUrl = `${frontendBaseUrl}/report/${job.id}`;

        // 4. Enqueue Job
        await auditQueue.add('audit-job', { jobId: job.id });

        // 5. Return Response
        res.json({
            jobId: job.id,
            status: 'pending',
            redirectUrl: redirectUrl,
            message: 'Audit queued successfully.'
        });

    } catch (error: any) {
        console.error('External Audit API Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /api/external/audit/:jobId
// Endpoint for the widget to poll job status
router.get('/audit/:jobId', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const origin = req.headers.origin;
        const { jobId } = req.params;

        // 1. Validate API Key (Security)
        const keyDetails = await ApiKeyService.validateKey(authHeader || '', origin);
        if (!keyDetails) {
            return res.status(401).json({ message: 'Unauthorized: Invalid API Key or Origin not allowed.' });
        }

        // 2. Fetch Job
        const job = await JobService.getJob(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // 3. Security Check: Ensure job belongs to this API Key
        if (job.api_key_id !== keyDetails.id) {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this job.' });
        }

        // Use result_url from database if available, otherwise generate it
        const frontendBaseUrl = process.env.CLIENT_URL || origin || 'http://localhost:5173';
        const resultUrl = job.result_url || `${frontendBaseUrl}/report/${job.id}`;

        res.json({
            jobId: job.id,
            status: job.status,
            resultUrl: resultUrl,
            error: job.error_message
        });

    } catch (error: any) {
        console.error('External Audit Status Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
