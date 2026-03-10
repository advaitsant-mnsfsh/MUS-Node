import express from 'express';
import { db } from '../lib/db.js';
import { auditJobs, leads } from '../db/schema.js';
import { validateApiKey, optionalUserAuth, AuthenticatedRequest } from '../middleware/apiAuth.js';
import { QueueService } from '../services/queueService.js';
import { WorkerService } from '../services/workerService.js';
import { eq, and, isNull, sql, asc, desc, inArray, or } from 'drizzle-orm';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// POST /api/v1/feedback
router.post('/feedback', optionalUserAuth, async (req: express.Request, res: express.Response) => {
    try {
        const { teamNumber, jobId, websiteUrl, errorDetails, email } = req.body;
        const authReq = req as AuthenticatedRequest;
        const userEmail = email || authReq.user?.email || 'anonymous';

        const feedback = {
            timestamp: new Date().toISOString(),
            userEmail,
            teamNumber,
            jobId,
            websiteUrl,
            errorDetails
        };

        const feedbackDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(feedbackDir)) {
            fs.mkdirSync(feedbackDir, { recursive: true });
        }

        const feedbackFile = path.join(feedbackDir, 'feedback.json');
        let currentFeedback = [];
        if (fs.existsSync(feedbackFile)) {
            try {
                const content = fs.readFileSync(feedbackFile, 'utf-8');
                currentFeedback = JSON.parse(content);
            } catch (e) {
                currentFeedback = [];
            }
        }
        currentFeedback.push(feedback);
        fs.writeFileSync(feedbackFile, JSON.stringify(currentFeedback, null, 2));

        res.json({ success: true, message: 'Feedback received' });
    } catch (error) {
        console.error('[Feedback] Error saving feedback:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/v1/feedback
router.get('/feedback', async (req: express.Request, res: express.Response) => {
    try {
        const password = req.headers['x-admin-password'];
        if (password !== '0000') {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const feedbackFile = path.join(process.cwd(), 'data', 'feedback.json');
        if (!fs.existsSync(feedbackFile)) {
            return res.json([]);
        }
        const content = fs.readFileSync(feedbackFile, 'utf-8');
        const feedback = JSON.parse(content);
        res.json(feedback.reverse()); // Show newest first
    } catch (error) {
        console.error('[Feedback] Error fetching feedback:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/v1/audit
router.post('/audit', optionalUserAuth, async (req: express.Request, res: express.Response) => {
    try {
        const { inputs, whiteLabelLogo } = req.body;
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
        const payload = {
            inputs: auditInputs,
            auditMode: req.body.auditMode || 'standard',
            whiteLabelLogo: whiteLabelLogo || null
        };

        // 1. Create permanent Job Record
        const [job] = await db.insert(auditJobs).values({
            id: jobId,
            api_key_id: authReq.apiKey?.id,
            status: 'pending',
            input_data: payload,
            audit_type: payload.auditMode === 'competitor' ? 'competitor' : 'standard',
            user_id: authReq.user?.id || null
        }).returning();

        if (!job) {
            throw new Error("Failed to create job record");
        }

        // 2. Add to Queue
        const { queueId, position, queueType } = await QueueService.addJobToQueue(jobId, payload, authReq.user?.id);

        console.log(`[API] 🚀 New Audit Queued: ${jobId} (Position: ${position}, Mode: ${req.body.auditMode || 'standard'})`);

        // 3. Proactively trigger worker on THIS instance to claim it immediately
        // This ensures local testing uses local code and prints logs locally.
        WorkerService.triggerJob(queueId, jobId);

        res.status(202).json({
            success: true,
            jobId: job.id,
            queuePosition: position,
            queueType: position <= 4 ? 'realtime' : 'email',
            message: position <= 4
                ? `Audit started. You are in position ${position}.`
                : `High volume detected. You are in position ${position}. We will email you results.`
        });

    } catch (error: any) {
        console.error("API Error:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/v1/audit/claim
 * Allows an authenticated user to claim an audit that was previously run as a guest.
 */
router.post('/audit/claim', optionalUserAuth, async (req: express.Request, res: express.Response) => {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    const { auditId } = req.body;

    console.log(`[Audit-Claim] Request for Audit ID: ${auditId}, Authenticated User: ${user?.email || 'NONE'}`);

    if (!user) {
        return res.status(401).json({ success: false, error: 'Unauthorized: No active session found.' });
    }

    if (!auditId) {
        return res.status(400).json({ success: false, error: 'Missing auditId' });
    }

    try {
        // Ensure we only claim audits that don't already have an owner
        const [updated] = await db.update(auditJobs)
            .set({ user_id: user.id })
            .where(and(
                eq(auditJobs.id, auditId),
                isNull(auditJobs.user_id)
            ))
            .returning({ id: auditJobs.id });

        if (!updated) {
            console.warn(`[Audit-Claim] ⚠️ Claim failed for ${auditId}. Either not found or already has an owner.`);
            return res.status(404).json({ success: false, error: 'Audit not found or already claimed.' });
        }

        console.log(`[Audit-Claim] ✅ Audit ${auditId} successfully transferred to user ${user.email}`);
        return res.json({ success: true });

    } catch (e: any) {
        console.error(`[Audit-Claim] 💥 Critical error:`, e);
        return res.status(500).json({ success: false, error: e.message || 'Internal Server Error' });
    }
});

// GET /api/v1/audit (Streaming Support)
router.get('/audit', async (req: express.Request, res: express.Response) => {
    const { mode, jobId } = req.query;

    if (mode === 'stream-job' && typeof jobId === 'string') {
        // Setup Streaming Response with CORS
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
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
        const maxTime = 900000; // 15 minutes timeout
        const startTime = Date.now();

        const checkStatus = async () => {
            if (Date.now() - startTime > maxTime) {
                sendChunk({ type: 'error', message: 'Timeout waiting for job completion' });
                res.end();
                return;
            }

            try {
                // CRITICAL OPTIMIZATION: Don't fetch report_data on every poll!
                // Only fetch it when job is completed to save massive bandwidth
                const jobStatus = await db.select({
                    id: auditJobs.id,
                    status: auditJobs.status,
                    error_message: auditJobs.error_message,
                    result_url: auditJobs.result_url
                })
                    .from(auditJobs)
                    .where(eq(auditJobs.id, jobId))
                    .limit(1)
                    .then(rows => rows[0]);

                if (!jobStatus) {
                    sendChunk({ type: 'error', message: 'Job not found' });
                    res.end();
                    return;
                }

                if (jobStatus.status === 'failed') {
                    sendChunk({ type: 'error', message: jobStatus.error_message || 'Audit failed' });
                    res.end();
                    return;
                }

                if (jobStatus.status === 'completed') {
                    console.log(`[Stream] Job ${jobId} completed. Sending final signal.`);
                    sendChunk({
                        type: 'complete',
                        payload: {
                            auditId: jobStatus.result_url?.split('/').pop() || jobStatus.id,
                            resultUrl: jobStatus.result_url
                        }
                    });
                    res.end();
                    return;
                }

                // Status Update (for pending/processing)
                if (jobStatus.status !== lastStatus) {
                    sendChunk({ type: 'status', message: `Job Status: ${jobStatus.status}` });
                    lastStatus = jobStatus.status;
                }

                // Fine-grained Log Updates from auditjobs_logs table
                try {
                    const { auditJobLogs } = await import('../db/schema.js');
                    const { desc } = await import('drizzle-orm');

                    const logs = await db.select({
                        id: auditJobLogs.id,
                        message: auditJobLogs.message,
                        timestamp: auditJobLogs.created_at
                    })
                        .from(auditJobLogs)
                        .where(eq(auditJobLogs.job_id, jobId))
                        .orderBy(desc(auditJobLogs.created_at))
                        .limit(1);

                    if (logs.length > 0) {
                        const latestLog = logs[0];
                        if (latestLog.message && latestLog.message !== (req as any)._lastLogMsg) {
                            sendChunk({ type: 'status', message: latestLog.message });
                            (req as any)._lastLogMsg = latestLog.message;
                        }
                    }
                } catch (logErr) {
                    console.warn(`[Stream] Could not fetch logs for job ${jobId}:`, logErr);
                }

                // Check if server is shutting down (Rolling deploy)
                // @ignore
                const { getIsShuttingDown } = await import('../index.js');
                if (getIsShuttingDown()) {
                    console.log(`[Stream] Server is shutting down. Ending stream for ${jobId} early.`);
                    sendChunk({ type: 'status', message: 'Deployment in progress. Please refresh in a moment.' });
                    res.end();
                    return;
                }

                // Poll again (increased from 2s to 3s to reduce DB load)
                setTimeout(checkStatus, 3000);

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

// GET /api/v1/audit/active
router.get('/audit/active', optionalUserAuth, async (req: express.Request, res: express.Response) => {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;

    if (!user) {
        return res.json({ success: true, activeJob: null });
    }

    try {
        const { desc, or } = await import('drizzle-orm');
        const activeJob = await db.query.auditJobs.findFirst({
            where: and(
                eq(auditJobs.user_id, user.id),
                or(
                    eq(auditJobs.status, 'pending'),
                    eq(auditJobs.status, 'processing')
                )
            ),
            orderBy: [desc(auditJobs.created_at)]
        });

        res.json({ success: true, activeJob });
    } catch (e: any) {
        console.error(`[ActiveJob] Error:`, e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// GET /api/v1/audit/:jobId (Polling Support)
router.get('/audit/:jobId', validateApiKey, async (req: express.Request, res: express.Response) => {
    try {
        const { jobId } = req.params;
        console.log(`[Public API] 📂 FETCHING REPORT FOR VIEW: ${jobId}`);
        const authReq = req as AuthenticatedRequest;

        const job = await db.query.auditJobs.findFirst({
            where: eq(auditJobs.id, jobId)
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        // --- SECURITY CHECK ---
        // If the audit is owned by a user, only that user (or a valid API key) can fetch it via this route.
        // Shared views should use the /api/public/jobs/:id route.
        if (job.user_id && !authReq.apiKey) {
            if (!authReq.user || authReq.user.id !== job.user_id) {
                console.warn(`[Security] 🚫 Unauthorized access attempt to audit ${jobId} by user ${authReq.user?.email || 'GUEST'}`);
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'You do not have permission to view this report. It belongs to another user.'
                });
            }
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

// POST /api/v1/audit/:jobId/opt-in
router.post('/audit/:jobId/opt-in', optionalUserAuth, async (req: express.Request, res: express.Response) => {
    try {
        const { jobId } = req.params;
        const { email } = req.body;
        const authReq = req as AuthenticatedRequest;

        const [job] = await db.select()
            .from(auditJobs)
            .where(eq(auditJobs.id, jobId))
            .limit(1);

        if (!job) return res.status(404).json({ error: 'Job not found' });

        const updateData: any = {
            email_opt_in: true,
            updated_at: new Date()
        };

        // If logged in, link to user and use their email
        if (authReq.user) {
            updateData.user_id = authReq.user.id;
            updateData.opt_in_email = authReq.user.email;
        } else if (email) {
            // If guest provided email
            updateData.opt_in_email = email;
        }

        await db.update(auditJobs)
            .set(updateData)
            .where(eq(auditJobs.id, jobId));

        res.json({ success: true, message: 'Opt-in successful' });
    } catch (e: any) {
        console.error("[Opt-in] Error:", e);
        res.status(500).json({ error: e.message });
    }
});

// GET /api/v1/admin/audits (Protected Terminal-style Dashboard API)
router.get('/admin/audits', async (req: express.Request, res: express.Response) => {
    const adminPass = req.headers['x-admin-password'] || req.query.pass;

    // Simple hardcoded security for local/dev
    if (adminPass !== '0000') {
        return res.status(401).json({ error: 'Unauthorized admin access' });
    }

    try {
        const { desc, ilike, or } = await import('drizzle-orm');
        const { user: userTable } = await import('../db/schema.js');

        const { q, searchType, status } = req.query;

        // Build composite conditions
        let conditions: any[] = [];

        if (status) {
            conditions.push(eq(auditJobs.status, status as string));
        }

        if (q) {
            const searchTerm = `%${q}%`;
            if (searchType === 'id') {
                conditions.push(ilike(auditJobs.id, searchTerm));
            } else if (searchType === 'user') {
                conditions.push(or(
                    ilike(userTable.name, searchTerm),
                    ilike(userTable.email, searchTerm),
                    ilike(auditJobs.opt_in_email, searchTerm)
                ));
            } else {
                // Default: search everywhere
                conditions.push(or(
                    ilike(auditJobs.id, searchTerm),
                    ilike(userTable.name, searchTerm),
                    ilike(userTable.email, searchTerm),
                    ilike(auditJobs.opt_in_email, searchTerm)
                ));
            }
        }

        const { auditQueue } = await import('../db/schema.js');

        const query = db.select({
            id: auditJobs.id,
            status: auditJobs.status,
            audit_type: auditJobs.audit_type,
            input_data: auditJobs.input_data,
            created_at: auditJobs.created_at,
            email_opt_in: auditJobs.email_opt_in,
            email_opt_in_offered: auditJobs.email_opt_in_offered,
            opt_in_email: auditJobs.opt_in_email,
            thumbnail_url: auditJobs.thumbnail_url,
            user_name: userTable.name,
            user_email: userTable.email,
            browser_key: auditQueue.browser_key,
            priority: auditQueue.priority,
            queue_position: sql<number>`(
                SELECT count(*) + 1
                FROM ${auditQueue} aq2
                WHERE aq2.status = 'waiting'
                AND (
                    aq2.priority > ${auditQueue.priority}
                    OR (aq2.priority = ${auditQueue.priority} AND aq2.created_at < ${auditQueue.created_at})
                )
            )`.as('queue_position'),
        })
            .from(auditJobs)
            .leftJoin(userTable, eq(auditJobs.user_id, userTable.id))
            .leftJoin(auditQueue, eq(auditJobs.id, auditQueue.job_id));

        if (conditions.length > 0) {
            query.where(and(...conditions));
        }

        const recentJobs = await query
            .orderBy(desc(auditJobs.created_at))
            .limit(50); // Lowered from 100 to 50 for stability

        if (recentJobs.length === 0) {
            return res.json({ success: true, audits: [] });
        }

        // Fetch logs in ONE batch query instead of N+1
        const { auditJobLogs: logsTable } = await import('../db/schema.js');
        const jobIds = recentJobs.map(j => j.id);
        const allLogs = await db.select({
            job_id: logsTable.job_id,
            message: logsTable.message,
            created_at: logsTable.created_at
        })
            .from(logsTable)
            .where(inArray(logsTable.job_id, jobIds))
            .orderBy(asc(logsTable.created_at));

        // Group logs by Job ID
        const logsMap: Record<string, any[]> = {};
        allLogs.forEach(log => {
            if (!logsMap[log.job_id]) logsMap[log.job_id] = [];
            logsMap[log.job_id].push({ message: log.message, created_at: log.created_at });
        });

        // Assemble and Sanitize
        const jobsWithLogs = recentJobs.map(job => {
            const rawInputData = job.input_data as any;

            // CRITICAL: Strip heavy base64 data to prevent payload Bloat
            const sanitizedInputs = rawInputData?.inputs?.map((input: any) => {
                const { fileData, filesData, ...rest } = input;
                return rest;
            }) || [];

            return {
                ...job,
                input_data: { ...rawInputData, inputs: sanitizedInputs },
                logs: logsMap[job.id] || []
            };
        });

        res.json({ success: true, audits: jobsWithLogs });
    } catch (e: any) {
        console.error("[Admin] Audit fetch error:", e);
        res.status(500).json({ error: e.message });
    }
});

// GET /api/v1/admin/audits/:jobId/report
router.get('/admin/audits/:jobId/report', async (req, res) => {
    const adminPass = req.headers['x-admin-password'];
    if (adminPass !== '0000') {
        return res.status(401).json({ error: 'Unauthorized admin access' });
    }

    const { jobId } = req.params;

    try {
        const [job] = await db.select({
            report_data: auditJobs.report_data
        })
            .from(auditJobs)
            .where(eq(auditJobs.id, jobId))
            .limit(1);

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json({ success: true, report_data: job.report_data });
    } catch (e: any) {
        console.error("[Admin] Report fetch error:", e);
        res.status(500).json({ error: e.message });
    }
});

// GET /api/v1/admin/beta-enquiries
router.get('/admin/beta-enquiries', async (req, res) => {
    const adminPass = req.headers['x-admin-password'] || req.query.pass;
    if (adminPass !== '0000') {
        return res.status(401).json({ error: 'Unauthorized admin access' });
    }

    try {
        const { betaEnquiries } = await import('../db/schema.js');
        const { desc } = await import('drizzle-orm');

        const enquiries = await db.select()
            .from(betaEnquiries)
            .orderBy(desc(betaEnquiries.created_at));

        res.json({ success: true, enquiries });
    } catch (e: any) {
        console.error("[Admin] Beta enquiries fetch error:", e);
        res.status(500).json({ error: e.message });
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


// GET /api/v1/admin/queue (Debug Only)
router.get('/admin/queue', async (req, res) => {
    try {
        const { auditQueue, browserUsageLogs } = await import('../db/schema.js');
        const { desc } = await import('drizzle-orm');

        const { QueueService } = await import('../services/queueService.js');
        const queueDepth = await db.select().from(auditQueue).orderBy(desc(auditQueue.created_at)).limit(50);
        const browserLogs = await db.select().from(browserUsageLogs).orderBy(desc(browserUsageLogs.timestamp)).limit(20);

        const waitingCount = await QueueService.getWaitingCount();
        const inProgressCount = await QueueService.getInProgressCount();

        res.json({
            success: true,
            summary: {
                waiting: waitingCount,
                processing: inProgressCount,
                totalRecent: queueDepth.length
            },
            queue: queueDepth,
            browserLogs: browserLogs
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
