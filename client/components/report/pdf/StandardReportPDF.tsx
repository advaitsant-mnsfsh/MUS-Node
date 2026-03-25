import React, { useMemo } from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Svg, Path, Font } from '@react-pdf/renderer';
import { AnalysisReport, Screenshot, ScoredParameter } from '../../../types';
import { getThemeStyles } from '../ScoreComponents';

// --- DESIGN TOKENS (Matching Web Report) ---
const COLORS = {
    black: '#000000',
    white: '#FFFFFF',
    pageBg: '#FFFFFF',
    brand: '#000000',
    slate900: '#0F172A',
    slate800: '#1E293B',
    slate700: '#334155',
    slate600: '#475569',
    slate500: '#64748B',
    slate400: '#94A3B8',
    slate300: '#CBD5E1',
    slate200: '#E2E8F0',
    slate100: '#F1F5F9',
    blue500: '#3b82f6',
    // Themes from ScoreComponents.tsx
    veryGood: "#059669",
    satisfactory: "#D97706",
    needsImprovement: "#EA580C",
    critical: "#DC2626",
    yellowAccent: '#F9D412', // Keep for border if needed
    borderGray: '#E5E7EB'
};

const PDF_PAGE_PAD_X = 30;
/** Space reserved below fixed header (logo row + label + URL wrap + divider) */
const PDF_HEADER_RESERVE_TOP = 120;

