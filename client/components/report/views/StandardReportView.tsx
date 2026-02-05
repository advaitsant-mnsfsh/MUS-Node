import React, { useState, useMemo } from 'react';
import { AnalysisReport, Screenshot } from '../../../types';
import { SkeletonLoader } from '../../SkeletonLoader';
import { ScoreDisplayCard, LinearScoreDisplay } from '../ScoreComponents';
import { CriticalIssueCard } from '../AuditCards';
import { DetailedAuditView, DetailedAuditType } from '../DetailedAuditView';
import AccessibilityAuditView from '../AccessibilityAuditView';
import {
    LayoutGrid,
    PenTool,
    Palette,
    Box,
    Accessibility
} from 'lucide-react';

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

                {/* 1. TOP SECTION: Executive Summary & Preview (Always Visible) */}
                <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4">
                    {/* 50/50 Split Section */}
                    <div className="flex flex-col lg:flex-row border-b-2 border-black">

                        {/* LEFT COLUMN: Scores & Text (50%) */}
                        <div className="w-full lg:w-1/2 p-8 lg:p-12 border-r-2 border-black flex flex-col gap-10">

                            {/* Scores Section */}
                            <div className="w-full border-b-2 pb-6 border-black">
                                {/* Overall Score (Large) */}
                                <div className="mb-10">
                                    <div className="pb-2 ">
                                        <LinearScoreDisplay score={overallScore} label="Overall Score" isLarge={true} />
                                    </div>
                                </div>

                                {/* Sub Categories Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                    {ux ? <LinearScoreDisplay score={ux.CategoryScore} label="UX Design" /> : <SkeletonLoader className="h-16" />}
                                    {visual ? <LinearScoreDisplay score={visual.CategoryScore} label="Visual Design" /> : <SkeletonLoader className="h-16" />}
                                    {product ? <LinearScoreDisplay score={product.CategoryScore} label="Product Design" /> : <SkeletonLoader className="h-16" />}
                                    {accessibility ? <LinearScoreDisplay score={accessibility.CategoryScore} label="Accessibility" /> : <SkeletonLoader className="h-16" />}
                                </div>
                            </div>

                            {/* Executive Summary Text */}
                            <div className="mt-2">
                                <h3 className="text-2xl font-black text-black mb-6 uppercase tracking-tight">Executive Summary</h3>

                                {strategy?.ExecutiveSummary ? (
                                    <div className="prose prose-slate max-w-none border-l-4 border-black pl-6 py-2">
                                        <div className="text-slate-900 leading-relaxed text-base font-semibold whitespace-pre-line">
                                            {strategy.ExecutiveSummary}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 bg-page-bg border-2 border-black border-dashed">
                                        <SkeletonLoader className="h-4 w-3/4 mb-2" />
                                        <SkeletonLoader className="h-4 w-full mb-2" />
                                        <SkeletonLoader className="h-4 w-5/6" />
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* RIGHT COLUMN: Website Preview (50%) */}
                        <div className="w-full lg:w-1/2 relative bg-page-bg min-h-[500px] lg:min-h-0 border-t-2 lg:border-t-0 border-black">
                            {/* Absolute container to fill the available height (Left Col Height on Desktop, Fixed on Mobile) */}
                            <div className="absolute inset-0 flex flex-col p-8 lg:p-12">
                                <div className="relative w-full h-full border-2 border-black shadow-neo bg-white p-2">
                                    {primaryScreenshotSrc ? (
                                        <div className="w-full h-full flex flex-col overflow-hidden relative group">
                                            {/* Image - Cover Fit */}
                                            <div className="flex-1 relative w-full bg-slate-100 overflow-hidden">
                                                <img
                                                    src={primaryScreenshotSrc}
                                                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                                                    alt="Analyzed Page Preview"
                                                    onError={(e) => console.error('[ReportDisplay] Image Load Failed:', e.currentTarget.src)}
                                                />
                                            </div>
                                            {/* Overlay Badge */}
                                            <div className="absolute bottom-4 right-4 bg-white border-2 border-black px-3 py-1 shadow-neo z-10">
                                                <span className="text-xs font-black uppercase tracking-wider text-black">Live Preview</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center p-12 bg-slate-50">
                                            <div className="bg-white px-4 py-2 border-2 border-black shadow-neo">
                                                <span className="font-bold text-black">Analyzing Interface...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. MIDDLE SECTION: Context Capture (Full Width Below Split) */}
                    <div className="w-full p-8 lg:p-12 bg-white border-b-2 border-black">
                        <DetailedAuditView auditData={strategy} auditType={'Strategic Foundation'} />
                    </div>
                </div>

                {/* 3. BOTTOM SECTION: Score Breakdown & Detailed Cards */}
                <div className="bg-page-bg min-h-screen pt-12">

                    {/* Header & Tabs */}
                    <div className="sticky top-0 z-10 bg-white border-y-2 border-black py-4 shadow-sm px-8 lg:px-12 mb-12">
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
                    <div className="mx-8 lg:mx-12 flex flex-col gap-12 animate-in nav-fade-in duration-300 pb-20">

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
