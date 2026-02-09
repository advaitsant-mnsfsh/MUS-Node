import React from 'react';
import { AnalysisReport, Screenshot, AuditInput } from '../../types';
import { Logo } from '../Logo';
import { UserBadge } from '../UserBadge';
import { SkeletonLoader } from '../SkeletonLoader';
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
    competitorScreenshotSrc?: string;
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
    competitorScreenshotSrc,
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

                {!isReportReady && <div className="p-8"><SkeletonLoader className="h-screen w-full" /></div>}

                {isReportReady && report && (
                    <>
                        {/* ACTION BAR (Neo-Brutalist Refinement) */}
                        <div className="px-6 py-4 border-b-2 border-black bg-white flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-30">

                            {/* LEFT: Branding & Inputs */}
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                {/* Back Button (Square Neo Style) */}
                                <button
                                    onClick={onRunNewAudit}
                                    className="w-10 h-10 flex items-center justify-center bg-white border-2 border-black text-black shadow-neo hover:shadow-neo-hover hover:-translate-x-px hover:-translate-y-px transition-all active:shadow-none active:translate-x-0 active:translate-y-0"
                                    aria-label="Back"
                                >
                                    <ChevronLeft className="w-5 h-5 stroke-[3px]" />
                                </button>

                                {/* Divider */}
                                <div className="h-8 w-0.5 bg-black mx-2 hidden sm:block"></div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-black font-black text-xs uppercase tracking-wider hidden sm:inline">Audit Report for</span>

                                    {inputs && inputs.length > 0 ? (
                                        <>
                                            {/* Primary Pill (Box Style) */}
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black shadow-neo-sm text-sm font-bold text-black">
                                                <LinkIcon className="w-3.5 h-3.5 text-black stroke-[3px]" />
                                                <span className="truncate max-w-[250px] font-mono text-xs tracking-tight">
                                                    {inputs[0].url?.replace(/^https?:\/\//, '').replace(/\/$/, '') || (inputs[0].file ? inputs[0].file.name : 'Uploaded File')}
                                                </span>
                                            </div>

                                            {/* Count Pill */}
                                            {inputs.length > 1 && (
                                                <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border-2 border-black shadow-neo-sm text-xs font-black text-black uppercase">
                                                    <span>+ {inputs.length - 1} MORE</span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        // Fallback if inputs not ready
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black shadow-neo-sm text-sm font-bold text-black">
                                            <LinkIcon className="w-3.5 h-3.5 text-black stroke-[3px]" />
                                            <span className="truncate max-w-[250px] font-mono text-xs tracking-tight">{url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT: Actions */}
                            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                {/* Share Button (Icon Only) */}
                                {!isSharedView && (
                                    <button
                                        onClick={onShareAudit}
                                        disabled={isSharing}
                                        className="w-10 h-10 flex items-center justify-center bg-white border-2 border-black text-black rounded-none shadow-neo hover:shadow-neo-hover hover:-translate-x-px hover:-translate-y-px transition-all active:shadow-none active:translate-x-0 active:translate-y-0 disabled:opacity-50"
                                        title="Share Report"
                                    >
                                        <Share2 className="w-4 h-4 stroke-[3px]" />
                                    </button>
                                )}

                                {/* PDF Button (Icon Only) */}
                                <button
                                    onClick={onGeneratePdf}
                                    disabled={isPdfGenerating}
                                    className="w-10 h-10 flex items-center justify-center bg-white border-2 border-black text-black rounded-none shadow-neo hover:shadow-neo-hover hover:-translate-x-px hover:-translate-y-px transition-all active:shadow-none active:translate-x-0 active:translate-y-0 disabled:opacity-50"
                                    title="Download PDF"
                                >
                                    <Download className="w-4 h-4 stroke-[3px]" />
                                </button>

                                {/* EXPERIMENTAL: New PDF Button */}


                                {/* New Audit Button (Text + Icon) */}
                                {!isSharedView && onRunNewAudit && (
                                    <button
                                        onClick={onRunNewAudit}
                                        className="h-10 px-6 flex items-center gap-2 bg-black border-2 border-black text-white rounded-none shadow-neo hover:shadow-neo-hover hover:-translate-x-px hover:-translate-y-px transition-all active:shadow-none active:translate-x-0 active:translate-y-0"
                                    >
                                        <span className="text-xs font-black uppercase tracking-wider">New Audit</span>
                                        <Plus className="w-4 h-4 stroke-[3px]" />
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
                                    competitorScreenshotSrc={competitorScreenshotSrc}
                                    isCompetitorReport={auditMode === 'competitor'}
                                    primaryUrl={inputs.find(i => i.role === 'primary')?.url || inputs[0]?.url || url}
                                    competitorUrl={inputs.find(i => i.role === 'competitor')?.url || inputs[1]?.url || 'Competitor Website'}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
