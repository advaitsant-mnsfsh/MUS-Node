import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import {
  CompetitorAnalysisData,
  CompetitorComparisonItem,
} from "../../../types";

// --- DESIGN TOKENS ---
const COLORS = {
  black: "#000000",
  white: "#FFFFFF",
  pageBg: "#FFFFFF",
  brand: "#CE8100",
  slate900: "#0F172A",
  slate800: "#1E293B",
  slate600: "#475569",
  slate500: "#64748B",
  slate400: "#94A3B8",
  slate700: "#334155",
  slate200: "#E2E8F0",
  slate100: "#F1F5F9",
  primaryBlue: "#3b82f6",
  competitorRed: "#ef4444",
  emeraldSubtle: "#d1fae5",
  emeraldSolid: "#059669",
  redSubtle: "#fee2e2",
  redSolid: "#ef4444",
  // Use solid colors for score text (no background boxes).
  winGreenText: "#1AFF1A",
  loseRedText: "#FF571A",
  blueSubtle: "#dbeafe",
  amberSubtle: "#fffbeb",
  /** Comparison table (matches reference: slate borders, subtle win tints). */
  faceOffBorder: "#E2E8F0",
  faceOffHeaderBg: "#F8FAFC",
  cellPrimaryWin: "#f0fff4",
  cellCompetitorWin: "#fff5f5",
};

/** Inner content width: A4 (595.28pt) − page horizontal padding (40×2). */
const FOT_INNER_W = 515;
const FO_COL = {
  param: 128,
  score: 62,
  obs: FOT_INNER_W - 128 - 62 - 62,
} as const;

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: COLORS.pageBg,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  logoDot: {
    color: COLORS.brand,
  },
  headerDate: {
    fontSize: 9,
    color: COLORS.slate500,
  },

  // Top copy
  heroSubtitle: {
    fontSize: 11,
    color: COLORS.slate600,
    marginBottom: 4,
  },
  heroAssessment: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 14,
  },

  // Head-to-head preview row
  headToHeadRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.white,
    marginBottom: 18,
  },
  headToHeadColLeft: {
    width: "50%",
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: COLORS.slate200,
  },
  headToHeadColRight: {
    width: "50%",
    padding: 10,
  },
  siteLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  siteLabelText: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.black,
  },
  screenshotFrame: {
    width: "100%",
    height: 130,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.slate100,
    overflow: "hidden",
  },

  // Competitive Landscape
  landscapeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  landscapeBar: {
    width: 4,
    height: 18,
    backgroundColor: COLORS.brand,
    marginRight: 8,
  },
  landscapeTitle: {
    fontSize: 18,
    fontWeight: "black",
    color: COLORS.black,
  },
  landscapeText: {
    fontSize: 10,
    color: COLORS.slate900,
    lineHeight: 1.5,
    marginLeft: 12,
  },

  // Wins row (Your wins / Their wins)
  winsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 16,
  },
  winsCol: {
    width: "50%",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    padding: 10,
  },
  winsHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  winsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.brand,
    marginRight: 6,
  },
  winsTitle: {
    fontSize: 13,
    fontWeight: "black",
    color: COLORS.black,
  },
  winsItemTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 2,
  },
  winsItemText: {
    fontSize: 9,
    color: COLORS.slate800,
    lineHeight: 1.4,
    marginBottom: 6,
  },

  // Section Card
  sectionCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    marginBottom: 12,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate200,
  },

  // PDF Navbar row (tabs-like text pills)
  navRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  navPill: {
    borderWidth: 1,
    borderColor: COLORS.slate200,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  navText: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.slate600,
  },

  // Action Plan (page 2)
  actionPlanSection: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  actionPlanTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate200,
  },
  actionPlanGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  actionPlanCard: {
    width: "31%",
    backgroundColor: COLORS.emeraldSubtle,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    marginBottom: 6,
    minHeight: 0,
  },
  actionPlanNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.slate600,
    marginBottom: 10,
  },
  actionPlanCardTitle: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 10,
    lineHeight: 1.2,
  },
  actionPlanBody: {
    fontSize: 9,
    color: COLORS.slate800,
    lineHeight: 1.4,
  },

  // Divider under the top "Competitive assessment" area (for table pages)
  navDivider: {
    height: 1,
    backgroundColor: COLORS.slate200,
    marginTop: 10,
    marginBottom: 14,
  },

  faceOffTableOuter: {
    width: FOT_INNER_W,
    borderWidth: 1,
    borderColor: COLORS.faceOffBorder,
    backgroundColor: COLORS.white,
  },

  faceOffSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 8,
  },

  /** 4-column face-off grid — one <Text> per cell to avoid react-pdf row stretch bugs. */
  foTable: {
    width: FOT_INNER_W,
  },
  foHeadRow: {
    width: FOT_INNER_W,
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: COLORS.faceOffHeaderBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.faceOffBorder,
  },
  foBodyRow: {
    width: FOT_INNER_W,
    flexDirection: "row",
    alignItems: "stretch",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.faceOffBorder,
  },
  foCellParamHead: {
    width: FO_COL.param,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: COLORS.faceOffBorder,
    justifyContent: "center",
  },
  /** Both score columns — one block so vertical rules run full row height (no corner gaps). */
  foScorePairHead: {
    width: FO_COL.score * 2,
    flexDirection: "row",
    alignItems: "stretch",
    borderRightWidth: 1,
    borderRightColor: COLORS.faceOffBorder,
  },
  foCellScoreHeadSlot: {
    width: FO_COL.score,
    borderRightWidth: 1,
    borderRightColor: COLORS.faceOffBorder,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 4,
  },
  foCellScoreHeadSlotLast: {
    width: FO_COL.score,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 4,
  },
  foCellObsHead: {
    width: FO_COL.obs,
    paddingVertical: 9,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  foThLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.slate800,
    textTransform: "uppercase",
  },
  foCellParam: {
    width: FO_COL.param,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: COLORS.faceOffBorder,
    justifyContent: "center",
  },
  foParamText: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.black,
    lineHeight: 1.3,
  },
  foScorePair: {
    width: FO_COL.score * 2,
    flexDirection: "row",
    alignItems: "stretch",
    borderRightWidth: 1,
    borderRightColor: COLORS.faceOffBorder,
  },
  foScoreHalf: {
    width: FO_COL.score,
    borderRightWidth: 1,
    borderRightColor: COLORS.faceOffBorder,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  foScoreHalfLast: {
    width: FO_COL.score,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  foScoreDigit: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    lineHeight: 1,
  },
  foCellObs: {
    width: FO_COL.obs,
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  foObsText: {
    fontSize: 8,
    fontWeight: "normal",
    color: COLORS.slate800,
    lineHeight: 1.35,
  },

  // Strengths/Opportunities
  listItem: {
    marginBottom: 12,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.slate200,
  },
  listTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  listText: {
    fontSize: 9,
    color: COLORS.slate600,
    lineHeight: 1.4,
  },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.slate200,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: COLORS.slate500,
    fontWeight: "bold",
  },
});

