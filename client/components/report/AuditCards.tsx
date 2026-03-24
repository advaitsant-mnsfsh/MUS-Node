import React, { useState } from "react";
import { CriticalIssue, ScoredParameter } from "../../types";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Target,
  Lightbulb,
  Quote,
} from "lucide-react";
import {
  formatScoreOutOf10Display,
  normalizeScoreTo10,
} from "./ScoreComponents";

// --- TYPOGRAPHY CONSTANTS ---
const LABEL_STYLE =
  "text-sm font-black text-black uppercase tracking-wider mb-2 flex items-center gap-2";
/** Small icon frame next to OVERVIEW / Observation / etc. — 1px light border, no neo shadow. */
const LABEL_ICON_WRAP =
  "inline-flex shrink-0 items-center justify-center rounded-md border border-slate-200 p-1 text-slate-600 shadow-none";
const BODY_STYLE = "text-sm leading-relaxed text-slate-800 font-medium";

// Helper: Format ParameterName (camelCase -> Spaced Title)
const formatTitle = (text: string) => {
  if (!text) return "";
  return text.replace(/([A-Z])/g, " $1").trim();
};

// --- CORE EDITORIAL CARD (The Unified UI) ---
const EditorialCard = ({
  title,
  analysis,
  score,
  confidence,
  findings,
  recommendation,
  citations,
  isPdf = false,
  auditType,
}: {
  title: string;
  analysis: string;
  score: number;
  confidence: string;
  findings?: string;
  recommendation?: string;
  citations?: string[];
  isPdf?: boolean;
  auditType?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false); // Default to collapsed as requested "collaps and close"

  const getConfidenceBadgeStyle = (conf: string) => {
    const c = conf.toLowerCase();
    if (c === "high") return "text-[#1E8A42]";
    if (c === "medium") return "text-amber-700";
    return "text-red-700";
  };

  // Banding on 0–10 scale (same cut points as former ×10 → /100: 8+, 5+, else)
  const getScoreStyle = (score: number, confidence?: string) => {
    if (score === 0 || confidence?.toLowerCase() === "low") {
      return {
        bg: "bg-[#F1F5F9]",
        shadow: "shadow-[2px_2px_0px_0px_#CBD5E1]",
      };
    }
    const s = normalizeScoreTo10(score);
    if (s >= 8) {
      return {
        bg: "bg-[#DAF6D5]",
        shadow: "shadow-[2px_2px_0px_0px_#9ae68d]",
      };
    }
    if (s >= 5) {
      return {
        bg: "bg-[#F6E8D5]",
        shadow: "shadow-[2px_2px_0px_0px_#e8c696]",
      };
    }
    return {
      bg: "bg-[#F1D0D0]",
      shadow: "shadow-[2px_2px_0px_0px_#e8a4a4]",
    };
  };

  const isNA = score === 0 || confidence?.toLowerCase() === "low";

  return (
    <div
      className={`flex flex-col bg-white border border-slate-300 rounded-xl overflow-hidden duration-200`}
    >
      {/* --- HEADER (Always Visible) --- */}
      <div
        className={`flex flex-col items-start gap-3 p-4 sm:gap-4 sm:p-6 md:flex-row md:items-center md:justify-between cursor-pointer transition-colors select-none ${isOpen ? "bg-white" : "hover:bg-yellow-50"}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Left: Title */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <h3 className="text-[18px] sm:text-[20px] font-black text-black leading-tight md:pr-4">
            {title}
          </h3>
        </div>

        {/* Right: Confidence, Score & Toggle */}
        <div className="flex w-full items-center justify-between gap-3 shrink-0 md:w-auto md:justify-end">
          {/* Score Pill (Colored Background Based on Score) */}
          <div
            className={`flex items-center justify-center px-3.5 py-1.5 min-w-[4.5rem] rounded-full ${isNA ? "text-slate-500" : "text-black"} ${getScoreStyle(score, confidence).bg}`}
          >
            <span className="font-['DM_Sans'] text-[20px] font-bold tabular-nums leading-none">
              {isNA ? (
                "N/A"
              ) : (
                <>
                  {formatScoreOutOf10Display(score)}
                  /10
                </>
              )}
            </span>
          </div>

          {/* Toggle Icon */}
          <div className="ml-1 text-black p-1">
            {isOpen ? (
              <ChevronUp className="w-5 h-5" strokeWidth={3} />
            ) : (
              <ChevronDown className="w-5 h-5" strokeWidth={3} />
            )}
          </div>
        </div>
      </div>

      {/* --- COLLAPSIBLE CONTENT --- */}
      {isOpen && (
        <div className="px-4 sm:px-6 pb-6 pt-6 flex flex-col gap-6 animate-in slide-in-from-top-2 duration-200 relative">
          {/* Confidence Pill - Absolute Bottom Right (Saved space) */}
          {confidence && (
            <div className="static sm:absolute sm:bottom-6 sm:right-6 pointer-events-none order-last sm:order-none self-start sm:self-auto mt-1 sm:mt-0">
              <span
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase whitespace-nowrap ${getConfidenceBadgeStyle(confidence)}`}
              >
                {confidence} CONFIDENCE
              </span>
            </div>
          )}

          {/* Overview */}
          <div className="relative max-w-3xl">
            <div className={LABEL_STYLE}>
              <div className={LABEL_ICON_WRAP}>
                <FileText className="w-4 h-4" />
              </div>
              Overview
            </div>
            <p className={BODY_STYLE}>{analysis}</p>
          </div>

          {/* Observation & Recommendation Grid (full-bleed strip, prior layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 -mx-6 border-y border-slate-200">
            {/* Observation */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-slate-200 bg-[#FFF9E6]">
              <div className={LABEL_STYLE}>
                <div className={LABEL_ICON_WRAP}>
                  <Target className="w-4 h-4" />
                </div>
                Observation
              </div>
              <p className={BODY_STYLE}>
                {findings || "No specific observation recorded."}
              </p>
            </div>

            {/* Recommendation */}
            <div className="p-6 bg-[#FFF9E6]">
              <div className={LABEL_STYLE}>
                <div className={LABEL_ICON_WRAP}>
                  <Lightbulb className="w-4 h-4" />
                </div>
                Recommendation
              </div>
              <p className={BODY_STYLE}>
                {recommendation || "No specific recommendation provided."}
              </p>
            </div>
          </div>

          {/* Citations */}
          {citations && citations.length > 0 && (
            <div>
              <div className={LABEL_STYLE}>
                <div className={LABEL_ICON_WRAP}>
                  <Quote className="w-4 h-4" />
                </div>
                Citation
              </div>
              <ul className="space-y-2 mt-2">
                {citations.map((cite, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-slate-600 italic group"
                  >
                    <span className="not-italic font-medium text-black bg-white w-5 h-5 flex items-center justify-center text-xs select-none">
                      {i + 1}
                    </span>
                    "{cite}"
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- EXPORT WRAPPERS ---

export const CriticalIssueCard: React.FC<{
  issue: CriticalIssue & { source?: string };
  isPdf?: boolean;
}> = ({ issue, isPdf }) => {
  return (
    <EditorialCard
      title={issue.Issue}
      analysis={issue.Analysis}
      score={issue.Score}
      confidence={issue.Confidence || "High"}
      findings={issue.KeyFinding}
      recommendation={issue.Recommendation}
      citations={issue.Citations}
      isPdf={isPdf}
      auditType="Critical Issue"
    />
  );
};

export const ScoredParameterCard: React.FC<{
  param: ScoredParameter;
  isPdf?: boolean;
  auditType?: string;
}> = ({ param, isPdf, auditType }) => {
  // Note: Scores of 0 or Low Confidence indicate "Not Assessed/Unverifiable" by AI and are explicitly un-hidden to show transparency.

  return (
    <EditorialCard
      title={formatTitle(param.ParameterName || "Parameter")}
      analysis={param.Analysis}
      score={param.Score}
      confidence={param.Confidence || "Low"}
      findings={param.KeyFinding}
      recommendation={param.Recommendation}
      citations={param.Citations}
      isPdf={isPdf}
      auditType={auditType}
    />
  );
};

export const AuditSubSectionHeader: React.FC<any> = () => null;
