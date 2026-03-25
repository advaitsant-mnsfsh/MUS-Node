import React from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * PricingCTA Component
 */
const PricingCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="font-['DM_Sans'] relative flex w-full flex-col items-center justify-center gap-7 overflow-hidden bg-[#FFFEF9] px-4 py-12 sm:gap-10 sm:py-14 md:gap-12 md:py-[4.75rem] lg:py-20">
      <h2 className="relative z-10 max-w-4xl px-1 text-center text-xl font-bold leading-tight tracking-tight text-balance text-[#1A1A1A] sm:text-2xl md:text-[40px]">
        Hear what you need. No BS.
        <br />
        Just Actionable Insights.
      </h2>
      <button
        onClick={() => navigate("/")}
        className="group relative z-10 inline-flex h-11 w-full max-w-[260px] shrink-0 items-center justify-center gap-2 rounded-lg border-1 border-border-main bg-[#F4D067] px-5 text-sm font-bold text-black shadow-neo transition-all duration-200 hover:-translate-x-px hover:-translate-y-px hover:shadow-neo-hover active:translate-x-0 active:translate-y-0 active:shadow-neo sm:h-14 sm:max-w-[280px] sm:px-6 sm:text-lg md:h-16 md:max-w-none md:w-72 md:px-8 md:text-2xl"
      >
        Get your score
        <div className="rounded-full border-1 border-border-main bg-text-primary p-0.5 text-white transition-transform group-hover:rotate-45 sm:p-1">
          <ArrowRight className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
        </div>
      </button>

      {/* Decorative Ring Element */}
      <img
        src="/ring-near-bottom-cta-right.png"
        alt=""
        className="absolute top-1/2 -translate-y-1/2 right-0 w-[30px] md:w-[40px] h-auto pointer-events-none select-none z-0"
      />
    </section>
  );
};

export default PricingCTA;
