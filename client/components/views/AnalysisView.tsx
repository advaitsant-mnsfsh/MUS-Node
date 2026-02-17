import React from 'react';
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
    onEmailOptIn,
    user
}) => {
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
            <div className="flex flex-col items-center justify-center w-full h-full animate-in fade-in duration-500 py-12">
                <div className="w-full max-w-md space-y-8 px-4">
                    {/* Queue Notice & Email Opt-in */}
                    {queuePosition > 5 && !isError && (
                        <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/20">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">High Volume Detected</h3>
                                    <p className="text-slate-500 text-sm">Your position in queue: <span className="text-indigo-600 font-bold">{queuePosition}</span></p>
                                </div>
                            </div>

                            <p className="text-slate-600 text-sm leading-relaxed mb-8">
                                Analysis might take 15-20 minutes. We can email the report link to you once it's complete.
                            </p>

                            {user ? (
                                <div className="space-y-4">
                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 uppercase">
                                            {user.name?.[0] || user.email?.[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-0.5">Email to</p>
                                            <p className="text-sm font-semibold text-slate-700 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onEmailOptIn?.()}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                                    >
                                        Confirm & Email Me
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-400 text-center font-medium">Please login to receive notifications</p>
                                    <div className="bg-white rounded-2xl p-1 border border-slate-100 shadow-sm">
                                        <LoginPanel auditId={auditId} hideTitle={true} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!isError && (queuePosition <= 5 || !queuePosition) && !fullWidth && (
                        <div className="bg-white/50 backdrop-blur-sm border border-slate-100 rounded-3xl p-8 shadow-sm">
                            <LoginPanel auditId={auditId} />
                        </div>
                    )}

                    {isError && (
                        <div className="bg-white/50 backdrop-blur-sm border border-slate-100 rounded-3xl p-8 shadow-sm">
                            <LoginPanel auditId={auditId} />
                        </div>
                    )}
                </div>
            </div>
        </SplitLayout >
    );
};
