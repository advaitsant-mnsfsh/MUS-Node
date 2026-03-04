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
        const workingMatch = safeText.match(/WHAT IS WORKING:([\s\S]*?)(?=WHAT IS NOT WORKING:|$)/i);
        const notWorkingMatch = safeText.match(/WHAT IS NOT WORKING:([\s\S]*?)$/i);

        if (workingMatch || notWorkingMatch) {
            const extractPoints = (sectionText: string) => {
                if (!sectionText) return [];

                // 1. Try splitting by explicit newlines or bullet characters
                let points = sectionText
                    .split(/\n|(?=[\u2022\u25CF\u25CB\u25AA\u25AB\u2043\u2013\u2014])/)
                    .map(p => p.trim().replace(/^[\u2022\u25CF\u25CB\u25AA\u25AB\u2043\u2013\u2014\-\*]\s*/, ''))
                    .filter(p => p.length > 5);

                // 2. If it's a block of text, split by the citation closure pattern
                if (points.length <= 1) {
                    // This regex splits after a closing parenthesis followed by a space and an uppercase letter
                    // e.g., ... (Citation: "..."). Next point starts here.
                    const sentenceLikePoints = sectionText.split(/(?<=\)\.?)\s+(?=[A-Z])/);
                    if (sentenceLikePoints.length > 1) {
                        points = sentenceLikePoints.map(p => p.trim());
                    }
                }

                return points.filter(p => p.length > 0);
            };

            if (workingMatch && workingMatch[1]) working = extractPoints(workingMatch[1]);
            if (notWorkingMatch && notWorkingMatch[1]) notWorking = extractPoints(notWorkingMatch[1]);
            raw = '';
        }

        return { working, notWorking, raw };
    };

    const { working, notWorking, raw } = parseSummary(summaryText);

    // --- RENDER HELPERS ---
    const Point = ({ content }: { content: string }) => {
        // Regex to extract citation: (Citation: "...")
        const citationRegex = /\(Citation:\s*(.*?)\)\.?$/i;
        const match = content.match(citationRegex);

        if (match) {
            const textPart = content.replace(match[0], '').trim();
            const citation = match[1].replace(/^["']|["']$/g, ''); // Strip quotes

            return (
                <div className="space-y-1">
                    <div className="flex items-start gap-3">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                        <p className="text-slate-800 font-medium text-[15px] leading-relaxed">
                            {textPart}
                        </p>
                    </div>
                    <div className="pl-4.5">
                        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Citation:</span>
                        <p className="text-[13px] text-slate-500 italic bg-slate-50 border-l-2 border-slate-200 pl-2 py-0.5">
                            "{citation}"
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                <p className="text-slate-800 font-normal text-[15px] leading-relaxed">
                    {content}
                </p>
            </div>
        );
    };

    const Section = ({ title, items, type }: { title: string, items: string[], type: 'working' | 'notWorking' }) => {
        if (items.length === 0) return null;

        const isWorking = type === 'working';
        const badgeClass = isWorking ? 'bg-[#FEF08A]' : 'bg-[#FFCFCE]';

        return (
            <div className="mb-10 last:mb-0 break-inside-avoid pdf-item">
                <div className={`inline-block border-2 border-black shadow-neo px-4 py-1.5 mb-6 ${badgeClass}`}>
                    <h4 className="font-extrabold text-[13px] uppercase tracking-wider text-black">{title}</h4>
                </div>
                <div className="space-y-6">
                    {items.map((item, i) => (
                        <Point key={i} content={item} />
                    ))}
                </div>
            </div>
        );
    };

    if (raw) {
        return (
            <div className="flex flex-col gap-6 pl-8 border-l-4 border-slate-300 break-inside-avoid pdf-item">
                <div className="text-slate-800 font-medium text-base leading-relaxed">
                    {raw}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col gap-2 break-inside-avoid pdf-item ${!isPdf ? 'animate-in fade-in slide-in-from-bottom-2' : ''}`}>
            <div className="pl-8 border-l-4 border-slate-300">
                <Section title="What Is Working" items={working} type="working" />
                <Section title="What Is Not Working" items={notWorking} type="notWorking" />
            </div>
        </div>
    );
};
