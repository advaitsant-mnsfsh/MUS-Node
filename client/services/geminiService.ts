import { StreamChunk, AnalysisReport, ExpertKey, Screenshot, AuditInput } from '../types';

import { getBackendUrl } from './config';

interface StreamCallbacks {
  onScrapeComplete: (screenshots: Screenshot[], screenshotMimeType: string) => void;
  onPerformanceError?: (message: string) => void;
  onStatus: (message: string) => void;
  onJobCreated?: (jobId: string) => void; // New callback
  onData: (chunk: any) => void;
  onComplete: (payload: any) => void;
  onError: (message: string) => void;
  onClose: () => void;
}

interface AnalyzeParams {
  inputs: AuditInput[];
  auditMode?: 'standard' | 'competitor';
  token?: string; // Optional Auth Token
}

const commonHeaders = {
  'Content-Type': 'application/json',
};

// Helper to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export const monitorJobPoll = (jobId: string, callbacks: StreamCallbacks): (() => void) => {
  const { onStatus, onData, onComplete, onError, onClose } = callbacks;
  const sentKeys = new Set<string>();
  let isPolling = true;

  const stopPolling = () => {
    isPolling = false;
  };

  (async () => {
    try {
      const { authenticatedFetch } = await import('../lib/authenticatedFetch');
      const statusUrl = `${getBackendUrl()}/api/public/jobs/${jobId}`;

      const sentLogs = (callbacks as any)._sentLogs || new Set<string>();
      (callbacks as any)._sentLogs = sentLogs;

      const checkStatus = async () => {
        if (!isPolling) return;

        try {
          // Use cache-buster to ensure we get fresh status
          const response = await authenticatedFetch(`${statusUrl}?t=${Date.now()}`);
          console.log(`[Poll] ${jobId} Status: ${response.status}`);

          if (!response.ok) {
            if (response.status === 401) throw new Error("Unauthorized");
            if (response.status === 404) throw new Error("Job not found");
            throw new Error(`Status check failed: ${response.status}`);
          }

          const job = await response.json();

          // --- 1. Fetch High-Frequency Logs with Cache Buster ---
          try {
            const logsResponse = await authenticatedFetch(`${getBackendUrl()}/api/public/jobs/${jobId}/logs?t=${Date.now()}`);
            if (logsResponse.ok) {
              const logsData = await logsResponse.json();
              const logs = logsData.logs || [];

              if (logs.length > 0) {
                // Logs are descending, so index 0 is latest
                const latestLog = logs[0];

                // Process ONLY new logs chronologically for milestones
                const chronologicalLogs = [...logs].reverse();

                chronologicalLogs.forEach((log: any) => {
                  const logKey = log.id || `${log.timestamp}-${log.message}`;
                  if (!sentLogs.has(logKey)) {
                    console.log(`[Poll] 📝 NEW LOG: ${log.message}`);
                    onStatus(log.message);
                    sentLogs.add(logKey);
                  }
                });

                // Always ensure the UI reflects the absolute latest message in the table
                if (latestLog.message && latestLog.message !== (callbacks as any)._lastStatusText) {
                  onStatus(latestLog.message);
                  (callbacks as any)._lastStatusText = latestLog.message;
                }
              }
            }
          } catch (logErr) {
            console.warn(`[Poll] Could not fetch dedicated logs:`, logErr);
          }

          // 2. Update Status Message (Fallback only if no logs yet)
          if (job.status === 'pending') {
            onStatus('Waiting in queue...');
          } else if (job.status === 'processing' && sentLogs.size === 0) {
            onStatus('Initializing audit agents...');
          }

          // 3. Check for new Data
          if (job.report_data) {
            Object.entries(job.report_data).forEach(([key, value]) => {
              if (key !== 'logs' && !sentKeys.has(key)) {
                onData({ key, data: value });
                sentKeys.add(key);
              }
            });
          }

          // 3. Handle Completion
          if (job.status === 'completed') {
            onStatus('Audit completed!');
            onComplete({
              auditId: job.id,
              resultUrl: job.report_data?.result_url || null
            });
            isPolling = false;
            onClose();
            return;
          }

          // 4. Handle Failure
          if (job.status === 'failed') {
            const msg = job.errorMessage || 'Audit failed';
            onError(msg);
            isPolling = false;
            onClose();
            return;
          }

          // Poll again in 2 seconds
          if (isPolling) {
            setTimeout(checkStatus, 2000);
          }

        } catch (e: any) {
          console.error("Poll Error:", e);
          onError(e.message || "Polling failed");
          isPolling = false;
          onClose();
        }
      };

      // Start Polling
      checkStatus();

    } catch (e) {
      console.error('Monitor poll setup failed:', e);
      onError(e instanceof Error ? e.message : 'Setup failed');
      onClose();
    }
  })();

  return stopPolling;
};

export const analyzeWebsiteStream = async (
  { inputs, auditMode = 'standard' }: AnalyzeParams,
  callbacks: StreamCallbacks
): Promise<void> => {
  const { onScrapeComplete, onStatus, onData, onJobCreated, onComplete, onError, onClose, onPerformanceError } = callbacks;

  try {
    // 1. Prepare Inputs
    onStatus('Preparing audit inputs...');
    const processedInputs: any[] = [];

    for (const input of inputs) {
      if (input.type === 'upload' && (input.file || input.files?.length)) {
        const filesData: string[] = [];
        const files = input.files || [input.file!];
        for (const f of files) {
          if (f) filesData.push(await fileToBase64(f));
        }
        processedInputs.push({ ...input, filesData, file: undefined, files: undefined });
      } else {
        processedInputs.push(input);
      }
    }

    // 2. Create Job
    onStatus('Starting audit job...');

    const { authenticatedFetch } = await import('../lib/authenticatedFetch');
    const startResponse = await authenticatedFetch(`${getBackendUrl()}/api/v1/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'start-audit', inputs: processedInputs, auditMode })
    });

    if (!startResponse.ok) {
      throw new Error(`Failed to start audit: ${startResponse.statusText}`);
    }

    const { jobId } = await startResponse.json();
    if (onJobCreated) onJobCreated(jobId);
    onStatus('Audit job created. Waiting for worker...');

    // 3. Monitor Job via Polling (it now returns a stop func, but we don't need it here as it terminates naturally)
    monitorJobPoll(jobId, callbacks);

  } catch (e) {
    console.error('Audit process failed:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    onError(errorMessage);
    onClose();
  }
};
