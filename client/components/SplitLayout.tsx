import React from 'react';
import { LottieAnimation } from './ui/LottieAnimation';
import { ReportRenderer } from './report/ReportRenderer';
import { Lock } from 'lucide-react';
import { SkeletonLoader } from './ui/SkeletonLoader';
import { ScanningPreview } from './ScanningPreview';
import { AnalysisReport } from '../types';

interface SplitLayoutProps {
    progress: number;
    loadingMessage: string;
    microcopy: string;
    isAnalysisComplete: boolean;
    children: React.ReactNode;
    animationData: any;
    screenshot?: string | null;
    url?: string;
    report?: AnalysisReport | null; // Made optional to fix strict type issues if report is null during scanning
    reportUrl?: string; // URL for ReportDisplay
    reportScreenshots?: any[]; // Screenshots for ReportDisplay  
    screenshotMimeType?: string;
    fullWidth?: boolean; // NEW: For full-width centered mode (already logged in)
}

export const SplitLayout: React.FC<SplitLayoutProps> = ({
    progress,
    loadingMessage,
    microcopy,
    isAnalysisComplete,
    children,
    animationData,
    screenshot,
    url,
    report,
    reportUrl = '',
    reportScreenshots = [],
    screenshotMimeType = 'image/png',
    fullWidth = false
}) => {
    return (
        <div className="min-h-screen bg-[#FFF9F0] flex flex-col md:flex-row font-sans overflow-hidden">
            {fullWidth ? (
                // FULL-WIDTH MODE: User already logged in, show centered scanning preview
                <div className="w-full py-8 md:py-12 lg:py-16 flex flex-col justify-center items-center bg-white">
                    <div className="w-full max-w-4xl px-4">
                        <div className="text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {/* Scanning Preview - Full Width */}
                            <div className="mb-8">
                                <ScanningPreview screenshot={screenshot || null} progress={progress} url={url} />
                            </div>

                            {/* Microcopy */}
                            <p className="text-text-secondary italic text-sm mb-0 animate-pulse min-h-[20px]">
                                "{microcopy}"
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                // SPLIT-SCREEN MODE: Original behavior
                <>
                    {/* LEFT SIDE: Progress / Analysis */}
                    <div className={`w-full md:w-1/2 py-8 md:py-12 lg:py-16 flex flex-col justify-center relative transition-all duration-700 ${isAnalysisComplete ? 'bg-[#F5F5F0]' : 'bg-white'}`}>
                        {isAnalysisComplete ? (
                            // ANALYSIS COMPLETE - WIDER PAGE, NO SHADOW, CLASSIC LOCK CARD
                            <div className="flex items-center justify-center w-full h-full p-4 lg:p-8">
                                {/* Page Container: Wider, Bordered, No heavy shadow */}
                                <div className="relative w-full max-w-[700px] h-[85vh] max-h-[900px] bg-white rounded-none border border-slate-200 overflow-hidden">

                                    {/* Document Header */}
                                    <div className="h-2 w-full bg-slate-50 border-b border-slate-100"></div>

                                    {/* Blurred Report Content - NOW USING SHARED RENDERER */}
                                    <div className="absolute inset-0 overflow-hidden bg-white filter blur-sm opacity-50 pointer-events-none select-none">
                                        <div className="transform origin-top w-full h-full overflow-hidden">
                                            {(() => {
                                                const isCompetitorReport = !!report?.["Competitor Analysis expert"];
                                                // Prepare screenshot if needed for StandardReportView
                                                const primaryScreenshot = reportScreenshots.find((s: any) => !s.isMobile) || reportScreenshots[0];
                                                const primaryScreenshotSrc = primaryScreenshot?.url || (primaryScreenshot?.data ? `data:image/jpeg;base64,${primaryScreenshot.data}` : undefined);

                                                return (
                                                    <div className="pointer-events-none select-none">
                                                        <ReportRenderer
                                                            report={report || null}
                                                            primaryScreenshotSrc={primaryScreenshotSrc}
                                                            isCompetitorReport={isCompetitorReport}
                                                        />
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Lock Overlay - Centered */}
                                    <div className="absolute inset-0 flex items-center justify-center p-6 z-20">
                                        <div className="relative w-full max-w-md">
                                            {/* Lock Icon Circle - Overlapping Top */}
                                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border-4 border-white z-30">
                                                <Lock className="w-9 h-9 text-white" strokeWidth={2.5} />
                                            </div>

                                            {/* Neo-Brutalist Card - High Contrast, Dark Border */}
                                            <div className="bg-white border-2 border-slate-900 rounded-2xl px-8 pt-16 pb-10 text-center relative z-10">
                                                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                                                    Unlock Complete Analysis!
                                                </h2>
                                                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                                    Login to get detailed insights and actionable recommendations.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // ACTIVE ANALYSIS STATE
                            <div className="text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="">
                                    <ScanningPreview screenshot={screenshot || null} progress={progress} url={url} />
                                </div>
                                <p className="text-text-secondary italic text-sm mb-0 mt-10 animate-pulse min-h-[20px]">
                                    "{microcopy}"
                                </p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDE: Auth Form or Content */}
                    <div className={`w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 relative transition-all duration-700 ${isAnalysisComplete ? 'bg-[#F5F5F0]' : 'bg-white'} border-l-2 border-slate-100`}>
                        <div className="w-full max-w-md">
                            {children}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
