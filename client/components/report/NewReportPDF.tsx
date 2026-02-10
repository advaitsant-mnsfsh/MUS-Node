import React, { useMemo } from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { AnalysisReport, Screenshot, ScoredParameter } from '../../types';

// --- DESIGN TOKENS (Mirrored from Web Report) ---
const COLORS = {
    black: '#000000',
    white: '#FFFFFF',
    pageBg: '#f6f7fc',
    brand: '#CE8100',
    slate900: '#0F172A',
    slate800: '#1E293B',
    slate600: '#475569',
    slate500: '#64748B',
    slate200: '#E2E8F0',
    slate100: '#F1F5F9',
    blue500: '#3b82f6',
    yellowAccent: '#fbbf24',
    emeraldSubtle: '#d1fae5',
    emeraldSolid: '#059669',
    redSubtle: '#fee2e2',
    redSolid: '#ef4444',
    amberSubtle: '#fffbeb'
};

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: COLORS.pageBg,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    logoDot: {
        color: COLORS.brand,
    },
    urlText: {
        fontSize: 10,
        color: COLORS.slate500,
        fontWeight: 'bold',
    },

    // --- HERO SECTION ---
    heroCard: {
        backgroundColor: COLORS.white,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderBottomWidth: 6,
        borderRightWidth: 6,
        borderColor: COLORS.black,
        padding: 24,
        marginBottom: 30,
    },
    heroRow: {
        flexDirection: 'row',
    },
    heroLeft: {
        flex: 1,
        marginRight: 30,
    },
    heroRight: {
        width: '40%',
    },
    overallLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: COLORS.slate900,
        marginBottom: 8,
    },
    overallScore: {
        fontSize: 52,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 4,
    },
    overallProgressContainer: {
        height: 14,
        backgroundColor: COLORS.slate100,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderColor: COLORS.black,
        marginBottom: 24,
        overflow: 'hidden',
    },
    overallProgressFill: {
        height: '100%',
    },

    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    categoryPill: {
        width: '48%',
        backgroundColor: COLORS.slate100,
        padding: 10,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: COLORS.black,
        margin: 6,
    },
    categoryName: {
        fontSize: 8,
        fontWeight: 'bold',
        color: COLORS.slate500,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    categoryValRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    categoryVal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.black,
    },

    summaryBox: {
        padding: 16,
        backgroundColor: COLORS.amberSubtle,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderColor: COLORS.black,
        marginTop: 10,
    },
    summaryLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    summaryIcon: {
        width: 14,
        height: 14,
        backgroundColor: COLORS.black,
        marginRight: 6,
    },
    summaryLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: COLORS.black,
    },
    summaryText: {
        fontSize: 9,
        lineHeight: 1.5,
        color: COLORS.slate800,
    },

    // --- SCREENSHOT SECTION ---
    screenshotContainer: {
        marginTop: 20,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: COLORS.black,
        backgroundColor: COLORS.white,
    },
    screenshotLabel: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: COLORS.black,
        color: COLORS.white,
        fontSize: 8,
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 4,
        zIndex: 10,
    },

    // --- AUDIT CARDS ---
    card: {
        backgroundColor: COLORS.white,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderBottomWidth: 5,
        borderRightWidth: 5,
        borderColor: COLORS.black,
        marginBottom: 30,
    },
    cardHeader: {
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 2,
        borderBottomColor: COLORS.black,
    },
    headerLeft: {
        flex: 1,
    },
    confidenceBadge: {
        textTransform: 'uppercase',
        fontSize: 8,
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: COLORS.black,
        marginBottom: 8,
        alignSelf: 'flex-start',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
        lineHeight: 1.2,
    },
    scorePill: {
        flexDirection: 'row',
        alignItems: 'baseline',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: COLORS.white,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderBottomWidth: 3,
        borderRightWidth: 3,
        borderTopColor: COLORS.black,
        borderLeftColor: COLORS.black,
        borderBottomColor: COLORS.yellowAccent,
        borderRightColor: COLORS.yellowAccent,
        marginLeft: 15,
    },
    scoreValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scoreTotal: {
        fontSize: 10,
        color: COLORS.slate500,
        marginLeft: 2,
    },

    cardBody: {
        padding: 24,
    },
    sectionLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 8,
    },
    sectionIcon: {
        width: 14,
        height: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: COLORS.black,
        letterSpacing: 0.5,
    },
    sectionBody: {
        fontSize: 11,
        lineHeight: 1.6,
        color: COLORS.slate800,
    },

    splitGrid: {
        flexDirection: 'row',
        marginTop: 20,
        backgroundColor: COLORS.slate100,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderColor: COLORS.black,
    },
    splitLeft: {
        flex: 1,
        padding: 16,
        borderRightWidth: 2,
        borderRightColor: COLORS.black,
    },
    splitRight: {
        flex: 1,
        padding: 16,
    },

    citationList: {
        marginTop: 20,
    },
    citationItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    citationIndex: {
        width: 20,
        height: 20,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: COLORS.black,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    citationIdxText: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    citationText: {
        flex: 1,
        fontSize: 10,
        color: COLORS.slate600,
        lineHeight: 1.5,
    },

    footer: {
        position: 'absolute',
        bottom: 20,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: COLORS.slate200,
        paddingTop: 10,
    },
    footerText: {
        fontSize: 8,
        color: COLORS.slate500,
        fontWeight: 'bold',
    }
});

