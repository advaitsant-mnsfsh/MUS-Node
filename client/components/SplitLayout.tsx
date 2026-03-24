import React from 'react';
import { ScanningPreview } from './ScanningPreview';
import { ReportContainer } from './report/ReportContainer';
import { AnalysisReport, AuditInput, Screenshot } from '../types';

interface SplitLayoutProps {
    progress: number;
    loadingMessage: string;
    microcopy: string;
    isAnalysisComplete: boolean;
    animationData: any;
    screenshot: string | undefined | null;
    url: string;
    fullWidth: boolean;
    children?: React.ReactNode;
    // Optional props for completed report preview
    report?: AnalysisReport;
    reportUrl?: string;
    reportScreenshots?: Screenshot[];
    screenshotMimeType?: string;
    inputs?: any[]; // Allow inputs for ScanningPreview
    reportInputs?: AuditInput[];
    isError?: boolean;
}

export const SplitLayout: React.FC<SplitLayoutProps> = ({
    progress,
    loadingMessage,
    microcopy,
    isAnalysisComplete,
    animationData,
    screenshot,
    url,
    fullWidth,
    children,
    report,
    reportUrl,
    reportScreenshots,
    screenshotMimeType,
    inputs,
    reportInputs,
    isError
}) => {
    // Fill Layout main (flex-1 + min-h-0): do not use content height or 100dvh calc — that
    // lets the full report dictate flex item height and blows up page scroll.
    const shellClass =
        'relative flex w-full min-h-0 flex-1 flex-col overflow-hidden bg-page-bg';

    // If fullWidth (user is logged in during analysis), show only the preview
    if (fullWidth) {
        return (
            <div className={`${shellClass} p-4`}>
                <div className="flex min-h-0 flex-1 items-center justify-center">
                    <div className="w-full max-w-5xl">
                        <ScanningPreview
                            screenshot={screenshot || null}
                            progress={progress}
                            url={url}
                            loadingMessage={loadingMessage}
                            inputs={inputs}
                            isError={isError}
                        />
                    </div>
                </div>
                {/* Overlay for children (like Queue Notice) in full-width mode */}
                {children && (
                    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center p-4">
                        <div className="pointer-events-auto w-full max-w-md">
                            {children}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Mobile (<lg): analysis in progress → only LHS preview (no login column). Complete + report → only RHS (blur + login).
    // Rare complete-without-report keeps legacy stacked two rows.
    const hideRightOnMobile = !isAnalysisComplete;
    const hideLeftOnMobile = !!(isAnalysisComplete && report);
    const mobileStackedLegacy = isAnalysisComplete && !report;

    // Split: one screen tall; report scrolls inside RHS only (minmax(0,1fr) row + min-h-0 cells)
    return (
        <div className={shellClass}>
            <div
                className={`grid min-h-0 w-full flex-1 grid-cols-1 gap-0 overflow-hidden lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)] ${
                    mobileStackedLegacy
                        ? 'max-lg:grid-rows-[minmax(200px,auto)_minmax(0,1fr)]'
                        : 'max-lg:grid-rows-1'
                }`}
            >
                {/* Left: browser / scan preview */}
                <div
                    className={`flex min-h-0 min-w-0 items-center justify-center overflow-y-auto overflow-x-hidden bg-page-bg p-4 sm:p-5 lg:h-full lg:max-h-full lg:[border-right:0.5px_solid_var(--high-grey,#1A1A1A)] ${
                        hideLeftOnMobile ? 'hidden lg:flex' : 'flex'
                    } ${
                        hideRightOnMobile && !hideLeftOnMobile
                            ? 'max-lg:min-h-0 max-lg:flex-1'
                            : ''
                    } ${
                        mobileStackedLegacy
                            ? 'max-lg:max-h-[min(42vh,360px)]'
                            : ''
                    }`}
                >
                    <ScanningPreview
                        screenshot={screenshot || null}
                        progress={progress}
                        url={url}
                        loadingMessage={loadingMessage}
                        inputs={inputs}
                        isError={isError}
                    />
                </div>

                {/* Right: login during analysis, or blurred report + login when complete */}
                <div
                    className={`min-h-0 min-w-0 flex-col items-stretch justify-center overflow-hidden bg-white lg:flex lg:h-full lg:max-h-full ${
                        hideRightOnMobile ? 'hidden lg:flex' : 'flex'
                    } ${hideLeftOnMobile ? 'max-lg:flex-1' : ''}`}
                >
                    {isAnalysisComplete && report ? (
                        <div className="relative h-full min-h-0 w-full min-w-0 overflow-hidden">
                            <div className="h-full min-h-0 overflow-y-auto overscroll-contain pointer-events-none">
                                {report && reportUrl && (
                                    <ReportContainer
                                        report={report}
                                        url={reportUrl}
                                        screenshots={reportScreenshots || []}
                                        screenshotMimeType={screenshotMimeType || 'image/png'}
                                        performanceError={null}
                                        auditId={null}
                                        onRunNewAudit={() => { }}
                                        whiteLabelLogo={null}
                                        inputs={reportInputs ?? []}
                                        teaserMode
                                    />
                                )}
                            </div>
                            {/* Login + frosted veil above report; z above report so it is never covered */}
                            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-4 lg:p-6">
                                <div
                                    className="absolute inset-0 bg-page-bg/15"
                                    aria-hidden
                                />
                                <div
                                    className="absolute inset-0 backdrop-blur-[6px] sm:backdrop-blur-sm"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                                    aria-hidden
                                />
                                <div className="relative z-30 w-full max-w-md pointer-events-auto">
                                    {children}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto">
                            {children}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
