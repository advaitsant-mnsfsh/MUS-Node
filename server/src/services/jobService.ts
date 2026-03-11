import { db } from '../lib/db.js';
import { auditJobs, auditJobLogs } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import crypto from 'crypto';

export interface CreateJobParams {
    apiKeyId?: string; // Made optional for guest/demo usage
    userId?: string;   // Optional Link to User
    inputData: any;
    auditType?: string;
    emailOptIn?: boolean;
    optInEmail?: string;
}

export class JobService {
    private static async withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
        let lastError: any;
        for (let i = 0; i <= retries; i++) {
            try {
                return await fn();
            } catch (err: any) {
                lastError = err;
                const isTransient = err.message?.includes('Connection terminated') ||
                    err.message?.includes('client has been closed') ||
                    err.message?.includes('timeout');

                if (isTransient && i < retries) {
                    const delay = 500 * (i + 1);
                    console.warn(`[JobService] DB update failed, retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw err;
            }
        }
        throw lastError;
    }

    static async createJob(params: CreateJobParams) {
        const [job] = await db.insert(auditJobs).values({
            id: crypto.randomUUID(),
            api_key_id: params.apiKeyId || undefined,
            user_id: params.userId || null,
            status: 'pending',
            input_data: params.inputData,
            audit_type: params.auditType || 'standard',
            email_opt_in: params.emailOptIn || false,
            opt_in_email: params.optInEmail || null,
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
            await this.withRetry(() =>
                db.update(auditJobs)
                    .set(updatePayload)
                    .where(eq(auditJobs.id, jobId))
            );

            // --- 📧 Email Notification Logic ---
            if (status === 'completed') {
                const job = await db.query.auditJobs.findFirst({
                    where: eq(auditJobs.id, jobId)
                });

                if (job?.email_opt_in) {
                    const { user } = await import('../db/schema.js');
                    let targetEmail = job.opt_in_email;
                    let targetName = 'there';

                    // If job is linked to a user, get their latest email/name from DB
                    if (job.user_id) {
                        const [userData] = await db.select()
                            .from(user)
                            .where(eq(user.id, job.user_id))
                            .limit(1);

                        if (userData) {
                            targetEmail = userData.email;
                            targetName = userData.name;
                        }
                    }

                    if (targetEmail) {
                        const { sendReportReadyEmail } = await import('../lib/auth.js');
                        await sendReportReadyEmail(targetEmail, jobId, targetName);
                    }
                }
            }
        } catch (error) {
            console.error(`[JobService] 🚨 Final update failed for ${jobId} after retries:`, error);
        }
    }

    static async updateProgress(jobId: string, message: string, partialData?: any) {
        console.log(`[JobProgress] ⚡ ${message}`);

        try {
            // 1. Insert into dedicated logs table
            await this.withRetry(() =>
                db.insert(auditJobLogs).values({
                    id: crypto.randomUUID(),
                    job_id: jobId,
                    message: message,
                    level: 'info'
                })
            );

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

            await this.withRetry(() => {
                if (partialData) {
                    return db.update(auditJobs)
                        .set({
                            report_data: sql`${jsonbUpdate} || ${JSON.stringify(partialData)}::jsonb`,
                            updated_at: sql`NOW()`
                        })
                        .where(eq(auditJobs.id, jobId));
                } else {
                    return db.update(auditJobs)
                        .set({
                            report_data: jsonbUpdate,
                            updated_at: sql`NOW()`
                        })
                        .where(eq(auditJobs.id, jobId));
                }
            });
        } catch (e) {
            console.error(`[JobService] Failed to update progress for ${jobId}:`, e);
        }
    }

    static async getJob(jobId: string) {
        try {
            const [job] = await db.select({
                id: auditJobs.id,
                status: auditJobs.status,
                user_id: auditJobs.user_id,
                api_key_id: auditJobs.api_key_id,
                input_data: auditJobs.input_data,
                report_data: auditJobs.report_data,
                result_url: auditJobs.result_url,
                error_message: auditJobs.error_message,
                created_at: auditJobs.created_at,
                updated_at: auditJobs.updated_at
            })
                .from(auditJobs)
                .where(eq(auditJobs.id, jobId))
                .limit(1);

            return job || null;
        } catch (error) {
            console.error(`[JobService] getJob failed for ${jobId}:`, error);
            return null;
        }
    }
}
