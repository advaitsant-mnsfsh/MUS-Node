import React, { useState } from 'react';
import { CriticalIssue, ScoredParameter } from '../../types';
import {
    ChevronDown,
    ChevronUp,
    FileText,
    Target,
    Lightbulb,
    Quote
} from 'lucide-react';

// --- TYPOGRAPHY CONSTANTS ---
const LABEL_STYLE = "text-sm font-black text-black uppercase tracking-wider mb-2 flex items-center gap-2";
const BODY_STYLE = "text-sm leading-relaxed text-slate-800 font-medium";

// Helper: Format ParameterName (camelCase -> Spaced Title)
const formatTitle = (text: string) => {
    if (!text) return "";
    return text.replace(/([A-Z])/g, ' $1').trim();
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
    auditType
}: {
    title: string,
    analysis: string,
    score: number,
    confidence: string,
    findings?: string,
    recommendation?: string,
    citations?: string[],
    isPdf?: boolean,
    auditType?: string
}) => {
    const [isOpen, setIsOpen] = useState(false); // Default to collapsed as requested "collaps and close"

    const getConfidenceBadgeStyle = (conf: string) => {
        const c = conf.toLowerCase();
        if (c === 'high') return 'bg-[#EAF3EA] text-[#1E8A42]';
        if (c === 'medium') return 'bg-amber-100 text-amber-700';
        return 'bg-red-100 text-red-700';
    };

    // Get score background and shadow based on score (0-100 scale)
    const getScoreStyle = (score: number) => {
        const displayScore = Math.round(score * 10);
        if (displayScore >= 80) {
            return {
                bg: 'bg-[#DAF6D5]',
                shadow: 'shadow-[2px_2px_0px_0px_#9ae68d]'
            };
        } else if (displayScore >= 50) {
            return {
                bg: 'bg-[#F6E8D5]',
                shadow: 'shadow-[2px_2px_0px_0px_#e8c696]'
            };
        } else {
            return {
                bg: 'bg-[#F1D0D0]',
                shadow: 'shadow-[2px_2px_0px_0px_#e8a4a4]'
            };
        }
    };

    // Calculate score for display (0-100)
    const displayScore = Math.round(score * 10);

    return (
        <div className={`flex flex-col bg-white border-2 border-black overflow-hidden shadow-[0px_0px_0px_0px_#CAD5E0] duration-200 ${isOpen ? 'ring-0' : ''}`}>

            {/* --- HEADER (Always Visible) --- */}
            <div
                className={`flex flex-col md:flex-row items-start md:items-center justify-between p-6 cursor-pointer transition-colors gap-4 select-none ${isOpen ? 'bg-yellow-50' : 'hover:bg-yellow-50'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* Left: Title & Audit Type */}
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                    {/* Top Badges */}
                    <div className="flex items-center gap-3">
                        {auditType && (
                            <span className="bg-[#F1F1F1] text-black px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold tracking-wider uppercase whitespace-nowrap">
                                {auditType}
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-black text-black leading-tight pr-4">
                        {title}
                    </h3>
                </div>


                {/* Right: Confidence, Score & Toggle */}
                <div className="flex items-center gap-3 shrink-0">


                    {/* Score Pill (Colored Background Based on Score) */}
                    <div className={`flex items-center justify-center px-3 py-1.5 text-black min-w-[70px] border-2 border-black ${getScoreStyle(score).bg} ${getScoreStyle(score).shadow}`}>
                        <span className="text-sm font-bold">
                            {displayScore}<span className="text-slate-500 text-[10px] ml-0.5">/100</span>
                        </span>
                    </div>

                    {/* Toggle Icon */}
                    <div className="ml-1 text-black p-1">
                        {isOpen ? <ChevronUp className="w-5 h-5" strokeWidth={3} /> : <ChevronDown className="w-5 h-5" strokeWidth={3} />}
                    </div>
                </div>
            </div>

            {/* --- COLLAPSIBLE CONTENT --- */}
            {isOpen && (
                <div className="px-6 pb-6 pt-6 flex flex-col gap-6 animate-in slide-in-from-top-2 duration-200 border-t-2 border-slate-200 relative">

                    {/* Confidence Pill - Absolute Bottom Right (Saved space) */}
                    {confidence && (
                        <div className="absolute bottom-6 right-6 pointer-events-none">
                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase whitespace-nowrap border border-black/5 shadow-sm ${getConfidenceBadgeStyle(confidence)}`}>
                                {confidence} CONFIDENCE
                            </span>
                        </div>
                    )}

                    {/* Overview */}
                    <div className="relative">
                        <div className={LABEL_STYLE}>
                            <div className="p-1 text-slate-600 ">
                                <FileText className="w-4 h-4" />
                            </div>
                            Overview
                        </div>
                        <p className={BODY_STYLE}>
                            {analysis}
                        </p>
                    </div>

                    {/* Observation & Recommendation Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 -mx-6 border-y border-slate-200">

                        {/* Observation */}
                        <div className="p-6 border-b md:border-b-0 md:border-r border-slate-200 bg-[#F9FAFC]">
                            <div className={LABEL_STYLE}>
                                <div className="p-1 text-slate-600 ">
                                    <Target className="w-4 h-4" />
                                </div>
                                Observation
                            </div>
                            <p className={BODY_STYLE}>
                                {findings || "No specific observation recorded."}
                            </p>
                        </div>

                        {/* Recommendation */}
                        <div className="p-6 bg-[#F9FAFC]">
                            <div className={LABEL_STYLE}>
                                <div className="p-1 text-slate-600 ">
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
                                <div className="p-1 text-slate-600 ">
                                    <Quote className="w-4 h-4" />
                                </div>
                                Citation
                            </div>
                            <ul className="space-y-2 mt-2">
                                {citations.map((cite, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-slate-600 italic group">
                                        <span className="not-italic font-medium text-black bg-white border border-slate-300 w-5 h-5 flex items-center justify-center text-xs shadow-[1px_1px_0px_0px_#CAD5E0] select-none">{i + 1}</span>
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

export const CriticalIssueCard: React.FC<{ issue: CriticalIssue & { source?: string }, isPdf?: boolean }> = ({ issue, isPdf }) => {
    return (
        <EditorialCard
            title={issue.Issue}
            analysis={issue.Analysis}
            score={issue.Score}
            confidence={issue.Confidence || 'High'}
            findings={issue.KeyFinding}
            recommendation={issue.Recommendation}
            citations={issue.Citations}
            isPdf={isPdf}
            auditType="Critical Issue"
        />
    );
};

export const ScoredParameterCard: React.FC<{ param: ScoredParameter, isPdf?: boolean, auditType?: string }> = ({ param, isPdf, auditType }) => {
    if (param.Score === 0) return null;

    return (
        <EditorialCard
            title={formatTitle(param.ParameterName || 'Parameter')}
            analysis={param.Analysis}
            score={param.Score}
            confidence={param.Confidence || 'Low'}
            findings={param.KeyFinding}
            recommendation={param.Recommendation}
            citations={param.Citations}
            isPdf={isPdf}
            auditType={auditType}
        />
    );
};

export const AuditSubSectionHeader: React.FC<any> = () => null;