import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { monitorJobPoll } from '../services/geminiService';

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

    // Server-side recovery fallback
    useEffect(() => {
        if (state.activeAuditId) return;

        const recoverFromServer = async () => {
            try {
                const { getBackendUrl } = await import('../services/config');
                const response = await fetch(`${getBackendUrl()}/api/v1/audit/active`, {
                    headers: { 'Accept': 'application/json' }
                });
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
    }, [state.activeAuditId, setActiveAudit]);

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
                    const msg = message.toUpperCase();

                    // Milestones for progress bar
                    if (msg.includes('AUDIT IS IN PROGRESS')) newProgress = 5;
                    if (msg.includes('STARTING STANDARD ANALYSIS')) newProgress = 10;
                    if (msg.includes('SCRAPING')) newProgress = 15;
                    if (msg.includes('SCRAPE SUCCESSFUL')) newProgress = 30;
                    if (msg.includes('SCRAPE COMPLETE')) newProgress = 35;
                    if (msg.includes('STARTING COMPETITOR ANALYSIS')) newProgress = 10;
                    if (msg.includes('SCRAPING PRIMARY')) newProgress = 20;
                    if (msg.includes('SCRAPING COMPETITOR')) newProgress = 40;
                    if (msg.includes('AI COMPARISON')) newProgress = 60;
                    if (msg.includes('UX COMPLETE')) newProgress = 42;
                    if (msg.includes('PRODUCT COMPLETE')) newProgress = 54;
                    if (msg.includes('VISUAL COMPLETE')) newProgress = 66;
                    if (msg.includes('STRATEGY COMPLETE')) newProgress = 78;
                    if (msg.includes('ACCESSIBILITY COMPLETE')) newProgress = 90;
                    if (msg.includes('STRATEGIC IMPACT')) newProgress = 92;
                    if (msg.includes('CONTEXTUAL ANALYSIS COMPLETE')) newProgress = 95;

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
