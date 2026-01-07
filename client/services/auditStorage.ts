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

