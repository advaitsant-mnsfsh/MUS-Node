import { supabase } from '../lib/supabase';

export interface UserAudit {
    id: string;
    created_at: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    input_data: any;
    report_data?: any; // Optional - not fetched on dashboard for performance
    error_message?: string;
    api_key_id?: string | null; // API key used for this audit (null = direct website audit)
}

/**
 * Fetch all audits for the currently logged-in user
 */
export async function getUserAudits(): Promise<UserAudit[]> {
    try {
        // Use getSession instead of getUser (faster - uses cached session)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
            console.error('[getUserAudits] Not authenticated:', sessionError);
            return [];
        }

        // Fetch audits WITHOUT report_data (massive performance improvement)
        // Dashboard only needs: id, status, dates, input URLs
        // Score and screenshots are nice-to-have but not worth 30+ second load times
        const { data, error } = await supabase
            .from('audit_jobs')
            .select('id, created_at, status, input_data, error_message, api_key_id')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(50); // Limit to 50 most recent audits

        if (error) {
            console.error('[getUserAudits] Fetch error:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('[getUserAudits] Unexpected error:', err);
        return [];
    }
}


/**
 * Fetch just the inputs for a specific audit (useful if missing from storage JSON)
 */
export async function getAuditInputs(auditId: string): Promise<any | null> {
    try {
        const { data, error } = await supabase
            .from('audit_jobs')
            .select('input_data')
            .eq('id', auditId)
            .single();

        if (error || !data) return null;
        return data.input_data; // Returns { inputs: [...], auditMode: ... }
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

    const { inputs, auditMode } = inputData;
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

    const { inputs, auditMode } = inputData;
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
