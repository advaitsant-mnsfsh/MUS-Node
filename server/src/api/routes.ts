import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { validateApiKey, AuthenticatedRequest } from '../middleware/apiAuth';
import { processAuditJob } from '../auditHeadless';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// POST /api/v1/audit
router.post('/audit', validateApiKey, async (req: express.Request, res: express.Response) => {
    try {
        const { inputs } = req.body;
        const authReq = req as AuthenticatedRequest;

        // Validation
        if (!inputs || !Array.isArray(inputs) || inputs.length === 0) {
            return res.status(400).json({ error: 'Body must contain "inputs" array' });
        }
        if (inputs.length > 5) {
            return res.status(400).json({ error: 'Maximum 5 inputs allowed per request' });
        }

        // Create Job Record
        const { data: jobData, error: jobError } = await supabaseAdmin
            .from('audit_jobs')
            .insert({
                api_key_id: authReq.apiKey?.id,
                status: 'pending',
                input_data: inputs
            })
            .select()
            .single();

        if (jobError) {
            console.error("Job Creation Failed:", jobError);
            return res.status(500).json({ error: 'Database error creating job' });
        }

        // Trigger processing (Fire and Forget)
        // We do NOT await this.
        processAuditJob(jobData.id, inputs).catch(err => console.error(`Background Job Error for ${jobData.id}:`, err));

        // Return immediately
        res.status(202).json({
            message: 'Audit job submitted successfully',
            jobId: jobData.id,
            status: 'pending',
            statusUrl: `/api/v1/audit/${jobData.id}`
        });

    } catch (error: any) {
        console.error("API Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/v1/audit/:jobId
router.get('/audit/:jobId', validateApiKey, async (req: express.Request, res: express.Response) => {
    try {
        const { jobId } = req.params;
        const authReq = req as AuthenticatedRequest;

        const { data, error } = await supabaseAdmin
            .from('audit_jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Job not found' });
        }

        // Security check: Ensure this job belongs to the API Key owner?
        // Current schema links job to api_key_id.
        if (data.api_key_id !== authReq.apiKey?.id) {
            return res.status(403).json({ error: 'Access denied: You do not own this job' });
        }

        res.json({
            jobId: data.id,
            status: data.status,
            resultUrl: data.result_url,
            errorMessage: data.error_message,
            createdAt: data.created_at,
            completedAt: data.status === 'completed' ? data.updated_at : null
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
