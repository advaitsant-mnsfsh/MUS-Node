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
                        <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom-8 duration-700 relative">
                            {/* Close Button */}
                            <button
                                onClick={() => setIsDismissed(true)}
                                className="absolute top-4 right-4 p-2 text-black hover:bg-black hover:text-white transition-all border-2 border-transparent hover:border-black"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-5 mb-6">
                                <div className="bg-yellow-400 border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-black text-black text-xl uppercase tracking-tighter leading-none">
                                        {isLongWait && queuePosition <= 5 ? "Extended Wait" : "Busy Queue"}
                                    </h3>
                                    <p className="text-black/60 text-xs font-bold uppercase tracking-widest">
                                        {queuePosition > 0 ? (
                                            <>Current Position: <span className="text-black underline decoration-yellow-400 decoration-4">{queuePosition}</span></>
                                        ) : (
                                            <>High Insight Density</>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <p className="text-black font-medium text-sm leading-snug mb-8 border-l-4 border-black pl-4 py-1 bg-slate-50 italic">
                                This analysis is intensive and may take up to 20 minutes. Send the report link to your inbox.
                            </p>

                            {user ? (
                                <div className="space-y-6">
                                    <div className="bg-[#FEFCE8] border-2 border-black p-4 flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center text-sm font-black text-black">
                                            {user.name?.[0] || user.email?.[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-black/50 font-black uppercase tracking-widest mb-0.5">Destination</p>
                                            <p className="text-sm font-black text-black truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onEmailOptIn?.()}
                                        className="w-full bg-black text-white font-black uppercase tracking-widest py-4 text-sm shadow-[8px_8px_0px_0px_rgba(255,214,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:scale-[0.98]"
                                    >
                                        Confirm & Send Email
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-xs text-black/40 text-center font-black uppercase tracking-widest">Authorization Required</p>
                                    <div className="mt-2 border-t-2 border-black/5 pt-4">
                                        <LoginPanel auditId={auditId} hideTitle={true} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!isError && (queuePosition <= 5 || !queuePosition || isDismissed) && !fullWidth && (
                        <div className="bg-white/50 backdrop-blur-sm border border-slate-100 rounded-3xl p-8 shadow-sm">
                            <LoginPanel auditId={auditId} />
                        </div>
                    )}

                    {isError && !user && (
                        <div className="bg-white/50 backdrop-blur-sm border border-slate-100 rounded-3xl p-8 shadow-sm">
                            <LoginPanel auditId={auditId} />
                        </div>
                    )}
                </div>
            </div>
        </SplitLayout >
    );
};
