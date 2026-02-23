import axios from 'axios';
import { getBackendUrl } from './config';

const API_BASE_URL = `${getBackendUrl()}/api/v1`;

export interface AdminAuditLog {
    message: string;
    created_at: string;
}

export interface AdminAudit {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    audit_type: 'standard' | 'competitor';
    input_data: {
        inputs: Array<{ url: string; device?: string; customName?: string }>;
        auditMode?: string;
        competitor?: { url: string; device?: string };
    };
    created_at: string;
    email_opt_in: boolean;
    email_opt_in_offered?: boolean;
    opt_in_email: string | null;
    user_name: string | null;
    user_email: string | null;
    thumbnail_url?: string | null;
    browser_key?: number | null;
    priority?: number | null;
    queue_position?: number | null;
    logs: AdminAuditLog[];
}

export const adminService = {
    async fetchAudits(password: string, params?: { q?: string; searchType?: string; status?: string }): Promise<AdminAudit[]> {
        const response = await axios.get(`${API_BASE_URL}/admin/audits`, {
            params,
            headers: {
                'x-admin-password': password
            }
        });
        return response.data.audits;
    },

    async fetchFeedback(password: string): Promise<any[]> {
        const response = await axios.get(`${API_BASE_URL}/feedback`, {
            headers: {
                'x-admin-password': password
            }
        });
        return response.data;
    },

    async fetchAuditReport(password: string, jobId: string): Promise<any> {
        const response = await axios.get(`${API_BASE_URL}/admin/audits/${jobId}/report`, {
            headers: {
                'x-admin-password': password
            }
        });
        return response.data.report_data;
    }
};
