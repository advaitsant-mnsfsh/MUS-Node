import React, { useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnalysisReport, Screenshot, AuditInput } from "../../types";
import { Logo } from "../Logo";
import { UserBadge } from "../UserBadge";
import { SkeletonLoader } from "../SkeletonLoader";
import { AuthBlocker } from "../AuthBlocker";
import { ReportRenderer } from "./ReportRenderer";
import { REPORT_CANVAS_BG_CLASS, REPORT_PAGE_GUTTER_X } from "./reportChrome";
import { useGlobalAudit } from "../../contexts/AuditContext";
import {
  ChevronLeft,
  Share2,
  Download,
  AlertCircle,
  FileText,
  LayoutTemplate,
} from "lucide-react";
import SiteLogo from "../SiteLogo";

interface ReportLayoutProps {
  report: AnalysisReport | null;
  isReportReady: boolean;
  auditMode: "standard" | "competitor";

  // Auth & Locking
  isLocked: boolean;
  isAuthLoading: boolean;
  onUnlock: () => void;
  url: string;
  auditId: string | null;
  ownerId?: string | null;
  /** Split-column unlock teaser: skip AuthBlocker and content blur */
  teaserMode?: boolean;

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

// --- Helper: get main URL display string from inputs ---
const getMainUrlDisplay = (
  inputs: AuditInput[] | undefined,
  fallbackUrl: string,
) => {
  const mainInput = inputs && inputs.length > 0 ? inputs[0] : null;
  return mainInput
    ? mainInput.customName ||
        mainInput.url?.replace(/^https?:\/\//, "")?.replace(/\/$/, "") ||
        mainInput.fileName ||
        mainInput.file?.name ||
        "Uploaded File"
    : fallbackUrl?.replace(/^https?:\/\//, "")?.replace(/\/$/, "") ||
        "Analyzed Site";
};

// --- "+N more" link with tooltip (no pill) for action bar ---
const MoreUrlsTooltip = ({ inputs }: { inputs: AuditInput[] }) => {
  const isUpload = inputs[0]?.type === "upload";
  const moreCount = inputs.length > 1 ? inputs.length - 1 : 0;
  const totalCount = inputs.length;
  const show = (isUpload && totalCount > 0) || (!isUpload && moreCount > 0);
  if (!show) return null;
  return (
    <div className="relative group cursor-pointer ml-1 shrink-0">
      <span className="text-sm font-semibold text-brand hover:underline decoration-2 underline-offset-2 whitespace-nowrap">
        {isUpload
          ? `${totalCount} item${totalCount > 1 ? "s" : ""}`
          : `+${moreCount} more`}
      </span>
      <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 shadow-lg p-3 z-50 hidden group-hover:block animate-in fade-in slide-in-from-top-1 rounded-lg">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">
          {isUpload
            ? `Uploaded Screenshot${totalCount > 1 ? "s" : ""}`
            : `Analyzed URLs (${totalCount})`}
        </div>
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
          {(isUpload ? inputs : inputs.slice(1))?.map((input, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 text-xs font-medium text-slate-700"
            >
              <div className="w-1.5 h-1.5 bg-brand rounded-full shrink-0 mt-1.5" />
              <span className="font-mono break-all pb-1 border-b border-slate-50 last:border-0 w-full">
                {input.url?.replace(/^https?:\/\//, "")?.replace(/\/$/, "") ||
                  input.fileName ||
                  input.file?.name ||
                  "Screenshot"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENT: URL Group with Tooltip (for competitor / +N more) ---
const UrlPillGroup = ({
  inputs,
  fallbackUrl,
  label,
}: {
  inputs?: AuditInput[];
  fallbackUrl?: string;
  label?: string;
}) => {
  const mainInput = inputs && inputs.length > 0 ? inputs[0] : null;
  const isUpload = mainInput?.type === "upload";
  const mainUrlDisplay = getMainUrlDisplay(inputs, fallbackUrl || "");
  const moreCount = inputs && inputs.length > 1 ? inputs.length - 1 : 0;
  const totalCount = inputs?.length || 0;

  return (
    <div className="flex items-center gap-2">
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-sm text-slate-900 min-w-0 rounded-sm"
        title={mainUrlDisplay}
      >
        <SiteLogo
          domain={mainInput?.url || mainUrlDisplay}
          size="tiny"
          className="shadow-none border-none p-0 rounded-none bg-transparent"
          customIcon={mainInput?.customFavicon}
        />
        <span className="truncate max-w-[120px] md:max-w-[200px] font-mono text-sm tracking-tight">
          {mainUrlDisplay}
        </span>
      </div>
      {((isUpload && totalCount > 0) || (!isUpload && moreCount > 0)) && (
        <div className="relative group cursor-pointer ml-1">
          <span className="text-sm font-black text-brand hover:underline decoration-2 underline-offset-2 whitespace-nowrap">
            {isUpload
              ? `${totalCount} item${totalCount > 1 ? "s" : ""}`
              : `+${moreCount} more`}
          </span>
          <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 shadow-lg p-3 z-50 hidden group-hover:block animate-in fade-in slide-in-from-top-1 rounded-lg">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">
              {isUpload
                ? `Uploaded Screenshot${totalCount > 1 ? "s" : ""}`
                : `Analyzed URLs (${totalCount})`}
            </div>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {(isUpload ? inputs : inputs?.slice(1))?.map((input, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs font-medium text-slate-700"
                >
                  <div className="w-1.5 h-1.5 bg-brand rounded-full shrink-0 mt-1.5"></div>
                  <span className="font-mono break-all pb-1 border-b border-slate-50 last:border-0 w-full">
                    {input.url
                      ?.replace(/^https?:\/\//, "")
                      ?.replace(/\/$/, "") ||
                      input.fileName ||
                      input.file?.name ||
                      "Screenshot"}
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
  auditId,
  ownerId,
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
  inputs = [],
  teaserMode = false,
}) => {
  const navigate = useNavigate();
  const actionBarRef = useRef<HTMLDivElement | null>(null);
  /** Drives sticky `top` for Score Breakdown / Detailed Face-off (matches real bar height for standard vs competitor). */
  const [actionBarHeightPx, setActionBarHeightPx] = useState(72);

  useLayoutEffect(() => {
    const el = actionBarRef.current;
    if (!el) return;
    const measure = () =>
      setActionBarHeightPx(Math.round(el.getBoundingClientRect().height));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isReportReady, report, teaserMode, auditMode]);

  // Split inputs by role
  const primaryInputs = inputs.filter((i) => i.role === "primary" || !i.role);
  const competitorInputs = inputs.filter((i) => i.role === "competitor");

  return (
    <div>
      {/* Header */}

      {/* Main content: cool gray canvas full width; action bar row stays white */}
      <div
        className={REPORT_CANVAS_BG_CLASS}
        style={
          {
            ["--report-action-bar-height"]: `${actionBarHeightPx}px`,
          } as React.CSSProperties
        }
      >
        {pdfError && (
          <div className="m-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {pdfError}
          </div>
        )}

        {!isReportReady && (
          <div className="p-8">
            <SkeletonLoader className="h-screen w-full" />
          </div>
        )}

        {isReportReady && report && (
          <>
            {/* ACTION BAR — hidden in split-column unlock teaser (LoginPanel is the only chrome) */}
            {!teaserMode && (
            <div
              ref={actionBarRef}
              className={`${REPORT_PAGE_GUTTER_X} py-3 md:py-4 border-b border-[#E0E1E9] bg-white flex flex-row justify-between items-center gap-2 md:gap-4 z-40 sticky top-0`}
            >
              {/* LEFT: Back + optional logo + two-line title (2nd design) */}
              <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                {/* Back — thin stroke, dark grey, no divider */}
                {!isSharedView && (
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-9 h-9 flex shrink-0 items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
                    aria-label="Back"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[1.25]" />
                  </button>
                )}

                {/* Left text area: differs for standard vs competitor */}
                {auditMode === "standard" && (
                  <>
                    {/* Logo square — assessed site favicon (user white label shows on right) */}
                    {(() => {
                      const primaryInputsOrInputs =
                        primaryInputs.length > 0 ? primaryInputs : inputs;
                      const mainInput = primaryInputsOrInputs?.[0];
                      const primaryUrl = mainInput?.url || url;
                      const primaryDisplay = getMainUrlDisplay(
                        primaryInputsOrInputs,
                        url,
                      );
                      return (
                        <div
                          className="h-12 w-12 md:h-11 border p-1 md:w-11 flex shrink-0 items-center justify-center bg-white overflow-hidden"
                          title={primaryDisplay}
                        >
                          <SiteLogo
                            domain={primaryUrl || primaryDisplay}
                            size="tiny"
                            className="shadow-none border-0 rounded-none w-full h-full min-w-0 min-h-0 p-0"
                            customIcon={mainInput?.customFavicon ?? undefined}
                          />
                        </div>
                      );
                    })()}

                    {/* Two-line: "Deep Assessment for" + URL */}
                    <div className="flex flex-col min-w-0 gap-0.5">
                      <span className="text-slate-500 text-xs md:text-sm font-normal">
                        Deep Assessment for
                      </span>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span
                          className="text-slate-900 text-sm md:text-base font-medium truncate max-w-[140px] md:max-w-[280px]"
                          title={getMainUrlDisplay(
                            primaryInputs.length > 0 ? primaryInputs : inputs,
                            url,
                          )}
                        >
                          {getMainUrlDisplay(
                            primaryInputs.length > 0 ? primaryInputs : inputs,
                            url,
                          )}
                        </span>
                        {(primaryInputs.length > 0 ? primaryInputs : inputs)
                          .length > 1 && (
                          <MoreUrlsTooltip
                            inputs={
                              primaryInputs.length > 0 ? primaryInputs : inputs
                            }
                          />
                        )}
                      </div>
                    </div>
                  </>
                )}

                {auditMode === "competitor" && (
                  <div className="flex flex-col min-w-0 gap-0.5">
                    <span className="text-slate-500 text-xs md:text-sm font-normal">
                      Competitor Assessment for
                    </span>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                      {/* Primary URL + favicon */}
                      <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
                        <div className="h-6 w-6  bg-white overflow-hidden flex items-center justify-center shrink-0">
                          <SiteLogo
                            domain={primaryInputs?.[0]?.url || url}
                            size="tiny"
                            className="w-full h-full min-w-0 min-h-0 p-0 shadow-none border-0 rounded-none"
                          />
                        </div>
                        <span
                          className="text-slate-900 text-sm md:text-base font-medium truncate max-w-[140px] md:max-w-[220px]"
                          title={getMainUrlDisplay(primaryInputs, url)}
                        >
                          {getMainUrlDisplay(primaryInputs, url)}
                        </span>
                      </div>

                      <span className="text-slate-400 text-sm font-medium">
                        vs
                      </span>

                      {/* Competitor URL + favicon */}
                      <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
                        <div className="h-6 w-6 bg-white overflow-hidden flex items-center justify-center shrink-0">
                          <SiteLogo
                            domain={
                              competitorInputs?.[0]?.url || "Competitor Site"
                            }
                            size="tiny"
                            className="w-full h-full min-w-0 min-h-0 p-0 shadow-none border-0 rounded-none"
                          />
                        </div>
                        <span
                          className="text-slate-900 text-sm md:text-base font-medium truncate max-w-[140px] md:max-w-[220px]"
                          title={getMainUrlDisplay(
                            competitorInputs,
                            "Competitor Site",
                          )}
                        >
                          {getMainUrlDisplay(
                            competitorInputs,
                            "Competitor Site",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: User white label (from landing) + Actions */}
              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                {/* White label from landing page — only if user provided logo via URL input */}
                {whiteLabelLogo && (
                  <div
                    className="h-10 w-10 border md:h-11 md:w-11 flex shrink-0 items-center justify-center bg-white overflow-hidden"
                    title="Organization Logo"
                  >
                    <img
                      src={whiteLabelLogo}
                      alt="Logo"
                      className="h-full w-full object-contain p-0.5"
                    />
                  </div>
                )}

                {/* Share Button (Icon Only) */}
                {!isSharedView && (
                  <button
                    onClick={onShareAudit}
                    disabled={isSharing}
                    className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-none  disabled:opacity-50"
                    title="Share Report"
                  >
                    <Share2 className="w-6 h-6 stroke-[2px]" />
                  </button>
                )}

                {/* PDF Button (Icon Only) */}
                <button
                  onClick={onGeneratePdf}
                  disabled={isPdfGenerating}
                  className="w-10 h-10 flex items-center justify-center  text-black rounded-none disabled:opacity-50"
                  title="Download PDF (Detailed)"
                >
                  <Download className="w-6 h-6 stroke-[2px]" />
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
            )}

            {/* Content Area with Auth Lock */}
            <div className="relative">
              {isLocked && !isAuthLoading && !teaserMode && (
                <AuthBlocker
                  isUnlocked={false}
                  onUnlock={onUnlock}
                  auditUrl={url}
                  auditId={auditId}
                  ownerId={ownerId}
                />
              )}

              <div
                className={`transition-all duration-500 ${
                  isLocked && teaserMode
                    ? "pointer-events-none select-none"
                    : isLocked
                      ? "blur-sm pointer-events-none select-none"
                      : ""
                }`}
              >
                <ReportRenderer
                  report={report}
                  primaryScreenshotSrc={primaryScreenshotSrc}
                  competitorScreenshotSrc={competitorScreenshotSrc}
                  isCompetitorReport={auditMode === "competitor"}
                  primaryUrl={
                    inputs.find((i) => i.role === "primary")?.url ||
                    inputs[0]?.url ||
                    url
                  }
                  competitorUrl={
                    inputs.find((i) => i.role === "competitor")?.url ||
                    inputs[1]?.url ||
                    "Competitor Website"
                  }
                  isSharedView={isSharedView}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
