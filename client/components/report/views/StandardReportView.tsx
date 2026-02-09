import React, { useState, useMemo } from 'react';
import { AnalysisReport, Screenshot } from '../../../types';
import { SkeletonLoader } from '../../SkeletonLoader';
import { ScoreDisplayCard } from '../ScoreComponents';
import { CriticalIssueCard } from '../AuditCards';
import { DetailedAuditView, DetailedAuditType } from '../DetailedAuditView';
import AccessibilityAuditView from '../AccessibilityAuditView';
import {
    LayoutGrid,
    PenTool,
    Palette,
    Box,
    Accessibility,
    Target
} from 'lucide-react';
import { ExecutiveSummaryDisplay } from '../ExecutiveSummaryDisplay';

interface StandardReportViewProps {
    report: AnalysisReport;
    primaryScreenshotSrc?: string;
}

// ... imports
export const StandardReportView: React.FC<StandardReportViewProps> = ({ report, primaryScreenshotSrc }) => {

    // --- DATA EXTRACT ---
    const {
        "UX Audit expert": ux,
        "Product Audit expert": product,
        "Visual Audit expert": visual,
        "Strategy Audit expert": strategy,
        "Accessibility Audit expert": accessibility,
        Top5ContextualIssues
    } = report;

    const [activeTab, setActiveTab] = useState('All Parameters');
    console.log('[StandardReportView] Active Tab:', activeTab);
    console.log('[StandardReportView] UX Data:', ux ? Object.keys(ux) : 'Missing');

    const TABS = [
        { id: 'All Parameters', label: 'All Parameters', icon: LayoutGrid },
        { id: 'UX Audit', label: 'UX Design', icon: PenTool },
        { id: 'Visual Design', label: 'Visual Design', icon: Palette },
        { id: 'Product Audit', label: 'Product Design', icon: Box },
        { id: 'Accessibility Audit', label: 'Accessibility', icon: Accessibility },
    ];

    // Calculate Overall Score
    const overallScore = useMemo(() => {
        if (!report) return 0;
        const scores = [ux?.CategoryScore, product?.CategoryScore, visual?.CategoryScore, accessibility?.CategoryScore]
            .filter(s => typeof s === 'number') as number[];
        if (scores.length === 0) return 0;
        return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    }, [ux, product, visual, accessibility, report]);

    return (
        <>
            <div className="font-['DM_Sans']">

                {/* 1. TOP SECTION: Executive Summary & Preview (Card Style) */}
                <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 mb-12 mx-4 md:mx-8">
                    <div className="flex flex-col lg:flex-row border-x-2 border-b-2 border-black shadow-neo bg-white">

                        {/* LEFT COLUMN: Scores & Text (50%) */}
                        <div className="w-full lg:w-1/2 p-6 md:p-8 border-r-2 border-black flex flex-col gap-8">

                            {/* Scores Section */}
                            <div className="w-full border-b-2 pb-6 border-black">
                                {/* Overall Score (Large Hero Gauge) */}
                                <div className="mb-8 flex justify-center">
                                    <div className="w-full max-w-[280px]">
                                        <ScoreDisplayCard score={overallScore} label="Overall Score" isHero={true} />
                                    </div>
                                </div>

                                {/* Sub Categories Grid (2x2) */}
                                <div className="grid grid-cols-2 gap-4">
                                    {ux ? <ScoreDisplayCard score={ux.CategoryScore} label="UX Audit" /> : <SkeletonLoader className="h-32 border-2 border-black shadow-neo rounded-none" />}
                                    {visual ? <ScoreDisplayCard score={visual.CategoryScore} label="Visual Design" /> : <SkeletonLoader className="h-32 border-2 border-black shadow-neo rounded-none" />}
                                    {product ? <ScoreDisplayCard score={product.CategoryScore} label="Product Audit" /> : <SkeletonLoader className="h-32 border-2 border-black shadow-neo rounded-none" />}
                                    {accessibility ? <ScoreDisplayCard score={accessibility.CategoryScore} label="Accessibility" /> : <SkeletonLoader className="h-32 border-2 border-black shadow-neo rounded-none" />}
                                </div>
                            </div>

                            {/* Executive Summary Text */}
                            <div className="text-left">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-4 h-8 bg-brand border-2 border-black shadow-neo"></div>
                                    <h2 className="text-2xl font-black text-black uppercase tracking-tight">Executive Summary</h2>
                                </div>
                                {strategy?.ExecutiveSummary ? (
                                    <ExecutiveSummaryDisplay summaryText={strategy.ExecutiveSummary} />
                                ) : (
                                    <div className="p-6 bg-page-bg border-2 border-black border-dashed">
                                        <SkeletonLoader className="h-4 w-3/4 mb-2" />
                                        <SkeletonLoader className="h-4 w-full mb-2" />
                                        <SkeletonLoader className="h-4 w-5/6" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Website Preview (50% - Full Bleed) */}
                        <div className="w-full lg:w-1/2 relative bg-slate-100 h-96 lg:h-auto border-t-2 lg:border-t-0 border-black group overflow-hidden">
                            {/* Overlay Badge */}
                            <div className="absolute top-4 right-4 z-10 flex flex-col items-end pointer-events-none">
                                <span className="text-[10px] font-black text-black uppercase tracking-wider bg-white px-2 py-1 border-2 border-black shadow-neo mb-1">
                                    Analyzed Website
                                </span>
                            </div>

                            {/* Full Bleed Image - Absolute on Desktop to match height of left col */}
                            <div className="absolute inset-0 w-full h-full">
                                {primaryScreenshotSrc ? (
                                    <img
                                        src={primaryScreenshotSrc}
                                        className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
                                        alt="Analyzed Page Preview"
                                        onError={(e) => console.error('[ReportDisplay] Image Load Failed:', e.currentTarget.src)}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                        <div className="bg-white px-4 py-2 border-2 border-black shadow-neo">
                                            <span className="font-bold text-black">Analyzing Interface...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. MIDDLE SECTION: Context Capture (Full Width Below Split) */}
                    <div className="mt-12 mx-4 md:mx-0">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-accent-yellow border-2 border-black text-black shadow-neo">
                                <Target className="w-6 h-6" strokeWidth={2.5} />
                            </div>
                            <h3 className="text-2xl font-black text-black uppercase">Strategic Foundation</h3>
                        </div>
                        <DetailedAuditView auditData={strategy} auditType={'Strategic Foundation'} />
                    </div>
                </div>

                {/* 3. BOTTOM SECTION: Score Breakdown & Detailed Cards */}
                <div className="pt-2">

                    {/* Header & Tabs */}
                    <div className="sticky top-0 z-10 bg-white border-2 border-black py-4 shadow-neo px-6 lg:px-8 mb-12 mx-4 md:mx-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-2xl font-black text-black uppercase">Score Breakdown</h3>
                                <p className="text-slate-600 font-bold text-sm">Detailed parameter analysis.</p>
                            </div>

                            <nav className="flex space-x-2 bg-white overflow-x-auto no-scrollbar max-w-full p-1">
                                {TABS.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 whitespace-nowrap py-2.5 px-5 font-bold text-sm transition-all border-2 ${isActive
                                                ? 'bg-brand text-white border-black shadow-neo -translate-y-[2px]'
                                                : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 hover:text-black hover:border-black'
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Filtered Content Area */}
                    <div className="flex flex-col gap-12 animate-in nav-fade-in duration-300 pb-20 mx-4 md:mx-8">

                        {/* CASE 1: All Parameters (Stack Everything) */}
                        {activeTab === 'All Parameters' && (
                            <>
                                <DetailedAuditView auditData={ux} auditType={'UX Audit'} />
                                <DetailedAuditView auditData={visual} auditType={'Visual Design'} />
                                <DetailedAuditView auditData={product} auditType={'Product Audit'} />
                                {accessibility && <AccessibilityAuditView data={accessibility} />}
                            </>
                        )}

                        {/* CASE 2: Specific Tabs */}
                        {activeTab === 'UX Audit' && <DetailedAuditView auditData={ux} auditType={'UX Audit'} />}
                        {activeTab === 'Visual Design' && <DetailedAuditView auditData={visual} auditType={'Visual Design'} />}
                        {activeTab === 'Product Audit' && <DetailedAuditView auditData={product} auditType={'Product Audit'} />}
                        {activeTab === 'Accessibility Audit' && accessibility && <AccessibilityAuditView data={accessibility} />}
                    </div>
                </div>
            </div>
        </>
    );
};
