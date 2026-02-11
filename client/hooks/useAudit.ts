import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AnalysisReport, Screenshot, AuditInput } from '../types';
import { monitorJobStream, analyzeWebsiteStream, monitorJobPoll } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { useGlobalAudit } from '../contexts/AuditContext';
import { getAuditInputs } from '../services/userAuditsService';
import { resizeImage } from '../lib/imageUtils';

const loadingMicrocopy = [
    "Analyzing UX with 250+ parameters…",
    "Pixel checks in progress...",
    "Reading your interface…",
    "Decoding design decisions…",
];

export const useAudit = () => {
    // --- HOOKS ---
    const { auditId } = useParams<{ auditId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { activeAuditId: globalAuditId, progress: globalProgress, status: globalStatus, setActiveAudit, clearActiveAudit } = useGlobalAudit();
    const isResumingActive = globalAuditId === auditId;

    // --- STATE ---
    const [submittedUrl, setSubmittedUrl] = useState<string>('');
    const [report, setReport] = useState<AnalysisReport | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(!!auditId);
    const [isFetchingReport, setIsFetchingReport] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>(isResumingActive && globalStatus ? globalStatus : 'Starting audit agents...');
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const [screenshotMimeType, setScreenshotMimeType] = useState<string>('image/png');
    const [uiAuditId, setUiAuditId] = useState<string | null>(null);
    const [performanceError, setPerformanceError] = useState<string | null>(null);
    const [currentMicrocopy, setCurrentMicrocopy] = useState(loadingMicrocopy[0]);
    const [progress, setProgress] = useState<number>(isResumingActive ? globalProgress : 0);
    const [targetProgress, setTargetProgress] = useState<number>(isResumingActive ? globalProgress : 0);
    const [reportInputs, setReportInputs] = useState<AuditInput[]>([]);
    const [whiteLabelLogo, setWhiteLabelLogo] = useState<string | null>(null);

    const lastLogTime = useRef<number>(Date.now());

    // --- EFFECTS ---

    // 0. Sync with Global State on Load/Recovery
    useEffect(() => {
        if (isResumingActive && globalProgress > 0 && targetProgress === 0) {
            console.log(`[useAudit] Initializing local progress from global state: ${globalProgress}%`);
            setProgress(globalProgress);
            setTargetProgress(globalProgress);
            if (globalStatus) setLoadingMessage(globalStatus);
        }
    }, [isResumingActive, globalProgress, globalStatus, targetProgress]);

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

    // 1b. Continuous Sync with Global Progress (confidence builder source)
    useEffect(() => {
        if (isResumingActive && globalProgress > targetProgress) {
            setTargetProgress(globalProgress);
        }
        if (isResumingActive && globalStatus && globalStatus !== loadingMessage) {
            setLoadingMessage(globalStatus);
        }
    }, [isResumingActive, globalProgress, globalStatus, targetProgress, loadingMessage]);

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
        onComplete: ({ auditId: completedId }: any) => {
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


    const lastAuditId = useRef<string | undefined>(undefined);

    // 3. Main Data Loading / Resume Logic
    useEffect(() => {
        if (!auditId) {
            if (report || isLoading || error) {
                setReport(null);
                setScreenshots([]);
                setUiAuditId(null);
                setError(null);
                setLoadingMessage('Initiating multi-faceted audit...');
                setProgress(0);
                setTargetProgress(0);
                setIsLoading(false);
            }
            lastAuditId.current = undefined;
            return;
        }

        if (lastAuditId.current === auditId) return;
        lastAuditId.current = auditId;

        const loadOrMonitor = async () => {
            const { getAuditJob } = await import('../services/auditStorage');

            try {
                // @ts-ignore
                const isNewAudit = location.state?.newAudit;
                // @ts-ignore
                const jobFromState = location.state?.job;
                let job = jobFromState || null;

                if (!isNewAudit && !job) {
                    setIsFetchingReport(true);
                    job = await getAuditJob(auditId);
                    setIsFetchingReport(false);
                }

                if (job) {
                    const reportData = job.report_data;
                    if (reportData) {
                        setReport(reportData);
                        if (reportData.screenshots) setScreenshots(reportData.screenshots);
                        if (reportData.screenshotMimeType) setScreenshotMimeType(reportData.screenshotMimeType);
                    }

                    if (job.inputs) {
                        setReportInputs(job.inputs);
                        if (job.inputs.length > 0) {
                            const firstInput = job.inputs[0];
                            setSubmittedUrl(firstInput.type === 'url' ? firstInput.url! : 'Manual Upload');
                        }
                    }

                    if ((job as any).screenshots && (job as any).screenshots.length > 0) {
                        setScreenshots((job as any).screenshots);
                    }
                    if ((job as any).screenshotMimeType) setScreenshotMimeType((job as any).screenshotMimeType);

                    setUiAuditId(job.id);

                    if (job.status === 'completed' && reportData) {
                        setIsLoading(false);
                        if (location.pathname.includes('/analysis/')) {
                            navigate(`/report/${auditId}`, { replace: true });
                        }
                        return;
                    }
                }

                // If not found or not completed, THEN show loading screen for the stream/fetch
                const { getBackendUrl } = await import('../services/config');
                const { monitorJobPoll } = await import('../services/geminiService');

                console.log(`[useAudit] Monitoring poll for ${auditId} on ${getBackendUrl()}`);

                if (!isResumingActive) {
                    setLoadingMessage('Optimizing connection to audit stream...');
                }

                setUiAuditId(auditId);
                setActiveAudit(auditId);

                // Start polling immediately to avoid perceived lag
                monitorJobPoll(auditId, getStreamCallbacks(true));
                setIsLoading(true);
            } catch (e) {
                console.error('[useAudit] loadOrMonitor failed:', e);
                const { monitorJobPoll } = await import('../services/geminiService');
                setActiveAudit(auditId);
                monitorJobPoll(auditId, getStreamCallbacks(true));
                setIsLoading(true);
            }
        };

        loadOrMonitor();
    }, [auditId, location.pathname, isResumingActive, setActiveAudit, getStreamCallbacks, navigate, report, isLoading, error, location.state]);


    // --- ACTION HANDLERS ---

    const startAnalysis = useCallback(async (inputs: AuditInput[], auditMode: 'standard' | 'competitor', initialScreenshots: any[]) => {
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

    const handleAnalyze = useCallback((inputs: AuditInput[], auditMode: 'standard' | 'competitor' = 'standard') => {
        // --- 1. INSTANT UI PIVOT ---
        setError(null);
        setIsLoading(true);
        setLoadingMessage('Initializing analysis engine...');

        const firstInput = inputs[0];
        setSubmittedUrl(firstInput.type === 'url' ? firstInput.url! : 'Manual Upload');
        setReportInputs(inputs);

        // If it's an uploaded screenshot, show it immediately
        if (firstInput.type === 'upload' && (firstInput.file || firstInput.files?.length)) {
            const file = firstInput.files?.[0] || firstInput.file;
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64 = e.target?.result as string;
                    setScreenshots([{ data: base64.split(',')[1], path: '/', isMobile: false }]);
                };
                reader.readAsDataURL(file);
            }
        }

        // --- 2. DEFERRED PROCESSING ---
        setTimeout(async () => {
            const processedInputs: AuditInput[] = [];

            const processFiles = async (files?: File[], singleFile?: File): Promise<string[]> => {
                const filesToProcess = files && files.length > 0 ? files : (singleFile ? [singleFile] : []);
                if (filesToProcess.length === 0) return [];

                setLoadingMessage(`Optimizing ${filesToProcess.length} image${filesToProcess.length > 1 ? 's' : ''}...`);
                return Promise.all(filesToProcess.map(file => resizeImage(file)));
            };

            try {
                for (const input of inputs) {
                    const filesData = await processFiles(input.files, input.file);

                    const cleanedInput = { ...input, file: undefined, files: undefined };

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
                            ...cleanedInput,
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
                            ...cleanedInput,
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

                const updatedFirstInput = processedInputs[0];
                let initialScreenshots: any[] = [];
                if (updatedFirstInput.type === 'upload' && updatedFirstInput.filesData && updatedFirstInput.filesData.length > 0) {
                    initialScreenshots = [{ data: updatedFirstInput.filesData[0], mimeType: 'image/png' }];
                }

                setLoadingMessage('Deploying audit agents...');
                startAnalysis(processedInputs, auditMode, initialScreenshots);

            } catch (e: any) {
                console.error('[useAudit] Background processing failed:', e);
                setError(`Error processing inputs: ${e.message || e}`);
                setIsLoading(false);
            }
        }, 10);
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
        submittedUrl,
        report,
        isLoading,
        isFetchingReport,
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
        user,
        handleAnalyze,
        handleRunNewAudit,
        setWhiteLabelLogo
    };
};
