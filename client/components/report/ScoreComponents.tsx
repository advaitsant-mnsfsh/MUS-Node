import React from 'react';
import { SkeletonLoader } from '../SkeletonLoader';

// --- 🎨 PREMIUM THEME PALETTE ---
// Logic: Custom colors based on score range (Matches your UI design)
export const getThemeStyles = (score: number) => {
    // 9-10: Very Good (Emerald)
    if (score >= 9) return {
        solid: "#059669",
        soft: "#ECFDF5",
        pill: "#D1FAE5",
        label: "Very Good"
    };
    // 7-8.9: Satisfactory (Amber) - Custom Soft Yellows
    if (score >= 7) return {
        solid: "#D97706",
        soft: "#FFFBEB",
        pill: "#F6E0C4",  // Your custom amber
        label: "Satisfactory"
    };
    // 5-6.9: Needs Improvement (Orange) - Custom Soft Orange
    if (score >= 5) return {
        solid: "#EA580C",
        soft: "#FFF7ED",
        pill: "#FADCB5",  // Your custom orange
        label: "Needs Improvement"
    };
    // 0-4.9: Critical (Red)
    return {
        solid: "#DC2626",
        soft: "#FEF2F2",
        pill: "#FEE2E2",
        label: "Critical"
    };
};

// Helper for other components (Keeping Partner's function signature for compatibility)
export const getScoreIndicatorData = (score: number) => {
    const theme = getThemeStyles(score);
    return {
        text: theme.label,
        textColor: theme.solid,
        bgColor: "#FFFFFF",
        boxColor: theme.soft
    };
};

