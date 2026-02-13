import { BrowserPoolService } from './browserPoolService.js';
import { QueueService } from './queueService.js';
import { JobProcessor } from './jobProcessor.js';
import { JobService } from './jobService.js';

export class WorkerService {
    private static isRunning = false;
    private static pollInterval = 5000; // 5 seconds

    static async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log(`[WorkerService] 🚀 Background worker started. Polling every ${this.pollInterval}ms`);

        // Cleanup stuck jobs from previous session on start
        await QueueService.cleanupStuckJobs();

        this.runLoop();
    }

    private static async runLoop() {
        while (this.isRunning) {
            try {
                // 1. Check if we have an available browser key
                const browser = await BrowserPoolService.acquireKey();

                if (browser) {
                    // 2. Fetch the next job from the queue
                    const nextJob = await QueueService.getNextJob();

                    if (nextJob) {
                        console.log(`[WorkerService] 🎯 Found Job: ${nextJob.job_id}. Assigning to Browser ${browser.key}`);

                        // 3. Mark as processing in both Queue and Job tables
                        await QueueService.startProcessing(nextJob.id, browser.key);
                        await JobService.updateJobStatus(nextJob.job_id, 'processing');
                        await BrowserPoolService.logAction(browser.key, nextJob.job_id, 'acquired');

                        // 4. Trigger processing (in background so worker can handle next if keys allow)
                        // Note: We don't await JobProcessor here so the worker can immediately check if OTHER keys are free
                        this.executeJob(nextJob.id, nextJob.job_id, browser);
                    } else {
                        // No jobs, wait and try again
                    }
                }
            } catch (error) {
                console.error(`[WorkerService] 💥 Loop Error:`, error);
            }

            await new Promise(resolve => setTimeout(resolve, this.pollInterval));
        }
    }

    private static async executeJob(queueId: string, jobId: string, browser: { key: number; endpoint: string }) {
        let isBrowserReleased = false;

        // Scoped release function to pass to JobProcessor
        const releaseBrowser = async () => {
            if (isBrowserReleased) return;
            isBrowserReleased = true;
            console.log(`[WorkerService] [${jobId}] 🔓 Releasing Browser ${browser.key} early after scraping.`);
            await BrowserPoolService.logAction(browser.key, jobId, 'released');
        };

        try {
            await JobProcessor.processJob(jobId, browser.endpoint, releaseBrowser);
            await QueueService.completeJob(queueId, true);
        } catch (err: any) {
            console.error(`[WorkerService] ❌ Job ${jobId} failed:`, err);
            await QueueService.completeJob(queueId, false, err.message);
            // Ensure status is updated in AuditJobs so UI stops spinning
            try {
                await JobService.updateJobStatus(jobId, 'failed', null, err.message);
            } catch (jobUpdateErr) {
                console.error(`[WorkerService] Failed to update Job status to failed for ${jobId}:`, jobUpdateErr);
            }
        } finally {
            // Safety: Ensure browser is released even if scrape failed or error occurred
            await releaseBrowser();
        }
    }
}
