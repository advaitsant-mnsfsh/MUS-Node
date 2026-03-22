import React from 'react';
import { Link } from 'react-router-dom';
import { useAudit } from './hooks/useAudit';

// --- VIEW COMPONENTS ---
import { LandingView } from './components/views/LandingViewNew';
import { AnalysisView } from './components/views/AnalysisView';
import { ReportResultView } from './components/views/ReportResultView';
import { LoadingScreen } from './components/LoadingScreen';
import { DataLoadingScreen } from './components/DataLoadingScreen';

// --- ERROR BOUNDARY ---
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
    componentDidCatch(error: any, errorInfo: any) { console.error("Uncaught error:", error, errorInfo); }
    render() {
        if (this.state.hasError) {
            const cardBorder = { border: '0.5px solid var(--high-grey, #1A1A1A)', boxShadow: 'none' } as const;
            return (
                <div className="flex min-h-dvh items-center justify-center bg-page-bg p-4 font-sans text-text-primary">
                    <div
                        className="w-full max-w-lg rounded-lg bg-white p-8 md:p-10"
                        style={cardBorder}
                    >
                        <div className="mb-6 flex items-start gap-4">
                            <div
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600"
                                aria-hidden
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="min-w-0 pt-0.5">
                                <h1 className="text-xl font-bold tracking-tight text-text-primary md:text-2xl">
                                    Something went wrong
                                </h1>
                                <p className="mt-1 text-sm text-text-secondary leading-snug">
                                    The page hit an unexpected error. You can go home and try again.
                                </p>
                            </div>
                        </div>

                        <details className="mb-8 rounded-lg bg-slate-50/80 p-4 text-left" style={cardBorder}>
                            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                Technical details
                            </summary>
                            <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed text-text-primary">
                                {this.state.error?.toString() || 'Unknown error'}
                            </pre>
                        </details>

                        <button
                            type="button"
                            onClick={() => { window.location.href = '/'; }}
                            className="flex h-12 w-full items-center justify-center rounded-lg bg-[#1A1A1A] text-sm font-bold text-white transition-colors hover:bg-black"
                        >
                            Back to home
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

const qrCodeAnimationData = { "v": "5.12.1", "fr": 29.9700012207031, "ip": 0, "op": 97.000003950891, "w": 128, "h": 128, "nm": "Qr_code_lottie", "ddd": 0, "assets": [], "layers": [{ "ddd": 0, "ind": 1, "ty": 4, "nm": "Layer 2 Outlines", "parent": 2, "sr": 1, "ks": { "o": { "a": 0, "k": 100, "ix": 11 }, "r": { "a": 0, "k": 0, "ix": 10 }, "p": { "a": 0, "k": [49, 49, 0], "ix": 2, "l": 2 }, "a": { "a": 0, "k": [44.5, 3.5, 0], "ix": 1, "l": 2 }, "s": { "a": 0, "k": [100, 100, 100], "ix": 6, "l": 2 } }, "ao": 0, "shapes": [{ "ty": "gr", "it": [{ "ind": 0, "ty": "sh", "ix": 1, "ks": { "a": 1, "k": [{ "i": { "x": 0.13, "y": 1 }, "o": { "x": 0.87, "y": 0 }, "t": 10, "s": [{ "i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [[3.5, 3.5], [85.5, 3.5]], "c": false }] }, { "i": { "x": 0.13, "y": 1 }, "o": { "x": 0.87, "y": 0 }, "t": 25, "s": [{ "i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [[14.75, 3.5], [74.25, 3.5]], "c": false }] }, { "i": { "x": 0.13, "y": 1 }, "o": { "x": 0.87, "y": 0 }, "t": 42, "s": [{ "i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [[14.75, -26.25], [74.25, -26.25]], "c": false }] }, { "i": { "x": 0.13, "y": 1 }, "o": { "x": 0.87, "y": 0 }, "t": 62, "s": [{ "i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [[14.75, 32.25], [74.25, 32.25]], "c": false }] }, { "i": { "x": 0.13, "y": 1 }, "o": { "x": 0.87, "y": 0 }, "t": 82, "s": [{ "i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [[14.75, 3.5], [74.25, 3.5]], "c": false }] }, { "t": 92.0000037472368, "s": [{ "i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [[3.5, 3.5], [85.5, 3.5]], "c": false }] }], "ix": 2 }, "nm": "Path 1", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ty": "st", "c": { "a": 0, "k": [0, 0, 0, 1], "ix": 3 }, "o": { "a": 0, "k": 100, "ix": 4 }, "w": { "a": 0, "k": 7, "ix": 5 }, "lc": 2, "lj": 1, "ml": 4, "bm": 0, "nm": "Stroke 1", "mn": "ADBE Vector Graphic - Stroke", "hd": false }, { "ty": "tr", "p": { "a": 0, "k": [0, 0], "ix": 2 }, "a": { "a": 0, "k": [0, 0], "ix": 1 }, "s": { "a": 0, "k": [100, 100], "ix": 3 }, "r": { "a": 0, "k": 0, "ix": 6 }, "o": { "a": 0, "k": 100, "ix": 7 }, "sk": { "a": 0, "k": 0, "ix": 4 }, "sa": { "a": 0, "k": 0, "ix": 5 }, "nm": "Transform" }], "nm": "Group 1", "np": 2, "cix": 2, "bm": 0, "ix": 1, "mn": "ADBE Vector Group", "hd": false }], "ip": 0, "op": 300.00001221925, "st": 0, "ct": 1, "bm": 0 }, { "ddd": 0, "ind": 2, "ty": 4, "nm": "Layer 1 Outlines", "sr": 1, "ks": { "o": { "a": 0, "k": 100, "ix": 11 }, "r": { "a": 0, "k": 0, "ix": 10 }, "p": { "a": 0, "k": [63.5, 64.5, 0], "ix": 2, "l": 2 }, "a": { "a": 0, "k": [48.5, 48.5, 0], "ix": 1, "l": 2 }, "s": { "a": 1, "k": [{ "i": { "x": [0.13, 0.13, 0.13], "y": [1, 1, 1] }, "o": { "x": [0.87, 0.87, 0.87], "y": [0, 0, 0] }, "t": 10, "s": [100, 100, 100] }, { "i": { "x": [0.13, 0.13, 0.13], "y": [1, 1, 1] }, "o": { "x": [0.87, 0.87, 0.87], "y": [0, 0, 0] }, "t": 25, "s": [116, 116, 100] }, { "i": { "x": [0.13, 0.13, 0.13], "y": [1, 1, 1] }, "o": { "x": [0.87, 0.87, 0.87], "y": [0, 0, 0] }, "t": 42, "s": [110, 110, 100] }, { "i": { "x": [0.13, 0.13, 0.13], "y": [1, 1, 1] }, "o": { "x": [0.87, 0.87, 0.87], "y": [0, 0, 0] }, "t": 62, "s": [131, 131, 100] }, { "i": { "x": [0.13, 0.13, 0.13], "y": [1, 1, 1] }, "o": { "x": [0.87, 0.87, 0.87], "y": [0, 0, 0] }, "t": 82, "s": [110, 110, 100] }, { "t": 92.0000037472368, "s": [100, 100, 100] }], "ix": 6, "l": 2 } }, "ao": 0, "shapes": [{ "ty": "gr", "it": [{ "ind": 0, "ty": "sh", "ix": 1, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [-2.636, 2.636], [-8.485, 0], [0, 0]], "o": [[0, 0], [0, -8.485], [2.636, -2.636], [0, 0], [0, 0]], "v": [[-41.5, -20.75], [-41.5, -23.5], [-38.864, -38.864], [-23.5, -41.5], [-20.75, -41.5]], "c": false }, "ix": 2 }, "nm": "Path 1", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ind": 1, "ty": "sh", "ix": 2, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [2.636, 2.636], [0, 8.485], [0, 0]], "o": [[0, 0], [-8.485, 0], [-2.636, -2.636], [0, 0], [0, 0]], "v": [[-20.75, 41.5], [-23.5, 41.5], [-38.864, 38.864], [-41.5, 23.5], [-41.5, 20.75]], "c": false }, "ix": 2 }, "nm": "Path 2", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ind": 2, "ty": "sh", "ix": 3, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [2.636, 2.636], [8.485, 0], [0, 0]], "o": [[0, 0], [0, -8.485], [-2.636, -2.636], [0, 0], [0, 0]], "v": [[41.5, -20.75], [41.5, -23.5], [38.864, -38.864], [23.5, -41.5], [20.75, -41.5]], "c": false }, "ix": 2 }, "nm": "Path 3", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ind": 3, "ty": "sh", "ix": 4, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [2.636, -2.636], [8.485, 0], [0, 0]], "o": [[0, 0], [0, 8.485], [-2.636, 2.636], [0, 0], [0, 0]], "v": [[41.5, 20.75], [41.5, 23.5], [38.864, 38.864], [23.5, 41.5], [20.75, 41.5]], "c": false }, "ix": 2 }, "nm": "Path 4", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ty": "mm", "mm": 1, "nm": "Merge Paths 1", "mn": "ADBE Vector Filter - Merge", "hd": false }, { "ty": "st", "c": { "a": 0, "k": [0, 0, 0, 1], "ix": 3 }, "o": { "a": 0, "k": 100, "ix": 4 }, "w": { "a": 0, "k": 7, "ix": 5 }, "lc": 2, "lj": 2, "bm": 0, "nm": "Stroke 1", "mn": "ADBE Vector Graphic - Stroke", "hd": false }, { "ty": "tr", "p": { "a": 0, "k": [48.5, 48.5], "ix": 2 }, "a": { "a": 0, "k": [0, 0], "ix": 1 }, "s": { "a": 0, "k": [100, 100], "ix": 3 }, "r": { "a": 0, "k": 0, "ix": 6 }, "o": { "a": 0, "k": 100, "ix": 7 }, "sk": { "a": 0, "k": 0, "ix": 4 }, "sa": { "a": 0, "k": 0, "ix": 5 }, "nm": "Transform" }], "nm": "Group 1", "np": 6, "cix": 2, "bm": 0, "ix": 1, "mn": "ADBE Vector Group", "hd": false }], "ip": 0, "op": 300.00001221925, "st": 0, "ct": 1, "bm": 0 }], "markers": [], "props": {} }

const App: React.FC = () => {
    // --- USE CUSTOM HOOK ---
    const {
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
        isFetchingReport,
        performanceError,
        reportInputs,
        whiteLabelLogo,
        auditId,
        ownerId,
        user,
        queuePosition,
        isLongWait,
        handleAnalyze,
        handleRunNewAudit,
        handleEmailOptIn,
        setWhiteLabelLogo
    } = useAudit();

    // Helper to render error UI
    const renderError = () => {
        if (!error) return null;

        let title = "Analysis Failed";
        let message: React.ReactNode = (
            <div className="mt-2 space-y-2 text-left text-sm text-text-secondary">
                <p className="text-text-primary">
                    Please try again. If it keeps happening,{' '}
                    <Link to="/feedback" className="font-semibold text-brand underline decoration-brand/30 underline-offset-2 hover:text-brand-hover">
                        send us feedback
                    </Link>
                    .
                </p>
                <details className="mt-4 rounded-lg bg-slate-50/80 p-3" style={{ border: '0.5px solid var(--high-grey, #1A1A1A)', boxShadow: 'none' }}>
                    <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-text-secondary">Debug details</summary>
                    <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] text-text-primary">{error}</pre>
                </details>
            </div>
        );

        // 1. Scraper / Puppeteer Error (Anti-Bot / Protocol Blocks)
        if (error.toLowerCase().includes('scraper error') ||
            error.toLowerCase().includes('puppeteer') ||
            error.toLowerCase().includes('navigation failed') ||
            error.toLowerCase().includes('access denied') ||
            error.toUpperCase().includes('HTTP2_PROTOCOL_ERROR') || 
            error.toUpperCase().includes('ERR_HTTP2_PROTOCOL_ERROR')) {
            title = "Website Unreachable (Anti-Bot Protection)";
            message = (
                <div className="mt-2 space-y-2 text-left text-sm text-text-secondary">
                    <p className="font-semibold text-text-primary">
                        Action required: use screenshots instead
                    </p>
                    <p>
                        Some sites block automated access (for example{" "}
                        <code className="rounded bg-slate-100 px-1 text-xs text-text-primary">
                            ERR_HTTP2_PROTOCOL_ERROR
                        </code>
                        ). Return to the homepage and{" "}
                        <strong>upload high-quality screenshots</strong> of the
                        interface instead of using the URL.
                    </p>
                </div>
            );
        }
        // 2. Timeout Error
        else if (error.toLowerCase().includes('timed out') || error.toLowerCase().includes('timeout')) {
            title = "Analysis Timed Out";
            message = (
                <div className="mt-2 space-y-2 text-left text-sm text-text-secondary">
                    <p className="text-lg font-semibold text-text-primary">Please refresh the page.</p>
                    <p>The analysis step took too long. Refreshing usually resumes progress from your dashboard.</p>
                </div>
            );
        }
        // 3. Network / Connection Error
        else if (error.includes('Failed to fetch') || error.includes('NetworkError')) {
            title = "Network Connection Error";
            message = (
                <div className="mt-2 space-y-3 text-left text-sm text-text-secondary">
                    <p className="text-text-primary">We could not reach the analysis server. Check your connection or try disabling ad blockers for this site.</p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="inline-flex h-11 items-center justify-center rounded-lg bg-[#1A1A1A] px-5 text-sm font-bold text-white transition-colors hover:bg-black"
                    >
                        Refresh page
                    </button>
                </div>
            );
        }

        return (
            <div
                className="mx-auto mt-8 max-w-2xl animate-in rounded-lg bg-white p-6 zoom-in-95 duration-200"
                style={{ border: '0.5px solid var(--high-grey, #1A1A1A)', boxShadow: 'none' }}
            >
                <div
                    className="mb-4 flex items-center gap-3 pb-4"
                    style={{ borderBottom: '0.5px solid var(--high-grey, #1A1A1A)' }}
                >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold tracking-tight text-text-primary">{title}</h3>
                </div>
                {message}
            </div>
        );
    };

    // --- DIAGNOSTIC LOGGING ---
    console.log(`[App] Current State: auditId=${auditId}, hasReport=${!!report}, isLoading=${isLoading}, isError=${!!error}`);

    // 2. REPORT STATE (Locked or Full)
    // We only show Results if we have an auditId AND the report data is actually present.
    if (auditId && report && !isLoading) {
        console.log('[App] Rendering: ReportResultView');
        return (
            <ReportResultView
                report={report}
                user={user}
                ownerId={ownerId}
                error={error}
                renderError={renderError}
                submittedUrl={submittedUrl}
                screenshots={screenshots}
                screenshotMimeType={screenshotMimeType}
                performanceError={performanceError}
                uiAuditId={uiAuditId}
                auditId={auditId}
                reportInputs={reportInputs}
                whiteLabelLogo={whiteLabelLogo}
                animationData={qrCodeAnimationData}
                handleRunNewAudit={handleRunNewAudit}
            />
        );
    }

    // 2b. FETCHING STATE (Loading existing report)
    if (isFetchingReport) {
        return <DataLoadingScreen message="Fetching your audit report..." />;
    }

    // 3. ANALYSIS / LOADING STATE
    // Show this if specifically loading OR if we have an ID but data isn't here yet.
    if (isLoading || (auditId && !report)) {
        return (
            <div className="relative flex min-h-0 flex-1 flex-col">
                <AnalysisView
                    progress={progress}
                    loadingMessage={error ? 'Analysis Aborted' : loadingMessage}
                    microcopy={error ? 'Technical error encountered' : currentMicrocopy}
                    animationData={qrCodeAnimationData}
                    screenshot={screenshots.length > 0 ? (screenshots[0].url || screenshots[0].data) : null}
                    url={submittedUrl}
                    fullWidth={!!user}
                    auditId={auditId}
                    inputs={reportInputs}
                    isError={!!error}
                    queuePosition={queuePosition}
                    isLongWait={isLongWait}
                    onEmailOptIn={handleEmailOptIn}
                    user={user}
                />
                {error && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in slide-in-from-bottom-8 duration-500">
                        {renderError()}
                    </div>
                )}
            </div>
        );
    }


    // 4. LANDING STATE (Initial Form)
    // Only shown when no audit is being viewed/processed
    return (
        <LandingView
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            whiteLabelLogo={whiteLabelLogo}
            onWhiteLabelLogoChange={setWhiteLabelLogo}
            error={error}
            renderError={renderError}
        />
    );
};

const AppWithBoundary: React.FC = () => (
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);

export default AppWithBoundary;
