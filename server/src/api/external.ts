import express from 'express';
import { ApiKeyService } from '../services/apiKeyService';
import { JobService } from '../services/jobService';
import { JobProcessor } from '../services/jobProcessor';

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

        const { inputs } = req.body;
        if (!inputs || !Array.isArray(inputs) || inputs.length === 0) {
            return res.status(400).json({ message: 'Invalid input: "inputs" array is required.' });
        }

        // 2. Create Job
        // We store the raw inputs. The main app will pick this up.
        const job = await JobService.createJob({
            apiKeyId: keyDetails.id,
            inputData: { inputs }
        });

        // 3. Construct Redirect URL
        // This assumes the frontend is hosted at the Referer or specific env var.
        // For now, we'll use a standard base URL variable.
        const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173'; // Default to local dev
        const redirectUrl = `${frontendBaseUrl}/report/${job.id}`;

        // 4. Return immediately (Fire & Forget processing)
        res.json({
            jobId: job.id,
            status: 'pending',
            redirectUrl: redirectUrl
        });

        // Start background processing
        // Use setImmediate to ensure it runs after response is sent
        setImmediate(() => {
            JobProcessor.processJob(job.id);
        });

    } catch (error: any) {
        console.error('External Audit API Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
