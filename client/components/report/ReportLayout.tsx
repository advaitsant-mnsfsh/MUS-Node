import React from 'react';
import { AnalysisReport, Screenshot, AuditInput } from '../../types';
import { Logo } from '../Logo';
import { UserBadge } from '../UserBadge';
import { SkeletonLoader } from '../ui/SkeletonLoader';
import { AuthBlocker } from '../AuthBlocker';
import { ReportRenderer } from './ReportRenderer';
import { ChevronLeft, Link as LinkIcon, Share2, Download, Plus } from 'lucide-react';

interface ReportLayoutProps {
    report: AnalysisReport | null;
    isReportReady: boolean;
    auditMode: 'standard' | 'competitor';

    // Auth & Locking
    isLocked: boolean;
    isAuthLoading: boolean;
    onUnlock: () => void;
    url: string;

    // UI Props
    whiteLabelLogo?: string | null;
    isSharedView: boolean;
    primaryScreenshotSrc?: string;
    pdfError?: string | null;

    // Actions
    onGeneratePdf: () => void;
    isPdfGenerating: boolean;
    onShareAudit: () => void;
    isSharing: boolean;
    onRunNewAudit?: () => void;
    inputs?: AuditInput[];
}

export const ReportLayout: React.FC<ReportLayoutProps> = ({
    report,
    isReportReady,
    auditMode,
    isLocked,
    isAuthLoading,
    onUnlock,
    url,
    whiteLabelLogo,
    isSharedView,
    primaryScreenshotSrc,
    pdfError,
    onGeneratePdf,
    isPdfGenerating,
    onShareAudit,
    isSharing,
    onRunNewAudit,
    inputs = []
}) => {
    return (
        <div>
            {/* Header */}


            {/* Main Content */}
            <div className="bg-white overflow-hidden">
                {pdfError && <div className="m-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{pdfError}</div>}

                {!isReportReady && <div className="p-8"><SkeletonLoader className="h-[100vh] w-full" /></div>}

                {isReportReady && report && (
                    <>
                        {/* ACTION BAR (Wireframe Match) */}
                        <div className="px-6 py-4 border-b border-slate-200 bg-white flex flex-col md:flex-row justify-between items-center gap-4">

                            {/* LEFT: Branding & Inputs */}
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                {/* Back Button */}
                                <button
                                    onClick={onRunNewAudit}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors hover:bg-slate-50 rounded-lg"
                                    aria-label="Back"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-slate-500 font-medium text-sm hidden sm:inline">Audit Report for</span>

                                    {inputs && inputs.length > 0 ? (
                                        <>
                                            {/* Primary Pill */}
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold text-slate-700">
                                                <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="truncate max-w-[250px] font-mono text-xs">
                                                    {inputs[0].type === 'url' ? inputs[0].url?.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'Uploaded File'}
                                                </span>
                                            </div>

                                            {/* Count Pill */}
                                            {inputs.length > 1 && (
                                                <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-500">
                                                    <span>+ {inputs.length - 1} View More</span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        // Fallback if inputs not ready
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold text-slate-700">
                                            <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="truncate max-w-[250px] font-mono text-xs">{url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT: Actions */}
                            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                {/* Share Button (Icon Only) */}
                                {!isSharedView && (
                                    <button
                                        onClick={onShareAudit}
                                        disabled={isSharing}
                                        className="w-10 h-10 flex items-center justify-center bg-white border-2 border-slate-900 text-slate-900 rounded-none shadow-neo hover:shadow-neo-hover hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all active:shadow-none active:translate-x-0 active:translate-y-0 font-bold"
                                        title="Share Report"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                )}

                                {/* PDF Button (Icon Only) */}
                                <button
                                    onClick={onGeneratePdf}
                                    disabled={isPdfGenerating}
                                    className="w-10 h-10 flex items-center justify-center bg-white border-2 border-slate-900 text-slate-900 rounded-none shadow-neo hover:shadow-neo-hover hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all active:shadow-none active:translate-x-0 active:translate-y-0 font-bold"
                                    title="Download PDF"
                                >
                                    <Download className="w-4 h-4" />
                                </button>

                                {/* New Audit Button (Text + Icon) */}
                                {!isSharedView && onRunNewAudit && (
                                    <button
                                        onClick={onRunNewAudit}
                                        className="h-10 px-4 flex items-center gap-2 bg-white border-2 border-slate-900 text-slate-900 rounded-none shadow-neo hover:shadow-neo-hover hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all active:shadow-none active:translate-x-0 active:translate-y-0 font-bold"
                                    >
                                        <span>New Audit</span>
                                        <Plus className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content Area with Auth Lock */}
                        <div className="relative">
                            {isLocked && !isAuthLoading && <AuthBlocker isUnlocked={false} onUnlock={onUnlock} auditUrl={url} />}

                            <div className={`transition-all duration-500 ${isLocked ? 'blur-sm pointer-events-none select-none h-[600px] overflow-hidden' : ''}`}>
                                <ReportRenderer
                                    report={report}
                                    primaryScreenshotSrc={primaryScreenshotSrc}
                                    isCompetitorReport={auditMode === 'competitor'}
                                    primaryUrl={inputs[0]?.url || url}
                                    competitorUrl={inputs[1]?.url || 'Competitor Website'}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