const styles = StyleSheet.create({
    page: {
        paddingHorizontal: PDF_PAGE_PAD_X,
        paddingBottom: 30,
        paddingTop: PDF_HEADER_RESERVE_TOP,
        backgroundColor: COLORS.pageBg,
        fontFamily: 'Helvetica',
    },
    headerRow: {
        marginBottom: 20,
    },
    titlePrefix: {
        fontSize: 22,
        fontWeight: 'normal',
        color: '#888',
    },
    titleMain: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.black,
    },

    // --- FIXED PAGE HEADER (repeats on every page via `fixed`) ---
    pdfHeaderFixed: {
        position: 'absolute',
        top: PDF_PAGE_PAD_X,
        left: PDF_PAGE_PAD_X,
        right: PDF_PAGE_PAD_X,
    },
    pdfHeaderInner: {
        width: '100%',
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerLogoImage: {
        height: 26,
        width: 132,
        objectFit: 'contain',
        objectPosition: 'left',
    },
    headerDivider: {
        height: 1,
        backgroundColor: COLORS.slate200,
        width: '100%',
        marginTop: 10,
    },
    headerLabel: {
        fontSize: 10,
        color: COLORS.slate500,
        fontWeight: 'normal',
        marginBottom: 4,
    },
    headerUrl: {
        fontSize: 11,
        fontWeight: 'normal',
        color: COLORS.black,
        lineHeight: 1.35,
    },
    headerRight: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    headerDate: {
        fontSize: 9,
        color: COLORS.slate400,
    },

    // --- FOOTER ---
    footer: {
        position: 'absolute',
        bottom: 20,
        left: PDF_PAGE_PAD_X,
        right: PDF_PAGE_PAD_X,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerTextLeft: {
        fontSize: 8,
        color: COLORS.slate400,
    },
    footerTextRight: {
        fontSize: 8,
        color: COLORS.black,
        fontWeight: 'normal',
    },

    // Legacy/Inner Page Styles
    header: {
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    logoText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    urlText: {
        fontSize: 9,
        color: COLORS.slate500,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    sectionHeader: {
        marginBottom: 16,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    auditSectionHeadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        flexWrap: 'wrap',
    },
    auditSectionTitleText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    auditSectionTitleDivider: {
        width: 1,
        height: 16,
        backgroundColor: COLORS.slate300,
        marginHorizontal: 10,
    },
    categoryScoreBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 999,
    },
    categoryScoreBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    sectionSubtitle: {
        fontSize: 9,
        color: COLORS.slate600,
    },

    // --- HERO CARD (MATCHING WEB REPORT) ---
    heroCard: {
        width: '100%',
        flexDirection: 'row',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#D4D4D4',
        backgroundColor: COLORS.white,
        marginBottom: 14,
        overflow: 'hidden',
        height: 368, // ~80pt shorter than prior hero + preview block
    },
    heroLeft: {
        width: '54%',
        paddingTop: 6,
        paddingBottom: 6,
        paddingHorizontal: 12,
        borderTopWidth: 0,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 1,
        borderRightColor: '#D4D4D4',
        justifyContent: 'flex-start',
    },
    heroRight: {
        width: '46%',
        backgroundColor: '#F1F5F9',
        borderTopWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        borderTopColor: COLORS.black,
        minHeight: 0,
        position: 'relative',
        overflow: 'hidden',
    },

    // --- SCORE SECTION ---
    mainScoreBox: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    // NOTE: Don't hard-limit gauge wrapper heights; it clips the HalfGauge and misaligns the score text.
    largeGaugeContainer: {
        width: '100%',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    miniGaugeContainer: {
        width: '100%',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },

    heroOverallGaugeWrap: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    heroMiniGaugeWrap: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    overallScoreText: {
        fontSize: 27,
        fontWeight: 'bold',
        color: COLORS.black,
        position: 'absolute',
        bottom: 0,
    },
    overallLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: COLORS.black,
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    scoreSectionDivider: {
        width: '100%',
        height: 1,
        backgroundColor: COLORS.slate200,
        marginTop: 6,
        marginBottom: 8,
    },
    // --- STATUS PILLS (Match web report: tinted bg, no border) ---
    statusPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginTop: 6,
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusPillText: {
        fontSize: 7,
        fontWeight: 'black',
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: 0.6,
    },

    // --- CATEGORY GRID: 2×2 (two gauges top, two bottom) ---
    categoryGrid: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        alignContent: 'flex-start',
        marginTop: 0,
    },
    miniGaugeItem: {
        width: '48%',
        alignItems: 'center',
        marginBottom: 10,
        flexDirection: 'column',
    },
    miniGaugeLabel: {
        marginTop: 4,
        fontSize: 6.5,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: COLORS.black,
        marginBottom: 2,
        textAlign: 'center',
    },
    miniGaugeValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.black,
        position: 'absolute',
        bottom: 0,
    },
    statusPillSmall: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginTop: 4,
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusPillSmallText: {
        fontSize: 5.5,
        fontWeight: 'black',
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: 0.6,
    },

    // --- EXECUTIVE SUMMARY ---
    // --- EXECUTIVE SUMMARY ---
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'black',
        color: COLORS.black,
        marginBottom: 10,
        marginTop: 5,
        textTransform: 'uppercase',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    summaryCol: {
        width: '48%',
    },
    // Header Badges
    summaryHeaderWrapper: {
        marginBottom: 15,
        alignSelf: 'flex-start',
    },
    summaryHeaderShadow: {
        position: 'absolute',
        top: 1.5,
        left: 1.5,
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.black,
    },
    summaryHeaderMain: {
        height: 16,
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderColor: COLORS.borderGray,
        justifyContent: 'center',
        paddingHorizontal: 6,
        backgroundColor: COLORS.white,
    },
    summaryHeaderText: {
        fontSize: 8, // Reduced to fit 16pt height
        fontWeight: 'bold',
        color: COLORS.black,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // Content
    summaryPoint: {
        fontSize: 9,
        lineHeight: 1.4,
        color: COLORS.black,
        marginBottom: 4,
    },
    summaryPointContainer: {
        marginBottom: 12,
    },
    citationSmall: {
        fontSize: 7,
        color: '#666',
        marginTop: 2,
    },


    // --- CONTEXT CAPTURE ---
    contextBox: {
        marginTop: 5,
        // Removed border to fix double line issue
        width: '100%',
    },
    contextTitle: {
        fontSize: 22,
        fontWeight: 'black',
        color: COLORS.black,
        marginBottom: 18,
    },
    contextSectionTitle: {
        fontSize: 14,
        fontWeight: 'black',
        color: COLORS.black,
        marginBottom: 10,
    },
    contextSubsectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 12,
    },
    contextSubsectionIcon: {
        width: 14,
        height: 14,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contextSubsectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#B45309', // amber-ish like screenshot
    },
    contextNumberedItem: {
        flexDirection: 'row',
        marginBottom: 10,
        paddingRight: 10,
    },
    contextNumber: {
        width: 14,
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    contextItemText: {
        flex: 1,
        fontSize: 10,
        lineHeight: 1.45,
        color: '#111827',
    },

    // --- TARGET AUDIENCE (PAGE 3) ---
    targetTitle: {
        fontSize: 22,
        fontWeight: 'black',
        color: COLORS.black,
        marginBottom: 10,
    },
    targetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    targetColLeft: {
        width: '52%',
        paddingRight: 12,
    },
    targetColRight: {
        width: '45%',
    },
    targetSectionHeading: {
        fontSize: 14,
        fontWeight: 'black',
        color: '#B45309',
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    targetSectionIconDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#B45309',
        marginRight: 6,
    },
    targetNumberedItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    targetNumber: {
        width: 14,
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.slate500,
    },
    targetItemText: {
        flex: 1,
        fontSize: 10,
        lineHeight: 1.45,
        color: COLORS.slate800,
    },

    // --- USER PERSONAS (PAGE) ---
    personaTitle: {
        fontSize: 22,
        fontWeight: 'black',
        color: COLORS.black,
        marginBottom: 14,
    },
    personaGrid: {
        width: '100%',
        flexDirection: 'column',
        marginTop: 6,
    },
    personaCard: {
        width: '100%',
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderColor: COLORS.borderGray,
        backgroundColor: COLORS.white,
        borderRadius: 4,
        padding: 12,
        marginBottom: 12,
    },
    personaCardLast: {
        marginBottom: 0,
    },
    /** Name · age · role · location on one horizontal line */
    personaIdentityRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'baseline',
        marginBottom: 10,
    },
    personaName: {
        fontSize: 12,
        fontWeight: 'black',
        color: COLORS.black,
    },
    personaMetaInline: {
        fontSize: 9,
        color: COLORS.slate600,
        marginLeft: 2,
    },
    personaSectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.slate900,
        marginTop: 8,
        marginBottom: 5,
    },
    personaNumberedRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    personaNumber: {
        width: 12,
        fontSize: 8.5,
        fontWeight: 'bold',
        color: COLORS.slate500,
    },
    personaText: {
        flex: 1,
        fontSize: 9,
        lineHeight: 1.4,
        color: COLORS.slate800,
    },
    subHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    subHeaderTitle: {
        fontSize: 12, // New Size
        fontWeight: 'bold',
        color: COLORS.black,
        textTransform: 'uppercase',
    },
    contextConfidenceText: {
        fontSize: 7,
        fontWeight: 'bold',
        color: COLORS.veryGood, // Green
        textTransform: 'uppercase',
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.black,
        textTransform: 'uppercase',
        marginBottom: 4,
        marginTop: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionText: {
        fontSize: 9, // Increased
        lineHeight: 1.4,
        color: COLORS.slate700,
        marginBottom: 6,
    },
    // Bullet List
    bulletItem: {
        flexDirection: 'row',
        marginBottom: 3,
        paddingLeft: 4,
    },
    bulletPoint: {
        width: 10,
        fontSize: 9,
        color: COLORS.black,
        fontWeight: 'bold',
    },
    bulletText: {
        flex: 1,
        fontSize: 9, // Matched to summaryPoint
        lineHeight: 1.4,
        color: COLORS.slate700,
    },
    // (legacy numbered styles removed from usage on page 2)

    // --- SCREENSHOT COLUMN ---
    screenshotContainer: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    screenshotImg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'top left',
    },
    analyzedBadgeWrapper: {
        position: 'absolute',
        right: 12,
        bottom: 12,
        alignItems: 'flex-end',
    },
    analyzedBadge: {
        fontSize: 8,
        fontWeight: 'black',
        textTransform: 'uppercase',
        color: COLORS.black,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderColor: COLORS.borderGray,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },


    // --- PARAMETER CARDS (white card; Observation / Recommendation sub-panels) ---
    paramCard: {
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderColor: COLORS.slate200,
        borderRadius: 12,
        marginBottom: 14,
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    paramHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    paramHeadingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: 0,
    },
    paramTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.black,
        lineHeight: 1.25,
        flexShrink: 1,
    },
    paramHeadingDivider: {
        width: 1,
        height: 14,
        backgroundColor: COLORS.slate300,
        marginHorizontal: 8,
        flexShrink: 0,
    },
    paramConfidenceText: {
        fontSize: 7,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        flexShrink: 0,
    },
    paramHeaderScorePill: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        flexShrink: 0,
        marginLeft: 8,
    },
    paramHeaderScorePillText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    paramDualColumnRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        width: '100%',
        marginTop: 2,
    },
    paramSubCard: {
        flex: 1,
        minWidth: 0,
        backgroundColor: COLORS.white,
        borderRadius: 8,
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderColor: COLORS.slate200,
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginRight: 4,
    },
    paramSubCardLast: {
        marginRight: 0,
    },
    paramCitationBlock: {
        marginTop: 10,
        paddingTop: 6,
    },
    paramCitationLabel: {
        fontSize: 8,
        fontStyle: 'italic',
        color: COLORS.slate500,
        marginBottom: 6,
    },
    paramCitationItem: {
        fontSize: 8,
        fontStyle: 'italic',
        color: COLORS.slate600,
        lineHeight: 1.45,
        marginBottom: 4,
    },

    // --- ICONS (Helpers) ---
    iconContainer: {
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },
    editorialLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    editorialLabelText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: COLORS.black,
        letterSpacing: 0.2,
    },

    // Content sections (stacked with subtle dividers)
    contentSection: {
        paddingTop: 8,
        paddingBottom: 8,
        borderTopWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        borderTopColor: COLORS.slate200,
    },
    contentIcon: {
        width: 8,
        height: 8,
        marginRight: 5,
        backgroundColor: COLORS.slate400,
    },
    contentText: {
        fontSize: 9,
        lineHeight: 1.4,
        color: COLORS.slate700,
    },

    // Overview section
    overviewSection: {
        marginBottom: 8,
    },
    overviewText: {
        fontSize: 9,
        lineHeight: 1.55,
        color: COLORS.slate800,
    },


});

