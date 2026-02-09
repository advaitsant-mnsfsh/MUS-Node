import { StreamChunk, AnalysisReport, ExpertKey, Screenshot, AuditInput } from '../types';

import { getBackendUrl } from './config';
const apiUrl = getBackendUrl();

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
const functionUrl = `${apiUrl}/api/v1/audit`;


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

export const monitorJobPoll = async (jobId: string, callbacks: StreamCallbacks): Promise<void> => {
  const { onStatus, onData, onComplete, onError, onClose } = callbacks;
  const sentKeys = new Set<string>();
  let isPolling = true;

  try {
    const { authenticatedFetch } = await import('../lib/authenticatedFetch');
    const statusUrl = `${functionUrl}/${jobId}`;

    const checkStatus = async () => {
      if (!isPolling) return;

      try {
        const response = await authenticatedFetch(statusUrl);
        if (!response.ok) {
          if (response.status === 404) throw new Error("Job not found");
          throw new Error(`Status check failed: ${response.status}`);
        }

        const job = await response.json();

        // 1. Update Status Message
        if (job.status === 'pending') onStatus('Job is pending in queue...');
        else if (job.status === 'processing') onStatus('Audit is in progress...');

        // 2. Check for new Data
        if (job.report_data) {
          Object.entries(job.report_data).forEach(([key, value]) => {
            if (key !== 'logs' && !sentKeys.has(key)) {
              console.log(`[Poll] New Data: ${key}`);
              onData({ key, data: value });
              sentKeys.add(key);
            }
          });

          // 2b. Check for new Logs/Status messages
          if (job.report_data.logs && Array.isArray(job.report_data.logs)) {
            const logs = job.report_data.logs;
            if (logs.length > 0) {
              const latestLog = logs[logs.length - 1];
              // Use a local ref or closure variable to track last log sent
              // For simplicity in this poll loop, we check against a closure variable
              if (latestLog.message && (latestLog.message !== (callbacks as any)._lastStatus)) {
                onStatus(latestLog.message);
                (callbacks as any)._lastStatus = latestLog.message;
              }
            }
          }
        }

        // 3. Handle Completion
        if (job.status === 'completed') {
          onStatus('Audit completed!');
          onComplete({
            auditId: job.jobId,
            resultUrl: job.resultUrl
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

    // 3. Monitor Job via Polling
    await monitorJobPoll(jobId, callbacks);

  } catch (e) {
    console.error('Audit process failed:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    onError(errorMessage);
    onClose();
  }
};
