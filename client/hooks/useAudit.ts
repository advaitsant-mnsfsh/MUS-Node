import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AnalysisReport, Screenshot, AuditInput } from '../types';
import { monitorJobPoll, analyzeWebsiteStream } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { useGlobalAudit } from '../contexts/AuditContext';
import { getAuditInputs } from '../services/userAuditsService';

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
    const { user } = useAuth(); // Restore useAuth hook
    const { setActiveAudit, clearActiveAudit } = useGlobalAudit();

    // --- STATE ---
    const [submittedUrl, setSubmittedUrl] = useState<string>('');
    const [report, setReport] = useState<AnalysisReport | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(!!auditId);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('Starting audit agents...');
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const [screenshotMimeType, setScreenshotMimeType] = useState<string>('image/png');
    const [uiAuditId, setUiAuditId] = useState<string | null>(null);
    const [performanceError, setPerformanceError] = useState<string | null>(null);
    const [currentMicrocopy, setCurrentMicrocopy] = useState(loadingMicrocopy[0]);
    const [progress, setProgress] = useState<number>(0);
    const [targetProgress, setTargetProgress] = useState<number>(0);
    const [reportInputs, setReportInputs] = useState<AuditInput[]>([]);
    const [whiteLabelLogo, setWhiteLabelLogo] = useState<string | null>(null);

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

    // 1b. Automatic Incremental Progress (Confidence Builder)
    useEffect(() => {
        if (!isLoading || targetProgress >= 90) return;

        const interval = setInterval(() => {
            setTargetProgress(prev => {
                if (prev >= 90) return prev;
                // Faster increment at the start (0-30%), slower later
                const increment = prev < 30 ? 2 : (prev > 70 ? 0.5 : 1);
                return prev + increment;
            });
        }, 8000); // Crawl forward every 8 seconds instead of 12

        return () => clearInterval(interval);
    }, [isLoading, targetProgress]);

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
            setActiveAudit(id);
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
                const msg = message.toUpperCase();

                // 0. Initial & Scrape Phase (5-35%)
                if (msg.includes('AUDIT IS IN PROGRESS')) newProgress = 5;
                if (msg.includes('STARTING STANDARD ANALYSIS')) newProgress = 10;
                if (msg.includes('SCRAPING')) newProgress = 15;
                if (msg.includes('SCRAPE SUCCESSFUL')) newProgress = 30;
                if (msg.includes('SCRAPE COMPLETE')) newProgress = 35;

                // 2. Competitor Specific (10-50%)
                if (msg.includes('STARTING COMPETITOR ANALYSIS')) newProgress = 10;
                if (msg.includes('SCRAPING PRIMARY')) newProgress = 20;
                if (msg.includes('SCRAPING COMPETITOR')) newProgress = 40;
                if (msg.includes('AI COMPARISON')) newProgress = 60;

                // 3. Experts Phase (40-90%) - Pro-rated jump per expert
                if (msg.includes('UX COMPLETE')) newProgress = 42;
                if (msg.includes('PRODUCT COMPLETE')) newProgress = 54;
                if (msg.includes('VISUAL COMPLETE')) newProgress = 66;
                if (msg.includes('STRATEGY COMPLETE')) newProgress = 78;
                if (msg.includes('ACCESSIBILITY COMPLETE')) newProgress = 90;

                // 4. Final Phase (90-100%)
                if (msg.includes('STRATEGIC IMPACT')) newProgress = 92;
                if (msg.includes('CONTEXTUAL ANALYSIS COMPLETE')) newProgress = 95;
                if (msg.includes('FAILED')) newProgress = 0;

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
    }), [navigate, location.pathname, auditId, setActiveAudit, clearActiveAudit]);


    const hasStarted = useRef<boolean>(false);

    // 3. Main Data Loading / Resume Logic
    useEffect(() => {
        if (!auditId) {
            // User navigated to root (Start New Audit) - Reset State
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
            hasStarted.current = false;
            return;
        }

        // Prevent double-loading in StrictMode or re-renders
        if (hasStarted.current) return;
        hasStarted.current = true;

        const loadOrMonitor = async () => {
            const { getAuditJob } = await import('../services/auditStorage');

            try {
                // Support job from location.state for instant loading
                // @ts-ignore
                const isNewAudit = location.state?.newAudit;
                // @ts-ignore
                const jobFromState = location.state?.job;
                let job = jobFromState || null;

                if (!isNewAudit && !job) {
                    setIsLoading(true); // Show loader while fetching
                    job = await getAuditJob(auditId);
                }

                if (job) {
                    console.log(`[useAudit] Initial job load: status=${job.status}, hasReport=${!!job.report_data}`);
                    // Update state from job
                    const reportData = job.report_data;
                    if (reportData) setReport(reportData);
                    if (job.inputs) setReportInputs(job.inputs);
                    if (job.report_data?.screenshots && job.report_data.screenshots.length > 0) {
                        setScreenshots(job.report_data.screenshots);
                    } else if ((job as any).screenshots && (job as any).screenshots.length > 0) {
                        setScreenshots((job as any).screenshots);
                    }

                    if (job.report_data?.screenshotMimeType) {
                        setScreenshotMimeType(job.report_data.screenshotMimeType);
                    } else if ((job as any).screenshotMimeType) {
                        setScreenshotMimeType((job as any).screenshotMimeType);
                    }

                    setUiAuditId(job.id);

                    if (job.status === 'completed' && reportData) {
                        console.log('[useAudit] Job is already completed. Navigating to report.');
                        setIsLoading(false);
                        if (location.pathname.includes('/analysis/')) {
                            navigate(`/report/${auditId}`, { replace: true });
                        }
                        return;
                    }
                    if (job.status === 'failed') {
                        console.error('[useAudit] Job failed:', job.error_message);
                        setError(job.error_message || 'Audit failed');
                        setIsLoading(false);
                        return;
                    }
                }

                // If not found or not completed, THEN show loading screen for the stream/fetch
                const { getBackendUrl } = await import('../services/config');
                console.log(`[useAudit] Monitoring stream for ${auditId} on ${getBackendUrl()}`);
                console.log(`[useAudit] 🛠️ DEBUG LINK (Public API): ${getBackendUrl()}/api/public/jobs/${auditId}`);
                setLoadingMessage('Optimizing connection to audit stream...');
                setUiAuditId(auditId);
                const { monitorJobPoll } = await import('../services/geminiService');
                monitorJobPoll(auditId, getStreamCallbacks(true));
                setIsLoading(true);

            } catch (e) {
                console.error('[useAudit] loadOrMonitor failed:', e);
                // Try stream anyway as fallback
                const { monitorJobPoll } = await import('../services/geminiService');
                monitorJobPoll(auditId, getStreamCallbacks(true));
                setIsLoading(true);
            }
        };

        loadOrMonitor();
    }, [auditId, location.pathname]); // Keep dependencies minimal


    // --- ACTION HANDLERS ---

    const startAnalysis = useCallback(async (inputs: AuditInput[], auditMode: 'standard' | 'competitor', initialScreenshots: any[]) => {
        setReport(null);
        setReportInputs(inputs);
        setScreenshots(initialScreenshots);
        setScreenshotMimeType('image/png');
        setUiAuditId(null);
        setPerformanceError(null);
        setLoadingMessage('Starting audit agents...');
        setProgress(0);
        setTargetProgress(0);

        // Get auth token if user is logged in
        // Legacy Auth Token Logic Removed - Using Session Cookies via Better-Auth
        const token = undefined;

        analyzeWebsiteStream({ inputs, auditMode, token }, getStreamCallbacks(false));
    }, [getStreamCallbacks, user]);

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
        clearActiveAudit();
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
    }, [navigate, clearActiveAudit]);

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
        user,

        // Actions
        handleAnalyze,
        handleRunNewAudit,
        setWhiteLabelLogo
    };
};
