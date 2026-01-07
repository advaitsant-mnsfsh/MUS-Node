
import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Type } from '@google/genai';
import puppeteer from 'puppeteer';
import { jsonrepair } from 'jsonrepair';
import {
    getWebsiteContextPrompt,
    getStrategySystemInstruction,
    getUXSystemInstruction,
    getProductSystemInstruction,
    getVisualSystemInstruction,
    getSchemas
} from './prompts';

// --- HELPERS ---

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getRetryDelay(error: any) {
    const text = error.message || JSON.stringify(error);
    const match = text.match(/retry in (\d+(\.\d+)?)s/i) || text.match(/retry-after.*?(\d+)/i);
    if (match) {
        return parseFloat(match[1]) * 1000;
    }
    return null;
}

async function retryWithBackoff(operation: any, retries = 10, initialDelay = 1000, operationName = "AI Operation") {
    let attempt = 0;
    while (true) {
        try {
            attempt++;
            return await operation();
        } catch (error: any) {
            const msg = error.message || JSON.stringify(error);
            const isRetriable = msg.includes('503') || msg.includes('429') || msg.includes('overloaded') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('UNAVAILABLE') || msg.includes('Timeout') || msg.includes('internal error');

            if (attempt > retries || !isRetriable) {
                console.error(`${operationName} failed permanently on attempt ${attempt}. Error: ${msg}`);
                throw error;
            }

            const base = initialDelay;
            const max = 60000;
            const slot = Math.pow(2, attempt - 1);
            const cap = Math.min(max, base * slot);
            let delay = Math.floor(Math.random() * cap);
            if (delay < initialDelay) delay = initialDelay + Math.random() * 1000;

            const serverDelay = getRetryDelay(error);
            if (serverDelay) {
                delay = serverDelay + 1000;
                console.warn(`${operationName} hit limit. Server requested wait of ${serverDelay / 1000}s.`);
            }

            console.warn(`${operationName} failed (Attempt ${attempt}/${retries}). Retrying in ${delay / 1000}s... Error: ${msg.substring(0, 150)}...`);
            await sleep(delay);
        }
    }
}

const callApi = async (ai: any, systemInstruction: string, contents: string, schema: any, imageBase64: string | null = null, mimeType = 'image/png', mobileImageBase64: string | null = null) => {
    const parts: any[] = [];
    if (imageBase64) {
        parts.push({
            inlineData: {
                mimeType,
                data: imageBase64
            }
        });
    }
    if (mobileImageBase64) {
        parts.push({
            inlineData: {
                mimeType,
                data: mobileImageBase64
            }
        });
    }
    parts.push({
        text: contents
    });

    const requestContents = (imageBase64 || mobileImageBase64) ? { parts } : contents;

    const apiCall = () => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: requestContents,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: schema,
            maxOutputTokens: 8192,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ]
        }
    });

    const response = await retryWithBackoff(apiCall, 10, 2000, "Generate Content");
    try {
        let outputText = "";
        if (typeof response.text === 'function') {
            outputText = response.text();
        } else if (response.response && typeof response.response.text === 'function') {
            outputText = response.response.text();
        } else if (typeof response.text === 'string') {
            outputText = response.text;
        } else {
            outputText = JSON.stringify(response);
        }

        if (!outputText) throw new Error("Response text is undefined");

        let text = outputText.trim();

        // 1. Try stripping markdown code blocks first
        if (text.startsWith('```json')) {
            text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (text.startsWith('```')) {
            text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        try {
            return JSON.parse(text);
        } catch (initialError) {
            // 2. Try jsonrepair (handles truncated JSON, missing quotes, etc.)
            try {
                const repaired = jsonrepair(text);
                return JSON.parse(repaired);
            } catch (repairError) {
                // 3. Fallback: Try finding the first '{' and last '}'
                const firstOpen = text.indexOf('{');
                const lastClose = text.lastIndexOf('}');

                if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
                    const extracted = text.substring(firstOpen, lastClose + 1);
                    try {
                        return JSON.parse(extracted);
                    } catch (secondaryError) {
                        try {
                            // Try repairing the extracted part too
                            return JSON.parse(jsonrepair(extracted));
                        } catch (finalError) {
                            throw initialError;
                        }
                    }
                }
                throw initialError;
            }
        }
    } catch (e: any) {
        console.error("Failed to parse AI response as JSON.", e);
        const outputText = response.text ? (typeof response.text === 'function' ? response.text() : response.text) : 'undefined';
        // Include the specific JSON parse error message for better debugging
        throw new Error(`The AI model returned a response that could not be parsed as JSON (${e.message}). Raw output: \n---\n${outputText ? outputText.trim() : 'undefined'}\n---`);
    }
};

