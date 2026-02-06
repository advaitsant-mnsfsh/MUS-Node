import { db } from '../lib/db';
import { SecretService } from './secretService';
import { JobService } from './jobService';
import { Type } from '@google/genai';
import { performScrape, performPerformanceCheck } from './scraperService';
import { performAnalysis, callApi } from './aiService';
import { getSchemas } from '../prompts';

export class JobProcessor {
    static async processJob(jobId: string) {
        console.log(`[JobProcessor] Starting job ${jobId}`);
        try {
            // 1. Update Status
            await JobService.updateJobStatus(jobId, 'processing');

            // 2. Fetch Job & Secrets
            const job = await JobService.getJob(jobId);
            if (!job) throw new Error('Job not found');

            // Use Database Secrets (app_secrets) with Env Var fallback
            const appSecrets = await SecretService.getSecrets();

            const apiKeyRaw = appSecrets['GEMINI_API_KEY'] || appSecrets['API_KEY'] || process.env.GEMINI_API_KEY || process.env.API_KEY;
            const apiKeyBup = appSecrets['GEMINI_API_KEY_BUP'] || appSecrets['API_KEY_BUP'] || process.env.GEMINI_API_KEY_BUP || process.env.API_KEY_BUP;
            const browserEndpoint = appSecrets['PUPPETEER_BROWSER_ENDPOINT'] || process.env.PUPPETEER_BROWSER_ENDPOINT;

            if (!apiKeyRaw) throw new Error('Missing GEMINI_API_KEY in app_secrets or Env Vars');

            // Construct Key Array: [Main, Backup]
            const apiKeys = [apiKeyRaw];
            if (apiKeyBup) apiKeys.push(apiKeyBup);
            const primaryKey = apiKeys[0];

            const inputDataRaw = job.input_data as any;
            const inputs = Array.isArray(inputDataRaw) ? inputDataRaw : (inputDataRaw?.inputs || []);
            const auditMode = Array.isArray(inputDataRaw) ? 'standard' : (inputDataRaw?.auditMode || 'standard');

            if (!inputs || inputs.length === 0) {
                throw new Error("No inputs found in job data.");
            }

            let report: any = {};
            let finalUrl = '';
            let finalScreenshots: any[] = [];
            let finalMimeType = 'image/jpeg';

            // --- BRANCH: COMPETITOR AUDIT ---
            if (auditMode === 'competitor') {
                console.log(`[JobProcessor] Mode: Competitor Analysis`);
                await JobService.updateProgress(jobId, 'Starting Competitor Analysis...');

                const primaryInput = inputs.find((i: any) => i.role === 'primary') || inputs[0];
                const competitorInput = inputs.find((i: any) => i.role === 'competitor') || inputs[1];

                if (!primaryInput?.url || !competitorInput?.url) {
                    throw new Error("Competitor audit requires two URLs (primary and competitor).");
                }

                finalUrl = primaryInput.url;

                // A. Scrape Primary
                console.log(`[JobProcessor] Scraping Primary: ${primaryInput.url}`);
                await JobService.updateProgress(jobId, `Scraping Primary Site: ${primaryInput.url}...`);
                const primaryScrape = await performScrape(primaryInput.url, false, true, browserEndpoint);

                // B. Scrape Competitor
                console.log(`[JobProcessor] Scraping Competitor: ${competitorInput.url}`);
                await JobService.updateProgress(jobId, `Scraping Competitor Site: ${competitorInput.url}...`);
                const competitorScrape = await performScrape(competitorInput.url, false, true, browserEndpoint);
                finalScreenshots = [primaryScrape.screenshot, competitorScrape.screenshot];

                // C. Analyze
                console.log(`[JobProcessor] Running Competitor Analysis...`);
                await JobService.updateProgress(jobId, 'Analyzed content acquired. Starting AI comparison...');

                const analysisBody = {
                    primaryUrl: primaryInput.url,
                    primaryScreenshotsBase64: [primaryScrape.screenshot.data],
                    primaryLiveText: primaryScrape.liveText,
                    competitorUrl: competitorInput.url,
                    competitorScreenshotsBase64: [competitorScrape.screenshot.data],
                    competitorLiveText: competitorScrape.liveText,
                    screenshotMimeType: 'image/jpeg'
                };

                const result = await performAnalysis(apiKeys, 'analyze-competitor', analysisBody);
                report = { [result.key]: result.data }; // Wrap in key for proper structure
                await JobService.updateProgress(jobId, '✓ Competitor Analysis complete.', report);

            } else {
                // --- BRANCH: STANDARD AUDIT ---
                console.log(`[JobProcessor] Mode: Standard Analysis`);
                await JobService.updateProgress(jobId, 'Starting Standard Analysis...');

                const firstInput = inputs[0];
                let analysisContext: any = {};

                if (firstInput.type === 'url') {
                    finalUrl = firstInput.url;
                    console.log(`[JobProcessor] Scraping ${finalUrl}...`);
                    await JobService.updateProgress(jobId, `Scraping ${finalUrl}...`);

                    // A. Scrape
                    const scrapeResult = await performScrape(finalUrl, false, true, browserEndpoint);

                    // A2. Scrape Mobile
                    console.log(`[JobProcessor] Scraping Mobile: ${finalUrl}`);
                    await JobService.updateProgress(jobId, 'Scraping Mobile view...');
                    const scrapeResultMobile = await performScrape(finalUrl, true, true, browserEndpoint);

                    finalScreenshots = [{ ...scrapeResult.screenshot }, { ...scrapeResultMobile.screenshot }];

                    await JobService.updateProgress(jobId, '✓ Scrape complete. Analyzing content...', {
                        screenshots: finalScreenshots, // Base64 screenshots staying in DB for now
                        screenshotMimeType: 'image/jpeg'
                    });

                    // B. Performance
                    console.log(`[JobProcessor] Checking performance...`);
                    // Use secrets from DB for PageSpeed if available
                    const perfResult = await performPerformanceCheck(finalUrl, primaryKey, appSecrets);

                    analysisContext = {
                        url: finalUrl,
                        screenshotBase64: scrapeResult.screenshot.data,
                        screenshotMimeType: 'image/jpeg',
                        liveText: scrapeResult.liveText,
                        animationData: scrapeResult.animationData,
                        accessibilityData: scrapeResult.accessibilityData,
                        performanceData: perfResult.performanceData,
                        performanceAnalysisError: perfResult.error,
                        mobileScreenshotBase64: scrapeResultMobile.screenshot.data
                    };

                } else if (firstInput.type === 'upload') {
                    finalUrl = 'Uploaded Image';
                    let base64 = firstInput.filesData?.[0] || firstInput.fileData; // Handles different input formats

                    // Handle Pre-uploaded URLs if they ever exist in New Flow
                    if (!base64 && firstInput.fileUrls && firstInput.fileUrls.length > 0) {
                        try {
                            const resp = await fetch(firstInput.fileUrls[0]);
                            if (resp.ok) {
                                const arrayBuffer = await resp.arrayBuffer();
                                base64 = Buffer.from(arrayBuffer).toString('base64');
                            }
                        } catch (e) { console.error("Failed to fetch pre-uploaded input", e); }
                    }

                    if (!base64) throw new Error("No file data provided");
                    finalScreenshots = [{ data: base64, isMobile: false }];
                    finalMimeType = 'image/png';

                    analysisContext = {
                        url: 'Uploaded Image',
                        screenshotBase64: base64,
                        screenshotMimeType: 'image/png',
                        liveText: "Content extracted from uploaded image.",
                        performanceData: null
                    };
                    await JobService.updateProgress(jobId, 'Processing uploaded image...');
                }

                // Run Experts
                console.log(`[JobProcessor] Running experts...`);
                const modes = ['analyze-ux', 'analyze-product', 'analyze-visual', 'analyze-strategy', 'analyze-accessibility'];

                const runExpertWithTimeout = async (mode: string) => {
                    const expertName = mode.replace('analyze-', ' ').toUpperCase();
                    console.log(`[JobProcessor] Starting ${mode}...`);
                    await JobService.updateProgress(jobId, `Running ${expertName}...`);

                    const startTime = Date.now();
                    try {
                        const result = await performAnalysis(apiKeys, mode, analysisContext);
                        console.log(`[JobProcessor] ✓ ${mode} completed in ${Date.now() - startTime}ms`);

                        // Update DB with partial result
                        await JobService.updateProgress(jobId, `✓ ${expertName} complete.`, { [result.key]: result.data });

                        return result;
                    } catch (error: any) {
                        console.error(`[JobProcessor] ✗ ${mode} failed:`, error.message);
                        return { key: mode, data: null, error: error.message };
                    }
                };

                const results: any[] = [];
                const concurrency = 3;

                for (let i = 0; i < modes.length; i += concurrency) {
                    const batch = modes.slice(i, i + concurrency);
                    const batchResults = await Promise.all(batch.map(mode => runExpertWithTimeout(mode)));
                    results.push(...batchResults);
                    if (i + concurrency < modes.length) await new Promise(r => setTimeout(r, 1000));
                }

                results.forEach((res: any) => {
                    if (res && res.key) report[res.key] = res.data;
                });

                // --- D. CONTEXTUAL IMPACT ANALYSIS ---
                if (report['Strategy Audit expert']) {
                    console.log(`[JobProcessor] Running Contextual Impact Analysis...`);
                    await JobService.updateProgress(jobId, 'Analyzing issues for strategic impact...');
                    try {
                        const allIssues = [
                            ...report['UX Audit expert']?.Top5CriticalUXIssues?.map((i: any) => ({ ...i, source: 'UX Audit' })) || [],
                            ...report['Product Audit expert']?.Top5CriticalProductIssues?.map((i: any) => ({ ...i, source: 'Product Audit' })) || [],
                            ...report['Visual Audit expert']?.Top5CriticalVisualIssues?.map((i: any) => ({ ...i, source: 'Visual Design' })) || [],
                            ...report['Accessibility Audit expert']?.Top5CriticalAccessibilityIssues?.map((i: any) => ({ ...i, source: 'Accessibility Audit' })) || []
                        ];

                        if (allIssues.length > 0) {
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
                            const rankResult = await callApi([primaryKey], systemInstruction, contents, {
                                type: Type.ARRAY,
                                items: schemas.criticalIssueSchema
                            });

                            report['Top5ContextualIssues'] = rankResult;
                            await JobService.updateProgress(jobId, '✓ Contextual Analysis complete.', { 'Top5ContextualIssues': rankResult });
                        }
                    } catch (e: any) {
                        console.error("[JobProcessor] Contextual Rank Failed:", e);
                        await JobService.updateProgress(jobId, '\u26a0\ufe0f Contextual Analysis skipped due to error.');
                    }
                }
            }

            // --- FINALIZATION ---
            console.log(`[JobProcessor] Job ${jobId} completed. Finalizing...`);

            const reportData = {
                url: finalUrl,
                competitorUrl: auditMode === 'competitor' ? (inputs.find((i: any) => i.role === 'competitor') || inputs[1])?.url : undefined,
                screenshots: finalScreenshots,
                screenshotMimeType: finalMimeType,
                ...report
            };

            const resultUrl = `/report/${jobId}`;

            await JobService.updateJobStatus(jobId, 'completed', reportData, undefined, resultUrl);
            console.log(`[JobProcessor] Job ${jobId} finished successfully.`);

        } catch (error: any) {
            console.error(`[JobProcessor] Job ${jobId} failed:`, error);
            await JobService.updateJobStatus(jobId, 'failed', undefined, error.message);
        }
    }
}
