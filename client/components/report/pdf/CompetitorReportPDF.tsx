import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import {
  CompetitorAnalysisData,
  CompetitorComparisonItem,
} from "../../../types";

Font.register({
  family: "DM Sans Upright",
  fonts: [
    // Upright (Normal)
    { src: "https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxhTg.ttf", fontWeight: 400, fontStyle: "normal" },
    { src: "https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAkJxhTg.ttf", fontWeight: 500, fontStyle: "normal" },
    { src: "https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwARZthTg.ttf", fontWeight: 700, fontStyle: "normal" },
    // Italic 
    { src: "https://fonts.gstatic.com/s/dmsans/v17/rP2rp2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat-JDW3z.ttf", fontWeight: 400, fontStyle: "italic" },
    { src: "https://fonts.gstatic.com/s/dmsans/v17/rP2rp2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat-7DW3z.ttf", fontWeight: 500, fontStyle: "italic" },
    { src: "https://fonts.gstatic.com/s/dmsans/v17/rP2rp2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat9uCm3z.ttf", fontWeight: 700, fontStyle: "italic" },
  ],
});

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

/**
 * TYPOGRAPHY SCALE (A4 PDF Standard — matches StandardReportPDF)
 * ─────────────────────────────────────────────────────────────────
 * Page / Section Title (H1)        : 16pt  bold/black
 * Sub-Section Title (H2)           : 14pt  bold
 * Card Title / Win Title (H3)      : 13pt  bold
 * Sub-label / site label (H4)      : 11pt  bold
 * ─────────────────────────────────────────────────────────────────
 * Body Text (primary)              : 10pt  regular  lineHeight 1.5
 * Body Text (table obs)            : 9pt   regular  lineHeight 1.4
 * Table param label                : 9pt   bold
 * Small / Meta                     : 9pt
 * Footer / Date / Table header     : 8pt
 * ─────────────────────────────────────────────────────────────────
 */
const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 30,
    paddingBottom: 30,
    paddingTop: 30,
    backgroundColor: COLORS.pageBg,
    fontFamily: "DM Sans Upright",
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
    fontSize: 10,
    color: COLORS.slate600,
    marginBottom: 4,
  },
  heroAssessment: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    lineHeight: 1.4,
  },

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
    fontSize: 10,
    fontWeight: "normal",
    color: COLORS.slate600,
  },
  screenshotFrame: {
    width: "100%",
    height: 130,
    borderWidth: 0.5,
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
    fontSize: 14,
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
    justifyContent: "space-between",
    marginTop: 16,
  },
  winsCol: {
    width: "48%",
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 4,
  },
  winsHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  winsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.brand,
    marginRight: 6,
  },
  winsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
  },
  winsItemTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 2,
  },
  winsItemText: {
    fontSize: 10,
    color: COLORS.slate800,
    lineHeight: 1.5,
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
    fontSize: 16,
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
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 10,
    lineHeight: 1.4,
  },
  actionPlanBody: {
    fontSize: 10,
    color: COLORS.slate800,
    lineHeight: 1.5,
  },

  // Divider under the top "Competitive assessment" area (for table pages)
  navDivider: {
    height: 1,
    backgroundColor: COLORS.slate200,
    marginTop: 6,
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
    fontSize: 9,
    fontWeight: "normal",
    color: COLORS.slate800,
    lineHeight: 1.4,
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
    fontSize: 10,
    color: COLORS.slate600,
    lineHeight: 1.5,
  },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.slate200,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: COLORS.slate500,
    fontWeight: "normal",
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
  size = 18,
}: {
  label: string;
  tableHeader?: boolean;
  size?: number;
}) => {
  // Clean URL to plain domain
  const cleanDomain = (label || "")
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .split("?")[0];
    
  // Using icon.horse which returns CORS headers (Access-Control-Allow-Origin: *)
  // This allows react-pdf to fetch it safely in the browser without failing silently.
  const faviconUrl = cleanDomain ? `https://icon.horse/icon/${cleanDomain}` : null;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
        marginRight: tableHeader ? 0 : 6,
        backgroundColor: COLORS.white,
        overflow: "hidden",
        borderWidth: 0.5,
        borderColor: COLORS.slate200,
      }}
    >
      {faviconUrl ? (
        <Image src={{ uri: faviconUrl, method: "GET" }} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      ) : null}
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

  const truncateUrlForPdf = (text: string, maxLen = 55) => {
    const t = (text || "").trim();
    if (t.length <= maxLen) return t;
    if (maxLen <= 3) return t.slice(0, maxLen);
    return `${t.slice(0, maxLen - 3)}...`;
  };

  const leftLabelDisplay = truncateUrlForPdf(leftLabel);
  const rightLabelDisplay = truncateUrlForPdf(rightLabel);

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
        <Text style={styles.heroAssessment}>
          {leftLabelDisplay}
          <Text style={{ fontWeight: "normal", color: COLORS.slate400 }}> vs </Text>
          {rightLabelDisplay}
        </Text>

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
          <View style={{ flex: 1 }}>
            <Text style={[styles.footerText, { color: COLORS.slate400 }]}>
              Scores are AI powered and represent an overall assessment based on 110+ factors
            </Text>
          </View>
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
        <Text style={styles.heroAssessment}>
          {leftLabelDisplay}
          <Text style={{ fontWeight: "normal", color: COLORS.slate400 }}> vs </Text>
          {rightLabelDisplay}
        </Text>

        {/* Head-to-head layout */}
        <View style={styles.headToHeadRow}>
          {/* Left: Yours */}
          <View style={styles.headToHeadColLeft}>
            <View style={styles.siteLabelRow}>
              <LogoBadge label={leftLabel} />
              <Text style={styles.siteLabelText}>{leftLabelDisplay}</Text>
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
            <View style={styles.siteLabelRow}>
              <LogoBadge label={rightLabel} />
              <Text style={styles.siteLabelText}>{rightLabelDisplay}</Text>
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
              <LogoBadge label={leftLabel} size={20} />
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
              <LogoBadge label={rightLabel} size={20} />
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
          <View style={{ flex: 1 }}>
            <Text style={[styles.footerText, { color: COLORS.slate400 }]}>
              Scores are AI powered and represent an overall assessment based on 110+ factors
            </Text>
          </View>
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
        <Text style={styles.heroAssessment}>
          {leftLabelDisplay}
          <Text style={{ fontWeight: "normal", color: COLORS.slate400 }}> vs </Text>
          {rightLabelDisplay}
        </Text>
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
          <View style={{ flex: 1 }}>
            <Text style={[styles.footerText, { color: COLORS.slate400 }]}>
              Scores are AI powered and represent an overall assessment based on 110+ factors
            </Text>
          </View>
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
