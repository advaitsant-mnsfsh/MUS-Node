import React, { useState } from 'react';
import { X } from 'lucide-react';
import { SplitLayout } from '../SplitLayout';
import { LoginPanel } from '../LoginPanel';
import { ScanningPreview } from '../ScanningPreview';

import { AuditInput } from '../../types';

interface AnalysisViewProps {
    progress: number;
    loadingMessage: string;
    microcopy: string;
    animationData: any;
    screenshot: string | undefined | null;
    url: string;
    fullWidth: boolean;
    auditId?: string | null;
    inputs?: AuditInput[];
    isError?: boolean;
    queuePosition?: number;
    isLongWait?: boolean;
    onEmailOptIn?: (email?: string) => void;
    user?: any;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
    progress,
    loadingMessage,
    microcopy,
    animationData,
    screenshot,
    url,
    fullWidth,
    auditId,
    inputs,
    isError,
    queuePosition = 0,
    isLongWait = false,
    onEmailOptIn,
    user
}) => {
    const [isDismissed, setIsDismissed] = useState(false);
    return (
        <SplitLayout
            progress={progress}
            loadingMessage={loadingMessage}
            microcopy={microcopy}
            isAnalysisComplete={false}
            animationData={animationData}
            screenshot={screenshot}
            url={url}
            fullWidth={fullWidth}
            inputs={inputs}
            isError={isError}
        >
            <div className="flex flex-col items-center justify-center w-full h-full animate-in fade-in duration-500 py-6">
                <div className="w-full max-w-md space-y-8 px-4">
                    {/* Queue Notice & Email Opt-in */}
                    {(queuePosition > 5 || isLongWait) && !isError && !isDismissed && (
                        <div
                            className="bg-white rounded-lg p-8 animate-in slide-in-from-bottom-8 duration-700 relative overflow-hidden"
                            style={{ border: '0.5px solid var(--high-grey, #1A1A1A)', boxShadow: 'none' }}
                        >
                            {/* Close Button */}
                            <button
                                type="button"
                                onClick={() => setIsDismissed(true)}
                                className="absolute top-4 right-4 p-2 rounded-lg text-[#1A1A1A] hover:bg-neutral-100 transition-colors"
                                aria-label="Dismiss"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-5 mb-6">
                                <div
                                    className="bg-accent-yellow rounded-lg p-3"
                                    style={{ border: '0.5px solid var(--high-grey, #1A1A1A)', boxShadow: 'none' }}
                                >
                                    <svg className="w-6 h-6 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-black text-[#1A1A1A] text-xl uppercase tracking-tighter leading-none">
                                        {isLongWait && queuePosition <= 5 ? "Extended Wait" : "Busy Queue"}
                                    </h3>
                                    <p className="text-[#1A1A1A]/60 text-xs font-bold uppercase tracking-widest">
                                        {queuePosition > 0 ? (
                                            <>Current Position: <span className="text-[#1A1A1A] underline decoration-accent-yellow decoration-2 underline-offset-2">{queuePosition}</span></>
                                        ) : (
                                            <>High Insight Density</>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <p
                                className="text-[#1A1A1A] font-medium text-sm leading-snug mb-8 pl-4 py-2 bg-slate-50 italic rounded-lg"
                                style={{ borderLeft: '3px solid var(--color-accent-yellow, #fcd34d)' }}
                            >
                                This analysis is intensive and may take up to 20 minutes. Send the report link to your inbox.
                            </p>

                            {user ? (
                                <div className="space-y-6">
                                    <div
                                        className="bg-[#FEFCE8] rounded-lg p-4 flex items-center gap-4"
                                        style={{ border: '0.5px solid var(--high-grey, #1A1A1A)', boxShadow: 'none' }}
                                    >
                                        <div
                                            className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-sm font-black text-[#1A1A1A] shrink-0"
                                            style={{ border: '0.5px solid var(--high-grey, #1A1A1A)' }}
                                        >
                                            {user.name?.[0] || user.email?.[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-[#1A1A1A]/50 font-black uppercase tracking-widest mb-0.5">Destination</p>
                                            <p className="text-sm font-black text-[#1A1A1A] truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onEmailOptIn?.()}
                                        className="w-full rounded-lg bg-[#1A1A1A] text-white font-black uppercase tracking-widest py-4 text-sm transition-all hover:bg-black active:scale-[0.99]"
                                        style={{ boxShadow: 'none' }}
                                    >
                                        Confirm & Send Email
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-xs text-[#1A1A1A]/40 text-center font-black uppercase tracking-widest">Authorization Required</p>
                                    <div
                                        className="mt-2 pt-4"
                                        style={{ borderTop: '0.5px solid rgba(26, 26, 26, 0.12)' }}
                                    >
                                        <LoginPanel auditId={auditId} hideTitle={true} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!isError && (queuePosition <= 5 || !queuePosition || isDismissed) && !fullWidth && (
                        <div
                            className="bg-white/50 backdrop-blur-sm rounded-lg p-8 overflow-hidden"
                            style={{ border: '0.5px solid var(--high-grey, #1A1A1A)', boxShadow: 'none' }}
                        >
                            <LoginPanel auditId={auditId} />
                        </div>
                    )}

                    {isError && !user && (
                        <div
                            className="bg-white/50 backdrop-blur-sm rounded-lg p-8 overflow-hidden"
                            style={{ border: '0.5px solid var(--high-grey, #1A1A1A)', boxShadow: 'none' }}
                        >
                            <LoginPanel auditId={auditId} />
                        </div>
                    )}
                </div>
            </div>
        </SplitLayout>
    );
};
