import React from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * PricingCTA Component
 */
const PricingCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="font-['DM_Sans'] relative flex w-full flex-col items-center justify-center gap-10 overflow-hidden bg-[#FFFEF9] px-4 py-[4.25rem] sm:gap-11 md:gap-12 md:py-[4.75rem] lg:py-20">
      <h2 className="relative z-10 max-w-4xl px-2 text-center text-2xl font-bold leading-tight tracking-tight text-balance text-[#1A1A1A] md:text-[40px]">
        Hear what you need. No BS.
        <br />
        Just Actionable Insights.
      </h2>
      <button
        onClick={() => navigate("/")}
        className="group relative z-10 inline-flex h-14 w-full max-w-[280px] shrink-0 items-center justify-center gap-2 border-[3px] border-black bg-[#F4D067] px-6 text-lg font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none sm:h-16 sm:max-w-none sm:w-72 sm:border-4 sm:px-8 sm:text-2xl"
      >
        Get your score
        <div className="bg-black text-white rounded-full p-1 transition-transform group-hover:rotate-45">
          <ArrowRight size={18} />
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
