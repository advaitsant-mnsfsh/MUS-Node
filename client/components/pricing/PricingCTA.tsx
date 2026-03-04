import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * PricingCTA Component
 */
const PricingCTA = () => {
    return (
        <section className="w-full py-20 px-4 flex flex-col items-center justify-center gap-12 bg-[#FFFEF9] relative overflow-hidden">
            <h2 className="text-5xl font-bold text-gray-900 max-w-4xl text-center leading-tight relative z-10">
                Hear what you need. No BS.<br />Just Actionable Insights.
            </h2>
            <button className="inline-flex justify-center items-center gap-2 bg-[#F4D067] text-black text-2xl font-bold border-4 border-black px-8 h-16 w-72 shadow-[6px_6px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group shrink-0 relative z-10">
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
