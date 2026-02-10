import { db } from '../lib/db.js';
import { auditJobs, auditJobLogs } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import crypto from 'crypto';

export interface CreateJobParams {
    apiKeyId?: string; // Made optional for guest/demo usage
    userId?: string;   // Optional Link to User
    inputData: any;
}

export class JobService {
    static async createJob(params: CreateJobParams) {
        // Drizzle Insert
        const [job] = await db.insert(auditJobs).values({
            id: crypto.randomUUID(), // Manual ID generation
            api_key_id: params.apiKeyId || undefined,
            user_id: params.userId || null,
            status: 'pending',
            input_data: params.inputData,
        }).returning({ id: auditJobs.id });

        if (!job) throw new Error("Failed to create job");
        return job;
    }

    static async updateJobStatus(jobId: string, status: 'processing' | 'completed' | 'failed', result?: any, errorMsg?: string, resultUrl?: string) {
        const updatePayload: any = { status, updated_at: new Date() };
        if (result) updatePayload.report_data = result;
        if (errorMsg) updatePayload.error_message = errorMsg;
        if (resultUrl) updatePayload.result_url = resultUrl;

        try {
            await db.update(auditJobs)
                .set(updatePayload)
                .where(eq(auditJobs.id, jobId));
        } catch (error) {
            console.error(`Failed to update job ${jobId}:`, error);
        }
    }

    static async updateProgress(jobId: string, message: string, partialData?: any) {
        console.log(`[JobService] [${jobId}] ${message}`);

        try {
            // 1. Insert into dedicated logs table (New performance-ready way)
            await db.insert(auditJobLogs).values({
                id: crypto.randomUUID(),
                job_id: jobId,
                message: message,
                level: 'info'
            });

            // 2. ALSO update the legacy JSONB column in audit_jobs (Keep as it was)
            const logEntry = {
                timestamp: new Date().toISOString(),
                message
            };

            const jsonbUpdate = sql`jsonb_set(
                COALESCE(report_data, '{}'::jsonb),
                '{logs}',
                (COALESCE(report_data->'logs', '[]'::jsonb) || ${JSON.stringify(logEntry)}::jsonb)
            )`;

            if (partialData) {
                await db.update(auditJobs)
                    .set({
                        report_data: sql`${jsonbUpdate} || ${JSON.stringify(partialData)}::jsonb`,
                        updated_at: sql`NOW()`
                    })
                    .where(eq(auditJobs.id, jobId));
            } else {
                await db.update(auditJobs)
                    .set({
                        report_data: jsonbUpdate,
                        updated_at: sql`NOW()`
                    })
                    .where(eq(auditJobs.id, jobId));
            }
        } catch (e) {
            console.error(`[JobService] Failed to update progress for ${jobId}:`, e);
        }
    }



    static async getJob(jobId: string) {
        const start = Date.now();
        try {
            // OPTIMIZATION: Select only needed columns for report rendering
            // We fetch input_data and api_key_id to ensure compatibility with JobProcessor and External API.
            const [job] = await db.select({
                id: auditJobs.id,
                status: auditJobs.status,
                api_key_id: auditJobs.api_key_id, // Required by external API
                input_data: auditJobs.input_data,
                report_data: auditJobs.report_data,
                result_url: auditJobs.result_url,   // Required by external API
                error_message: auditJobs.error_message,
                created_at: auditJobs.created_at,
                updated_at: auditJobs.updated_at
            })
                .from(auditJobs)
                .where(eq(auditJobs.id, jobId))
                .limit(1);

            const duration = Date.now() - start;
            if (duration > 500) {
                console.warn(`[JobService] getJob took ${duration}ms for ${jobId} (Payload size: ${JSON.stringify(job?.report_data).length / 1024} KB)`);
            }

            return job || null;
        } catch (error) {
            console.error(`[JobService] getJob failed for ${jobId}:`, error);
            return null;
        }
    }

}
