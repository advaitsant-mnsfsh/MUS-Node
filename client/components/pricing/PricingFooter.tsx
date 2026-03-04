import React from 'react';
import { ArrowUpRight } from 'lucide-react';

/**
 * PricingFooter Component
 * Re-designed for massive watermark and specific link styles.
 */
const PricingFooter = () => {
    return (
        <footer className="relative bg-[#F4D067] w-full h-[520px] pt-[70px] flex flex-col gap-[84px] overflow-hidden">
            <div className="w-full max-w-[1440px] mx-auto px-8 lg:px-[144px] relative z-10 flex flex-col md:flex-row gap-[164px]">
                {/* Logo / Tagline Column */}
                <div className="w-full md:w-[509px] shrink-0">
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-black tracking-tight">
                            Made with love by Team MyUXScore
                        </h3>
                        <p className="text-[#666666] font-medium text-base">
                            © 2026 MyUXScore. All rights reserved.
                        </p>
                    </div>
                </div>

                {/* Links Grid */}
                <div className="w-full md:w-[559px] shrink-0 flex justify-between h-[111px]">
                    {/* Product Section */}
                    <div className="flex flex-col gap-6">
                        <h4 className="text-[16px] font-semibold text-black">Product</h4>
                        <ul className="space-y-4 text-[14px] font-normal text-[#666666]">
                            <li><a href="#" className="hover:text-black transition-colors">Assess Now</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">My Reports</a></li>
                            <li>
                                <a href="#" className="hover:text-black transition-colors border-black/30 pb-0.5">
                                    Feedback
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Resources Section */}
                    <div className="flex flex-col gap-6">
                        <h4 className="text-[16px] font-semibold text-black">Resources</h4>
                        <ul className="space-y-4 text-[14px] font-normal text-[#666666]">
                            <li><a href="#" className="hover:text-black transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">API Keys</a></li>
                            <li><a href="#" className="hover:text-black transition-colors">Pricing</a></li>
                        </ul>
                    </div>

                    {/* Reach Section */}
                    <div className="flex flex-col gap-6">
                        <h4 className="text-[16px] font-semibold text-black">Reach</h4>
                        <ul className="space-y-4 text-[14px] font-normal text-[#666666]">
                            <li className="flex items-center gap-1.5 group">
                                <a href="#" className="hover:text-black transition-colors flex items-center gap-1">
                                    <ArrowUpRight size={14} className="text-[#666] group-hover:text-black" />
                                    LinkedIn
                                </a>
                            </li>
                            <li className="flex items-center gap-1.5 group">
                                <a href="#" className="hover:text-black transition-colors flex items-center gap-1">
                                    <ArrowUpRight size={14} className="text-[#666] group-hover:text-black" />
                                    YouTube
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Massive Background Watermark Text - Exact Match to Screenshot */}
            <div className="w-full flex justify-center items-end select-none pointer-events-none opacity-[0.07] mt-auto z-2">
                <div className="flex items-baseline  leading-[0.75] text-[15vw] lg:text-[21vw] whitespace-nowrap">
                    <span className="font-light text-[#1A1A1A]">my</span>
                    <span className="font-black">ux</span>
                    <span className="font-light">score</span>
                </div>
            </div>
        </footer>
    );
};

export default PricingFooter;