// --- HELPERS ---
const getConfidenceStyles = (conf: string | undefined) => {
    const c = (conf || 'high').toLowerCase();
    if (c === 'high') return { bg: '#ECFDF5', text: 'HIGH CONFIDENCE' };
    if (c === 'medium') return { bg: '#FFFBEB', text: 'MEDIUM CONFIDENCE' };
    return { bg: '#FEF2F2', text: 'LOW CONFIDENCE' };
};

const getConfidenceTextColor = (conf: string | undefined) => {
    const c = (conf || 'high').toLowerCase();
    if (c === 'high') return '#166534';
    if (c === 'medium') return '#B45309';
    return '#B91C1C';
};

const formatTitle = (text: string) => text.replace(/([A-Z])/g, ' $1').trim();

const ordinalSuffix = (d: number) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
};

/** e.g. "3rd March 2026" for PDF header */
const formatPdfHeaderDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleString('en-GB', { month: 'long' });
    const year = date.getFullYear();
    return `${day}${ordinalSuffix(day)} ${month} ${year}`;
};

const HalfGauge = ({ score, size = 110, strokeWidth = 14, fontSize = 24 }: { score: number, size?: number, strokeWidth?: number, fontSize?: number }) => {
    const cx = size / 2;
    const cy = size / 2;
    const r = (size - strokeWidth) / 2;
    const cappedScore = Math.max(0, Math.min(10, score));

    // Background Track (180deg sweep) — match web ScoreGauge: black @ 10% opacity
    const trackPath = `M ${strokeWidth / 2} ${cy} A ${r} ${r} 0 0 1 ${size - strokeWidth / 2} ${cy} `;

    // Progress Arc (Angle PI to 0)
    const angle = Math.PI - (cappedScore / 10) * Math.PI;
    const endX = cx + r * Math.cos(angle);
    const endY = cy - r * Math.sin(angle);

    const progressPath = `M ${strokeWidth / 2} ${cy} A ${r} ${r} 0 0 1 ${endX} ${endY} `;
    const theme = getThemeStyles(score);

    return (
        <View style={{ width: size, height: (size / 2) + (strokeWidth / 2), alignItems: 'center', justifyContent: 'flex-start', overflow: 'hidden' }}>
            <Svg width={size} height={(size / 2) + (strokeWidth / 2)}>
                <Path
                    d={trackPath}
                    fill="none"
                    stroke={COLORS.slate300}
                    strokeWidth={strokeWidth}
                    strokeLinecap="butt"
                />
                <Path
                    d={progressPath}
                    fill="none"
                    stroke={theme.solid}
                    strokeWidth={strokeWidth}
                    strokeLinecap="butt"
                />
            </Svg>
            <Text style={{
                position: 'absolute',
                bottom: 2,
                fontSize: fontSize,
                fontWeight: 'bold',
                color: COLORS.black
            }}>
                {cappedScore.toFixed(1)}
            </Text>
        </View>
    );
};

const ICON_AMBER = '#B45309';

const IconPrimaryPurpose = () => (
    <Svg width="14" height="14" viewBox="0 0 24 24">
        <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" fill="none" stroke={ICON_AMBER} strokeWidth={2} />
        <Path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" fill="none" stroke={ICON_AMBER} strokeWidth={2} />
    </Svg>
);

const IconKeyObjectives = () => (
    <Svg width="14" height="14" viewBox="0 0 24 24">
        <Path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke={ICON_AMBER} strokeWidth={2} strokeLinecap="round" />
        <Path d="M7 4v16" fill="none" stroke={ICON_AMBER} strokeWidth={2} strokeLinecap="round" opacity={0.0} />
    </Svg>
);

