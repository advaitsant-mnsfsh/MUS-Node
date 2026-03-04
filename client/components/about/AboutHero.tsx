import React from 'react';

/**
 * AboutHero Component - TAILWIND BEST PRACTICES VERSION
 * - Standard classes used where they match the 4px scale (e.g., pt-30 for 120px).
 * - Arbitrary values [] used only for non-standard Figma specific measurements.
 * - Fully Responsive & SEO Friendly.
 */

const AboutHero = () => {
    const brands = [
        { id: 1, name: 'Ministry of Education', alt: 'Ministry of Education Government of India Logo', path: '/About Page/brand-logo-1.svg' },
        { id: 2, name: 'Operabase', alt: 'Operabase Logo', path: '/About Page/brand-logo-2.png' },
        { id: 3, name: 'TransUnion', alt: 'TransUnion Credit Reporting Agency Logo', path: '/About Page/brand-logo-3.png' },
        { id: 4, name: 'Dasera', alt: 'Dasera Data Security Logo', path: '/About Page/brand-logo-4.png' },
        { id: 5, name: 'Climate-KIC', alt: 'EIT Climate-KIC Logo', path: '/About Page/brand-logo-5.png' },
        { id: 6, name: 'Funded by EU', alt: 'Funded by the European Union Logo', path: '/About Page/brand-logo-6.png' },
    ];

    return (
        <section
            aria-labelledby="hero-heading"
            className="relative w-full bg-[#FFFEF9] overflow-hidden flex flex-col items-center pt-20 md:pt-30 px-6 font-['DM_Sans'] min-h-[500px]"
        >
            {/* Decorative Background Elements - Anchored to the section edges */}
            <img
                aria-hidden="true"
                src="/About Page/ring-top-left.png"
                className="absolute top-0 left-0 w-[60px] md:w-[80px] lg:w-[100px] h-auto z-0 object-contain pointer-events-none select-none"
                alt=""
            />
            <img
                aria-hidden="true"
                src="/About Page/ring-top-right.png"
                className="absolute top-0 right-0 w-[80px] md:w-[120px] lg:w-[150px] h-auto z-0 object-contain pointer-events-none select-none"
                alt=""
            />

            {/* Main Content Wrapper */}
            <div className="relative flex flex-col items-center w-full max-w-[1173px] gap-12 md:gap-[128px]">

                {/* --- Top Section: Heading and Stats --- */}
                <div className="flex flex-col items-center w-full gap-10 md:gap-[56px] relative z-10">

                    <h1
                        id="hero-heading"
                        className="text-center text-[#1A1A1A] font-['DM_Sans'] m-0 p-0 text-3xl sm:text-4xl md:text-[48px] leading-[1.2] md:leading-[normal] tracking-tight md:tracking-[-0.03em] font-normal w-full max-w-[853px]"
                    >
                        Find the Truth behind User <span className="relative inline-block">Friction.
                            <img
                                src="/About Page/logo.svg"
                                alt=""
                                className="absolute -top-4 -right-6 md:-top-5 md:-right-5 w-6 md:w-[54px] object-contain pointer-events-none select-none"
                            />
                        </span>
                        <br className="hidden md:block" />
                        <div className="flex flex-wrap items-center justify-center gap-2 mt-2 md:mt-0">
                            <span>No Guesswork, <span className="font-bold">Clear Insights.</span></span>
                        </div>
                    </h1>

                    {/* Stats Section */}
                    {/* display: flex; width: 42.25rem; justify-content: space-between; align-items: center; */}
                    <div
                        className="flex flex-col md:flex-row justify-center md:justify-between items-center w-full md:w-[42.25rem] gap-8 md:gap-0"
                        role="list"
                    >
                        <StatItem value="20+" label="Years of Combined Experience" />
                        <StatItem value="<5min" label="Audit Creation Time" />
                        <StatItem value="110+" label="UX parameters Checked :)" />
                    </div>
                </div>

                {/* --- Bottom Section: Brand Logos --- */}
                {/* Brand Logos Main Parent: flex, col, w-73.3125rem, center, gap-0.75rem */}
                <div className="flex flex-col items-center justify-center w-full md:w-[73.3125rem] gap-[0.75rem] pb-[80px] md:pb-[153px] relative z-10">
                    <p className="font-['DM_Sans'] font-semibold text-[#1A1A1A] m-0 text-base md:text-[16px]">
                        Our Audits are trusted by:
                    </p>

                    {/* Brand Logos Inner Container: flex, center, start, gap-2rem, self-stretch */}
                    <div className="flex flex-wrap lg:flex-nowrap justify-center items-start self-stretch w-full gap-[0.5rem] md:gap-[2rem] ">
                        {brands.map((brand) => (
                            <figure
                                key={brand.id}
                                className="flex flex-col justify-between items-center bg-transparent m-0 w-[40%] sm:w-[30%] md:w-[11.375rem] h-[4rem] md:h-[7.5rem] shrink-0"
                            >
                                <img
                                    src={brand.path}
                                    alt={brand.alt}
                                    className="w-auto h-full md:w-[8.3rem] md:h-[3.2rem] shrink-0 object-contain pointer-events-none my-auto"
                                />
                            </figure>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// 20+ Stats Typography Values
// color: #1A1A1A; text-align: center; font-family: "DM Sans"; font-size: 1.75rem; 
// font-style: normal; font-weight: 700; line-height: normal; letter-spacing: -0.125rem;
// Label Text Values
// font-size: 0.875rem; font-weight: 600;
const StatItem = ({ value, label }: { value: string, label: string }) => (
    <article className="flex flex-col items-center justify-center min-w-max" role="listitem">
        <span className="font-['DM_Sans'] text-[#1A1A1A] text-center block text-3xl md:text-[1.75rem] font-bold md:font-[700] leading-[normal] tracking-tight md:tracking-[-0.125rem]">
            {value}
        </span>
        <span className="font-['DM_Sans'] text-[#1A1A1A] text-[12px] md:text-[0.875rem] font-semibold md:font-[600] leading-[normal] mt-1 md:mt-2">
            {label}
        </span>
    </article>
);

export default AboutHero;
