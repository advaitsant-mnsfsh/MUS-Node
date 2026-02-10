import React from 'react';

interface ScanningPreviewProps {
    screenshot: string | null;
    progress: number;
    url?: string;
}

export const ScanningPreview: React.FC<ScanningPreviewProps> = ({ screenshot, progress, url }) => {
    return (
        <div className="relative w-full max-w-4xl mx-auto pl-0 md:pl-8">
            {/* Browser Frame Container */}
            <div className="relative">
                {/* Browser Chrome (Top Bar) */}
                <div className="bg-[#F5F5F5] border-2 border-border-main border-b-0 rounded-t-xl px-4 py-3 flex items-center gap-3 shadow-[1px_0px_0px_0px_rgba(0,0,0,1)]">
                    {/* Traffic Lights (macOS style) */}
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E04A3F]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#28CA42] border border-[#1FA935]"></div>
                    </div>

                    {/* URL Bar */}
                    <div className="flex-1 bg-white border border-[#DDDDDD] rounded-md px-3 py-1.5 text-sm text-text-secondary flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#94A3B8] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="truncate">{url || 'Scanning...'}</span>
                    </div>

                    {/* Close Button (decorative) */}
                    <div className="w-6 h-6 rounded border border-[#DDDDDD] bg-white flex items-center justify-center hover:bg-[#F5F5F5] transition-colors">
                        <svg className="w-3 h-3 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                </div>

                {/* Screenshot Container */}
                <div className="relative bg-white border-2 border-border-main rounded-b-xl overflow-hidden aspect-[16/10] shadow-neo">
                    {screenshot ? (
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
                            className="w-full h-full object-cover object-top"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6">
                            {url && (
                                <div className="text-center">
                                    {/* Status Badge */}
                                    <div className="mt-0 flex items-center justify-center">
                                        <div className="inline-flex items-top gap-2 px-4 py-2 bg-white border-2 border-border-main shadow-neo">
                                            <span className="text-sm font-bold text-text-primary ml-2">
                                                {/* Progress Text */}
                                                <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-2">
                                                    Analyzing your website
                                                </h2>
                                                <p className="text-sm text-text-secondary mb-8">
                                                    This typically takes 2-3 minutes
                                                </p>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Continuous Scanning Line with Triple Glow Effect */}
                    <div className="scanning-line-container absolute left-0 w-full h-1 z-30 pointer-events-none">
                        {/* Outer glow (blur) */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand to-transparent blur-md opacity-60"></div>

                        {/* Middle glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent blur-sm opacity-70"></div>

                        {/* Sharp core line */}
                        <div className="absolute inset-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-95"></div>
                    </div>


                    {/* Grid Overlay (Matrix-style) */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-10"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }}
                    ></div>

                    {/* Subtle vignette effect */}
                    <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/5 pointer-events-none"></div>

                    {/* Progress Bar - Bottom with Two-Line Text */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-white/80 backdrop-blur-md border-t-2 border-border-main z-40">
                        {/* Status Text + Percentage */}
                        <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-4">
                            {/* Left: Glow Dots + Text */}
                            <div className="flex items-center gap-2">
                                {/* Pulsing Dot */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-2 h-2 bg-brand rounded-full animate-ping"></div>
                                    <div className="w-2 h-2 bg-brand rounded-full absolute top-0 left-0 animate-pulse"></div>
                                </div>

                                {/* Scanning Text */}
                                <h3 className="text-sm font-bold text-text-primary">
                                    Scanning...
                                </h3>
                            </div>

                            {/* Right: Percentage */}
                            <span className="text-lg font-bold text-brand tabular-nums flex-shrink-0">
                                {progress}%
                            </span>
                        </div>

                        {/* Thicker Progress Bar */}
                        <div className="h-3 bg-slate-200 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-brand to-[#8B5CF6] transition-all duration-500 ease-out shadow-[0_0_12px_rgba(99,102,241,0.6)] relative"
                                style={{ width: `${progress}%` }}
                            >
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                /* Continuous scanning animation - infinite loop */
                @keyframes scanContinuous {
                    0% {
                        top: 0%;
                        opacity: 1;
                    }
                    45% {
                        top: 100%;
                        opacity: 1;
                    }
                    50% {
                        top: 100%;
                        opacity: 0;
                    }
                    55% {
                        top: 0%;
                        opacity: 0;
                    }
                    60% {
                        top: 0%;
                        opacity: 1;
                    }
                    100% {
                        top: 100%;
                        opacity: 1;
                    }
                }
                
                @keyframes pulse-slow {
                    0%, 100% { 
                        opacity: 1; 
                        transform: scale(1);
                    }
                    50% { 
                        opacity: 0.3;
                        transform: scale(0.95);
                    }
                }
                
                .scanning-line-container {
                    animation: scanContinuous 4s ease-in-out infinite;
                }
                
                .animate-pulse-slow {
                    animation: pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }

                /* Shimmer animation for progress bar */
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }

                /* Radial gradient support */
                .bg-gradient-radial {
                    background-image: radial-gradient(circle, var(--tw-gradient-stops));
                }
            `}</style>
        </div>
    );
};
