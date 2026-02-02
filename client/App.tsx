import React, { useState, useCallback, useEffect } from 'react';
import {
    useParams,
    useNavigate,
    useLocation
} from 'react-router-dom';
import { URLInputForm } from './components/URLInputForm';
import { ReportDisplay } from './components/ReportDisplay';
import { AnalysisReport, Screenshot, AuditInput } from './types';
import { analyzeWebsiteStream, monitorJobStream } from './services/geminiService';
import { Logo } from './components/Logo';
import { ProgressBar } from './components/ProgressBar';
import { LottieAnimation } from './components/LottieAnimation';

const loadingMicrocopy = [
    "Analyzing UX with 250+ parameters…",
    "Pixel checks in progress...",
    "Reading your interface…",
    "Decoding design decisions…",
];

const qrCodeAnimationData = { "v": "5.12.1", "fr": 29.9700012207031, "ip": 0, "op": 97.000003950891, "w": 128, "h": 128, "nm": "Qr_code_lottie", "ddd": 0, "assets": [], "layers": [{ "ddd": 0, "ind": 1, "ty": 4, "nm": "Layer 2 Outlines", "parent": 2, "sr": 1, "ks": { "o": { "a": 0, "k": 100, "ix": 11 }, "r": { "a": 0, "k": 0, "ix": 10 }, "p": { "a": 0, "k": [49, 49, 0], "ix": 2, "l": 2 }, "a": { "a": 0, "k": [44.5, 3.5, 0], "ix": 1, "l": 2 }, "s": { "a": 0, "k": [100, 100, 100], "ix": 6, "l": 2 } }, "ao": 0, "shapes": [{ "ty": "gr", "it": [{ "ind": 0, "ty": "sh", "ix": 1, "ks": { "a": 1, "k": [{ "i": { "x": 0.13, "y": 1 }, "o": { "x": 0.87, "y": 0 }, "t": 10, "s": [{ "i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [[3.5, 3.5], [85.5, 3.5]], "c": false }] }, { "i": { "x": 0.13, "y": 1 }, "o": { "x": 0.87, "y": 0 }, "t": 25, "s": [{ "i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [[14.75, 3.5], [74.25, 3.5]], "c": false }] }, { "i": { "x": 0.13, "y": 1 }, "o": { "x": 0.87, "y": 0 }, "t": 42, "s": [{ "i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [[14.75, -26.25], [74.25, -26.25]], "c": false }] }, { "i": { "x": 0.13, "y": 1 }, "o": { "x": 0.87, "y": 0 }, "t": 62, "s": [{ "i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [[14.75, 32.25], [74.25, 32.25]], "c": false }] }, { "i": { "x": 0.13, "y": 1 }, "o": { "x": 0.87, "y": 0 }, "t": 82, "s": [{ "i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [[14.75, 3.5], [74.25, 3.5]], "c": false }] }, { "t": 92.0000037472368, "s": [{ "i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [[3.5, 3.5], [85.5, 3.5]], "c": false }] }], "ix": 2 }, "nm": "Path 1", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ty": "st", "c": { "a": 0, "k": [0, 0, 0, 1], "ix": 3 }, "o": { "a": 0, "k": 100, "ix": 4 }, "w": { "a": 0, "k": 7, "ix": 5 }, "lc": 2, "lj": 1, "ml": 4, "bm": 0, "nm": "Stroke 1", "mn": "ADBE Vector Graphic - Stroke", "hd": false }, { "ty": "tr", "p": { "a": 0, "k": [0, 0], "ix": 2 }, "a": { "a": 0, "k": [0, 0], "ix": 1 }, "s": { "a": 0, "k": [100, 100], "ix": 3 }, "r": { "a": 0, "k": 0, "ix": 6 }, "o": { "a": 0, "k": 100, "ix": 7 }, "sk": { "a": 0, "k": 0, "ix": 4 }, "sa": { "a": 0, "k": 0, "ix": 5 }, "nm": "Transform" }], "nm": "Group 1", "np": 2, "cix": 2, "bm": 0, "ix": 1, "mn": "ADBE Vector Group", "hd": false }], "ip": 0, "op": 300.00001221925, "st": 0, "ct": 1, "bm": 0 }, { "ddd": 0, "ind": 2, "ty": 4, "nm": "Layer 1 Outlines", "sr": 1, "ks": { "o": { "a": 0, "k": 100, "ix": 11 }, "r": { "a": 0, "k": 0, "ix": 10 }, "p": { "a": 0, "k": [63.5, 64.5, 0], "ix": 2, "l": 2 }, "a": { "a": 0, "k": [48.5, 48.5, 0], "ix": 1, "l": 2 }, "s": { "a": 1, "k": [{ "i": { "x": [0.13, 0.13, 0.13], "y": [1, 1, 1] }, "o": { "x": [0.87, 0.87, 0.87], "y": [0, 0, 0] }, "t": 10, "s": [100, 100, 100] }, { "i": { "x": [0.13, 0.13, 0.13], "y": [1, 1, 1] }, "o": { "x": [0.87, 0.87, 0.87], "y": [0, 0, 0] }, "t": 25, "s": [116, 116, 100] }, { "i": { "x": [0.13, 0.13, 0.13], "y": [1, 1, 1] }, "o": { "x": [0.87, 0.87, 0.87], "y": [0, 0, 0] }, "t": 42, "s": [110, 110, 100] }, { "i": { "x": [0.13, 0.13, 0.13], "y": [1, 1, 1] }, "o": { "x": [0.87, 0.87, 0.87], "y": [0, 0, 0] }, "t": 62, "s": [131, 131, 100] }, { "i": { "x": [0.13, 0.13, 0.13], "y": [1, 1, 1] }, "o": { "x": [0.87, 0.87, 0.87], "y": [0, 0, 0] }, "t": 82, "s": [110, 110, 100] }, { "t": 92.0000037472368, "s": [100, 100, 100] }], "ix": 6, "l": 2 } }, "ao": 0, "shapes": [{ "ty": "gr", "it": [{ "ind": 0, "ty": "sh", "ix": 1, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [-2.636, 2.636], [-8.485, 0], [0, 0]], "o": [[0, 0], [0, -8.485], [2.636, -2.636], [0, 0], [0, 0]], "v": [[-41.5, -20.75], [-41.5, -23.5], [-38.864, -38.864], [-23.5, -41.5], [-20.75, -41.5]], "c": false }, "ix": 2 }, "nm": "Path 1", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ind": 1, "ty": "sh", "ix": 2, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [2.636, 2.636], [0, 8.485], [0, 0]], "o": [[0, 0], [-8.485, 0], [-2.636, -2.636], [0, 0], [0, 0]], "v": [[-20.75, 41.5], [-23.5, 41.5], [-38.864, 38.864], [-41.5, 23.5], [-41.5, 20.75]], "c": false }, "ix": 2 }, "nm": "Path 2", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ind": 2, "ty": "sh", "ix": 3, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [2.636, 2.636], [8.485, 0], [0, 0]], "o": [[0, 0], [0, -8.485], [-2.636, -2.636], [0, 0], [0, 0]], "v": [[41.5, -20.75], [41.5, -23.5], [38.864, -38.864], [23.5, -41.5], [20.75, -41.5]], "c": false }, "ix": 2 }, "nm": "Path 3", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ind": 3, "ty": "sh", "ix": 4, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [2.636, -2.636], [8.485, 0], [0, 0]], "o": [[0, 0], [0, 8.485], [-2.636, 2.636], [0, 0], [0, 0]], "v": [[41.5, 20.75], [41.5, 23.5], [38.864, 38.864], [23.5, 41.5], [20.75, 41.5]], "c": false }, "ix": 2 }, "nm": "Path 4", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ty": "mm", "mm": 1, "nm": "Merge Paths 1", "mn": "ADBE Vector Filter - Merge", "hd": false }, { "ty": "st", "c": { "a": 0, "k": [0, 0, 0, 1], "ix": 3 }, "o": { "a": 0, "k": 100, "ix": 4 }, "w": { "a": 0, "k": 7, "ix": 5 }, "lc": 2, "lj": 2, "bm": 0, "nm": "Stroke 1", "mn": "ADBE Vector Graphic - Stroke", "hd": false }, { "ty": "tr", "p": { "a": 0, "k": [48.5, 48.5], "ix": 2 }, "a": { "a": 0, "k": [0, 0], "ix": 1 }, "s": { "a": 0, "k": [100, 100], "ix": 3 }, "r": { "a": 0, "k": 0, "ix": 6 }, "o": { "a": 0, "k": 100, "ix": 7 }, "sk": { "a": 0, "k": 0, "ix": 4 }, "sa": { "a": 0, "k": 0, "ix": 5 }, "nm": "Transform" }], "nm": "Group 1", "np": 6, "cix": 2, "bm": 0, "ix": 1, "mn": "ADBE Vector Group", "hd": false }], "ip": 0, "op": 300.00001221925, "st": 0, "ct": 1, "bm": 0 }], "markers": [], "props": {} }

const App: React.FC = () => {
    const [submittedUrl, setSubmittedUrl] = useState<string>('');
    const [report, setReport] = useState<AnalysisReport | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('Initiating multi-faceted audit...');
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const [screenshotMimeType, setScreenshotMimeType] = useState<string>('image/png');
    // We removed generic auditId state because we rely on URL param or current session
    // But for UI passing:
    const [uiAuditId, setUiAuditId] = useState<string | null>(null);
    const [performanceError, setPerformanceError] = useState<string | null>(null);
    const [currentMicrocopy, setCurrentMicrocopy] = useState(loadingMicrocopy[0]);
    const [progress, setProgress] = useState<number>(0);
    const [targetProgress, setTargetProgress] = useState<number>(0);
    const [whiteLabelLogo, setWhiteLabelLogo] = useState<string | null>(null);

    const { auditId } = useParams<{ auditId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // Smooth Progress Interpolation
    useEffect(() => {
        if (progress < targetProgress) {
            // Adaptive speed: If we are far behind (e.g. resume/refresh), catch up faster.
            // Otherwise, tick slowly to show distinct 1% increments.
            const diff = targetProgress - progress;
            const delay = diff > 20 ? 40 : 200;

            const timer = setTimeout(() => {
                setProgress(prev => Math.min(prev + 1, targetProgress));
            }, delay);
            return () => clearTimeout(timer);
        }
    }, [progress, targetProgress]);

    // Timing helper
    const lastLogTime = React.useRef<number>(Date.now());

    // -- Callbacks Declaration to allow reuse --
    const getStreamCallbacks = (isResuming = false) => ({
        onScrapeComplete: (newScreenshots: Screenshot[], mimeType: string) => {
            setScreenshots(newScreenshots);
            setScreenshotMimeType(mimeType);
        },
        onPerformanceError: (errorMessage: string) => {
            setPerformanceError(errorMessage);
        },
        onJobCreated: (id: string) => {
            // Update URL to /analysis/:id, passing flag to skip DB check (prevents 400 error)
            navigate(`/analysis/${id}`, { state: { newAudit: true } });
        },
        onStatus: (message: string) => {
            // If we are on /report/ page but receiving status updates (running), strict redirect to /analysis/
            if (location.pathname.includes('/report/')) {
                // We need auditId. If we are monitoring, we usually have it.
                // But getStreamCallbacks is created before we might have the param if it's a fresh start? 
                // No, fresh start uses onJobCreated. Resume uses params.
                // We can't easily access 'auditId' var here inside closure if it changes? 
                // Actually 'auditId' from useParams is available in scope.
                if (auditId) {
                    navigate(`/analysis/${auditId}`, { replace: true });
                }
            }

            // TIMING LOG
            const now = Date.now();
            const delta = ((now - lastLogTime.current) / 1000).toFixed(2);
            console.log(`[TIMING] +${delta}s : "${message}"`);
            lastLogTime.current = now;

            setLoadingMessage(message);
            // Progress Logic
            setTargetProgress(prev => {
                let newProgress = prev;
                const msg = message.toLowerCase();

                // 1. Initial / Queue (0-10%)
                if (msg.includes('initiating') || msg.includes('queued') || msg.includes('starting audit')) newProgress = 5;

                // 2. Scraping (10-30%)
                if (msg.includes('scraping') || msg.includes('processing uploaded')) newProgress = 15;
                if (msg.includes('scrape complete') || msg.includes('content acquired') || msg.includes('analyzing content')) newProgress = 30;

                // 3. Performance (30-35%)
                if (msg.includes('checking performance') || msg.includes('performance check')) newProgress = 32;

                // 4. Expert Analysis Batches (35-85%)
                if (msg.includes('running experts') || msg.includes('starting batch')) newProgress = 35;

                // UX & Product (Batch 1)
                if (msg.includes('running ux') || msg.includes('starting analyze-ux')) newProgress = 40;
                if (msg.includes('running product') || msg.includes('starting analyze-product')) newProgress = 40;

                if (msg.includes('ux complete') || msg.includes('ux audit analysis complete')) newProgress = 50;
                if (msg.includes('product complete') || msg.includes('product audit analysis complete')) newProgress = 50;

                // Visual & Strategy (Batch 2)
                if (msg.includes('running visual') || msg.includes('starting analyze-visual')) newProgress = 60;
                if (msg.includes('running strategy') || msg.includes('starting analyze-strategy')) newProgress = 60;

                if (msg.includes('visual complete') || msg.includes('visual audit analysis complete')) newProgress = 70;
                if (msg.includes('strategy complete') || msg.includes('strategy audit completed')) newProgress = 70;

                // Accessibility (Batch 3)
                if (msg.includes('running accessibility') || msg.includes('starting analyze-accessibility')) newProgress = 80;
                if (msg.includes('accessibility complete') || msg.includes('accessibility audit completed')) newProgress = 85;

                // 5. Contextual & Finalization (85-100%)
                if (msg.includes('contextual') || msg.includes('strategic impact')) newProgress = 90;
                if (msg.includes('contextual analysis complete')) newProgress = 95;

                if (msg.includes('job completed') || msg.includes('saving') || msg.includes('finalizing')) newProgress = 98;
                if (msg.includes('complete') && (msg.includes('job') || msg.includes('all'))) newProgress = 100;

                return Math.max(prev, newProgress);
            });
        },
        onData: (chunk: any) => {
            if (chunk.key === 'screenshots') setScreenshots(chunk.data);
            if (chunk.key === 'screenshotMimeType') setScreenshotMimeType(chunk.data);
            setReport(prevReport => ({ ...prevReport, [chunk.key]: chunk.data }));
        },
        onComplete: ({ auditId, screenshotUrl }: any) => {
            setUiAuditId(auditId);
            setTargetProgress(100);
            setIsLoading(false);
            // Redirect to report view when done
            navigate(`/report/${auditId}`, { replace: true });
        },
        onError: (errorMessage: string) => {
            setError(errorMessage);
            setIsLoading(false);
            setTargetProgress(0);
            setProgress(0);
        },
        onClose: () => {
            // If strictly monitoring, we might not want to set isLoading false here if it closed prematurely?
            // But usually close means end.
        }
    });

    // 1. Resume Monitoring or Load Data
    useEffect(() => {
        if (!auditId) return;
        // avoid re-fetching if we already have this report
        if (report && uiAuditId === auditId) return;

        const loadOrMonitor = async () => {
            setIsLoading(true);
            try {
                // Try fetching existing result from DB (Skip if we know it's a new audit)
                // @ts-ignore
                const isNewAudit = location.state?.newAudit;
                let job = null;

                if (!isNewAudit) {
                    const { getAuditJob } = await import('./services/auditStorage');
                    job = await getAuditJob(auditId);
                } else {
                    console.log('[App] New audit detected, skipping persistence check.');
                }

                // If Job Completed, load it directly (persistence fix)
                if (job && job.status === 'completed' && job.report_data) {
                    console.log('[App] Loaded Persisted Job:', job);
                    console.log('[App] Screenshots found:', job.report_data.screenshots);

                    setReport(job.report_data);

                    // Safety: Only overwrite screenshots if DB has them. Prevents race condition overwriting stream data.
                    if (job.report_data.screenshots?.length > 0) {
                        setScreenshots(job.report_data.screenshots);
                    } else {
                        console.log('[App] DB screenshots empty, preserving existing state if any.');
                    }

                    setScreenshotMimeType(job.report_data.screenshotMimeType || 'image/png');
                    setUiAuditId(auditId);
                    setSubmittedUrl(job.report_data.url);
                    setTargetProgress(100);
                    setIsLoading(false);

                    // Auto-redirect if on analysis page
                    // @ts-ignore
                    if (location.pathname.includes('/analysis/')) {
                        navigate(`/report/${auditId}`, { replace: true });
                    }
                    return;
                }

                // If Job Failed
                if (job && job.status === 'failed') {
                    setError(job.error_message || 'Audit failed');
                    setIsLoading(false);
                    return;
                }

                // Else (Processing/Pending/Not Found), monitor stream
                console.log(`[App] Monitoring stream for ${auditId}`);
                setLoadingMessage('Optimizing connection to audit stream...');
                setUiAuditId(auditId);
                monitorJobStream(auditId, getStreamCallbacks(true));

            } catch (e) {
                console.error("Error loading job:", e);
                // Fallback to monitor
                monitorJobStream(auditId, getStreamCallbacks(true));
            }
        };

        loadOrMonitor();
    }, [auditId, location.pathname]);

    const handleAnalyze = useCallback(async (inputs: AuditInput[], auditMode: 'standard' | 'competitor' = 'standard') => {
        setError(null);
        setIsLoading(true);

        const processedInputs: AuditInput[] = [];

        // Helper to process files
        const processFiles = async (files?: File[], singleFile?: File): Promise<string[]> => {
            const filesToProcess = files && files.length > 0 ? files : (singleFile ? [singleFile] : []);
            if (filesToProcess.length === 0) return [];

            return Promise.all(filesToProcess.map(file =>
                new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result?.toString().split(',')[1];
                        if (result) resolve(result);
                        else reject("Failed to process image.");
                    };
                    reader.onerror = () => reject("Failed to read file.");
                    reader.readAsDataURL(file);
                })
            ));
        };

        try {
            // Validations & Conversions
            for (const input of inputs) {
                const filesData = await processFiles(input.files, input.file);

                if (input.type === 'url') {
                    if (!input.url) continue;

                    let normalized = input.url.trim();
                    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
                        normalized = 'https://' + normalized;
                    }

                    try {
                        new URL(normalized);
                    } catch {
                        setError(`Invalid URL format: "${input.url}"`);
                        setIsLoading(false);
                        return;
                    }

                    processedInputs.push({
                        ...input,
                        url: normalized,
                        filesData: filesData.length > 0 ? filesData : undefined,
                        fileData: filesData.length > 0 ? filesData[0] : undefined
                    });

                } else if (input.type === 'upload') {
                    if (filesData.length === 0) {
                        setError("Missing file for upload.");
                        setIsLoading(false);
                        return;
                    }

                    processedInputs.push({
                        ...input,
                        filesData: filesData,
                        fileData: filesData[0]
                    });
                }
            }

            if (processedInputs.length === 0) {
                setError("No valid inputs provided.");
                setIsLoading(false);
                return;
            }

            const firstInput = processedInputs[0];
            setSubmittedUrl(firstInput.type === 'url' ? firstInput.url! : 'Manual Upload');

            startAnalysis(processedInputs, auditMode);

        } catch (e: any) {
            setError(`Error processing inputs: ${e.message || e}`);
            setIsLoading(false);
        }
    }, []);

    const startAnalysis = (inputs: AuditInput[], auditMode: 'standard' | 'competitor') => {
        setReport(null);
        setScreenshots([]);
        setScreenshotMimeType('image/png');
        setUiAuditId(null);
        setPerformanceError(null);
        setLoadingMessage('Initiating mixed-input audit...');
        setProgress(0);
        setTargetProgress(0);

        analyzeWebsiteStream({
            inputs,
            auditMode
        }, getStreamCallbacks(false));
    };

    const handleRunNewAudit = useCallback(() => {
        setReport(null);
        setError(null);
        setSubmittedUrl('');
        setScreenshots([]);
        setUiAuditId(null);
        setPerformanceError(null);
        setProgress(0);
        setTargetProgress(0);
        setIsLoading(false);
        navigate('/'); // Go back home
    }, [navigate]);

    useEffect(() => {
        if (!isLoading && report && uiAuditId) {
            console.log("--- FINAL AUDIT REPORT DATA ---", report);
        }
    }, [isLoading, report, uiAuditId]);

    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setCurrentMicrocopy(prev => {
                    const currentIndex = loadingMicrocopy.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % loadingMicrocopy.length;
                    return loadingMicrocopy[nextIndex];
                });
            }, 2500);

            return () => clearInterval(interval);
        }
    }, [isLoading]);

    const renderError = () => {
        if (!error) return null;

        let title = "Analysis Failed";
        let message: React.ReactNode = (
            <div className="text-left text-red-700 mt-2 text-sm space-y-2">
                <p>The analysis failed due to an unexpected technical issue. The full error from the backend is provided below for debugging:</p>
                <pre className="whitespace-pre-wrap bg-red-50 p-2 rounded text-xs font-mono break-all">{error}</pre>
            </div>
        );

        if (error.includes('Failed to fetch')) {
            title = "Network Connection Error";
            message = (
                <div className="text-left text-red-700 mt-2 text-sm space-y-2">
                    <p>We couldn't connect to our analysis server. This is usually due to one of the following reasons:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Your internet connection is unstable.</li>
                        <li>A firewall or ad-blocker is blocking the connection.</li>
                        <li>The server is currently sleeping/inactive (common on free tiers).</li>
                    </ul>
                    <p className="font-semibold pt-2">Troubleshooting Steps:</p>
                    <ol className="list-decimal pl-5 space-y-1">
                        <li>Check your internet connection.</li>
                        <li>Disable ad-blockers for this page temporarily.</li>
                        <li>Wait 30 seconds and try again (this often wakes up the server).</li>
                    </ol>
                </div>
            );
        } else if (error.includes('429')) {
            title = "Server Busy";
            message = <p className="text-sm mt-2">We are experiencing high traffic. Please wait a minute and try again.</p>;
        } else if (error.includes('500') || error.includes('Server Error')) {
            title = "Server Error";
            message = <p className="text-sm mt-2">Something went wrong on our end. our team has been notified.</p>;
        }

        return (
            <div className="mt-12 max-w-2xl mx-auto p-4 bg-red-100 border border-red-400 rounded-lg">
                <h3 className="font-bold text-red-800 text-center">{title}</h3>
                {message}
            </div>
        );
    };

    const showReport = !isLoading && (report || (auditId && !error)); // If auditId exists and no error, we show report or loading (handled by isLoading). If completed (isLoading false), show report.
    // Logic check: if isLoading is false, and we have report, show it.

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col items-center justify-start pt-16 sm:pt-24">
                <Logo className="mx-auto mb-12" />
                <header className="w-full text-center px-4 mb-12">
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900">
                        Let's Put Your Website Through a UX Checkup
                    </h1>
                    <p className="mt-4 text-lg sm:text-xl text-slate-600">
                        AI-powered UX assessment to spot friction, gaps, and quick wins.
                        <span className="block mt-2 font-semibold" style={{ color: 'rgb(79, 70, 229)' }}>Clear insights. Practical fixes. No fluff.</span>
                    </p>
                </header>

                <div className="my-8 sm:my-12">
                    <LottieAnimation animationData={qrCodeAnimationData} className="w-32 h-32 mx-auto" />
                </div>

                <div className="w-full px-4 text-center">
                    <div className="mb-6">
                        <ProgressBar progress={progress} />
                    </div>
                    <p className="mt-4 text-base sm:text-lg text-slate-600 animate-pulse">
                        {currentMicrocopy}
                    </p>
                    <p className="mt-2 text-base sm:text-lg text-slate-600">
                        Hang tight. Good things take a little time
                    </p>
                </div>
            </div>
        );
    }

    if (showReport && report) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-2 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <main>
                        {error && renderError()}
                        {!error && (
                            <div>
                                <ReportDisplay
                                    report={report}
                                    url={submittedUrl || 'Analyzed Site'}
                                    screenshots={screenshots}
                                    screenshotMimeType={screenshotMimeType}
                                    performanceError={performanceError}
                                    auditId={uiAuditId || auditId || null}
                                    onRunNewAudit={handleRunNewAudit}
                                    whiteLabelLogo={whiteLabelLogo}
                                />
                            </div>
                        )}
                    </main>
                </div>
            </div>
        );
    }

    // Initial Form View
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col items-center justify-start pt-16 sm:pt-24">
            <Logo className="mb-12" />
            <header className="mb-16 sm:mb-32 text-center w-full px-4">
                <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900">
                    Let's Put Your Website Through a UX Checkup
                </h1>
                <p className="mt-4 text-lg sm:text-xl text-slate-600">
                    AI-powered UX assessment to spot friction, gaps, and quick wins.
                    <span className="block mt-2 font-semibold" style={{ color: 'rgb(79, 70, 229)' }}>Clear insights. Practical fixes. No fluff.</span>
                </p>
            </header>

            <main className="w-full max-w-4xl px-4">
                <URLInputForm
                    onAnalyze={handleAnalyze}
                    isLoading={isLoading}
                    whiteLabelLogo={whiteLabelLogo}
                    onWhiteLabelLogoChange={setWhiteLabelLogo}
                />
                {error && renderError()}
            </main>
        </div>
    );
};

export default App;
