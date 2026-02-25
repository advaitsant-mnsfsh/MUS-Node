import React, { useMemo } from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Svg, Path, Font } from '@react-pdf/renderer';
import { AnalysisReport, Screenshot, ScoredParameter } from '../../../types';

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

const styles = StyleSheet.create({
    page: {
        padding: 30,
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

    // --- NEW HEADER STYLES ---
    newHeaderContainer: {
        marginBottom: 20,
        width: '100%',
    },
    newHeaderTop: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 8,
        height: 24,
    },
    headerLogoImage: {
        height: '100%',
        width: 120,
        objectFit: 'contain',
        objectPosition: 'right',
    },
    headerDivider: {
        height: 1,
        backgroundColor: COLORS.slate200,
        marginBottom: 10,
        width: '100%',
    },
    newHeaderBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    headerLeft: {
        flexDirection: 'column',
    },
    headerLabel: {
        fontSize: 10, // Small label
        color: COLORS.slate500,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    headerUrl: {
        fontSize: 20, // Large URL
        fontWeight: 'black',
        color: COLORS.black,
    },
    headerRight: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    headerDate: {
        fontSize: 8,
        color: COLORS.slate400,
        marginBottom: 2,
    },
    headerAuthor: {
        fontSize: 8,
        color: COLORS.slate400,
    },

    // --- FOOTER ---
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
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
        fontWeight: 'bold',
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
    sectionSubtitle: {
        fontSize: 9,
        color: COLORS.slate600,
    },

    // --- TWO COLUMN LAYOUT ---
    mainRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    leftCol: {
        width: '54%',
    },
    rightCol: {
        width: '46%',
    },

    // --- DASHBOARD DASHBOARD ---
    dashboardBox: {
        width: '100%',
        height: 140, // Increased to fit 120 content + 20 padding
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        borderColor: '#4B5563',
        paddingVertical: 10,
        paddingLeft: 10,
        paddingRight: 4,
        marginBottom: 10,
        alignItems: 'flex-start', // Top align ensures perfect row alignment
        justifyContent: 'flex-start',
    },

    // --- SCORE SECTION ---
    mainScoreBox: {
        width: '26%', // Widened to fit wider badge
        height: 120,
        marginRight: '2%',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.black,
        position: 'relative',
    },
    largeGaugeContainer: {
        width: '100%',
        height: 46, // Tight fit for 86px/2 gauge
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    miniGaugeContainer: {
        width: 80,
        height: 27, // Tight fit for 49px/2 gauge
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    overallScoreText: {
        fontSize: 27,
        fontWeight: 'bold',
        color: COLORS.black,
        position: 'absolute',
        bottom: 0,
    },
    overallLabel: {
        fontSize: 7,
        fontWeight: 'bold',
        color: COLORS.black,
        marginTop: 2,
        textTransform: 'uppercase',
    },
    // --- MAIN BADGE (Shadow Effect) ---
    mainBadgeWrapper: {
        width: 110, // Increased to definitely fit text
        height: 18,
        position: 'relative',
        marginTop: 6,
    },
    mainBadgeShadow: {
        position: 'absolute',
        top: 1.5,
        left: 1.5,
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.black,
    },
    mainBadgeMain: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderWidth: 1,
        borderColor: COLORS.black,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainStatusText: {
        fontSize: 7,
        fontWeight: 'black',
        textTransform: 'uppercase',
        textAlign: 'center',
        lineHeight: 1,
        letterSpacing: 0.5,
    },

    // --- CATEGORY GRID ---
    categoryGrid: {
        width: '36%', // Adjusted
        height: 120, // Reduced from 150
        marginRight: '2%', // Reduced gap
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignContent: 'center', // Center vertically with smaller gap
    },
    miniGaugeItem: {
        width: '48%',
        alignItems: 'center',
        marginBottom: 6, // Uniform gap
        flexDirection: 'column',
    },
    miniGaugeLabel: {
        marginTop: 2,
        fontSize: 6,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: COLORS.black,
        marginBottom: 2,
    },
    miniGaugeValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.black,
        position: 'absolute',
        bottom: 0,
    },
    // --- BADGE STYLES (Shadow Effect) ---
    badgeWrapper: {
        width: 75, // Widened for single line
        height: 14,
        position: 'relative',
        marginTop: 4,
    },
    badgeShadow: {
        position: 'absolute',
        top: 1.5,
        left: 1.5,
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.black,
    },
    badgeMain: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderWidth: 1,
        borderColor: COLORS.black,
        justifyContent: 'center',
        alignItems: 'center',
    },
    miniStatusText: {
        fontSize: 5,
        fontWeight: 'black',
        textTransform: 'uppercase',
        textAlign: 'center',
        lineHeight: 1,
        letterSpacing: 0.5,
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
        borderWidth: 1,
        borderColor: COLORS.black,
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
        fontSize: 16,
        fontWeight: 'black',
        color: COLORS.black,
        marginBottom: 8, // Reduced
        textTransform: 'uppercase',
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
    // Numbered List
    numberedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    numberBadgeContainer: {
        width: 18,
        height: 18,
        marginRight: 8,
        position: 'relative',
    },
    numberBadgeShadow: {
        position: 'absolute',
        top: 1,
        left: 1,
        width: 16,
        height: 16,
        backgroundColor: COLORS.black,
    },
    numberBadgeMain: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 16,
        height: 16,
        backgroundColor: '#FDE047', // Yellow-300
        borderWidth: 1,
        borderColor: COLORS.black,
        alignItems: 'center',
        justifyContent: 'center',
    },
    numberText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: COLORS.black,
    },

    // --- SCREENSHOT ---
    screenshotThumbnail: {
        width: '33%', // Adjusted
        height: 120,
        // borderRadius removed
        overflow: 'hidden',
    },
    thumbnailImg: {
        width: '100%',
        height: 'auto',
        minHeight: '100%',
        objectFit: 'cover',
        objectPosition: 'top left', // Reset to top left
    },


    // --- PARAMETER CARDS (Minimal Design) ---
    paramCard: {
        backgroundColor: COLORS.white,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderColor: COLORS.black,
        marginBottom: 10,
        padding: 14,
    },
    paramHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate300,
    },
    paramTitleRow: {
        flex: 1,
    },
    auditTypeLabel: {
        fontSize: 7,
        fontWeight: 'bold',
        color: COLORS.slate500,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    paramTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.black,
        lineHeight: 1.3,
    },
    scoreBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    confidenceBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: COLORS.black,
        marginRight: 6,
    },
    confidenceText: {
        fontSize: 6,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    scorePill: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: COLORS.black,
        backgroundColor: COLORS.slate100,
    },
    scoreValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.black,
    },

    // --- ICONS (Helpers) ---
    iconContainer: {
        width: 16,
        height: 16,
        borderWidth: 1,
        borderColor: COLORS.black,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },

    // Content sections (stacked with subtle dividers)
    contentSection: {
        paddingTop: 8,
        paddingBottom: 8,
        borderTopWidth: 1,
        borderTopColor: COLORS.slate200,
    },
    contentLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    contentIcon: {
        width: 8,
        height: 8,
        marginRight: 5,
        backgroundColor: COLORS.slate400,
    },
    contentLabelText: {
        fontSize: 7,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: COLORS.slate600,
        letterSpacing: 0.5,
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
    overviewLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    overviewIcon: {
        width: 10,
        height: 10,
        backgroundColor: COLORS.black,
        marginRight: 5,
    },
    overviewText: {
        fontSize: 9,
        lineHeight: 1.5,
        color: COLORS.slate800,
    },


});

