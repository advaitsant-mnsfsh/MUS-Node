import React, { useState, useEffect } from 'react';
import { StrategyAudit } from '../../types';
import { ASSETS } from './constants';
// ✅ Using Lucide Icons for clean, scalable visuals
import {
    Globe,
    Target,
    Briefcase,
    ChevronDown
} from 'lucide-react';

// --- STYLING CONSTANTS ---
// const SECTION_LABEL = "text-xs font-bold text-slate-900 mb-1"; // Unused
// const BODY_STYLE = "text-sm leading-relaxed text-slate-600 font-medium"; // Unused
// const HEADING_STYLE = "text-lg font-bold text-slate-900 leading-tight"; // Unused

// Helper for Confidence Text (Text Only, No Pill)
const getConfidenceColor = (confidence: string = 'High') => {
    // For Brutalism, we might prefer just black text with a colored background badge
    return '#000000';
};

// --- HELPER: PDF AVATAR (Handles CORS for PDF Generation) ---
const PDFAvatar = ({ url }: { url: string }) => {
    const [imgData, setImgData] = useState<string | null>(null);

    useEffect(() => {
        const toBase64 = (url: string) => {
            return new Promise<string>((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.src = url;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                        resolve(canvas.toDataURL('image/png'));
                    } else reject(new Error("Canvas context is null"));
                };
                img.onerror = (e) => reject(e);
            });
        };

        const convert = async () => {
            try {
                // Cache busting to ensure fresh fetch
                const fetchUrl = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
                const base64 = await toBase64(fetchUrl);
                setImgData(base64);
            } catch (e) {
                console.warn("PDFAvatar conversion failed:", e);
            }
        };

        convert();
    }, [url]);

    if (!imgData) return <div className="w-full h-full bg-slate-200" />;
    return <img src={imgData} alt="avatar" className="w-full h-full object-cover block" />;
};

