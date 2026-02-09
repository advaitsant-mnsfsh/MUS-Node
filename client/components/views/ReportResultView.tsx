import React from 'react';
import { SplitLayout } from '../SplitLayout';
import { LoginPanel } from '../LoginPanel';
import { ReportContainer } from '../report/ReportContainer';
import { AnalysisReport, Screenshot, AuditInput } from '../../types';

interface ReportResultViewProps {
    report: AnalysisReport;
    user: any;
    error: string | null;
    renderError: () => React.ReactNode;
    // Data props
    submittedUrl: string;
    screenshots: Screenshot[];
    screenshotMimeType: string;
    performanceError: string | null;
    uiAuditId: string | null;
    auditId: string | undefined;
    reportInputs: AuditInput[];
    whiteLabelLogo: string | null;
    // Animation
    animationData: any;
    // Actions
    handleRunNewAudit: () => void;
}

export const ReportResultView: React.FC<ReportResultViewProps> = ({
    report,
    user,
    error,
    renderError,
    submittedUrl,
    screenshots,
    screenshotMimeType,
    performanceError,
    uiAuditId,
    auditId,
    reportInputs,
    whiteLabelLogo,
    animationData,
    handleRunNewAudit
}) => {

    // 2. LOCKED REPORT STATE (Unauthenticated)
    if (!user) {
        return (
            <SplitLayout
                progress={100}
                loadingMessage="Analysis Complete"
                microcopy="Unlock to view full report"
                isAnalysisComplete={true}
                animationData={animationData}
                screenshot={screenshots.length > 0 ? screenshots[0].data : null}
                url={submittedUrl}
                fullWidth={false}
                report={report}
                reportUrl={submittedUrl}
                reportScreenshots={screenshots}
                screenshotMimeType={screenshotMimeType}
            >
                <div className="flex flex-col items-center justify-center w-full h-full animate-in fade-in duration-500">
                    <LoginPanel auditId={uiAuditId || auditId} />
                </div>
            </SplitLayout>
        );
    }

    // 3. FULL REPORT STATE (Authenticated)
    return (
        <div className="min-h-screen bg-page-bg text-slate-800 font-sans">
            <div className="w-full mx-auto">
                <main>
                    {error && renderError()}
                    {!error && (
                        <div>
                            <ReportContainer
                                report={report}
                                url={submittedUrl || 'Analyzed Site'}
                                screenshots={screenshots}
                                screenshotMimeType={screenshotMimeType}
                                performanceError={performanceError}
                                auditId={uiAuditId || auditId || null}
                                onRunNewAudit={handleRunNewAudit}
                                whiteLabelLogo={whiteLabelLogo}
                                inputs={reportInputs}
                            />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
