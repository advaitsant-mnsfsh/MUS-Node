import React, { useState, useEffect } from "react";
import { StrategyAudit } from "../../types";
import { ASSETS } from "./constants";
// ✅ Using Lucide Icons for clean, scalable visuals
import {
  ChevronDown,
  Target,
  Globe,
  Grid3X3,
  User,
  BriefcaseBusiness,
  MapPin,
  Check,
  X,
  BarChart2,
} from "lucide-react";

// --- STYLING CONSTANTS ---
// const SECTION_LABEL = "text-xs font-bold text-slate-900 mb-1"; // Unused
// const BODY_STYLE = "text-sm leading-relaxed text-slate-600 font-medium"; // Unused
// const HEADING_STYLE = "text-lg font-bold text-slate-900 leading-tight"; // Unused

// --- HELPER: PDF AVATAR (Handles CORS for PDF Generation) ---
const PDFAvatar = ({ url }: { url: string }) => {
  const [imgData, setImgData] = useState<string | null>(null);

  useEffect(() => {
    const toBase64 = (url: string) => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          } else reject(new Error("Canvas context is null"));
        };
        img.onerror = (e) => reject(e);
      });
    };

    const convert = async () => {
      try {
        // Cache busting to ensure fresh fetch
        const fetchUrl =
          url + (url.includes("?") ? "&" : "?") + "t=" + Date.now();
        const base64 = await toBase64(fetchUrl);
        setImgData(base64);
      } catch (e) {
        console.warn("PDFAvatar conversion failed:", e);
      }
    };

    convert();
  }, [url]);

  if (!imgData) return <div className="w-full h-full bg-slate-200" />;
  return (
    <img
      src={imgData}
      alt="avatar"
      className="w-full h-full object-cover block"
    />
  );
};

