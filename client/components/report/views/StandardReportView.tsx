import React, { useState, useMemo } from "react";
import { AnalysisReport } from "../../../types";
import { SkeletonLoader } from "../../SkeletonLoader";
import { ScoreDisplayCard } from "../ScoreComponents";
import { CriticalIssueCard } from "../AuditCards";
import { DetailedAuditView, DetailedAuditType } from "../DetailedAuditView";
import AccessibilityAuditView from "../AccessibilityAuditView";
import { PenTool, Palette, Box, Accessibility, Target } from "lucide-react";
import { ExecutiveSummaryDisplay } from "../ExecutiveSummaryDisplay";
import {
  REPORT_CANVAS_BG_CLASS,
  REPORT_STICKY_BELOW_ACTION_BAR,
  REPORT_STICKY_FILTER_BAR_CORE,
  REPORT_STICKY_FILTER_BAR_SPACING_BELOW,
  REPORT_STICKY_FILTER_INNER_ROW,
  REPORT_STICKY_FILTER_NAV,
  REPORT_STICKY_FILTER_TAB_ACTIVE,
  REPORT_STICKY_FILTER_TAB_BASE,
  REPORT_STICKY_FILTER_TAB_IDLE,
  REPORT_STICKY_FILTER_TITLE,
  REPORT_STICKY_FILTER_TITLE_WRAP,
} from "../reportChrome";

interface StandardReportViewProps {
  report: AnalysisReport;
  primaryScreenshotSrc?: string;
  isSharedView?: boolean;
}

/** DOM ids for Score Breakdown tabs — must match section roots below (no `&` in ids). */
const SECTION_ELEMENT_IDS: Record<string, string> = {
  "UX & Heuristics": "section-ux-heuristics",
  "Visual Design": "section-visual-design",
  "Product Fit": "section-product-fit",
  "Accessibility Audit": "section-accessibility-audit",
};

const SECTION_SCROLL_SPY: { id: string; elementId: string }[] = [
  { id: "UX & Heuristics", elementId: "section-ux-heuristics" },
  { id: "Visual Design", elementId: "section-visual-design" },
  { id: "Product Fit", elementId: "section-product-fit" },
  { id: "Accessibility Audit", elementId: "section-accessibility-audit" },
];

/**
 * App shell scrolls inside Layout `<main data-app-scroll-root>` (overflow-y-auto).
 * Routes without Layout (e.g. `/shared/:id`) use the document/window scroller.
 */
function getAppScrollRoot(): HTMLElement {
  const marked = document.querySelector("[data-app-scroll-root]");
  if (marked instanceof HTMLElement) return marked;
  return document.documentElement;
}

function getScrollTop(container: HTMLElement): number {
  if (
    container === document.documentElement ||
    container === document.body
  ) {
    return window.scrollY;
  }
  return container.scrollTop;
}

function scrollTopOfElementInContainer(
  element: HTMLElement,
  container: HTMLElement,
): number {
  return (
    element.getBoundingClientRect().top -
    container.getBoundingClientRect().top +
    getScrollTop(container)
  );
}

function scrollContainerToY(container: HTMLElement, top: number) {
  const y = Math.max(0, top);
  if (
    container === document.documentElement ||
    container === document.body
  ) {
    window.scrollTo({ top: y, behavior: "smooth" });
  } else {
    container.scrollTo({ top: y, behavior: "smooth" });
  }
}

