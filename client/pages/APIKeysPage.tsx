import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Check,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  generateAPIKey,
  getUserAPIKeys,
  deactivateAPIKey,
  APIKey,
} from "../services/apiKeysService";
import { Footer } from "../components/Footer";

// ─────────────────────────────────────────────────────────────────────
// Figma source: Dev Handoff → API Keys Pages
//
// Logged in:  "API Keys Iteration logged in"   node 1858:3925
// Logged out: "API Keys Iteration 15 Logged Out" node 1858:4146
//
// Layout tokens from Figma:
//   Page:          bg #ffffff, min-h screen
//   Content area:  pt-8 pb-8, sections gap 48px
//   Side padding:  200px each side on inner content
//   Hero:          embed preview (566×494 yellow) left, heading right
//   Page bg:       #f5f5f5 (content under navbar)
//   Keys card:     w 1046 max, bg #fff border 1px rgba(0,0,0,0.1) radius 12 p 32
//   Key row:       border 1px rgba(0,0,0,0.1) radius 12 p 16 gap 8
//   Key value:     bg #fafafa border 0.5px rgba(0,0,0,0.1) radius 4 p 10
//   Active chip:   bg rgba(26,255,26,0.10) radius 4 pad 4  text #24312d 10px SemiBold
//   Generate btn:  bg #6366f1 border 1px rgba(0,0,0,0.1) radius 12 p 12
//   View Docs:     logged in border rgba(0,0,0,0.5); logged out #f8d448 + dark border
//   Setup cards:   bg #fff border 1px #e5e5e5 radius 12 pad 24
//   Value cards:   bg #fff border 1px #e5e5e5 radius 12 pad 20
// ─────────────────────────────────────────────────────────────────────

// Main content column width — matches Widget API Keys card (all sections below align to this).
const API_KEYS_PAGE_CONTENT_MAX = 1046;

