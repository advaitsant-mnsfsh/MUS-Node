import React, { useMemo } from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer';
import { AnalysisReport, Screenshot } from '../../../types';

// --- DESIGN TOKENS ---
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
    veryGood: "#059669",
    satisfactory: "#D97706",
    needsImprovement: "#EA580C",
    critical: "#DC2626",
    yellowAccent: '#F9D412',
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

    // --- TOP SECTION (Split Layout) ---
    topSection: {
        flexDirection: 'row',
        width: '100%',
        height: 310, // Keep height to restrict screenshot
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate200,
        paddingBottom: 20,
    },
    topLeft: {
        width: '50%',
        paddingRight: 15,
        justifyContent: 'flex-start',
        height: '100%', // Ensure it takes full height to allow spacing distribution
    },
    topRight: {
        width: '50%',
        height: '100%',
        borderWidth: 1,
        borderColor: COLORS.slate200,
        overflow: 'hidden',
    },
    screenshotImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'top',
    },

    // --- GAUGES & SCORES ---
    overallScoreContainer: {
        width: '100%',
        // marginBottom: 25, // REMOVED fixed margin, let flex handle it
        alignItems: 'center',
    },
    largeGaugeContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    categoryGrid: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 'auto', // Push to bottom of the container
    },
    miniGaugeItem: {
        width: '48%',
        alignItems: 'center',
        marginBottom: 0, // No margin bottom to align with container bottom
    },
    rowGap: {
        width: '100%',
        height: 15, // Gap between rows
    },
    miniGaugeLabelOverall: {
        marginTop: 5,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: COLORS.black,
        marginBottom: 5,
    },
    miniGaugeLabel: {
        marginTop: 0,
        fontSize: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: COLORS.black,
        marginBottom: 4,
    },

    // Badges
    mainBadgeWrapper: {
        width: 140,
        height: 24,
        position: 'relative',
        marginTop: 8,
    },
    mainBadgeShadow: {
        position: 'absolute',
        top: 2,
        left: 2,
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
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainStatusText: {
        fontSize: 9,
        fontWeight: 'black',
        textTransform: 'uppercase',
    },

    badgeWrapper: {
        marginTop: 4,
        position: 'relative',
        height: 20,
        width: '100%',
        alignItems: 'center',
    },
    miniBadgeBox: {
        width: 100,
        height: 18,
        position: 'relative',
    },
    miniBadgeShadow: {
        position: 'absolute',
        top: 1.5,
        left: 1.5,
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.black,
    },
    miniBadgeMain: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderWidth: 1,
        borderColor: COLORS.black,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    miniStatusText: {
        fontSize: 6,
        fontWeight: 'black',
        textTransform: 'uppercase',
    },

    // --- EXECUTIVE SUMMARY ---
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'black',
        color: COLORS.black,
        marginBottom: 15,
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
        fontSize: 8,
        fontWeight: 'bold',
        color: COLORS.black,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    summaryPoint: {
        fontSize: 9,
        lineHeight: 1.4,
        color: COLORS.black,
        marginBottom: 4,
    },
    citationSmall: {
        fontSize: 7,
        color: '#666',
        marginTop: 2,
    },
    summaryPointContainer: {
        marginBottom: 12,
    },

    // --- NEW HEADER ---
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
        fontSize: 10,
        color: COLORS.slate500,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    headerUrl: {
        fontSize: 20,
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
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    subHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    subHeaderTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.black,
        textTransform: 'uppercase',
    },
    contextConfidenceText: {
        fontSize: 7,
        fontWeight: 'bold',
        color: COLORS.veryGood,
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
    iconContainer: {
        width: 16,
        height: 16,
        borderWidth: 1,
        borderColor: COLORS.black,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },
    numberedItem: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingRight: 10,
    },
    numberBadgeContainer: {
        marginRight: 8,
        marginTop: 2,
    },
    numberBadgeMain: {
        width: 16,
        height: 16,
        borderWidth: 1,
        borderColor: COLORS.black,
        backgroundColor: '#fef3c7', // light amber
        justifyContent: 'center',
        alignItems: 'center',
    },
    numberText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    bulletText: {
        fontSize: 9,
        lineHeight: 1.4,
        color: COLORS.slate700,
        flex: 1,
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
});

