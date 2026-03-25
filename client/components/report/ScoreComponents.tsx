import React from "react";
import { SkeletonLoader } from "../SkeletonLoader";

/** Matches Tailwind `md` — score blocks shrink & tighten spacing on small viewports */
function useMinMd(): boolean {
  const [matches, setMatches] = React.useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 768px)").matches
      : true,
  );
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return matches;
}

/** Raw score is 0–10; values &gt; 10 are treated as 0–100 scaled down for display. */
export function normalizeScoreTo10(raw: number): number {
  if (!Number.isFinite(raw)) return 0;
  const x = raw > 10 ? raw / 10 : raw;
  return Math.min(10, Math.max(0, x));
}

export function formatScoreOutOf10Display(raw: number): string {
  const n = Math.round(normalizeScoreTo10(raw) * 10) / 10;
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

// --- 🎨 PREMIUM THEME PALETTE ---
// Logic: Custom colors based on score range (Matches your UI design)
export const getThemeStyles = (score: number) => {
  // 9-10: Very Good (Emerald)
  if (score >= 9)
    return {
      solid: "#059669",
      soft: "#ECFDF5",
      pill: "#D1FAE5",
      label: "Very Good",
    };
  // 7-8.9: Satisfactory (Amber) - Custom Soft Yellows
  if (score >= 7)
    return {
      solid: "#D97706",
      soft: "#FFFBEB",
      pill: "#F6E0C4", // Your custom amber
      label: "Satisfactory",
    };
  // 5-6.9: Needs Improvement (Orange) - Custom Soft Orange
  if (score >= 5)
    return {
      solid: "#EA580C",
      soft: "#FFF7ED",
      pill: "#FADCB5", // Your custom orange
      label: "Needs Improvement",
    };
  // 0-4.9: Critical (Red)
  return {
    solid: "#DC2626",
    soft: "#FEF2F2",
    pill: "#FEE2E2",
    label: "Critical",
  };
};

// Helper for other components (Keeping Partner's function signature for compatibility)
export const getScoreIndicatorData = (score: number) => {
  const theme = getThemeStyles(score);
  return {
    text: theme.label,
    textColor: theme.solid,
    bgColor: "#FFFFFF",
    boxColor: theme.soft,
  };
};

// --- GAUGE COMPONENT (SVG Ring) ---
export function ScoreGauge({
  score,
  size = 74,
  strokeWidth = 14,
  isHero = false,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  isHero?: boolean;
}) {
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
      style={{ overflow: "visible" }}
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
          transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
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
    <div className="flex flex-col shrink-0 items-center py-2 px-4 gap-1 border-2 border-black shadow-neo bg-white">
      <div className="relative w-[60px] h-[34px]">
        <div className="absolute top-0 left-0">
          <ScoreGauge score={score} size={60} strokeWidth={8} />
        </div>
        <span className="text-black text-[11px] font-black absolute bottom-[2px] inset-x-0 text-center leading-none">
          {scoreText}
          <span className="text-[9px] text-slate-500 font-bold">/10</span>
        </span>
      </div>
      <span className="text-[9px] font-black tracking-widest uppercase text-black">
        {theme.label}
      </span>
    </div>
  );
}

// --- MAIN CARD COMPONENT (Hero & Mini) ---
export type ScoreCardVariant =
  | "hero"
  | "colored-shadow"
  | "solid-neo"
  | "black-outlined"
  | "thick-border";

