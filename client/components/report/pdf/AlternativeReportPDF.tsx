import React, { useMemo } from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer';
import { AnalysisReport, Screenshot } from '../../../types';

// --- DESIGN TOKENS (Matching StandardReportPDF) ---
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
    // --- LAYOUT ---
    mainContentRow: {
        flexDirection: 'row',
        width: '100%',
        height: '92%', // Occupy remaining page height
        gap: 20,
    },
    leftColumn: {
        width: '50%',
        height: '100%',
    },
    rightColumn: {
        width: '50%',
        height: '100%',
    },

    // --- GAUGES ---
    gaugesContainer: {
        marginBottom: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    overallScoreContainer: {
        width: '100%',
        marginBottom: 20,
        alignItems: 'center',
    },
    categoryGrid: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },

    // Gauges
    largeGaugeContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    miniGaugeItem: {
        width: '45%',
        alignItems: 'center',
        marginBottom: 10,
    },
    miniGaugeLabel: {
        marginTop: 4,
        fontSize: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: COLORS.black,
        marginBottom: 4,
    },

    // Badges (Neo-Brutalist)
    badgeWrapper: {
        marginTop: 4,
        position: 'relative',
        height: 20,
        width: '100%',
        alignItems: 'center', // Center badge within item
    },
    // Main Badge styles
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

    // Mini Badge Styles
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
    summarySection: {
        marginTop: 10,
        width: '100%',
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'black',
        color: COLORS.black,
        marginBottom: 10,
        textTransform: 'uppercase',
        borderLeftWidth: 6,
        borderLeftColor: '#6366f1', // Indigo-like accent
        paddingLeft: 8,
    },
    summaryHeaderWrapper: {
        height: 20,
        marginBottom: 8,
        position: 'relative',
        alignSelf: 'flex-start',
        minWidth: 120,
    },
    summaryHeaderShadow: {
        position: 'absolute', title: '',
        top: 2,
        left: 2,
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.black,
    },
    summaryHeaderMain: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderWidth: 1.5,
        borderColor: COLORS.black,
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    summaryHeaderText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: COLORS.black,
        textTransform: 'uppercase',
    },
    summaryPoint: {
        fontSize: 9,
        lineHeight: 1.5,
        color: COLORS.slate700,
        marginBottom: 8,
    },
    citationSmall: {
        fontSize: 7,
        color: '#666',
        marginTop: 2,
        fontStyle: 'italic',
    },

    // --- SCREENSHOT ---
    screenshotColumn: {
        height: '100%',
        width: '100%',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
    },
    screenshotImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'top',
    },
});

// --- HELPERS (Copied from StandardReportPDF) ---
const getScoreInfo = (score: number) => {
    if (score >= 9) return { color: COLORS.veryGood, label: 'VERY GOOD' };
    if (score >= 7) return { color: COLORS.satisfactory, label: 'SATISFACTORY' };
    if (score >= 5) return { color: COLORS.needsImprovement, label: 'NEEDS IMPROVEMENT' };
    return { color: COLORS.critical, label: 'CRITICAL' };
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
            <Text style={{ position: 'absolute', bottom: 2, fontSize: fontSize, fontWeight: 'bold', color: COLORS.black }}>
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

interface AlternativeReportPDFProps {
    report: AnalysisReport;
    url: string;
    screenshots: Screenshot[];
    whiteLabelLogo?: string | null;
}

export const AlternativeReportPDF: React.FC<AlternativeReportPDFProps> = ({ report, url, screenshots, whiteLabelLogo }) => {
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

    return (
        <Document title={`UX Audit Report - ${url?.replace(/^https?:\/\//, '')?.replace(/\/$/, '') || 'Analyzed Site'} (Alt)`}>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <Text>
                        <Text style={styles.titlePrefix}>Here's Your </Text>
                        <Text style={styles.titleMain}>UX Score</Text>
                    </Text>
                </View>

                {/* Main 2-Column Layout */}
                <View style={styles.mainContentRow}>

                    {/* LEFT COLUMN: Graves + Executive Summary */}
                    <View style={styles.leftColumn}>

                        {/* 1. Overall Score */}
                        <View style={styles.overallScoreContainer}>
                            <View style={styles.largeGaugeContainer}>
                                <HalfGauge score={overallScore} size={140} strokeWidth={16} fontSize={36} />
                            </View>
                            <Text style={styles.miniGaugeLabel}>OVERALL SCORE</Text>
                            {/* Main Badge */}
                            <View style={styles.mainBadgeWrapper}>
                                <View style={styles.mainBadgeShadow} />
                                <View style={styles.mainBadgeMain}>
                                    <Text style={styles.mainStatusText}>{getScoreInfo(overallScore).label}</Text>
                                </View>
                            </View>
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
                                    <HalfGauge score={item.score} size={60} strokeWidth={6} fontSize={16} />
                                    <Text style={styles.miniGaugeLabel}>{item.label}</Text>
                                    {/* Mini Badge */}
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

                        {/* 3. Executive Summary */}
                        <View style={styles.summarySection}>
                            <Text style={styles.summaryTitle}>Executive Summary</Text>

                            {/* What works */}
                            <View style={{ marginBottom: 15 }}>
                                <View style={styles.summaryHeaderWrapper}>
                                    <View style={styles.summaryHeaderShadow} />
                                    <View style={[styles.summaryHeaderMain, { backgroundColor: '#fef08a' }]}>
                                        <Text style={styles.summaryHeaderText}>WHAT IS WORKING</Text>
                                    </View>
                                </View>
                                {summary.working.slice(0, 3).map((p, i) => ( // Limit to 3 to fit page
                                    <Text key={i} style={styles.summaryPoint}>{p.split('(Citation:')[0].trim()}</Text>
                                ))}
                            </View>

                            {/* What needs work */}
                            <View>
                                <View style={styles.summaryHeaderWrapper}>
                                    <View style={styles.summaryHeaderShadow} />
                                    <View style={[styles.summaryHeaderMain, { backgroundColor: '#fecaca' }]}>
                                        <Text style={styles.summaryHeaderText}>WHAT NEEDS WORK</Text>
                                    </View>
                                </View>
                                {summary.needsWork.slice(0, 3).map((p, i) => ( // Limit to 3
                                    <Text key={i} style={styles.summaryPoint}>{p.split('(Citation:')[0].trim()}</Text>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* RIGHT COLUMN: Full Height Screenshot */}
                    <View style={styles.rightColumn}>
                        <View style={styles.screenshotColumn}>
                            {screenshotSrc ? (
                                <Image src={screenshotSrc} style={styles.screenshotImg} />
                            ) : (
                                <View style={{ height: '100%', backgroundColor: '#f3f4f6' }} />
                            )}
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
