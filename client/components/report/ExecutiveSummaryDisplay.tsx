import React from 'react';
import { CheckCircle2, XCircle, Swords, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';

interface ExecutiveSummaryDisplayProps {
    summaryText: string;
    isPdf?: boolean;
}

export const ExecutiveSummaryDisplay: React.FC<ExecutiveSummaryDisplayProps> = ({ summaryText, isPdf = false }) => {

    // --- PARSING LOGIC ---
    const parseSummary = (text: string) => {
        if (!text) return { working: [], notWorking: [], raw: '' };

        // Normalize text
        const safeText = text.replace(/\*\*/g, '').trim();

        let working: string[] = [];
        let notWorking: string[] = [];
        let raw = safeText;

        // Try to split by known headers
        // AI usually outputs: "WHAT IS WORKING: ... WHAT IS NOT WORKING: ..."
        // Regex to find "WHAT IS WORKING:" (case insensitive) and everything after until "WHAT IS NOT WORKING:"
        const workingMatch = safeText.match(/WHAT IS WORKING:([\s\S]*?)(?=WHAT IS NOT WORKING:|$)/i);
        const notWorkingMatch = safeText.match(/WHAT IS NOT WORKING:([\s\S]*?)$/i);

        if (workingMatch || notWorkingMatch) {
            // Helper to clean and split content into sentences/points
            const extractPoints = (sectionText: string) => {
                if (!sectionText) return [];
                // Split by newlines first if available
                let lines = sectionText.split(/\n/).map(l => l.trim()).filter(l => l.length > 5);

                if (lines.length <= 1) {
                    // Split by "), " pattern
                    const points = sectionText.split(/\),\s*(?=[A-Z])/);
                    return points.map(p => {
                        let clean = p.trim();
                        if (!clean.endsWith(')') && clean.includes('(Citation:')) clean += ')';
                        return clean;
                    });
                }
                return lines;
            };

            if (workingMatch && workingMatch[1]) {
                working = extractPoints(workingMatch[1]);
            }
            if (notWorkingMatch && notWorkingMatch[1]) {
                notWorking = extractPoints(notWorkingMatch[1]);
            }
            raw = ''; // We successfully parsed
        }

        return { working, notWorking, raw };
    };

    const { working, notWorking, raw } = parseSummary(summaryText);

    // --- RENDER HELPERS ---
    // Neo-Brutalist Style: Simple list with bold headers
    const Section = ({ title, items, type }: { title: string, items: string[], type: 'working' | 'notWorking' }) => {
        if (items.length === 0) return null;

        const isWorking = type === 'working';
        const badgeClass = isWorking ? 'bg-[#FEF08A]' : 'bg-[#FECACA]'; // Yellow-200 or Red-200

        return (
            <div className="mb-8 last:mb-0 break-inside-avoid pdf-item">
                <div className={`inline-block border-2 border-black shadow-neo px-3 py-1 mb-4 ${badgeClass}`}>
                    <h4 className="font-extrabold text-sm uppercase tracking-wide text-black">{title}</h4>
                </div>
                <ul className="space-y-3 pl-1">
                    {items.map((item, i) => (
                        <li key={i} className="text-slate-900 font-medium text-base leading-relaxed">
                            {item.replace(/^\W+/, '')}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    if (raw) {
        // Fallback layout if parsing failed
        return (
            <div className="flex flex-col gap-6 pl-6 border-l-4 border-black break-inside-avoid pdf-item">
                <h3 className="text-3xl font-black text-black uppercase tracking-tight">Executive Summary</h3>
                <div className="prose prose-slate max-w-none text-slate-900 font-medium leading-relaxed">
                    {raw}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col gap-2 break-inside-avoid pdf-item ${!isPdf ? 'animate-in fade-in slide-in-from-bottom-2' : ''}`}>
            {/* Main Header with Blue Box */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-6 h-10 bg-brand border-2 border-black shadow-neo"></div>
                <h3 className="text-3xl font-black text-black uppercase tracking-tight">Executive Summary</h3>
            </div>

            {/* Content with Thick Left Border */}
            <div className="pl-8 border-l-4 border-[#475569]">
                <Section title="What Is Working" items={working} type="working" />
                <Section title="What Is Not Working" items={notWorking} type="notWorking" />
            </div>
        </div>
    );
};
