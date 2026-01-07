import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { performScrape, performPerformanceCheck, performAnalysis } from './audit';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export const processAuditJob = async (jobId: string, inputs: any[]) => {
    console.log(`[Job ${jobId}] Starting processing...`);

    try {
        await supabaseAdmin.from('audit_jobs').update({ status: 'processing' }).eq('id', jobId);

        // Fetch secrets
        const { data: secretData } = await supabaseAdmin
            .from('app_secrets')
            .select('key_name, key_value')
            .in('key_name', ['API_KEY', 'PUPPETEER_BROWSER_ENDPOINT', 'PAGESPEED_API_KEY']);

        const secrets = (secretData || []).reduce((acc: any, item: any) => {
            acc[item.key_name] = item.key_value;
            return acc;
        }, {});

        const apiKey = secrets['API_KEY'] || process.env.API_KEY || process.env.GEMINI_API_KEY;
        const browserEndpoint = secrets['PUPPETEER_BROWSER_ENDPOINT'];

        if (!apiKey) throw new Error("Missing API Key");

        const ai = new GoogleGenAI({ apiKey });

        // 1. Scrape & Analyze Loop
        // Note: For MVP, we process inputs sequentially to manage resources, 
        // essentially treating the API job as a "Single Run" of the main flow.
        // We will take the FIRST input as the primary URL for now (implied single audit flow).
        // If multiple inputs are provided, we ideally loop, but the current DB schema 'audits' 
        // is designed for one "report". 
        // We will process the FIRST URL. Multi-URL audit support would require deeper DB refactor.

        const input = inputs[0];

        // Supported types: 'url' (default) or 'image'
        const inputType = input.type || 'url';

        let scrapeResult: any;
        let primaryUrl = input.url || 'http://uploaded-image'; // Fallback for images

        if (inputType === 'image') {
            console.log(`[Job ${jobId}] Processing Direct Image Upload`);

            if (!input.data) throw new Error("Missing 'data' (Base64) for image input");

            // Construct a 'fake' scrape result using the provided image
            scrapeResult = {
                screenshot: {
                    path: '/uploaded-image',
                    data: input.data, // Expecting plain Base64 or Data URI
                    isMobile: false
                },
                liveText: "Image Upload - No Live Text Available",
                animationData: null,
                accessibilityData: null
            };

            // Clean up Data URI prefix if present (e.g. data:image/png;base64,)
            if (scrapeResult.screenshot.data.includes(',')) {
                scrapeResult.screenshot.data = scrapeResult.screenshot.data.split(',')[1];
            }

        } else {
            // Default: URL Scrape
            if (!input.url) throw new Error("No valid URL provided in inputs");
            primaryUrl = input.url;
            console.log(`[Job ${jobId}] Processing URL: ${primaryUrl}`);

            // A. Scrape
            scrapeResult = await performScrape(primaryUrl, false, true, browserEndpoint);
        }

        // B. Upload Screenshot (Background)
        const timestamp = Date.now();
        const path = `audit_api_${jobId}_${timestamp}.jpg`;
        const buffer = Buffer.from(scrapeResult.screenshot.data, 'base64');

        const uploadPromise = supabaseAdmin
            .storage
            .from('screenshots')
            .upload(path, buffer, {
                contentType: 'image/jpeg',
                upsert: false
            });

        // C. Performance
        const perfResult = await performPerformanceCheck(primaryUrl, apiKey, secrets);

        // D. Analysis (Parallel)
        const analysisModes = ['analyze-ux', 'analyze-product', 'analyze-visual', 'analyze-strategy'];
        const analysisBody = {
            url: primaryUrl,
            screenshotBase64: scrapeResult.screenshot.data, // Desktop by default
            mobileScreenshotBase64: null, // Skipping mobile for API MVP speed
            liveText: scrapeResult.liveText,
            performanceData: perfResult.performanceData,
            screenshotMimeType: 'image/jpeg',
            performanceAnalysisError: perfResult.error,
            animationData: scrapeResult.animationData,
            accessibilityData: scrapeResult.accessibilityData
        };

        const analysisPromises = analysisModes.map(mode => performAnalysis(ai, mode, analysisBody));
        const analysisResults = await Promise.all(analysisPromises);

        const [uploadResult] = await Promise.all([uploadPromise]);

        if (uploadResult.error) {
            console.error(`[Job ${jobId}] Upload failed:`, uploadResult.error);
            // Continue but screenshot link will be broken
        }

        const { data: publicUrlData } = supabaseAdmin.storage.from('screenshots').getPublicUrl(path);
        const screenshotUrl = publicUrlData.publicUrl;

        // E. Construct Final Report
        // Map results back to expected format
        const finalReport: any = {};
        analysisResults.forEach((res: any) => {
            // Logic to merge expert outputs. 
            // performAnalysis returns { key, data }. Data is the JSON object from AI.
            // The client usually merges these. We need to merge them here.
            // We will store them in a 'results' object for now or mimic client structure.
            // Client structure: { "UX Audit expert": { ... }, ... }
            finalReport[res.key] = res.data;
        });

        // F. Save to Audits Table
        const { data: auditData, error: auditError } = await supabaseAdmin
            .from('audits')
            .insert({
                url: primaryUrl,
                report_data: finalReport,
                screenshot_url: screenshotUrl // Single string column? Or Array? Use single for now.
            })
            .select()
            .single();

        if (auditError) throw auditError;

        // G. Update Job
        // We construct a viewer URL. Assuming localhost:5173 or production URL.
        // Ideally we should have a generic viewer URL.
        const viewerBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const resultUrl = `${viewerBaseUrl}/report/${auditData.id}`;

        await supabaseAdmin.from('audit_jobs').update({
            status: 'completed',
            result_url: resultUrl
        }).eq('id', jobId);

        console.log(`[Job ${jobId}] Completed Successfully. URL: ${resultUrl}`);

    } catch (error: any) {
        console.error(`[Job ${jobId}] Failed:`, error);
        await supabaseAdmin.from('audit_jobs').update({
            status: 'failed',
            error_message: error.message
        }).eq('id', jobId);
    }
};
