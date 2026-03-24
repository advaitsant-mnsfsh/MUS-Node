import React, { useState } from "react";
import { useGlobalAudit } from "../../../contexts/AuditContext";
import {
  CompetitorAnalysisData,
  CompetitorComparisonItem,
} from "../../../types";
import {
  LayoutGrid,
  PenTool,
  Box,
  Palette,
  BrainCircuit,
  Accessibility,
  Target,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Globe,
} from "lucide-react";
import { ExecutiveSummaryDisplay } from "../ExecutiveSummaryDisplay";
import SiteLogo from "../../SiteLogo";
import {
  REPORT_CANVAS_BG_CLASS,
  REPORT_STICKY_BELOW_ACTION_BAR,
  REPORT_STICKY_TABLE_HEADER_ROW,
} from "../reportChrome";

interface CompetitorReportViewProps {
  data: CompetitorAnalysisData;
  primaryUrl?: string;
  competitorUrl?: string;
  primaryScreenshot?: string;
  competitorScreenshot?: string;
  isSharedView?: boolean;
}

/** Same body copy tokens as `AuditCards` / Standard report parameter cards (`text-sm` → `--text-sm`, etc.). */
const REPORT_BODY_CLASS = "text-sm leading-relaxed text-slate-800 font-medium";

export const CompetitorReportView: React.FC<CompetitorReportViewProps> = ({
  data,
  primaryUrl = "Your Website",
  competitorUrl = "Competitor Website",
  primaryScreenshot,
  competitorScreenshot,
}) => {
  /** Toggle strip sits under the action bar only (nav is outside scroll `main` in-app). */
  const stickyTopClass = REPORT_STICKY_BELOW_ACTION_BAR;
  const tableHeaderTopClass = REPORT_STICKY_TABLE_HEADER_ROW;
  const PROD_URL = "https://mus-node-production.up.railway.app";

  // --- HELPERS ---
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    const img = e.currentTarget;
    const currentSrc = img.src;

    // ONLY fallback if we are on localhost and the image failed on localhost
    if (
      window.location.hostname === "localhost" &&
      currentSrc.includes("localhost")
    ) {
      console.log(
        "[ReportDisplay] Local image failed, trying Railway fallback...",
      );
      img.src = currentSrc.replace(/http:\/\/localhost:\d+/, PROD_URL);
    } else {
      console.error("[ReportDisplay] Image Load Failed:", currentSrc);
    }
  };

  const [activeTab, setActiveTab] = useState<
    "UX" | "Product" | "Visual" | "Strategy" | "Accessibility"
  >("UX");

  const getDisplayName = (urlStr: string) => {
    if (
      !urlStr ||
      urlStr === "Your Website" ||
      urlStr === "Competitor Website" ||
      urlStr === "Primary URL" ||
      urlStr === "Competitor URL" ||
      urlStr === "Manual Upload"
    ) {
      return urlStr;
    }
    let hostname = "";
    try {
      // Handle cases with protocol
      if (urlStr.includes("://")) {
        hostname = new URL(urlStr).hostname;
      } else {
        hostname = urlStr.split("/")[0];
      }
      hostname = hostname.replace(/^www\./, "");
    } catch (e) {
      hostname = urlStr
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0];
    }

    if (hostname && hostname.length > 0) {
      return hostname.charAt(0).toUpperCase() + hostname.slice(1);
    }
    return hostname;
  };

  // --- Helper Components (Brutalism Styled) ---

  const StrengthCard = ({
    title,
    description,
  }: {
    title: string;
    description: string;
    impact: string;
  }) => (
    <div className="bg-white p-5 border-2 border-black hover:-translate-x-px hover:-translate-y-px transition-all duration-200 group">
      <div className="flex items-start gap-4 mb-3">
        <div className="p-2 bg-emerald-100 text-black border-2 border-black">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-black leading-tight text-lg">
            {title}
          </h4>
        </div>
      </div>
      <p
        className={`${REPORT_BODY_CLASS} border-t-2 border-black/10 pt-3 mt-1`}
      >
        {description}
      </p>
    </div>
  );

  const CompetitorCard = ({
    title,
    description,
    impact,
  }: {
    title: string;
    description: string;
    impact: string;
  }) => (
    <div className="bg-white p-5 border-2 border-black hover:-translate-x-px hover:-translate-y-px transition-all duration-200 group">
      <div className="flex items-start gap-4 mb-3">
        <div className="p-2 bg-blue-100 text-black border-2 border-black">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-black leading-tight text-lg">
            {title}
          </h4>
        </div>
      </div>
      <p
        className={`${REPORT_BODY_CLASS} border-t-2 border-black/10 pt-3 mt-1`}
      >
        {description}
      </p>
    </div>
  );

  const OpportunityCard = ({
    title,
    actionPlan,
    index,
  }: {
    title: string;
    actionPlan: string;
    index: number;
  }) => (
    <div className="bg-white rounded-xl border border-[#F2D58A] px-6 py-6 md:px-7 md:py-7 flex flex-col h-full">
      <div className="text-2xl font-semibold text-[#C48A00] mb-3">
        {String(index + 1).padStart(2, "0")}
      </div>
      <h4 className="text-base md:text-lg font-semibold text-[#8B5A00] leading-snug mb-3">
        {title}
      </h4>
      <p className={REPORT_BODY_CLASS}>{actionPlan}</p>
    </div>
  );

  // --- Tab Navigation ---
  const TABS = [
    { id: "UX", label: "UX Face-off", icon: PenTool },
    { id: "Product", label: "Product Face-off", icon: Box },
    { id: "Visual", label: "Visual Face-off", icon: Palette },
    { id: "Strategy", label: "Strategy Face-off", icon: BrainCircuit },
    {
      id: "Accessibility",
      label: "Accessibility Face-off",
      icon: Accessibility,
    },
  ];

  // --- Comparison Table ---
  const ComparisonTable = ({
    items,
    title,
    stickyTopClass,
  }: {
    items: CompetitorComparisonItem[];
    title: string;
    stickyTopClass: string;
  }) => {
    if (!items || items.length === 0)
      return (
        <div className="p-12 text-center bg-white border-2 border-dashed border-report-border">
          <p className="text-black font-bold">
            No comparison data available for this section.
          </p>
        </div>
      );

    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-lg border border-report-border bg-white overflow-visible">
        {/*
          Mobile + horizontal scroll: any `overflow-x-auto` ancestor becomes a scrollport;
          browsers then treat `position:sticky` on `th` relative to that box — header “drops”
          mid-table. Fix: `max-md:static` on headers; keep `md:sticky` when inner is
          `md:overflow-visible` (no trapping scrollport).
        */}
        <div className="overflow-x-auto [-webkit-overflow-scrolling:touch] md:overflow-visible">
          <table className="w-full max-md:min-w-[640px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F0F4F8] border-b border-report-border">
                <th
                  className={`max-md:static md:sticky ${stickyTopClass} z-10 w-1/4 border-r border-report-border bg-[#F0F4F8] p-5 text-sm font-black uppercase tracking-wider text-black align-middle`}
                >
                  Parameter
                </th>
                <th
                  className={`max-md:static md:sticky ${stickyTopClass} z-10 w-24 border-r border-report-border bg-[#F0F4F8] p-5 text-center align-middle`}
                >
                  <div className="flex items-center justify-center">
                    <SiteLogo
                      domain={primaryUrl}
                      size="tiny"
                      className="!shadow-none !rounded-sm"
                    />
                  </div>
                </th>
                <th
                  className={`max-md:static md:sticky ${stickyTopClass} z-10 w-24 border-r border-report-border bg-[#F0F4F8] p-5 text-center align-middle`}
                >
                  <div className="flex items-center justify-center">
                    <SiteLogo
                      domain={competitorUrl}
                      size="tiny"
                      className="!shadow-none !rounded-sm"
                    />
                  </div>
                </th>
                <th
                  className={`max-md:static md:sticky ${stickyTopClass} z-10 min-w-[300px] bg-[#F0F4F8] p-5 text-sm font-black uppercase tracking-wider text-black align-middle`}
                >
                  Observations
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-report-border">
              {items.map((item, idx) => {
                const primary = Number(item.PrimaryScore);
                const competitor = Number(item.CompetitorScore);
                const isPrimaryBetter = primary >= competitor;

                const primaryCellBg = isPrimaryBetter
                  ? "bg-[#E9FAE8]"
                  : "bg-white";
                const competitorCellBg =
                  competitor > primary ? "bg-[#FFEDEC]" : "bg-white";

                return (
                  <tr key={idx} className="transition-colors group">
                    <td className="p-5 text-sm font-semibold text-slate-900 leading-relaxed">
                      {item.Parameter.replace(/([A-Z])/g, " $1").trim()}
                    </td>

                    {/* Primary Score */}
                    <td
                      className={`p-5 text-center ${primaryCellBg} border-x border-report-border`}
                    >
                      <div className="mx-auto w-10 h-10 flex items-center justify-center text-sm font-bold text-black">
                        {item.PrimaryScore}
                      </div>
                    </td>

                    {/* Competitor Score */}
                    <td
                      className={`p-5 text-center ${competitorCellBg} border-r border-report-border`}
                    >
                      <div className="mx-auto w-10 h-10 flex items-center justify-center text-sm font-bold text-black">
                        {item.CompetitorScore}
                      </div>
                    </td>

                    <td className={`p-5 ${REPORT_BODY_CLASS}`}>
                      {item.Analysis}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`font-['DM_Sans'] space-y-12 pb-12 ${REPORT_CANVAS_BG_CLASS}`}
    >
      {/* 1. TOP SECTION: same top rhythm as StandardReportView hero (`pt-6 md:pt-8`) */}
      <div className="animate-in fade-in slide-in-from-bottom-4 w-full pt-6 md:pt-8 duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-report-border bg-white relative">
          {/* VS Badge (Absolute Center) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-14 h-14 bg-accent-yellow rounded-full border-1 border-black flex items-center justify-center text-black font-black italic text-xl">
              VS
            </div>
          </div>

          {/* Left: YOU */}
          <div className="bg-white p-6 md:p-8 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-report-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="border-1 border-black overflow-hidden">
                <SiteLogo
                  domain={primaryUrl}
                  size="small"
                  className="shadow-none border-none rounded-none"
                />
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-black break-all">
                  {getDisplayName(primaryUrl)}
                </h3>
              </div>
            </div>
            {/* Primary Screenshot Area */}
            <div className="w-full aspect-video bg-white border border-report-border overflow-hidden relative group">
              {primaryScreenshot ? (
                <img
                  src={primaryScreenshot}
                  onError={handleImageError}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  alt="Primary Site"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 bg-[radial-gradient(#00000022_1px,transparent_1px)] bg-size-[16px_16px]">
                  <span className="text-sm font-bold text-black bg-white px-3 py-1 border-2 border-black">
                    No Preview
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: THEM */}
          <div className="bg-slate-100 p-6 md:p-8 flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2 justify-end">
              <div className="flex flex-col items-end">
                <h3 className="text-xl font-bold text-black break-all text-right">
                  {getDisplayName(competitorUrl)}
                </h3>
              </div>
              <div className="border-1 border-black overflow-hidden">
                <SiteLogo
                  domain={competitorUrl}
                  size="small"
                  className="shadow-none border-none rounded-none"
                />
              </div>
            </div>
            {/* Competitor Screenshot Area */}
            <div className="w-full aspect-video bg-white border border-report-border overflow-hidden relative group">
              {competitorScreenshot ? (
                <img
                  src={competitorScreenshot}
                  onError={handleImageError}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  alt="Competitor Site"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center relative overflow-hidden bg-[radial-gradient(#00000022_1px,transparent_1px)] bg-size-[16px_16px]">
                  {/* Simple Brutalist Placeholder */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="px-4 py-2 bg-white font-black text-black border-2 border-black shadow-neo rotate-[-2deg]">
                      PREVIEW LOADING...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. COMPETITIVE LANDSCAPE — typography + shell aligned with StandardReportView Executive Summary */}
      <div className="mt-10 w-full max-w-full self-stretch bg-white border border-report-border rounded-lg p-6 md:p-8 text-left">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="h-9 w-1 shrink-0 bg-brand border border-black"
            aria-hidden
          />
          <h2 className="text-2xl font-black text-black uppercase tracking-tight">
            Competitive Landscape
          </h2>
        </div>
        {data.ExecutiveSummary ? (
          <ExecutiveSummaryDisplay
            summaryText={data.ExecutiveSummary}
            twoColumns
          />
        ) : (
          <p className="text-sm leading-relaxed text-slate-500 italic">
            No executive summary available for this analysis.
          </p>
        )}
      </div>

      {/* 3. STRATEGIC ANALYSIS GRID — gaps match Action Plan cards (gap-4 / md:gap-6) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 lg:items-stretch">
        {/* COLUMN 1: YOUR STRENGTHS */}
        <div className="flex min-h-0 flex-col gap-6 lg:h-full">
          <div className="flex shrink-0 items-center gap-3">
            <div className="border border-report-border text-black p-1.5 rounded-md bg-white">
              <SiteLogo
                domain={primaryUrl}
                size="tiny"
                className="shadow-none border-none rounded-none"
              />
            </div>
            <h3 className="text-2xl  font-black text-black uppercase">
              Your Wins
            </h3>
          </div>
          <div className="flex min-h-0 flex-1 flex-col bg-white p-6 border border-report-border rounded-lg">
            <div className="mb-4 flex items-start gap-3 rounded-md border border-report-border bg-[#E7FBE8] p-4">
              {/* <div
                className="mt-0.5 h-0 w-0 shrink-0 bg-brand border border-black"
                aria-hidden
              /> */}
              <div className="min-w-0">
                <h4 className="text-xl font-black leading-tight text-black">
                  Where you are winning
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  A consolidated view of your key competitive strengths.
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {data.PrimaryStrengths?.map((str, i) => (
                <li key={i} className={REPORT_BODY_CLASS}>
                  <span className="font-semibold text-slate-900">
                    {str.Strength}
                  </span>
                  {str.Description && (
                    <>
                      {": "}
                      <span className="font-medium text-slate-800">
                        {str.Description}
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* COLUMN 2: COMPETITOR STRENGTHS */}
        <div className="flex min-h-0 flex-col gap-6 lg:h-full">
          <div className="flex shrink-0 items-center gap-3">
            <div className="border border-report-border text-black p-1.5 rounded-md bg-white">
              <SiteLogo
                domain={competitorUrl}
                size="tiny"
                className="shadow-none border-none rounded-none"
              />
            </div>
            <h3 className="text-2xl font-black text-black uppercase">
              Their Wins
            </h3>
          </div>
          <div className="flex min-h-0 flex-1 flex-col bg-white p-6 border border-report-border rounded-lg">
            <div className="mb-4 flex items-start gap-3 rounded-md border border-report-border bg-[#FFEDED] p-4">
              {/* <div
                className="mt-0.5 h-9 w-1 shrink-0 bg-brand border border-black"
                aria-hidden
              /> */}
              <div className="min-w-0">
                <h4 className="text-xl font-black leading-tight text-black">
                  Where they are winning
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  High‑impact strengths your competitor currently owns.
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {data.CompetitorStrengths?.map((str, i) => (
                <li key={i} className={REPORT_BODY_CLASS}>
                  <span className="font-semibold text-slate-900">
                    {str.Strength}
                  </span>
                  {str.Description && (
                    <>
                      {": "}
                      <span className="font-medium text-slate-800">
                        {str.Description}
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ROW 3: OPPORTUNITIES (FULL WIDTH BELOW) */}
        <div className="lg:col-span-2 mt-4">
          <div className="w-full bg-[#FFF6D9] border border-[#F2D58A] rounded-2xl px-4 py-4 md:px-6 md:py-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-[#FFE7A0] rounded-full flex items-center justify-center">
                <TrendingUp
                  className="w-4 h-4 text-[#C48A00]"
                  strokeWidth={2.5}
                />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-[#8B5A00]">
                Action Plan
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {data.Opportunities?.map((opp, i) => (
                <OpportunityCard
                  key={i}
                  title={opp.Opportunity}
                  actionPlan={opp.ActionPlan}
                  index={i}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. DETAILED COMPARISON TABLE */}
      <div className="pt-2">
        {/* Header & Tabs - Sticky (mirror StandardReportView) */}
        <div
          className={`sticky ${stickyTopClass} z-20 w-full bg-white border border-report-border-muted px-4 sm:px-6 py-6 mb-12 rounded-lg shadow-none transition-all duration-300`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-black text-black uppercase">
                Detailed Face-off
              </h3>
            </div>

            {/* Filter Navbar */}
            <nav
              className="flex w-full min-w-0 max-w-full flex-nowrap items-center gap-2 overflow-x-auto bg-white p-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Face-off categories"
            >
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-[6px] whitespace-nowrap py-3 px-2 font-medium text-[12px] transition-all border rounded-md ${
                      isActive
                        ? "bg-accent-yellow text-black  border-black"
                        : "bg-transparent text-slate-600 border-report-border-muted hover:bg-slate-50 hover:text-black hover:border-slate-300"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-black" : "text-slate-500"}`}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Render Active Table (separate content container, like StandardReportView) */}
        <div className="flex flex-col gap-10 pb-12 w-full">
          {activeTab === "UX" && (
            <ComparisonTable
              items={data.UXComparison}
              title="User Experience"
              stickyTopClass={tableHeaderTopClass}
            />
          )}
          {activeTab === "Product" && (
            <ComparisonTable
              items={data.ProductComparison}
              title="Product Value"
              stickyTopClass={tableHeaderTopClass}
            />
          )}
          {activeTab === "Visual" && (
            <ComparisonTable
              items={data.VisualComparison}
              title="Visual Design"
              stickyTopClass={tableHeaderTopClass}
            />
          )}
          {activeTab === "Strategy" && (
            <ComparisonTable
              items={data.StrategyComparison}
              title="Strategy"
              stickyTopClass={tableHeaderTopClass}
            />
          )}
          {activeTab === "Accessibility" && (
            <ComparisonTable
              items={data.AccessibilityComparison}
              title="Accessibility"
              stickyTopClass={tableHeaderTopClass}
            />
          )}
        </div>
      </div>
    </div>
  );
};
