import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  ExternalLink,
  Loader2,
  Pencil,
  Check,
  X,
  Image as ImageIcon,
  Plus,
} from "lucide-react";
import {
  getUserAudits,
  extractUrl,
  extractCompetitorUrl,
  UserAudit,
  updateAudit,
} from "../services/userAuditsService";
import { getUserAPIKeys, APIKey } from "../services/apiKeysService";
import SiteLogo from "../components/SiteLogo";
import { WhiteLabelModal } from "../components/WhiteLabelModal";
import { toast } from "react-hot-toast";

interface DisplayAudit {
  id: string;
  url: string;
  competitorUrl?: string | null;
  createdAt: string;
  status: "completed" | "processing" | "failed" | "pending";
  score?: number;
  screenshotUrl?: string;
  auditMode: "standard" | "competitor";
  inputData: any;
}

const formatAuditDate = (iso: string) => {
  const d = new Date(iso);
  const day = d.getDate();
  const mon = d.toLocaleString("en-GB", { month: "short" }).toUpperCase();
  const year = d.getFullYear();
  return `${day} ${mon} ${year}`;
};

const DashboardPage: React.FC = () => {
  const [allAudits, setAllAudits] = useState<UserAudit[]>([]);
  const [filteredAudits, setFilteredAudits] = useState<DisplayAudit[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "direct" | string
  >("all");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "standard" | "competitor"
  >("all");
  const [loading, setLoading] = useState(true);
  const [editingAuditId, setEditingAuditId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [logoEditingAudit, setLogoEditingAudit] = useState<{
    id: string;
    initialLogo: string | null;
  } | null>(null);
  const navigate = useNavigate();
  const activeApiKeys = apiKeys.filter((apiKey) => apiKey.isActive);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userAudits, apiKeysResult] = await Promise.all([
          getUserAudits(),
          getUserAPIKeys(),
        ]);

        setAllAudits(userAudits);

        if (apiKeysResult.success && apiKeysResult.apiKeys) {
          setApiKeys(apiKeysResult.apiKeys);
        }
      } catch (error) {
        console.error("[DashboardPage] Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const displayAudits: DisplayAudit[] = allAudits
      .filter((audit: UserAudit) => {
        const status = audit.status?.toLowerCase();
        if (status !== "completed") return false;

        let matchesKey = true;
        if (selectedFilter === "all") matchesKey = true;
        else if (selectedFilter === "direct") matchesKey = !audit.api_key_id;
        else matchesKey = audit.api_key_id === selectedFilter;

        let matchesType = true;
        const auditMode = Array.isArray(audit.input_data)
          ? "standard"
          : audit.input_data.auditMode || "standard";
        if (typeFilter !== "all") {
          matchesType = auditMode === typeFilter;
        }

        return matchesKey && matchesType;
      })
      .map((audit: UserAudit) => {
        const url = extractUrl(audit.input_data);
        const competitorUrl = extractCompetitorUrl(audit.input_data);
        const auditMode = Array.isArray(audit.input_data)
          ? "standard"
          : audit.input_data.auditMode || "standard";

        return {
          id: audit.id,
          url: url,
          competitorUrl: competitorUrl,
          createdAt: audit.created_at,
          status: (audit.status?.toLowerCase() || "pending") as any,
          score: undefined,
          screenshotUrl: undefined,
          auditMode: auditMode,
          inputData: audit.input_data,
        };
      });

    setFilteredAudits(displayAudits);
  }, [allAudits, selectedFilter, typeFilter]);

  const getSafeHostname = (urlStr: string) => {
    if (
      !urlStr ||
      urlStr === "Manual Upload" ||
      urlStr === "Unknown" ||
      urlStr === "Uploaded Image"
    ) {
      return urlStr;
    }
    let hostname = "";
    try {
      hostname = new URL(urlStr).hostname;
      hostname = hostname.replace(/^www\./, "");
    } catch (e) {
      hostname = urlStr
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0];
    }

    if (hostname && hostname.length > 0) {
      return hostname.charAt(0).toUpperCase() + hostname.slice(1);
    }
    return hostname;
  };

  const getDisplayUrl = (urlStr: string) => {
    if (
      !urlStr ||
      urlStr === "Manual Upload" ||
      urlStr === "Unknown" ||
      urlStr === "Uploaded Image"
    ) {
      return urlStr;
    }
    return urlStr
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "");
  };

  const getDisplaySubtitle = (urlStr: string, audit?: DisplayAudit) => {
    if (
      !urlStr ||
      urlStr === "Manual Upload" ||
      urlStr === "Unknown" ||
      urlStr === "Uploaded Image"
    ) {
      if (audit) {
        const fileName = getAuditFileName(urlStr, audit);
        if (fileName) return fileName;
      }
      return "Uploaded Screenshot";
    }
    return urlStr;
  };

  const getAuditFileName = (urlStr: string, audit: DisplayAudit) => {
    if (
      !urlStr ||
      urlStr === "Manual Upload" ||
      urlStr === "Unknown" ||
      urlStr === "Uploaded Image"
    ) {
      if (audit?.inputData) {
        const inputs = Array.isArray(audit.inputData)
          ? audit.inputData
          : audit.inputData.inputs;
        if (inputs && inputs.length > 0) {
          const uploadInput = inputs.find((i: any) => i.type === "upload");
          if (uploadInput?.fileName) return uploadInput.fileName;
        }
      }
    }
    return null;
  };

  const cardTitle = (audit: DisplayAudit) => {
    const primary = audit.inputData?.customName || getSafeHostname(audit.url);
    if (audit.competitorUrl) {
      const secondary = getSafeHostname(audit.competitorUrl);
      return `${primary} vs ${secondary}`;
    }
    return primary;
  };

  useEffect(() => {
    if (
      selectedFilter !== "all" &&
      selectedFilter !== "direct" &&
      !activeApiKeys.some((apiKey) => apiKey.id === selectedFilter)
    ) {
      setSelectedFilter("all");
    }
  }, [activeApiKeys, selectedFilter]);

  /** Pills: single-line friendly padding, full pill radius, warm yellow active */
  const filterChipClass = (active: boolean) =>
    `inline-flex shrink-0 items-center justify-center rounded-[8px] border border-black px-5 py-2.5 text-sm font-semibold text-[#1a1a1a] transition-colors whitespace-nowrap ${active ? "bg-[#f2d36b]" : "bg-white hover:bg-neutral-50"}`;

  const getAuditTypeBadge = (mode: string) => {
    if (mode === "competitor") {
      return (
        <span className="inline-flex items-center justify-center rounded-[22px] bg-[#f0e7fc] px-3 py-1.5 text-sm font-semibold tracking-[-0.35px] text-[#4b198d] uppercase">
          Competitor
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center rounded-[22px] bg-[#e6eff5] px-3 py-1.5 text-sm font-semibold tracking-[-0.35px] text-[#00508e] uppercase">
        Standard
      </span>
    );
  };

  const handleRename = async (auditId: string) => {
    if (!editingName.trim()) return;
    const success = await updateAudit(auditId, {
      customName: editingName.trim(),
    });
    if (success) {
      toast.success("Audit renamed successfully");
      setAllAudits((prev) =>
        prev.map((a) => {
          if (a.id !== auditId) return a;
          const inputData = a.input_data;
          const newInputData = Array.isArray(inputData)
            ? { inputs: inputData, customName: editingName.trim() }
            : { ...(inputData as any), customName: editingName.trim() };
          return { ...a, input_data: newInputData };
        }),
      );
      setEditingAuditId(null);
    } else {
      toast.error("Failed to rename audit");
    }
  };

  const handleUpdateFavicon = async (logoData: string) => {
    if (!logoEditingAudit) return;

    const success = await updateAudit(logoEditingAudit.id, {
      customFavicon: logoData,
    });
    if (success) {
      toast.success("Logo updated successfully");
      setAllAudits((prev) =>
        prev.map((a) => {
          if (a.id !== logoEditingAudit.id) return a;
          const inputData = a.input_data;
          const newInputData = Array.isArray(inputData)
            ? { inputs: inputData, customFavicon: logoData }
            : { ...(inputData as any), customFavicon: logoData };
          return { ...a, input_data: newInputData };
        }),
      );
    } else {
      toast.error("Failed to update logo");
    }
    setLogoEditingAudit(null);
  };

  const isUploadLike = (u: string) =>
    u === "Manual Upload" || u === "Unknown" || u === "Uploaded Image";

  const hrefIfRealUrl = (urlStr: string) =>
    isUploadLike(urlStr) ? null : urlStr;

  return (
    <div className="w-full font-['DM_Sans']">
      <div className="mx-auto w-full px-4 py-10 sm:px-6 lg:px-8">
        {/* Title + CTA */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-[26px] font-bold capitalize leading-[1.15] tracking-[-0.04em] text-[#1a1a1a] sm:text-[30px] md:text-[36px] lg:text-[40px] lg:tracking-[-1px]">
              My Assessments
            </h1>
            <p className="mt-1 text-base font-medium tracking-[-0.35px] text-black sm:text-lg md:text-xl md:tracking-[-0.5px]">
              Your UX Scores, all in one place
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex shrink-0 items-center justify-center gap-1 rounded-lg bg-brand px-6 py-3 text-base font-bold text-white transition-opacity hover:opacity-95"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" aria-hidden />
            New Assessment
          </Link>
        </div>

        {/* Filters: both rows single-line (nowrap); source scrolls on small viewports */}
        <div className="mb-10 flex flex-col gap-8 lg:grid lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start lg:gap-x-16 xl:gap-x-20">
          <div className="flex min-w-0 flex-col gap-3">
            <p className="text-base font-bold tracking-[-0.4px] text-black">
              Assessment Type
            </p>
            <div className="flex min-w-0 flex-nowrap items-center gap-2.5 overflow-x-auto pb-0.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setTypeFilter("all")}
                className={filterChipClass(typeFilter === "all")}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("standard")}
                className={filterChipClass(typeFilter === "standard")}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("competitor")}
                className={filterChipClass(typeFilter === "competitor")}
              >
                Competitor
              </button>
            </div>
          </div>

          {activeApiKeys.length > 0 && (
            <div className="flex min-w-0 flex-col gap-3">
              <p className="text-base font-bold tracking-[-0.4px] text-black">
                Assessment source
              </p>
              <div className="-mx-1 flex min-w-0 flex-nowrap items-center gap-2.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:thin] sm:gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedFilter("all")}
                  className={filterChipClass(selectedFilter === "all")}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter("direct")}
                  className={filterChipClass(selectedFilter === "direct")}
                >
                  Platform
                </button>
                {activeApiKeys.map((apiKey) => (
                  <button
                    key={apiKey.id}
                    type="button"
                    onClick={() => setSelectedFilter(apiKey.id)}
                    className={filterChipClass(selectedFilter === apiKey.id)}
                  >
                    API: {apiKey.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <span className="ml-3 font-semibold text-[#666]">
              Loading your assessments...
            </span>
          </div>
        )}

        {!loading && filteredAudits.length === 0 && (
          <div className="py-24 text-center">
            <FileText className="mx-auto mb-4 h-16 w-16 text-[#ccc]" />
            <h3 className="mb-2 text-xl font-bold text-[#1a1a1a]">
              No assessments yet
            </h3>
            <p className="mb-6 text-[#666]">
              Get started by creating your first UX audit
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-base font-bold text-white hover:opacity-95"
            >
              Create First Assessment
            </Link>
          </div>
        )}

        {!loading && filteredAudits.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAudits.map((audit) => (
              <div
                key={audit.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (audit.status === "completed")
                    navigate(`/report/${audit.id}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (audit.status === "completed")
                      navigate(`/report/${audit.id}`);
                  }
                }}
                className="group flex cursor-pointer flex-col gap-6 overflow-hidden rounded-xl border border-[#ccc] bg-white p-4 transition-shadow hover:shadow-md"
              >
                {/* Preview */}
                <div className="relative h-[220px] shrink-0 rounded-lg bg-[#f0f0f0] p-2.5">
                  {audit.competitorUrl ? (
                    <div className="flex h-full items-center justify-between gap-4 px-8 md:px-12">
                      <div className="flex flex-1 items-center justify-center">
                        <SiteLogo
                          domain={audit.url}
                          size="small"
                          className="h-16! w-16! shadow-none"
                          customIcon={
                            audit.inputData?.customFavicon ||
                            (isUploadLike(audit.url)
                              ? audit.inputData?.whiteLabelLogo
                              : null)
                          }
                        />
                      </div>
                      <div
                        className="h-[92px] w-px shrink-0 bg-[#ccc]"
                        aria-hidden
                      />
                      <div className="flex flex-1 items-center justify-center">
                        <SiteLogo
                          domain={audit.competitorUrl}
                          size="small"
                          className="h-16! w-16! shadow-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative flex h-full items-center justify-center">
                      <SiteLogo
                        domain={audit.url}
                        size="large"
                        className="shadow-none"
                        customIcon={
                          audit.inputData?.customFavicon ||
                          (isUploadLike(audit.url)
                            ? audit.inputData?.whiteLabelLogo
                            : null)
                        }
                      />
                      {isUploadLike(audit.url) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLogoEditingAudit({
                              id: audit.id,
                              initialLogo:
                                audit.inputData?.customFavicon ||
                                audit.inputData?.whiteLabelLogo ||
                                null,
                            });
                          }}
                          className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <ImageIcon className="h-8 w-8" />
                        </button>
                      )}
                    </div>
                  )}
                  {audit.score != null && (
                    <div className="absolute bottom-3 right-3 rounded-full border border-[#ccc] bg-white px-3 py-1 text-sm font-bold text-[#1a1a1a]">
                      {audit.score}%
                    </div>
                  )}
                </div>

                <div
                  className="flex min-h-22 flex-col gap-2"
                  onMouseEnter={async () => {
                    try {
                      const { getAuditJob } =
                        await import("../services/auditStorage");
                      getAuditJob(audit.id);
                    } catch (e) {
                      /* prefetch */
                    }
                  }}
                >
                  {editingAuditId === audit.id ? (
                    <div
                      className="flex w-full items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full rounded-lg border-2 border-brand px-2 py-1.5 text-lg font-bold text-[#1a1a1a] outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(audit.id);
                          if (e.key === "Escape") setEditingAuditId(null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRename(audit.id)}
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingAuditId(null)}
                        className="text-rose-600 hover:text-rose-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex min-w-0 items-start gap-1">
                      <h3 className="line-clamp-2 text-lg font-bold leading-normal tracking-[-0.45px] text-[#1a1a1a]">
                        {cardTitle(audit)}
                      </h3>
                      {isUploadLike(audit.url) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAuditId(audit.id);
                            setEditingName(
                              audit.inputData?.customName || "Manual Upload",
                            );
                          }}
                          className="shrink-0 p-1 text-[#999] opacity-0 transition-opacity group-hover:opacity-100 hover:text-brand"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {!audit.competitorUrl && !isUploadLike(audit.url) && (
                        <a
                          href={audit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 text-[#999] opacity-0 transition-opacity group-hover:opacity-100 hover:text-brand"
                          title="Visit Website"
                        >
                          <ExternalLink className="ml-0.5 h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}

                  {audit.competitorUrl ? (
                    <div className="flex flex-col gap-1 font-light text-xs tracking-[-0.3px] text-[#999]">
                      {hrefIfRealUrl(audit.url) ? (
                        <a
                          href={hrefIfRealUrl(audit.url)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="line-clamp-2 break-all underline decoration-solid hover:text-brand"
                        >
                          {getDisplaySubtitle(audit.url, audit)}
                        </a>
                      ) : (
                        <span
                          className={`line-clamp-2 break-all ${isUploadLike(audit.url) ? "font-mono" : ""}`}
                        >
                          {getDisplaySubtitle(audit.url, audit)}
                        </span>
                      )}
                      {hrefIfRealUrl(audit.competitorUrl) ? (
                        <a
                          href={hrefIfRealUrl(audit.competitorUrl)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="line-clamp-2 break-all underline decoration-solid hover:text-brand"
                        >
                          {getDisplaySubtitle(audit.competitorUrl, audit)}
                        </a>
                      ) : (
                        <span
                          className={`line-clamp-2 break-all ${isUploadLike(audit.competitorUrl) ? "font-mono" : ""}`}
                        >
                          {getDisplaySubtitle(audit.competitorUrl, audit)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="min-h-10">
                      {hrefIfRealUrl(audit.url) ? (
                        <a
                          href={hrefIfRealUrl(audit.url)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="line-clamp-2 break-all font-light text-xs tracking-[-0.3px] text-[#999] underline decoration-solid hover:text-brand"
                        >
                          {getDisplayUrl(audit.url)}
                        </a>
                      ) : (
                        <p
                          className={`line-clamp-2 break-all font-light text-xs tracking-[-0.3px] text-[#999] ${isUploadLike(audit.url) ? "font-mono" : ""}`}
                          title={getDisplaySubtitle(audit.url, audit)}
                        >
                          {getDisplaySubtitle(audit.url, audit)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-[#e5e5e5] pt-4">
                  <p className="text-sm font-normal tracking-[-0.35px] text-[#999]">
                    {formatAuditDate(audit.createdAt)}
                  </p>
                  {getAuditTypeBadge(audit.auditMode)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <WhiteLabelModal
        isOpen={!!logoEditingAudit}
        onClose={() => setLogoEditingAudit(null)}
        onSave={handleUpdateFavicon}
        initialLogo={logoEditingAudit?.initialLogo || null}
        title="Update Assessment Logo"
        description="This logo will represent the project on your dashboard and in the report."
        lockAspectRatio={true}
      />
    </div>
  );
};

export default DashboardPage;
