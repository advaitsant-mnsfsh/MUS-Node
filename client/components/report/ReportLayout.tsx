import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnalysisReport, Screenshot, AuditInput } from '../../types';
import { Logo } from '../Logo';
import { UserBadge } from '../UserBadge';
import { SkeletonLoader } from '../SkeletonLoader';
import { AuthBlocker } from '../AuthBlocker';
import { ReportRenderer } from './ReportRenderer';
import { useGlobalAudit } from '../../contexts/AuditContext';
import { ChevronLeft, Share2, Download, AlertCircle, FileText, LayoutTemplate } from 'lucide-react';
import SiteLogo from '../SiteLogo';

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
    onGenerateAlternativePdf?: () => void;
    onGenerateHybridPdf?: () => void; // New prop
    isPdfGenerating: boolean;
    onShareAudit: () => void;
    isSharing: boolean;
    onRunNewAudit?: () => void;
    inputs?: AuditInput[];
}

// --- HELPER COMPONENT: URL Group with Tooltip ---
const UrlPillGroup = ({ inputs, fallbackUrl, label }: { inputs?: AuditInput[], fallbackUrl?: string, label?: string }) => {
    // 1. Determine Main URL to show
    const mainInput = inputs && inputs.length > 0 ? inputs[0] : null;
    const isUpload = mainInput?.type === 'upload';

    const mainUrlDisplay = mainInput
        ? (mainInput.customName || mainInput.url?.replace(/^https?:\/\//, '')?.replace(/\/$/, '') || (mainInput.fileName || mainInput.file?.name || 'Uploaded File'))
        : (fallbackUrl?.replace(/^https?:\/\//, '')?.replace(/\/$/, '') || 'Analyzed Site');

    // 2. Determine "More" count / Total count
    const moreCount = inputs && inputs.length > 1 ? inputs.length - 1 : 0;
    const totalCount = inputs?.length || 0;

    return (
        <div className="flex items-center gap-2">
            {/* Main URL Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black shadow-neo-sm text-sm font-bold text-black min-w-0" title={mainUrlDisplay}>
                <SiteLogo domain={mainInput?.url || mainUrlDisplay} size="tiny" className="shadow-none border-none p-0 rounded-none bg-transparent" customIcon={mainInput?.customFavicon} />
                <span className="truncate max-w-[120px] md:max-w-[200px] font-mono text-sm tracking-tight">
                    {mainUrlDisplay}
                </span>
            </div>

            {/* "+N More" or Total Count with Tooltip */}
            {((isUpload && totalCount > 0) || (!isUpload && moreCount > 0)) && (
                <div className="relative group cursor-pointer ml-1">
                    <span className="text-sm font-black text-brand hover:underline decoration-2 underline-offset-2 whitespace-nowrap">
                        {isUpload ? `${totalCount} item${totalCount > 1 ? 's' : ''}` : `+${moreCount} more`}
                    </span>

                    {/* Tooltip Dropdown */}
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white border-2 border-black shadow-neo p-3 z-50 hidden group-hover:block animate-in fade-in slide-in-from-top-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">
                            {isUpload ? `Uploaded Screenshot${totalCount > 1 ? 's' : ''}` : `Analyzed URLs (${totalCount})`}
                        </div>
                        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                            {(isUpload ? inputs : inputs?.slice(1))?.map((input, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-700">
                                    <div className="w-1.5 h-1.5 bg-brand rounded-full shrink-0 mt-1.5"></div>
                                    <span className="font-mono break-all pb-1 border-b border-slate-50 last:border-0 w-full">
                                        {input.url?.replace(/^https?:\/\//, '')?.replace(/\/$/, '') || input.fileName || input.file?.name || 'Screenshot'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

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
    onGenerateAlternativePdf,
    onGenerateHybridPdf,
    isPdfGenerating,
    onShareAudit,
    isSharing,
    onRunNewAudit,
    inputs = []
}) => {
    const navigate = useNavigate();

    // Split inputs by role
    const primaryInputs = inputs.filter(i => i.role === 'primary' || !i.role);
    const competitorInputs = inputs.filter(i => i.role === 'competitor');

    return (
        <div>
            {/* Header */}


            {/* Main Content */}
            <div className="bg-white">
                {pdfError && <div className="m-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{pdfError}</div>}

                {!isReportReady && <div className="p-8"><SkeletonLoader className="h-screen w-full" /></div>}

                {isReportReady && report && (
                    <>
                        {/* ACTION BAR (Neo-Brutalist Refinement) */}
                        <div className={`px-4 md:px-6 py-3 md:py-4 border-b-2 border-black bg-white flex flex-row justify-between items-center gap-2 md:gap-4 z-40 ${isSharedView ? 'sticky top-0' : 'sticky top-16'}`}>

                            {/* LEFT: Branding & Inputs */}
                            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                                {/* Back Button (Square Neo Style) */}
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="w-10 h-10 flex shrink-0 items-center justify-center bg-white border-2 border-black text-black shadow-neo hover:shadow-neo-hover hover:-translate-x-px hover:-translate-y-px transition-all active:shadow-none active:translate-x-0 active:translate-y-0"
                                    aria-label="Back"
                                >
                                    <ChevronLeft className="w-5 h-5 stroke-[3px]" />
                                </button>

                                {/* Divider */}
                                <div className="h-8 w-0.5 bg-black mx-2 hidden sm:block"></div>

                                <div className="flex flex-wrap items-center gap-2 md:gap-3 min-w-0">
                                    <span className="text-black font-black text-sm uppercase tracking-wider hidden lg:inline">Audit Report for</span>

                                    {/* URL DISPLAY LOGIC */}
                                    {auditMode === 'competitor' ? (
                                        // COMPETITOR MODE: Primary vs Competitor
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* Primary Group */}
                                            <UrlPillGroup inputs={primaryInputs} fallbackUrl={url} />

                                            {/* VS Separator */}
                                            <span className="font-black text-slate-400 text-sm px-1">vs</span>

                                            {/* Competitor Group */}
                                            <UrlPillGroup inputs={competitorInputs} fallbackUrl="Competitor Site" />
                                        </div>
                                    ) : (
                                        // STANDARD MODE: Single Group
                                        <UrlPillGroup inputs={primaryInputs.length > 0 ? primaryInputs : inputs} fallbackUrl={url} />
                                    )}
                                </div>
                            </div>

                            {/* RIGHT: Actions */}
                            <div className="flex items-center gap-2 md:gap-3 shrink-0">
                                {/* White Label Logo */}
                                {whiteLabelLogo && (
                                    <div className="w-10 h-10 flex shrink-0 items-center justify-center bg-white border-2 border-black shadow-neo overflow-hidden" title="Organization Logo">
                                        <img src={whiteLabelLogo} alt="Logo" className="w-full h-full object-contain p-1" />
                                    </div>
                                )}

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
                                    title="Download PDF (Detailed)"
                                >
                                    <Download className="w-4 h-4 stroke-[3px]" />
                                </button>

                                {/* Alternative PDF Button (Summary Layout) - HIDDEN FOR NOW
                                {onGenerateAlternativePdf && (
                                    <button
                                        onClick={onGenerateAlternativePdf}
                                        disabled={isPdfGenerating}
                                        className="w-10 h-10 flex items-center justify-center bg-white border-2 border-black text-black rounded-none shadow-neo hover:shadow-neo-hover hover:-translate-x-px hover:-translate-y-px transition-all active:shadow-none active:translate-x-0 active:translate-y-0 disabled:opacity-50"
                                        title="Download PDF (Summary Layout)"
                                    >
                                        <FileText className="w-4 h-4 stroke-[3px]" />
                                    </button>
                                )}
                                */}

                                {/* Hybrid PDF Button (Split Layout) - HIDDEN FOR NOW
                                {onGenerateHybridPdf && (
                                    <button
                                        onClick={onGenerateHybridPdf}
                                        disabled={isPdfGenerating}
                                        className="w-10 h-10 flex items-center justify-center bg-white border-2 border-black text-black rounded-none shadow-neo hover:shadow-neo-hover hover:-translate-x-px hover:-translate-y-px transition-all active:shadow-none active:translate-x-0 active:translate-y-0 disabled:opacity-50"
                                        title="Download PDF (Hybrid Layout)"
                                    >
                                        <LayoutTemplate className="w-4 h-4 stroke-[3px]" />
                                    </button>
                                )}
                                */}
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
                                    isSharedView={isSharedView}
                                />
                            </div>
                        </div>
                    </>
                )
                }
            </div >
        </div >
    );
};
