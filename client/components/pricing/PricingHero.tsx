import React from 'react';

/**
 * PricingHero — top spacing & type scale aligned with API Keys page hero.
 */
const PricingHero = () => {
    return (
        <section className="relative w-full overflow-hidden bg-[#FFFEF9] px-4 pb-6 pt-12 font-['DM_Sans'] sm:px-6 sm:pb-7 sm:pt-14 md:pb-8 md:pt-16 lg:pb-10 lg:pt-20">
            <img
                src="/ring-top-left.png"
                alt=""
                aria-hidden
                className="pointer-events-none absolute left-0 top-0 z-0 h-auto w-[56px] select-none object-contain opacity-70 sm:w-[64px] md:w-[80px]"
            />
            <img
                src="/ring-top-right.png"
                alt=""
                aria-hidden
                className="pointer-events-none absolute right-0 top-0 z-0 h-auto w-[72px] select-none object-contain opacity-70 sm:w-[88px] md:w-[120px]"
            />
            <div className="relative z-[1] mx-auto flex w-full max-w-[601px] shrink-0 flex-col items-center justify-center text-center">
                <h1 className="m-0 w-full text-center text-[28px] font-normal leading-[1.2] tracking-[-0.04em] text-[#1a1a1a] sm:text-[30px] sm:leading-[1.15] sm:tracking-[-0.05em] md:text-[36px] lg:text-[40px] lg:tracking-[-0.025em]">
                    Find the Truth behind User{' '}
                    <span className="relative inline-block font-bold">
                        Friction.
                        <img
                            src="/Logo-figma.png"
                            alt=""
                            className="pointer-events-none absolute -right-8 -top-4 h-6 w-8 select-none object-contain sm:-right-10 sm:h-8 sm:w-10 md:-right-12 md:h-11 md:w-14"
                        />
                    </span>
                    <br />
                    No Guesswork, <span className="font-bold">Clear Insights.</span>
                </h1>
            </div>
        </section>
    );
};

export default PricingHero;
