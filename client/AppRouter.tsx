import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import EmbedPage from './pages/EmbedPage';
import DashboardPage from './pages/DashboardPage';
import APIKeysPage from './pages/APIKeysPage';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import { LoadingScreen } from './components/LoadingScreen';
import { DataLoadingScreen } from './components/DataLoadingScreen';
import { ReportContainer } from './components/report/ReportContainer';

import { Logo } from './components/Logo';
import { getSharedAudit } from './services/auditStorage';
import { AnalysisReport, Screenshot, AuditInput } from './types';
import { Layout } from './components/Layout';

// Wrapper for Layout to use with Outlet
const LayoutWrapper = () => (
    <Layout>
        <Outlet />
    </Layout>
);

// Shared Audit View Component
function SharedAuditView() {
    const { auditId } = useParams<{ auditId: string }>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<AnalysisReport | null>(null);
    const [url, setUrl] = useState<string>('');
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const [inputs, setInputs] = useState<AuditInput[]>([]);
    const [screenshotMimeType, setScreenshotMimeType] = useState<string>('image/png');
    const [whiteLabelLogo, setWhiteLabelLogo] = useState<string | null>(null);

    // Job Polling State
    const [jobStatus, setJobStatus] = useState<'pending' | 'processing' | 'completed' | 'failed' | null>(null);
    const [pollProgress, setPollProgress] = useState(0);

    useEffect(() => {
        let isMounted = true;
        let pollInterval: NodeJS.Timeout;
        let retryCount = 0;
        const maxRetries = 5; // Total ~15 seconds of waiting for the record to appear

        async function loadAudit() {
            if (!auditId) {
                setError('No audit ID provided');
                setLoading(false);
                return;
            }

            // 1. Try to fetch as a Job first (Widget Flow)
            try {
                const { getAuditJob } = await import('./services/auditStorage');
                const job = await getAuditJob(auditId);

                if (job && isMounted) {
                    if (job.status === 'completed') {
                        // Job is done! Transform to Report format.
                        setReport(job.report_data);
                        setUrl(job.report_data?.url || 'Analyzed Site'); // Fallback
                        setScreenshots(job.report_data?.screenshots || []);
                        setInputs(job.inputs || []);
                        setJobStatus('completed');
                        setLoading(false);
                        return; // Done
                    } else if (job.status === 'failed') {
                        setError(job.error_message || 'Audit failed');
                        setLoading(false);
                        return;
                    } else {
                        // Pending/Processing
                        setJobStatus(job.status);
                        setPollProgress(prev => Math.min(prev + 5, 90)); // Fake progress

                        // Setup Polling
                        pollInterval = setTimeout(loadAudit, 3000);
                        return;
                    }
                } else if (!job && retryCount < maxRetries && isMounted) {
                    // Job not found yet? It might be a race condition. Retry.
                    retryCount++;
                    setJobStatus('pending'); // Show loading state even if record isn't found yet
                    pollInterval = setTimeout(loadAudit, 3000);
                    return;
                }
            } catch (err) {
                // Ignore error, maybe it's not a job, or table doesn't exist yet (if user didn't run SQL)
                // Fall through to regular audit fetch
            }

            // 2. Fallback: Try to fetch as a Saved Audit (Legacy/Direct Flow)
            try {
                const data = await getSharedAudit(auditId);

                if (!data) {
                    if (isMounted) {
                        setError('Audit not found');
                        setLoading(false);
                    }
                    return;
                }

                if (isMounted) {
                    setReport(data.report);
                    setUrl(data.url);
                    setScreenshots(data.screenshots);
                    setInputs(data.inputs || []);
                    setScreenshotMimeType(data.screenshotMimeType);
                    setWhiteLabelLogo(data.whiteLabelLogo || null);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error loading shared audit:', err);
                if (isMounted) {
                    setError('Failed to load audit');
                    setLoading(false);
                }
            }
        }

        loadAudit();

        return () => {
            isMounted = false;
            clearTimeout(pollInterval);
        };
    }, [auditId]);

    // Render loading state (Job Polling or Initial Fetch)
    if (loading || (jobStatus && jobStatus !== 'completed' && jobStatus !== 'failed')) {
        // Use the new DataLoadingScreen for fetching
        return <DataLoadingScreen message={jobStatus === 'pending' ? 'Queued for analysis...' : 'Fetching your audit report...'} />;
    }

    if (error || !report) {
        // ... (Error View - same as before)
        return (
            <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col items-center justify-center px-4">
                <Logo className="mb-8" />
                <div className="max-w-md text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Audit Not Found</h1>
                    <p className="text-slate-600 mb-6">{error || 'This audit link may be invalid or expired.'}</p>
                    <a href="/" className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                        Run Your Own Audit
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            <div className="w-full">
                <ReportContainer
                    report={report}
                    url={url}
                    screenshots={screenshots}
                    screenshotMimeType={screenshotMimeType}
                    performanceError={null}
                    auditId={auditId || null}
                    onRunNewAudit={() => { }} // No-op in shared view
                    whiteLabelLogo={whiteLabelLogo}
                    inputs={inputs}
                    isSharedView={true} // New prop to indicate shared/read-only mode
                />
            </div>
        </div>
    );
}

// Root component with routing
function AppWithRouting() {
    return (
        <BrowserRouter>
            <Toaster position="top-center" />
            <Routes>
                {/* Main Application with Global Layout */}
                <Route element={<LayoutWrapper />}>
                    <Route path="/" element={<App />} />
                    <Route path="/analysis/:auditId" element={<App />} />
                    <Route path="/report/:auditId" element={<App />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/api-keys" element={<APIKeysPage />} />
                    <Route path="/login" element={<App />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                </Route>

                {/* Standalone Views (No Global Nav) */}
                <Route path="/shared/:auditId" element={<SharedAuditView />} />
                <Route path="/embed" element={<EmbedPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppWithRouting;
