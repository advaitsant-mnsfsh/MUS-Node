import React from 'react';

/**
 * PricingHero — top spacing & type scale aligned with API Keys page hero.
 */
const PricingHero = () => {
    return (
        <section className="relative w-full overflow-hidden bg-[#FFFEF9] py-14 md:py-16 lg:py-20 px-4 sm:px-6 font-['DM_Sans']">
            <img
                src="/ring-top-left.png"
                alt=""
                aria-hidden
                className="absolute top-0 left-0 w-[60px] md:w-[80px] h-auto z-0 pointer-events-none select-none object-contain"
            />
            <img
                src="/ring-top-right.png"
                alt=""
                aria-hidden
                className="absolute top-0 right-0 w-[80px] md:w-[120px] h-auto z-0 pointer-events-none select-none object-contain"
            />
            <div className="relative z-[1] flex flex-col items-center justify-center text-center shrink-0 mx-auto w-full">
                {/* Ek hi heading — do lines <br /> se, alag p nahi */}
                <h1
                    className="font-normal text-[#1a1a1a] w-full max-w-[601px] m-0 text-[32px] sm:text-[40px] leading-[1.15] sm:leading-snug"
                    style={{ letterSpacing: '-1px' }}
                >
                    Find the Truth behind User{' '}
                    <span className="relative inline-block font-bold">
                        Friction.
                        <img
                            src="/Logo-figma.png"
                            alt=""
                            className="absolute -top-5 -right-10 md:-right-12 w-10 h-8 md:w-14 md:h-11 object-contain pointer-events-none select-none"
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
