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
const LABEL_STYLE = "text-xs font-black text-black uppercase tracking-wider mb-2 flex items-center gap-2";
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

    // Normalize confidence for color badge
    const getConfidenceColor = (conf: string) => {
        const c = conf.toLowerCase();
        if (c === 'high') return 'bg-emerald-100 text-black border-black';
        if (c === 'medium') return 'bg-amber-100 text-black border-black';
        return 'bg-red-100 text-black border-black';
    };

    // Calculate score for display (0-100)
    const displayScore = Math.round(score * 10);

    return (
        <div className={`flex flex-col bg-white border-2 border-black overflow-hidden shadow-neo transition-all hover:shadow-neo-hover hover:translate-y-px hover:translate-x-px duration-200 ${isOpen ? 'ring-0' : ''}`}>

            {/* --- HEADER (Always Visible) --- */}
            <div
                className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 cursor-pointer hover:bg-yellow-50 transition-colors gap-4 select-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* Left: Title & Confidence */}
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <span className={`inline-block w-fit text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${getConfidenceColor(confidence)} shadow-neo-hover`}>
                        {confidence} Confidence
                    </span>
                    <h3 className="text-lg font-black text-black leading-tight pr-4">
                        {title}
                    </h3>
                </div>

                {/* Right: Pills & Toggle */}
                <div className="flex items-center gap-3 shrink-0">
                    {/* Audit Type Pill */}
                    {auditType && (
                        <div className="hidden sm:flex items-center justify-center px-3 py-1.5 bg-white border-2 border-black shadow-neo-hover">
                            <span className="text-xs font-bold text-black whitespace-nowrap uppercase tracking-wide">
                                {auditType}
                            </span>
                        </div>
                    )}

                    {/* Score Pill */}
                    <div className="flex items-center justify-center px-3 py-1.5 bg-black text-white min-w-[70px] border-2 border-black shadow-[2px_2px_0px_0px_#fbbf24]">
                        <span className="text-sm font-bold">
                            {displayScore}<span className="text-gray-400 text-[10px] ml-0.5">/100</span>
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
                <div className="px-6 pb-6 pt-0 flex flex-col gap-6 animate-in slide-in-from-top-2 duration-200 border-t-2 border-black">

                    {/* Divider (Spacer) */}
                    <div className="h-0 w-full mt-6"></div>

                    {/* Overview */}
                    <div>
                        <div className={LABEL_STYLE}>
                            <div className="p-1 bg-black text-white">
                                <FileText className="w-3 h-3" />
                            </div>
                            Overview
                        </div>
                        <p className={BODY_STYLE}>
                            {analysis}
                        </p>
                    </div>

                    {/* Observation & Recommendation Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 bg-page-bg border-2 border-black overflow-hidden shadow-neo-sm">

                        {/* Observation */}
                        <div className="p-5 border-b-2 md:border-b-0 md:border-r-2 border-black">
                            <div className={LABEL_STYLE}>
                                <div className="p-1 bg-blue-500 text-white border border-black">
                                    <Target className="w-3 h-3" />
                                </div>
                                Observation
                            </div>
                            <p className={BODY_STYLE}>
                                {findings || "No specific observation recorded."}
                            </p>
                        </div>

                        {/* Recommendation */}
                        <div className="p-5">
                            <div className={LABEL_STYLE}>
                                <div className="p-1 bg-accent-yellow text-black border border-black">
                                    <Lightbulb className="w-3 h-3" />
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
                                <div className="p-1 bg-slate-200 text-slate-600 border border-black">
                                    <Quote className="w-3 h-3" />
                                </div>
                                Citation
                            </div>
                            <ul className="space-y-2 mt-2">
                                {citations.map((cite, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-slate-600 italic group">
                                        <span className="not-italic font-black text-black bg-white border border-black w-5 h-5 flex items-center justify-center text-xs shadow-neo select-none">{i + 1}</span>
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