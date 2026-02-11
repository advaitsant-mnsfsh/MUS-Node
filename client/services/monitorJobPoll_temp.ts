/**
 * Polling-based fallback for monitoring jobs
 */
export const monitorJobPoll = (jobId: string, callbacks: StreamCallbacks): (() => void) => {
    const { onStatus, onData, onComplete, onError, onClose } = callbacks;
    let isPolling = true;
    const sentKeys = new Set<string>();
    const sentLogs = (callbacks as any)._sentLogs || new Set<string>();
    (callbacks as any)._sentLogs = sentLogs;

    const stopPolling = () => {
        isPolling = false;
    };

    const checkStatus = async () => {
        if (!isPolling) return;

        try {
            const { authenticatedFetch } = await import('../lib/authenticatedFetch');
            const { getBackendUrl } = await import('./config');

            const statusUrl = `${getBackendUrl()}/api/v1/audit?mode=stream-job&jobId=${jobId}`;
            const response = await authenticatedFetch(`${statusUrl}&t=${Date.now()}`);

            if (!response.ok) {
                if (response.status === 401) throw new Error("Unauthorized");
                if (response.status === 404) throw new Error("Job not found");
                throw new Error(`Status check failed: ${response.status}`);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
            }

            const job = await response.json();

            // --- 1. Fetch Logs ---
            try {
                const logsResponse = await authenticatedFetch(`${getBackendUrl()}/api/public/jobs/${jobId}/logs?t=${Date.now()}`);
                if (logsResponse.ok) {
                    const logsContentType = logsResponse.headers.get("content-type");
                    if (logsContentType && logsContentType.includes("application/json")) {
                        const logsData = await logsResponse.json();
                        const logs = logsData.logs || [];

                        if (logs.length > 0) {
                            const chronologicalLogs = [...logs].reverse();
                            chronologicalLogs.forEach((log: any) => {
                                const logKey = log.id || `${log.timestamp}-${log.message}`;
                                if (!sentLogs.has(logKey)) {
                                    onStatus(log.message);
                                    sentLogs.add(logKey);
                                }
                            });

                            const latestLog = logs[0];
                            if (latestLog.message && latestLog.message !== (callbacks as any)._lastStatusText) {
                                onStatus(latestLog.message);
                                (callbacks as any)._lastStatusText = latestLog.message;
                            }
                        }
                    }
                }
            } catch (logErr) {
                console.warn(`[Poll] Could not fetch logs:`, logErr);
            }

            // 2. Data Updates
            if (job.report_data) {
                Object.entries(job.report_data).forEach(([key, value]) => {
                    if (key !== 'logs' && !sentKeys.has(key)) {
                        onData({ key, data: value });
                        sentKeys.add(key);
                    }
                });
            }

            // 3. Completion / Failure
            if (job.status === 'completed') {
                onStatus('Audit completed!');
                onComplete({ auditId: job.id, resultUrl: job.report_data?.result_url || null });
                isPolling = false;
                onClose();
                return;
            }

            if (job.status === 'failed') {
                onError(job.errorMessage || 'Audit failed');
                isPolling = false;
                onClose();
                return;
            }

            if (isPolling) {
                setTimeout(checkStatus, 3000);
            }

        } catch (e: any) {
            console.error("Poll Error:", e);
            onError(e.message || "Polling failed");
            isPolling = false;
            onClose();
        }
    };

    checkStatus();
    return stopPolling;
};
