import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, Type } from '@google/genai';
import crypto from 'crypto';
import { performScrape, performPerformanceCheck } from '../services/scraperService';
import { performAnalysis, callApi } from '../services/aiService';
import { retryWithBackoff } from '../utils/retry';
import {
    getSchemas,
    getCompetitorSystemInstruction
} from '../prompts';
import { JobService } from '../services/jobService';
import { JobProcessor } from '../services/jobProcessor';

export const handleAuditRequest = async (req: Request, res: Response) => {
    // 1. Initialize DB & Secrets
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        return res.status(500).json({ message: `Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY` });
    }

    const { mode } = req.body;
    const actualMode = mode || req.query.mode;

    // Standard headers for SSE if needed
    if (actualMode === 'stream-job' || (typeof actualMode === 'string' && actualMode.startsWith('analyze-'))) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { data: secretData, error: secretError } = await supabaseAdmin
        .from('app_secrets')
        .select('key_name, key_value')
        .in('key_name', ['API_KEY', 'PUPPETEER_BROWSER_ENDPOINT', 'PAGESPEED_API_KEY', 'API_KEY_BUP']);

    if (secretError || !secretData) {
        console.error("Failed to fetch secrets from Supabase:", secretError);
        return res.status(500).json({ message: "Failed to retrieve app credentials." });
    }

    const secrets = secretData.reduce((acc: any, item: any) => {
        acc[item.key_name] = item.key_value;
        return acc;
    }, {});

    let apiKey = secrets['API_KEY'];
    if (!apiKey) {
        apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    }
    const apiKeyBup = secrets['API_KEY_BUP'] || process.env.API_KEY_BUP;

    if (!apiKey) {
        return res.status(500).json({ message: "Missing AI API Key." });
    }

    // Construct Key Array: [Main, Backup]
    const apiKeys = [apiKey];
    if (apiKeyBup) {
        apiKeys.push(apiKeyBup);
    }
    const primaryKey = apiKeys[0];
    const browserEndpoint = secrets['PUPPETEER_BROWSER_ENDPOINT'];

    switch (actualMode) {
        case 'start-audit': {
            try {
                const { inputs, auditMode } = req.body;
                console.log(`[Job] Starting new audit job. Mode: ${auditMode}`);

                const job = await JobService.createJob({
                    inputData: { inputs, auditMode },
                    apiKeyId: undefined // Optional
                });

                // Fire and forget
                JobProcessor.processJob(job.id).catch(err => console.error(`Background Job Error ${job.id}:`, err));

                res.json({ success: true, jobId: job.id });
            } catch (error: any) {
                console.error("Failed to start audit job:", error);
                res.status(500).json({ message: error.message });
            }
            break;
        }

        case 'stream-job': {
            const jobId = (req.query.jobId as string) || req.body.jobId;
            console.log(`[Stream] Client connected for Job ${jobId}`);

            if (!jobId) {
                res.write(JSON.stringify({ type: 'error', message: 'Missing Job ID' }) + '\n');
                res.end();
                return;
            }

            let lastLogCount = 0;
            // Immediate check
            const checkStatus = async () => {
                const job = await JobService.getJob(jobId);
                if (!job) {
                    res.write(JSON.stringify({ type: 'error', message: 'Job not found' }) + '\n');
                    res.end();
                    return false; // Stop checking
                }

                if (job.status === 'failed') {
                    res.write(JSON.stringify({ type: 'error', message: job.error_message || 'Audit failed' }) + '\n');
                    res.end();
                    return false;
                }

                // Send Logs/Status Update
                const report = job.report_data || {};
                const logs = report.logs || [];

                // Send new logs as status updates
                if (logs.length > lastLogCount) {
                    const newLogs = logs.slice(lastLogCount);
                    for (const log of newLogs) {
                        res.write(JSON.stringify({ type: 'status', message: log.message }) + '\n');
                    }
                    lastLogCount = logs.length;
                }

                // Send partial data (Simplified: Send 'data' chunks for expert results if present.)
                const potentialKeys = ['UX Audit expert', 'Product Audit expert', 'Visual Audit expert', 'Strategy Audit expert', 'Accessibility Audit expert', 'Competitor Analysis expert', 'Top5ContextualIssues', 'screenshots'];

                // We use a simple closure set to track what we sent *in this connection*
                // Ideally this should use the client's last-event-id or similar, but for now we assume fresh connection = resend all relevant data?
                // Actually, if we resend everything, the frontend might duplicate.
                // But since 'report' is key-value, overwriting is fine. 
                // Status messages are logs, duplicates might be annoying.
                // We handle Logs via index. Data via keys.
            };

            const sentKeys = new Set<string>();

            const poll = async () => {
                const job = await JobService.getJob(jobId);
                if (!job) return true;

                const report = job.report_data || {};
                const logs = report.logs || [];

                // 1. Logs -> Status
                if (logs.length > lastLogCount) {
                    const newLogs = logs.slice(lastLogCount);
                    for (const log of newLogs) {
                        res.write(JSON.stringify({ type: 'status', message: log.message }) + '\n');
                    }
                    lastLogCount = logs.length;
                }

                // 2. Data Chunks
                const potentialKeys = ['UX Audit expert', 'Product Audit expert', 'Visual Audit expert', 'Strategy Audit expert', 'Accessibility Audit expert', 'Competitor Analysis expert', 'Top5ContextualIssues', 'screenshots'];

                for (const key of potentialKeys) {
                    if (report[key] && !sentKeys.has(key)) {
                        res.write(JSON.stringify({ type: 'data', payload: { key, data: report[key] } }) + '\n');
                        sentKeys.add(key);
                    }
                }

                // 3. Completion
                if (job.status === 'completed') {
                    res.write(JSON.stringify({ type: 'complete', payload: { auditId: job.id, resultUrl: job.report_data?.resultUrl || job.result_url } }) + '\n');
                    res.end();
                    return false; // Stop
                }

                if (job.status === 'failed') {
                    res.write(JSON.stringify({ type: 'error', message: job.error_message || 'Failed' }) + '\n');
                    res.end();
                    return false;
                }
                return true; // Continue
            };

            // Run immediately
            const proceed = await poll();
            if (!proceed) return;

            const interval = setInterval(async () => {
                try {
                    const shouldContinue = await poll();
                    if (!shouldContinue) clearInterval(interval);
                } catch (e) {
                    console.error("Poll Error:", e);
                }
            }, 2000);

            req.on('close', () => {
                clearInterval(interval);
                console.log(`[Stream] Client disconnected for Job ${jobId}`);
            });
            break;
        }

        case 'scrape-single-page': {
            try {
                const { url, isMobile, isFirstPage } = req.body;
                const result = await performScrape(url, isMobile, isFirstPage, browserEndpoint);
                res.json(result);
            } catch (error: any) {
                res.status(500).json({ message: error.message });
            }
            break;
        }

        case 'scrape-performance': {
            const { url } = req.body;
            const result = await performPerformanceCheck(url, primaryKey, secrets);
            res.json(result);
            break;
        }

        case 'analyze-ux':
        case 'analyze-product':
        case 'analyze-visual':
        case 'analyze-strategy':
        case 'analyze-accessibility': {
            try {
                // Streaming Wrapper
                const write = (chunk: any) => {
                    res.write(JSON.stringify(chunk) + '\n');
                };
                const expertName = mode.replace('analyze-', ' ').toUpperCase();

                console.log(`[STANDARD] Starting ${expertName} analysis...`);
                write({ type: 'status', message: `Running ${expertName} analysis...` });

                const result = await performAnalysis(apiKeys, mode, req.body);

                console.log(`[STANDARD] ✓ ${expertName} analysis complete.`);
                write({ type: 'data', payload: { key: result.key, data: result.data } });
                write({ type: 'status', message: `✓ ${result.key} analysis complete.` });

            } catch (error: any) {
                console.error(`Analysis failed for ${mode}:`, error);
                const errorMessage = error.stack ? `${error.message}\n${error.stack}` : error.message;
                res.write(JSON.stringify({ type: 'error', message: `Error in ${mode}: ${errorMessage}` }) + '\n');
            }
            res.end();
            break;
        }

        case 'analyze-competitor': {
            console.log("----------------------------------------");
            console.log("[COMPETITOR] Received 'analyze-competitor' request.");
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');

            // Initial Status
            res.write(JSON.stringify({ type: 'status', message: "Running Competitor Analysis expert..." }) + '\n');

            try {
                const schemas = getSchemas();
                const {
                    primaryUrl, primaryScreenshotsBase64, primaryLiveText,
                    competitorUrl, competitorScreenshotsBase64, competitorLiveText,
                    screenshotMimeType
                } = req.body;

                const systemInstruction = getCompetitorSystemInstruction();

                // Truncate Inputs for safety
                const MAX_COMP_TEXT = 15000;
                const fullContent = `
### PRIMARY WEBSITE ###
- URL: ${primaryUrl}
- Content: ${primaryLiveText ? primaryLiveText.substring(0, MAX_COMP_TEXT) : ''}... (truncated)

### COMPETITOR WEBSITE ###
- URL: ${competitorUrl}
- Content: ${competitorLiveText ? competitorLiveText.substring(0, MAX_COMP_TEXT) : ''}... (truncated)
`;

                const allImages = [...(primaryScreenshotsBase64 || []), ...(competitorScreenshotsBase64 || [])];
                const limitedImages = allImages.slice(0, 10); // Safety cap

                // KEY SPLIT STRATEGY
                const mainKey = apiKeys[0];
                const backupKey = apiKeys.length > 1 ? apiKeys[1] : apiKeys[0];
                const keyStatus = apiKeys.length > 1 ? 'Dual Keys Active (Split Strategy)' : 'Single Key Active (Shared Strategy)';

                console.log(`[COMPETITOR] Key Config: ${keyStatus}`);
                console.log(`[COMPETITOR] Inputs prepared. Images: ${limitedImages.length}. Text Length: ${fullContent.length} chars.`);
                console.log("[COMPETITOR] Starting parallel analysis...");

                const startStream1 = Date.now();
                const p1 = callApi([mainKey], systemInstruction + "\n\nFOCUS: Focus ONLY on Strategy, Accessibility, Strengths, Opportunities, and Executive Summary.", fullContent, schemas.competitorAuditSchemaStrategic, limitedImages, screenshotMimeType)
                    .then(res => {
                        console.log(`[COMPETITOR] ✓ Strategy Stream Completed in ${(Date.now() - startStream1) / 1000}s`);
                        return res;
                    });

                const startStream2 = Date.now();
                const p2 = callApi([backupKey], systemInstruction + "\n\nFOCUS: Focus ONLY on UX, Product, and Visual comparisons.", fullContent, schemas.competitorAuditSchemaTactical, limitedImages, screenshotMimeType)
                    .then(res => {
                        console.log(`[COMPETITOR] ✓ Tactical Stream Completed in ${(Date.now() - startStream2) / 1000}s`);
                        return res;
                    });

                const [strategicData, tacticalData] = await Promise.all([p1, p2]);

                const finalResult = {
                    ...strategicData,
                    ...tacticalData,
                    ExecutiveSummary: strategicData.ExecutiveSummary // Prioritize Strategic Summary logic
                };

                console.log("[COMPETITOR] Merging results...");
                res.write(JSON.stringify({
                    type: 'data',
                    payload: { key: 'Competitor Analysis expert', data: finalResult }
                }) + '\n');

                console.log("[COMPETITOR] Response sent. Done.");
                console.log("----------------------------------------");
                res.write(JSON.stringify({ type: 'status', message: "✓ Competitor Analysis complete." }) + '\n');

            } catch (error: any) {
                console.error("Competitor Analysis Failed:", error);
                const errorMessage = error.message || "Unknown Error";
                res.write(JSON.stringify({ type: 'error', message: errorMessage }) + '\n');
            }
            res.end();
            break;
        }

        case 'contextual-rank': {
            try {
                console.log('[STANDARD] Starting Contextual Impact Analysis...');
                const { report } = req.body;
                const allIssues = [
                    ...report['UX Audit expert']?.Top5CriticalUXIssues?.map((i: any) => ({ ...i, source: 'UX Audit' })) || [],
                    ...report['Product Audit expert']?.Top5CriticalProductIssues?.map((i: any) => ({ ...i, source: 'Product Audit' })) || [],
                    ...report['Visual Audit expert']?.Top5CriticalVisualIssues?.map((i: any) => ({ ...i, source: 'Visual Design' })) || [],
                    ...report['Accessibility Audit expert']?.Top5CriticalAccessibilityIssues?.map((i: any) => ({ ...i, source: 'Accessibility Audit' })) || []
                ];

                if (!report['Strategy Audit expert'] || allIssues.length === 0) {
                    const impactOrder: any = { High: 3, Medium: 2, Low: 1 };
                    allIssues.sort((a: any, b: any) => impactOrder[b.ImpactLevel] - impactOrder[a.ImpactLevel] || a.Score - b.Score);
                    return res.json(allIssues.slice(0, 5));
                }

                const strategyAudit = report['Strategy Audit expert'];
                const strategyContext = `
- Website Purpose: ${strategyAudit.PurposeAnalysis?.PrimaryPurpose?.join(', ')}
- Key Objectives: ${strategyAudit.PurposeAnalysis?.KeyObjectives}
- Target Audience: ${strategyAudit.TargetAudience?.Primary?.join(', ')} (${strategyAudit.TargetAudience?.DemographicsPsychographics})
- Website Type: ${strategyAudit.TargetAudience?.WebsiteType}`;

                const systemInstruction = `You are a Chief Product Strategist. Your task is to analyze a list of critical issues identified for a website, considering the site's strategic context. Re-rank these issues based on which ones have the most significant impact on the website's primary purpose and ability to serve its target audience.`;

                const contents = `
### Strategic Context ###
${strategyContext}
### Your Task ###
1. Review the strategic context and each issue in the provided JSON list.
2. Select the TOP 5 issues that represent the most critical barriers to the website's success.
3. Return ONLY these 5 issues, sorted from most to least critical.
4. You MUST return the issues in the exact same JSON structure as they were provided, including all original fields.
5. EXCLUSION CRITERIA: Do NOT select any issues primarily related to "Screen Reader Compatibility", "Missing Alt Text", or "Missing Form Labels".
### Critical Issues List (JSON) ###
${JSON.stringify(allIssues, null, 2)}`;

                const schemas = getSchemas();

                // Use callApi for consistency (and robustness)
                const rankResult = await callApi(apiKeys, systemInstruction, contents, {
                    type: Type.ARRAY,
                    items: schemas.criticalIssueSchema
                });

                res.json(rankResult);

            } catch (error: any) {
                console.error("Contextual rank failed:", error);
                res.status(500).json({ message: `Contextual ranking failed: ${error.message}` });
            }
            break;
        }

        case 'finalize': {
            try {
                console.log('[STANDARD] Finalizing Audit (Uploads & DB Save)...');
                const { report, screenshots, url } = req.body;
                const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
                const auditUUID = crypto.randomUUID();

                const uploadedScreenshots = await Promise.all(screenshots.map(async (screenshot: any, index: number) => {
                    if (!screenshot.data) return { ...screenshot, data: undefined };

                    const filePath = `public/${auditUUID}/${index}-${screenshot.isMobile ? 'mobile' : 'desktop'}.jpeg`;
                    const screenshotBuffer = Buffer.from(screenshot.data, 'base64');

                    const { error: uploadError } = await supabaseAdmin.storage.from('screenshots').upload(filePath, screenshotBuffer, {
                        contentType: 'image/jpeg',
                        upsert: true
                    });

                    if (uploadError) throw new Error(`Supabase upload failed for screenshot ${index}: ${uploadError.message}`);

                    const { data: { publicUrl } } = supabaseAdmin.storage.from('screenshots').getPublicUrl(filePath);
                    return {
                        path: screenshot.path,
                        isMobile: screenshot.isMobile,
                        publicUrl
                    };
                }));

                const { data: auditData, error: auditError } = await supabaseAdmin
                    .from('audits')
                    .insert({
                        url,
                        report_data: report,
                        screenshot_url: uploadedScreenshots.find((s: any) => !s.isMobile)?.publicUrl || uploadedScreenshots[0]?.publicUrl,
                        status: 'completed'
                    })
                    .select('id')
                    .single();

                if (auditError) throw new Error(`DB Save failed: ${auditError.message}`);

                // Shared Storage (Ported Fix)
                const BUCKET = 'shared-audits';
                const storageFileName = `${auditData.id}.json`;
                // Ensure bucket
                const { data: buckets } = await supabaseAdmin.storage.listBuckets();
                if (!buckets?.find(b => b.name === BUCKET)) {
                    await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
                }
                await supabaseAdmin.storage.from(BUCKET).upload(storageFileName, JSON.stringify({ url, ...report, screenshots }), {
                    contentType: 'application/json',
                    upsert: true
                });

                console.log('[STANDARD] ✓ Audit Finalized.');
                res.json({ success: true, auditId: auditData.id });

            } catch (error: any) {
                console.error("Finalize failed:", error);
                res.status(500).json({ message: error.message });
            }
            break;
        }

        default:
            res.status(400).json({ message: "Invalid mode." });
    }
};
