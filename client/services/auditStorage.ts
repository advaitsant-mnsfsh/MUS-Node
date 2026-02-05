import { AnalysisReport, Screenshot } from '../types';
import { supabase } from '../lib/supabase';

// Supabase client is now imported from lib/supabase to share auth state

export interface SharedAuditData {
    id: string;
    url: string;
    report: AnalysisReport;
    screenshots: Screenshot[];
    screenshotMimeType: string;
    whiteLabelLogo?: string | null;
    createdAt: string;
}

/**
 * Save audit data to Supabase 'audits' table (Unified Storage)
 * Returns the unique audit ID
 */
export async function saveSharedAudit(data: {
    url: string;
    report: AnalysisReport;
    screenshots: Screenshot[];
    screenshotMimeType: string;
    whiteLabelLogo?: string | null;
}): Promise<string> {

    // We only store the primary screenshot URL in the simple 'audits' schema
    const primaryScreenshot = data.screenshots.find(s => !s.isMobile)?.url || '';

    // Insert into 'audits' table
    const { data: record, error } = await supabase
        .from('audits')
        .insert({
            url: data.url,
            report_data: data.report,
            screenshot_url: primaryScreenshot
            // Note: whiteLabelLogo is not currently persisted in the simple schema
        })
        .select('id')
        .single();

    if (error) {
        console.error('Error saving shared audit to DB:', error);
        throw new Error(`Failed to save audit: ${error.message}`);
    }

    return record.id;
}

/**
 * Retrieve shared audit data by ID from the DB
 * Returns null if not found
 */
export async function getSharedAudit(auditId: string): Promise<SharedAuditData | null> {

    // Fetch from 'audits' table
    const { data: auditRecord, error } = await supabase
        .from('audits')
        .select('*')
        .eq('id', auditId)
        .single();

    if (error) {
        console.error('Error fetching audit from DB:', error);
        return null;
    }

    if (!auditRecord) {
        return null;
    }

    // Map DB fields to Frontend Interface
    const screenshots: Screenshot[] = [{
        url: auditRecord.screenshot_url,
        isMobile: false, // Defaulting to desktop for API audits
        path: '', // Not needed for display
        data: '' // Required by type, but unused when URL is present
    }];

    return {
        id: auditRecord.id,
        url: auditRecord.url,
        report: auditRecord.report_data,
        screenshots: screenshots,
        screenshotMimeType: 'image/jpeg', // Default for backend API
        whiteLabelLogo: null,
        createdAt: auditRecord.created_at
    };
}


export interface AuditJobData {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    report_data?: any;
    error_message?: string;
    redirectUrl?: string; // Optional if you need to know where it would have gone
    inputs?: any[]; // AuditInput[] array
}

export async function getAuditJob(jobId: string): Promise<AuditJobData | null> {
    try {
        // Fetch from 'shared-audits' Storage Bucket (Public JSON file)
        // This is much more reliable than database/API calls for public sharing
        const fileName = `${jobId}.json`;
        const { data, error } = await supabase.storage
            .from('shared-audits')
            .download(fileName);

        if (error) {
            // Fallback: Try the API endpoint if file missing (migration support)
            console.log('Storage fetch failed (expected if new job or private), using API fallback...', error.message);
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
            const response = await fetch(`${backendUrl}/api/public/jobs/${jobId}`);
            if (response.ok) {
                const apiData = await response.json();
                return {
                    id: apiData.id,
                    status: apiData.status,
                    report_data: apiData.report_data,
                    error_message: apiData.error_message,
                    inputs: apiData.inputs // Capture inputs from API
                };
            }
            return null;
        }

        const text = await data.text();
        const reportJson = JSON.parse(text);

        // The storage file IS the report data (contains url, screenshots, and expert data)
        // CHECK: Does the storage JSON contain 'inputs'? If created by backend it might.
        // If not, we rely on reportJson itself which is the report_data.
        return {
            id: jobId,
            status: 'completed', // If file exists, it's completed
            report_data: reportJson,  // The entire JSON is the report data
            inputs: reportJson.inputs // Try to read inputs from the stored JSON wrapper if it exists
        };

    } catch (error) {
        console.error('Error fetching job from storage:', error);
        return null;
    }
}

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/**
 * Transfer audit ownership from guest/null user to logged-in user
 * Uses Backend API to bypass RLS restrictions
 */
export async function transferAuditOwnership(auditId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    console.log(`[auditStorage] Request received: Transfer Audit ${auditId} -> User ${userId}`);

    try {
        // Get auth token for API request
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
            console.error('[auditStorage] ❌ Cannot transfer: No auth token available.');
            return { success: false, error: "No auth token" };
        }

        // Call Backend API
        const response = await fetch(`${backendUrl}/api/audit/claim`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ auditId })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            console.error('[auditStorage] ❌ API Error transferring ownership:', result.error);
            return { success: false, error: result.error || 'API Failed' };
        }

        console.log(`[auditStorage] ✅ Successfully transferred audit ${auditId} to user ${userId} (via Admin API)`);
        return { success: true };

    } catch (error) {
        console.error('[auditStorage] 💥 Unexpected Error in transferAuditOwnership:', error);
        return { success: false, error: String(error) };
    }
}
