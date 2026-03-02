import React from 'react';
import { Globe, Plus, Image as ImageIcon, Box, Zap, Settings, Accessibility, Palette } from 'lucide-react';

const AboutSteps: React.FC = () => {
    return (
        <section className="relative w-full bg-[#FFFEF9] py-20 px-6 font-['DM_Sans'] overflow-hidden">
            {/* Decorative Right Ring image (between steps 3 and 4) */}
            {/* The exported PNG is exactly 123px wide (the clipped crescent), so we just set natural width against the right edge */}
            <img
                aria-hidden="true"
                src="/About Page/ring-in-score.png"
                className="absolute hidden lg:block z-0 pointer-events-none select-none w-auto h-[36.25rem] right-0 top-[45%] lg:max-w-none"
                alt=""
            />

            {/* Steps Parent Container: flex-col, center, gap-5.25rem, self-stretch */}
            <div className="flex flex-col items-center gap-[5.25rem] self-stretch w-full max-w-[1271px] mx-auto">
                <h2 className="text-[#1A1A1A] text-center text-3xl md:text-[40px] font-bold tracking-tight">
                    From URL to UX roadmap in 4 steps
                </h2>

                {/* Steps Container Parent: flex-col, h-81.75rem, gap-7.25rem */}
                <div className="relative flex flex-col items-start gap-[7.25rem] w-full min-h-[81.75rem]">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-1/2 -ml-[0.5px] top-4 bottom-10 w-[1px] border-l border-dashed border-[#1A1A1A]/30 z-0"></div>

                    {/* --- STEP 1: Input & Contextualization --- */}
                    <div className="flex flex-col md:flex-row justify-center items-start w-full gap-[2rem] md:gap-[8.8125rem] relative z-10 flex-1">
                        {/* Left: Input Card Mockup */}
                        <div className="flex flex-col items-end gap-[0.625rem] w-full md:w-[37rem] pt-[1.375rem] shrink-0">
                            <div className="w-full max-w-[500px] bg-white border border-black rounded-sm shadow-[4px_4px_0px_#000] p-6 flex flex-col gap-4">
                                <div className="flex items-center gap-2 border border-black/20 rounded p-3 w-full">
                                    <span className="text-sm text-gray-400 font-medium">www.yourwebsite.com</span>
                                    <div className="ml-auto flex items-center gap-3">
                                        <ImageIcon className="w-5 h-5 text-black/60" />
                                        <div className="w-6 h-6 border border-black/20 rounded flex items-center justify-center">
                                            <Plus className="w-4 h-4 text-black/60" />
                                        </div>
                                    </div>
                                </div>
                                <button className="self-end px-4 py-2 bg-[#FBD24E] border border-black rounded-sm text-xs font-bold text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all">
                                    Start Assessment
                                </button>
                            </div>
                        </div>

                        {/* Center: Step Number */}
                        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 pt-[1.375rem]">
                            <div className="w-10 h-10 bg-[#FBD24E] border border-black flex items-center justify-center font-bold shadow-[2px_2px_0px_#000] z-20">
                                1
                            </div>
                        </div>

                        {/* Right: Text Content */}
                        <div className="flex flex-col items-start gap-[0.25rem] w-full md:w-[33.625rem] shrink-0 pt-[1.375rem]">
                            <h3 className="text-[#1A1A1A] text-2xl md:text-[1.5rem] font-bold leading-normal m-0">
                                Input & Contextualization
                            </h3>
                            <p className="text-[#1A1A1A] text-base md:text-[1rem] font-normal leading-normal opacity-70 m-0">
                                Your URL or screenshots give context, which drives the audit
                            </p>
                        </div>
                    </div>

                    {/* --- STEP 2: The 5-Aspect Deep Dive --- */}
                    <div className="flex flex-col md:flex-row justify-center items-start w-full gap-[2rem] md:gap-[8.8125rem] relative z-10 flex-1">
                        {/* Left: Text Content (Right Aligned) */}
                        <div className="flex flex-col items-end gap-[0.5rem] w-full md:w-[37rem] shrink-0 text-right">
                            <h3 className="text-[#1A1A1A] text-2xl md:text-[1.5rem] font-bold leading-normal m-0 w-full text-right">
                                The 5-Aspect Deep Dive
                            </h3>
                            <p className="text-[#1A1A1A] text-base md:text-[1rem] font-normal leading-normal opacity-70 m-0 w-full text-right">
                                Your score is calculated from 110+ individual usability metrics
                            </p>
                        </div>

                        {/* Center: Step Number */}
                        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
                            <div className="w-10 h-10 bg-[#FBD24E] border border-black flex items-center justify-center font-bold shadow-[2px_2px_0px_#000] z-20">
                                2
                            </div>
                        </div>

                        {/* Right: Aspect Cards Grid */}
                        {/* Right: Aspect Cards Grid */}
                        <div className="flex flex-col justify-center items-center w-full md:w-[33.625rem] shrink-0 relative">
                            {/* Top 2 Boxes */}
                            <div className="flex gap-4 mb-4">
                                <AspectCard icon={<Box className="w-8 h-8" />} label="Product Fit" />
                                <AspectCard icon={<Zap className="w-8 h-8" />} label="Performance" />
                            </div>
                            {/* Bottom 3 Boxes */}
                            <div className="flex gap-4">
                                <AspectCard icon={<Settings className="w-8 h-8" />} label="UX Heuristics" />
                                <AspectCard icon={<Accessibility className="w-8 h-8" />} label="Accessibility" />
                                <AspectCard icon={<Palette className="w-8 h-8" />} label="Visual Design" />
                            </div>
                        </div>
                    </div>

                    {/* --- STEP 3: Synthesis & Scoring --- */}
                    <div className="flex flex-col md:flex-row justify-center items-start w-full gap-[2rem] md:gap-[8.8125rem] relative z-10 flex-1">
                        {/* Left: Meters */}
                        {/* Parent: flex, col, center, w-37rem, gap-2.5rem */}
                        <div className="flex flex-col items-center gap-[2.5rem] w-full md:w-[37rem] shrink-0 pt-4">
                            {/* Top meter: w-13.9375rem, h-7rem */}
                            <div className="w-[13.9375rem] h-[7rem] relative">
                                <ScoreArc score={7.8} max={10} color="#E67E22" />
                                <div className="absolute bottom-0 left-0 w-full flex flex-col items-center pb-1">
                                    <span className="text-[#1A1A1A] font-bold text-[2rem] leading-none mb-1 font-['DM_Sans']">7.8</span>
                                    <span className="text-[#1A1A1A] font-bold text-[0.7rem] uppercase tracking-widest font-['DM_Sans']">Overall Score</span>
                                </div>
                            </div>
                            {/* Bottom 3 meters parent: flex, center, gap-2rem, self-stretch */}
                            <div className="flex flex-wrap justify-center items-center gap-[2rem] self-stretch">
                                {/* UX Audit */}
                                <div className="w-[11rem] h-[5.5rem] relative">
                                    <ScoreArc score={5} max={10} color="#E67E22" />
                                    <div className="absolute bottom-0 left-0 w-full flex flex-col items-center pb-1">
                                        <span className="text-[#1A1A1A] font-bold text-[1.5rem] leading-none mb-1 font-['DM_Sans']">5</span>
                                        <span className="text-[#1A1A1A] font-bold text-[0.6rem] uppercase tracking-widest font-['DM_Sans']">UX Audit</span>
                                    </div>
                                </div>
                                {/* Visual Design */}
                                <div className="w-[11rem] h-[5.5rem] relative">
                                    <ScoreArc score={9.2} max={10} color="#00B050" />
                                    <div className="absolute bottom-0 left-0 w-full flex flex-col items-center pb-1">
                                        <span className="text-[#1A1A1A] font-bold text-[1.5rem] leading-none mb-1 font-['DM_Sans']">9.2</span>
                                        <span className="text-[#1A1A1A] font-bold text-[0.6rem] uppercase tracking-widest font-['DM_Sans']">Visual Design</span>
                                    </div>
                                </div>
                                {/* Accessibility */}
                                <div className="w-[11rem] h-[5.5rem] relative">
                                    <ScoreArc score={3.5} max={10} color="#FF0000" />
                                    <div className="absolute bottom-0 left-0 w-full flex flex-col items-center pb-1">
                                        <span className="text-[#1A1A1A] font-bold text-[1.5rem] leading-none mb-1 font-['DM_Sans']">3.5</span>
                                        <span className="text-[#1A1A1A] font-bold text-[0.6rem] uppercase tracking-widest font-['DM_Sans']">Accessibility</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Center: Step Number */}
                        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 pt-4">
                            <div className="w-10 h-10 bg-[#FBD24E] border border-black flex items-center justify-center font-bold shadow-[2px_2px_0px_#000] z-20">
                                3
                            </div>
                        </div>

                        {/* Right: Text Content */}
                        {/* Parent: flex, w-33.625rem, col, start, gap-0.5rem */}
                        <div className="flex flex-col items-start gap-[0.5rem] w-full md:w-[33.625rem] shrink-0 pt-4">
                            <h3 className="text-[#1A1A1A] text-2xl md:text-[1.5rem] font-bold leading-normal m-0">
                                Synthesis & Scoring
                            </h3>
                            <p className="text-[#1A1A1A] text-base md:text-[1rem] font-normal leading-normal opacity-70 m-0">
                                Findings from your website are distilled into a performance metric
                            </p>
                        </div>
                    </div>

                    {/* --- STEP 4: Actionable Reporting --- */}
                    <div className="flex flex-col md:flex-row justify-center items-start w-full gap-[2rem] md:gap-[8.8125rem] relative z-10 flex-1">
                        {/* Left: Text Content (Right Aligned) */}
                        <div className="flex flex-col items-end gap-[0.5rem] w-full md:w-[37rem] shrink-0 text-right pt-[1.5rem]">
                            <h3 className="text-[#1A1A1A] text-2xl md:text-[1.5rem] font-bold leading-normal m-0 w-full text-right">
                                Actionable Reporting
                            </h3>
                            <p className="text-[#1A1A1A] text-base md:text-[1rem] font-normal leading-normal opacity-70 m-0 w-full text-right">
                                Your direct roadmap for resolving every single flagged parameter
                            </p>
                        </div>

                        {/* Center: Step Number */}
                        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 pt-[1.5rem]">
                            <div className="w-10 h-10 bg-[#FBD24E] border border-black flex items-center justify-center font-bold shadow-[2px_2px_0px_#000] z-20">
                                4
                            </div>
                        </div>

                        {/* Right: Card Stack */}
                        <div className="flex flex-col items-center w-full md:w-[33.625rem] shrink-0 relative pt-[1.5rem]">
                            {/* Card 1 (Top main card) */}
                            <div className="flex items-start gap-[0.75rem] self-stretch p-[1rem] bg-white border border-black rounded-sm shadow-[4px_4px_0px_#000] relative z-20">
                                <div className="mt-0.5 shrink-0 bg-[#00B050] text-white rounded-full w-5 h-5 flex items-center justify-center">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <div className="flex flex-col items-start gap-[0.25rem] flex-1">
                                    <span className="text-[#1A1A1A] font-bold text-[0.875rem] font-['DM_Sans'] uppercase">
                                        Recommendation
                                    </span>
                                    <span className="text-[#1A1A1A] font-normal text-[0.875rem] font-['DM_Sans'] leading-snug opacity-80">
                                        Add descriptive alt text to all 25 missing images and audit all visuals to ensure screen reader accessibility.
                                    </span>
                                </div>
                            </div>

                            {/* Card 2 (Middle blur, drops at bottom) */}
                            <div className="w-[95%] h-[3rem] bg-gradient-to-b from-white/90 to-gray-50/80 border-b border-l border-r border-black/10 rounded-b-sm shadow-sm relative z-10 -mt-[1rem]"></div>

                            {/* Card 3 (Bottom blur, drops further at bottom) */}
                            <div className="w-[90%] h-[3.5rem] bg-gradient-to-b from-white/70 to-gray-100/50 border-b border-l border-r border-black/5 rounded-b-sm shadow-sm relative z-0 -mt-[2rem] blur-[0.5px]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

interface AspectCardProps {
    icon: React.ReactNode;
    label: string;
}

const AspectCard: React.FC<AspectCardProps> = ({ icon, label }) => (
    <div className="flex flex-col justify-center items-center gap-[0.75rem] w-[8.75rem] h-[7.5rem] bg-white border border-[#FFDC60] rounded-lg p-6 group hover:border-[#FBD24E] transition-colors duration-200">
        <div className="w-8 h-8 shrink-0 text-black group-hover:scale-110 transition-transform duration-200">
            {icon}
        </div>
        <span className="text-[#1A1A1A] text-center font-bold text-[0.8125rem] leading-normal uppercase">
            {label}
        </span>
    </div>
);

// ScoreArc component for drawing the precise SVG meters
const ScoreArc = ({ score, max, color }: { score: number, max: number, color: string }) => {
    const radius = 40;
    const circumference = Math.PI * radius; // for half circle
    const strokeDashoffset = circumference - (circumference * (score / max));

    return (
        <svg viewBox="0 0 100 50" className="w-full h-full overflow-hidden">
            <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="12"
                strokeLinecap="butt"
            />
            <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke={color}
                strokeWidth="12"
                strokeLinecap="butt"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
            />
        </svg>
    );
};

export default AboutSteps;
