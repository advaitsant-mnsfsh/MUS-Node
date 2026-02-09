import { authClient } from '../lib/auth-client';
import { authenticatedFetch } from '../lib/authenticatedFetch';

export interface UserAudit {
    id: string;
    created_at: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    input_data: any;
    report_data?: any; // Optional - not fetched on dashboard for performance
    error_message?: string;
    api_key_id?: string | null; // API key used for this audit (null = direct website audit)
}

import { getBackendUrl } from './config';
const API_URL = getBackendUrl();

let auditsCache: Promise<UserAudit[]> | null = null;

/**
 * Fetch all audits owned by the current user
 * Uses deduplication to prevent double-firing in StrictMode
 */
export async function getUserAudits(): Promise<UserAudit[]> {
    if (auditsCache) return auditsCache;

    auditsCache = (async () => {
        try {
            // Use authenticatedFetch to ensure session token is sent
            const response = await authenticatedFetch(`${API_URL}/api/user/audits`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('[getUserAudits] Error:', error);
                return [];
            }

            return await response.json();
        } catch (error) {
            console.error('[getUserAudits] Unexpected Error:', error);
            return [];
        } finally {
            // Clear cache after a short delay to allow fresh fetches later
            setTimeout(() => { auditsCache = null; }, 5000);
        }
    })();

    return auditsCache;
}


/**
 * Fetch just the inputs for a specific audit (useful if missing from storage JSON)
 */
export async function getAuditInputs(auditId: string): Promise<any | null> {
    try {
        const response = await fetch(`${API_URL}/api/v1/audit/${auditId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) return null;

        const data = await response.json();
        return data.input_data; // The API returns { ..., input_data: ... }
    } catch (err) {
        return null;
    }
}

/**
 * Extract overall score from report data
 * Calculates average of all expert scores
 */
export function calculateOverallScore(reportData: any): number | null {
    if (!reportData) return null;

    const expertKeys = [
        'UX Audit expert',
        'Product Audit expert',
        'Visual Audit expert',
        'Strategy Audit expert',
        'Accessibility Audit expert'
    ];

    const scores: number[] = [];

    for (const key of expertKeys) {
        const expert = reportData[key];
        if (expert?.OverallScore !== undefined) {
            scores.push(expert.OverallScore);
        }
    }

    if (scores.length === 0) return null;

    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return Math.round(average * 100); // Convert to percentage
}

/**
 * Extract primary URL from input data
 * For competitor analysis, returns both URLs formatted
 */
export function extractUrl(inputData: any): string {
    if (!inputData) return 'Unknown';

    // Handle both { inputs: [...] } and direct [...] array
    const inputs = Array.isArray(inputData) ? inputData : inputData.inputs;
    const auditMode = Array.isArray(inputData) ? 'standard' : inputData.auditMode;

    if (!inputs || !Array.isArray(inputs) || inputs.length === 0) {
        return 'Unknown';
    }

    // Competitor mode: return primary URL (we'll show both in the UI)
    if (auditMode === 'competitor' && inputs.length >= 2) {
        const primary = inputs.find((i: any) => i.role === 'primary') || inputs[0];
        return primary.url || 'Unknown';
    }

    const firstInput = inputs[0];
    return firstInput.url || 'Manual Upload';
}

/**
 * Extract competitor URL from input data (if applicable)
 */
export function extractCompetitorUrl(inputData: any): string | null {
    if (!inputData) return null;

    const inputs = Array.isArray(inputData) ? inputData : inputData.inputs;
    const auditMode = Array.isArray(inputData) ? 'standard' : inputData.auditMode;

    if (auditMode !== 'competitor' || !inputs || !Array.isArray(inputs)) {
        return null;
    }

    const competitor = inputs.find((i: any) => i.role === 'competitor') || inputs[1];
    return competitor?.url || null;
}


/**
 * Get screenshot URL from report data
 */
export function getScreenshotUrl(reportData: any): string | null {
    if (!reportData?.screenshots || !Array.isArray(reportData.screenshots)) {
        return null;
    }

    // Find first desktop screenshot
    const desktopScreenshot = reportData.screenshots.find((s: any) => !s.isMobile);
    if (desktopScreenshot?.url) return desktopScreenshot.url;
    if (desktopScreenshot?.publicUrl) return desktopScreenshot.publicUrl;

    // Fallback to any screenshot
    const anyScreenshot = reportData.screenshots[0];
    return anyScreenshot?.url || anyScreenshot?.publicUrl || null;
}
