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
    const [state, setState] = useState<GlobalAuditState>({
        activeAuditId: null,
        progress: 0,
        status: '',
        isCompleted: false,
        isFailed: false,
        error: null,
    });

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

        // If monitorJobPoll returned a cleanup function, use it.
        // (Currently geminiService.ts doesn't return one, it uses isPolling internal flag)
        // We might need to adjust geminiService to support explicit cancellation or use a singleton.
    }, [state.activeAuditId, state.isCompleted, state.isFailed]);

    const setActiveAudit = useCallback((auditId: string) => {
        setState({
            activeAuditId: auditId,
            progress: 5,
            status: 'Audit in progress...',
            isCompleted: false,
            isFailed: false,
            error: null,
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
