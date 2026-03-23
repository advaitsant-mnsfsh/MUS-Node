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
 * Competitor table `<thead>`: action bar + “Detailed Face-off” sticky block. The second term
 * matches `py-6` + title + tab row (~column on small screens, single row on `md+`).
 */
export const REPORT_STICKY_TABLE_HEADER_ROW =
  "top-[calc(var(--report-action-bar-height,4.5rem)+9.75rem)] md:top-[calc(var(--report-action-bar-height,4.75rem)+6.25rem)]" as const;