// --- HELPERS ---
const getScoreInfo = (score: number) => {
    if (score >= 9) return { color: COLORS.veryGood, label: 'VERY GOOD' };
    if (score >= 7) return { color: COLORS.satisfactory, label: 'SATISFACTORY' };
    if (score >= 5) return { color: COLORS.needsImprovement, label: 'NEEDS IMPROVEMENT' };
    return { color: COLORS.critical, label: 'CRITICAL' };
};

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
    const trackPath = `M ${strokeWidth / 2} ${cy} A ${r} ${r} 0 0 1 ${size - strokeWidth / 2} ${cy}`;
    const angle = Math.PI - (cappedScore / 10) * Math.PI;
    const endX = cx + r * Math.cos(angle);
    const endY = cy - r * Math.sin(angle);
    const progressPath = `M ${strokeWidth / 2} ${cy} A ${r} ${r} 0 0 1 ${endX} ${endY}`;
    const { color } = getScoreInfo(score);

    return (
        <View style={{ width: size, height: (size / 2) + (strokeWidth / 2), alignItems: 'center', justifyContent: 'flex-start', overflow: 'hidden' }}>
            <Svg width={size} height={(size / 2) + (strokeWidth / 2)}>
                <Path d={trackPath} fill="none" stroke="#EEEEEE" strokeWidth={strokeWidth} strokeLinecap="butt" />
                <Path d={progressPath} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="butt" />
            </Svg>
            <Text style={{ position: 'absolute', bottom: -2, fontSize: fontSize, fontWeight: 'bold', color: COLORS.black }}>
                {cappedScore.toFixed(1)}
            </Text>
        </View>
    );
};

const parseExecutiveSummary = (text: string = '') => {
    const workingMatch = text.match(/WHAT IS WORKING:([\s\S]*?)(?=WHAT IS (NOT WORKING|NEEDS WORK|NOT WORKING):|$)/i);
    const needsWorkMatch = text.match(/WHAT IS (NOT WORKING|NEEDS WORK|NOT WORKING):([\s\S]*?)$/i);
    const parsePoints = (str: string) => str.trim().split(/\. (?=[A-Z])|\.\n|\n/).map(s => s.trim()).filter(s => s.length > 5).map(s => s.endsWith('.') ? s : s + '.');
    return {
        working: parsePoints(workingMatch ? workingMatch[1] : ''),
        needsWork: parsePoints(needsWorkMatch ? needsWorkMatch[2] : '')
    };
};

interface HybridReportPDFProps {
    report: AnalysisReport;
    url: string;
    screenshots: Screenshot[];
    whiteLabelLogo?: string | null;
}

