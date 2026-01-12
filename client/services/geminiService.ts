import { StreamChunk, AnalysisReport, ExpertKey, Screenshot, AuditInput } from '../types';

// --- Supabase Client Details ---
// These values have been configured with your Supabase project details.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// -----------------------------

interface StreamCallbacks {
  onScrapeComplete: (screenshots: Screenshot[], screenshotMimeType: string) => void;
  onPerformanceError?: (message: string) => void;
  onStatus: (message: string) => void;
  onData: (chunk: any) => void;
  onComplete: (payload: any) => void;
  onError: (message: string) => void;
  onClose: () => void;
}

interface AnalyzeParams {
  inputs: AuditInput[];
}

const commonHeaders = {
  'Content-Type': 'application/json',
  // 'Authorization': `Bearer ${supabaseAnonKey}`, // Node server might not need this or might expect it
  // 'apikey': supabaseAnonKey,
};
const functionUrl = `${apiUrl}/api/audit`;


const processSingleAnalysisStream = async (
  body: any,
  key: ExpertKey,
  { onStatus, onData, onError }: StreamCallbacks,
  finalReport: AnalysisReport
) => {
  const expertName = key.split(' ')[0];
  try {
    onStatus(`Running ${expertName} Audit`);

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: commonHeaders,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Analysis request failed for ${expertName}: ${response.status} ${errorText}`);
    }

    if (!response.body) {
      throw new Error(`Response body is null for ${expertName} analysis.`);
    }

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
          const parsedChunk: StreamChunk = JSON.parse(line);
          if (parsedChunk.type === 'data') {
            onData(parsedChunk.payload);
            finalReport[parsedChunk.payload.key] = parsedChunk.payload.data;
          } else if (parsedChunk.type === 'error') {
            throw new Error(parsedChunk.message);
          }
        } catch (e) {
          console.error(`Failed to parse stream chunk for ${expertName}:`, line, e);
        }
      }
    }
    onStatus(`✓ ${expertName} Audit analysis complete`);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    onError(`An error occurred during the ${expertName} Audit: ${errorMessage}`);
    throw e;
  }
};

export const analyzeWebsiteStream = async (
  { inputs }: AnalyzeParams,
  callbacks: StreamCallbacks
): Promise<void> => {
  const { onScrapeComplete, onStatus, onData, onComplete, onError, onClose, onPerformanceError } = callbacks;
  const finalReport: AnalysisReport = {};

  try {
    const allScreenshots: Screenshot[] = [];
    let aggregatedLiveText = '';
    let performanceData = null;
    let performanceAnalysisError = null;
    let animationData: any[] = [];
    let accessibilityData: any = null;
    let axeViolations: any[] = [];
    let axePasses: any[] = [];
    let axeIncomplete: any[] = [];
    let axeInapplicable: any[] = [];

    // --- Phase 1: Data Acquisition (Mixed URL/Upload) ---
    onStatus('Processing mixed inputs (URLs & Uploads)...');

    let successfulAcquisitions = 0;

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const isPrimary = i === 0;

      if (input.type === 'url' && input.url) {
        // --- URL SCRAPING ---
        onStatus(`Scraping URL ${i + 1}/${inputs.length}: ${input.url}`);

        // We only need 1 screenshot per URL in mixed mode to save time, or we can do mobile too.
        // Let's stick to Desktop only per URL for mixed mode simplicity? 
        // Or keep original logic: URLs get desktop+mobile?
        // To keep simple: Desktop Screenshot for all. Mobile only for first URL if it's a URL.
        const tasks = [{ url: input.url, isMobile: false }];
        if (isPrimary) tasks.push({ url: input.url, isMobile: true });

        // Run scrape tasks in parallel
        // Run scrape tasks sequentially to avoid 429/Concurrency limits
        for (const task of tasks) {
          try {
            const response = await fetch(functionUrl, {
              method: 'POST',
              headers: commonHeaders,
              body: JSON.stringify({ ...task, mode: 'scrape-single-page' }),
            });

            if (!response.ok) throw new Error("Scrape failed");

            const result = await response.json();

            // Push to shared array safely
            allScreenshots.push(result.screenshot);

            if (!result.screenshot.isMobile) {
              // Append text (order might vary, but that's acceptable for context)
              aggregatedLiveText += `\n\n--- CONTENT FROM ${input.url} ---\n${result.liveText || '(No text found)'}\n\n`;
              if (isPrimary) {
                animationData = result.animationData;
                accessibilityData = result.accessibilityData;
                axeViolations = result.axeViolations || [];
                axePasses = result.axePasses || [];
                axeIncomplete = result.axeIncomplete || [];
                axeInapplicable = result.axeInapplicable || [];
              }
            }
            successfulAcquisitions++;
          } catch (e) {
            console.error(e);
            onStatus(`⚠️ Failed to scrape ${input.url} (${task.isMobile ? 'Mobile' : 'Desktop'}). Skipping.`);
          }
        }

        // Performance check only for Primary URL
        // Performance check only for Primary URL
        if (isPrimary) {
          try {
            onStatus(`Checking performance for ${input.url}...`);
            const perfResponse = await fetch(functionUrl, {
              method: 'POST',
              headers: commonHeaders,
              body: JSON.stringify({ url: input.url, mode: 'scrape-performance' }),
            });
            const res = await perfResponse.json();
            performanceData = res.performanceData;
            performanceAnalysisError = res.error;
          } catch (e: any) {
            console.error("Performance scrape failed:", e);
            performanceAnalysisError = e.message;
          }
        }

      } else if (input.type === 'upload') {
        // --- UPLOAD PROCESSING ---
        // Support multiple files
        if (input.filesData && input.filesData.length > 0) {
          onStatus(`Processing uploads for item ${i + 1}...`);
          input.filesData.forEach((base64Data, idx) => {
            allScreenshots.push({
              path: `upload-${i}-${idx}.png`,
              data: base64Data,
              isMobile: false
            });
          });
          aggregatedLiveText += `\n\n--- CONTEXT FOR UPLOADS ${i + 1} ---\n(User Snapshots)\n\n`;
          successfulAcquisitions++;

        } else if (input.fileData) {
          // Fallback single
          onStatus(`Processing upload ${i + 1}/${inputs.length}...`);
          allScreenshots.push({
            path: `upload-${i}.png`,
            data: input.fileData,
            isMobile: false
          });
          aggregatedLiveText += `\n\n--- CONTEXT FOR UPLOAD ${i + 1} ---\n(User Snapshot)\n\n`;
          successfulAcquisitions++;
        }
      }
    }

    if (successfulAcquisitions === 0) {
      throw new Error("Failed to acquire data from any source.");
    }

    const primaryUrl = inputs[0].type === 'url' ? inputs[0].url! : 'Manual Upload';

    // Notify UI
    onScrapeComplete(allScreenshots, 'image/png');
    onStatus('✓ Data acquired. Beginning AI analysis...');



    // --- Phase 2: Analyze Data & Upload Resources (PARALLEL) ---
    const primaryScreenshot = allScreenshots[0]; // Logic: Use first available
    const primaryMobileScreenshot = allScreenshots.find(s => s.isMobile);

    // Collect all desktop screenshots for combined analysis
    const allDesktopScreenshots = allScreenshots.filter(s => !s.isMobile);
    const allDesktopScreenshotsBase64 = allDesktopScreenshots.map(s => s.data).filter(Boolean);

    // 1. Start Uploads in Background
    onStatus('Uploading resources in background...');
    const uploadPromise = (async () => {
      try {
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: commonHeaders,
          body: JSON.stringify({ screenshots: allScreenshots, mode: 'upload-screenshots' }),
        });
        if (!response.ok) throw new Error("Upload failed");
        const data = await response.json();
        return data.uploadedScreenshots; // Returns array with URLs
      } catch (e) {
        console.error("Background upload failed:", e);
        throw e;
      }
    })();

    const analysisExperts: ExpertKey[] = [
      'Strategy Audit expert',
      'UX Audit expert',
      'Product Audit expert',
      'Visual Audit expert',
      'Accessibility Audit expert',
    ];

    // BUFFERING LOGIC: Capture data updates to show all at once
    const bufferedUpdates: any[] = [];
    const internalOnData = (payload: any) => {
      bufferedUpdates.push(payload);
    };
    const bufferedCallbacks = { ...callbacks, onData: internalOnData };

    const analysisPromises = analysisExperts.map(async (expertKey) => {
      const expertShortName = expertKey.split(' ')[0].toLowerCase();
      const mode = `analyze-${expertShortName}`;

      const analysisBody = {
        url: primaryUrl,
        screenshotBase64: primaryScreenshot?.data,
        allScreenshotsBase64: allDesktopScreenshotsBase64,
        mobileScreenshotBase64: primaryMobileScreenshot?.data,
        liveText: aggregatedLiveText,
        performanceData,
        screenshotMimeType: 'image/png',
        performanceAnalysisError,
        animationData,
        accessibilityData,
        axeViolations,
        axePasses,
        axeIncomplete,
        axeInapplicable,
        mode,
      };

      try {
        await processSingleAnalysisStream(analysisBody, expertKey, bufferedCallbacks, finalReport);
      } catch (error) {
        console.error(`Analysis failed for ${expertKey}:`, error);
        onStatus(`⚠️ ${expertKey.split(' ')[0]} analysis skipped due to error.`);
      }
    });

    onStatus('Running comprehensive AI analysis on all sections...');
    await Promise.all(analysisPromises);

    // --- Phase 2.5: Contextual Ranking of Issues ---
    onStatus('Analyzing issues for strategic impact...');
    try {
      const contextualRankResponse = await fetch(functionUrl, {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify({ report: finalReport, mode: 'contextual-rank' }),
      });

      if (!contextualRankResponse.ok) {
        // Warning logic
      } else {
        const contextualIssues = await contextualRankResponse.json();
        // Buffer this too
        internalOnData({ key: 'Top5ContextualIssues', data: contextualIssues });
      }
    } catch (e) {
      console.warn(e);
    }

    // --- RELEASE THE BUFFER (Show all results at once) ---
    onStatus('Compiling final report view...');
    bufferedUpdates.forEach(payload => {
      onData(payload);
    });

    onStatus('✓ All analyses complete. Finalizing report...');

    // Wait for uploads to finish if they haven't already
    let uploadedScreenshotsWithUrls = [];
    try {
      uploadedScreenshotsWithUrls = await uploadPromise;
      // Merge URLs back into finalReport if needed or just pass to save
      // The report itself usually doesn't strictly need the URLs inside the JSON unless we want them there.
      // Let's ensure the report object has what it needs.
      finalReport.screenshots = uploadedScreenshotsWithUrls;
    } catch (e) {
      onStatus('⚠️ background upload failed, retrying in final step...');
      // Fallback or fail? If upload failed, we can't save effectively.
      throw new Error("Failed to upload screenshots.");
    }

    // --- Phase 3: Finalize Report ---
    const finalizeResponse = await fetch(functionUrl, {
      method: 'POST',
      headers: commonHeaders,
      body: JSON.stringify({
        report: finalReport,
        screenshots: uploadedScreenshotsWithUrls,
        url: primaryUrl,
        mode: 'save-audit'
      }),
    });

    if (!finalizeResponse.ok) {
      throw new Error("Finalize failed");
    }

    const finalData = await finalizeResponse.json();
    onComplete(finalData);

  } catch (e) {
    console.error('Audit process failed:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    onError(errorMessage);
  } finally {
    onClose();
  }
};