export const StandardReportView: React.FC<StandardReportViewProps> = ({
  report,
  primaryScreenshotSrc,
}) => {
  // --- DATA EXTRACT ---
  const {
    "UX Audit expert": ux,
    "Product Audit expert": product,
    "Visual Audit expert": visual,
    "Strategy Audit expert": strategy,
    "Accessibility Audit expert": accessibility,
  } = report;

  const [activeTab, setActiveTab] = useState("UX & Heuristics");
  const isClickScrolling = React.useRef(false);
  const scrollTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const TABS = [
    { id: "UX & Heuristics", label: "UX & Heuristics", icon: PenTool },
    { id: "Visual Design", label: "Visual Design", icon: Palette },
    { id: "Product Fit", label: "Product Fit", icon: Box },
    { id: "Accessibility Audit", label: "Accessibility", icon: Accessibility },
  ];

  // Calculate Overall Score
  const overallScore = useMemo(() => {
    if (!report) return 0;
    const scores = [
      ux?.CategoryScore,
      product?.CategoryScore,
      visual?.CategoryScore,
      accessibility?.CategoryScore,
    ].filter((s) => typeof s === "number") as number[];
    if (scores.length === 0) return 0;
    return (
      Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
    );
  }, [ux, product, visual, accessibility, report]);

  const stickyTopClass = REPORT_STICKY_BELOW_ACTION_BAR;

  // --- HELPERS ---
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    const img = e.currentTarget;
    const currentSrc = img.src;
    const PROD_URL = "https://mus-node-production.up.railway.app";

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

  /** Navbar + action bar + Score Breakdown sticky — lower = section sits slightly higher in view */
  const SCROLL_OFFSET_PX = 220;

  const handleTabClick = (tabId: string) => {
    const elementId = SECTION_ELEMENT_IDS[tabId];
    const element = elementId ? document.getElementById(elementId) : null;
    if (!element) return;

    isClickScrolling.current = true;
    setActiveTab(tabId);

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 1800);

    const runScroll = () => {
      const root = getAppScrollRoot();
      const targetTop =
        scrollTopOfElementInContainer(element, root) - SCROLL_OFFSET_PX;
      scrollContainerToY(root, targetTop);
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(runScroll);
    });
  };

  React.useEffect(() => {
    const root = getAppScrollRoot();
    if (root === document.documentElement) {
      window.scrollTo(0, 0);
    } else {
      root.scrollTop = 0;
    }
  }, []);

  React.useEffect(() => {
    const root = getAppScrollRoot();
    const scrollEventTarget: EventTarget =
      root === document.documentElement ? window : root;

    const handleScroll = () => {
      if (isClickScrolling.current) return;

      const scrollTop = getScrollTop(root);
      const scrollPosition = scrollTop + 300;
      let currentSection = "UX & Heuristics";

      for (const section of SECTION_SCROLL_SPY) {
        const element = document.getElementById(section.elementId);
        if (element) {
          const top = scrollTopOfElementInContainer(element, root);
          if (scrollPosition >= top) {
            currentSection = section.id;
          }
        }
      }

      const firstEl = document.getElementById(SECTION_SCROLL_SPY[0].elementId);
      if (firstEl) {
        const firstTop = scrollTopOfElementInContainer(firstEl, root);
        if (scrollPosition < firstTop) {
          currentSection = "UX & Heuristics";
        }
      }

      const viewH =
        root === document.documentElement
          ? window.innerHeight
          : root.clientHeight;
      const scrollHeight =
        root === document.documentElement
          ? document.documentElement.scrollHeight
          : root.scrollHeight;
      const scrollBottom = scrollTop + viewH;
      const maxScroll = Math.max(0, scrollHeight - 2);
      if (scrollBottom >= maxScroll - 50 && accessibility) {
        currentSection = "Accessibility Audit";
      }

      setActiveTab(currentSection);
    };

    scrollEventTarget.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    handleScroll();
    return () =>
      scrollEventTarget.removeEventListener("scroll", handleScroll);
  }, [ux, visual, product, accessibility, report]);

  return (
    <>
      <div className={`font-['DM_Sans'] ${REPORT_CANVAS_BG_CLASS}`}>
        {/* 1. TOP SECTION: Score card + Preview — action bar ke niche gap, container shadow nahi */}
        <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 pt-6 md:pt-8 mb-12 w-full">
          <div className="relative flex flex-col lg:flex-row lg:items-stretch border border-report-border bg-white overflow-hidden">
            {/* LEFT COLUMN: Overall Score + 4 rings sab isi card ke andar (50%) */}
            <div className="relative z-10 w-full lg:w-1/2 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-report-border flex flex-col overflow-visible lg:min-h-[520px]">
              {/* Decoration: scores area ke top-left & top-right */}
              <div
                className="absolute top-0 left-0 w-36 h-36 md:w-44 md:h-44 bg-[#fefdeb] -translate-x-1/3 -translate-y-1/3 rotate-[38deg] z-0 pointer-events-none"
                aria-hidden
              />
              <div
                className="absolute top-0 right-0 w-36 h-36 md:w-44 md:h-44 bg-[#fefdeb] -translate-x-1/3 -translate-y-1/3 -rotate-[42deg] z-0 pointer-events-none"
                aria-hidden
              />
              {/* Overall Score — top, center */}
              <div className="flex justify-center w-full py-4 md:py-6">
                <ScoreDisplayCard
                  score={overallScore}
                  label="Overall Score"
                  isHero={true}
                />
              </div>
              {/* 4 category rings — isi card ke andar, Overall ke niche ek line me */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-2">
                {ux ? (
                  <ScoreDisplayCard
                    score={ux.CategoryScore}
                    label="UX and Heuristics"
                  />
                ) : (
                  <SkeletonLoader className="h-32 border border-report-border shadow-neo rounded-none" />
                )}
                {product ? (
                  <ScoreDisplayCard
                    score={product.CategoryScore}
                    label="Product Fit"
                  />
                ) : (
                  <SkeletonLoader className="h-32 border border-report-border shadow-neo rounded-none" />
                )}
                {visual ? (
                  <ScoreDisplayCard
                    score={visual.CategoryScore}
                    label="Visual Design"
                  />
                ) : (
                  <SkeletonLoader className="h-32 border border-report-border shadow-neo rounded-none" />
                )}
                {accessibility ? (
                  <ScoreDisplayCard
                    score={accessibility.CategoryScore}
                    label="Accessibility"
                  />
                ) : (
                  <SkeletonLoader className="h-32 border border-report-border shadow-neo rounded-none" />
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Preview — flex se image area poori height le, bottom white space nahi */}
            <div className="w-full lg:w-1/2 relative flex flex-col bg-slate-100 h-80 md:h-[440px] lg:min-h-[605px] lg:h-full overflow-hidden">
              {/* Image area — flex-1 se bachi hui saari height le */}
              <div className="relative flex-1 min-h-0 w-full">
                {primaryScreenshotSrc ? (
                  <img
                    src={primaryScreenshotSrc}
                    className="absolute inset-0 w-full h-full object-cover object-top-left transition-transform duration-700 hover:scale-105"
                    alt="Analyzed Page Preview"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-50">
                    <div className="bg-white px-4 py-2 border-2 border-black">
                      <span className="font-bold text-black">
                        Analyzing Interface...
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {/* Overlay Badge */}
              <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end pointer-events-none">
                <span className="text-[10px] font-black text-black uppercase tracking-wider bg-white px-2 py-1 border border-report-border-muted mb-1">
                  Analyzed Website
                </span>
              </div>
            </div>
          </div>

          {/* Executive Summary — full width of parent, left-aligned (no extra margin so it lines up with score card) */}
          <div className="mt-10 w-full max-w-full self-stretch bg-white border border-report-border rounded-lg p-6 md:p-8 text-left">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-6">
              Executive Summary
            </h2>
            {strategy?.ExecutiveSummary ? (
              <ExecutiveSummaryDisplay
                summaryText={strategy.ExecutiveSummary}
                twoColumns
              />
            ) : (
              <div
                className={`p-6 ${REPORT_CANVAS_BG_CLASS} border border-report-border border-dashed`}
              >
                <SkeletonLoader className="h-4 w-3/4 mb-2" />
                <SkeletonLoader className="h-4 w-full mb-2" />
                <SkeletonLoader className="h-4 w-5/6" />
              </div>
            )}
          </div>

          {/* 2. MIDDLE SECTION: Context Capture (Full Width Below Split) */}
          <div className="mt-12 w-full">
            {/* <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-accent-yellow border-1 border-black text-black">
                <Target className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-black uppercase">
                Strategic Foundation
              </h3>
            </div> */}
            <DetailedAuditView
              auditData={strategy}
              auditType={"Strategic Foundation"}
            />
          </div>
        </div>

        {/* 3. BOTTOM SECTION: Score Breakdown & Detailed Cards */}
        <div className="pt-2">
          <div className={REPORT_STICKY_FILTER_BAR_SPACING_BELOW}>
            <div
              className={`sticky ${stickyTopClass} ${REPORT_STICKY_FILTER_BAR_CORE}`}
            >
              <div className={REPORT_STICKY_FILTER_INNER_ROW}>
                <div className={REPORT_STICKY_FILTER_TITLE_WRAP}>
                  <h3 className={REPORT_STICKY_FILTER_TITLE}>
                    Score Breakdown
                  </h3>
                </div>

                <nav className={REPORT_STICKY_FILTER_NAV}>
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        type="button"
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`${REPORT_STICKY_FILTER_TAB_BASE} ${
                          isActive
                            ? REPORT_STICKY_FILTER_TAB_ACTIVE
                            : REPORT_STICKY_FILTER_TAB_IDLE
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
          </div>

          {/* All Content Stacked (Scroll Spy Container) */}
          <div
            id="report-sections-container"
            className="flex flex-col gap-16 animate-in nav-fade-in duration-300 pb-20 w-full"
          >
            {/* Section 1: UX & Heuristics */}
            <div id="section-ux-heuristics" className="scroll-mt-[220px]">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-brand text-white border border-slate-200 shadow-none">
                  <PenTool className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-black text-[#996F00] uppercase">
                  UX & Heuristics
                </h3>
              </div>
              <DetailedAuditView auditData={ux} auditType={"UX Audit"} />
            </div>

            {/* Section 2: Visual Design */}
            <div id="section-visual-design" className="scroll-mt-[220px]">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500 text-white border border-slate-200 shadow-none">
                  <Palette className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-black text-[#996F00] uppercase">
                  Visual Design
                </h3>
              </div>
              <DetailedAuditView
                auditData={visual}
                auditType={"Visual Design"}
              />
            </div>

            {/* Section 3: Product Fit */}
            <div id="section-product-fit" className="scroll-mt-[220px]">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-500 text-white border border-slate-200 shadow-none">
                  <Box className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-black text-[#996F00] uppercase">
                  Product Fit
                </h3>
              </div>
              <DetailedAuditView
                auditData={product}
                auditType={"Product Audit"}
              />
            </div>

            {/* Section 4: Accessibility */}
            <div id="section-accessibility-audit" className="scroll-mt-[220px]">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500 text-white border border-slate-200 shadow-none">
                  <Accessibility className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-black text-[#996F00] uppercase">
                  Accessibility
                </h3>
              </div>
              <AccessibilityAuditView data={accessibility} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