const IconDomainAnalysis = () => (
    <Svg width="14" height="14" viewBox="0 0 24 24">
        <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" fill="none" stroke={ICON_AMBER} strokeWidth={2} />
        <Path d="M2 12h20" fill="none" stroke={ICON_AMBER} strokeWidth={2} strokeLinecap="round" />
        <Path d="M12 2c2.761 2.67 4.5 6.24 4.5 10s-1.739 7.33-4.5 10c-2.761-2.67-4.5-6.24-4.5-10S9.239 4.67 12 2Z" fill="none" stroke={ICON_AMBER} strokeWidth={2} />
    </Svg>
);

/** Repeats on every page when placed inside each `<Page>` (react-pdf `fixed`). */
const StandardPdfPageHeaderFixed = ({
    whiteLabelLogo,
    cleanUrl,
}: {
    whiteLabelLogo?: string | null;
    cleanUrl: string;
}) => {
    const defaultLogoSrc = `${window.location.origin}/logo.png`;
    return (
        <View style={styles.pdfHeaderFixed} fixed>
            <View style={styles.pdfHeaderInner}>
                <View style={styles.headerTopRow}>
                    {whiteLabelLogo ? (
                        <Image src={whiteLabelLogo} style={styles.headerLogoImage} />
                    ) : (
                        <Image src={defaultLogoSrc} style={styles.headerLogoImage} />
                    )}
                    <View style={styles.headerRight}>
                        <Text style={styles.headerDate}>{formatPdfHeaderDate()}</Text>
                    </View>
                </View>
                <Text style={styles.headerLabel}>Detailed assessment</Text>
                <Text style={styles.headerUrl}>{cleanUrl}</Text>
                <View style={styles.headerDivider} />
            </View>
        </View>
    );
};

// --- AUDIT CARD ICONS (match report visual: shapes / eye / yellow + bulb) ---
const OverviewIcon = () => (
    <Svg width="14" height="14" viewBox="0 0 20 20">
        <Path d="M10 2.5 L6.2 9.2 H13.8 Z" fill={COLORS.black} />
        <Path d="M3.5 11 H8.5 V16 H3.5 Z" fill={COLORS.black} />
        <Path d="M14 11 m-2.2 0 a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0-4.4 0" fill={COLORS.black} />
    </Svg>
);

const ObservationIcon = () => (
    <Svg width="14" height="14" viewBox="0 0 20 20">
        <Path
            d="M2.5 10 C4.5 6.5 7.5 5 10 5 C12.5 5 15.5 6.5 17.5 10 C15.5 13.5 12.5 15 10 15 C7.5 15 4.5 13.5 2.5 10 Z"
            fill="none"
            stroke={COLORS.black}
            strokeWidth={1.4}
        />
        <Path d="M10 10 m-1.85 0 a1.85 1.85 0 1 0 3.7 0 a1.85 1.85 0 1 0-3.7 0" fill={COLORS.black} />
    </Svg>
);

const RecommendationIcon = () => (
    <Svg width="16" height="16" viewBox="0 0 18 18">
        <Path d="M0 0 H18 V18 H0 Z" fill={COLORS.yellowAccent} />
        <Path
            d="M9 3.5 C7 3.5 5.5 5.2 5.5 7.2 C5.5 9 6.5 10.2 7.2 11 L7.2 12.2 H10.8 L10.8 11 C11.5 10.2 12.5 9 12.5 7.2 C12.5 5.2 11 3.5 9 3.5 Z M7.5 13.5 H10.5 V14.8 H7.5 Z M7 15.5 H11 V16.5 H7 Z"
            fill={COLORS.black}
        />
    </Svg>
);

const parseExecutiveSummary = (text: string = '') => {
    const workingMatch = text.match(/WHAT IS WORKING:([\s\S]*?)(?=WHAT IS (NOT WORKING|NEEDS WORK|NOT WORKING):|$)/i);
    const needsWorkMatch = text.match(/WHAT IS (NOT WORKING|NEEDS WORK|NOT WORKING):([\s\S]*?)$/i);

    const parsePoints = (str: string) => {
        if (!str) return [];
        // Extract sentences that aren't just empty space
        return str.trim()
            .split(/\. (?=[A-Z])|\.\n|\n/)
            .map(s => s.trim())
            .filter(s => s.length > 5)
            .map(s => s.endsWith('.') ? s : s + '.');
    };

    return {
        working: parsePoints(workingMatch ? workingMatch[1] : ''),
        needsWork: parsePoints(needsWorkMatch ? needsWorkMatch[2] : '')
    };
};

const AuditSectionHeading = ({
    title,
    subtitle,
    categoryScore,
}: {
    title: string;
    subtitle: string;
    categoryScore: number;
}) => {
    const theme = getThemeStyles(categoryScore);
    return (
        <View style={styles.sectionHeader}>
            <View style={styles.auditSectionHeadingRow}>
                <Text style={styles.auditSectionTitleText}>{title}</Text>
                <View style={styles.auditSectionTitleDivider} />
                <View style={[styles.categoryScoreBadge, { backgroundColor: theme.pill }]}>
                    <Text style={[styles.categoryScoreBadgeText, { color: theme.solid }]}>
                        {categoryScore.toFixed(1)}/10
                    </Text>
                </View>
            </View>
            <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        </View>
    );
};

