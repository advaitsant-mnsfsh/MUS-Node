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
        <div className="flex flex-col items-center justify-center w-full max-w-[min(100%,73.3125rem)] gap-[0.75rem] pb-16 md:pb-[153px] relative z-10 mx-auto">
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
const StatItem = ({ value, label }: { value: string; label: string }) => (
  <article
    className="flex flex-col items-center justify-center min-w-0 max-w-[11rem] sm:max-w-none px-1"
    role="listitem"
  >
    <span className="font-['DM_Sans'] text-[#1A1A1A] text-center block text-3xl md:text-[1.75rem] font-bold md:font-[700] leading-[normal] tracking-tight md:tracking-[-0.125rem]">
      {value}
    </span>
    <span className="font-['DM_Sans'] text-[#1A1A1A] text-[12px] md:text-[0.875rem] font-semibold md:font-[600] leading-[normal] mt-1 md:mt-2">
      {label}
    </span>
  </article>
);

export default AboutHero;
