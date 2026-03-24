import React from 'react';
import { Brain, Search, Sparkles } from 'lucide-react';

export const LandingHero: React.FC = () => {
    return (
        <header className="relative mx-auto flex max-w-4xl flex-col items-center justify-center px-4 text-center">
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
                <div className="mb-3 inline-block md:mb-6">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-pink text-white text-sm sm:text-sm font-bold tracking-widest rounded-full border-2 border-black uppercase">
                        ⚡ Powered by AI and Humans
                    </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-h3 sm:text-h2 md:text-h1 lg:text-display mb-3 font-extrabold tracking-tight text-text-primary md:mb-6">
                    Let’s Assess Your{' '}
                    <span className="relative inline-block px-2">
                        <span className="relative z-10">Website’s UX.</span>
                        <span className="absolute bottom-2 left-0 right-0 h-2 md:h-3 lg:h-4 bg-[#DBEAFE] -z-10 rotate-1"></span>
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-body md:text-body-lg text-text-secondary font-medium max-w-2xl mx-auto leading-relaxed">
                    UX Friction Assessments. Quick Actionable Recommendations.
                </p>
            </div>
        </header>
    );
};
