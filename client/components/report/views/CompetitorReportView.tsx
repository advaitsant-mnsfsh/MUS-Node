import React, { useState } from 'react';
import { useGlobalAudit } from '../../../contexts/AuditContext';
import { CompetitorAnalysisData, CompetitorComparisonItem } from '../../../types';
import {
    LayoutGrid,
    PenTool,
    Box,
    Palette,
    BrainCircuit,
    Accessibility,
    Trophy,
    Target,
    TrendingUp,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Globe
} from 'lucide-react';
import { ExecutiveSummaryDisplay } from '../ExecutiveSummaryDisplay';
import SiteLogo from '../../SiteLogo';

interface CompetitorReportViewProps {
    data: CompetitorAnalysisData;
    primaryUrl?: string;
    competitorUrl?: string;
    primaryScreenshot?: string;
    competitorScreenshot?: string;
    isSharedView?: boolean;
}

// ... imports remain the same

// ... imports

export const CompetitorReportView: React.FC<CompetitorReportViewProps> = ({
    data,
    primaryUrl = "Your Website",
    competitorUrl = "Competitor Website",
    primaryScreenshot,
    competitorScreenshot,
    isSharedView
}) => {
    // Sticky Top Offset Calculation
    // Normal: 154px (80px Global Nav + 74px Action Bar)
    // Shared: 74px -> Reduced to 66px to ensure overlap/no gap
    const stickyTopClass = isSharedView ? 'top-[58px] md:top-[66px]' : 'top-[146px] md:top-[154px]';
    const PROD_URL = 'https://mus-node-production.up.railway.app';

    // --- HELPERS ---
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const img = e.currentTarget;
        const currentSrc = img.src;

        // ONLY fallback if we are on localhost and the image failed on localhost
        if (window.location.hostname === 'localhost' && currentSrc.includes('localhost')) {
            console.log('[ReportDisplay] Local image failed, trying Railway fallback...');
            img.src = currentSrc.replace(/http:\/\/localhost:\d+/, PROD_URL);
        } else {
            console.error('[ReportDisplay] Image Load Failed:', currentSrc);
        }
    };

    const [activeTab, setActiveTab] = useState<'UX' | 'Product' | 'Visual' | 'Strategy' | 'Accessibility'>('UX');

    // --- Helper Components (Brutalism Styled) ---

    const StrengthCard = ({ title, description }: { title: string, description: string, impact: string }) => (
        <div className="bg-white p-5 border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-x-px hover:-translate-y-px transition-all duration-200 group">
            <div className="flex items-start gap-4 mb-3">
                <div className="p-2 bg-emerald-100 text-black border-2 border-black">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-black leading-tight text-lg">{title}</h4>
                </div>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed font-bold border-t-2 border-black/10 pt-3 mt-1">
                {description}
            </p>
        </div>
    );

    const CompetitorCard = ({ title, description, impact }: { title: string, description: string, impact: string }) => (
        <div className="bg-white p-5 border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-x-px hover:-translate-y-px transition-all duration-200 group">
            <div className="flex items-start gap-4 mb-3">
                <div className="p-2 bg-blue-100 text-black border-2 border-black">
                    <Target className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-black leading-tight text-lg">{title}</h4>
                </div>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed font-bold border-t-2 border-black/10 pt-3 mt-1">
                {description}
            </p>
        </div>
    );

    const OpportunityCard = ({ title, actionPlan, index }: { title: string, actionPlan: string, index: number }) => (
        <div className="bg-page-bg p-6 border-2 border-black shadow-neo hover:shadow-neo-hover hover:-translate-x-px hover:-translate-y-px transition-all duration-200 group relative">
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                    <span className="flex items-center justify-center w-8 h-8 bg-brand text-white border-2 border-black font-bold text-sm">
                        {index + 1}
                    </span>
                    <h4 className="font-black text-black text-lg">{title}</h4>
                </div>

                <div className="pl-12">
                    <p className="text-slate-800 text-sm leading-relaxed font-medium">
                        {actionPlan}
                    </p>
                </div>
            </div>
        </div>
    );

    // --- Tab Navigation ---
    const TABS = [
        { id: 'UX', label: 'UX Face-off', icon: PenTool },
        { id: 'Product', label: 'Product Face-off', icon: Box },
        { id: 'Visual', label: 'Visual Face-off', icon: Palette },
        { id: 'Strategy', label: 'Strategy Face-off', icon: BrainCircuit },
        { id: 'Accessibility', label: 'Accessibility Face-off', icon: Accessibility },
    ];

    // --- Comparison Table ---
    const ComparisonTable = ({ items, title }: { items: CompetitorComparisonItem[], title: string }) => {
        if (!items || items.length === 0) return (
            <div className="p-12 text-center bg-white border-2 border-dashed border-black">
                <p className="text-black font-bold">No comparison data available for this section.</p>
            </div>
        );

        return (
            <div className="bg-white border-2 border-black shadow-neo overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-brand/10 border-b-2 border-black text-xs font-black text-black uppercase tracking-wider">
                                <th className="p-5 w-1/4">Parameter</th>
                                <th className="p-5 w-24 text-center">
                                    <div className="flex items-center justify-center">
                                        <SiteLogo domain={primaryUrl} size="tiny" className="shadow-neo-sm" />
                                    </div>
                                </th>
                                <th className="p-5 w-24 text-center">
                                    <div className="flex items-center justify-center">
                                        <SiteLogo domain={competitorUrl} size="tiny" className="shadow-neo-sm" />
                                    </div>
                                </th>
                                <th className="p-5 min-w-[300px]">Observations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-black">
                            {items.map((item, idx) => (
                                <tr key={idx} className="hover:bg-yellow-50 transition-colors group">
                                    <td className="p-5 font-bold text-black text-sm">
                                        {item.Parameter.replace(/([A-Z])/g, ' $1').trim()}
                                    </td>

                                    {/* Primary Score */}
                                    <td className="p-5 text-center">
                                        <div className={`mx-auto w-10 h-10 flex items-center justify-center font-bold text-sm border-2 border-black ${Number(item.PrimaryScore) >= Number(item.CompetitorScore)
                                            ? 'bg-amber-100 text-black shadow-neo'
                                            : 'bg-white text-slate-500'
                                            }`}>
                                            {item.PrimaryScore}
                                        </div>
                                    </td>

                                    {/* Competitor Score */}
                                    <td className="p-5 text-center">
                                        <div className={`mx-auto w-10 h-10 flex items-center justify-center font-bold text-sm border-2 border-black ${Number(item.CompetitorScore) > Number(item.PrimaryScore)
                                            ? 'bg-blue-100 text-black shadow-neo'
                                            : 'bg-white text-slate-500'
                                            }`}>
                                            {item.CompetitorScore}
                                        </div>
                                    </td>

                                    <td className="p-5 text-sm text-slate-800 leading-relaxed font-bold">
                                        {item.Analysis}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div >
            </div >
        );
    };

    return (
        <div className="font-['DM_Sans'] space-y-12 pb-12">

            {/* 1. TOP SECTION: HEAD-TO-HEAD PREVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-2 border-black shadow-neo bg-white relative mr-2">

                {/* VS Badge (Absolute Center) */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                    <div className="w-14 h-14 bg-accent-yellow rounded-full border-4 border-black flex items-center justify-center shadow-neo">
                        <span className="text-black font-black italic text-xl">VS</span>
                    </div>
                </div>

                {/* Left: YOU */}
                <div className="bg-white p-6 md:p-8 flex flex-col gap-4 border-b-2 md:border-b-0 md:border-r-2 border-black">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="border-2 border-black shadow-neo overflow-hidden">
                            <SiteLogo domain={primaryUrl} size="small" className="shadow-none border-none rounded-none" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-black uppercase tracking-wider bg-amber-200 px-2 py-0.5 w-fit border border-black mb-1">Primary Website</span>
                            <h3 className="text-xl font-bold text-black break-all">{primaryUrl}</h3>
                        </div>
                    </div>
                    {/* Primary Screenshot Area */}
                    <div className="w-full aspect-video bg-white border-2 border-black overflow-hidden relative group shadow-neo">
                        {primaryScreenshot ? (
                            <img src={primaryScreenshot} onError={handleImageError} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" alt="Primary Site" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-[radial-gradient(#00000022_1px,transparent_1px)] bg-size-[16px_16px]">
                                <span className="text-sm font-bold text-black bg-white px-3 py-1 border-2 border-black shadow-neo">No Preview</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: THEM */}
                <div className="bg-page-bg p-6 md:p-8 flex flex-col gap-4">
                    <div className="flex items-center gap-3 mb-2 justify-end">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-black text-black uppercase tracking-wider bg-blue-200 px-2 py-0.5 w-fit border border-black mb-1">Competitor Website</span>
                            <h3 className="text-xl font-bold text-black break-all text-right">{competitorUrl}</h3>
                        </div>
                        <div className="border-2 border-black shadow-neo overflow-hidden">
                            <SiteLogo domain={competitorUrl} size="small" className="shadow-none border-none rounded-none" />
                        </div>
                    </div>
                    {/* Competitor Screenshot Area */}
                    <div className="w-full aspect-video bg-white border-2 border-black overflow-hidden relative group shadow-neo">
                        {competitorScreenshot ? (
                            <img src={competitorScreenshot} onError={handleImageError} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" alt="Competitor Site" />
                        ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center relative overflow-hidden bg-[radial-gradient(#00000022_1px,transparent_1px)] bg-size-[16px_16px]">
                                {/* Simple Brutalist Placeholder */}
                                <div className="flex flex-col items-center gap-2">
                                    <span className="px-4 py-2 bg-white font-black text-black border-2 border-black shadow-neo rotate-[-2deg]">
                                        PREVIEW LOADING...
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. EXECUTIVE SUMMARY (Full Width) */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-8 bg-brand border-2 border-black shadow-neo"></div>
                    <h2 className="text-3xl font-black text-black uppercase tracking-tight">Competitive Landscape</h2>
                </div>
                <div className="prose prose-slate max-w-none border-l-4 border-black pl-6 py-2">
                    <div className="text-slate-900 leading-relaxed text-lg font-bold">
                        {data.ExecutiveSummary}
                    </div>
                </div>
            </div>

            {/* 3. STRATEGIC ANALYSIS GRID */}
            <div className="grid grid-cols-1 gap-12">

                {/* ROW 1: YOUR STRENGTHS */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-emerald-300 border-2 border-black text-black shadow-neo">
                            <Trophy className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-2xl font-black text-black uppercase">Your Wins</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {data.PrimaryStrengths?.map((str, i) => (
                            <StrengthCard key={i} title={str.Strength} description={str.Description} impact={str.Impact} />
                        ))}
                    </div>
                </div>

                {/* ROW 2: COMPETITOR STRENGTHS */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-blue-300 border-2 border-black text-black shadow-neo">
                            <Target className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-2xl font-black text-black uppercase">Their Wins</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {data.CompetitorStrengths?.map((str, i) => (
                            <CompetitorCard key={i} title={str.Strength} description={str.Description} impact={str.Impact} />
                        ))}
                    </div>
                </div>

                {/* ROW 3: OPPORTUNITIES */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-accent-yellow border-2 border-black text-black shadow-neo">
                            <TrendingUp className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-2xl font-black text-black uppercase">Action Plan</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {data.Opportunities?.map((opp, i) => (
                            <OpportunityCard key={i} title={opp.Opportunity} actionPlan={opp.ActionPlan} index={i} />
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. DETAILED COMPARISON TABLE */}
            <div className="pt-12 border-t-4 border-black">
                <div className={`sticky ${stickyTopClass} z-20 bg-page-bg py-4 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b-2 border-black/5 transition-all duration-300`}>
                    <div>
                        <h2 className="text-3xl font-black text-black uppercase mb-1">Detailed Face-off</h2>
                        <p className="text-slate-600 font-bold px-1 inline-block">Direct head-to-head parameter comparison.</p>
                    </div>

                    {/* Filter Navbar */}
                    <div className="flex bg-white p-2 border-2 border-black shadow-neo gap-2 overflow-x-auto no-scrollbar">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2 font-bold transition-all whitespace-nowrap border-2 ${isActive
                                        ? 'bg-brand text-white border-black shadow-neo -translate-y-[2px]'
                                        : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 hover:text-black hover:border-black'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Render Active Table */}
                {activeTab === 'UX' && <ComparisonTable items={data.UXComparison} title="User Experience" />}
                {activeTab === 'Product' && <ComparisonTable items={data.ProductComparison} title="Product Value" />}
                {activeTab === 'Visual' && <ComparisonTable items={data.VisualComparison} title="Visual Design" />}
                {activeTab === 'Strategy' && <ComparisonTable items={data.StrategyComparison} title="Strategy" />}
                {activeTab === 'Accessibility' && <ComparisonTable items={data.AccessibilityComparison} title="Accessibility" />}
            </div>
        </div >
    );
};
