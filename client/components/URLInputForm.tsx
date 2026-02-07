import React, { useState } from 'react';
import { WhiteLabelModal } from './WhiteLabelModal';
import { AuditInput } from '../types';
import {
  Globe,
  Loader2,
  Swords,
  X,
  Sparkles
} from 'lucide-react';
import { StandardInputControl } from './inputs/StandardInputControl';
import { CompetitorMultiInput } from './inputs/CompetitorMultiInput';

// --- HELPER: VALIDATORS (Exposed for submit logic) ---
const isValidUrl = (string: string) => {
  try {
    const url = new URL(string.startsWith('http') ? string : `https://${string}`);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
};

interface URLInputFormProps {
  onAnalyze: (inputs: AuditInput[], auditMode: 'standard' | 'competitor') => void;
  isLoading: boolean;
  whiteLabelLogo: string | null;
  onWhiteLabelLogoChange: (logo: string | null) => void;
}

// --- MAIN COMPONENT ---
export const URLInputForm: React.FC<URLInputFormProps> = ({
  onAnalyze,
  isLoading,
  whiteLabelLogo,
  onWhiteLabelLogoChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mode State
  const [competitorMode, setCompetitorMode] = useState(false);

  // Queue State
  const [queue, setQueue] = useState<AuditInput[]>([]);

  // Input State
  const [currentUrl, setCurrentUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Queue States (Competitor)
  const [primaryQueue, setPrimaryQueue] = useState<AuditInput[]>([]);
  const [competitorQueue, setCompetitorQueue] = useState<AuditInput[]>([]);
  const [primaryError, setPrimaryError] = useState<string | null>(null);
  const [competitorError, setCompetitorError] = useState<string | null>(null);

  const [primaryUrl, setPrimaryUrl] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');

  const remainingSlots = 5 - queue.length; // Re-calc logic for UI if needed globally, but used in component

  const handleSaveLogo = (logoData: string) => {
    onWhiteLabelLogoChange(logoData || null);
  };

  // --- HANDLER: SUBMIT ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // Clear global errors
    setErrorMsg(null);
    setPrimaryError(null);
    setCompetitorError(null);

    if (competitorMode) {
      // Auto-add any pending inputs
      let finalPrimaryQueue = [...primaryQueue];
      if (primaryUrl.trim() && isValidUrl(primaryUrl.trim())) {
        finalPrimaryQueue.push({ id: `p_pending`, type: 'url', url: primaryUrl.trim() });
      }

      let finalCompetitorQueue = [...competitorQueue];
      if (competitorUrl.trim() && isValidUrl(competitorUrl.trim())) {
        finalCompetitorQueue.push({ id: `c_pending`, type: 'url', url: competitorUrl.trim() });
      }

      if (finalPrimaryQueue.length === 0) {
        setPrimaryError("Please add at least one URL or screenshot.");
        return;
      }
      if (finalCompetitorQueue.length === 0) {
        setCompetitorError("Please add at least one URL or screenshot.");
        return;
      }

      // Merge with roles
      const mergedInputs: AuditInput[] = [
        ...finalPrimaryQueue.map(i => ({ ...i, role: 'primary' as const })),
        ...finalCompetitorQueue.map(i => ({ ...i, role: 'competitor' as const }))
      ];

      onAnalyze(mergedInputs, 'competitor');

    } else {
      // Standard Mode Logic (Existing + Auto Add)
      let finalQueue = [...queue];
      if (currentUrl.trim() && isValidUrl(currentUrl.trim())) {
        if (remainingSlots > 0 && !queue.some(i => i.url?.toLowerCase() === currentUrl.trim().toLowerCase())) {
          finalQueue.push({ id: 'instant-submit', type: 'url', url: currentUrl.trim() });
        }
      }

      if (finalQueue.length === 0) {
        setErrorMsg("Please add at least one URL or screenshot.");
        return;
      }

      onAnalyze(finalQueue, 'standard');
    }
  };

  return (
    <>
      <section aria-label="Start Audit" className="bg-white rounded-lg border-2 border-border-main shadow-neo overflow-hidden font-sans">
        <div className="p-6 md:p-8 space-y-4">

          {/* Header & Mode Switch */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-300">
            <div>
              <h2 className="text-h3 font-bold text-text-primary">
                {competitorMode ? "Enter websites to compare" : "Enter Website Url"}
              </h2>
              <p className="text-text-secondary text-sm mt-1">
                {competitorMode
                  ? "You can enter upto 5 urls or screenshots of the each website."
                  : "You can enter upto 5 urls of the same website"}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCompetitorMode(false)}
                className={`flex-1 px-6 py-2 text-sm font-bold rounded-xm transition-all border-2 border-border-main hover:shadow-neo ${!competitorMode
                  ? 'bg-accent-yellow shadow-neo text-text-primary'
                  : 'bg-white text-text-secondary hover:bg-[#F5F5F5]'
                  }`}
              >
                Deep<br></br>Assessment
              </button>
              <button
                type="button"
                onClick={() => setCompetitorMode(true)}
                className={`flex-1 px-6 py-2 text-sm font-bold rounded-xm transition-all border-2 border-border-main flex items-center justify-center gap-2 hover:shadow-neo ${competitorMode
                  ? 'bg-accent-yellow shadow-neo text-text-primary'
                  : 'bg-white text-text-secondary hover:bg-[#F5F5F5]'
                  }`}
              >
                {/* <Swords className="w-4 h-4" /> */}
                Competitor<br></br>Assessment
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {competitorMode ? (
              // --- COMPETITOR MODE INPUTS (DUAL QUEUES) ---
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">

                {/* PRIMARY QUEUE */}
                <div className="bg-white p-5 rounded-lg border-2 border-border-main hover:shadow-neo">
                  <h3 className="text-xs font-bold text-text-primary mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-brand" /> YOUR WEBSITE
                  </h3>
                  <CompetitorMultiInput
                    queue={primaryQueue}
                    setQueue={setPrimaryQueue}
                    currentUrl={primaryUrl}
                    setCurrentUrl={setPrimaryUrl}
                    errorMsg={primaryError}
                    setErrorMsg={setPrimaryError}
                    placeholder="Your URL..."
                    colorClass="indigo"
                  />
                </div>

                {/* COMPETITOR QUEUE */}
                <div className="bg-white p-5 rounded-lg border-2 border-border-main hover:shadow-neo">
                  <h3 className="text-xs font-bold text-text-primary mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Swords className="w-4 h-4 text-[#EF4444]" /> COMPETITOR WEBSITE
                  </h3>
                  <CompetitorMultiInput
                    queue={competitorQueue}
                    setQueue={setCompetitorQueue}
                    currentUrl={competitorUrl}
                    setCurrentUrl={setCompetitorUrl}
                    errorMsg={competitorError}
                    setErrorMsg={setCompetitorError}
                    placeholder="Competitor URL..."
                    colorClass="red"
                  />
                </div>
              </div>
            ) : (
              // --- STANDARD MODE INPUTS (SINGLE QUEUE) ---
              <div className="flex flex-col gap-2">
                <StandardInputControl
                  queue={queue}
                  setQueue={setQueue}
                  currentUrl={currentUrl}
                  setCurrentUrl={setCurrentUrl}
                  errorMsg={errorMsg}
                  setErrorMsg={setErrorMsg}
                />
                <p className="text-xs text-text-secondary">
                  Alternatively, you can add screenshots of your website as well
                </p>
              </div>
            )}

            {/* Validation Error Message (Global) */}
            {errorMsg && !competitorMode && (
              <div className="flex items-center gap-2 text-red-600 text-xs font-medium animate-in fade-in slide-in-from-top-1 px-1">
                <X className="w-3 h-3" />
                {errorMsg}
              </div>
            )}

            {/* Footer Section: Brand Stamp + Actions */}
            <div className={`pt-4 border-t border-slate-300 ${!competitorMode ? '!mt-3' : ''}`}>

              {/* Action Container */}
              <div className="flex flex-col gap-3">

                {/* Compact Logo Option - Single Line */}
                <div className="text-center text-xs text-text-secondary min-h-[40px] flex items-center justify-center">
                  {!whiteLabelLogo ? (
                    <>
                      Want a shareable report with custom branding? {' '}
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="text-brand hover:text-brand-hover font-bold underline decoration-dotted underline-offset-2 transition-colors ml-1"
                      >
                        Upload Logo
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary">Logo added</span>
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(true)}
                          className="text-brand hover:text-brand-hover font-bold underline decoration-dotted underline-offset-2 transition-colors"
                        >
                          Change it
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <img
                          src={whiteLabelLogo}
                          alt="Custom Logo"
                          className="h-6 max-w-[100px] object-contain border-2 border-border-main rounded bg-white shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onWhiteLabelLogoChange(null);
                          }}
                          className="flex items-center justify-center w-5 h-5 rounded-full text-slate-400 hover:bg-slate-200 hover:text-red-500 transition-all"
                          title="Remove logo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-4 bg-text-primary text-white font-bold text-body rounded-lg border-2 border-border-main shadow-neo hover:shadow-neo-hover hover:-translate-x-px hover:-translate-y-px active:shadow-none active:translate-x-0 active:translate-y-0 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      Running...
                    </>
                  ) : (
                    <>
                      <span>{competitorMode ? "START COMPARISON" : "START ASSESSING"}</span>
                      <span className="text-xl">→</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>
      </section>

      <WhiteLabelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLogo}
        initialLogo={whiteLabelLogo}
      />
    </>
  );
};