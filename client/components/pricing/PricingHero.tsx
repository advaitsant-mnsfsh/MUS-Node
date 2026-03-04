import React from 'react';

/**
 * PricingHero Component
 */
const PricingHero = () => {
    return (
        <section className="relative pt-20 pb-12 px-4 overflow-hidden bg-[#FFFEF9]">
            <div className="max-w-4xl mx-auto text-center relative z-10">
                <h1 className="text-4xl md:text-5xl lg:text-5xl font-normal text-gray-900 tracking-tight leading-tight">
                    Find the Truth behind User <span className="relative inline-block">Friction.
                        <img
                            src="/Logo-figma.png"
                            alt="Logo"
                            className="absolute -top-6 -right-12 w-12 h-10 md:w-16 md:h-12 object-contain pointer-events-none select-none"
                        />
                    </span>
                </h1>
                <p className="text-4xl md:text-5xl lg:text-5xl font-light text-gray-800 mt-2">
                    No Guesswork, <span className="font-bold">Clear Insights.</span>
                </p>
            </div>

            {/* Decorative Ring Elements */}
            <img
                src="/ring-top-left.png"
                alt=""
                className="absolute top-0 left-0 w-[60px] md:w-[80px] h-auto pointer-events-none select-none z-0"
            />
            <img
                src="/ring-top-right.png"
                alt=""
                className="absolute top-0 right-0 w-[80px] md:w-[120px] h-auto pointer-events-none select-none z-0"
            />

        </section>
    );
};

export default PricingHero;
