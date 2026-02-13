import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGlobalAudit } from '../contexts/AuditContext';
import { Loader2, ArrowRight, CheckCircle2, AlertCircle, X } from 'lucide-react';

export const GlobalProgressBanner: React.FC = () => {
    const { activeAuditId, progress, status, isCompleted, isFailed, error, clearActiveAudit } = useGlobalAudit();
    const navigate = useNavigate();
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    // Reset dismissal when audit ID changes
    useEffect(() => {
        setIsDismissed(false);
    }, [activeAuditId]);

    useEffect(() => {
        const isHomePage = location.pathname === '/';
        const isAnalysisPage = location.pathname.startsWith('/analysis/');

        // Extract ID from /report/:id
        const reportMatch = location.pathname.match(/\/report\/([^/]+)/);
        const reportIdInUrl = reportMatch ? reportMatch[1] : null;

        // Condition: Show if we have an active audit AND
        // 1. Not on home page
        // 2. Not on ANY analysis page (keep the scan immersive)
        // 3. If on a report page, ONLY show if it's NOT the active audit's report
        // 4. NOT manually dismissed by user
        const shouldShow = activeAuditId &&
            !isHomePage &&
            !isAnalysisPage &&
            (reportIdInUrl !== activeAuditId) &&
            !isDismissed;

        setIsVisible(!!shouldShow);
        console.log(`[Banner-Diagnostic] activeId=${activeAuditId}, path=${location.pathname}, visible=${shouldShow}, dismissed=${isDismissed}`);
    }, [activeAuditId, location.pathname, isDismissed]);

    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => setHasMounted(true), 100);
            return () => clearTimeout(timer);
        } else {
            setHasMounted(false);
        }
    }, [isVisible]);

    if (!isVisible || !activeAuditId) return null;

    const handleClick = () => {
        if (!activeAuditId) return;

        if (isCompleted) {
            const currentId = activeAuditId;
            // Clear from global state so the banner doesn't "re-haunt" the user
            clearActiveAudit();
            window.location.href = `/report/${currentId}`;
        } else {
            window.location.href = `/analysis/${activeAuditId}`;
        }
    };

    if (isFailed) {
        return (
            <div className={`bg-red-50 border-b border-red-200 py-3 px-4 sm:px-6 lg:px-8 animate-in slide-in-from-top duration-300`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                            <span className="text-sm font-bold text-red-900">Assessment Failed</span>
                            <span className="text-xs text-red-700 truncate max-w-[200px] sm:max-w-md">{error || 'An unexpected error occurred'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(`/analysis/${activeAuditId}`)}
                            className="flex-shrink-0 text-xs font-bold text-red-900 hover:underline flex items-center gap-1"
                        >
                            View Details <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => clearActiveAudit()}
                            className="flex-shrink-0 p-1 hover:bg-red-100 rounded-full transition-colors"
                            aria-label="Dismiss banner"
                        >
                            <X className="w-4 h-4 text-red-900" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isCompleted) {
        return (
            <div className={`bg-[#E8F5E9] border-b border-[#C8E6C9] py-3 px-4 sm:px-6 lg:px-8 animate-in slide-in-from-top duration-300`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
                        <span className="text-sm font-bold text-[#1B5E20]">Assessment Completed!</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleClick}
                            className="flex-shrink-0 text-sm font-bold text-brand hover:text-brand-hover flex items-center gap-1 underline decoration-2 underline-offset-4"
                        >
                            Check it Out <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => clearActiveAudit()}
                            className="flex-shrink-0 p-1 hover:bg-[#C8E6C9] rounded-full transition-colors"
                            aria-label="Dismiss banner"
                        >
                            <X className="w-4 h-4 text-[#2E7D32]" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-[#FFF4E5] border-b border-[#FFE0BD] py-3 px-4 sm:px-6 lg:px-8 animate-in slide-in-from-top duration-300`}>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-1 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative w-8 h-8 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#663C00]">Assessment in progress...</span>
                            <span className="text-xs text-[#995C00] font-medium uppercase tracking-wider">{status || 'Analyzing UX Parameters...'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:block sm:w-48 bg-white/50 border border-orange-200 h-2.5 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-orange-400 ${hasMounted ? 'transition-all duration-500 ease-out' : 'transition-none'}`}
                                style={{ width: `${Math.max(5, progress)}%` }}
                            />
                        </div>
                        <button
                            onClick={handleClick}
                            className="flex-shrink-0 text-sm font-bold text-brand hover:text-brand-hover flex items-center gap-1 underline decoration-2 underline-offset-4"
                        >
                            {Math.round(progress)}% Complete...
                        </button>

                        <button
                            onClick={() => setIsDismissed(true)}
                            className="flex-shrink-0 p-1 hover:bg-orange-100 rounded-full transition-colors"
                            aria-label="Dismiss banner"
                        >
                            <X className="w-4 h-4 text-orange-500" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