// ── Key Row ────────────────────────────────────────────────────────
const KeyRow: React.FC<{
  apiKey: APIKey;
  visible: boolean;
  onToggle: () => void;
  onCopy: () => void;
  onDeactivate: () => void;
}> = ({ apiKey, visible, onToggle, onCopy, onDeactivate }) => {
  const masked = "mus-live" + "•".repeat(22);
  const createdDate = new Date(apiKey.createdAt)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "/");

  return (
    <div
      className="flex flex-col font-['DM_Sans'] w-full"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: 8,
        padding: 16,
        gap: 12,
        opacity: apiKey.isActive ? 1 : 0.5,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col min-w-0" style={{ gap: 6 }}>
          <div className="flex flex-wrap items-center" style={{ gap: 8 }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 12 12"
              fill="none"
              className="shrink-0 text-[#666666]"
              aria-hidden
            >
              <circle
                cx="4.5"
                cy="5"
                r="3.5"
                stroke="currentColor"
                strokeWidth="1"
              />
              <line
                x1="7.5"
                y1="5"
                x2="11.5"
                y2="5"
                stroke="currentColor"
                strokeWidth="1"
              />
              <line
                x1="9.5"
                y1="3.5"
                x2="9.5"
                y2="6.5"
                stroke="currentColor"
                strokeWidth="1"
              />
              <circle
                cx="4.5"
                cy="5"
                r="1"
                fill="currentColor"
                fillOpacity={0.65}
              />
            </svg>
            <span
              className="font-semibold text-[#1a1a1a]"
              style={{ fontSize: 16, lineHeight: 1.25 }}
            >
              {apiKey.name}
            </span>
            <span
              className="font-semibold shrink-0"
              style={{
                backgroundColor: apiKey.isActive
                  ? "rgba(26,255,26,0.10)"
                  : "rgba(239,68,68,0.10)",
                borderRadius: 9999,
                padding: "3px 10px",
                fontSize: 10,
                lineHeight: 1.2,
                color: apiKey.isActive ? "#24312d" : "#7f1d1d",
              }}
            >
              {apiKey.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <span
            className="font-normal text-[#999999]"
            style={{ fontSize: 10, lineHeight: 1.4 }}
          >
            created on {createdDate}
            {apiKey.lastUsedAt &&
              ` • Last used ${new Date(apiKey.lastUsedAt).toLocaleDateString()}`}
          </span>
        </div>
        {apiKey.isActive && (
          <button
            type="button"
            onClick={onDeactivate}
            className="shrink-0 p-1 rounded-md hover:bg-neutral-100 transition-colors"
            title="Deactivate key"
          >
            <Trash2 className="w-4 h-4 text-[#999999]" strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div
        className="flex items-center justify-between min-h-[44px]"
        style={{
          backgroundColor: "#fafafa",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 6,
          padding: "10px 12px",
          gap: 12,
        }}
      >
        <span
          className="font-normal text-[#1a1a1a] flex-1 min-w-0 truncate font-mono"
          style={{ fontSize: 14 }}
        >
          {visible ? apiKey.key : masked}
        </span>
        <div className="flex items-center shrink-0" style={{ gap: 10 }}>
          <button
            type="button"
            onClick={onToggle}
            className="p-0.5 rounded hover:opacity-70 transition-opacity"
            aria-label={visible ? "Hide key" : "Show key"}
          >
            {visible ? (
              <EyeOff className="w-4 h-4 text-[#666666]" strokeWidth={1.75} />
            ) : (
              <Eye className="w-4 h-4 text-[#666666]" strokeWidth={1.75} />
            )}
          </button>
          <button
            type="button"
            onClick={onCopy}
            className="p-0.5 rounded hover:opacity-70 transition-opacity"
            aria-label="Copy key"
          >
            <Copy className="w-4 h-4 text-[#666666]" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Setup Step Card ────────────────────────────────────────────────
const SetupCard: React.FC<{
  step: string;
  title: string;
  description: string;
  code?: string;
}> = ({ step, title, description, code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    // Figma: bg #fff border 1px #e5e5e5 radius 12 pad 24 gap 24
    <div
      className="flex flex-col font-['DM_Sans'] w-full"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: 12,
        padding: 24,
        gap: 24,
      }}
    >
      {/* Step number + text — horizontal gap 12 */}
      <div className="flex items-start" style={{ gap: 12 }}>
        {/* Step number — 15px SemiBold #666 */}
        <span
          className="font-semibold text-[#666666] shrink-0 inline-flex justify-start"
          style={{ fontSize: 15, minWidth: 16, lineHeight: 1.5 }}
        >
          {step}
        </span>
        <div className="flex flex-col" style={{ gap: 8 }}>
          {/* Title — 14px Bold #1a1a1a */}
          <p className="font-bold text-[#1a1a1a]" style={{ fontSize: 14 }}>
            {title}
          </p>
          {/* Body — 14px Medium #1a1a1a */}
          <p
            className="font-medium text-[#1a1a1a] whitespace-pre-line"
            style={{ fontSize: 14, letterSpacing: "-0.5px", lineHeight: 1.5 }}
          >
            {description}
          </p>
        </div>
      </div>
      {/* Code block — bg #4d4d4d border 0.5px #000 radius 4 pad 12 */}
      {code && (
        <div
          className="relative flex items-start justify-between"
          style={{
            backgroundColor: "#4d4d4d",
            border: "0.5px solid rgba(0,0,0,0.1)",
            borderRadius: 4,
            padding: "6px 8px",
            gap: 10,
          }}
        >
          <pre
            className="font-mono text-[#fafafa] flex-1 overflow-x-auto whitespace-pre-wrap"
            style={{ fontSize: 14, fontWeight: 400, lineHeight: "normal" }}
          >
            {code}
          </pre>
          <button
            onClick={handleCopy}
            className="shrink-0 hover:opacity-60 transition-opacity"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 text-[#666666]" strokeWidth={2} />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

// ── Value Prop Card (Figma bottom — shadow 2.572px 2.572px 0 #f8d448) ──
const ValueCard: React.FC<{
  title: string;
  items: { heading: string; body: string }[];
}> = ({ title, items }) => (
  <div
    className="flex flex-col flex-1 min-w-0 overflow-hidden font-['DM_Sans'] relative"
    style={{
      backgroundColor: "#ffffff",
      border: "1px solid #e5e5e5",
      borderRadius: 12,
      padding: 20,
      gap: 8,
      boxShadow: "2.572px 2.572px 0px 0px #f8d448",
    }}
  >
    <p
      className="font-bold capitalize shrink-0"
      style={{ fontSize: 20, color: "#996f00", letterSpacing: "-0.5px" }}
    >
      {title}
    </p>
    <div className="flex flex-col w-full" style={{ gap: 6, paddingTop: 16 }}>
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-start w-full"
          style={{ gap: 8, paddingBottom: 24 }}
        >
          <div
            className="shrink-0 flex items-center justify-center"
            style={{ width: 20, height: 20, paddingTop: 2 }}
          >
            <div
              className="rounded-full"
              style={{
                width: 8,
                height: 8,
                backgroundColor: "#f8d448",
                border: "1px solid #1a1a1a",
              }}
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0" style={{ gap: 2 }}>
            <p
              className="font-bold text-[#1a1a1a]"
              style={{
                fontSize: 18,
                letterSpacing: "-0.36px",
                lineHeight: 1.5,
              }}
            >
              {item.heading}
            </p>
            <p
              className="font-medium text-[#1a1a1a] max-w-[370px]"
              style={{ fontSize: 14, letterSpacing: "-0.5px", lineHeight: 1.5 }}
            >
              {item.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Generate Key Modal ─────────────────────────────────────────────
const GenerateModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => Promise<void>;
  isGenerating: boolean;
}> = ({ isOpen, onClose, onConfirm, isGenerating }) => {
  const [name, setName] = useState("");
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 font-['DM_Sans']"
      style={{ backgroundColor: "rgba(0,0,0,0.70)" }}
    >
      <div
        className="flex flex-col w-full animate-in zoom-in-95 duration-200 overflow-hidden"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #000000",
          borderRadius: 12,
          maxWidth: 420,
        }}
      >
        <div style={{ backgroundColor: "#6366f1", height: 6 }} />
        <div style={{ padding: 24 }}>
          <h3
            className="font-black text-[#000000] mb-2"
            style={{ fontSize: 20 }}
          >
            Name Your API Key
          </h3>
          <p
            className="font-medium mb-5"
            style={{ fontSize: 13, color: "#71717b" }}
          >
            Give your API key a descriptive name to identify it later.
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Production Widget Key"
            className="font-medium outline-none w-full placeholder:text-[#9f9fa9] mb-4"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #000000",
              height: 48,
              padding: "0 12px",
              fontSize: 14,
              color: "#000000",
            }}
            autoFocus
            onKeyDown={(e) =>
              e.key === "Enter" && name.trim() && onConfirm(name.trim())
            }
          />
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 font-medium text-[#666666] hover:opacity-70 transition-opacity"
              style={{
                backgroundColor: "#fafafa",
                borderRadius: 12,
                padding: "10px",
                fontSize: 14,
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => name.trim() && onConfirm(name.trim())}
              disabled={isGenerating || !name.trim()}
              className="font-black text-white hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              style={{
                backgroundColor: "#6366f1",
                border: "1px solid #000000",
                borderRadius: 12,
                padding: "10px 24px",
                fontSize: 14,
                flex: 2,
              }}
            >
              {isGenerating ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────
export const APIKeysPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [showKey, setShowKey] = useState<{ [id: string]: boolean }>({});
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user) fetchAPIKeys();
  }, [user]);

  const fetchAPIKeys = async () => {
    setIsLoading(true);
    const { success, apiKeys: keys, error } = await getUserAPIKeys();
    setIsLoading(false);
    if (success && keys) setApiKeys(keys);
    else toast.error(error || "Failed to load API keys");
  };

  const handleGenerateKey = () => {
    if (!user) navigate("/login?returnUrl=/api-keys");
    else setShowModal(true);
  };

  const handleConfirmGenerate = async (name: string) => {
    setIsGenerating(true);
    const { success, apiKey, error } = await generateAPIKey(name);
    setIsGenerating(false);
    if (success && apiKey) {
      toast.success("API key generated!");
      setApiKeys((prev) => [apiKey, ...prev]);
      setShowModal(false);
      setShowKey((prev) => ({ ...prev, [apiKey.id]: true }));
    } else {
      toast.error(error || "Failed to generate API key");
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`Deactivate "${name}"? This cannot be undone.`)) return;
    const { success, error } = await deactivateAPIKey(id);
    if (success) {
      toast.success("API key deactivated");
      setApiKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, isActive: false } : k)),
      );
    } else {
      toast.error(error || "Failed to deactivate");
    }
  };

  const embedCode = `<script src="https://widget.myuxscore.com/widget.js"></script>\n<script>\n  UXWidget.init({ apiKey: 'YOUR_API_KEY_HERE' });\n</script>`;

  const valueWhyItems = [
    {
      heading: "Seamless Integration",
      body: "Drop the embed onto your existing site to start capturing contextual leads without changing your workflow.",
    },
    {
      heading: "Offer Value First",
      body: "Replace static forms with an interactive audit that delivers immediate, personalized insights to your visitors.",
    },
    {
      heading: "White-Labeled Output",
      body: "It's your brand, your logo, and your client-ready report—powered by our 110+ proven interaction standards.",
    },
  ];
  const valueForWhoItems = [
    {
      heading: "For Design Agencies",
      body: "Automatically qualify inbound leads by letting prospects uncover their product's flaws before your first pitch.",
    },
    {
      heading: "For Freelance Designers",
      body: "Build immediate trust and secure better clients by offering data-backed UX insights directly from your portfolio.",
    },
    {
      heading: "For Growth Consultants",
      body: "Skip the guesswork and start client conversations with concrete data on exactly where users are dropping off.",
    },
  ];

  const setupHowToTitle = (
    <div className="flex items-center w-full" style={{ gap: 8 }}>
      <div className="w-6 h-6 flex items-center justify-center shrink-0">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M8 4L4 8l4 4M16 4l4 4-4 4M10 12h4"
            stroke="#1a1a1a"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3
        className="font-bold text-[#1a1a1a] capitalize"
        style={{ fontSize: 20, letterSpacing: "-0.5px", lineHeight: "normal" }}
      >
        How to Set up
      </h3>
    </div>
  );

  // Logged-out: Figma wide gutters (1440 / 200px). Logged-in: same max width as keys + setup (1046), no extra px.
  const valueCardsRowWide = (
    <div
      className="flex flex-col lg:flex-row w-full max-w-[1440px] mx-auto items-stretch justify-center px-4 sm:px-8 lg:px-[200px]"
      style={{ gap: 12 }}
    >
      <ValueCard title="Why this tool?" items={valueWhyItems} />
      <ValueCard title="For Who?" items={valueForWhoItems} />
    </div>
  );
  const valueCardsRowMain = (
    <div
      className="flex flex-col lg:flex-row w-full mx-auto items-stretch"
      style={{ gap: 12, maxWidth: API_KEYS_PAGE_CONTENT_MAX }}
    >
      <ValueCard title="Why this tool?" items={valueWhyItems} />
      <ValueCard title="For Who?" items={valueForWhoItems} />
    </div>
  );

  return (
    <>
      {/* Block flow only (like PricingPage). Avoid min-h-screen + flex-col inside Layout main —
         that combo fights the scrollable main (flex-1 min-h-0 overflow-y-auto) and can pin/overlap the footer on the hero. */}
      <div className="w-full font-['DM_Sans']" style={{ backgroundColor: "#f5f5f5" }}>
        <div className="relative w-full overflow-x-hidden pb-16 md:pb-20 lg:pb-24">
          <img
            src="/ring-top-left.png"
            alt=""
            aria-hidden
            className="absolute top-0 left-0 w-[56px] sm:w-[64px] md:w-[80px] h-auto z-0 pointer-events-none select-none object-contain opacity-70"
          />
          <img
            src="/ring-top-right.png"
            alt=""
            aria-hidden
            className="absolute top-0 right-0 w-[72px] sm:w-[88px] md:w-[120px] h-auto z-0 pointer-events-none select-none object-contain opacity-70"
          />
          <div className="relative z-[1] flex flex-col items-center w-full gap-12 px-4 pt-14 sm:px-6 md:gap-16 md:pt-16 lg:gap-20 lg:pt-20">
            <div
              className="flex flex-col items-center justify-center text-center shrink-0"
              style={{ gap: 16 }}
            >
              <h1 className="w-full max-w-[601px] text-center text-[26px] font-bold capitalize leading-[1.2] tracking-[-0.04em] text-[#1a1a1a] sm:text-[30px] sm:leading-[1.15] md:text-[36px] lg:text-[40px] lg:tracking-[-1px]">
                Turn your website into an active lead-generation engine,
              </h1>
              <p className="text-center text-base font-medium leading-normal tracking-[-0.35px] text-black whitespace-normal sm:text-lg md:whitespace-nowrap md:text-xl md:tracking-[-0.5px]">
                {` by embedding our UX audit directly on your site.`}
              </p>
            </div>

            {isLoggedIn ? (
              <div
                className="flex flex-col w-full items-center"
                style={{ gap: 64 }}
              >
                <div
                  className="flex flex-col w-full mx-auto"
                  style={{ maxWidth: API_KEYS_PAGE_CONTENT_MAX, gap: 64 }}
                >
                  <div
                    className="flex flex-col w-full"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid rgba(0,0,0,0.1)",
                      borderRadius: 12,
                      padding: 32,
                    }}
                  >
                    <div className="flex flex-col w-full" style={{ gap: 20 }}>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
                        <div className="flex flex-col" style={{ gap: 6 }}>
                          <h2
                            className="font-bold text-[#1a1a1a] capitalize"
                            style={{
                              fontSize: 20,
                              letterSpacing: "-0.5px",
                              lineHeight: 1.2,
                            }}
                          >
                            Widget API Keys
                          </h2>
                          <p
                            className="font-normal text-[#666666]"
                            style={{ fontSize: 16, lineHeight: 1.45 }}
                          >
                            Embed our audit tool directly into your website
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleGenerateKey}
                          className="flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shrink-0 sm:self-start"
                          style={{
                            backgroundColor: "#6366f1",
                            border: "none",
                            borderRadius: 8,
                            padding: "10px 16px",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                          }}
                        >
                          <Plus
                            className="w-4 h-4 text-white"
                            strokeWidth={2.5}
                          />
                          <span
                            className="font-bold text-white"
                            style={{ fontSize: 15 }}
                          >
                            Generate API Key
                          </span>
                        </button>
                      </div>

                      <div className="flex flex-col" style={{ gap: 20 }}>
                        {isLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="w-6 h-6 rounded-full border-2 border-[#6366f1] border-t-transparent animate-spin" />
                          </div>
                        ) : apiKeys.length === 0 ? (
                          <div
                            className="flex items-center justify-center py-8"
                            style={{
                              border: "1px dashed #cccccc",
                              borderRadius: 8,
                            }}
                          >
                            <p
                              className="font-medium text-[#999999]"
                              style={{ fontSize: 13 }}
                            >
                              No API keys yet — generate your first key above.
                            </p>
                          </div>
                        ) : (
                          apiKeys.map((k) => (
                            <KeyRow
                              key={k.id}
                              apiKey={k}
                              visible={!!showKey[k.id]}
                              onToggle={() =>
                                setShowKey((p) => ({ ...p, [k.id]: !p[k.id] }))
                              }
                              onCopy={() => {
                                navigator.clipboard.writeText(k.key);
                                toast.success("Copied!");
                              }}
                              onDeactivate={() =>
                                handleDeactivate(k.id, k.name)
                              }
                            />
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col w-full" style={{ gap: 48 }}>
                    <div className="flex flex-col w-full" style={{ gap: 16 }}>
                      {setupHowToTitle}
                      <div className="flex flex-col w-full" style={{ gap: 12 }}>
                        <SetupCard
                          step="01"
                          title="Generate your API Key"
                          description='Click the "Generate API Key" button to create your unique widget key.'
                        />
                        <SetupCard
                          step="02"
                          title="Add the Widget Script"
                          description="Copy this code snippet and paste it into your website's HTML, just before the closing </body> tag:"
                          code={embedCode}
                        />
                        <SetupCard
                          step="03"
                          title="Start Receiving Audits"
                          description={`The widget will appear on your site and users can trigger UX audits.\nAll results will be available in your dashboard.`}
                        />
                      </div>
                    </div>

                    <div
                      className="flex flex-col w-full pb-8"
                      style={{ gap: 16 }}
                    >
                      <div className="flex flex-col w-full" style={{ gap: 16 }}>
                        <div
                          className="flex flex-col max-w-[656px]"
                          style={{ gap: 2, lineHeight: 1.5 }}
                        >
                          <p
                            className="font-semibold text-[#1a1a1a]"
                            style={{ fontSize: 18, letterSpacing: "-0.5px" }}
                          >
                            Still not sure about the widget?
                          </p>
                          <p
                            className="font-medium text-[#1a1a1a]"
                            style={{ fontSize: 14 }}
                          >
                            Check out our comprehensive widget documentation for
                            advanced configuration options and troubleshooting.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate("/docs/widget")}
                          className="flex items-center gap-2 self-start hover:opacity-90 transition-opacity"
                          style={{
                            backgroundColor: "#6366f1",
                            border: "none",
                            borderRadius: 8,
                            padding: "10px 16px",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                          }}
                        >
                          <ExternalLink
                            className="w-4 h-4 shrink-0 text-white"
                            strokeWidth={2}
                          />
                          <span
                            className="font-bold text-white"
                            style={{ fontSize: 12 }}
                          >
                            View Widget Docs
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {valueCardsRowMain}
              </div>
            ) : (
              <>
                {valueCardsRowWide}

                <div
                  className="mx-auto flex w-full max-w-[1440px] flex-col px-4 sm:px-8 lg:px-[200px]"
                  style={{ gap: 64 }}
                >
                  <div className="flex w-full flex-col" style={{ gap: 16 }}>
                    {setupHowToTitle}
                    <div className="flex w-full flex-col" style={{ gap: 12 }}>
                      <SetupCard
                        step="01"
                        title="Generate your API Key"
                        description='Click the "Generate API Key" button below to create your unique widget key.'
                      />
                      <SetupCard
                        step="02"
                        title="Add the Widget Script"
                        description="Copy this code snippet and paste it into your website's HTML, just before the closing </body> tag:"
                        code={embedCode}
                      />
                      <SetupCard
                        step="03"
                        title="Start Receiving Audits"
                        description={`The widget will appear on your site and users can trigger UX audits.\nAll results will be available in your dashboard.`}
                      />
                    </div>
                  </div>

                  {/* Same column width as setup cards (1440 + gutters), not 1046 */}
                  <div className="flex w-full flex-col">
                    <div
                      className="flex w-full flex-col"
                      style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid rgba(0,0,0,0.2)",
                        borderRadius: 12,
                        padding: 32,
                      }}
                    >
                      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                        <div className="flex flex-col" style={{ gap: 4 }}>
                          <h2
                            className="font-bold text-[#1a1a1a] capitalize"
                            style={{
                              fontSize: 20,
                              letterSpacing: "-0.5px",
                              lineHeight: "normal",
                            }}
                          >
                            Widget API Keys
                          </h2>
                          <p
                            className="font-medium text-black"
                            style={{
                              fontSize: 16,
                              letterSpacing: "-0.4px",
                              lineHeight: "normal",
                            }}
                          >
                            Embed our audit tool directly into your website
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleGenerateKey}
                          className="flex shrink-0 items-center justify-center hover:opacity-90 transition-opacity sm:self-start"
                          style={{
                            gap: 8,
                            backgroundColor: "#6366f1",
                            border: "1px solid rgba(0,0,0,0.1)",
                            borderRadius: 12,
                            padding: 12,
                          }}
                        >
                          <Plus
                            className="w-5 h-5 text-white"
                            strokeWidth={2.5}
                          />
                          <span
                            className="whitespace-nowrap font-bold text-white"
                            style={{ fontSize: 16 }}
                          >
                            Generate API Key
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="w-full bg-[#f5f5f5] pt-10 md:pt-14 lg:pt-20">
          <Footer />
        </div>
      </div>

      {/* Generate key modal */}
      <GenerateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmGenerate}
        isGenerating={isGenerating}
      />
    </>
  );
};

export default APIKeysPage;
