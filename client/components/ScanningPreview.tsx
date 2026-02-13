import React from 'react';
import { AuditInput } from '../types';

interface ScanningPreviewProps {
    screenshot: string | null;
    progress: number;
    url?: string;
    loadingMessage?: string;
    inputs?: AuditInput[];
    isError?: boolean;
}

export const ScanningPreview: React.FC<ScanningPreviewProps> = ({ screenshot, progress, url, loadingMessage, inputs, isError }) => {
    const [displayUrl, setDisplayUrl] = React.useState(url || 'Scanning...');
    const [hasMounted, setHasMounted] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => setHasMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // URL Rotation Logic
    React.useEffect(() => {
        if (isError) return; // Stop rotation on error
        if (!inputs || inputs.length <= 1) {
            setDisplayUrl(url || 'Scanning...');
            return;
        }
        // ... (rest of rotation logic same)
        const urls = inputs
            .filter(i => i.type === 'url')
            .map(i => i.url)
            .filter(Boolean) as string[];

        if (urls.length <= 1) {
            setDisplayUrl(url || 'Scanning...');
            return;
        }

        const isCompetitor = inputs.some(i => i.role === 'competitor');
        const intervalTime = isCompetitor ? 2300 : 2500;

        const sortedUrls = isCompetitor
            ? [
                ...inputs.filter(i => i.role === 'primary' && i.url).map(i => i.url!),
                ...inputs.filter(i => i.role === 'competitor' && i.url).map(i => i.url!)
            ]
            : urls;

        let currentIndex = 0;
        const interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % sortedUrls.length;
            setDisplayUrl(sortedUrls[currentIndex]);
        }, intervalTime);

        return () => clearInterval(interval);
    }, [inputs, url, isError]);

    return (
        <div className="relative w-full max-w-4xl mx-auto pl-0 md:pl-8">
            {/* Browser Frame Container */}
            <div className="relative">
                {/* Browser Chrome (Top Bar) */}
                <div className={`bg-[#F5F5F5] border-2 ${isError ? 'border-red-500' : 'border-border-main'} border-b-0 rounded-t-xl px-4 py-3 flex items-center gap-3 shadow-[1px_0px_0px_0px_rgba(0,0,0,1)]`}>
                    {/* Traffic Lights (macOS style) */}
                    <div className="flex gap-2">
                        <div className={`w-3 h-3 rounded-full ${isError ? 'bg-red-400' : 'bg-[#FF5F57]'} border border-[#E04A3F]`}></div>
                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#28CA42] border border-[#1FA935]"></div>
                    </div>

                    {/* URL Bar */}
                    <div className={`flex-1 bg-white border ${isError ? 'border-red-300' : 'border-[#DDDDDD]'} rounded-md px-3 py-1.5 text-sm ${isError ? 'text-red-600' : 'text-text-secondary'} flex items-center gap-2`}>
                        <svg className={`w-4 h-4 ${isError ? 'text-red-400' : 'text-[#94A3B8]'} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="truncate">{displayUrl}</span>
                    </div>

                    {/* Close Button (decorative) */}
                    <div className="w-6 h-6 rounded border border-[#DDDDDD] bg-white flex items-center justify-center hover:bg-[#F5F5F5] transition-colors">
                        <svg className="w-3 h-3 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                </div>

                {/* Screenshot Container */}
                <div className={`relative bg-white border-2 ${isError ? 'border-red-500' : 'border-border-main'} rounded-b-xl overflow-hidden aspect-[16/10] shadow-neo`}>
                    {screenshot ? (
                        <div className="relative w-full h-full">
                            <img
                                src={(() => {
                                    if (screenshot.startsWith('data:')) return screenshot;
                                    if (screenshot.startsWith('/uploads')) {
                                        const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://mus-node-production.up.railway.app' : 'http://localhost:3000');
                                        return `${backendUrl}${screenshot}`;
                                    }
                                    return `data:image/png;base64,${screenshot}`;
                                })()}
                                alt="Scanning preview"
                                className={`w-full h-full object-cover object-top ${isError ? 'grayscale opacity-50' : ''}`}
                            />
                            {isError && (
                                <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 backdrop-blur-[2px]">
                                    <div className="bg-white border-2 border-red-500 p-4 shadow-neo-red rotate-[-2deg] animate-in zoom-in duration-300">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-bold text-red-800 text-sm">ANALYSIS ABORTED</p>
                                                <p className="text-red-600 text-xs">System encountered a critical error</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={`w-full h-full ${isError ? 'bg-red-50' : 'bg-gradient-to-br from-slate-50 to-slate-100'} flex flex-col items-center justify-center p-6`}>
                            <div className="text-center">
                                <div className="mt-0 flex items-center justify-center">
                                    <div className={`inline-flex items-top gap-2 px-4 py-2 bg-white border-2 ${isError ? 'border-red-500 shadow-neo-red' : 'border-border-main shadow-neo'}`}>
                                        <span className="text-sm font-bold text-text-primary ml-2">
                                            <h2 className={`text-xl md:text-2xl font-bold ${isError ? 'text-red-700' : 'text-text-primary'} mb-2`}>
                                                {isError ? 'Analysis Failed' : 'Analyzing your website'}
                                            </h2>
                                            <p className={`text-sm ${isError ? 'text-red-500' : 'text-text-secondary'} mb-8`}>
                                                {isError ? 'We hit a technical snag. Check details below.' : 'This typically takes 2-3 minutes'}
                                            </p>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Continuous Scanning Line - Hidden on Error */}
                    {!isError && (
                        <div className="scanning-line-container absolute left-0 w-full h-1 z-30 pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand to-transparent blur-md opacity-60"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent blur-sm opacity-70"></div>
                            <div className="absolute inset-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-95"></div>
                        </div>
                    )}

                    {/* Progress Bar - Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-white/80 backdrop-blur-md border-t-2 border-border-main z-40">
                        <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                {!isError && (
                                    <div className="relative flex-shrink-0">
                                        <div className="w-2 h-2 bg-brand rounded-full animate-ping"></div>
                                        <div className="w-2 h-2 bg-brand rounded-full absolute top-0 left-0 animate-pulse"></div>
                                    </div>
                                )}
                                <h3 className={`text-sm font-bold ${isError ? 'text-red-700' : 'text-text-primary'}`}>
                                    {isError ? 'Error during processing' : (loadingMessage || 'Scanning...')}
                                </h3>
                            </div>
                            <span className={`text-lg font-bold ${isError ? 'text-red-500' : 'text-brand'} tabular-nums flex-shrink-0`}>
                                {Math.round(progress)}%
                            </span>
                        </div>

                        <div className={`h-3 ${isError ? 'bg-red-100' : 'bg-slate-200'} overflow-hidden`}>
                            <div
                                className={`h-full ${isError ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-brand to-[#8B5CF6] shadow-[0_0_12px_rgba(99,102,241,0.6)]'} ${hasMounted ? 'transition-all duration-500 ease-out' : 'transition-none'} relative`}
                                style={{ width: `${progress}%` }}
                            >
                                {!isError && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes scanContinuous {
                    0% { top: 0%; opacity: 1; }
                    45% { top: 100%; opacity: 1; }
                    50% { top: 100%; opacity: 0; }
                    55% { top: 0%; opacity: 0; }
                    60% { top: 0%; opacity: 1; }
                    100% { top: 100%; opacity: 1; }
                }
                
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.3; transform: scale(0.95); }
                }
                
                .scanning-line-container {
                    animation: scanContinuous 4s ease-in-out infinite;
                }
                
                .animate-pulse-slow {
                    animation: pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }

                .bg-gradient-radial {
                    background-image: radial-gradient(circle, var(--tw-gradient-stops));
                }

                .shadow-neo-red {
                    box-shadow: 4px 4px 0px 0px rgba(239, 68, 68, 1);
                }
            `}</style>
        </div >
    );
};
