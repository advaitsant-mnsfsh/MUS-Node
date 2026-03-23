import React from "react";
import {
  CheckCircle2,
  XCircle,
  Swords,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

interface ExecutiveSummaryDisplayProps {
  summaryText: string;
  isPdf?: boolean;
  /** When true, render What's working (left) | What's not (right) in two columns */
  twoColumns?: boolean;
}

export const ExecutiveSummaryDisplay: React.FC<
  ExecutiveSummaryDisplayProps
> = ({ summaryText, isPdf = false, twoColumns = false }) => {
  // --- PARSING LOGIC ---
  const parseSummary = (text: string) => {
    if (!text) return { working: [], notWorking: [], raw: "" };

    // Normalize text
    const safeText = text.replace(/\*\*/g, "").trim();

    let working: string[] = [];
    let notWorking: string[] = [];
    let raw = safeText;

    // Try to split by known headers
    const workingMatch = safeText.match(
      /WHAT IS WORKING:([\s\S]*?)(?=WHAT IS NOT WORKING:|$)/i,
    );
    const notWorkingMatch = safeText.match(/WHAT IS NOT WORKING:([\s\S]*?)$/i);

    if (workingMatch || notWorkingMatch) {
      const extractPoints = (sectionText: string) => {
        if (!sectionText) return [];

        // 1. Try splitting by explicit newlines or bullet characters
        let points = sectionText
          .split(/\n|(?=[\u2022\u25CF\u25CB\u25AA\u25AB\u2043\u2013\u2014])/)
          .map((p) =>
            p
              .trim()
              .replace(
                /^[\u2022\u25CF\u25CB\u25AA\u25AB\u2043\u2013\u2014\-\*]\s*/,
                "",
              ),
          )
          .filter((p) => p.length > 5);

        // 2. If it's a block of text, split by the citation closure pattern
        if (points.length <= 1) {
          // This regex splits after a closing parenthesis followed by a space and an uppercase letter
          // e.g., ... (Citation: "..."). Next point starts here.
          const sentenceLikePoints = sectionText.split(
            /(?<=\)\.?)\s+(?=[A-Z])/,
          );
          if (sentenceLikePoints.length > 1) {
            points = sentenceLikePoints.map((p) => p.trim());
          }
        }

        return points.filter((p) => p.length > 0);
      };

      if (workingMatch && workingMatch[1])
        working = extractPoints(workingMatch[1]);
      if (notWorkingMatch && notWorkingMatch[1])
        notWorking = extractPoints(notWorkingMatch[1]);
      raw = "";
    }

    return { working, notWorking, raw };
  };

  const { working, notWorking, raw } = parseSummary(summaryText);

  // --- RENDER HELPERS ---
  const Point = ({ content, number }: { content: string; number?: number }) => {
    const marker =
      number != null ? (
        <span className="mt-0.5 flex  shrink-0 items-center justify-center text-sm font-bold text-slate-700">
          {number}.
        </span>
      ) : (
        <span className="mt-2 shrink-0" />
      );
    // Regex to extract citation: (Citation: "...")
    const citationRegex = /\(Citation:\s*(.*?)\)\.?$/i;
    const match = content.match(citationRegex);

    if (match) {
      const textPart = content.replace(match[0], "").trim();
      const citation = match[1].replace(/^["']|["']$/g, ""); // Strip quotes

      return (
        <div className="space-y-1">
          <div className="flex items-start gap-3">
            {marker}
            <p className="text-sm leading-relaxed text-slate-800 font-medium">
              {textPart}
            </p>
          </div>
          <div className="pl-4.5 text-sm">
            <span className="font-bold uppercase tracking-wider text-slate-400">
              Citation:
            </span>{" "}
            <span className="text-slate-500 italic break-words">
              {citation}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-start gap-3">
        {marker}
        <p className="text-sm leading-relaxed text-slate-800 font-normal">
          {content}
        </p>
      </div>
    );
  };

  const Section = ({
    title,
    items,
    type,
  }: {
    title: string;
    items: string[];
    type: "working" | "notWorking";
  }) => {
    if (items.length === 0) return null;

    const isWorking = type === "working";
    const badgeClass = isWorking ? "bg-[#dcf7e2]" : "bg-[#FFCFCE]"; // What's working = light soft green

    return (
      <div className="mb-10 last:mb-0 break-inside-avoid pdf-item">
        <div
          className={`inline-block border border-slate-200 px-4 py-1.5 mb-6 ${badgeClass}`}
        >
          <h4 className="font-extrabold text-[13px] uppercase tracking-wider text-black">
            {title}
          </h4>
        </div>
        <div className="space-y-6">
          {items.map((item, i) => (
            <Point key={i} content={item} number={i + 1} />
          ))}
        </div>
      </div>
    );
  };

  if (raw) {
    return (
      <div className="flex flex-col gap-6 break-inside-avoid pdf-item">
        <div className="text-sm leading-relaxed text-slate-800 font-medium">
          {raw}
        </div>
      </div>
    );
  }

  if (twoColumns) {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 break-inside-avoid pdf-item ${!isPdf ? "animate-in fade-in slide-in-from-bottom-2" : ""}`}
      >
        <div>
          <Section title="What's working" items={working} type="working" />
        </div>
        <div>
          <Section
            title="What's not working"
            items={notWorking}
            type="notWorking"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-2 break-inside-avoid pdf-item ${!isPdf ? "animate-in fade-in slide-in-from-bottom-2" : ""}`}
    >
      <div>
        <Section title="What Is Working" items={working} type="working" />
        <Section
          title="What Is Not Working"
          items={notWorking}
          type="notWorking"
        />
      </div>
    </div>
  );
};
