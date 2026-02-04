import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { jsonrepair } from 'jsonrepair';
import { retryWithBackoff } from '../utils/retry';
import {
    getWebsiteContextPrompt,
    getStrategySystemInstruction,
    getUXSystemInstruction,
    getProductSystemInstruction,
    getVisualSystemInstruction,
    getAccessibilitySystemInstruction,
    getCompetitorSystemInstruction,
    getSchemas
} from '../prompts';

export const callApi = async (apiKeys: string[], systemInstruction: string, contents: string, schema: any, images: string[] = [], mimeType = 'image/png') => {
    const parts: any[] = [];
    if (images && images.length > 0) {
        images.forEach(img => {
            if (img) {
                parts.push({
                    inlineData: {
                        mimeType,
                        data: img
                    }
                });
            }
        });
    }
    parts.push({
        text: contents
    });



    const apiCall = async (attempt: number) => {
        // Strategy: Use Primary Key for first 5 attempts, then switch to Backup Key
        // apiKeys[0] = Primary, apiKeys[1] = Backup
        let selectedKey = apiKeys[0];
        if (attempt > 5 && apiKeys.length > 1) {
            selectedKey = apiKeys[1];
            console.warn(`[AI] Switching to Backup Key (Attempt ${attempt})`);
        }

        // Fallback Strategy: Drop images after 5 attempts to reduce payload size and avoid 500 errors
        let currentRequestContents: any = contents;
        if (attempt <= 5 && parts.length > 1) {
            currentRequestContents = { parts };
        } else if (attempt > 5 && parts.length > 1) {
            console.warn(`[AI] Switching to Text-Only Mode (Dropping Images) for stability (Attempt ${attempt})`);
        }

        const ai = new GoogleGenAI({ apiKey: selectedKey });

        return ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: currentRequestContents,
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
    };

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

export const performAnalysis = async (apiKeys: string[], mode: string, body: any) => {
    const schemas = getSchemas();
    const expertMap: any = {
        'analyze-ux': { key: 'UX Audit expert', role: 'UX Auditor', schema: schemas.uxAuditSchema },
        'analyze-product': { key: 'Product Audit expert', role: 'Product Auditor', schema: schemas.productAuditSchema },
        'analyze-visual': { key: 'Visual Audit expert', role: 'Visual Designer', schema: schemas.visualAuditSchema },
        'analyze-strategy': { key: 'Strategy Audit expert', role: 'Strategy Auditor', schema: schemas.strategyAuditSchema },
        'analyze-accessibility': { key: 'Accessibility Audit expert', role: 'Accessibility Auditor', schema: schemas.accessibilityAuditSchema }
    };

    const expertConfig = expertMap[mode];

    if (mode === 'analyze-competitor') {
        // Competitor Analysis Mode
        const {
            primaryUrl, primaryScreenshotsBase64, primaryLiveText,
            competitorUrl, competitorScreenshotsBase64, competitorLiveText,
            screenshotMimeType
        } = body;

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

        return {
            key: 'Competitor Analysis expert',
            data: await callApi(apiKeys, getCompetitorSystemInstruction(), fullContent, schemas.competitorAuditSchema, limitedImages, screenshotMimeType || 'image/jpeg')
        };
    } else if (mode === 'analyze-strategy') {
        const { liveText } = body;
        return {
            key: expertConfig.key,
            data: await callApi(apiKeys, getStrategySystemInstruction(), liveText, expertConfig.schema, [], 'image/png')
        };
    } else {
        const { url, screenshotBase64, mobileScreenshotBase64, liveText, performanceData, screenshotMimeType, performanceAnalysisError, animationData, accessibilityData, axeViolations } = body;

        const mobileCaptureSucceeded = !!mobileScreenshotBase64;
        const isMultiPage = liveText?.includes("--- START CONTENT FROM") || liveText?.includes("--- CONTENT FROM") || false;

        let systemInstruction = "";
        let contextPrompt = getWebsiteContextPrompt(url, performanceData, performanceAnalysisError, animationData, accessibilityData, isMultiPage);

        if (mode === 'analyze-ux') {
            systemInstruction = getUXSystemInstruction(mobileCaptureSucceeded, isMultiPage);
        } else if (mode === 'analyze-product') {
            systemInstruction = getProductSystemInstruction(isMultiPage);
        } else if (mode === 'analyze-visual') {
            systemInstruction = getVisualSystemInstruction(mobileCaptureSucceeded, isMultiPage);
        } else if (mode === 'analyze-accessibility') {
            systemInstruction = getAccessibilitySystemInstruction(isMultiPage);
            if (axeViolations) {
                contextPrompt += `\n### Automated Axe-Core Accessibility Violations ###\n${JSON.stringify(axeViolations, null, 2)}\n`;
            }
        }

        // Optimizing Token Usage: Truncate very long text
        const MAX_TEXT_LENGTH = 60000; // ~15k tokens
        const safeText = liveText || ''; // Fallback to empty string if undefined
        const truncatedText = safeText.length > MAX_TEXT_LENGTH
            ? safeText.substring(0, MAX_TEXT_LENGTH) + "\n...[truncated for length]..."
            : safeText;

        const fullContent = `${contextPrompt}\n### Live Website Text Content ###\n${truncatedText}`;

        const images = [screenshotBase64, mobileScreenshotBase64].filter(Boolean);
        return {
            key: expertConfig.key,
            data: await callApi(apiKeys, systemInstruction, fullContent, expertConfig.schema, images, screenshotMimeType)
        };
    }
};
