import React from 'react';
import { Search, Sparkles } from 'lucide-react';

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
                <div className="mb-2.5 inline-block md:mb-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-black bg-accent-pink px-2.5 py-1.5 text-[0.6875rem] font-bold uppercase tracking-wide text-white md:gap-2 md:border-2 md:px-3 md:py-1.5 md:text-sm md:tracking-widest">
                        ⚡ Powered by AI and Humans
                    </span>
                </div>

                {/* Main Heading — mobile uses H2 scale; md+ unchanged */}
                <h1 className="mb-2.5 text-h2 font-extrabold tracking-tight text-text-primary md:mb-6 md:text-h1 lg:text-display">
                    Let’s Assess Your{' '}
                    <span className="relative inline-block px-1 md:px-2">
                        <span className="relative z-10">Website’s UX.</span>
                        <span className="absolute bottom-1 left-0 right-0 -z-10 h-1.5 rotate-1 bg-[#DBEAFE] md:bottom-2 md:h-2 lg:h-3 xl:h-4"></span>
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-sm md:text-body-lg text-text-secondary font-medium max-w-2xl mx-auto leading-relaxed">
                    UX Friction Assessments. Quick Actionable Recommendations.
                </p>
            </div>
        </header>
    );
};
