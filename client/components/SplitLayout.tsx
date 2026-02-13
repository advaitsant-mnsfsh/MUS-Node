import React from 'react';
import { ScanningPreview } from './ScanningPreview';
import { ReportContainer } from './report/ReportContainer';
import { AnalysisReport, Screenshot } from '../types';

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
    isError
}) => {
    // If fullWidth (user is logged in during analysis), show only the preview
    if (fullWidth) {
        return (
            <div className="h-[calc(100vh-5rem)] bg-page-bg flex items-center justify-center p-4">
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
        );
    }

    // Split layout: Preview on left, content (login/report preview) on right
    return (
        <div className="h-[calc(100vh-5rem)] bg-page-bg overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0 h-full">
                {/* Left Side: Scanning Preview */}
                <div className="bg-page-bg flex items-center justify-center p-4 lg:p-8 border-r-2 border-border-main">
                    <ScanningPreview
                        screenshot={screenshot || null}
                        progress={progress}
                        url={url}
                        loadingMessage={loadingMessage}
                        inputs={inputs}
                        isError={isError}
                    />
                </div>

                {/* Right Side: Content (Login Panel or Report Preview) */}
                <div className="bg-white flex items-center justify-center p-4 lg:p-8">
                    {isAnalysisComplete && report ? (
                        // Show blurred report preview
                        <div className="w-full h-full overflow-hidden relative">
                            <div className="absolute inset-0 backdrop-blur-sm bg-white/50 z-10 flex items-center justify-center">
                                {children}
                            </div>
                            <div className="blur-md pointer-events-none">
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
                                        inputs={[]}
                                    />
                                )}
                            </div>
                        </div>
                    ) : (
                        // Show children (typically LoginPanel)
                        children
                    )}
                </div>
            </div>
        </div>
    );
};
