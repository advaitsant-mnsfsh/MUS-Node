import React from "react";

/**
 * AboutHero Component - TAILWIND BEST PRACTICES VERSION
 * - Standard classes used where they match the 4px scale (e.g., pt-30 for 120px).
 * - Arbitrary values [] used only for non-standard Figma specific measurements.
 * - Fully Responsive & SEO Friendly.
 */

const AboutHero = () => {
  const brands = [
    {
      id: 1,
      name: "Ministry of Education",
      alt: "Ministry of Education Government of India Logo",
      path: "/About Page/brand-logo-1.svg",
    },
    {
      id: 2,
      name: "Operabase",
      alt: "Operabase Logo",
      path: "/About Page/brand-logo-2.png",
    },
    {
      id: 3,
      name: "TransUnion",
      alt: "TransUnion Credit Reporting Agency Logo",
      path: "/About Page/brand-logo-3.png",
    },
    {
      id: 4,
      name: "Dasera",
      alt: "Dasera Data Security Logo",
      path: "/About Page/brand-logo-4.png",
    },
    {
      id: 5,
      name: "Climate-KIC",
      alt: "EIT Climate-KIC Logo",
      path: "/About Page/brand-logo-5.png",
    },
    {
      id: 6,
      name: "Funded by EU",
      alt: "Funded by the European Union Logo",
      path: "/About Page/brand-logo-6.png",
    },
  ];

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative w-full max-w-full min-w-0 overflow-hidden bg-[#FFFEF9] px-4 pb-10 pt-12 font-['DM_Sans'] sm:px-6 sm:pb-12 sm:pt-14 md:pb-16 md:pt-16 lg:pb-20 lg:pt-20"
    >
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
      {/* Main Content Wrapper — vertical rhythm aligned with API Keys / Pricing heroes */}
      <div className="relative z-[1] mx-auto flex w-full max-w-[1173px] flex-col items-center gap-16 md:gap-28">
        {/* --- Top Section: Heading and Stats — heading block matches PricingHero exactly --- */}
        <div className="relative z-10 flex w-full flex-col items-center gap-10 md:gap-14">
          <div className="relative z-[1] mx-auto flex w-full shrink-0 flex-col items-center justify-center text-center">
            <h1
              id="hero-heading"
              className="m-0 w-full max-w-[601px] text-center text-[26px] font-normal leading-[1.2] tracking-[-0.04em] text-[#1a1a1a] sm:text-[30px] sm:leading-[1.15] sm:tracking-[-0.05em] md:text-[36px] lg:text-[40px] lg:tracking-[-0.025em]"
            >
              Find the Truth behind User{" "}
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

          {/* Stats — one horizontal row on all breakpoints (equal thirds on small screens) */}
          <div
            className="flex w-full max-w-xl flex-row flex-nowrap items-start justify-between gap-1.5 sm:max-w-2xl sm:gap-3 md:w-[42.25rem] md:max-w-none md:gap-0"
            role="list"
          >
            <StatItem value="20+" label="Years of Combined Experience" />
            <StatItem value="<5min" label="Audit Creation Time" />
            <StatItem value="110+" label="UX parameters Checked :)" />
          </div>
        </div>

        {/* --- Bottom Section: Brand Logos --- */}
        <div className="relative z-10 mx-auto flex w-full max-w-[min(100%,73.3125rem)] flex-col items-center justify-center gap-5 pb-16 sm:gap-6 md:gap-7 md:pb-[153px]">
          <p className="m-0 font-['DM_Sans'] text-base font-semibold text-[#1A1A1A] md:text-[16px]">
            Our Audits are trusted by:
          </p>

          <div className="flex w-full flex-wrap items-start justify-center gap-x-5 gap-y-7 self-stretch sm:gap-x-6 sm:gap-y-8 md:gap-x-8 lg:flex-nowrap lg:gap-[2rem]">
            {brands.map((brand) => (
              <figure
                key={brand.id}
                className="m-0 flex h-[4rem] w-[40%] shrink-0 flex-col items-center justify-between bg-transparent sm:w-[30%] md:h-[7.5rem] md:w-[11.375rem]"
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
const StatItem = ({ value, label }: { value: string; label: string }) => (
  <article
    className="flex min-w-0 flex-1 flex-col items-center justify-start px-0.5 text-center sm:px-1"
    role="listitem"
  >
    <span className="block font-['DM_Sans'] text-lg font-bold leading-none tracking-tight text-[#1A1A1A] sm:text-2xl md:text-[1.75rem] md:font-[700] md:leading-[normal] md:tracking-[-0.125rem]">
      {value}
    </span>
    <span className="mt-1 font-['DM_Sans'] text-[10px] font-semibold leading-snug text-[#1A1A1A] sm:text-xs md:mt-2 md:text-[0.875rem] md:font-[600] md:leading-[normal]">
      {label}
    </span>
  </article>
);

export default AboutHero;
