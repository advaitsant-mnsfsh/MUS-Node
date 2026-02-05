import { supabase } from '../lib/supabase';

export interface CreateJobParams {
    apiKeyId?: string; // Made optional for guest/demo usage
    userId?: string;   // Optional Link to Supabase User
    inputData: any;
}

export class JobService {
    static async createJob(params: CreateJobParams) {
        const { data, error } = await supabase
            .from('audit_jobs')
            .insert({
                api_key_id: params.apiKeyId || null,
                user_id: params.userId || null,
                status: 'pending',
                input_data: params.inputData,
            })
            .select('id')
            .single();

        if (error) throw new Error(`Failed to create job: ${error.message}`);
        return data;
    }

    static async updateJobStatus(jobId: string, status: 'processing' | 'completed' | 'failed', result?: any, errorMsg?: string, resultUrl?: string) {
        const updatePayload: any = { status, updated_at: new Date().toISOString() };
        if (result) updatePayload.report_data = result;
        if (errorMsg) updatePayload.error_message = errorMsg;
        if (resultUrl) updatePayload.result_url = resultUrl;

        const { error } = await supabase
            .from('audit_jobs')
            .update(updatePayload)
            .eq('id', jobId);

        if (error) console.error(`Failed to update job ${jobId}:`, error);
    }

    static async updateProgress(jobId: string, message: string, partialData?: any) {
        // Fetch current to merge
        const current = await this.getJob(jobId);
        if (!current) return;

        const currentReport = current.report_data || {};
        const logs = currentReport.logs || [];
        logs.push({ timestamp: new Date().toISOString(), message });

        const newReport = {
            ...currentReport,
            ...partialData,
            logs
        };

        await supabase
            .from('audit_jobs')
            .update({
                report_data: newReport,
                updated_at: new Date().toISOString()
            })
            .eq('id', jobId);
    }

    static async getJob(jobId: string) {
        const { data, error } = await supabase
            .from('audit_jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (error) {
            // console.error(`[JobService] getJob failed for ${jobId}:`, error);
            return null; // Return null if not found/error to allow handling gracefully
        }
        return data;
    }
}
