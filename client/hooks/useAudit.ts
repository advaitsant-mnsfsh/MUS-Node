import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AnalysisReport, Screenshot, AuditInput } from '../types';
import { monitorJobStream, analyzeWebsiteStream } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';

const loadingMicrocopy = [
    "Analyzing UX with 250+ parameters…",
    "Pixel checks in progress...",
    "Reading your interface…",
    "Decoding design decisions…",
];

export const useAudit = () => {
    // --- STATE ---
    const [submittedUrl, setSubmittedUrl] = useState<string>('');
    const [report, setReport] = useState<AnalysisReport | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('Initiating multi-faceted audit...');
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const [screenshotMimeType, setScreenshotMimeType] = useState<string>('image/png');
    const [uiAuditId, setUiAuditId] = useState<string | null>(null);
    const [performanceError, setPerformanceError] = useState<string | null>(null);
    const [currentMicrocopy, setCurrentMicrocopy] = useState(loadingMicrocopy[0]);
    const [progress, setProgress] = useState<number>(0);
    const [targetProgress, setTargetProgress] = useState<number>(0);
    const [reportInputs, setReportInputs] = useState<AuditInput[]>([]);
    const [whiteLabelLogo, setWhiteLabelLogo] = useState<string | null>(null);

    // --- HOOKS ---
    const { user } = useAuth(); // Auth is usually needed for some logic, though mostly purely UI in App.tsx. Keeping it here for potentially authenticated API calls.
    const { auditId } = useParams<{ auditId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const lastLogTime = useRef<number>(Date.now());

    // --- EFFECTS ---

    // 1. Smooth Progress Interpolation
    useEffect(() => {
        if (progress < targetProgress) {
            const diff = targetProgress - progress;
            const delay = diff > 20 ? 40 : 200;
            const timer = setTimeout(() => {
                setProgress(prev => Math.min(prev + 1, targetProgress));
            }, delay);
            return () => clearTimeout(timer);
        }
    }, [progress, targetProgress]);

    // 2. Microcopy Rotation
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

    // --- CALLBACKS ---

    const getStreamCallbacks = useCallback((isResuming = false) => ({
        onScrapeComplete: (newScreenshots: Screenshot[], mimeType: string) => {
            setScreenshots(newScreenshots);
            setScreenshotMimeType(mimeType);
        },
        onPerformanceError: (errorMessage: string) => {
            setPerformanceError(errorMessage);
        },
        onJobCreated: (id: string) => {
            navigate(`/analysis/${id}`, { state: { newAudit: true } });
        },
        onStatus: (message: string) => {
            if (location.pathname.includes('/report/') && auditId) {
                navigate(`/analysis/${auditId}`, { replace: true });
            }

            const now = Date.now();
            // const delta = ((now - lastLogTime.current) / 1000).toFixed(2);
            // console.log(`[TIMING] +${delta}s : "${message}"`); // Optional log
            lastLogTime.current = now;

            setLoadingMessage(message);

            // Progress Logic
            setTargetProgress(prev => {
                let newProgress = prev;
                const msg = message.toLowerCase();

                if (msg.includes('initiating') || msg.includes('queued') || msg.includes('starting audit')) newProgress = 5;
                if (msg.includes('scraping') || msg.includes('processing uploaded')) newProgress = 15;
                if (msg.includes('scrape complete') || msg.includes('content acquired') || msg.includes('analyzing content')) newProgress = 30;
                if (msg.includes('checking performance') || msg.includes('performance check')) newProgress = 32;
                if (msg.includes('running experts') || msg.includes('starting batch')) newProgress = 35;

                // UX & Product
                if (msg.includes('running ux') || msg.includes('starting analyze-ux')) newProgress = 40;
                if (msg.includes('running product') || msg.includes('starting analyze-product')) newProgress = 40;
                if (msg.includes('ux complete') || msg.includes('ux audit analysis complete')) newProgress = 50;
                if (msg.includes('product complete') || msg.includes('product audit analysis complete')) newProgress = 50;

                // Visual & Strategy
                if (msg.includes('running visual') || msg.includes('starting analyze-visual')) newProgress = 60;
                if (msg.includes('running strategy') || msg.includes('starting analyze-strategy')) newProgress = 60;
                if (msg.includes('visual complete') || msg.includes('visual audit analysis complete')) newProgress = 70;
                if (msg.includes('strategy complete') || msg.includes('strategy audit completed')) newProgress = 70;

                // Accessibility
                if (msg.includes('running accessibility') || msg.includes('starting analyze-accessibility')) newProgress = 80;
                if (msg.includes('accessibility complete') || msg.includes('accessibility audit completed')) newProgress = 85;

                // Contextual & Final
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
        onComplete: ({ auditId: completedId, screenshotUrl }: any) => {
            setUiAuditId(completedId);
            setTargetProgress(100);
            setIsLoading(false);
            navigate(`/report/${completedId}`, { replace: true });
        },
        onError: (errorMessage: string) => {
            setError(errorMessage);
            setIsLoading(false);
            setTargetProgress(0);
            setProgress(0);
        },
        onClose: () => { }
    }), [navigate, location.pathname, auditId]);


    // 3. Main Data Loading / Resume Logic
    useEffect(() => {
        if (!auditId) return;
        if (report && uiAuditId === auditId) return;

        const loadOrMonitor = async () => {
            setIsLoading(true);
            try {
                // @ts-ignore
                const isNewAudit = location.state?.newAudit;
                let job = null;

                if (!isNewAudit) {
                    const { getAuditJob } = await import('../services/auditStorage');
                    job = await getAuditJob(auditId);
                } else {
                    console.log('[useAudit] New audit detected, skipping persistence check.');
                }

                if (job && job.status === 'completed' && job.report_data) {
                    console.log('[useAudit] Loaded Persisted Job:', job);
                    setReport(job.report_data);
                    if (job.report_data.screenshots?.length > 0) {
                        setScreenshots(job.report_data.screenshots);
                    }
                    setScreenshotMimeType(job.report_data.screenshotMimeType || 'image/png');
                    setUiAuditId(auditId);
                    setSubmittedUrl(job.report_data.url);
                    setTargetProgress(100);
                    setIsLoading(false);

                    // @ts-ignore
                    if (location.pathname.includes('/analysis/')) {
                        navigate(`/report/${auditId}`, { replace: true });
                    }
                    return;
                }

                if (job && job.status === 'failed') {
                    setError(job.error_message || 'Audit failed');
                    setIsLoading(false);
                    return;
                }

                console.log(`[useAudit] Monitoring stream for ${auditId}`);
                setLoadingMessage('Optimizing connection to audit stream...');
                setUiAuditId(auditId);
                monitorJobStream(auditId, getStreamCallbacks(true));

            } catch (e) {
                console.error("Error loading job:", e);
                monitorJobStream(auditId, getStreamCallbacks(true));
            }
        };

        loadOrMonitor();
    }, [auditId, location.pathname, location.state, report, uiAuditId, getStreamCallbacks]);


    // --- ACTION HANDLERS ---

    const startAnalysis = useCallback((inputs: AuditInput[], auditMode: 'standard' | 'competitor', initialScreenshots: any[]) => {
        setReport(null);
        setReportInputs(inputs);
        setScreenshots(initialScreenshots);
        setScreenshotMimeType('image/png');
        setUiAuditId(null);
        setPerformanceError(null);
        setLoadingMessage('Initiating mixed-input audit...');
        setProgress(0);
        setTargetProgress(0);

        analyzeWebsiteStream({ inputs, auditMode }, getStreamCallbacks(false));
    }, [getStreamCallbacks]);

    const handleAnalyze = useCallback(async (inputs: AuditInput[], auditMode: 'standard' | 'competitor' = 'standard') => {
        setError(null);
        setIsLoading(true);

        const processedInputs: AuditInput[] = [];

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
            for (const input of inputs) {
                const filesData = await processFiles(input.files, input.file);
                if (input.type === 'url') {
                    if (!input.url) continue;
                    let normalized = input.url.trim();
                    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
                        normalized = 'https://' + normalized;
                    }
                    try { new URL(normalized); } catch {
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
                    processedInputs.push({ ...input, filesData: filesData, fileData: filesData[0] });
                }
            }

            if (processedInputs.length === 0) {
                setError("No valid inputs provided.");
                setIsLoading(false);
                return;
            }

            const firstInput = processedInputs[0];
            setSubmittedUrl(firstInput.type === 'url' ? firstInput.url! : 'Manual Upload');

            let initialScreenshots: any[] = [];
            if (firstInput.type === 'upload' && firstInput.filesData && firstInput.filesData.length > 0) {
                initialScreenshots = [{ data: firstInput.filesData[0], mimeType: 'image/png' }];
            }

            startAnalysis(processedInputs, auditMode, initialScreenshots);

        } catch (e: any) {
            setError(`Error processing inputs: ${e.message || e}`);
            setIsLoading(false);
        }
    }, [startAnalysis]);

    const handleRunNewAudit = useCallback(() => {
        setReport(null);
        setError(null);
        setSubmittedUrl('');
        setScreenshots([]);
        setUiAuditId(null);
        setPerformanceError(null);
        setReportInputs([]);
        setProgress(0);
        setTargetProgress(0);
        setIsLoading(false);
        navigate('/');
    }, [navigate]);

    return {
        // State
        submittedUrl,
        report,
        isLoading,
        error,
        loadingMessage,
        currentMicrocopy,
        progress,
        screenshots,
        screenshotMimeType,
        uiAuditId,
        performanceError,
        reportInputs,
        whiteLabelLogo,
        auditId,
        user, // Expose user too if needed

        // Actions
        handleAnalyze,
        handleRunNewAudit,
        setWhiteLabelLogo
    };
};
