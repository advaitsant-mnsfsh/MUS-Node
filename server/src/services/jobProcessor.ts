import { supabase } from '../lib/supabase';
import { JobService } from './jobService';
import { GoogleGenAI } from '@google/genai';
import { performScrape, performPerformanceCheck, performAnalysis } from '../audit';

export class JobProcessor {
    static async processJob(jobId: string) {
        console.log(`[JobProcessor] Starting job ${jobId}`);
        try {
            // 1. Update Status
            await JobService.updateJobStatus(jobId, 'processing');

            // 2. Fetch Job & Secrets
            const job = await JobService.getJob(jobId);
            if (!job) throw new Error('Job not found');

            const secrets = await this.getSecrets();
            const apiKey = secrets['API_KEY'] || process.env.API_KEY;
            if (!apiKey) throw new Error('Missing API Key');

            const ai = new GoogleGenAI({ apiKey });
            const browserEndpoint = secrets['PUPPETEER_BROWSER_ENDPOINT'];

            const inputs = job.input_data.inputs || [];
            const firstInput = inputs[0]; // TODO: Handle multiple inputs

            let analysisContext: any = {};
            let url = '';

            // 3. Prepare Context (Scrape or Image)
            if (firstInput.type === 'url') {
                url = firstInput.url;
                console.log(`[JobProcessor] Scraping ${url}...`);

                // A. Scrape
                const scrapeResult = await performScrape(url, false, true, browserEndpoint);

                // B. Performance
                console.log(`[JobProcessor] Checking performance...`);
                const perfResult = await performPerformanceCheck(url, apiKey, secrets);

                analysisContext = {
                    url,
                    screenshotBase64: scrapeResult.screenshot.data,
                    screenshotMimeType: 'image/jpeg',
                    liveText: scrapeResult.liveText,
                    animationData: scrapeResult.animationData,
                    accessibilityData: scrapeResult.accessibilityData,
                    performanceData: perfResult.performanceData,
                    performanceAnalysisError: perfResult.error,
                    mobileScreenshotBase64: null // TODO: Mobile capture
                };

            } else if (firstInput.type === 'upload') {
                // Image Upload
                // inputs[0].filesData is array of base64
                const base64 = firstInput.filesData?.[0];
                if (!base64) throw new Error("No file data provided");

                analysisContext = {
                    url: 'Uploaded Image',
                    screenshotBase64: base64,
                    screenshotMimeType: 'image/png', // Assumption
                    liveText: "Content extracted from uploaded image.",
                    performanceData: null
                };
            }

            // 4. Run Experts (Parallel with timeout and individual error handling)
            console.log(`[JobProcessor] Running experts...`);
            const modes = ['analyze-ux', 'analyze-product', 'analyze-visual', 'analyze-strategy'];

            const runExpertWithTimeout = async (mode: string, timeout = 60000) => {
                console.log(`[JobProcessor] Starting ${mode}...`);
                const startTime = Date.now();

                try {
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error(`${mode} timed out after ${timeout}ms`)), timeout)
                    );

                    const result = await Promise.race([
                        performAnalysis(ai, mode, analysisContext),
                        timeoutPromise
                    ]);

                    const duration = Date.now() - startTime;
                    console.log(`[JobProcessor] ✓ ${mode} completed in ${duration}ms`);
                    return result;
                } catch (error: any) {
                    const duration = Date.now() - startTime;
                    console.error(`[JobProcessor] ✗ ${mode} failed after ${duration}ms:`, error.message);
                    return { key: mode, data: null, error: error.message };
                }
            };

            const results = await Promise.all(modes.map(mode => runExpertWithTimeout(mode)));
            console.log(`[JobProcessor] All experts completed`);

            // 5. Aggregate
            const report: any = {};
            results.forEach((res: any) => {
                if (res && res.key) report[res.key] = res.data;
            });

            // 6. Save Result
            console.log(`[JobProcessor] Job ${jobId} completed.`);
            // We also want to save the screenshot public URL if possible.
            // For now, we embed the base64 in report? No, that's too heavy for JSONB if large.
            // Ideally we upload screenshot to storage.
            // But simplifying: just save the report structure. The frontend keys off 'screenshot_url' usually.
            // We might need to upload the screenshot to Supabase Storage here if we want persistent display.
            // Skipping for speed, frontend might show broken image if we don't return one.
            // We can add a step to upload screenshot if we have time.
            // Let's at least construct the report object.

            const reportData = {
                url: analysisContext.url,
                ...report
            };

            // 1. Upload Report to Storage (Reliable sharing)
            const BUCKET = 'shared-audits';
            const storageFileName = `${jobId}.json`;

            // Ensure bucket exists
            const { data: buckets } = await supabase.storage.listBuckets();
            if (!buckets?.find(b => b.name === BUCKET)) {
                console.log(`[JobProcessor] Creating ${BUCKET} bucket...`);
                await supabase.storage.createBucket(BUCKET, { public: true });
            }

            const { error: uploadError } = await supabase.storage
                .from(BUCKET)
                .upload(storageFileName, JSON.stringify(reportData), {
                    contentType: 'application/json',
                    upsert: true
                });

            if (uploadError) {
                console.warn(`[JobProcessor] Failed to upload report to storage:`, uploadError);
                // Continue anyway, DB save might still work
            } else {
                console.log(`[JobProcessor] Uploaded report to ${BUCKET}/${storageFileName}`);
            }

            // 2. Generate Result URL (Client URL)
            const baseUrl = process.env.FRONTEND_URL || 'https://mus-node.vercel.app';

            // We still point to /report/:jobId on frontend, but frontend will now fetch from Storage
            const resultUrl = `${baseUrl}/report/${jobId}`;
            console.log(`[JobProcessor] Generated result URL: ${resultUrl}`);

            await JobService.updateJobStatus(jobId, 'completed', reportData, undefined, resultUrl);

        } catch (error: any) {
            console.error(`[JobProcessor] Job ${jobId} failed:`, error);
            await JobService.updateJobStatus(jobId, 'failed', undefined, error.message);
        }
    }

    static async getSecrets() {
        const { data, error } = await supabase
            .from('app_secrets')
            .select('key_name, key_value');

        if (error || !data) return {};

        return data.reduce((acc: any, item: any) => {
            acc[item.key_name] = item.key_value;
            return acc;
        }, {});
    }
}
