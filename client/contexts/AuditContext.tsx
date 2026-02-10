import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { monitorJobPoll } from '../services/geminiService';
import { useAuth } from './AuthContext';

interface GlobalAuditState {
    activeAuditId: string | null;
    progress: number;
    status: string;
    isCompleted: boolean;
    isFailed: boolean;
    error: string | null;
    latestScreenshot?: string | null;
}

interface AuditContextType extends GlobalAuditState {
    setActiveAudit: (auditId: string) => void;
    clearActiveAudit: () => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export const AuditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<GlobalAuditState>(() => {
        // Initial state with localStorage recovery
        if (typeof window === 'undefined') {
            return { activeAuditId: null, progress: 0, status: '', isCompleted: false, isFailed: false, error: null };
        }

        const savedId = localStorage.getItem('active_audit_id');
        const savedProgress = localStorage.getItem('active_audit_progress');
        const savedStatus = localStorage.getItem('active_audit_status');

        return {
            activeAuditId: savedId,
            progress: savedProgress ? parseInt(savedProgress, 10) : 0,
            status: savedStatus || (savedId ? 'Resuming audit...' : ''),
            isCompleted: false,
            isFailed: false,
            error: null,
        };
    });

    const setActiveAudit = useCallback((auditId: string) => {
        setState(prev => {
            if (prev.activeAuditId === auditId) return prev;
            return {
                activeAuditId: auditId,
                progress: 5,
                status: 'Audit in progress...',
                isCompleted: false,
                isFailed: false,
                error: null,
            };
        });
    }, []);

    const clearActiveAudit = useCallback(() => {
        setState({
            activeAuditId: null,
            progress: 0,
            status: '',
            isCompleted: false,
            isFailed: false,
            error: null,
        });
    }, []);

    // Sync state to localStorage
    useEffect(() => {
        if (state.activeAuditId) {
            localStorage.setItem('active_audit_id', state.activeAuditId);
            localStorage.setItem('active_audit_progress', state.progress.toString());
            localStorage.setItem('active_audit_status', state.status);
        } else {
            localStorage.removeItem('active_audit_id');
            localStorage.removeItem('active_audit_progress');
            localStorage.removeItem('active_audit_status');
        }
    }, [state.activeAuditId, state.progress, state.status]);

    const { user, isLoading: isAuthLoading } = useAuth();

    // Server-side recovery fallback
    useEffect(() => {
        if (state.activeAuditId || isAuthLoading || !user) return;

        const recoverFromServer = async () => {
            try {
                const { getBackendUrl } = await import('../services/config');
                const { authenticatedFetch } = await import('../lib/authenticatedFetch');

                const response = await authenticatedFetch(`${getBackendUrl()}/api/v1/audit/active`);

                if (!response.ok) {
                    if (response.status !== 401) {
                        console.warn(`[GlobalAudit] Failed to recover job: ${response.status}`);
                    }
                    return;
                }

                const data = await response.json();
                if (data.success && data.activeJob) {
                    console.log(`[GlobalAudit] Recovered active job from server: ${data.activeJob.id}`);
                    setActiveAudit(data.activeJob.id);
                }
            } catch (err) {
                console.error('[GlobalAudit] Failed to recover job from server:', err);
            }
        };

        recoverFromServer();
    }, [state.activeAuditId, setActiveAudit, user, isAuthLoading]);