// Parameter Card — light gray shell; Observation + Recommendation side-by-side (reference UI)
const ParameterCard = ({ param }: { param: ScoredParameter }) => {
    if (param.Score === 0) return null;

    const confStyle = getConfidenceStyles(param.Confidence || 'High');
    const confColor = getConfidenceTextColor(param.Confidence);
    const scoreVal = typeof param.Score === 'number' ? param.Score : 0;
    const paramTheme = getThemeStyles(scoreVal);
    const scoreDisplay = `${Math.min(10, Math.max(0, Math.round(scoreVal)))}/10`;

    return (
        <View style={styles.paramCard} wrap={false}>
            <View style={styles.paramHeader}>
                <View style={styles.paramHeadingLeft}>
                    <Text style={styles.paramTitle}>{formatTitle(param.ParameterName || 'Analysis Parameter')}</Text>
                    <View style={styles.paramHeadingDivider} />
                    <Text style={[styles.paramConfidenceText, { color: confColor }]}>{confStyle.text}</Text>
                </View>
                <View style={[styles.paramHeaderScorePill, { backgroundColor: paramTheme.pill }]}>
                    <Text style={[styles.paramHeaderScorePillText, { color: paramTheme.solid }]}>
                        {scoreDisplay}
                    </Text>
                </View>
            </View>

            <View style={styles.overviewSection}>
                <View style={styles.editorialLabelRow}>
                    <View style={styles.iconContainer}>
                        <OverviewIcon />
                    </View>
                    <Text style={styles.editorialLabelText}>Overview</Text>
                </View>
                <Text style={styles.overviewText}>{param.Analysis}</Text>
            </View>

            <View style={styles.paramDualColumnRow}>
                <View style={styles.paramSubCard}>
                    <View style={styles.editorialLabelRow}>
                        <View style={styles.iconContainer}>
                            <ObservationIcon />
                        </View>
                        <Text style={styles.editorialLabelText}>Observation</Text>
                    </View>
                    <Text style={styles.contentText}>
                        {param.KeyFinding?.trim() || 'No specific observation recorded.'}
                    </Text>
                </View>
                <View style={[styles.paramSubCard, styles.paramSubCardLast]}>
                    <View style={styles.editorialLabelRow}>
                        <View style={styles.iconContainer}>
                            <RecommendationIcon />
                        </View>
                        <Text style={styles.editorialLabelText}>Recommendation</Text>
                    </View>
                    <Text style={styles.contentText}>
                        {param.Recommendation?.trim() || 'No specific recommendation provided.'}
                    </Text>
                </View>
            </View>

            {param.Citations && param.Citations.length > 0 && (
                <View style={styles.paramCitationBlock}>
                    <Text style={styles.paramCitationLabel}>Citation</Text>
                    {param.Citations.slice(0, 3).map((cite, i) => (
                        <Text key={i} style={styles.paramCitationItem}>
                            {cite}
                        </Text>
                    ))}
                </View>
            )}
        </View>
    );
};

// Critical Issue Card for Accessibility
const CriticalIssueCard = ({ issue }: { issue: { Issue: string, Impact: string, Recommendation: string } }) => {
    return (
        <View
            style={[
                styles.paramCard,
                {
                    borderTopWidth: 0,
                    borderRightWidth: 0,
                    borderBottomWidth: 0,
                    borderLeftWidth: 4,
                    borderLeftColor: COLORS.critical,
                },
            ]}
            wrap={false}
        >
            <View style={{ marginBottom: 10 }}>
                <Text style={[styles.paramTitle, { color: COLORS.critical }]}>{issue.Issue}</Text>
            </View>

            <View style={styles.overviewSection}>
                <View style={styles.editorialLabelRow}>
                    <View style={styles.iconContainer}>
                        <OverviewIcon />
                    </View>
                    <Text style={styles.editorialLabelText}>Impact</Text>
                </View>
                <Text style={styles.overviewText}>{issue.Impact}</Text>
            </View>

            {issue.Recommendation && (
                <View style={styles.contentSection}>
                    <View style={styles.editorialLabelRow}>
                        <View style={styles.iconContainer}>
                            <RecommendationIcon />
                        </View>
                        <Text style={styles.editorialLabelText}>Recommendation</Text>
                    </View>
                    <Text style={styles.contentText}>{issue.Recommendation}</Text>
                </View>
            )}
        </View>
    );
};

// --- MAIN DOCUMENT ---

interface StandardReportPDFProps {
    report: AnalysisReport;
    url: string;
    screenshots: Screenshot[];
    whiteLabelLogo?: string | null;
}

