import { StreamChunk, AnalysisReport, ExpertKey, Screenshot, AuditInput } from '../types';

// --- Supabase Client Details ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// -----------------------------

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
const functionUrl = `${apiUrl}/api/audit`;


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

export const monitorJobStream = async (jobId: string, callbacks: StreamCallbacks): Promise<void> => {
  const { onStatus, onData, onComplete, onError, onClose } = callbacks;
  const finalReport: AnalysisReport = {}; // Local aggregation for this stream session

  try {
    const streamUrl = `${functionUrl}?mode=stream-job&jobId=${jobId}`;

    const response = await fetch(streamUrl, {
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
            console.log(`[Stream] Data Chunk Key: ${key}`, key === 'screenshots' ? `(Count: ${data?.length})` : '');
            finalReport[key] = data;
            onData(chunk.payload);
          } else if (chunk.type === 'complete') {
            console.log("[Stream] Job Complete Payload:", chunk.payload);
            onComplete(chunk.payload);
            return; // Stop monitoring
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

export const analyzeWebsiteStream = async (
  { inputs, auditMode = 'standard', token }: AnalyzeParams,
  callbacks: StreamCallbacks
): Promise<void> => {
  const { onScrapeComplete, onStatus, onData, onJobCreated, onComplete, onError, onClose, onPerformanceError } = callbacks;
  const finalReport: AnalysisReport = {};

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
        processedInputs.push({ ...input, filesData, file: undefined, files: undefined }); // Remove blobs
      } else {
        processedInputs.push(input);
      }
    }

    // 2. Create Job
    onStatus('Starting audit job...');

    const headers: any = { ...commonHeaders };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const startResponse = await fetch(functionUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ mode: 'start-audit', inputs: processedInputs, auditMode })
    });

    if (!startResponse.ok) {
      throw new Error(`Failed to start audit: ${startResponse.statusText}`);
    }

    const { jobId } = await startResponse.json();
    if (onJobCreated) onJobCreated(jobId);
    onStatus('Audit job created. Waiting for worker...');

    // 3. Monitor Job Stream
    await monitorJobStream(jobId, callbacks);

  } catch (e) {
    console.error('Audit process failed:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    onError(errorMessage);
    onClose();
  }
};