const handleSingleAnalysisStream = async (res: Response, expertKey: string, analysisFn: any) => {
    const write = (chunk: any) => {
        res.write(JSON.stringify(chunk) + '\n');
    };

    try {
        write({ type: 'status', message: `Running ${expertKey.replace(' expert', '')} analysis...` });
        const data = await analysisFn();
        if (!data) {
            throw new Error("The AI model returned an empty or invalid response for this audit section.");
        }
        if (expertKey === 'Visual Audit expert') {
            console.log("---------- VISUAL AUDIT RESPONSE ----------");
            console.log(JSON.stringify(data, null, 2));
            console.log("-------------------------------------------");
        }
        if (expertKey === 'Strategy Audit expert') {
            console.log("---------- STRATEGY AUDIT RESPONSE ----------");
            console.log(JSON.stringify(data, null, 2));
            console.log("-------------------------------------------");
        }
        write({ type: 'data', payload: { key: expertKey, data } });
        write({ type: 'status', message: `✓ ${expertKey.replace(' expert', '')} analysis complete.` });
    } catch (error: any) {
        console.error(`Analysis failed for ${expertKey}:`, error);
        const errorMessage = error.stack ? `${error.message}\n${error.stack}` : error.message;
        write({ type: 'error', message: `Error in ${expertKey}: ${errorMessage}` });
    }
};

// --- RELEASED FUNCTIONS FOR HEADLESS USE ---

