import React, { useMemo } from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { AnalysisReport, Screenshot, ScoredParameter } from '../../../types';

// --- DESIGN TOKENS (Matching Web Report) ---
const COLORS = {
    black: '#000000',
    white: '#FFFFFF',
    pageBg: '#f6f7fc',
    brand: '#CE8100',
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
        borderBottomWidth: 3,
        borderRightWidth: 3,
        borderColor: COLORS.black,
        padding: 16,
        marginBottom: 20,
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
        marginTop: 12,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderBottomWidth: 3,
        borderRightWidth: 3,
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

    // --- SECTION HEADERS ---
    sectionHeader: {
        marginBottom: 16,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 10,
        color: COLORS.slate600,
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
        gap: 6,
    },
    confidenceBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: COLORS.black,
    },
    confidenceText: {
        fontSize: 6,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    scorePill: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: COLORS.black,
        backgroundColor: COLORS.slate100,
    },
    scoreValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.black,
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
    if (c === 'high') return { bg: COLORS.emeraldSubtle, text: 'HIGH CONFIDENCE' };
    if (c === 'medium') return { bg: COLORS.amberSubtle, text: 'MEDIUM CONFIDENCE' };
    return { bg: COLORS.redSubtle, text: 'LOW CONFIDENCE' };
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
        <View style={[styles.paramCard, { borderLeftWidth: 4, borderLeftColor: COLORS.redSolid }]} wrap={false}>
            <View style={styles.paramHeader}>
                <View style={styles.paramTitleRow}>
                    <Text style={styles.auditTypeLabel}>CRITICAL ISSUE</Text>
                    <Text style={[styles.paramTitle, { color: COLORS.redSolid }]}>{issue.Issue}</Text>
                </View>
            </View>

            {/* Impact */}
            <View style={styles.overviewSection}>
                <View style={styles.overviewLabel}>
                    <View style={[styles.overviewIcon, { backgroundColor: COLORS.redSolid }]} />
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
}

export const StandardReportPDF: React.FC<StandardReportPDFProps> = ({ report, url, screenshots }) => {
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


    return (
        <Document title={`UX Audit Report - ${cleanUrl}`}>
            {/* PAGE 1: HERO + EXECUTIVE SUMMARY */}
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
                    <Text style={styles.footerText}>MUS NODE AUDIT SYSTEM</Text>
                    <Text style={styles.footerText}>CONFIDENTIAL</Text>
                </View>
            </Page>

            {/* PAGE 2+: CONTEXT CAPTURE (Strategic Foundation) */}
            {strategy?.ContextCapture && (
                <Page size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <Text style={[styles.logoText, { fontSize: 16 }]}>MUS NODE.</Text>
                        <Text style={styles.urlText}>Strategic Foundation</Text>
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Context Capture</Text>
                        <Text style={styles.sectionSubtitle}>Understanding the strategic context</Text>
                    </View>

                    <View style={styles.paramCard}>
                        <Text style={styles.overviewText}>{strategy.ContextCapture}</Text>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>STRATEGIC FOUNDATION</Text>
                        <Text style={styles.footerText}>Page 2</Text>
                    </View>
                </Page>
            )}

            {/* PAGE 3+: UX AUDIT PARAMETERS */}
            {uxParams.length > 0 && (
                <Page size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <Text style={[styles.logoText, { fontSize: 16 }]}>MUS NODE.</Text>
                        <Text style={styles.urlText}>UX Audit Parameters</Text>
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>UX Audit</Text>
                        <Text style={styles.sectionSubtitle}>Usability Heuristics · Metrics · Accessibility</Text>
                    </View>

                    {uxParams.map((p, i) => <ParameterCard key={i} param={p} auditType="UX AUDIT" />)}

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>UX AUDIT</Text>
                        <Text style={styles.footerText}>Detail Level Analysis</Text>
                    </View>
                </Page>
            )}

            {/* PAGE 4+: VISUAL DESIGN PARAMETERS */}
            {visualParams.length > 0 && (
                <Page size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <Text style={[styles.logoText, { fontSize: 16 }]}>MUS NODE.</Text>
                        <Text style={styles.urlText}>Visual Design Parameters</Text>
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Visual Design</Text>
                        <Text style={styles.sectionSubtitle}>Consistency · Aesthetics · Responsiveness</Text>
                    </View>

                    {visualParams.map((p, i) => <ParameterCard key={i} param={p} auditType="VISUAL DESIGN" />)}

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>VISUAL DESIGN AUDIT</Text>
                        <Text style={styles.footerText}>Detail Level Analysis</Text>
                    </View>
                </Page>
            )}

            {/* PAGE 5+: PRODUCT AUDIT PARAMETERS */}
            {productParams.length > 0 && (
                <Page size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <Text style={[styles.logoText, { fontSize: 16 }]}>MUS NODE.</Text>
                        <Text style={styles.urlText}>Product Audit Parameters</Text>
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Product Audit</Text>
                        <Text style={styles.sectionSubtitle}>Market Fit · Retention · Conversion</Text>
                    </View>

                    {productParams.map((p, i) => <ParameterCard key={i} param={p} auditType="PRODUCT AUDIT" />)}

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>PRODUCT AUDIT</Text>
                        <Text style={styles.footerText}>Detail Level Analysis</Text>
                    </View>
                </Page>
            )}

            {/* PAGE 6+: ACCESSIBILITY AUDIT */}
            {accessibility && (
                <Page size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <Text style={[styles.logoText, { fontSize: 16 }]}>MUS NODE.</Text>
                        <Text style={styles.urlText}>Accessibility Audit</Text>
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Accessibility Audit</Text>
                        <Text style={styles.sectionSubtitle}>WCAG Compliance · Critical Issues · Best Practices</Text>
                    </View>

                    {/* Critical Issues First */}
                    {accessibility.Top5CriticalAccessibilityIssues && accessibility.Top5CriticalAccessibilityIssues.length > 0 && (
                        <View style={{ marginBottom: 16 }}>
                            <Text style={[styles.paramTitle, { marginBottom: 10, color: COLORS.redSolid }]}>
                                ⚠ Critical Compliance Failures
                            </Text>
                            {accessibility.Top5CriticalAccessibilityIssues.map((issue, idx) => (
                                <CriticalIssueCard key={idx} issue={issue} />
                            ))}
                        </View>
                    )}

                    {/* All Parameters */}
                    {accessibilityParams.length > 0 && (
                        <View>
                            <Text style={[styles.paramTitle, { marginBottom: 10 }]}>
                                Detailed Assessment
                            </Text>
                            {accessibilityParams.map((p, i) => <ParameterCard key={i} param={p} auditType="ACCESSIBILITY" />)}
                        </View>
                    )}

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>ACCESSIBILITY AUDIT</Text>
                        <Text style={styles.footerText}>WCAG 2.1 Compliance</Text>
                    </View>
                </Page>
            )}
        </Document>
    );
};
