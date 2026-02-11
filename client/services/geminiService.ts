import { StreamChunk, AnalysisReport, ExpertKey, Screenshot, AuditInput } from '../types';

const apiUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://mus-node-production.up.railway.app' : 'http://localhost:3000');

interface StreamCallbacks {
  onScrapeComplete: (screenshots: Screenshot[], screenshotMimeType: string) => void;
  onPerformanceError?: (message: string) => void;
  onStatus: (message: string) => void;
  onJobCreated?: (jobId: string) => void;
  onData: (chunk: any) => void;
  onComplete: (payload: any) => void;
  onError: (message: string) => void;
  onClose: () => void;
}

interface AnalyzeParams {
  inputs: AuditInput[];
  auditMode?: 'standard' | 'competitor';
  token?: string;
}

const functionUrl = `${apiUrl}/api/v1/audit`;

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

export const monitorJobStream = async (jobId: string, callbacks: StreamCallbacks): Promise<void> => {
  const { onStatus, onData, onComplete, onError, onClose } = callbacks;
  const finalReport: AnalysisReport = {};

  try {
    const streamUrl = `${functionUrl}?mode=stream-job&jobId=${jobId}`;
    console.log('[Stream] Connecting to:', streamUrl);

    // Use authenticatedFetch to ensure session token is sent
    const { authenticatedFetch } = await import('../lib/authenticatedFetch');
    const response = await authenticatedFetch(streamUrl, {
      headers: {
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

    if (!response.ok) {
      throw new Error(`Stream connection failed: ${response.status} ${response.statusText}`);
    }

    if (!response.body) throw new Error("No response body from stream");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;
        try {
          const chunk = JSON.parse(line);

          if (chunk.type === 'status') {
            onStatus(chunk.message);
          } else if (chunk.type === 'data') {
            const { key, data } = chunk.payload;
            console.log(`[Stream] Data Chunk Key: ${key}`);
            finalReport[key] = data;
            onData(chunk.payload);
          } else if (chunk.type === 'complete') {
            console.log("[Stream] Job Complete Payload:", chunk.payload);
            onComplete(chunk.payload);
            return;
          } else if (chunk.type === 'error') {
            onError(chunk.message);
            return;
          }
        } catch (e) {
          console.warn("Failed to parse chunk:", line);
        }
      }
    }
  } catch (e) {
    console.error('Monitor stream failed:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    onError(errorMessage);
  } finally {
    onClose();
  }
};

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

export const analyzeWebsiteStream = async (
  { inputs, auditMode = 'standard' }: AnalyzeParams,
  callbacks: StreamCallbacks
): Promise<void> => {
  const { onScrapeComplete, onStatus, onData, onJobCreated, onComplete, onError, onClose, onPerformanceError } = callbacks;

  try {
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

    onStatus('Starting audit job...');

    const { authenticatedFetch } = await import('../lib/authenticatedFetch');
    const startResponse = await authenticatedFetch(functionUrl, {
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

    await monitorJobStream(jobId, callbacks);

  } catch (e) {
    console.error('Audit process failed:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    onError(errorMessage);
    onClose();
  }
};