// --- GAUGE COMPONENT (SVG Ring) ---
export function ScoreGauge({ score, size = 74, strokeWidth = 14, isHero = false }: { score: number; size?: number; strokeWidth?: number; isHero?: boolean }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * Math.PI; // Half circle
    const cappedScore = Math.max(0, Math.min(10, score));
    const offset = circumference - (cappedScore / 10) * circumference;

    const theme = getThemeStyles(score);

    return (
        <svg
            width={size}
            height={size / 2 + strokeWidth / 2}
            viewBox={`0 0 ${size} ${size / 2 + strokeWidth / 2}`}
            style={{ overflow: 'visible' }}
        >
            {/* Background Track */}
            <path
                d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
                fill="none"
                stroke="#000000" // Black Track for Brutalist
                strokeOpacity="0.1"
                strokeWidth={strokeWidth}
                strokeLinecap="butt" // Sharp Ends
            />
            {/* Progress Arc */}
            <path
                d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
                fill="none"
                stroke={theme.solid}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="butt" // Sharp Ends
                style={{
                    transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            />
        </svg>
    );
}

// --- INDICATOR COMPONENT (Small) ---
export function ScoreIndicator({ score }: { score: number }) {
    const theme = getThemeStyles(score);
    const scoreText = Math.round(score);

    return (
        <div
            className="flex flex-col shrink-0 items-center py-2 px-4 gap-1 border-2 border-black shadow-neo bg-white"
        >
            <div className="relative w-[60px] h-[34px]">
                <div className="absolute top-0 left-0">
                    <ScoreGauge score={score} size={60} strokeWidth={8} />
                </div>
                <span className="text-black text-[11px] font-black absolute bottom-[2px] inset-x-0 text-center leading-none">
                    {scoreText}<span className="text-[9px] text-slate-500 font-bold">/10</span>
                </span>
            </div>
            <span className="text-[9px] font-black tracking-widest uppercase text-black">
                {theme.label}
            </span>
        </div>
    );
}

// --- MAIN CARD COMPONENT (Hero & Mini) ---
export type ScoreCardVariant = 'hero' | 'colored-shadow' | 'solid-neo' | 'black-outlined' | 'thick-border';

export function ScoreDisplayCard({ score, label, variant = 'hero', isHero = false, isPdf = false }: { score?: number; label: string, variant?: ScoreCardVariant, isHero?: boolean, isPdf?: boolean }) {
    if (score === undefined) return <SkeletonLoader className="h-32 flex-1 border-2 border-black" />;

    const theme = getThemeStyles(score);

    // --- SIZING LOGIC ---
    const gaugeSize = isHero ? 220 : 110;
    const gaugeStroke = isHero ? 22 : 14;
    const fontSize = isHero ? "text-[64px]" : "text-[28px]";
    const labelSize = isHero ? "text-lg" : "text-xs";
    const badgeSize = isHero ? "text-sm px-6 py-2" : "text-[10px] px-3 py-1";

    // Container Style - Brutalist Box
    // Container Style - Brutalist Box
    const containerClasses = isHero
        ? `flex flex-col items-center justify-center ${isPdf ? 'pt-0 pb-1' : 'py-8'} w-full h-full`
        : "flex flex-1 flex-col items-center justify-center py-5 px-2 h-full"; // Removed hover and transition

    // --- VARIANT STYLING LOGIC ---
    // User selected: White Box + Black Border + Colored Shadow (Clean Neo-Brutalist)
    // Refined: Minimal shadow (1px) as per feedback
    let badgeClasses = `font-black uppercase tracking-widest ${badgeSize} rounded-none border-2 border-black bg-white text-black`;
    let badgeStyle: React.CSSProperties = {
        boxShadow: `2px 2px 0 ${theme.solid}` // Reduced to 1px
    };


    return (
        <div className={containerClasses}>

            {/* 1. Gauge & Score Number */}
            <div className={`flex flex-col items-center relative ${isHero ? (isPdf ? 'mb-2' : 'mb-6') : 'mb-3'}`}>
                <div style={{ width: `${gaugeSize}px`, height: `${gaugeSize / 2}px`, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0 }}>
                        <ScoreGauge score={score} size={gaugeSize} strokeWidth={gaugeStroke} isHero={isHero} />
                    </div>
                    {/* Centered Number */}
                    <span
                        className={`absolute inset-x-0 text-center font-black leading-none text-black ${fontSize}`}
                        style={{
                            bottom: isHero ? (isPdf ? '5px' : '-8px') : '-4px',
                        }}
                    >
                        {score.toFixed(1)}
                    </span>
                </div>
            </div>

            {/* 2. Label */}
            <span
                className={`font-black text-center uppercase tracking-tight text-black mb-4 ${labelSize} ${isHero ? (isPdf ? 'mt-1' : 'mt-2') : ''}`}
            >
                {label}
            </span>

            {/* 3. Rating Pill (Variant Based) */}
            <div className={badgeClasses}
                style={{
                    ...badgeStyle,
                    display: isPdf ? 'inline-block' : 'block',
                    lineHeight: isPdf ? '1' : undefined,
                    paddingTop: isPdf ? '8px' : undefined
                }}>
                {isPdf ? (
                    <span style={{ position: 'relative', top: '-7px', display: 'inline-block' }}>
                        {theme.label}
                    </span>
                ) : (
                    theme.label
                )}
            </div>
        </div>
    );
}

// --- LINEAR SCORE COMPONENT (New Redesign) ---
export function LinearScoreDisplay({ score, label, isLarge = false }: { score?: number; label: string; isLarge?: boolean }) {
    if (score === undefined) return <SkeletonLoader className={`w-full rounded-none ${isLarge ? 'h-16' : 'h-10'}`} />;

    // Theme logic - simplistic to match wireframe/clean aesthetic
    const theme = getThemeStyles(score);

    return (
        <div className={`w-full flex flex-col ${isLarge ? 'gap-3 mb-6' : 'gap-2 mb-4'}`}>
            <div className="flex justify-between items-end">
                <span className={`font-black uppercase tracking-tight text-slate-900 ${isLarge ? 'text-xl' : 'text-sm'}`}>
                    {label}
                </span>
                <span className={`font-black ${isLarge ? 'text-2xl' : 'text-xl text-slate-900'}`}>
                    {Math.round(score * 10)}/100
                </span>
            </div>

            {/* Progress Bar Container */}
            <div className={`w-full bg-slate-100 ${isLarge ? 'h-4' : 'h-3'} rounded-full overflow-hidden`}>
                {/* Fill */}
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                        width: `${Math.min(100, Math.max(0, score * 10))}%`,
                        backgroundColor: theme.solid
                    }}
                />
            </div>
        </div>
    );
}