// --- HELPERS ---
const getScoreColor = (score: number) => {
    if (score >= 8) return COLORS.emeraldSolid;
    if (score >= 6) return COLORS.yellowAccent;
    return COLORS.redSolid;
};

const getConfidenceStyles = (conf: string | undefined) => {
    const c = (conf || 'high').toLowerCase();
    if (c === 'high') return { bg: COLORS.emeraldSubtle };
    if (c === 'medium') return { bg: COLORS.amberSubtle };
    return { bg: COLORS.redSubtle };
};

const formatTitle = (text: string) => text.replace(/([A-Z])/g, ' $1').trim();

// --- COMPONENTS ---

const LinearScore = ({ score, label, isLarge = false }: { score: number, label: string, isLarge?: boolean }) => {
    const val = Math.round(score * 10);
    const color = getScoreColor(score);

    if (isLarge) {
        return (
            <View>
                <Text style={styles.overallLabel}>{label}</Text>
                <Text style={styles.overallScore}>{val}/100</Text>
                <View style={styles.overallProgressContainer}>
                    <View style={[styles.overallProgressFill, { width: `${val}%`, backgroundColor: color }]} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.categoryPill}>
            <Text style={styles.categoryName}>{label}</Text>
            <View style={styles.categoryValRow}>
                <Text style={styles.categoryVal}>{val}</Text>
                <Text style={{ fontSize: 8, color: COLORS.slate500 }}>/100</Text>
            </View>
        </View>
    );
};

