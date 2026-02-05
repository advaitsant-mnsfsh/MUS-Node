import React from 'react';
import { Brain, Search, Sparkles } from 'lucide-react';

export const LandingHero: React.FC = () => {
    return (
        <div className="relative flex flex-col items-center justify-center px-4 text-center max-w-4xl mx-auto">
            {/* Decorative Background Icons */}
            <div className="absolute top-0 left-0 md:left-[-40px] opacity-10 hidden md:block">
                <Sparkles className="w-24 h-24 text-brand" strokeWidth={1} />
            </div>
            <div className="absolute bottom-0 right-0 md:right-[-40px] opacity-10 hidden md:block">
                <Search className="w-20 h-20 text-brand" strokeWidth={1} />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">
                {/* AI Badge */}
                <div className="inline-block mb-4">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent-pink text-white text-xs font-bold tracking-wider rounded-full border-2 border-border-main shadow-neo">
                        ⚡ AI-POWERED ANALYSIS
                    </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold text-text-primary leading-tight mb-4 tracking-tight">
                    Get your website a{' '}
                    <span className="relative inline-block px-2">
                        <span className="relative z-10">UX Checkup.</span>
                        <span className="absolute bottom-2 left-0 right-0 h-3 md:h-4 bg-[#DBEAFE] -z-10 rotate-1"></span>
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto">
                    Comprehensive UX analysis powered by AI. {' '}
                    <span className="block sm:inline">Get actionable insights in minutes.</span>
                </p>
            </div>
        </div>
    );
};
