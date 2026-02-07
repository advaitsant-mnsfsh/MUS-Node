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

            {/* Passed Checks Section */}
            {data.PassedAudits && data.PassedAudits.Parameters && data.PassedAudits.Parameters.length > 0 && (
                <div className={`${sectionMargin} ${isPdf ? 'break-inside-avoid pdf-item' : ''}`}>
                    <AuditSubSectionHeader title={`Passed Audits (${data.PassedAudits.Parameters.length})`} className="text-emerald-700" isPdf={isPdf} />
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        {data.PassedAudits.Parameters.slice(0, 10).map((p, i) => (
                            <div key={i} className="p-3 border-b border-slate-100 last:border-0 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                <div className="flex gap-3 items-center">
                                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                        <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm">{p.ParameterName}</h4>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-tight">Compliant</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Manual Checks Section */}
            {data.ManualChecks && data.ManualChecks.length > 0 && (
                <div className={`${sectionMargin} ${isPdf ? 'break-inside-avoid pdf-item' : ''}`}>
                    <AuditSubSectionHeader title={`Manual Verification Required`} className="text-amber-700" isPdf={isPdf} />
                    <div className="bg-amber-50/20 rounded-xl border border-amber-200 overflow-hidden shadow-sm">
                        {data.ManualChecks.map((item, i) => (
                            <div key={i} className="p-4 border-b border-amber-100 last:border-0">
                                <div className="flex gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                        <span className="text-amber-700 text-[10px] font-black">?</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">{item.id}</h4>
                                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Overall Recommendations */}
            {data.OverallRecommendations && data.OverallRecommendations.length > 0 && (
                <div className={`mt-4 p-6 bg-indigo-50 border border-indigo-100 rounded-xl break-inside-avoid pdf-item`}>
                    <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-widest mb-4">Strategic Accessibility Guidance</h4>
                    <div className="flex flex-col gap-3">
                        {data.OverallRecommendations.map((rec, i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                <p className="text-sm text-indigo-900 leading-relaxed font-medium">{rec}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccessibilityAuditView;