export const performScrape = async (url: string, isMobile: boolean, isFirstPage: boolean, browserEndpoint?: string) => {
    let browser;
    try {
        if (browserEndpoint) {
            const connectBrowser = () => puppeteer.connect({ browserWSEndpoint: browserEndpoint });
            browser = await retryWithBackoff(connectBrowser, 5, 2000, "Puppeteer Connect");
        } else {
            browser = await puppeteer.launch({
                headless: "new",
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ]
            });
        }

        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(60000); // Increased timeout

        const viewport = isMobile ? { width: 390, height: 844, isMobile: true, hasTouch: true } : { width: 1920, height: 1080 };
        await page.setViewport(viewport);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Scroll logic
        await page.evaluate(async () => {
            await new Promise<void>((resolve) => {
                let totalHeight = 0;
                const distance = 250;
                const maxScrolls = 15; // Reduced from 40 for speed
                let scrolls = 0;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    scrolls++;
                    if (totalHeight >= scrollHeight || scrolls >= maxScrolls) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });

        // Fix fixed positions
        await page.evaluate(() => {
            document.querySelectorAll('*').forEach((el: any) => {
                const style = window.getComputedStyle(el);
                if (style.position === 'fixed' || style.position === 'sticky') {
                    el.style.position = 'absolute';
                }
            });
            window.scrollTo(0, 0);
        });

        const screenshotBuffer = await page.screenshot({ type: 'jpeg', quality: 40, fullPage: true });
        const pagePath = new URL(url).pathname;

        const screenshot = {
            path: pagePath,
            data: Buffer.from(screenshotBuffer).toString('base64'),
            isMobile
        };

        const pageData = await page.evaluate((isFirstPageDesktop: boolean) => {
            const text = document.body.innerText;
            let animationData = null;
            let accessibilityData = null;

            if (isFirstPageDesktop) {
                // @ts-ignore
                animationData = Array.from(document.querySelectorAll('*')).filter((el: any) => {
                    const style = window.getComputedStyle(el);
                    return style.getPropertyValue('animation-name') !== 'none' || (style.getPropertyValue('transition-property') !== 'all' && style.getPropertyValue('transition-property') !== '');
                }).map((el: any) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${el.className && typeof el.className === 'string' ? `.${el.className.split(' ').filter((c: any) => c).join('.')}` : ''}`).slice(0, 20);

                // @ts-ignore
                accessibilityData = {
                    imagesMissingAlt: Array.from(document.querySelectorAll('img:not([alt])')).length,
                    inputsMissingLabels: Array.from(document.querySelectorAll('input:not([id]), textarea:not([id])')).filter((el: any) => !el.closest('label')).length + Array.from(document.querySelectorAll('input[id], textarea[id]')).filter((el: any) => !document.querySelector(`label[for="${el.id}"]`)).length,
                    hasSemanticElements: !!document.querySelector('main, nav, header, footer, article, section, aside'),
                    hasAriaAttributes: !!document.querySelector('[role], [aria-label], [aria-labelledby], [aria-describedby]')
                };
            }
            return { liveText: text, animationData, accessibilityData };
        }, isFirstPage && !isMobile);

        await page.close();
        return { screenshot, ...pageData };

    } catch (error: any) {
        console.error("Scraping failed:", error);
        throw new Error(`Scraping failed: ${error.message}`);
    } finally {
        if (browser) await browser.disconnect();
    }
};

export const performPerformanceCheck = async (url: string, apiKey: string, secrets: any) => {
    try {
        let pageSpeedApiKey = secrets['PAGESPEED_API_KEY'];
        if (!pageSpeedApiKey) {
            pageSpeedApiKey = process.env.PAGESPEED_API_KEY;
        }
        const usedKey = pageSpeedApiKey || apiKey;

        const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${usedKey}&category=performance&strategy=desktop`;

        const maskedKey = usedKey ? `...${usedKey.slice(-4)}` : 'undefined';
        console.log(`[Performance] Starting audit for: ${url}`);
        console.log(`[Performance] Using API Key: ${maskedKey}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        console.log(`[Performance] Fetching PageSpeed data...`);
        const psiResponse = await fetch(psiUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        console.log(`[Performance] Response Status: ${psiResponse.status}`);

        let performanceData = null;
        let error = null;

        if (!psiResponse.ok) {
            const errorText = await psiResponse.text();
            console.error(`[Performance] API Error Body:`, errorText);
            try {
                const errorBody = JSON.parse(errorText);
                error = errorBody?.error?.message || `API Error ${psiResponse.status}`;
            } catch (e) {
                error = `API Error ${psiResponse.status}: ${errorText}`;
            }
        } else {
            const psiData: any = await psiResponse.json();
            console.log(`[Performance] Data received. Lighthouse Result Present: ${!!psiData.lighthouseResult}`);

            if (psiData.lighthouseResult) {
                const audits = psiData.lighthouseResult.audits;
                performanceData = {
                    lcp: audits['largest-contentful-paint']?.displayValue || 'N/A',
                    cls: audits['cumulative-layout-shift']?.displayValue || 'N/A',
                    tbt: audits['total-blocking-time']?.displayValue || 'N/A',
                    fcp: audits['first-contentful-paint']?.displayValue || 'N/A',
                    tti: audits['interactive']?.displayValue || 'N/A',
                    si: audits['speed-index']?.displayValue || 'N/A'
                };
                console.log(`[Performance] Extracted metrics:`, performanceData);
            } else {
                console.warn(`[Performance] No lighthouseResult found in response.`);
                error = psiData.error ? psiData.error.message : "Lighthouse returned an empty result.";
            }
        }
        return { performanceData, error };
    } catch (e: any) {
        const error = e.name === 'AbortError' ? "Google PageSpeed Insights API timed out after 1 minute." : e.message;
        return { performanceData: null, error };
    }
};

export const performAnalysis = async (ai: GoogleGenAI, mode: string, body: any) => {
    const schemas = getSchemas();
    const expertMap: any = {
        'analyze-ux': { key: 'UX Audit expert', role: 'UX Auditor', schema: schemas.uxAuditSchema },
        'analyze-product': { key: 'Product Audit expert', role: 'Product Auditor', schema: schemas.productAuditSchema },
        'analyze-visual': { key: 'Visual Audit expert', role: 'Visual Designer', schema: schemas.visualAuditSchema },
        'analyze-strategy': { key: 'Strategy Audit expert', role: 'Strategy Auditor', schema: schemas.strategyAuditSchema }
    };

    const expertConfig = expertMap[mode];
    if (mode === 'analyze-strategy') {
        const { liveText } = body;
        return {
            key: expertConfig.key,
            data: await callApi(ai, getStrategySystemInstruction(), liveText, expertConfig.schema)
        };
    } else {
        const { url, screenshotBase64, mobileScreenshotBase64, liveText, performanceData, screenshotMimeType, performanceAnalysisError, animationData, accessibilityData } = body;

        const mobileCaptureSucceeded = !!mobileScreenshotBase64;
        const isMultiPage = liveText.includes("--- START CONTENT FROM"); // Note: check logic slightly differs from client string, adjusting to match typical input

        let systemInstruction = "";
        const contextPrompt = getWebsiteContextPrompt(url, performanceData, performanceAnalysisError, animationData, accessibilityData, isMultiPage);

        if (mode === 'analyze-ux') {
            systemInstruction = getUXSystemInstruction(mobileCaptureSucceeded, isMultiPage);
        } else if (mode === 'analyze-product') {
            systemInstruction = getProductSystemInstruction(isMultiPage);
        } else if (mode === 'analyze-visual') {
            systemInstruction = getVisualSystemInstruction(mobileCaptureSucceeded, isMultiPage);
        }

        const fullContent = `${contextPrompt}\n### Live Website Text Content ###\n${liveText}`;

        return {
            key: expertConfig.key,
            data: await callApi(ai, systemInstruction, fullContent, expertConfig.schema, screenshotBase64, screenshotMimeType, mobileScreenshotBase64)
        };
    }
};


// --- MAIN HANDLER ---

export const handleAuditRequest = async (req: Request, res: Response) => {
    // ... (DB Init and Secrets fetch - kept same)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        return res.status(500).json({ message: `Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY` });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { data: secretData, error: secretError } = await supabaseAdmin
        .from('app_secrets')
        .select('key_name, key_value')
        .in('key_name', ['API_KEY', 'PUPPETEER_BROWSER_ENDPOINT', 'PAGESPEED_API_KEY']);

    if (secretError || !secretData) {
        console.error("Failed to fetch secrets from Supabase:", secretError);
        return res.status(500).json({ message: "Failed to retrieve app credentials." });
    }

    const { mode } = req.body;

    const secrets = secretData.reduce((acc: any, item: any) => {
        acc[item.key_name] = item.key_value;
        return acc;
    }, {});

    let apiKey = secrets['API_KEY'];
    if (!apiKey) {
        apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    }

    if (!apiKey) {
        return res.status(500).json({ message: "Missing AI API Key." });
    }

    const browserEndpoint = secrets['PUPPETEER_BROWSER_ENDPOINT'];
    const ai = new GoogleGenAI({ apiKey });

    if (mode.startsWith('analyze-')) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
    }

    switch (mode) {
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
            const result = await performPerformanceCheck(url, apiKey, secrets);
            res.json(result);
            break;
        }

        case 'analyze-ux':
        case 'analyze-product':
        case 'analyze-visual':
        case 'analyze-strategy': {
            try {
                // Streaming Wrapper
                const write = (chunk: any) => {
                    res.write(JSON.stringify(chunk) + '\n');
                };
                const expertName = mode.replace('analyze-', ' ').toUpperCase(); // Rough name

                write({ type: 'status', message: `Running ${expertName} analysis...` });

                const result = await performAnalysis(ai, mode, req.body);

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

        case 'contextual-rank': {
            try {
                const { report } = req.body;
                const allIssues = [
                    ...report['UX Audit expert']?.Top5CriticalUXIssues?.map((i: any) => ({ ...i, source: 'UX Audit' })) || [],
                    ...report['Product Audit expert']?.Top5CriticalProductIssues?.map((i: any) => ({ ...i, source: 'Product Audit' })) || [],
                    ...report['Visual Audit expert']?.Top5CriticalVisualIssues?.map((i: any) => ({ ...i, source: 'Visual Design' })) || []
                ];

                if (!report['Strategy Audit expert'] || allIssues.length === 0) {
                    // Fallback sort
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
                // We need to use 'responseMimeType' etc. callApi logic but we are not sending image.
                const callContextRank = () => ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: contents,
                    config: {
                        systemInstruction,
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.ARRAY,
                            items: schemas.criticalIssueSchema
                        }
                    }
                });

                const response = await retryWithBackoff(callContextRank, 10, 2000, "Contextual Rank");
                // Same parsing logic as callApi
                let outputText = "";
                if (typeof response.text === 'function') {
                    outputText = response.text();
                } else if (response.response && typeof response.response.text === 'function') {
                    outputText = response.response.text();
                } else if (typeof response.text === 'string') {
                    outputText = response.text;
                } else {
                    outputText = JSON.stringify(response); // limit
                }

                // Strip markdown for contextual rank too
                let text = outputText.trim();
                if (text.startsWith('```json')) {
                    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                } else if (text.startsWith('```')) {
                    text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }

                res.json(JSON.parse(text));

            } catch (error: any) {
                console.error("Contextual rank failed:", error);
                res.status(500).json({ message: `Contextual ranking failed: ${error.message}` });
            }
            break;
        }

        case 'upload-screenshots': {
            try {
                const { screenshots } = req.body;
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
                        url: publicUrl
                    };
                }));

                res.json({ uploadedScreenshots });
            } catch (error: any) {
                console.error("Upload failed:", error);
                res.status(500).json({ message: `Upload failed: ${error.message}` });
            }
            break;
        }

        case 'save-audit': {
            try {
                const { report, screenshots, url } = req.body;
                const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

                // Expect screenshots to already have URLs from the 'upload-screenshots' step
                const primaryScreenshot = screenshots.find((s: any) => s.url && !s.isMobile);

                const { data: auditRecord, error: insertError } = await supabaseAdmin.from('audits').insert({
                    url,
                    report_data: report, // Save the report as is
                    screenshot_url: primaryScreenshot?.url
                }).select('id').single();

                if (insertError) throw new Error(`Supabase insert failed: ${insertError.message}`);

                res.json({ auditId: auditRecord.id, screenshotUrl: primaryScreenshot?.url });

            } catch (error: any) {
                console.error("Save audit failed:", error);
                res.status(500).json({ message: `Save audit failed: ${error.message}` });
            }
            break;
        }

        case 'finalize': {
            // Deprecated. Use upload-screenshots and save-audit.
            res.status(400).json({ message: "Deprecated. Use upload-screenshots and save-audit." });
            break;
        }

        case 'get-audit': {
            try {
                const { auditId } = req.body;
                if (!auditId) return res.status(400).json({ message: "auditId is required." });

                const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
                const { data, error } = await supabaseAdmin.from('audits').select('report_data, url, screenshot_url').eq('id', auditId).single();

                if (error) throw error;
                if (!data) return res.status(404).json({ message: "Audit not found." });

                res.json({
                    report: data.report_data,
                    url: data.url,
                    screenshotUrl: data.screenshot_url
                });
            } catch (error: any) {
                console.error(`Error getting audit ${req.body.auditId}:`, error);
                res.status(500).json({ message: `Get audit failed: ${error.message}` });
            }
            break;
        }

        default:
            res.status(400).json({ message: "Invalid mode specified." });
    }
};