export const StandardReportPDF: React.FC<StandardReportPDFProps> = ({ report, url, screenshots, whiteLabelLogo }) => {
    const {
        "UX Audit expert": ux,
        "Product Audit expert": product,
        "Visual Audit expert": visual,
        "Strategy Audit expert": strategy,
        "Accessibility Audit expert": accessibility,
    } = report;

    const resolveImageSrc = (img: Screenshot | undefined) => {
        if (!img) return null;
        if (img.data) return `data: image / jpeg; base64, ${img.data} `;
        if (!img.url) return null;

        let finalUrl = img.url;
        if (!img.url.startsWith('http') && !img.url.startsWith('data:')) {
            // Must dynamically import or require if this gets tricky, but we can assume we'll just use the same logic
            // Oh wait, getBaseUrlForStatic needs to be imported:
            // Let's just fix it by declaring a simple check here since getBaseUrlForStatic relies on window which might not be available in PDF renderer if it runs server side, but this is client side React PDF so window exists.
            let baseUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api.myuxscore.com' : 'http://localhost:8080');
            if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
            if (baseUrl.endsWith('/api/v1')) baseUrl = baseUrl.slice(0, -7);
            else if (baseUrl.endsWith('/api')) baseUrl = baseUrl.slice(0, -4);
            if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) baseUrl = `https://${baseUrl}`;

            finalUrl = `${baseUrl}${img.url.startsWith('/') ? img.url : `/${img.url}`}`;
        }
        return finalUrl;
    };

    const primaryScreenshot = screenshots.find(s => !s.isMobile) || screenshots[0];
    const screenshotSrc = resolveImageSrc(primaryScreenshot);
    const cleanUrl = url?.replace(/^https?:\/\//, '')?.replace(/\/$/, '') || 'Analyzed Site';
    // PDF me long URLs bahut zyada height le lete hain, isliye dashboard/web jaisa short display.
    const cleanUrlDisplay = cleanUrl.length > 60 ? `${cleanUrl.slice(0, 57)}...` : cleanUrl;

    const overallScore = useMemo(() => {
        const scores = [ux?.CategoryScore, product?.CategoryScore, visual?.CategoryScore, accessibility?.CategoryScore]
            .filter(s => typeof s === 'number') as number[];
        if (scores.length === 0) return 0;
        return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    }, [ux, product, visual, accessibility]);

    const getAuditParams = (audit: any, sectionKeys: string[]) => {
        if (!audit) return [];
        const paramList: ScoredParameter[] = [];

        sectionKeys.forEach(key => {
            const section = audit[key] || audit[key.charAt(0).toLowerCase() + key.slice(1)];
            if (section && section.Parameters) {
                section.Parameters.forEach((p: ScoredParameter) => {
                    paramList.push(p);
                });
            }
        });
        return paramList;
    };

    const uxParams = getAuditParams(ux, ['UsabilityHeuristics', 'UsabilityMetrics', 'AccessibilityCompliance']);
    const visualParams = getAuditParams(visual, ['UIConsistencyAndBranding', 'AestheticAndEmotionalAppeal', 'ResponsivenessAndAdaptability']);
    const productParams = getAuditParams(product, ['MarketFitAndBusinessAlignment', 'UserRetentionAndEngagement', 'ConversionOptimization']);
    const accessibilityParams = getAuditParams(accessibility, ['AutomatedCompliance', 'ScreenReaderExperience', 'VisualAccessibility']);

    const summary = parseExecutiveSummary(strategy?.ExecutiveSummary);
    const targetAudience = (strategy as any)?.TargetAudience;
    const userPersonas = (strategy as any)?.UserPersonas || [];

    return (
        <Document title={`UX Audit Report - ${cleanUrl}`}>
            {/* PAGE 1: HERO + EXECUTIVE SUMMARY */}
            <Page size="A4" style={styles.page}>
                <StandardPdfPageHeaderFixed whiteLabelLogo={whiteLabelLogo} cleanUrl={cleanUrlDisplay} />

                {/* HERO CARD: Overall Score + 4 Rings + Screenshot (matching web layout) */}
                <View style={styles.heroCard}>
                    {/* LEFT: Overall Score + 4 Category Rings */}
                    <View style={styles.heroLeft}>
                        <View style={styles.mainScoreBox}>
                            <View style={styles.heroOverallGaugeWrap}>
                                <HalfGauge score={overallScore} size={108} strokeWidth={11} fontSize={28} />
                            </View>
                            <Text style={styles.overallLabel}>Overall Score</Text>

                            <View style={[styles.statusPill, { backgroundColor: getThemeStyles(overallScore).pill }]}>
                                <Text style={[styles.statusPillText, { color: getThemeStyles(overallScore).solid }]}>{getThemeStyles(overallScore).label}</Text>
                            </View>
                        </View>

                        <View style={styles.scoreSectionDivider} />

                        {/* Four category rings — single row like web (md:grid-cols-4) */}
                        <View style={styles.categoryGrid}>
                            {[
                                { label: 'UX and Heuristics', score: ux?.CategoryScore || 0 },
                                { label: 'Product Fit', score: product?.CategoryScore || 0 },
                                { label: 'Visual Design', score: visual?.CategoryScore || 0 },
                                { label: 'Accessibility', score: accessibility?.CategoryScore || 0 }
                            ].map((item, idx) => {
                                const t = getThemeStyles(item.score);
                                return (
                                    <View key={idx} style={styles.miniGaugeItem}>
                                        <View style={styles.heroMiniGaugeWrap}>
                                            <HalfGauge score={item.score} size={58} strokeWidth={5} fontSize={14} />
                                        </View>
                                        <Text style={styles.miniGaugeLabel}>{item.label}</Text>
                                        <View style={[styles.statusPillSmall, { backgroundColor: t.pill }]}>
                                            <Text style={[styles.statusPillSmallText, { color: t.solid }]}>{t.label}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    {/* RIGHT: Screenshot preview */}
                    <View style={styles.heroRight}>
                        <View style={styles.screenshotContainer}>
                            {screenshotSrc ? (
                                <Image src={screenshotSrc} style={styles.screenshotImg} />
                            ) : (
                                <View style={{ width: '100%', height: '100%', backgroundColor: '#F9FAFB' }} />
                            )}
                            <View style={styles.analyzedBadgeWrapper}>
                                <Text style={styles.analyzedBadge}>Analyzed Website</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Executive Summary: Full Width Below Dashboard */}
                <View style={{ width: '100%' }}>
                    <Text style={styles.summaryTitle}>EXECUTIVE SUMMARY</Text>

                    <View style={styles.summaryRow}>
                        {/* LEFT COLUMN: WHAT'S WORKING */}
                        <View style={styles.summaryCol}>
                            <View style={styles.summaryHeaderWrapper}>
                                <View style={styles.summaryHeaderMain}>
                                    <Text style={styles.summaryHeaderText}>WHAT IS WORKING</Text>
                                </View>
                            </View>

                            {summary.working.length > 0 ? summary.working.map((p, i) => (
                                <View key={i} style={styles.summaryPointContainer}>
                                    <Text style={styles.summaryPoint}>{p.split('(Citation:')[0].trim()}</Text>
                                    {p.includes('(Citation:') && (
                                        <Text style={styles.citationSmall}>Citation: {p.split('(Citation:')[1].replace(/\)$/, '')}</Text>
                                    )}
                                </View>
                            )) : (
                                <Text style={styles.summaryPoint}>No specific strengths identified.</Text>
                            )}
                        </View>

                        {/* RIGHT COLUMN: WHAT IS NOT WORKING */}
                        <View style={styles.summaryCol}>
                            <View style={styles.summaryHeaderWrapper}>
                                <View style={styles.summaryHeaderMain}>
                                    <Text style={styles.summaryHeaderText}>WHAT IS NOT WORKING</Text>
                                </View>
                            </View>

                            {summary.needsWork.length > 0 ? summary.needsWork.map((p, i) => (
                                <View key={i} style={styles.summaryPointContainer}>
                                    <Text style={styles.summaryPoint}>{p.split('(Citation:')[0].trim()}</Text>
                                    {p.includes('(Citation:') && (
                                        <Text style={styles.citationSmall}>Citation: {p.split('(Citation:')[1].replace(/\)$/, '')}</Text>
                                    )}
                                </View>
                            )) : (
                                <Text style={styles.summaryPoint}>No critical issues identified.</Text>
                            )}
                        </View>
                    </View>
                </View>
                {/* FOOTER - PAGE 1 */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerTextLeft}>scores are AI generated and represent an overall assessment based on 110+ factors</Text>
                    <Text style={styles.footerTextRight} render={({ pageNumber }) => (
                        `Page ${pageNumber}`
                    )} />
                </View>
            </Page>

            {/* PAGE 2: CONTEXT CAPTURE */}
            <Page size="A4" style={styles.page}>
                <StandardPdfPageHeaderFixed whiteLabelLogo={whiteLabelLogo} cleanUrl={cleanUrlDisplay} />

                {/* Context Capture Section */}
                <View style={styles.contextBox}>
                    <Text style={styles.contextTitle}>Context Capture</Text>

                    <Text style={styles.contextSectionTitle}>Purpose Analysis</Text>

                    {/* Primary Purpose */}
                    <View style={styles.contextSubsectionRow}>
                        <View style={styles.contextSubsectionIcon}>
                            <IconPrimaryPurpose />
                        </View>
                        <Text style={styles.contextSubsectionTitle}>Primary Purpose</Text>
                    </View>
                    {(strategy?.PurposeAnalysis?.PrimaryPurpose || []).length > 0 ? (
                        (strategy?.PurposeAnalysis?.PrimaryPurpose || []).map((p, i) => (
                            <View key={i} style={styles.contextNumberedItem}>
                                <Text style={styles.contextNumber}>{i + 1}.</Text>
                                <Text style={styles.contextItemText}>{p}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.contextItemText}>No primary purpose identified.</Text>
                    )}

                    {/* Key Objectives */}
                    <View style={styles.contextSubsectionRow}>
                        <View style={styles.contextSubsectionIcon}>
                            <IconKeyObjectives />
                        </View>
                        <Text style={styles.contextSubsectionTitle}>Key Objectives</Text>
                    </View>
                    {strategy?.PurposeAnalysis?.KeyObjectives ? (
                        String(strategy.PurposeAnalysis.KeyObjectives)
                            .split(/\n+/)
                            .map((line, idx) => line.trim())
                            .filter((line) => line.length > 0)
                            .slice(0, 6)
                            .map((line, i) => (
                                <View key={i} style={styles.contextNumberedItem}>
                                    <Text style={styles.contextNumber}>{i + 1}.</Text>
                                    <Text style={styles.contextItemText}>{line}</Text>
                                </View>
                            ))
                    ) : (
                        <Text style={styles.contextItemText}>No key objectives identified.</Text>
                    )}

                    {/* Domain Analysis */}
                    <View style={styles.contextSubsectionRow}>
                        <View style={styles.contextSubsectionIcon}>
                            <IconDomainAnalysis />
                        </View>
                        <Text style={styles.contextSubsectionTitle}>Domain Analysis</Text>
                    </View>
                    {(strategy?.DomainAnalysis?.Items || []).length > 0 ? (
                        (strategy?.DomainAnalysis?.Items || []).map((item, i) => (
                            <View key={i} style={styles.contextNumberedItem}>
                                <Text style={styles.contextNumber}>{i + 1}.</Text>
                                <Text style={styles.contextItemText}>{item}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.contextItemText}>No domain analysis identified.</Text>
                    )}
                </View>
                {/* FOOTER - PAGE 2 */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerTextLeft}>scores are AI generated and represent an overall assessment based on 110+ factors</Text>
                    <Text style={styles.footerTextRight} render={({ pageNumber }) => (
                        `Page ${pageNumber}`
                    )} />
                </View>
            </Page>


            {/* PAGE 3: Target Audience + User Personas (single page) */}
            {(targetAudience || userPersonas.length > 0) && (
                <Page size="A4" style={styles.page}>
                    <StandardPdfPageHeaderFixed whiteLabelLogo={whiteLabelLogo} cleanUrl={cleanUrlDisplay} />

                    <View style={styles.contextBox}>
                        {targetAudience && (
                            <>
                                <Text style={styles.targetTitle}>Target Audience</Text>

                                <View style={styles.targetRow}>
                                    <View style={styles.targetColLeft}>
                                        <View style={styles.targetSectionHeading}>
                                            <View style={styles.targetSectionIconDot} />
                                            <Text style={styles.targetSectionHeading}>Primary Audience</Text>
                                        </View>

                                        {(targetAudience.Primary || []).map((p: string, i: number) => (
                                            <View key={i} style={styles.targetNumberedItem}>
                                                <Text style={styles.targetNumber}>{i + 1}.</Text>
                                                <Text style={styles.targetItemText}>{p}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    <View style={styles.targetColRight}>
                                        <View style={styles.targetSectionHeading}>
                                            <View style={styles.targetSectionIconDot} />
                                            <Text style={styles.targetSectionHeading}>Demographics</Text>
                                        </View>
                                        <Text style={styles.targetItemText}>
                                            {targetAudience.DemographicsPsychographics || 'No demographics information provided.'}
                                        </Text>
                                    </View>
                                </View>
                            </>
                        )}

                        {userPersonas.length > 0 && (
                            <>
                                <Text
                                    style={[
                                        styles.personaTitle,
                                        targetAudience ? { marginTop: 22 } : { marginTop: 0 },
                                    ]}
                                >
                                    User Personas
                                </Text>

                                <View style={styles.personaGrid}>
                                    {userPersonas.slice(0, 3).map((p: any, idx: number, arr: any[]) => {
                                        const goals = String(p.UserNeedsBehavior || '')
                                            .split(/(?<=\.)\s+/)
                                            .map((t: string) => t.trim())
                                            .filter((t: string) => t.length > 0)
                                            .slice(0, 4);
                                        const pains = String(p.PainPointOpportunity || '')
                                            .split(/(?<=\.)\s+/)
                                            .map((t: string) => t.trim())
                                            .filter((t: string) => t.length > 0)
                                            .slice(0, 4);
                                        const name = p.Name || `Persona ${idx + 1}`;
                                        const whoBits = [p.Age ? String(p.Age) : '', p.Occupation || ''].filter(Boolean).join(' · ');
                                        return (
                                            <View
                                                key={idx}
                                                style={[styles.personaCard, idx === arr.length - 1 ? styles.personaCardLast : {}]}
                                                wrap={false}
                                            >
                                                <View style={styles.personaIdentityRow}>
                                                    <Text style={styles.personaName}>{name}</Text>
                                                    {whoBits ? (
                                                        <Text style={styles.personaMetaInline}>{` · ${whoBits}`}</Text>
                                                    ) : null}
                                                    {p.Location ? (
                                                        <Text style={styles.personaMetaInline}>{` · ${p.Location}`}</Text>
                                                    ) : null}
                                                </View>

                                                <Text style={[styles.personaSectionTitle, { marginTop: 0 }]}>Goals and Needs</Text>
                                                {goals.map((t: string, i: number) => (
                                                    <View key={i} style={styles.personaNumberedRow}>
                                                        <Text style={styles.personaNumber}>{i + 1}.</Text>
                                                        <Text style={styles.personaText}>{t}</Text>
                                                    </View>
                                                ))}

                                                <Text style={styles.personaSectionTitle}>Pain Points</Text>
                                                {pains.map((t: string, i: number) => (
                                                    <View key={i} style={styles.personaNumberedRow}>
                                                        <Text style={styles.personaNumber}>{i + 1}.</Text>
                                                        <Text style={styles.personaText}>{t}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        );
                                    })}
                                </View>
                            </>
                        )}
                    </View>

                    <View style={styles.footer} fixed>
                        <Text style={styles.footerTextLeft}>scores are AI generated and represent an overall assessment based on 110+ factors</Text>
                        <Text style={styles.footerTextRight} render={({ pageNumber }) => (
                            `Page ${pageNumber}`
                        )} />
                    </View>
                </Page>
            )}

            {/* PAGE 5+: UX AUDIT PARAMETERS */}
            {uxParams.length > 0 && (
                <Page size="A4" style={styles.page}>
                    <StandardPdfPageHeaderFixed whiteLabelLogo={whiteLabelLogo} cleanUrl={cleanUrlDisplay} />

                    <AuditSectionHeading
                        title="UX Audit"
                        subtitle="Usability Heuristics · Metrics · Accessibility"
                        categoryScore={ux?.CategoryScore ?? 0}
                    />

                    {uxParams.map((p, i) => <ParameterCard key={i} param={p} />)}

                    <View style={styles.footer} fixed>
                        <Text style={styles.footerTextLeft}>scores are AI generated and represent an overall assessment based on 110+ factors</Text>
                        <Text style={styles.footerTextRight} render={({ pageNumber }) => (
                            `Page ${pageNumber}`
                        )} />
                    </View>
                </Page>
            )}

            {/* PAGE 4+: VISUAL DESIGN PARAMETERS */}
            {visualParams.length > 0 && (
                <Page size="A4" style={styles.page}>
                    <StandardPdfPageHeaderFixed whiteLabelLogo={whiteLabelLogo} cleanUrl={cleanUrlDisplay} />

                    <AuditSectionHeading
                        title="Visual Design"
                        subtitle="Consistency · Aesthetics · Responsiveness"
                        categoryScore={visual?.CategoryScore ?? 0}
                    />

                    {visualParams.map((p, i) => <ParameterCard key={i} param={p} />)}

                    <View style={styles.footer} fixed>
                        <Text style={styles.footerTextLeft}>scores are AI generated and represent an overall assessment based on 110+ factors</Text>
                        <Text style={styles.footerTextRight} render={({ pageNumber }) => (
                            `Page ${pageNumber}`
                        )} />
                    </View>
                </Page>
            )}

            {/* PAGE 5+: PRODUCT AUDIT PARAMETERS */}
            {productParams.length > 0 && (
                <Page size="A4" style={styles.page}>
                    <StandardPdfPageHeaderFixed whiteLabelLogo={whiteLabelLogo} cleanUrl={cleanUrlDisplay} />

                    <AuditSectionHeading
                        title="Product Audit"
                        subtitle="Market Fit · Retention · Conversion"
                        categoryScore={product?.CategoryScore ?? 0}
                    />

                    {productParams.map((p, i) => <ParameterCard key={i} param={p} />)}

                    <View style={styles.footer} fixed>
                        <Text style={styles.footerTextLeft}>scores are AI generated and represent an overall assessment based on 110+ factors</Text>
                        <Text style={styles.footerTextRight} render={({ pageNumber }) => (
                            `Page ${pageNumber}`
                        )} />
                    </View>
                </Page>
            )}

            {/* PAGE 6+: ACCESSIBILITY AUDIT */}
            {accessibilityParams.length > 0 && (
                <Page size="A4" style={styles.page}>
                    <StandardPdfPageHeaderFixed whiteLabelLogo={whiteLabelLogo} cleanUrl={cleanUrlDisplay} />

                    <AuditSectionHeading
                        title="Accessibility Audit"
                        subtitle="WCAG Compliance · Critical Issues · Best Practices"
                        categoryScore={accessibility?.CategoryScore ?? 0}
                    />

                    {accessibilityParams.length > 0 && (
                        <View>
                            <Text style={[styles.paramTitle, { marginBottom: 10 }]}>Detailed Assessment</Text>
                            {accessibilityParams.map((p, i) => <ParameterCard key={i} param={p} />)}
                        </View>
                    )}

                    <View style={styles.footer} fixed>
                        <Text style={styles.footerTextLeft}>scores are AI generated and represent an overall assessment based on 110+ factors</Text>
                        <Text style={styles.footerTextRight} render={({ pageNumber }) => (
                            `Page ${pageNumber}`
                        )} />
                    </View>
                </Page>
            )}
        </Document>
    );
};