export function ScoreDisplayCard({
  score,
  label,
  variant = "hero",
  isHero = false,
  isPdf = false,
}: {
  score?: number;
  label: string;
  variant?: ScoreCardVariant;
  isHero?: boolean;
  isPdf?: boolean;
}) {
  const mdUp = useMinMd();
  /** PDF render should not follow phone breakpoints */
  const compact = !isPdf && !mdUp;

  if (score === undefined)
    return (
      <SkeletonLoader className="h-28 md:h-32 flex-1 border-2 border-black" />
    );

  const theme = getThemeStyles(score);

  // --- SIZING LOGIC (compact on < md) ---
  const gaugeSize = isHero ? (compact ? 172 : 220) : compact ? 88 : 110;
  const gaugeStroke = isHero ? (compact ? 17 : 22) : compact ? 11 : 14;
  const fontSize = isHero
    ? compact
      ? "text-[44px]"
      : "text-[64px]"
    : compact
      ? "text-[21px]"
      : "text-[28px]";
  const labelSize = isHero
    ? compact
      ? "text-sm leading-tight"
      : "text-lg"
    : compact
      ? "text-[11px] leading-tight"
      : "text-sm";
  const badgeSize = isHero
    ? compact
      ? "text-xs px-4 py-1.5 tracking-wide"
      : "text-sm px-6 py-2"
    : compact
      ? "text-[9px] px-2.5 py-0.5 tracking-wide"
      : "text-[10px] px-3 py-1";

  // Container: hero vs row cards (row = fixed alignment so rings + tags line up)
  const containerClasses = isHero
    ? `flex flex-col items-center justify-center ${isPdf ? "pt-0 pb-1" : compact ? "py-3" : "py-8"} w-full h-full`
    : `flex flex-1 flex-col items-center justify-center h-full min-h-0 ${compact ? "py-2.5 px-1" : "py-5 px-2"}`;

  // --- Pill: screenshot style — no shadow, no border, tinted bg ---
  let badgeClasses = `font-semibold uppercase tracking-widest ${badgeSize} rounded-md text-center`;
  let badgeStyle: React.CSSProperties = {
    backgroundColor: theme.soft,
    color: theme.solid,
  };

  return (
    <div className={containerClasses}>
      {/* 1. Gauge & Score Number */}
      <div
        className={`flex flex-col items-center relative ${isHero ? (isPdf ? "mb-2" : compact ? "mb-2" : "mb-6") : compact ? "mb-1.5" : "mb-3"}`}
      >
        <div
          style={{
            width: `${gaugeSize}px`,
            height: `${gaugeSize / 2}px`,
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0 }}>
            <ScoreGauge
              score={score}
              size={gaugeSize}
              strokeWidth={gaugeStroke}
              isHero={isHero}
            />
          </div>
          {/* Centered Number */}
          <span
            className={`absolute inset-x-0 text-center font-black leading-none text-black ${fontSize}`}
            style={{
              bottom: isHero
                ? isPdf
                  ? "5px"
                  : compact
                    ? "-5px"
                    : "-8px"
                : compact
                  ? "-2px"
                  : "-4px",
            }}
          >
            {score.toFixed(1)}
          </span>
        </div>
      </div>

      {/* 2. Label — fixed min-height so 1-line vs 2-line doesn't shift the pill */}
      <div
        className={`flex items-center justify-center text-center ${
          isHero
            ? isPdf
              ? "mt-1 mb-2"
              : mdUp
                ? "mt-2 mb-3"
                : "mt-0 mb-1.5"
            : mdUp
              ? "min-h-11 mb-3"
              : "min-h-[2.25rem] mb-1.5"
        }`}
      >
        <span
          className={`font-black uppercase tracking-tight text-black ${labelSize}`}
        >
          {label}
        </span>
      </div>

      {/* 3. Rating Pill — fixed min-height so 1-line vs 2-line tag aligns across cards */}
      <div
        className={`${badgeClasses} ${!isHero ? `${compact ? "min-h-7" : "min-h-9"} flex items-center justify-center` : ""}`}
        style={{
          ...badgeStyle,
          display: isPdf ? "inline-block" : isHero ? "block" : "flex",
          lineHeight: isPdf ? "1" : undefined,
          paddingTop: isPdf ? "8px" : undefined,
        }}
      >
        {isPdf ? (
          <span
            style={{
              position: "relative",
              top: "-7px",
              display: "inline-block",
            }}
          >
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
export function LinearScoreDisplay({
  score,
  label,
  isLarge = false,
}: {
  score?: number;
  label: string;
  isLarge?: boolean;
}) {
  if (score === undefined)
    return (
      <SkeletonLoader
        className={`w-full rounded-none ${isLarge ? "h-16" : "h-10"}`}
      />
    );

  const score10 = normalizeScoreTo10(score);
  const theme = getThemeStyles(score10);

  return (
    <div
      className={`w-full flex flex-col ${isLarge ? "gap-3 mb-6" : "gap-2 mb-4"}`}
    >
      <div className="flex justify-between items-end">
        <span
          className={`font-black uppercase tracking-tight text-slate-900 ${isLarge ? "text-xl" : "text-sm"}`}
        >
          {label}
        </span>
        <span
          className={`font-['DM_Sans'] font-bold tabular-nums text-slate-900 ${isLarge ? "text-2xl" : "text-[20px]"}`}
        >
          {formatScoreOutOf10Display(score10)}/10
        </span>
      </div>

      {/* Progress Bar Container */}
      <div
        className={`w-full bg-slate-100 ${isLarge ? "h-4" : "h-3"} rounded-full overflow-hidden`}
      >
        {/* Fill */}
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${Math.min(100, Math.max(0, score10 * 10))}%`,
            backgroundColor: theme.solid,
          }}
        />
      </div>
    </div>
  );
}