export const HybridReportPDF: React.FC<HybridReportPDFProps> = ({ report, url, screenshots, whiteLabelLogo }) => {
    const {
        "UX Audit expert": ux,
        "Product Audit expert": product,
        "Visual Audit expert": visual,
        "Accessibility Audit expert": accessibility,
        "Strategy Audit expert": strategy
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

    const overallScore = useMemo(() => {
        const scores = [ux?.CategoryScore, product?.CategoryScore, visual?.CategoryScore, accessibility?.CategoryScore]
            .filter(s => typeof s === 'number') as number[];
        if (scores.length === 0) return 0;
        return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    }, [ux, product, visual, accessibility]);

    const summary = parseExecutiveSummary(strategy?.ExecutiveSummary);

    const categories = [
        { label: 'UX Audit', score: ux?.CategoryScore || 0 },
        { label: 'Visual Design', score: visual?.CategoryScore || 0 },
        { label: 'Product Audit', score: product?.CategoryScore || 0 },
        { label: 'Accessibility', score: accessibility?.CategoryScore || 0 }
    ];

    return (
        <Document title={`UX Audit Report - ${url.replace(/^https?:\/\//, '').replace(/\/$/, '')} (Hybrid)`}>
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
                            <Text style={styles.headerUrl}>{url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</Text>
                        </View>
                        <View style={styles.headerRight}>
                            <Text style={styles.headerDate}>{formatDate()}</Text>
                            <Text style={styles.headerAuthor}>Prepared by Monsoonfish</Text>
                        </View>
                    </View>

                    {/* Thin Divider below header */}
                    <View style={{ height: 1, backgroundColor: COLORS.slate200, width: '100%', marginTop: 8 }} />
                </View>

                {/* TOP SECTION: Graphs (Left) + Screenshot (Right) */}
                <View style={styles.topSection}>
                    {/* LEFT: Dashboard */}
                    <View style={styles.topLeft}>
                        {/* Overall Score */}
                        <View style={styles.overallScoreContainer}>
                            <View style={styles.largeGaugeContainer}>
                                <HalfGauge score={overallScore} size={130} strokeWidth={14} fontSize={32} />
                            </View>
                            <Text style={styles.miniGaugeLabelOverall}>OVERALL SCORE</Text>
                            <View style={styles.mainBadgeWrapper}>
                                <View style={styles.mainBadgeShadow} />
                                <View style={styles.mainBadgeMain}>
                                    <Text style={styles.mainStatusText}>{getScoreInfo(overallScore).label}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Category Grid - Pushed to bottom via marginTop: auto */}
                        <View style={styles.categoryGrid}>
                            {/* Row 1 */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                {categories.slice(0, 2).map((item, idx) => (
                                    <View key={idx} style={styles.miniGaugeItem}>
                                        <HalfGauge score={item.score} size={60} strokeWidth={6} fontSize={16} />
                                        <Text style={styles.miniGaugeLabel}>{item.label}</Text>
                                        <View style={styles.badgeWrapper}>
                                            <View style={styles.miniBadgeBox}>
                                                <View style={styles.miniBadgeShadow} />
                                                <View style={styles.miniBadgeMain}>
                                                    <Text style={styles.miniStatusText}>{getScoreInfo(item.score).label}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.rowGap} />

                            {/* Row 2 */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                {categories.slice(2, 4).map((item, idx) => (
                                    <View key={idx} style={styles.miniGaugeItem}>
                                        <HalfGauge score={item.score} size={60} strokeWidth={6} fontSize={16} />
                                        <Text style={styles.miniGaugeLabel}>{item.label}</Text>
                                        <View style={styles.badgeWrapper}>
                                            <View style={styles.miniBadgeBox}>
                                                <View style={styles.miniBadgeShadow} />
                                                <View style={styles.miniBadgeMain}>
                                                    <Text style={styles.miniStatusText}>{getScoreInfo(item.score).label}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* RIGHT: Screenshot */}
                    <View style={styles.topRight}>
                        {screenshotSrc ? (
                            <Image src={screenshotSrc} style={styles.screenshotImg} />
                        ) : (
                            <View style={{ height: '100%', backgroundColor: '#f3f4f6' }} />
                        )}
                    </View>
                </View>

                {/* BOTTOM SECTION: Executive Summary (Standard Style) */}
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

                            {summary.working.length > 0 ? summary.working.slice(0, 4).map((p, i) => (
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

                            {summary.needsWork.length > 0 ? summary.needsWork.slice(0, 4).map((p, i) => (
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
                {/* FOOTER */}
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
                        {/* LEFT COLUMN: PURPOSE ANALYSIS (50%) */}
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

                        {/* RIGHT COLUMN: DOMAIN ANALYSIS (45%) */}
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

                {/* FOOTER */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerTextLeft}>scores are AI generated and represent an overall assessment based on 110+ factors</Text>
                    <Text style={styles.footerTextRight} render={({ pageNumber }) => (
                        `Page ${pageNumber}`
                    )} />
                </View>
            </Page>
        </Document>
    );
};
