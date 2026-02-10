import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGlobalAudit } from '../contexts/AuditContext';
import { Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const GlobalProgressBanner: React.FC = () => {
    const { activeAuditId, progress, status, isCompleted, isFailed, error } = useGlobalAudit();
    const navigate = useNavigate();
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(false);

    // Don't show on home page, analysis page or results page
    const isExcludedPage =
        location.pathname === '/' ||
        location.pathname.startsWith('/analysis/') ||
        location.pathname.startsWith('/report/');

    useEffect(() => {
        if (activeAuditId && !isExcludedPage) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [activeAuditId, isExcludedPage]);

    if (!isVisible || !activeAuditId) return null;

    const handleClick = () => {
        if (isCompleted) {
            navigate(`/report/${activeAuditId}`);
        } else {
            navigate(`/analysis/${activeAuditId}`);
        }
    };

    if (isFailed) {
        return (
            <div className="bg-red-50 border-b border-red-200 py-3 px-4 sm:px-6 lg:px-8 animate-in slide-in-from-top duration-300">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                            <span className="text-sm font-bold text-red-900">Assessment Failed</span>
                            <span className="text-xs text-red-700 truncate max-w-[200px] sm:max-w-md">{error || 'An unexpected error occurred'}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/analysis/${activeAuditId}`)}
                        className="flex-shrink-0 text-xs font-bold text-red-900 hover:underline flex items-center gap-1"
                    >
                        View Details <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        );
    }

    if (isCompleted) {
        return (
            <div className="bg-[#E8F5E9] border-b border-[#C8E6C9] py-3 px-4 sm:px-6 lg:px-8 animate-in slide-in-from-top duration-300">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
                        <span className="text-sm font-bold text-[#1B5E20]">Assessment Completed!</span>
                    </div>
                    <button
                        onClick={handleClick}
                        className="flex-shrink-0 text-sm font-bold text-brand hover:text-brand-hover flex items-center gap-1 underline decoration-2 underline-offset-4"
                    >
                        Check it Out <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#FFF4E5] border-b border-[#FFE0BD] py-3 px-4 sm:px-6 lg:px-8 animate-in slide-in-from-top duration-300">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#663C00]">We're digging into your website to assess it!</span>
                        <span className="text-xs text-[#995C00] font-medium uppercase tracking-wider">{status || 'Analyzing UX Parameters...'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex-1 md:w-48 bg-white/50 border border-orange-200 h-2.5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-orange-400 transition-all duration-500 ease-out"
                            style={{ width: `${Math.max(5, progress)}%` }}
                        />
                    </div>
                    <button
                        onClick={handleClick}
                        className="flex-shrink-0 text-sm font-bold text-brand hover:text-brand-hover flex items-center gap-1 underline decoration-2 underline-offset-4"
                    >
                        {Math.round(progress)}% Complete...
                    </button>
                </div>
            </div>
        </div>
    );
};
