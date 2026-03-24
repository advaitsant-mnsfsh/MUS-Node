/**
 * Report shell chrome — colors live in `client/index.css` @theme:
 * - `--color-report-border` → Tailwind `border-report-border`, `divide-report-border`, …
 * - `--color-report-border-muted` → `border-report-border-muted`
 *
 * Use those utilities in StandardReportView + CompetitorReportView so greys stay in sync.
 */
export const REPORT_BORDER_HEX = {
  default: "#d4d4d4",
  muted: "#e6e6e6",
} as const;

/**
 * Horizontal page gutter for report body — same as `GlobalNavbar` inner row
 * (`px-4 sm:px-6 lg:px-8`). Use on `ReportRenderer` wrapper + align action bar.
 */
export const REPORT_PAGE_GUTTER_X = "px-4 sm:px-6 lg:px-8" as const;

/**
 * Full-width report canvas (cool gray) — use on `ReportLayout` so horizontal gutters
 * match the in-content area; same tone as former Standard/Competitor view roots.
 */
export const REPORT_CANVAS_BG_CLASS = "bg-[#f9fafb]" as const;

/**
 * Sticky offsets inside the report scroll area (Layout `main` or shared full-page scroll).
 * `ReportLayout` sets `--report-action-bar-height` via ResizeObserver on the action bar so
 * the toggle row sits flush under it (standard one-line vs competitor two-line title).
 * Fallback rem values approximate a typical bar before the first measurement.
 */
export const REPORT_STICKY_BELOW_ACTION_BAR =
  "top-[var(--report-action-bar-height,4.5rem)]" as const;

/**
 * Shared shell for “Score Breakdown” (standard) and “Detailed Face-off” (competitor):
 * padding, title weight/size, tab pills — keep in sync via these tokens.
 * Pair with `sticky` + `REPORT_STICKY_BELOW_ACTION_BAR` on the outer element.
 */
/** Sticky card only — no bottom margin (margin lives on outer wrapper so `<thead>` sticky `top` math matches visible bar). */
export const REPORT_STICKY_FILTER_BAR_CORE =
  "z-30 w-full bg-white border border-report-border-muted px-4 sm:px-6 py-4 sm:py-5 rounded-lg shadow-none transition-all duration-300" as const;

/** Space below the filter strip (non-sticky wrapper). */
export const REPORT_STICKY_FILTER_BAR_SPACING_BELOW = "mb-10 sm:mb-12" as const;

export const REPORT_STICKY_FILTER_INNER_ROW =
  "flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between md:gap-6" as const;

export const REPORT_STICKY_FILTER_TITLE_WRAP = "w-full md:w-auto" as const;

export const REPORT_STICKY_FILTER_TITLE =
  "text-xl sm:text-2xl font-black text-black uppercase" as const;

export const REPORT_STICKY_FILTER_NAV =
  "relative z-50 flex w-full md:w-auto items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" as const;

/** Tab pill base — icon `w-4 h-4`; active/idle classes below */
export const REPORT_STICKY_FILTER_TAB_BASE =
  "shrink-0 flex items-center gap-[6px] whitespace-nowrap py-2.5 px-3 font-medium text-[12px] leading-none transition-all border rounded-lg" as const;

export const REPORT_STICKY_FILTER_TAB_ACTIVE =
  "bg-accent-yellow text-black border-black" as const;

export const REPORT_STICKY_FILTER_TAB_IDLE =
  "bg-transparent text-slate-600 border-report-border-muted hover:bg-slate-50 hover:text-black hover:border-slate-300" as const;

/**
 * Competitor table `<thead>`: sticks flush under the sticky “Detailed Face-off” bar.
 * `--report-competitor-filter-bar-height` = measured face-off `offsetHeight` (px), no extra fudge.
 */
export const REPORT_STICKY_TABLE_HEADER_ROW =
  "top-[calc(var(--report-action-bar-height,4.5rem)+var(--report-competitor-filter-bar-height,7rem))]" as const;