const AuditCard = ({ param, type }: { param: ScoredParameter, type: string }) => {
    if (param.Score === 0 && type !== 'CRITICAL') return null;

    const displayScore = Math.round(param.Score * 10);
    const confStyle = getConfidenceStyles(param.Confidence || 'High');

    return (
        <View style={styles.card} wrap={false}>
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <View style={[styles.confidenceBadge, { backgroundColor: confStyle.bg }]}>
                        <Text>{param.Confidence || 'HIGH'} CONFIDENCE</Text>
                    </View>
                    <Text style={styles.cardTitle}>{formatTitle(param.ParameterName || 'Analysis Parameter')}</Text>
                </View>
                <View style={styles.scorePill}>
                    <Text style={styles.scoreValue}>{displayScore}</Text>
                    <Text style={styles.scoreTotal}>/100</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                {/* Overview */}
                <View style={styles.sectionLabelRow}>
                    <View style={[styles.sectionIcon, { backgroundColor: COLORS.black }]} />
                    <Text style={styles.sectionLabel}>Overview</Text>
                </View>
                <Text style={styles.sectionBody}>{param.Analysis}</Text>

                {/* Sub-sections Grid */}
                <View style={styles.splitGrid}>
                    <View style={styles.splitLeft}>
                        <View style={styles.sectionLabelRow}>
                            <View style={[styles.sectionIcon, { backgroundColor: COLORS.blue500, borderTopWidth: 1, borderLeftWidth: 1, borderBottomWidth: 1, borderRightWidth: 1, borderColor: COLORS.black }]} />
                            <Text style={styles.sectionLabel}>Observation</Text>
                        </View>
                        <Text style={styles.sectionBody}>{param.KeyFinding || 'Generic observation based on analysis.'}</Text>
                    </View>
                    <View style={styles.splitRight}>
                        <View style={styles.sectionLabelRow}>
                            <View style={[styles.sectionIcon, { backgroundColor: COLORS.yellowAccent, borderTopWidth: 1, borderLeftWidth: 1, borderBottomWidth: 1, borderRightWidth: 1, borderColor: COLORS.black }]} />
                            <Text style={styles.sectionLabel}>Recommendation</Text>
                        </View>
                        <Text style={styles.sectionBody}>{param.Recommendation || 'No specific action required.'}</Text>
                    </View>
                </View>

                {/* Citations */}
                {param.Citations && param.Citations.length > 0 && (
                    <View style={styles.citationList}>
                        <View style={styles.sectionLabelRow}>
                            <View style={[styles.sectionIcon, { backgroundColor: COLORS.slate200, borderTopWidth: 1, borderLeftWidth: 1, borderBottomWidth: 1, borderRightWidth: 1, borderColor: COLORS.black }]} />
                            <Text style={styles.sectionLabel}>Citations</Text>
                        </View>
                        {param.Citations.map((cite, i) => (
                            <View key={i} style={styles.citationItem}>
                                <View style={styles.citationIndex}>
                                    <Text style={styles.citationIdxText}>{i + 1}</Text>
                                </View>
                                <Text style={styles.citationText}>"{cite}"</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
};

// --- MAIN DOCUMENT ---

interface NewReportPDFProps {
    report: AnalysisReport;
    url: string;
    screenshots: Screenshot[];
}

export const NewReportPDF: React.FC<NewReportPDFProps> = ({ report, url, screenshots }) => {
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
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

    const overallScore = useMemo(() => {
        const scores = [ux?.CategoryScore, product?.CategoryScore, visual?.CategoryScore, accessibility?.CategoryScore]
            .filter(s => typeof s === 'number') as number[];
        if (scores.length === 0) return 0;
        return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    }, [ux, product, visual, accessibility]);

    const safeIssues = [
        ...(report.Top5ContextualIssues || []),
        ...((accessibility as any)?.Top5CriticalAccessibilityIssues || []).map((i: any) => ({ ...i, Confidence: 'High' }))
    ];

    const getAuditParams = (audit: any, auditType: string) => {
        if (!audit) return [];
        const paramList: { data: ScoredParameter, type: string }[] = [];
        const sectionKeys = [
            'UsabilityHeuristics', 'UsabilityMetrics', 'AccessibilityCompliance',
            'MarketFitAndBusinessAlignment', 'UserRetentionAndEngagement', 'ConversionOptimization',
            'UIConsistencyAndBranding', 'AestheticAndEmotionalAppeal', 'ResponsivenessAndAdaptability',
            'AutomatedCompliance', 'ScreenReaderExperience', 'VisualAccessibility'
        ];

        sectionKeys.forEach(key => {
            const section = audit[key] || audit[key.charAt(0).toLowerCase() + key.slice(1)];
            if (section && section.Parameters) {
                section.Parameters.forEach((p: ScoredParameter) => {
                    paramList.push({ data: p, type: auditType });
                });
            }
        });
        return paramList;
    };

    return (
        <Document title={`Full Audit Report - ${cleanUrl}`}>
            {/* PAGE 1: HERO */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>MUS NODE</Text>
                        <Text style={[styles.logoText, styles.logoDot]}>.</Text>
                    </View>
                    <Text style={styles.urlText}>{cleanUrl}</Text>
                </View>

                <View style={styles.heroCard}>
                    <View style={styles.heroRow}>
                        <View style={styles.heroLeft}>
                            <LinearScore score={overallScore} label="Overall Score" isLarge={true} />

                            <View style={styles.categoryGrid}>
                                <LinearScore score={ux?.CategoryScore || 0} label="UX Design" />
                                <LinearScore score={visual?.CategoryScore || 0} label="Visual" />
                                <LinearScore score={product?.CategoryScore || 0} label="Product" />
                                <LinearScore score={accessibility?.CategoryScore || 0} label="Access." />
                            </View>
                        </View>

                        <View style={styles.heroRight}>
                            <View style={styles.summaryBox}>
                                <View style={styles.summaryLabelRow}>
                                    <View style={styles.summaryIcon} />
                                    <Text style={styles.summaryLabel}>Executive Summary</Text>
                                </View>
                                <Text style={styles.summaryText}>{strategy?.ExecutiveSummary || 'Detailed analysis ongoing...'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.screenshotContainer}>
                    <Text style={styles.screenshotLabel}>Analyzed Page</Text>
                    {screenshotSrc && (
                        <Image src={screenshotSrc} style={{ width: '100%', height: 'auto' }} />
                    )}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>EPISODE 01: THE SCAN</Text>
                    <Text style={styles.footerText}>CONFIDENTIAL - MUS NODE AUDIT SYSTEM</Text>
                </View>
            </Page>

            {/* PAGE 2: CRITICAL FINDINGS */}
            {safeIssues.length > 0 && (
                <Page size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Text style={[styles.logoText, { fontSize: 16 }]}>MUS NODE</Text>
                            <Text style={[styles.logoText, styles.logoDot, { fontSize: 16 }]}>.</Text>
                        </View>
                        <Text style={styles.urlText}>High Impact Findings</Text>
                    </View>

                    <View style={{ marginBottom: 30 }}>
                        <Text style={{ fontSize: 26, fontWeight: 'bold', color: COLORS.black }}>Critical Vulnerabilities</Text>
                        <Text style={{ fontSize: 11, color: COLORS.slate500, marginTop: 4 }}>Immediate correction recommended for the following friction points.</Text>
                    </View>

                    <View>
                        {safeIssues.map((issue, i) => (
                            <AuditCard
                                key={`critical-${i}`}
                                param={{
                                    ParameterName: issue.Issue,
                                    Analysis: issue.Analysis,
                                    Score: issue.Score || 0,
                                    Confidence: issue.Confidence || 'HIGH',
                                    KeyFinding: issue.KeyFinding,
                                    Recommendation: issue.Recommendation,
                                    Citations: issue.Citations
                                } as any}
                                type="CRITICAL"
                            />
                        ))}
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>EPISODE 02: THE FINDINGS</Text>
                        <Text style={styles.footerText}>CRITICAL IMPACT ANALYSIS</Text>
                    </View>
                </Page>
            )}

            {/* PAGE 3: DEEP DIVE */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={[styles.logoText, { fontSize: 16 }]}>MUS NODE</Text>
                        <Text style={[styles.logoText, styles.logoDot, { fontSize: 16 }]}>.</Text>
                    </View>
                    <Text style={styles.urlText}>Detailed Deep Dive</Text>
                </View>

                <View>
                    <View style={{ marginBottom: 30 }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.black }}>Expert Parameters</Text>
                        <Text style={{ fontSize: 11, color: COLORS.slate500, marginTop: 4 }}>Full architectural breakdown across our expert audit panels.</Text>
                    </View>

                    {/* Sequential Render */}
                    {ux && getAuditParams(ux, 'UX AUDIT').map((p, i) => <AuditCard key={`ux-${i}`} param={p.data} type={p.type} />)}
                    {visual && getAuditParams(visual, 'VISUAL').map((p, i) => <AuditCard key={`vis-${i}`} param={p.data} type={p.type} />)}
                    {product && getAuditParams(product, 'PRODUCT').map((p, i) => <AuditCard key={`prod-${i}`} param={p.data} type={p.type} />)}
                    {accessibility && getAuditParams(accessibility, 'ACCESSIBILITY').map((p, i) => <AuditCard key={`acc-${i}`} param={p.data} type={p.type} />)}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>EPISODE 03: THE DEEP DIVE</Text>
                    <Text style={styles.footerText}>PARAMETER LEVEL AUDIT</Text>
                </View>
            </Page>
        </Document>
    );
};
