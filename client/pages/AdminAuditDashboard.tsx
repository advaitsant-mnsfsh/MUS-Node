import React, { useState, useEffect, useRef } from 'react';
import { adminService, AdminAudit } from '../services/adminService';
import { format } from 'date-fns';
import { Activity, Shield, Terminal, Mail, Clock, RefreshCw, Copy, Check, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminAuditDashboard: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [audits, setAudits] = useState<AdminAudit[]>([]);
    const [feedback, setFeedback] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'audits' | 'feedback'>('audits');
    const [isLoading, setIsLoading] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    // Search & Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState<'all' | 'id' | 'user'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'processing' | 'failed' | 'pending'>('all');

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        toast.success('ID copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const downloadReport = async (audit: AdminAudit) => {
        if (audit.status !== 'completed') {
            toast.error('Report is not yet completed');
            return;
        }

        setDownloadingId(audit.id);
        const loadingToast = toast.loading('Fetching report data...');

        try {
            const reportData = await adminService.fetchAuditReport(password, audit.id);
            if (!reportData) {
                throw new Error('No report data found');
            }

            const dataStr = JSON.stringify(reportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = window.URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `report_${audit.id}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.dismiss(loadingToast);
            toast.success('JSON downloaded successfully');
        } catch (err) {
            console.error('Failed to download JSON:', err);
            toast.dismiss(loadingToast);
            toast.error('Download failed / No data found');
        } finally {
            setDownloadingId(null);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '0000') {
            setIsAuthenticated(true);
            savePasswordToSession(password);
        } else {
            toast.error('Unauthorized access');
        }
    };

    const savePasswordToSession = (pass: string) => {
        sessionStorage.setItem('admin_audit_pass', pass);
    };

    const getPasswordFromSession = () => {
        return sessionStorage.getItem('admin_audit_pass');
    };

    useEffect(() => {
        const savedPass = getPasswordFromSession();
        if (savedPass === '0000') {
            setIsAuthenticated(true);
            setPassword(savedPass);
        }
    }, []);

    const fetchData = async () => {
        if (!isAuthenticated) return;
        setIsLoading(true);
        try {
            if (activeTab === 'audits') {
                const params = {
                    q: searchTerm || undefined,
                    searchType,
                    status: statusFilter === 'all' ? undefined : statusFilter
                };
                const data = await adminService.fetchAudits(password, params);
                setAudits(data);
            } else {
                const data = await adminService.fetchFeedback(password);
                setFeedback(data);
            }
            setLastRefresh(new Date());
        } catch (err) {
            console.error('Failed to fetch admin data:', err);
            toast.error('Session expired or unauthorized');
            setIsAuthenticated(false);
            sessionStorage.removeItem('admin_audit_pass');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isAuthenticated, activeTab]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isAuthenticated && activeTab === 'audits') {
            interval = setInterval(fetchData, 10000); // 10s poll for audits
        }
        return () => clearInterval(interval);
    }, [isAuthenticated, activeTab, searchTerm, searchType, statusFilter]);

    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-10 shadow-2xl">
                    <div className="flex justify-center mb-8">
                        <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
                            <Shield className="w-10 h-10 text-indigo-400" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white text-center mb-2">Admin Dashboard</h1>
                    <p className="text-slate-400 text-center mb-8">Authorised Personal Only</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider ml-1">Access Key</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-center tracking-[1em] text-2xl font-mono"
                                autoFocus
                            />
                        </div>
                        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]">
                            Enter Command Center
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200">
            {/* Header */}
            <div className="bg-slate-900/50 backdrop-blur-lg border-b border-slate-800 sticky top-0 z-50 px-8 py-5">
                <div className="flex items-center justify-between mx-auto">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-500/10 p-2.5 rounded-xl">
                                <Terminal className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">System Monitor</h2>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Live Status Updates
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/50">
                            <button
                                onClick={() => setActiveTab('audits')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'audits' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <Activity className="w-4 h-4" />
                                Audit Logs
                            </button>
                            <button
                                onClick={() => setActiveTab('feedback')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'feedback' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <Mail className="w-4 h-4" />
                                User Feedback
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-sm text-slate-500 uppercase font-medium tracking-widest mb-1">Last Sync</div>
                            <div className="text-sm font-mono text-slate-300">{format(lastRefresh, 'HH:mm:ss')}</div>
                        </div>
                        <button
                            onClick={fetchData}
                            className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl transition-all"
                        >
                            <RefreshCw className={`w-5 h-5 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar (Only for Audits) */}
            {activeTab === 'audits' && (
                <div className="bg-slate-900/30 border-b border-slate-800/50 px-8 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        {/* Search Input */}
                        <div className="flex-1 relative group">
                            <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Paste Job ID or search by Username / Email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all border-none shadow-inner"
                            />
                        </div>

                        {/* Filter Group */}
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/50 shadow-inner">
                                {(['all', 'id', 'user'] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setSearchType(type)}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${searchType === type ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {type === 'all' ? 'Global' : type === 'id' ? 'Job ID' : 'People'}
                                    </button>
                                ))}
                            </div>

                            <div className="h-6 w-px bg-slate-800 hidden lg:block" />

                            <div className="flex gap-2">
                                {(['all', 'completed', 'processing', 'failed', 'pending'] as const).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${statusFilter === status
                                            ? (status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                                                status === 'failed' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' :
                                                    status === 'processing' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30' :
                                                        status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                                                            'bg-slate-700 text-white border-slate-600')
                                            : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-700'}`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Dashboard Content */}
            <main className="p-8">
                {activeTab === 'audits' ? (
                    <div className="grid grid-cols-1 gap-6">
                        {audits.map((audit) => (
                            <div key={audit.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700/50 transition-all hover:bg-slate-900/60 group">
                                <div className="p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-4 text-sm font-mono">
                                            <span className={`px-3 py-1.5 rounded-lg border uppercase font-bold tracking-wider transition-all ${audit.audit_type === 'competitor'
                                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                                                : 'bg-slate-800 text-slate-400 border-slate-700/50'
                                                }`}>
                                                {audit.audit_type}
                                            </span>
                                            <div className="flex items-center gap-2 group/id bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-indigo-500/30 transition-all">
                                                <span className="text-slate-500">ID: {audit.id}</span>
                                                <button
                                                    onClick={() => copyToClipboard(audit.id)}
                                                    className="text-slate-600 hover:text-indigo-400 transition-colors"
                                                    title="Copy Job ID"
                                                >
                                                    {copiedId === audit.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>

                                            {/* Queue Position for Pending */}
                                            {audit.status === 'pending' && audit.queue_position && (
                                                <span className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20 font-bold animate-pulse">
                                                    #{audit.queue_position} IN QUEUE
                                                </span>
                                            )}

                                            {/* Browserless Monitor for Active */}
                                            {audit.browser_key && audit.status === 'processing' && (
                                                <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                                                    INSTANCE: B{audit.browser_key}
                                                </span>
                                            )}

                                            {/* Priority indicator if relevant */}
                                            {audit.priority !== undefined && audit.priority !== 0 && (audit.status === 'pending' || audit.status === 'processing') && (
                                                <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700/50 font-mono text-[10px]">
                                                    PRI: {audit.priority}
                                                </span>
                                            )}

                                            <span className={`px-3 py-1.5 rounded-lg border uppercase font-bold tracking-wider ${audit.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                audit.status === 'processing' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                                                    audit.status === 'failed' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                }`}>
                                                {audit.status}
                                            </span>
                                            {audit.status === 'completed' && (
                                                <button
                                                    onClick={() => downloadReport(audit)}
                                                    disabled={downloadingId === audit.id}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    title="Download Report JSON"
                                                >
                                                    <Download className={`w-3.5 h-3.5 ${downloadingId === audit.id ? 'animate-bounce' : ''}`} />
                                                    {downloadingId === audit.id ? 'FETCHING...' : 'RAW JSON'}
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-tighter">
                                            <div className="flex items-center gap-2 text-slate-500"><Clock className="w-4 h-4" /> {format(new Date(audit.created_at), 'MMM d, HH:mm')}</div>

                                            {/* Email Notifications & Opt-ins */}
                                            {audit.email_opt_in_offered && (
                                                <div className="flex items-center gap-2 text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700/50">
                                                    OFFER SENT
                                                </div>
                                            )}

                                            {audit.email_opt_in && (
                                                <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/5 px-2.5 py-1 rounded-md border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                                                    <Mail className="w-4 h-4" /> USER OPTED-IN
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* User & URL Info */}
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Primary Site / Inputs */}
                                                <div className="space-y-2">
                                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-2">
                                                        {audit.audit_type === 'competitor' ? 'Primary Site' : 'Target URL(s)'}
                                                        {audit.input_data.inputs.length > 1 && (
                                                            <span className="bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded text-[8px] font-bold">
                                                                {audit.input_data.inputs.length} PAGES
                                                            </span>
                                                        )}
                                                    </div>
                                                    <SiteDisplay inputs={audit.input_data.inputs} />
                                                </div>

                                                {/* Competitor Site (Optional) */}
                                                {audit.audit_type === 'competitor' && audit.input_data.competitor && (
                                                    <div className="space-y-2">
                                                        <div className="text-[10px] text-purple-500/70 uppercase tracking-widest font-bold">
                                                            Competitor Site
                                                        </div>
                                                        <div className="text-purple-400 break-all font-medium bg-purple-500/5 p-3 rounded-xl border border-purple-500/10 flex items-center justify-between group/comp transition-all hover:bg-purple-500/10">
                                                            <span className="truncate">{audit.input_data.competitor.url}</span>
                                                            <span className="text-[9px] bg-purple-500/20 px-1.5 py-0.5 rounded uppercase font-bold shrink-0 ml-2">
                                                                {audit.input_data.competitor.device || 'desktop'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-6 pt-2 border-t border-slate-800/50">
                                                <div>
                                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Initiator</div>
                                                    <div className="text-white font-medium">
                                                        {audit.user_name || 'Guest User'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Email Address</div>
                                                    <div className="text-slate-300">{audit.user_email || audit.opt_in_email || 'No email associated'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Live Logs Terminal */}
                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 font-bold flex items-center justify-between">
                                                <span>Recent Process Logs</span>
                                                {audit.status === 'processing' && <Activity className="w-3 h-3 text-indigo-500 animate-pulse" />}
                                            </div>
                                            <div
                                                className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 font-mono text-[11px] h-[200px] overflow-y-auto custom-scrollbar shadow-inner"
                                                ref={(el) => {
                                                    if (el) el.scrollTop = el.scrollHeight;
                                                }}
                                            >
                                                {audit.logs && audit.logs.length > 0 ? (
                                                    audit.logs.map((log, i) => {
                                                        const isLatest = i === audit.logs!.length - 1;
                                                        return (
                                                            <div key={i} className="mb-2 last:mb-0 flex gap-3">
                                                                <span className="text-slate-600 shrink-0">{format(new Date(log.created_at), 'HH:mm:ss')}</span>
                                                                <span className={isLatest ? 'text-indigo-400' : 'text-slate-400'}>
                                                                    {isLatest && <span className="mr-1 animate-pulse">›</span>}
                                                                    {log.message}
                                                                </span>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="text-slate-700 italic">Waiting for logs...</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {audits.length === 0 && !isLoading && (
                            <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
                                <div className="text-slate-500 mb-2">
                                    {searchTerm || statusFilter !== 'all'
                                        ? `No audits found matching your search criteria.`
                                        : `No active audits found in the system shadow.`}
                                </div>
                                <div className="text-sm text-slate-600">
                                    {searchTerm || statusFilter !== 'all'
                                        ? "Try adjusting your filters or search term."
                                        : "All quiet on the front lines."}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Feedback View */
                    <div className="grid grid-cols-1 gap-6">
                        {feedback.map((item, i) => (
                            <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700/50 transition-all hover:bg-slate-900/60 p-6">
                                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">{item.userEmail}</div>
                                            <div className="text-sm text-slate-500">User Report</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-slate-500 font-mono">{format(new Date(item.timestamp), 'MMM d, HH:mm:ss')}</div>
                                        <div className="mt-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-indigo-500/20">
                                            {item.teamNumber || 'No Team'}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Target Website</div>
                                        <div className="text-slate-300 text-sm truncate">{item.websiteUrl || 'Not provided'}</div>
                                    </div>
                                    <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Job ID Reference</div>
                                        <div className="text-slate-300 text-sm flex items-center justify-between">
                                            <span className="truncate">{item.jobId || 'N/A'}</span>
                                            {item.jobId && (
                                                <button onClick={() => copyToClipboard(item.jobId)} className="text-slate-600 hover:text-indigo-400 transition-colors">
                                                    {copiedId === item.jobId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-rose-500/5 p-4 rounded-2xl border border-rose-500/10">
                                    <div className="text-[10px] text-rose-500 uppercase tracking-widest font-black mb-2 flex items-center gap-2">
                                        <Activity className="w-3 h-3" /> Error Details
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                        {item.errorDetails}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {feedback.length === 0 && !isLoading && (
                            <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl text-slate-500">
                                No user feedback has been recorded yet.
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

const SiteDisplay: React.FC<{ inputs: Array<{ url: string; device?: string; customName?: string }> }> = ({ inputs }) => {
    const [showAll, setShowAll] = useState(false);

    return (
        <div className="relative">
            <div
                className={`text-indigo-400 font-medium bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10 flex items-center justify-between transition-all hover:bg-indigo-500/10 ${showAll ? 'ring-1 ring-indigo-500/30' : ''}`}
                onMouseEnter={() => inputs.length > 1 && setShowAll(true)}
                onMouseLeave={() => setShowAll(false)}
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="truncate">
                        {(inputs[0].customName || inputs[0].url) || 'UPLOADED SCREENSHOT'}
                    </span>
                    {inputs.length > 1 && (
                        <span className="bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">
                            +{inputs.length - 1}
                        </span>
                    )}
                </div>
                <span className="text-[9px] bg-indigo-500/20 px-1.5 py-0.5 rounded uppercase font-bold shrink-0 ml-2">
                    {inputs[0].device || 'desktop'}
                </span>

                {/* Popover for multiple URLs */}
                {showAll && inputs.length > 1 && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl z-[100] p-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                        {inputs.slice(1).map((input, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-800 rounded-lg group/item transition-colors">
                                <span className="text-sm text-slate-400 truncate flex-1">{input.customName || input.url}</span>
                                <span className="text-[8px] text-slate-600 bg-slate-800 px-1 py-0.5 rounded uppercase font-bold ml-2">
                                    {input.device || 'desktop'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
