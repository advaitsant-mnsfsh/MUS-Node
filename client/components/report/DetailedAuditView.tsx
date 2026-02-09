import React from 'react';
import { UXAudit, ProductAudit, VisualAudit, StrategyAudit, ScoredParameter } from '../../types';
import { SkeletonLoader } from '../SkeletonLoader';
import { AuditSubSectionHeader, ScoredParameterCard } from './AuditCards';
import { StrategyAuditDisplay } from './StrategyComponents';

export type DetailedAuditType = 'UX Audit' | 'Product Audit' | 'Visual Design' | 'Strategic Foundation';

function mapAuditToSections(audit: UXAudit | ProductAudit | VisualAudit, type: DetailedAuditType) {
    if (!audit) return [];
    const a = audit as any; // Allow flexible property access

    // Helper to find key in various formats
    const findData = (keys: string[]) => {
        for (const k of keys) {
            if (a[k]) return a[k];
            // Try lowercase first char
            const camel = k.charAt(0).toLowerCase() + k.slice(1);
            if (a[camel]) return a[camel];
            // Try snake_case
            const snake = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
            if (a[snake]) return a[snake];
        }
        return undefined;
    };

    switch (type) {
        case 'UX Audit': return [
            { title: 'Usability Heuristics', data: a.UsabilityHeuristics || a.usabilityHeuristics || a.usability_heuristics },
            { title: 'Usability Metrics', data: a.UsabilityMetrics || a.usabilityMetrics || a.usability_metrics },
            { title: 'Accessibility Compliance', data: a.AccessibilityCompliance || a.accessibilityCompliance || a.accessibility_compliance },
        ];
        case 'Product Audit': return [
            { title: 'Market Fit & Business Alignment', data: a.MarketFitAndBusinessAlignment || a.marketFitAndBusinessAlignment || a.market_fit_and_business_alignment },
            { title: 'User Retention & Engagement', data: a.UserRetentionAndEngagement || a.userRetentionAndEngagement || a.user_retention_and_engagement },
            { title: 'Conversion Optimization', data: a.ConversionOptimization || a.conversionOptimization || a.conversion_optimization },
        ];
        case 'Visual Design': return [
            { title: 'UI Consistency & Branding', data: a.UIConsistencyAndBranding || a.uIConsistencyAndBranding || a.uiConsistencyAndBranding || a.ui_consistency_and_branding },
            { title: 'Aesthetic & Emotional Appeal', data: a.AestheticAndEmotionalAppeal || a.aestheticAndEmotionalAppeal || a.aesthetic_and_emotional_appeal },
            { title: 'Responsiveness & Adaptability', data: a.ResponsivenessAndAdaptability || a.responsivenessAndAdaptability || a.responsiveness_and_adaptability },
        ];
        default: return [];
    }
}

export function DetailedAuditView({ auditData, auditType, isPdf = false, forcePageBreak = false }: { auditData: UXAudit | ProductAudit | VisualAudit | StrategyAudit | undefined, auditType: DetailedAuditType, isPdf?: boolean, forcePageBreak?: boolean }) {
    if (!auditData) {
        return <SkeletonLoader className="h-96 w-full" />;
    }

    if (auditType === 'Strategic Foundation') {
        return (
            <div className="self-stretch">
                <StrategyAuditDisplay audit={auditData as StrategyAudit} isPdf={isPdf} forcePageBreak={forcePageBreak} />
            </div>
        );
    }

    // Cast to generic type that has the common fields for UX, Product, Visual
    const audit = auditData as (UXAudit | ProductAudit | VisualAudit);
    const sections = mapAuditToSections(audit, auditType);

    // Check if we found ANY data
    const hasAnyData = sections.some(s => s.data && s.data.Parameters && s.data.Parameters.length > 0);

    // Split sections to group the first one with the header
    const [firstSection, ...remainingSections] = sections;

    // ✅ PDF Spacing Constants
    const mainGap = isPdf ? "gap-2" : "gap-2";
    const headerWrapperGap = isPdf ? "gap-0" : "gap-0"; // Tightened gap between Main Title and First Subtitle
    const cardGap = isPdf ? "gap-0" : "gap-2"; // Tighter cards for PDF
    const sectionMargin = isPdf ? "mb-2" : "mb-2"; // Use user's preferred margin

    // Split parameters for the first section to allow breaking
    const firstParams = firstSection?.data?.Parameters || [];
    const [param1, ...restParams] = firstParams;
    const hasRestParams = restParams.length > 0;

    if (!hasAnyData) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 bg-slate-50 rounded-lg">
                <p className="text-slate-900 font-bold text-lg mb-2">Analysis Incomplete</p>
                <p className="text-slate-600 text-sm text-center max-w-md">
                    The AI successfully identified critical issues but stopped before generating detailed parameter scores for this section.
                    <br /><br />
                    <span className="font-bold">Recommendation:</span> Please re-run the audit to regenerate this section.
                </p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col self-stretch ${mainGap} font-['DM_Sans']`}>

            {/* HEADER + SUBHEADER + FIRST CARD (Unbreakable Unit) */}
            <div className={`break-inside-avoid pdf-item flex flex-col ${headerWrapperGap} ${forcePageBreak ? 'force-page-break-before' : ''}`}>

                {/* First Section Part 1 */}
                {firstSection && firstSection.data && (
                    <div className={hasRestParams ? "mb-0" : sectionMargin}>
                        <div className={`flex flex-col self-stretch ${cardGap}`}>
                            {param1 && <ScoredParameterCard param={param1} isPdf={isPdf} auditType={auditType} />}
                        </div>
                    </div>
                )}
            </div>

            {/* First Section Part 2 (Breakable) */}
            {hasRestParams && (
                <div className={`flex flex-col self-stretch ${cardGap} ${isPdf ? '-mt-2' : ''} ${sectionMargin}`}>
                    {restParams.map((p: ScoredParameter, i: number) => (
                        <ScoredParameterCard key={i} param={p} isPdf={isPdf} auditType={auditType} />
                    ))}
                </div>
            )}

            {/* Remaining Detailed Sections */}
            {remainingSections.map((section, index) => (
                section.data && section.data.Parameters && (
                    <div key={section.title} className={sectionMargin}>
                        <div className={`flex flex-col self-stretch ${cardGap}`}>
                            {section.data.Parameters.map((p: ScoredParameter, i: number) => <ScoredParameterCard key={i} param={p} isPdf={isPdf} auditType={auditType} />)}
                        </div>
                    </div>
                )
            ))}
        </div>
    );
}
