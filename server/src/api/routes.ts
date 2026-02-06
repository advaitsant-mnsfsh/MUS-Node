import express from 'express';
import { db } from '../lib/db';
import { auditJobs, leads } from '../db/schema';
import { validateApiKey, optionalUserAuth, AuthenticatedRequest } from '../middleware/apiAuth';
import { JobProcessor } from '../services/jobProcessor';
import { eq, and, isNull } from 'drizzle-orm';
import crypto from 'crypto';

const router = express.Router();

// POST /api/v1/audit
router.post('/audit', optionalUserAuth, async (req: express.Request, res: express.Response) => {
    try {
        const { inputs } = req.body;
        const auditInputs = inputs || req.body.inputs;
        const authReq = req as AuthenticatedRequest;

        // Validation
        if (!auditInputs || !Array.isArray(auditInputs) || auditInputs.length === 0) {
            return res.status(400).json({ error: 'Body must contain "inputs" array' });
        }
        if (auditInputs.length > 5) {
            return res.status(400).json({ error: 'Maximum 5 inputs allowed per request' });
        }

        const jobId = crypto.randomUUID();

        // Create Job Record
        const [job] = await db.insert(auditJobs).values({
            id: jobId,
            api_key_id: authReq.apiKey?.id,
            status: 'pending',
            input_data: {
                inputs: auditInputs,
                auditMode: req.body.auditMode || 'standard'
            },
            user_id: authReq.user?.id || null
        }).returning();

        if (!job) {
            throw new Error("Failed to create job record");
        }

        // Trigger processing (Fire and Forget)
        // JobProcessor.processJob reads everything it needs from the DB record
        JobProcessor.processJob(job.id).catch(err => console.error(`Background Job Error for ${job.id}:`, err));

        // Return immediately
        res.status(202).json({
            message: 'Audit job submitted successfully',
            jobId: job.id,
            status: 'pending',
            statusUrl: `/api/v1/audit/${job.id}`
        });

    } catch (error: any) {
        console.error("API Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/v1/audit (Streaming Support)
router.get('/audit', async (req: express.Request, res: express.Response) => {
    const { mode, jobId } = req.query;

    if (mode === 'stream-job' && typeof jobId === 'string') {
        // Setup Streaming Response
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Ensure the platform / express doesn't timeout the connection
        req.setTimeout(600000); // 10 minutes (overkill but safe)
        res.setTimeout(600000);

        const sendChunk = (data: any) => {
            res.write(JSON.stringify(data) + '\n');
        };

        let lastStatus = '';
        const sentDataKeys = new Set<string>();
        const maxTime = 300000; // 5 minutes timeout
        const startTime = Date.now();

        const checkStatus = async () => {
            if (Date.now() - startTime > maxTime) {
                sendChunk({ type: 'error', message: 'Timeout waiting for job completion' });
                res.end();
                return;
            }

            try {
                const job = await db.query.auditJobs.findFirst({
                    where: eq(auditJobs.id, jobId)
                });

                if (!job) {
                    sendChunk({ type: 'error', message: 'Job not found' });
                    res.end();
                    return;
                }

                if (job.status === 'failed') {
                    sendChunk({ type: 'error', message: job.error_message || 'Audit failed' });
                    res.end();
                    return;
                }

                // DATA UPDATE LOGIC:
                // If there is report_data, send any keys we haven't sent yet
                if (job.report_data && typeof job.report_data === 'object') {
                    const data = job.report_data as Record<string, any>;
                    for (const [key, value] of Object.entries(data)) {
                        // Skip 'logs' which we handle via status/progress
                        if (key === 'logs') continue;

                        if (!sentDataKeys.has(key)) {
                            console.log(`[Stream] Sending new data key: ${key} for job ${jobId}`);
                            sendChunk({
                                type: 'data',
                                payload: { key, data: value }
                            });
                            sentDataKeys.add(key);
                        }
                    }
                }

                if (job.status === 'completed') {
                    console.log(`[Stream] Job ${jobId} completed. Sending final signal.`);
                    sendChunk({
                        type: 'complete',
                        payload: {
                            auditId: job.result_url?.split('/').pop() || job.id,
                            resultUrl: job.result_url
                        }
                    });
                    res.end();
                    return;
                }

                // Status Update
                if (job.status !== lastStatus) {
                    sendChunk({ type: 'status', message: `Job Status: ${job.status}` });
                    lastStatus = job.status;
                }

                // Poll again
                setTimeout(checkStatus, 2000);

            } catch (err: any) {
                console.error("Stream Error:", err);
                sendChunk({ type: 'error', message: 'Internal Server Error' });
                res.end();
            }
        };

        checkStatus();
    } else {
        res.status(400).json({ error: 'Invalid mode or missing jobId' });
    }
});

// GET /api/v1/audit/:jobId (Polling Support)
router.get('/audit/:jobId', validateApiKey, async (req: express.Request, res: express.Response) => {
    try {
        const { jobId } = req.params;
        const authReq = req as AuthenticatedRequest;

        const job = await db.query.auditJobs.findFirst({
            where: eq(auditJobs.id, jobId)
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json({
            jobId: job.id,
            status: job.status,
            resultUrl: job.result_url,
            errorMessage: job.error_message,
            createdAt: job.created_at,
            updatedAt: job.updated_at,
            report_data: job.report_data,
            input_data: job.input_data
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/v1/leads
router.post('/leads', async (req, res) => {
    try {
        const { email, name, organization_type, audit_url } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        console.log(`[Leads] Creating/Updating lead: ${email}`);

        await db.insert(leads).values({
            id: crypto.randomUUID(),
            email,
            name: name || null,
            organization_type: organization_type || null,
            audit_url: audit_url || null,
            is_verified: false
        }).onConflictDoUpdate({
            target: leads.email,
            set: {
                name: name || null,
                organization_type: organization_type || null,
                audit_url: audit_url || null,
                // don't reset is_verified if it was already true
            }
        });

        res.status(201).json({ success: true });
    } catch (error: any) {
        console.error("[Leads] Creation Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// PATCH /api/v1/leads/verify
router.patch('/leads/verify', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        console.log(`[Leads] Verifying lead: ${email}`);

        await db.update(leads)
            .set({ is_verified: true })
            .where(eq(leads.email, email));

        res.json({ success: true });
    } catch (error: any) {
        console.error("[Leads] Verification Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/v1/audit/claim
router.post('/audit/claim', optionalUserAuth, async (req: express.Request, res: express.Response) => {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    const { auditId } = req.body;

    // COMPREHENSIVE DIAGNOSTICS
    const cookies = req.headers.cookie ? req.headers.cookie.split(';').map(c => c.split('=')[0].trim()) : [];
    const authHeader = req.headers.authorization ? 'Present' : 'Missing';
    const origin = req.headers.origin || req.headers.referer || 'Unknown';
    const fullCookieHeader = req.headers.cookie || 'NONE';

    console.log(`[Claim] ========== AUDIT CLAIM REQUEST ==========`);
    console.log(`[Claim] Audit ID: ${auditId}`);
    console.log(`[Claim] Origin: ${origin}`);
    console.log(`[Claim] User Found: ${!!user ? `YES (${user.email})` : 'NO'}`);
    console.log(`[Claim] Cookie Names: [${cookies.join(', ')}]`);
    console.log(`[Claim] Full Cookie Header: ${fullCookieHeader.substring(0, 200)}...`);
    console.log(`[Claim] Auth Header: ${authHeader}`);
    console.log(`[Claim] ==========================================`);

    if (!user) {
        console.error(`[Claim] ❌ REJECTION: No user in request context despite optionalUserAuth middleware`);
        return res.status(401).json({ success: false, error: 'Unauthorized: No active session found.' });
    }

    if (!auditId) return res.status(400).json({ success: false, error: 'Missing auditId' });

    try {
        const [updated] = await db.update(auditJobs)
            .set({ user_id: user.id })
            .where(and(eq(auditJobs.id, auditId), isNull(auditJobs.user_id)))
            .returning({ id: auditJobs.id });

        if (!updated) {
            console.warn(`[Claim] ⚠️ No audit updated for ID ${auditId}. Either not found or already claimed.`);
            return res.status(404).json({ success: false, error: 'Audit not found or already claimed.' });
        }

        console.log(`[Claim] ✅ Successfully assigned audit ${auditId} to user ${user.email}`);
        return res.json({ success: true });
    } catch (e: any) {
        console.error(`[Claim] 💥 Database Error:`, e);
        return res.status(500).json({ success: false, error: e.message });
    }
});

export default router;
