import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Calendar, ExternalLink, Loader2, Pencil, Check, X, Image as ImageIcon } from 'lucide-react';
import { getUserAudits, calculateOverallScore, extractUrl, extractCompetitorUrl, getScreenshotUrl, UserAudit, updateAudit } from '../services/userAuditsService';
import { getUserAPIKeys, APIKey } from '../services/apiKeysService';
import SiteLogo from '../components/SiteLogo';
import { WhiteLabelModal } from '../components/WhiteLabelModal';
import { toast } from 'react-hot-toast';

interface DisplayAudit {
    id: string;
    url: string;
    competitorUrl?: string | null;
    createdAt: string;
    status: 'completed' | 'processing' | 'failed' | 'pending';
    score?: number;
    screenshotUrl?: string;
    auditMode: 'standard' | 'competitor';
    inputData: any;
}

const DashboardPage: React.FC = () => {
    const [allAudits, setAllAudits] = useState<UserAudit[]>([]);
    const [filteredAudits, setFilteredAudits] = useState<DisplayAudit[]>([]);
    const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'direct' | string>('all'); // 'all', 'direct', or api_key_id
    const [typeFilter, setTypeFilter] = useState<'all' | 'standard' | 'competitor'>('all');
    const [loading, setLoading] = useState(true);
    const [editingAuditId, setEditingAuditId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [logoEditingAudit, setLogoEditingAudit] = useState<{ id: string, initialLogo: string | null } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch audits and API keys in parallel for faster loading
                const [userAudits, apiKeysResult] = await Promise.all([
                    getUserAudits(),
                    getUserAPIKeys()
                ]);

                setAllAudits(userAudits);

                if (apiKeysResult.success && apiKeysResult.apiKeys) {
                    setApiKeys(apiKeysResult.apiKeys.filter(k => k.isActive));
                }
            } catch (error) {
                console.error('[DashboardPage] Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Map audits from backend for display
    useEffect(() => {
        const displayAudits: DisplayAudit[] = allAudits
            .filter((audit: UserAudit) => {
                const status = audit.status?.toLowerCase();

                // Only show completed reports as requested
                if (status !== 'completed') return false;

                // Handle API Key filtering
                let matchesKey = true;
                if (selectedFilter === 'all') matchesKey = true;
                else if (selectedFilter === 'direct') matchesKey = !audit.api_key_id;
                else matchesKey = audit.api_key_id === selectedFilter;

                // Handle Type filtering
                let matchesType = true;
                const auditMode = Array.isArray(audit.input_data) ? 'standard' : (audit.input_data.auditMode || 'standard');
                if (typeFilter !== 'all') {
                    matchesType = auditMode === typeFilter;
                }

                return matchesKey && matchesType;
            })
            .map((audit: UserAudit) => {
                const url = extractUrl(audit.input_data);
                const competitorUrl = extractCompetitorUrl(audit.input_data);
                const auditMode = Array.isArray(audit.input_data) ? 'standard' : (audit.input_data.auditMode || 'standard');

                return {
                    id: audit.id,
                    url: url,
                    competitorUrl: competitorUrl,
                    createdAt: audit.created_at,
                    status: (audit.status?.toLowerCase() || 'pending') as any,
                    score: undefined,
                    screenshotUrl: undefined,
                    auditMode: auditMode,
                    inputData: audit.input_data
                };
            });

        setFilteredAudits(displayAudits);
    }, [allAudits, selectedFilter, typeFilter]);

    const getSafeHostname = (urlStr: string) => {
        if (!urlStr || urlStr === 'Manual Upload' || urlStr === 'Unknown' || urlStr === 'Uploaded Image') {
            return urlStr;
        }
        let hostname = '';
        try {
            hostname = new URL(urlStr).hostname;
            hostname = hostname.replace(/^www\./, '');
        } catch (e) {
            hostname = urlStr.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        }

        if (hostname && hostname.length > 0) {
            return hostname.charAt(0).toUpperCase() + hostname.slice(1);
        }
        return hostname;
    };

    const getDisplayUrl = (urlStr: string) => {
        if (!urlStr || urlStr === 'Manual Upload' || urlStr === 'Unknown' || urlStr === 'Uploaded Image') {
            return urlStr;
        }
        return urlStr.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
    };

    const getDisplaySubtitle = (urlStr: string, audit?: DisplayAudit) => {
        if (!urlStr || urlStr === 'Manual Upload' || urlStr === 'Unknown' || urlStr === 'Uploaded Image') {
            if (audit) {
                const fileName = getAuditFileName(urlStr, audit);
                if (fileName) return fileName;
            }
            return 'Uploaded Screenshot';
        }
        return urlStr;
    };

    const getAuditFileName = (urlStr: string, audit: DisplayAudit) => {
        if (!urlStr || urlStr === 'Manual Upload' || urlStr === 'Unknown' || urlStr === 'Uploaded Image') {
            if (audit?.inputData) {
                const inputs = Array.isArray(audit.inputData) ? audit.inputData : audit.inputData.inputs;
                if (inputs && inputs.length > 0) {
                    const uploadInput = inputs.find((i: any) => i.type === 'upload');
                    if (uploadInput?.fileName) return uploadInput.fileName;
                }
            }
        }
        return null;
    };

    const getAuditTypeBadge = (mode: string) => {
        const styles = {
            standard: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            competitor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
        };
        const labels = {
            standard: 'Standard',
            competitor: 'Competitor'
        };
        return (
            <span className={`px-3 py-1 text-sm font-semibold rounded-full border uppercase tracking-wider ${styles[mode as keyof typeof styles]}`}>
                {labels[mode as keyof typeof labels]}
            </span>
        );
    };

    const handleRename = async (auditId: string) => {
        if (!editingName.trim()) return;
        const success = await updateAudit(auditId, { customName: editingName.trim() });
        if (success) {
            toast.success('Audit renamed successfully');
            setAllAudits(prev => prev.map(a => {
                if (a.id !== auditId) return a;
                const inputData = a.input_data;
                const newInputData = Array.isArray(inputData)
                    ? { inputs: inputData, customName: editingName.trim() }
                    : { ...(inputData as any), customName: editingName.trim() };
                return { ...a, input_data: newInputData };
            }));
            setEditingAuditId(null);
        } else {
            toast.error('Failed to rename audit');
        }
    };

    const handleUpdateFavicon = async (logoData: string) => {
        if (!logoEditingAudit) return;

        const success = await updateAudit(logoEditingAudit.id, { customFavicon: logoData });
        if (success) {
            toast.success('Logo updated successfully');
            setAllAudits(prev => prev.map(a => {
                if (a.id !== logoEditingAudit.id) return a;
                const inputData = a.input_data;
                const newInputData = Array.isArray(inputData)
                    ? { inputs: inputData, customFavicon: logoData }
                    : { ...(inputData as any), customFavicon: logoData };
                return { ...a, input_data: newInputData };
            }));
        } else {
            toast.error('Failed to update logo');
        }
        setLogoEditingAudit(null);
    };

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-page-bg font-['DM_Sans']">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-text-primary mb-2">My Assessments</h1>
                        <p className="text-text-secondary">View and manage your UX audits</p>
                    </div>
                    <Link
                        to="/"
                        className="px-6 py-3 bg-brand text-white font-semibold rounded-lg hover:bg-brand-hover transition-colors border-2 border-border-main shadow-neo hover:shadow-neo-hover active:shadow-none active:translate-x-px active:translate-y-px"
                    >
                        + New Assessment
                    </Link>
                </div>

                {/* Filter Chips */}
                <div className="mb-8 space-y-4">
                    {/* Audit Type Filter */}
                    <div className="flex flex-wrap gap-2">
                        <span className="w-full text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Assessment Type</span>
                        {['all', 'standard', 'competitor'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type as any)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border-2 border-border-main ${typeFilter === type
                                    ? 'bg-brand text-white shadow-neo'
                                    : 'bg-white text-text-primary hover:bg-gray-50'
                                    }`}
                            >
                                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* API Key Filter - Only show if user has API keys */}
                    {apiKeys.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <span className="w-full text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Source Filter</span>
                            {/* All Audits */}
                            <button
                                onClick={() => setSelectedFilter('all')}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border-2 border-border-main ${selectedFilter === 'all'
                                    ? 'bg-brand text-white shadow-neo'
                                    : 'bg-white text-text-primary hover:bg-gray-50'
                                    }`}
                            >
                                All Sources
                            </button>

                            {/* Direct Audits */}
                            <button
                                onClick={() => setSelectedFilter('direct')}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border-2 border-border-main ${selectedFilter === 'direct'
                                    ? 'bg-brand text-white shadow-neo'
                                    : 'bg-white text-text-primary hover:bg-gray-50'
                                    }`}
                            >
                                Web Direct
                            </button>

                            {/* API Key Filters */}
                            {apiKeys.map(apiKey => (
                                <button
                                    key={apiKey.id}
                                    onClick={() => setSelectedFilter(apiKey.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border-2 border-border-main ${selectedFilter === apiKey.id
                                        ? 'bg-brand text-white shadow-neo'
                                        : 'bg-white text-text-primary hover:bg-gray-50'
                                        }`}
                                >
                                    {apiKey.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-brand" />
                        <span className="ml-3 text-text-secondary font-semibold">Loading your assessments...</span>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredAudits.length === 0 && (
                    <div className="text-center py-20">
                        <FileText className="w-16 h-16 text-[#CBD5E1] mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-text-primary mb-2">No assessments yet</h3>
                        <p className="text-text-secondary mb-6">Get started by creating your first UX audit</p>
                        <Link
                            to="/"
                            className="inline-block px-6 py-3 bg-brand text-white font-semibold rounded-lg hover:bg-brand-hover transition-colors"
                        >
                            Create First Assessment
                        </Link>
                    </div>
                )}

                {/* Assessments Grid */}
                {!loading && filteredAudits.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAudits.map((audit) => (
                            <div
                                key={audit.id}
                                onClick={() => {
                                    if (audit.status === 'completed') {
                                        navigate(`/report/${audit.id}`);
                                    }
                                }}
                                className="bg-white rounded-lg border-2 border-border-main shadow-neo hover:shadow-neo-hover transition-all cursor-pointer group flex flex-col overflow-hidden"
                            >
                                {/* Logo Preview Area */}
                                <div className="h-48 bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] rounded-t-lg border-b-2 border-border-main flex items-center justify-center relative overflow-hidden p-6">
                                    {audit.competitorUrl ? (
                                        <div className="flex items-center justify-center w-full h-full gap-4">
                                            <div className="flex-1 flex items-center justify-center">
                                                <SiteLogo
                                                    domain={audit.url}
                                                    size="medium"
                                                    customIcon={audit.inputData?.customFavicon || (audit.url === 'Manual Upload' || audit.url === 'Uploaded Image' ? audit.inputData?.whiteLabelLogo : null)}
                                                />
                                            </div>
                                            <div className="w-px h-24 bg-border-main"></div>
                                            <div className="flex-1 flex items-center justify-center">
                                                <SiteLogo domain={audit.competitorUrl} size="medium" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative group/logo">
                                            <SiteLogo
                                                domain={audit.url}
                                                size="large"
                                                customIcon={audit.inputData?.customFavicon || (audit.url === 'Manual Upload' || audit.url === 'Uploaded Image' ? audit.inputData?.whiteLabelLogo : null)}
                                            />
                                            {(audit.url === 'Manual Upload' || audit.url === 'Unknown' || audit.url === 'Uploaded Image') && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setLogoEditingAudit({
                                                            id: audit.id,
                                                            initialLogo: audit.inputData?.customFavicon || audit.inputData?.whiteLabelLogo || null
                                                        });
                                                    }}
                                                    className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity rounded-lg"
                                                >
                                                    <ImageIcon className="w-8 h-8" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    {audit.score && (
                                        <div className="absolute bottom-3 right-3 bg-white px-3 py-1 rounded-full border-2 border-border-main shadow-sm">
                                            <span className="text-sm font-bold text-text-primary">{audit.score}%</span>
                                        </div>
                                    )}
                                </div>

                                <div
                                    className="p-5 flex flex-col flex-1 relative"
                                    onMouseEnter={async () => {
                                        try {
                                            const { getAuditJob } = await import('../services/auditStorage');
                                            getAuditJob(audit.id);
                                        } catch (e) { }
                                    }}
                                >
                                    {/* Content removed from here and moved to bottom */}
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-4 min-w-0">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            {editingAuditId === audit.id ? (
                                                <div className="flex items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="text"
                                                        value={editingName}
                                                        onChange={(e) => setEditingName(e.target.value)}
                                                        className="px-2 py-1 text-lg font-bold border-2 border-brand rounded outline-none w-full"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleRename(audit.id);
                                                            if (e.key === 'Escape') setEditingAuditId(null);
                                                        }}
                                                    />
                                                    <button onClick={() => handleRename(audit.id)} className="text-emerald-600 hover:text-emerald-700">
                                                        <Check className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => setEditingAuditId(null)} className="text-rose-600 hover:text-rose-700">
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <h3 className="text-lg font-bold text-text-primary truncate group-hover:text-brand transition-colors">
                                                        {audit.inputData?.customName || getSafeHostname(audit.url)}
                                                    </h3>
                                                    {(audit.url === 'Manual Upload' || audit.url === 'Unknown' || audit.url === 'Uploaded Image') && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingAuditId(audit.id);
                                                                setEditingName(audit.inputData?.customName || 'Manual Upload');
                                                            }}
                                                            className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-brand"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                    {audit.url !== 'Manual Upload' && audit.url !== 'Unknown' && audit.url !== 'Uploaded Image' && (
                                                        <a
                                                            href={audit.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="shrink-0 text-slate-400 hover:text-brand transition-colors"
                                                            title="Visit Website"
                                                        >
                                                            <ExternalLink className="w-4 h-4 ml-0.5" />
                                                        </a>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {audit.competitorUrl && (
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-text-secondary font-bold">vs</span>
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <h3 className="text-lg font-bold text-text-primary truncate group-hover:text-brand transition-colors">
                                                        {getSafeHostname(audit.competitorUrl)}
                                                    </h3>
                                                    {audit.competitorUrl !== 'Manual Upload' && (
                                                        <a
                                                            href={audit.competitorUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="shrink-0 text-slate-400 hover:text-brand transition-colors"
                                                            title="Visit Competitor"
                                                        >
                                                            <ExternalLink className="w-4 h-4 ml-0.5" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-4 space-y-1 opacity-60">
                                        <div>
                                            <p className={`text-sm text-text-secondary line-clamp-2 break-all ${(audit.url === 'Manual Upload' || audit.url === 'Unknown' || audit.url === 'Uploaded Image') ? 'font-mono' : ''}`} title={getDisplaySubtitle(audit.url, audit)}>
                                                {getDisplaySubtitle(audit.url, audit)}
                                            </p>
                                        </div>
                                        {audit.competitorUrl && (
                                            <div>
                                                <p className={`text-sm text-text-secondary line-clamp-2 break-all ${(audit.competitorUrl === 'Manual Upload' || audit.competitorUrl === 'Unknown' || audit.competitorUrl === 'Uploaded Image') ? 'font-mono' : ''}`} title={getDisplaySubtitle(audit.competitorUrl, audit)}>
                                                    {getDisplaySubtitle(audit.competitorUrl, audit)}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center text-sm text-text-secondary font-medium uppercase tracking-wider">
                                            <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-50" />
                                            {new Date(audit.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        {getAuditTypeBadge(audit.auditMode)}
                                    </div>
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
