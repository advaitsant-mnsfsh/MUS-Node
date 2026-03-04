import React from 'react';
import { AccessibilityAudit, ScoredParameter } from '../../types';
import { SkeletonLoader } from '../SkeletonLoader';
import { AuditSubSectionHeader, ScoredParameterCard, CriticalIssueCard } from './AuditCards';

interface Props {
    data: AccessibilityAudit;
    isPdf?: boolean;
}

export const AccessibilityAuditView: React.FC<Props> = ({ data, isPdf = false }) => {
    // If data is completely missing, show "Unavailable" instead of infinite skeleton
    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 bg-slate-50 rounded-lg">
                <p className="text-slate-900 font-bold text-lg mb-2">Accessibility Analysis Unavailable</p>
                <p className="text-slate-600 text-sm text-center max-w-md">
                    The detailed accessibility data could not be generated for this report.
                    <br /><br />
                    <span className="font-bold">Recommendation:</span> Please re-run the audit to attempt analysis again.
                </p>
            </div>
        );
    }

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
    ].filter(p => (p.Score !== undefined && p.Score < 10) || (p as any).Score === undefined);

    const uniqueViolations = new Set(allFailures.map(f => f.ParameterName || (f as any).ParameterName)).size;
    const passedCount = data.PassedAudits?.Parameters?.length || 0;
    const complianceScore = !isNaN(Number(data.ComplianceScore)) ? Math.round(data.ComplianceScore!) : Math.round(data.CategoryScore);

    // ✅ PDF Spacing Constants (Matching DetailedAuditView)
    const cardGap = isPdf ? "gap-0" : "gap-2";
    const sectionMargin = isPdf ? "mb-2" : "mb-4";

    return (
        <div className={`flex flex-col self-stretch font-['DM_Sans'] ${isPdf ? 'text-slate-900' : ''}`}>





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