// --- COMPONENT: USER PERSONAS (Internal Helper) ---
function UserPersonasDisplay({
  personas,
  isPdf = false,
}: {
  personas?: StrategyAudit["UserPersonas"];
  isPdf?: boolean;
}) {
  const personaAvatars = [
    ASSETS.personas.one,
    ASSETS.personas.two,
    ASSETS.personas.three,
  ];
  if (!personas) return null;

  return (
    <div className="mt-6">
      <h4 className="flex items-center gap-2 text-[18px] font-black text-[#996F00] mb-4 px-1 tracking-wide">
        <User className="w-5 h-5 text-[#996F00]" />
        <span>User Persona</span>
      </h4>
      <div
        className={`grid grid-cols-1 md:grid-cols-2 ${isPdf ? "lg:grid-cols-2" : "lg:grid-cols-3"} gap-6`}
      >
        {personas.map((p, i) => (
          <div
            key={i}
            className="flex flex-col bg-white border border-slate-200 rounded-lg p-0 overflow-hidden break-inside-avoid"
          >
            {/* Header: Avatar + Info */}
            <div className="flex flex-row items-center gap-4 p-4 bg-slate-50 border-b border-slate-200">
              <div className="shrink-0 w-16 h-16 rounded-lg bg-white overflow-hidden">
                {isPdf ? (
                  <PDFAvatar url={personaAvatars[i % 3]} />
                ) : (
                  <img
                    src={personaAvatars[i % 3]}
                    className="w-full h-full object-cover"
                    alt={p.Name}
                  />
                )}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-bold text-black truncate text-[18px] leading-snug">
                  {p.Name.split(" ")[0]}
                </span>
                <div className="mt-1.5 space-y-1.5 text-[14px] text-slate-700">
                  <div className="flex items-center gap-2 leading-tight">
                    <User className="w-4 h-4 text-slate-600" />
                    <span>{p.Age}</span>
                  </div>
                  <div className="flex items-center gap-2 leading-tight">
                    <BriefcaseBusiness className="w-4 h-4 text-slate-600" />
                    <span className="truncate">{p.Occupation}</span>
                  </div>
                  <div className="flex items-center gap-2 leading-tight">
                    <MapPin className="w-4 h-4 text-slate-600" />
                    <span className="truncate">{p.Location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col gap-6">
              {/* Goals & Needs */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </span>
                  <span className="text-[16px] font-semibold text-slate-900">
                    Goals and needs
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {(p.UserNeedsBehavior || "")
                    .split(/(?<=\.)\s+/)
                    .filter(Boolean)
                    .map((sentence, idx) => (
                      <li
                        key={idx}
                        className="flex gap-2 text-[14px] text-slate-800 leading-relaxed"
                      >
                        <span className="mt-0.5 text-[14px] font-medium text-slate-500 w-5 text-right">
                          {idx + 1}.
                        </span>
                        <span>{sentence.trim()}</span>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Pain points */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center">
                    <X className="w-4 h-4 text-red-600" />
                  </span>
                  <span className="text-[16px] font-semibold text-slate-900">
                    Pain points
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {(p.PainPointOpportunity || "")
                    .split(/(?<=\.)\s+/)
                    .filter(Boolean)
                    .map((sentence, idx) => (
                      <li
                        key={idx}
                        className="flex gap-2 text-[14px] text-slate-800 leading-relaxed"
                      >
                        <span className="mt-0.5 text-[14px] font-medium text-slate-500 w-5 text-right">
                          {idx + 1}.
                        </span>
                        <span>{sentence.trim()}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- MAIN COMPONENT: STRATEGY AUDIT (Context Capture) ---
export function StrategyAuditDisplay({
  audit,
  isPdf = false,
  forcePageBreak = false,
}: {
  audit: StrategyAudit;
  isPdf?: boolean;
  forcePageBreak?: boolean;
}) {
  const { DomainAnalysis, PurposeAnalysis, TargetAudience, UserPersonas } =
    audit || {};
  const [isOpen, setIsOpen] = useState(false);

  // Collapsible Logic
  // If it's PDF, always open.
  const isExpanded = isPdf ? true : isOpen;

  return (
    <div
      className={`w-full bg-white border border-slate-200 font-['DM_Sans'] transition-all overflow-hidden rounded-lg`}
    >
      {/* Header / Toggle */}
      <div
        className={`flex items-center justify-between p-6 cursor-pointer transition-colors select-none border-b border-slate-200 ${isOpen ? "bg-yellow-50" : "bg-white hover:bg-yellow-50"}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-black text-black uppercase tracking-tight">
            Context Capture
          </h3>
          <p className="text-slate-600 font-bold text-sm">
            Understanding your website’s context, goals and target audience.
          </p>
        </div>
        {!isPdf && (
          <button className="text-sm font-bold text-slate-700 flex items-center gap-2 border  bg-white px-3 py-1.5 rounded transition-all hover:bg-slate-100">
            {isExpanded ? "COLLAPSE" : "EXPAND"}
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
              strokeWidth={3}
            />
          </button>
        )}
      </div>

      {/* Collapsible Content Wrapper (Smooth Animation) */}
      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="bg-white">
            {/* Row 1: Purpose analysis (left) & domain analysis (right) */}
            <div className="p-6">
              <h3 className="flex items-center gap-2 text-[18px] font-black text-[#666] tracking-tight mb-4">
                <span>Purpose Analysis</span>
              </h3>
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* LEFT: Primary Purpose + Key Objectives */}
                <div className="w-full lg:w-1/2 min-w-0 lg:pr-6">
                  <div className="space-y-6">
                    <div>
                      <h5 className="flex items-center gap-2 mb-2 text-[18px] text-[#996F00] font-black tracking-wide">
                        <Target className="w-5 h-5 text-[#996F00]" />
                        <span>Primary Purpose</span>
                      </h5>
                      <ul className="space-y-3">
                        {PurposeAnalysis?.PrimaryPurpose?.map((p, i) => (
                          <li
                            key={i}
                            className="flex gap-3 text-sm text-slate-800 font-medium leading-relaxed"
                          >
                            <span className="font-bold text-black tabular-nums shrink-0 w-6 text-right">
                              {i + 1}.
                            </span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="flex items-center gap-2 mb-2 text-[18px] text-[#996F00] font-black tracking-wide">
                        <Grid3X3 className="w-5 h-5 text-[#996F00]" />
                        <span>Key Objectives</span>
                      </h5>
                      <ul className="space-y-3 max-w-3xl">
                        {(PurposeAnalysis?.KeyObjectives || "")
                          .split(/(?<=\.)\s+/)
                          .filter(Boolean)
                          .map((sentence, i) => (
                            <li
                              key={i}
                              className="flex gap-3 text-sm text-slate-800 font-medium leading-relaxed"
                            >
                              <span className="font-bold text-black tabular-nums shrink-0 w-6 text-right">
                                {i + 1}.
                              </span>
                              <span className="flex-1">{sentence.trim()}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Domain analysis */}
                <div className="w-full lg:w-1/2 min-w-0">
                  <h4 className="flex items-center gap-2 text-[18px] font-black text-[#996F00] mb-4">
                    <Globe className="w-5 h-5 text-[#996F00]" />
                    <span>Domain Analysis</span>
                  </h4>
                  <ul className="space-y-3">
                    {DomainAnalysis?.Items?.slice(0, 9).map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm text-slate-800 font-medium leading-relaxed"
                      >
                        <span className="font-bold text-black tabular-nums shrink-0 w-6 text-right">
                          {i + 1}.
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Row 2: Target Audience */}
            {TargetAudience && (
              <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                <div className="mb-6 flex gap-2 items-center">
                  <span className="tracking-wider text-[14px] font-black text-[#666]">
                    Target audience
                  </span>
                  <span className="inline-flex items-center px-4 py-1 rounded-full bg-slate-100 text-sm font-semibold text-slate-900">
                    <span className="uppercase tracking-wider text-[11px] mr-2">
                      Target Audience Type
                    </span>
                    <span className="text-sm font-semibold">
                      {TargetAudience.WebsiteType}
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h5 className="flex items-center gap-2 mb-3 text-[18px] text-[#996F00] font-bold tracking-wide">
                      <User className="w-5 h-5 text-[#996F00]" />
                      <span>Primary Audience</span>
                    </h5>
                    <ul className="space-y-1.5">
                      {TargetAudience.Primary.map((p, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-sm text-slate-800 font-medium leading-relaxed"
                        >
                          <span className="font-bold text-slate-500 tabular-nums shrink-0 w-5 text-center">
                            {i + 1}
                          </span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="flex items-center gap-2 mb-3 text-[18px] text-[#996F00] font-bold tracking-wide">
                      <BarChart2 className="w-5 h-5 text-[#996F00]" />
                      <span>Demographics</span>
                    </h5>
                    <p className="text-sm text-slate-800 font-medium leading-relaxed">
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