// Helper to format camelCase to readable text
const formatParameterName = (name: string): string => {
  if (!name) return "";
  // Add space before capital letters and capitalize first letter
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

/** Large centered score only — no "/10" (matches reference PDF). */
const formatFaceOffScoreDigit = (value: unknown): string => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  const clamped = Math.max(0, Math.min(10, n));
  const rounded = Math.round(clamped * 10) / 10;
  return rounded % 1 === 0 ? String(Math.round(rounded)) : rounded.toFixed(1);
};

const normalizeObservationForPdf = (s: string) =>
  (s || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getDomainInitial = (text: string): string => {
  if (!text) return "?";
  const cleaned = text.replace(/^https?:\/\//, "").replace(/^www\./, "");
  return cleaned.charAt(0).toUpperCase() || "?";
};

const LogoBadge = ({
  label,
  tableHeader,
}: {
  label: string;
  tableHeader?: boolean;
}) => {
  const initial = getDomainInitial(label);

  return (
    <View
      style={{
        width: 18,
        height: 18,
        borderWidth: 1,
        borderColor: COLORS.slate400,
        borderRadius: 2,
        alignItems: "center",
        justifyContent: "center",
        marginRight: tableHeader ? 0 : 4,
        backgroundColor: COLORS.white,
      }}
    >
      <Text
        style={{ fontSize: 10, fontWeight: "bold", color: COLORS.slate700 }}
      >
        {initial}
      </Text>
    </View>
  );
};

const formatDate = () => {
  const date = new Date();
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

interface CompetitorReportPDFProps {
  data: CompetitorAnalysisData;
  url: string;
  competitorUrl?: string;
  whiteLabelLogo?: string | null;
  primaryScreenshotUrl?: string;
  competitorScreenshotUrl?: string;
}

const FaceOffComparisonTable = ({
  items,
  leftLabel,
  rightLabel,
}: {
  items: CompetitorComparisonItem[];
  leftLabel: string;
  rightLabel: string;
}) => {
  if (!items || items.length === 0) return null;

  return (
    <View style={styles.foTable}>
      <View style={styles.foHeadRow}>
        <View style={styles.foCellParamHead}>
          <Text style={styles.foThLabel}>Parameter</Text>
        </View>
        <View style={styles.foScorePairHead}>
          <View style={styles.foCellScoreHeadSlot}>
            <LogoBadge label={leftLabel} tableHeader />
          </View>
          <View style={styles.foCellScoreHeadSlotLast}>
            <LogoBadge label={rightLabel} tableHeader />
          </View>
        </View>
        <View style={styles.foCellObsHead}>
          <Text style={styles.foThLabel}>Observations</Text>
        </View>
      </View>

      {items.map((item, idx) => {
        const isLastRow = idx === items.length - 1;
        const primary = Number(item.PrimaryScore);
        const competitor = Number(item.CompetitorScore);
        const primaryBg =
          Number.isFinite(primary) &&
          Number.isFinite(competitor) &&
          primary >= competitor
            ? COLORS.cellPrimaryWin
            : COLORS.white;
        const competitorBg =
          Number.isFinite(primary) &&
          Number.isFinite(competitor) &&
          competitor > primary
            ? COLORS.cellCompetitorWin
            : COLORS.white;

        return (
          <View
            key={idx}
            style={[
              styles.foBodyRow,
              isLastRow ? { borderBottomWidth: 0 } : {},
            ]}
          >
             <View style={styles.foCellParam}>
              <Text style={styles.foParamText}>
                {formatParameterName(item.Parameter)}
              </Text>
            </View>
            <View style={styles.foScorePair}>
              <View style={[styles.foScoreHalf, { backgroundColor: primaryBg }]}>
                <Text style={styles.foScoreDigit}>
                  {formatFaceOffScoreDigit(item.PrimaryScore)}
                </Text>
              </View>
              <View
                style={[
                  styles.foScoreHalfLast,
                  { backgroundColor: competitorBg },
                ]}
              >
                <Text style={styles.foScoreDigit}>
                  {formatFaceOffScoreDigit(item.CompetitorScore)}
                </Text>
              </View>
            </View>
            <View style={styles.foCellObs}>
              <Text style={styles.foObsText}>
                {normalizeObservationForPdf(item.Analysis)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export const CompetitorReportPDF: React.FC<CompetitorReportPDFProps> = ({
  data,
  url,
  competitorUrl,
  whiteLabelLogo,
  primaryScreenshotUrl,
  competitorScreenshotUrl,
}) => {
  const leftLabel = url || "";
  const rightLabel = competitorUrl || "Competitor Website";
  const assessmentText = rightLabel
    ? `${leftLabel} vs ${rightLabel}`
    : leftLabel;

  const renderFaceOffPage = (
    pageNumber: number,
    items: CompetitorComparisonItem[] | undefined,
    title: string,
  ) => {
    if (!items || items.length === 0) return null;

    return (
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {whiteLabelLogo ? (
            <Image
              src={whiteLabelLogo}
              style={{
                height: 18,
                width: 80,
                objectFit: "contain",
              }}
            />
          ) : (
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>myuxscore</Text>
            </View>
          )}
          <Text style={styles.headerDate}>{formatDate()}</Text>
        </View>

        <Text style={styles.heroSubtitle}>Competitive assessment</Text>
        <Text style={styles.heroAssessment}>{assessmentText}</Text>

        {/* Divider below the top assessment/URL block */}
        <View style={styles.navDivider} />

        <Text style={styles.faceOffSectionTitle}>{title}</Text>
        <View style={styles.faceOffTableOuter} wrap>
          <FaceOffComparisonTable
            items={items}
            leftLabel={leftLabel}
            rightLabel={rightLabel}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{title.toLowerCase()}</Text>
          <Text style={styles.footerText}>Page {pageNumber}</Text>
        </View>
      </Page>
    );
  };

  return (
    <Document title={`Competitor Analysis`}>
      {/* PAGE 1: Executive Summary */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {whiteLabelLogo ? (
            <Image
              src={whiteLabelLogo}
              style={{
                height: 18,
                width: 80,
                objectFit: "contain",
              }}
            />
          ) : (
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>myuxscore</Text>
            </View>
          )}
          <Text style={styles.headerDate}>{formatDate()}</Text>
        </View>

        {/* Competitive assessment line */}
        <Text style={styles.heroSubtitle}>Competitive assessment</Text>
        <Text style={styles.heroAssessment}>{assessmentText}</Text>

        {/* Head-to-head layout */}
        <View style={styles.headToHeadRow}>
          {/* Left: Yours */}
          <View style={styles.headToHeadColLeft}>
            <View style={styles.siteLabelRow}>
              <LogoBadge label={leftLabel} />
              <Text style={styles.siteLabelText}>{leftLabel}</Text>
            </View>
            <View style={styles.screenshotFrame}>
              {primaryScreenshotUrl && (
                <Image
                  src={primaryScreenshotUrl}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}
            </View>
          </View>

          {/* Right: Competitor */}
          <View style={styles.headToHeadColRight}>
            <View style={[styles.siteLabelRow, { justifyContent: "flex-end" }]}>
              <Text style={styles.siteLabelText}>{rightLabel}</Text>
              <LogoBadge label={rightLabel} />
            </View>
            <View style={styles.screenshotFrame}>
              {competitorScreenshotUrl && (
                <Image
                  src={competitorScreenshotUrl}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}
            </View>
          </View>
        </View>

        {/* Competitive Landscape */}
        <View>
          <View style={styles.landscapeTitleRow}>
            <View style={styles.landscapeBar} />
            <Text style={styles.landscapeTitle}>Competitive Landscape</Text>
          </View>
          <Text style={styles.landscapeText}>
            {data.ExecutiveSummary || "Analysis complete."}
          </Text>
        </View>

        {/* Your Wins / Their Wins Summary */}
        <View style={styles.winsRow}>
          {/* Your Wins */}
          <View style={styles.winsCol}>
            <View style={styles.winsHeadingRow}>
              <LogoBadge label={leftLabel} />
              <Text style={styles.winsTitle}>Your Wins</Text>
            </View>
            {(data.PrimaryStrengths || []).slice(0, 3).map((s, idx) => (
              <View key={idx}>
                <Text style={styles.winsItemTitle}>{s.Strength}</Text>
                {s.Description && (
                  <Text style={styles.winsItemText}>{s.Description}</Text>
                )}
              </View>
            ))}
          </View>

          {/* Their Wins */}
          <View style={styles.winsCol}>
            <View style={styles.winsHeadingRow}>
              <LogoBadge label={rightLabel} />
              <Text style={styles.winsTitle}>Their Wins</Text>
            </View>
            {(data.CompetitorStrengths || []).slice(0, 3).map((s, idx) => (
              <View key={idx}>
                <Text style={styles.winsItemTitle}>{s.Strength}</Text>
                {s.Description && (
                  <Text style={styles.winsItemText}>{s.Description}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>competitor analysis</Text>
          <Text style={styles.footerText}>Page 1</Text>
        </View>
      </Page>

      {/* PAGE 2: ACTION PLAN */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {whiteLabelLogo ? (
            <Image
              src={whiteLabelLogo}
              style={{
                height: 18,
                width: 80,
                objectFit: "contain",
              }}
            />
          ) : (
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>myuxscore</Text>
            </View>
          )}
          <Text style={styles.headerDate}>{formatDate()}</Text>
        </View>

        {/* Navbar-like top block (Competitive assessment + url vs url) */}
        <Text style={styles.heroSubtitle}>Competitive assessment</Text>
        <Text style={styles.heroAssessment}>{assessmentText}</Text>
        <View style={styles.navDivider} />

        <View style={styles.actionPlanSection}>
          <Text style={styles.actionPlanTitle}>Action Plan</Text>
          <View style={styles.actionPlanGrid}>
            {(data.Opportunities || []).slice(0, 3).map((opp, i) => (
              <View key={i} style={styles.actionPlanCard}>
                <Text style={styles.actionPlanNumber}>
                  {String(i + 1).padStart(2, "0")}
                </Text>
                <Text style={styles.actionPlanCardTitle}>
                  {opp.Opportunity}
                </Text>
                <Text style={styles.actionPlanBody}>{opp.ActionPlan}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>action plan</Text>
          <Text style={styles.footerText}>Page 2</Text>
        </View>
      </Page>

      {/* PAGE 3+: one face-off per page (prevents overflow/broken tables) */}
      {renderFaceOffPage(3, data.UXComparison, "UX Face-Off")}
      {renderFaceOffPage(4, data.ProductComparison, "Product Face-Off")}
      {renderFaceOffPage(5, data.VisualComparison, "Visual Face-Off")}
      {renderFaceOffPage(6, data.StrategyComparison, "Strategy Face-Off")}
      {renderFaceOffPage(
        7,
        data.AccessibilityComparison,
        "Accessibility Face-Off",
      )}
    </Document>
  );
};