    // Handle Polling locally in the provider so it survives navigation
    useEffect(() => {
        if (!state.activeAuditId || state.isCompleted || state.isFailed) return;

        console.log(`[GlobalAudit] Starting poll for ${state.activeAuditId}`);

        const stopPolling = monitorJobPoll(state.activeAuditId, {
            onScrapeComplete: (newScreenshots, mimeType) => {
                if (newScreenshots.length > 0) {
                    setState(prev => ({ ...prev, latestScreenshot: newScreenshots[0].data }));
                }
            },
            onStatus: (message) => {
                setState(prev => {
                    let newProgress = prev.progress;
                    const msg = message.toLowerCase();

                    // Mappings from useAudit.ts for perfect sync
                    if (msg.includes('initiating') || msg.includes('queued') || msg.includes('starting audit')) newProgress = 5;
                    if (msg.includes('scraping') || msg.includes('processing uploaded')) newProgress = 15;
                    if (msg.includes('scrape complete') || msg.includes('content acquired') || msg.includes('analyzing content')) newProgress = 30;
                    if (msg.includes('checking performance') || msg.includes('performance check')) newProgress = 32;
                    if (msg.includes('running experts') || msg.includes('starting batch')) newProgress = 35;

                    // UX & Product
                    if (msg.includes('running ux') || msg.includes('starting analyze-ux')) newProgress = 40;
                    if (msg.includes('running product') || msg.includes('starting analyze-product')) newProgress = 40;
                    if (msg.includes('ux complete') || msg.includes('ux audit analysis complete')) newProgress = 50;
                    if (msg.includes('product complete') || msg.includes('product audit analysis complete')) newProgress = 50;

                    // Visual & Strategy
                    if (msg.includes('running visual') || msg.includes('starting analyze-visual')) newProgress = 60;
                    if (msg.includes('running strategy') || msg.includes('starting analyze-strategy')) newProgress = 60;
                    if (msg.includes('visual complete') || msg.includes('visual audit analysis complete')) newProgress = 70;
                    if (msg.includes('strategy complete') || msg.includes('strategy audit completed')) newProgress = 70;

                    // Accessibility
                    if (msg.includes('running accessibility') || msg.includes('starting analyze-accessibility')) newProgress = 80;
                    if (msg.includes('accessibility complete') || msg.includes('accessibility audit completed')) newProgress = 85;

                    // Contextual & Final
                    if (msg.includes('contextual') || msg.includes('strategic impact')) newProgress = 90;
                    if (msg.includes('contextual analysis complete')) newProgress = 95;
                    if (msg.includes('job completed') || msg.includes('saving') || msg.includes('finalizing')) newProgress = 98;
                    if (msg.includes('complete') && (msg.includes('job') || msg.includes('all'))) newProgress = 100;

                    return { ...prev, status: message, progress: Math.max(prev.progress, newProgress) };
                });
            },

            onData: (chunk) => {
                if (chunk.key === 'screenshots' && chunk.data?.length > 0) {
                    setState(prev => ({ ...prev, latestScreenshot: chunk.data[0].data }));
                }
            },
            onComplete: () => {
                setState(prev => ({ ...prev, isCompleted: true, progress: 100 }));
            },
            onError: (err) => {
                setState(prev => ({ ...prev, isFailed: true, error: err }));
            },
            onClose: () => { }
        });

        return () => {
            if (typeof stopPolling === 'function') stopPolling();
        };
    }, [state.activeAuditId, state.isCompleted, state.isFailed]);

    // 2. Incremental "Confidence Builder" (Global Sync)
    useEffect(() => {
        if (!state.activeAuditId || state.isCompleted || state.isFailed || state.progress >= 90) return;

        const interval = setInterval(() => {
            setState(prev => {
                if (prev.progress >= 90 || !prev.activeAuditId) return prev;
                // Faster increment at the start (0-30%), slower later
                const increment = prev.progress < 30 ? 2 : (prev.progress > 70 ? 0.5 : 1);
                return { ...prev, progress: prev.progress + increment };
            });
        }, 8000);

        return () => clearInterval(interval);
    }, [state.activeAuditId, state.isCompleted, state.isFailed, state.progress >= 90]);

    return (
        <AuditContext.Provider value={{ ...state, setActiveAudit, clearActiveAudit }}>
            {children}
        </AuditContext.Provider>
    );
};

export const useGlobalAudit = () => {
    const context = useContext(AuditContext);
    if (context === undefined) {
        throw new Error('useGlobalAudit must be used within an AuditProvider');
    }
    return context;
};
