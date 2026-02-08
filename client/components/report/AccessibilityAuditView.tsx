import React from 'react';
import { AccessibilityAudit, ScoredParameter } from '../../types';
import { SkeletonLoader } from '../SkeletonLoader';
import { AuditSubSectionHeader, ScoredParameterCard, CriticalIssueCard } from './AuditCards';

interface Props {
    data: AccessibilityAudit;
    isPdf?: boolean;
}

export const AccessibilityAuditView: React.FC<Props> = ({ data, isPdf = false }) => {
    if (!data) return <SkeletonLoader className="h-96 w-full" />;

    const sections = [
        { title: 'Automated Compliance (WCAG)', data: data.AutomatedCompliance },
        { title: 'Screen Reader Experience', data: data.ScreenReaderExperience },
        { title: 'Visual Accessibility', data: data.VisualAccessibility },
    ];

    // Robust counting logic
    const allFailures = [
        ...(data.AutomatedCompliance?.Parameters || []),
        ...(data.ScreenReaderExperience?.Parameters || []),
        ...(data.VisualAccessibility?.Parameters || []),
        ...(data.Top5CriticalAccessibilityIssues?.map(i => ({ ParameterName: i.Issue, Score: 0 })) || [])
    ].filter(p => (p.Score !== undefined && p.Score < 10) || (p as any).Score === undefined);

    const uniqueViolations = new Set(allFailures.map(f => f.ParameterName || (f as any).ParameterName)).size;
    const passedCount = data.PassedAudits?.Parameters?.length || 0;
    const complianceScore = !isNaN(Number(data.ComplianceScore)) ? Math.round(data.ComplianceScore!) : Math.round(data.CategoryScore);

    // ✅ PDF Spacing Constants (Matching DetailedAuditView)
    const cardGap = isPdf ? "gap-0" : "gap-2";
    const sectionMargin = isPdf ? "mb-2" : "mb-4";

    return (
        <div className={`flex flex-col self-stretch font-['DM_Sans'] ${isPdf ? 'text-slate-900' : ''}`}>



            {/* Critical Issues Section */}
            {data.Top5CriticalAccessibilityIssues?.length > 0 && (
                <div className={`mb-4 ${isPdf ? 'break-inside-avoid pdf-item' : ''}`}>
                    <AuditSubSectionHeader title="Critical Compliance Failures" className="mb-4" isPdf={isPdf} />
                    <div className={`flex flex-col self-stretch ${cardGap}`}>
                        {data.Top5CriticalAccessibilityIssues.map((issue, idx) => (
                            <CriticalIssueCard key={idx} issue={{ ...issue, source: 'Axe-Core Detection' }} isPdf={isPdf} />
                        ))}
                    </div>
                </div>
            )}

            {/* Detailed Sections (Failures) */}
            {sections.map((section) => (
                section.data && section.data.Parameters && section.data.Parameters.length > 0 && (
                    <div key={section.title} className={`${sectionMargin} ${isPdf ? 'break-inside-avoid pdf-item' : ''}`}>
                        <AuditSubSectionHeader title={section.title} score={section.data.SectionScore * 10} isPdf={isPdf} />
                        <div className={`flex flex-col self-stretch ${cardGap}`}>
                            {section.data.Parameters.map((p: ScoredParameter, i: number) => (
                                <ScoredParameterCard key={i} param={p} isPdf={isPdf} />
                            ))}
                        </div>
                    </div>
                )
            ))}


        </div>
    );
};

export default AccessibilityAuditView;