// --- COMPONENT: USER PERSONAS (Internal Helper) ---
function UserPersonasDisplay({ personas, isPdf = false }: { personas?: StrategyAudit['UserPersonas'], isPdf?: boolean }) {
    const personaAvatars = [ASSETS.personas.one, ASSETS.personas.two, ASSETS.personas.three];
    if (!personas) return null;

    return (
        <div className="mt-6">
            <h4 className="text-base font-black text-black mb-4 px-1 uppercase tracking-wide">User Persona</h4>
            <div className={`grid grid-cols-1 md:grid-cols-2 ${isPdf ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-6`}>
                {personas.map((p, i) => (
                    <div key={i} className="flex flex-col bg-white border-2 border-black p-0 overflow-hidden break-inside-avoid shadow-neo hover:shadow-neo-hover transition-all hover:-translate-x-px hover:-translate-y-px duration-200">
                        {/* Header: Avatar + Info */}
                        <div className="flex flex-row items-center gap-4 p-4 bg-page-bg border-b-2 border-black">
                            <div className="shrink-0 w-12 h-12 border-2 border-black bg-white overflow-hidden shadow-neo-hover">
                                {isPdf ? (
                                    <PDFAvatar url={personaAvatars[i % 3]} />
                                ) : (
                                    <img src={personaAvatars[i % 3]} className="w-full h-full object-cover" alt={p.Name} />
                                )}
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-black truncate text-lg">{p.Name}</span>
                                    <span className="text-[10px] font-bold bg-white border border-black text-black px-1.5 py-0.5 uppercase tracking-wide whitespace-nowrap shadow-neo-hover">
                                        Age {p.Age}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-600 font-bold truncate uppercase tracking-tight" title={p.Occupation}>{p.Occupation}</div>
                                <div className="text-xs text-slate-500 font-medium truncate">{p.Location}</div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col gap-4">
                            <div className="space-y-4">
                                <div>
                                    <div className="text-[10px] bg-emerald-200 border border-black text-black px-2 py-1 inline-block font-bold mb-2 uppercase tracking-wide shadow-neo">Goals & Needs</div>
                                    <p className="text-sm text-slate-800 leading-relaxed font-medium">{p.UserNeedsBehavior}</p>
                                </div>
                                <div>
                                    <div className="text-[10px] bg-red-200 border border-black text-black px-2 py-1 inline-block font-bold mb-2 uppercase tracking-wide shadow-neo">Pain Points</div>
                                    <p className="text-sm text-slate-800 leading-relaxed font-medium">{p.PainPointOpportunity}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- MAIN COMPONENT: STRATEGY AUDIT (Context Capture) ---
export function StrategyAuditDisplay({ audit, isPdf = false, forcePageBreak = false }: { audit: StrategyAudit, isPdf?: boolean, forcePageBreak?: boolean }) {
    const { DomainAnalysis, PurposeAnalysis, TargetAudience, UserPersonas } = audit || {};
    const [isOpen, setIsOpen] = useState(false);

    // Collapsible Logic
    // If it's PDF, always open.
    const isExpanded = isPdf ? true : isOpen;

    return (
        <div className={`w-full bg-white border-2 border-b-0 border-black font-['DM_Sans'] transition-all ${isPdf ? '' : 'shadow-neo hover:shadow-neo-hover'} overflow-hidden`}>

            {/* Header / Toggle */}
            <div
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-yellow-50 transition-colors select-none border-b-2 border-black bg-white"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-black text-black uppercase tracking-tight">Context Capture</h3>
                    <p className="text-slate-600 font-bold text-sm">Understanding your website’s context, goals and target audience.</p>
                </div>
                {!isPdf && (
                    <button className="text-sm font-black text-black flex items-center gap-2 border-2 border-black bg-white px-3 py-1 shadow-neo-hover hover:translate-y-px hover:shadow-none transition-all">
                        {isExpanded ? 'COLLAPSE' : 'EXPAND'}
                        <ChevronDown
                            className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            strokeWidth={3}
                        />
                    </button>
                )}
            </div>

            {/* Collapsible Content Wrapper (Smooth Animation) */}
            <div
                className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
                <div className="overflow-hidden">
                    <div className="bg-white">

                        {/* Row 1: Domain & Purpose (Side-by-Side) */}
                        <div className="p-6 border-b-2 border-black">
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* LEFT: Domain Analysis */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-black text-black uppercase">Domain Analysis</h4>
                                        {DomainAnalysis?.Confidence && (
                                            <span className="bg-emerald-100 border border-black text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wide shadow-neo-hover">
                                                {DomainAnalysis.Confidence} Confidence
                                            </span>
                                        )}
                                    </div>

                                    <ul className="space-y-3">
                                        {DomainAnalysis?.Items?.map((item, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-slate-800 font-medium leading-relaxed group">
                                                <span className="font-black text-black bg-accent-yellow border border-black w-5 h-5 flex items-center justify-center text-xs shadow-neo">{i + 1}</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Vertical Divider (Desktop Only) */}
                                <div className="hidden lg:block w-0.5 bg-black self-stretch"></div>

                                {/* RIGHT: Purpose Analysis */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-black text-black uppercase">Purpose Analysis</h4>
                                        {PurposeAnalysis?.Confidence && (
                                            <span className="bg-emerald-100 border border-black text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wide shadow-neo-hover">
                                                {PurposeAnalysis.Confidence} Confidence
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2 text-black font-black text-sm uppercase">
                                                <div className="p-1 bg-blue-200 border border-black">
                                                    <Target className="w-3 h-3 text-black" />
                                                </div>
                                                Primary Purpose
                                            </div>
                                            <ul className="pl-6 space-y-1.5 border-l-2 border-black ml-2.5">
                                                {PurposeAnalysis?.PrimaryPurpose?.map((p, i) => (
                                                    <li key={i} className="text-sm text-slate-800 font-bold pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-2 before:h-0.5 before:bg-black">{p}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-2 text-black font-black text-sm uppercase">
                                                <div className="p-1 bg-purple-200 border border-black">
                                                    <Globe className="w-3 h-3 text-black" />
                                                </div>
                                                Key Objectives
                                            </div>
                                            <p className="pl-4 text-sm text-slate-800 font-medium leading-relaxed border-l-2 border-black ml-2.5">
                                                {PurposeAnalysis?.KeyObjectives}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Target Audience */}
                        {TargetAudience && (
                            <div className="p-6 border-b-2 border-black bg-page-bg">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-lg font-black text-black uppercase">Target Audience</h4>
                                    {TargetAudience.Confidence && (
                                        <span className="bg-emerald-100 border border-black text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wide shadow-neo-hover">
                                            {TargetAudience.Confidence} Confidence
                                        </span>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-black shadow-neo-hover text-xs font-bold text-black">
                                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Type:</span>
                                        {TargetAudience.WebsiteType}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <div className="flex items-center gap-2 mb-3 text-black font-black text-sm uppercase">
                                            <div className="p-1 bg-pink-200 border border-black">
                                                <Briefcase className="w-3 h-3 text-black" />
                                            </div>
                                            Primary Audience
                                        </div>
                                        <ul className="space-y-1.5 pl-6 border-l-2 border-black ml-2.5">
                                            {TargetAudience.Primary.map((p, i) => (
                                                <li key={i} className="text-sm text-slate-800 font-bold pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-2 before:h-0.5 before:bg-black">{p}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-3 text-black font-black text-sm uppercase">
                                            <div className="p-1 bg-orange-200 border border-black">
                                                <Globe className="w-3 h-3 text-black" />
                                            </div>
                                            Demographics
                                        </div>
                                        <p className="text-sm text-slate-800 font-medium leading-relaxed pl-4 border-l-2 border-black ml-2.5">
                                            {TargetAudience.DemographicsPsychographics}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Row 3: User Persona */}
                        {UserPersonas?.length > 0 && (
                            <div className="p-6">
                                <UserPersonasDisplay personas={UserPersonas} isPdf={isPdf} />
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}