import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { CompetitorAnalysisData, Screenshot, CompetitorComparisonItem } from '../../../types';

// --- DESIGN TOKENS ---
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
    primaryBlue: '#3b82f6',
    competitorRed: '#ef4444',
    emeraldSubtle: '#d1fae5',
    emeraldSolid: '#059669',
    redSubtle: '#fee2e2',
    redSolid: '#ef4444',
    blueSubtle: '#dbeafe',
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

    // Hero Card
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
    heroTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 16,
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

    // Section Card
    sectionCard: {
        backgroundColor: COLORS.white,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderBottomWidth: 3,
        borderRightWidth: 3,
        borderColor: COLORS.black,
        marginBottom: 12,
        padding: 14,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.slate200,
    },

    // Comparison Table
    comparisonRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate200,
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    comparisonParam: {
        flex: 3,
        fontSize: 9,
        fontWeight: 'bold',
        color: COLORS.slate900,
        marginRight: 8,
    },
    comparisonScore: {
        flex: 1,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 'bold',
    },
    scoreWinner: {
        color: COLORS.emeraldSolid,
    },
    scoreLoser: {
        color: COLORS.redSolid,
    },
    scoreTie: {
        color: COLORS.slate600,
    },
    comparisonAnalysis: {
        fontSize: 8,
        color: COLORS.slate600,
        marginTop: 3,
        lineHeight: 1.3,
    },

    // Strengths/Opportunities
    listItem: {
        marginBottom: 12,
        paddingLeft: 12,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.brand,
    },
    listTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 4,
    },
    listText: {
        fontSize: 9,
        color: COLORS.slate600,
        lineHeight: 1.4,
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

// Helper to format camelCase to readable text
const formatParameterName = (name: string): string => {
    if (!name) return '';
    // Add space before capital letters and capitalize first letter
    return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
};

interface CompetitorReportPDFProps {
    data: CompetitorAnalysisData;
    url: string;
}

const ComparisonTable = ({ items, title }: { items: CompetitorComparisonItem[], title: string }) => {
    if (!items || items.length === 0) return null;

    return (
        <View style={styles.sectionCard} wrap>
            <Text style={styles.sectionTitle}>{title}</Text>
            {items.map((item, idx) => (
                <View key={idx} style={styles.comparisonRow} wrap={false}>
                    {/* Left: Parameter Name + Analysis */}
                    <View style={{ flex: 2, paddingRight: 8 }}>
                        <Text style={{
                            fontSize: 9,
                            fontWeight: 'bold',
                            color: COLORS.slate900,
                            marginBottom: 4
                        }}>
                            {formatParameterName(item.Parameter)}
                        </Text>
                        <Text style={{
                            fontSize: 8,
                            color: COLORS.slate600,
                            lineHeight: 1.3
                        }}>
                            {item.Analysis}
                        </Text>
                    </View>

                    {/* Right: Score Columns */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 100 }}>
                        {/* Your Score */}
                        <View style={{ alignItems: 'center', minWidth: 40 }}>
                            <Text style={{
                                fontSize: 6,
                                color: COLORS.primaryBlue,
                                marginBottom: 2,
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                            }}>
                                YOURS
                            </Text>
                            <Text style={[
                                {
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    textAlign: 'center'
                                },
                                item.Winner === 'Primary' ? styles.scoreWinner :
                                    item.Winner === 'Tie' ? styles.scoreTie : styles.scoreLoser
                            ]}>
                                {item.PrimaryScore}
                            </Text>
                        </View>

                        {/* Competitor Score */}
                        <View style={{ alignItems: 'center', minWidth: 40 }}>
                            <Text style={{
                                fontSize: 6,
                                color: COLORS.competitorRed,
                                marginBottom: 2,
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                            }}>
                                THEIRS
                            </Text>
                            <Text style={[
                                {
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    textAlign: 'center'
                                },
                                item.Winner === 'Competitor' ? styles.scoreWinner :
                                    item.Winner === 'Tie' ? styles.scoreTie : styles.scoreLoser
                            ]}>
                                {item.CompetitorScore}
                            </Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
};

export const CompetitorReportPDF: React.FC<CompetitorReportPDFProps> = ({ data, url }) => {
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

    return (
        <Document title={`Competitor Analysis - ${cleanUrl}`}>
            {/* PAGE 1: Executive Summary */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>MUS NODE</Text>
                        <Text style={[styles.logoText, styles.logoDot]}>.</Text>
                    </View>
                    <Text style={styles.urlText}>{cleanUrl}</Text>
                </View>

                <View style={styles.heroCard}>
                    <Text style={styles.heroTitle}>Competitor Analysis Report</Text>
                    <View style={styles.summaryBox}>
                        <View style={styles.summaryLabelRow}>
                            <View style={styles.summaryIcon} />
                            <Text style={styles.summaryLabel}>Executive Summary</Text>
                        </View>
                        <Text style={styles.summaryText}>{data.ExecutiveSummary || 'Analysis complete.'}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>COMPETITOR ANALYSIS - MUS NODE</Text>
                    <Text style={styles.footerText}>CONFIDENTIAL</Text>
                </View>
            </Page>

            {/* PAGE 2: Detailed Comparisons */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={[styles.logoText, { fontSize: 16 }]}>MUS NODE</Text>
                        <Text style={[styles.logoText, styles.logoDot, { fontSize: 16 }]}>.</Text>
                    </View>
                    <Text style={styles.urlText}>Detailed Comparison</Text>
                </View>

                {data.UXComparison && data.UXComparison.length > 0 && (
                    <ComparisonTable items={data.UXComparison} title="UX Comparison" />
                )}
                {data.ProductComparison && data.ProductComparison.length > 0 && (
                    <ComparisonTable items={data.ProductComparison} title="Product Comparison" />
                )}
                {data.VisualComparison && data.VisualComparison.length > 0 && (
                    <ComparisonTable items={data.VisualComparison} title="Visual Design Comparison" />
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>DETAILED METRICS</Text>
                    <Text style={styles.footerText}>Page 2</Text>
                </View>
            </Page>

            {/* PAGE 3: Strategy, Accessibility, Strengths & Opportunities */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={[styles.logoText, { fontSize: 16 }]}>MUS NODE</Text>
                        <Text style={[styles.logoText, styles.logoDot, { fontSize: 16 }]}>.</Text>
                    </View>
                    <Text style={styles.urlText}>Strategic Insights</Text>
                </View>

                {data.StrategyComparison && data.StrategyComparison.length > 0 && (
                    <ComparisonTable items={data.StrategyComparison} title="Strategy Comparison" />
                )}
                {data.AccessibilityComparison && data.AccessibilityComparison.length > 0 && (
                    <ComparisonTable items={data.AccessibilityComparison} title="Accessibility Comparison" />
                )}

                {/* Strengths & Opportunities */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Your Strengths</Text>
                    {data.PrimaryStrengths?.slice(0, 3).map((strength, idx) => (
                        <View key={idx} style={styles.listItem}>
                            <Text style={styles.listTitle}>{strength.Strength}</Text>
                            <Text style={styles.listText}>{strength.Description}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Opportunities for Improvement</Text>
                    {data.Opportunities?.slice(0, 3).map((opp, idx) => (
                        <View key={idx} style={styles.listItem}>
                            <Text style={styles.listTitle}>{opp.Opportunity}</Text>
                            <Text style={styles.listText}>{opp.ActionPlan}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>STRATEGIC RECOMMENDATIONS</Text>
                    <Text style={styles.footerText}>Page 3</Text>
                </View>
            </Page>
        </Document>
    );
};
