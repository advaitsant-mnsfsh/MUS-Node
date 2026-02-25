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
    isSharedView?: boolean;
}

// ... imports
export const StandardReportView: React.FC<StandardReportViewProps> = ({ report, primaryScreenshotSrc, isSharedView }) => {

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
    const isClickScrolling = React.useRef(false);
    const scrollTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    console.log('[StandardReportView] Active Tab:', activeTab);
    console.log('[StandardReportView] UX Data:', ux ? Object.keys(ux) : 'Missing');

    const TABS = [
        { id: 'All Parameters', label: 'All Parameters', icon: LayoutGrid },
        { id: 'UX & Heuristics', label: 'UX & Heuristics', icon: PenTool },
        { id: 'Visual Design', label: 'Visual Design', icon: Palette },
        { id: 'Product Fit', label: 'Product Fit', icon: Box },
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

    // Sticky Top Offset Calculation
    // Normal: 138px (64px Global Nav + 74px Action Bar)
    // Shared: 74px -> Reduced to 66px to ensure overlap/no gap
    const stickyTopClass = isSharedView ? 'top-[58px] md:top-[66px]' : 'top-[130px] md:top-[138px]';

    // --- HELPERS ---
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const img = e.currentTarget;
        const currentSrc = img.src;
        const PROD_URL = 'https://mus-node-production.up.railway.app';

        // ONLY fallback if we are on localhost and the image failed on localhost
        if (window.location.hostname === 'localhost' && currentSrc.includes('localhost')) {
            console.log('[ReportDisplay] Local image failed, trying Railway fallback...');
            img.src = currentSrc.replace(/http:\/\/localhost:\d+/, PROD_URL);
        } else {
            console.error('[ReportDisplay] Image Load Failed:', currentSrc);
        }
    };

    // --- SCROLL SPY LOGIC ---
    // --- SCROLL SPY LOGIC ---
    // 1. Click Handler: Smooth scroll to section
    const handleTabClick = (tabId: string) => {
        isClickScrolling.current = true;
        setActiveTab(tabId);

        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
            isClickScrolling.current = false;
        }, 1000); // Wait for smooth scroll to finish

        // Handle "All Parameters" (Top of the list / Default view)
        if (tabId === 'All Parameters') {
            const container = document.getElementById('report-sections-container');
            if (container) {
                // Scroll specifically to the container top, accounting for sticky header offset
                const offset = 220; // Increased to account for triple sticky headers
                const elementPosition = container.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                    top: elementPosition - offset,
                    behavior: 'smooth'
                });
            }
            return;
        }

        // Handle specific sections
        const sectionId = `section-${tabId.replace(/\s+/g, '-').toLowerCase()}`;
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 260; // Increased to 260px (Global Nav + Action + Filter + buffer)
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: elementPosition - offset,
                behavior: 'smooth'
            });
        }
    };

    // Scroll to top on mount to fix Dashboard navigation retention
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // 2. Scroll Listener: Update active tab based on viewport
    React.useEffect(() => {
        const handleScroll = () => {
            if (isClickScrolling.current) return;

            // Optimization: Don't check on every single pixel, but fairly often is needed for responsiveness
            // Use a higher offset to trigger the change earlier as the user scrolls down
            const scrollPosition = window.scrollY + 300;

            // Define sections to check
            const sections = [
                { id: 'UX & Heuristics', elementId: 'section-ux-&-heuristics' },
                { id: 'Visual Design', elementId: 'section-visual-design' },
                { id: 'Product Fit', elementId: 'section-product-fit' },
                { id: 'Accessibility Audit', elementId: 'section-accessibility-audit' }
            ];

            // Default to 'All Parameters' (Top)
            let currentSection = 'All Parameters';

            // Find the last section that we have scrolled past
            for (const section of sections) {
                const element = document.getElementById(section.elementId);
                if (element) {
                    const { offsetTop } = element;
                    // If we have scrolled past the top of this section (minus some buffer), it is the candidate
                    if (scrollPosition >= offsetTop) {
                        currentSection = section.id;
                    }
                }
            }

            // Special check: If we are not yet past the first real section, ensure we are on 'All Parameters'
            const firstSection = document.getElementById(sections[0].elementId);
            if (firstSection && scrollPosition < firstSection.offsetTop) {
                currentSection = 'All Parameters';
            }

            // Special check: If we are at the very bottom, and the last section is visible, activate it
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
                if (accessibility) currentSection = 'Accessibility Audit';
            }

            setActiveTab(currentSection);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [ux, visual, product, accessibility]);


    return (
        <>
            <div className="font-['DM_Sans'] bg-page-bg">

                {/* 1. TOP SECTION: Executive Summary & Preview (Card Style) */}
                <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 mb-12 mx-4 md:mx-8">
                    <div className="flex flex-col lg:flex-row border-x-2 border-b-2 border-black shadow-neo bg-white">

                        {/* LEFT COLUMN: Scores & Text (50%) */}
                        <div className="w-full lg:w-1/2 p-6 md:p-8 border-r-2 border-black flex flex-col gap-8">

                            {/* Scores Section */}
                            <div className="w-full flex justify-between border-b-2 pb-6 border-black">
                                {/* Overall Score (Large Hero Gauge) */}
                                <div className="mb-0 flex justify-center">
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
                            <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end pointer-events-none">
                                <span className="text-[10px] font-black text-black uppercase tracking-wider bg-white px-2 py-1 border-2 border-black mb-1">
                                    Analyzed Website
                                </span>
                            </div>

                            {/* Full Bleed Image - Absolute on Desktop to match height of left col */}
                            <div className="absolute inset-0 w-full h-full">
                                {primaryScreenshotSrc ? (
                                    <img
                                        src={primaryScreenshotSrc}
                                        className="w-full h-auto min-h-full object-cover object-left-top transition-transform duration-700 hover:scale-105"
                                        alt="Analyzed Page Preview"
                                        onError={handleImageError}
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

                    {/* Header & Tabs - Sticky */}
                    <div className={`sticky ${stickyTopClass} z-20 bg-white border-2 border-black py-4 shadow-sm px-6 lg:px-8 mb-12 mx-4 md:mx-8 transition-all duration-300`}>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-2xl font-black text-black uppercase">Score Breakdown</h3>
                                {/* <p className="text-slate-600 font-bold text-sm">Detailed parameter analysis.</p> */}
                            </div>

                            <nav className="flex space-x-2 bg-white overflow-x-auto no-scrollbar max-w-full p-1">
                                {TABS.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => handleTabClick(tab.id)}
                                            className={`flex items-center gap-2 whitespace-nowrap py-2.5 px-5 font-bold text-sm transition-all border-2 ${isActive
                                                ? 'bg-accent-yellow  text-black border-black shadow-neo -translate-y-[2px]'
                                                : 'bg-transparent text-slate-500 border-slate-100 hover:bg-slate-100 hover:text-black hover:border-black'
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-slate-500'}`} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* All Content Stacked (Scroll Spy Container) */}
                    <div id="report-sections-container" className="flex flex-col gap-16 animate-in nav-fade-in duration-300 pb-20 mx-4 md:mx-8">

                        {/* Section 1: UX & Heuristics */}
                        <div id="section-ux-&-heuristics" className="scroll-mt-40">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-brand text-white border-2 border-black shadow-neo">
                                    <PenTool className="w-5 h-5" />
                                </div>
                                <h3 className="text-2xl font-black text-black uppercase">UX & Heuristics</h3>
                            </div>
                            <DetailedAuditView auditData={ux} auditType={'UX Audit'} />
                        </div>

                        {/* Section 2: Visual Design */}
                        <div id="section-visual-design" className="scroll-mt-40">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-500 text-white border-2 border-black shadow-neo">
                                    <Palette className="w-5 h-5" />
                                </div>
                                <h3 className="text-2xl font-black text-black uppercase">Visual Design</h3>
                            </div>
                            <DetailedAuditView auditData={visual} auditType={'Visual Design'} />
                        </div>

                        {/* Section 3: Product Fit */}
                        <div id="section-product-fit" className="scroll-mt-40">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-amber-500 text-white">
                                    <Box className="w-5 h-5" />
                                </div>
                                <h3 className="text-2xl font-black text-black uppercase">Product Fit</h3>
                            </div>
                            <DetailedAuditView auditData={product} auditType={'Product Audit'} />
                        </div>

                        {/* Section 4: Accessibility */}
                        <div id="section-accessibility-audit" className="scroll-mt-40">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-500 text-white border-2 border-black shadow-neo">
                                    <Accessibility className="w-5 h-5" />
                                </div>
                                <h3 className="text-2xl font-black text-black uppercase">Accessibility</h3>
                            </div>
                            <AccessibilityAuditView data={accessibility} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
