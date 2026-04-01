import React from 'react';

export const LandingHero: React.FC = () => {
    return (
        <header className="relative mx-auto flex max-w-4xl flex-col items-center justify-center px-4 text-center">

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">
                {/* AI Badge */}
                <div className="mb-2.5 inline-block md:mb-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-black bg-[#6465F0] px-2.5 py-1.5 text-[0.6875rem] font-bold uppercase tracking-wide text-white md:gap-2 md:border-2 md:px-3 md:py-1.5 md:text-sm md:tracking-widest">
                        ⚡ Powered by AI and Humans
                    </span>
                </div>

                {/* Main Heading — mobile uses H2 scale; md+ unchanged */}
                <h1 className="mb-2.5 text-h2 font-extrabold tracking-tight text-text-primary md:mb-6 md:text-h1 lg:text-display">
                    Let’s Assess Your Website’s UX.{' '}
            
                </h1>

                {/* Subtitle */}
                <p className="text-sm md:text-body-lg text-text-secondary font-medium max-w-2xl mx-auto leading-relaxed">
                    UX Friction Assessments. Quick Actionable Recommendations.
                </p>
            </div>
        </header>
    );
};
