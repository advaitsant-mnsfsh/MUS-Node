import React from 'react';
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
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
                    <div className="max-w-xl w-full bg-white p-8 rounded-xl shadow-2xl border border-red-200">
                        <h1 className="text-2xl font-bold text-red-800 mb-4">Application Crashed</h1>
                        <p className="mb-4 text-gray-600">Something went wrong while rendering the UI.</p>
                        <div className="bg-gray-100 p-4 rounded overflow-auto max-h-64 text-sm font-mono border border-gray-300">
                            {this.state.error?.toString()}
                        </div>
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
        user,
        handleAnalyze,
        handleRunNewAudit,
        setWhiteLabelLogo
    } = useAudit();

    // Helper to render error UI
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
            <div className="relative">
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
