import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

const genericMicrocopy = [
    "Retreiving your report...",
    "Preparing the data...",
    "Almost there...",
    "Loading insights..."
];

export const DataLoadingScreen: React.FC<{ message?: string }> = ({ message }) => {
    const [microcopy, setMicrocopy] = useState(genericMicrocopy[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setMicrocopy(prev => {
                const idx = genericMicrocopy.indexOf(prev);
                return genericMicrocopy[(idx + 1) % genericMicrocopy.length];
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-[calc(100vh-5rem)] w-full bg-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
            <div className="relative mb-12">
                {/* Outer pulsing ring */}
                <div className="absolute inset-0 bg-brand/10 rounded-full animate-ping opacity-25"></div>

                {/* Logo centered */}
                <div className="relative bg-white p-6 rounded-3xl shadow-neo border-2 border-border-main animate-pulse-slow">
                    <Logo imgClass="h-16" />
                </div>
            </div>

            <div className="text-center max-w-sm">
                <h3 className="text-xl font-bold text-text-primary mb-2">
                    {message || microcopy}
                </h3>
                <p className="text-sm text-text-secondary font-medium">
                    Hang tight, We're just getting things ready for you.
                </p>

                {/* Minimal dots animation */}
                <div className="flex items-center justify-center gap-1.5 mt-6">
                    <div className="w-2 h-2 rounded-full bg-brand/40 animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 rounded-full bg-brand/60 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 rounded-full bg-brand animate-bounce"></div>
                </div>
            </div>

            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(0.98); opacity: 0.9; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};