// --- HELPERS ---
const getScoreInfo = (score: number) => {
    if (score >= 9) return { color: COLORS.veryGood, lightColor: '#D1FAE5', label: 'VERY GOOD' };
    if (score >= 7) return { color: COLORS.satisfactory, lightColor: '#FFF7ED', label: 'SATISFACTORY' };
    if (score >= 5) return { color: COLORS.needsImprovement, lightColor: '#FFEDD5', label: 'NEEDS IMPROVEMENT' };
    return { color: COLORS.critical, lightColor: '#FEE2E2', label: 'CRITICAL' };
};

const getConfidenceStyles = (conf: string | undefined) => {
    const c = (conf || 'high').toLowerCase();
    if (c === 'high') return { bg: '#ECFDF5', text: 'HIGH CONFIDENCE' };
    if (c === 'medium') return { bg: '#FFFBEB', text: 'MEDIUM CONFIDENCE' };
    return { bg: '#FEF2F2', text: 'LOW CONFIDENCE' };
};

const formatTitle = (text: string) => text.replace(/([A-Z])/g, ' $1').trim();

const formatDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const suffix = (d: number) => {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    };
    return `${day}${suffix(day)} ${month} ${year}`;
};

const HalfGauge = ({ score, size = 110, strokeWidth = 14, fontSize = 24 }: { score: number, size?: number, strokeWidth?: number, fontSize?: number }) => {
    const cx = size / 2;
    const cy = size / 2;
    const r = (size - strokeWidth) / 2;
    const cappedScore = Math.max(0, Math.min(10, score));

    // Background Track (180deg sweep)
    const trackPath = `M ${strokeWidth / 2} ${cy} A ${r} ${r} 0 0 1 ${size - strokeWidth / 2} ${cy}`;

    // Progress Arc (Angle PI to 0)
    const angle = Math.PI - (cappedScore / 10) * Math.PI;
    const endX = cx + r * Math.cos(angle);
    const endY = cy - r * Math.sin(angle);

    // Large arc flag is 0 for semi-circles since angle <= PI
    const progressPath = `M ${strokeWidth / 2} ${cy} A ${r} ${r} 0 0 1 ${endX} ${endY}`;
    const { color } = getScoreInfo(score);

    return (
        <View style={{ width: size, height: (size / 2) + (strokeWidth / 2), alignItems: 'center', justifyContent: 'flex-start', overflow: 'hidden' }}>
            <Svg width={size} height={(size / 2) + (strokeWidth / 2)}>
                {/* Background Track */}
                <Path
                    d={trackPath}
                    fill="none"
                    stroke="#EEEEEE"
                    strokeWidth={strokeWidth}
                    strokeLinecap="butt"
                />
                {/* Progress Arc */}
                <Path
                    d={progressPath}
                    fill="none"
                    stroke={color}
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

// Parameter Card - Matching Web UI Structure
const ParameterCard = ({ param, auditType }: { param: ScoredParameter, auditType: string }) => {
    if (param.Score === 0) return null;

    const displayScore = Math.round(param.Score * 10);
    const confStyle = getConfidenceStyles(param.Confidence || 'High');

    return (
        <View style={styles.paramCard} wrap={false}>
            {/* Header: Title + Score */}
            <View style={styles.paramHeader}>
                <View style={styles.paramTitleRow}>
                    <Text style={styles.auditTypeLabel}>{auditType}</Text>
                    <Text style={styles.paramTitle}>{formatTitle(param.ParameterName || 'Analysis Parameter')}</Text>
                </View>
                <View style={styles.scoreBox}>
                    <View style={[styles.confidenceBadge, { backgroundColor: confStyle.bg }]}>
                        <Text style={styles.confidenceText}>{confStyle.text}</Text>
                    </View>
                    <View style={styles.scorePill}>
                        <Text style={styles.scoreValue}>{displayScore}/100</Text>
                    </View>
                </View>
            </View>

            {/* Overview */}
            <View style={styles.overviewSection}>
                <View style={styles.overviewLabel}>
                    <View style={styles.overviewIcon} />
                    <Text style={styles.contentLabelText}>OVERVIEW</Text>
                </View>
                <Text style={styles.overviewText}>{param.Analysis}</Text>
            </View>

            {/* Observation + Recommendation - Stacked with Dividers */}
            {(param.KeyFinding || param.Recommendation) && (
                <View>
                    {param.KeyFinding && (
                        <View style={styles.contentSection}>
                            <View style={styles.contentLabel}>
                                <View style={[styles.contentIcon, { backgroundColor: COLORS.blue500 }]} />
                                <Text style={styles.contentLabelText}>OBSERVATION</Text>
                            </View>
                            <Text style={styles.contentText}>{param.KeyFinding}</Text>
                        </View>
                    )}
                    {param.Recommendation && (
                        <View style={styles.contentSection}>
                            <View style={styles.contentLabel}>
                                <View style={[styles.contentIcon, { backgroundColor: COLORS.yellowAccent }]} />
                                <Text style={styles.contentLabelText}>RECOMMENDATION</Text>
                            </View>
                            <Text style={styles.contentText}>{param.Recommendation}</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Citations */}
            {param.Citations && param.Citations.length > 0 && (
                <View style={{ marginTop: 8 }}>
                    <View style={styles.contentLabel}>
                        <View style={[styles.contentIcon, { backgroundColor: COLORS.slate200 }]} />
                        <Text style={styles.contentLabelText}>CITATION</Text>
                    </View>
                    {param.Citations.slice(0, 3).map((cite, i) => (
                        <Text key={i} style={[styles.contentText, { fontSize: 8, color: COLORS.slate600, marginTop: 3 }]}>
                            {i + 1}. "{cite}"
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
        <View style={[styles.paramCard, { borderLeftWidth: 4, borderLeftColor: COLORS.critical }]} wrap={false}>
            <View style={styles.paramHeader}>
                <View style={styles.paramTitleRow}>
                    <Text style={styles.auditTypeLabel}>CRITICAL ISSUE</Text>
                    <Text style={[styles.paramTitle, { color: COLORS.critical }]}>{issue.Issue}</Text>
                </View>
            </View>

            {/* Impact */}
            <View style={styles.overviewSection}>
                <View style={styles.overviewLabel}>
                    <View style={[styles.overviewIcon, { backgroundColor: COLORS.critical }]} />
                    <Text style={styles.contentLabelText}>IMPACT</Text>
                </View>
                <Text style={styles.overviewText}>{issue.Impact}</Text>
            </View>

            {/* Recommendation */}
            {issue.Recommendation && (
                <View style={styles.contentSection}>
                    <View style={styles.contentLabel}>
                        <View style={[styles.contentIcon, { backgroundColor: COLORS.yellowAccent }]} />
                        <Text style={styles.contentLabelText}>RECOMMENDATION</Text>
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
        if (img.data) return `data:image/jpeg;base64,${img.data}`;
        if (!img.url) return null;

        let finalUrl = img.url;
        if (!img.url.startsWith('http') && !img.url.startsWith('data:')) {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
            const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
            finalUrl = `${baseUrl}${img.url.startsWith('/') ? img.url : `/${img.url}`}`;
        }
        return finalUrl;
    };

    const primaryScreenshot = screenshots.find(s => !s.isMobile) || screenshots[0];
    const screenshotSrc = resolveImageSrc(primaryScreenshot);
    const cleanUrl = url?.replace(/^https?:\/\//, '')?.replace(/\/$/, '') || 'Analyzed Site';

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

    return (
        <Document title={`UX Audit Report - ${cleanUrl}`}>
            {/* PAGE 1: HERO + EXECUTIVE SUMMARY */}
            <Page size="A4" style={styles.page}>
                {/* NEW HEADER */}
                <View style={styles.newHeaderContainer}>
                    {/* Top Row: Logo */}
                    <View style={styles.newHeaderTop}>
                        {whiteLabelLogo ? (
                            <Image src={whiteLabelLogo} style={styles.headerLogoImage} />
                        ) : (
                            <Image src={`${window.location.origin}/logo.png`} style={styles.headerLogoImage} />
                        )}
                    </View>

                    {/* Divider */}
                    <View style={styles.headerDivider} />

                    {/* Bottom Row: Info */}
                    <View style={styles.newHeaderBottom}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.headerLabel}>Deep assessment</Text>
                            <Text style={styles.headerUrl}>{cleanUrl}</Text>
                        </View>
                        <View style={styles.headerRight}>
                            <Text style={styles.headerDate}>{formatDate()}</Text>
                            <Text style={styles.headerAuthor}>Prepared by Monsoonfish</Text>
                        </View>
                    </View>
                </View>

                {/* Dashboard: All-in-one horizontal row */}
                <View style={styles.dashboardBox}>
                    {/* 1. Main Score Gauge */}
                    <View style={styles.mainScoreBox}>
                        <View style={styles.largeGaugeContainer}>
                            <HalfGauge score={overallScore} size={86} strokeWidth={8} fontSize={27} />
                        </View>
                        <Text style={styles.overallLabel}>Overall Score</Text>

                        {/* Neo-Brutalist Shadow Badge (Main) */}
                        <View style={[styles.mainBadgeWrapper, { height: 18, width: 110 }]}>
                            {/* Main Layer */}
                            <View style={[styles.mainBadgeMain, { borderWidth: 1, borderColor: COLORS.black, backgroundColor: COLORS.white }]}>
                                <Text style={styles.mainStatusText}>{getScoreInfo(overallScore).label}</Text>
                            </View>
                        </View>
                        {/* Accent Bar REmoved */}
                    </View>

                    {/* 2. Category Grid */}
                    <View style={styles.categoryGrid}>
                        {[
                            { label: 'UX Audit', score: ux?.CategoryScore || 0 },
                            { label: 'Visual Design', score: visual?.CategoryScore || 0 },
                            { label: 'Product Audit', score: product?.CategoryScore || 0 },
                            { label: 'Accessibility', score: accessibility?.CategoryScore || 0 }
                        ].map((item, idx) => (
                            <View key={idx} style={styles.miniGaugeItem}>
                                <View style={styles.miniGaugeContainer}>
                                    <HalfGauge score={item.score} size={49} strokeWidth={5} fontSize={13} />
                                </View>

                                <Text style={styles.miniGaugeLabel}>{item.label}</Text>

                                {/* Neo-Brutalist Shadow Badge */}
                                <View style={styles.badgeWrapper}>
                                    {/* Main Layer */}
                                    <View style={[styles.badgeMain, { backgroundColor: COLORS.white }]}>
                                        <Text style={styles.miniStatusText}>{getScoreInfo(item.score).label}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* 3. Screenshot Thumbnail */}
                    <View style={styles.screenshotThumbnail}>
                        {screenshotSrc ? (
                            <Image
                                src={screenshotSrc}
                                style={styles.thumbnailImg}
                            />
                        ) : (
                            <View style={{ height: '100%', backgroundColor: '#f3f4f6' }} />
                        )}
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
                {/* NEW HEADER */}
                <View style={styles.newHeaderContainer}>
                    {/* Top Row: Logo */}
                    <View style={styles.newHeaderTop}>
                        {whiteLabelLogo ? (
                            <Image src={whiteLabelLogo} style={styles.headerLogoImage} />
                        ) : (
                            <Image src={`${window.location.origin}/logo.png`} style={styles.headerLogoImage} />
                        )}
                    </View>

                    {/* Divider */}
                    <View style={styles.headerDivider} />


                </View>

                {/* Context Capture Section */}
                <View style={styles.contextBox}>
                    <Text style={styles.contextTitle}>CONTEXT CAPTURE</Text>

                    <View style={styles.summaryRow}>
                        {/* LEFT COLUMN: PURPOSE ANALYSIS (64%) */}
                        <View style={[styles.summaryCol, { width: '50%' }]}>
                            <View style={styles.subHeaderRow}>
                                <Text style={styles.subHeaderTitle}>PURPOSE ANALYSIS</Text>
                                {strategy?.PurposeAnalysis?.Confidence && (
                                    <Text style={styles.contextConfidenceText}>{strategy.PurposeAnalysis.Confidence} CONFIDENCE</Text>
                                )}
                            </View>

                            {/* Primary Purpose */}
                            <View style={{ marginBottom: 16 }}>
                                <View style={styles.sectionLabel}>
                                    <View style={[styles.iconContainer, { backgroundColor: '#bfdbfe' }]}>
                                        <Svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <Path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                                            <Path d="M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0" />
                                        </Svg>
                                    </View>
                                    <Text style={{ fontSize: 10, fontWeight: 'bold' }}>PRIMARY PURPOSE</Text>
                                </View>

                                <View style={{ marginTop: 4 }}>
                                    {strategy?.PurposeAnalysis?.PrimaryPurpose?.map((p, i) => (
                                        <View key={i} style={{ flexDirection: 'row', marginBottom: 6, alignItems: 'flex-start' }}>
                                            <Text style={{ fontSize: 9, lineHeight: 1.4, color: '#1e293b' }}>• {p}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Key Objectives */}
                            <View>
                                <View style={styles.sectionLabel}>
                                    <View style={[styles.iconContainer, { backgroundColor: '#e9d5ff' }]}>
                                        <Svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <Path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                                            <Path d="M3.6 9h16.8" />
                                            <Path d="M3.6 15h16.8" />
                                            <Path d="M11.5 3a17 17 0 0 0 0 18" />
                                            <Path d="M12.5 3a17 17 0 0 1 0 18" />
                                        </Svg>
                                    </View>
                                    <Text style={{ fontSize: 10, fontWeight: 'bold' }}>KEY OBJECTIVES</Text>
                                </View>
                                <View style={{ marginTop: 4 }}>
                                    <Text style={{ fontSize: 9, lineHeight: 1.4, color: '#1e293b' }}>
                                        {strategy?.PurposeAnalysis?.KeyObjectives || "No key objectives identified."}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* VERTICAL DIVIDER */}
                        <View style={{ width: 0.5, backgroundColor: '#4B5563', marginHorizontal: 15 }} />

                        {/* RIGHT COLUMN: DOMAIN ANALYSIS (32%) */}
                        <View style={[styles.summaryCol, { width: '45%' }]}>
                            <View style={styles.subHeaderRow}>
                                <Text style={styles.subHeaderTitle}>DOMAIN ANALYSIS</Text>
                                <Text style={styles.contextConfidenceText}>HIGH CONFIDENCE</Text>
                            </View>

                            {strategy?.DomainAnalysis?.Items?.map((item, i) => (
                                <View key={i} style={styles.numberedItem}>
                                    <View style={styles.numberBadgeContainer}>
                                        <View style={styles.numberBadgeMain}>
                                            <Text style={styles.numberText}>{i + 1}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.bulletText}>{item}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
                {/* FOOTER - PAGE 2 */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerTextLeft}>scores are AI generated and represent an overall assessment based on 110+ factors</Text>
                    <Text style={styles.footerTextRight} render={({ pageNumber }) => (
                        `Page ${pageNumber}`
                    )} />
                </View>
            </Page>


            {/* PAGE 3+: UX AUDIT PARAMETERS */}
            {uxParams.length > 0 && (
                <Page size="A4" style={styles.page}>
                    <View style={styles.newHeaderContainer}>
                        <View style={styles.newHeaderTop}>
                            {whiteLabelLogo ? (
                                <Image src={whiteLabelLogo} style={styles.headerLogoImage} />
                            ) : (
                                <Image src={`${window.location.origin}/logo.png`} style={styles.headerLogoImage} />
                            )}
                        </View>
                        <View style={styles.headerDivider} />
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>UX Audit</Text>
                        <Text style={styles.sectionSubtitle}>Usability Heuristics · Metrics · Accessibility</Text>
                    </View>

                    {uxParams.map((p, i) => <ParameterCard key={i} param={p} auditType="UX AUDIT" />)}

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
                    <View style={styles.newHeaderContainer}>
                        <View style={styles.newHeaderTop}>
                            {whiteLabelLogo ? (
                                <Image src={whiteLabelLogo} style={styles.headerLogoImage} />
                            ) : (
                                <Image src={`${window.location.origin}/logo.png`} style={styles.headerLogoImage} />
                            )}
                        </View>
                        <View style={styles.headerDivider} />
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Visual Design</Text>
                        <Text style={styles.sectionSubtitle}>Consistency · Aesthetics · Responsiveness</Text>
                    </View>

                    {visualParams.map((p, i) => <ParameterCard key={i} param={p} auditType="VISUAL DESIGN" />)}

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
                    <View style={styles.newHeaderContainer}>
                        <View style={styles.newHeaderTop}>
                            {whiteLabelLogo ? (
                                <Image src={whiteLabelLogo} style={styles.headerLogoImage} />
                            ) : (
                                <Image src={`${window.location.origin}/logo.png`} style={styles.headerLogoImage} />
                            )}
                        </View>
                        <View style={styles.headerDivider} />
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Product Audit</Text>
                        <Text style={styles.sectionSubtitle}>Market Fit · Retention · Conversion</Text>
                    </View>

                    {productParams.map((p, i) => <ParameterCard key={i} param={p} auditType="PRODUCT AUDIT" />)}

                    <View style={styles.footer} fixed>
                        <Text style={styles.footerTextLeft}>scores are AI generated and represent an overall assessment based on 110+ factors</Text>
                        <Text style={styles.footerTextRight} render={({ pageNumber }) => (
                            `Page ${pageNumber}`
                        )} />
                    </View>
                </Page>
            )}

            {/* PAGE 6+: ACCESSIBILITY AUDIT */}
            {accessibility && (
                <Page size="A4" style={styles.page}>
                    <View style={styles.newHeaderContainer}>
                        <View style={styles.newHeaderTop}>
                            {whiteLabelLogo ? (
                                <Image src={whiteLabelLogo} style={styles.headerLogoImage} />
                            ) : (
                                <Image src={`${window.location.origin}/logo.png`} style={styles.headerLogoImage} />
                            )}
                        </View>
                        <View style={styles.headerDivider} />
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Accessibility Audit</Text>
                        <Text style={styles.sectionSubtitle}>WCAG Compliance · Critical Issues · Best Practices</Text>
                    </View>



                    {/* All Parameters */}
                    {accessibilityParams.length > 0 && (
                        <View>
                            <Text style={[styles.paramTitle, { marginBottom: 10 }]}>
                                Detailed Assessment
                            </Text>
                            {accessibilityParams.map((p, i) => <ParameterCard key={i} param={p} auditType="ACCESSIBILITY" />)}
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
