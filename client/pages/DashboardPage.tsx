import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { getUserAudits, calculateOverallScore, extractUrl, extractCompetitorUrl, getScreenshotUrl, UserAudit } from '../services/userAuditsService';
import { getUserAPIKeys, APIKey } from '../services/apiKeysService';
import SiteLogo from '../components/SiteLogo';

interface DisplayAudit {
    id: string;
    url: string;
    competitorUrl?: string | null;
    createdAt: string;
    status: 'completed' | 'processing' | 'failed' | 'pending';
    score?: number;
    screenshotUrl?: string;
}

const DashboardPage: React.FC = () => {
    const [allAudits, setAllAudits] = useState<UserAudit[]>([]);
    const [filteredAudits, setFilteredAudits] = useState<DisplayAudit[]>([]);
    const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'direct' | string>('all'); // 'all', 'direct', or api_key_id
    const [loading, setLoading] = useState(true);

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
            .map((audit: UserAudit) => {
                const url = extractUrl(audit.input_data);
                const competitorUrl = extractCompetitorUrl(audit.input_data);

                return {
                    id: audit.id,
                    url: url,
                    competitorUrl: competitorUrl,
                    createdAt: audit.created_at,
                    status: audit.status as any,
                    // Score and Screenshot are null since we don't fetch report_data in the list
                    score: undefined,
                    screenshotUrl: undefined
                };
            });

        setFilteredAudits(displayAudits);
    }, [allAudits]);

    const getSafeHostname = (urlStr: string) => {
        if (!urlStr || urlStr === 'Manual Upload' || urlStr === 'Unknown' || urlStr === 'Uploaded Image') {
            return urlStr;
        }
        try {
            return new URL(urlStr).hostname;
        } catch (e) {
            return urlStr;
        }
    };

    const getStatusBadge = (status: string) => {

        const styles = {
            completed: 'bg-green-100 text-green-800 border-green-200',
            processing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            pending: 'bg-blue-100 text-blue-800 border-blue-200',
            failed: 'bg-red-100 text-red-800 border-red-200'
        };
        const labels = {
            completed: 'Completed',
            processing: 'Processing',
            pending: 'Pending',
            failed: 'Failed'
        };
        return (
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
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

                {/* Filter Chips - Only show if user has API keys */}
                {apiKeys.length > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2">
                        {/* All Audits */}
                        <button
                            onClick={() => setSelectedFilter('all')}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border-2 border-border-main ${selectedFilter === 'all'
                                ? 'bg-brand text-white shadow-neo'
                                : 'bg-white text-text-primary hover:bg-gray-50'
                                }`}
                        >
                            All Audits
                        </button>

                        {/* Direct Audits */}
                        <button
                            onClick={() => setSelectedFilter('direct')}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border-2 border-border-main ${selectedFilter === 'direct'
                                ? 'bg-brand text-white shadow-neo'
                                : 'bg-white text-text-primary hover:bg-gray-50'
                                }`}
                        >
                            Direct
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
                                className="bg-white rounded-lg border-2 border-border-main shadow-neo hover:shadow-neo-hover transition-all cursor-pointer group flex flex-col"
                            >
                                {/* Logo Preview Area */}
                                <div className="h-48 bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] rounded-t-lg border-b-2 border-border-main flex items-center justify-center relative overflow-hidden p-6">
                                    {audit.competitorUrl ? (
                                        // Competitor: Split layout with divider
                                        <div className="flex items-center justify-center w-full h-full gap-4">
                                            <div className="flex-1 flex items-center justify-center">
                                                <SiteLogo domain={audit.url} size="medium" />
                                            </div>
                                            <div className="w-px h-24 bg-border-main"></div>
                                            <div className="flex-1 flex items-center justify-center">
                                                <SiteLogo domain={audit.competitorUrl} size="medium" />
                                            </div>
                                        </div>
                                    ) : (
                                        // Standard: Full width logo
                                        <SiteLogo domain={audit.url} size="large" />
                                    )}
                                    {audit.score && (
                                        <div className="absolute bottom-3 right-3 bg-white px-3 py-1 rounded-full border-2 border-border-main shadow-sm">
                                            <span className="text-sm font-bold text-text-primary">{audit.score}%</span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Content */}
                                <div
                                    className="p-4 flex flex-col flex-1"
                                    onMouseEnter={async () => {
                                        // Speculative pre-fetch: prime the cache while user hovers
                                        try {
                                            const { getAuditJob } = await import('../services/auditStorage');
                                            getAuditJob(audit.id);
                                        } catch (e) { }
                                    }}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-text-primary truncate group-hover:text-brand transition-colors">
                                                {getSafeHostname(audit.url)}
                                            </h3>
                                            {audit.competitorUrl && (
                                                <h3 className="text-lg font-bold text-text-primary truncate group-hover:text-brand transition-colors mt-1">
                                                    vs {getSafeHostname(audit.competitorUrl)}
                                                </h3>
                                            )}
                                        </div>
                                        {audit.url !== 'Manual Upload' && audit.url !== 'Unknown' && (
                                            <a
                                                href={audit.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="shrink-0 ml-2 text-text-secondary hover:text-brand transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>

                                    {/* URL section with fixed minimum height for alignment */}
                                    <div className="mb-3" style={{ minHeight: '48px' }}>
                                        <p className="text-sm text-text-secondary truncate">{audit.url}</p>
                                        {audit.competitorUrl && (
                                            <p className="text-sm text-text-secondary truncate mt-1">{audit.competitorUrl}</p>
                                        )}
                                    </div>

                                    {/* Spacer to push date/status/button to consistent position */}
                                    <div className="flex-grow"></div>

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center text-xs text-text-secondary">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(audit.createdAt).toLocaleDateString()}
                                        </div>
                                        {getStatusBadge(audit.status)}
                                    </div>

                                    {/* Action Button */}
                                    {audit.status === 'completed' && (
                                        <Link
                                            to={`/report/${audit.id}`}
                                            className="block w-full px-4 py-2 bg-text-primary text-white text-sm font-semibold text-center rounded-lg hover:bg-[#374151] transition-colors"
                                        >
                                            View Report
                                        </Link>
                                    )}
                                    {audit.status === 'processing' && (
                                        <Link
                                            to={`/analysis/${audit.id}`}
                                            className="block w-full px-4 py-2 bg-yellow-600 text-white text-sm font-semibold text-center rounded-lg hover:bg-yellow-700 transition-colors"
                                        >
                                            View Progress
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};

export default DashboardPage;
