import { createClient } from '@supabase/supabase-js';
import { AnalysisReport, Screenshot } from '../types';

// Supabase client (reusing existing credentials)
const supabaseUrl = 'https://sobtfbplbpvfqeubjxex.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvYnRmYnBsYnB2ZnFldWJqeGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNDgzMDYsImV4cCI6MjA3NDcyNDMwNn0.ewfxDwlapmRpfyvYD3ALb-WyL12ty1eP8nzKyrc66ho';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
                    error_message: apiData.error_message
                };
            }
            return null;
        }

        const text = await data.text();
        const reportJson = JSON.parse(text);

        // Extract the actual report object if nested (common in storage files)
        const actualReport = reportJson.report || reportJson.report_data || reportJson;

        return {
            id: jobId,
            status: 'completed', // If file exists, it's completed
            report_data: actualReport
        };

    } catch (error) {
        console.error('Error fetching job from storage:', error);
        return null;
    }
}
