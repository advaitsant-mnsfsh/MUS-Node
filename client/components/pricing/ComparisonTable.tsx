import React from 'react';
import { Check, ArrowUpRight } from 'lucide-react';

/**
 * ComparisonTable Component
 */
const ComparisonTable = () => {
    const features = [
        { name: "Audits per Month", begin: "1 per month", grow: "10 per month", scale: "Unlimited" },
        { name: "UX Analysis Type", begin: "Basic", grow: "Advanced", scale: "Advanced" },
        { name: "Competitor Analysis", begin: null, grow: "Inlcuded", scale: "Inlcuded" },
        { name: "Report Detail", begin: "Standard", grow: "Detailed", scale: "Detailed" },
        { name: "Custom Branding", begin: null, grow: "Inlcuded", scale: "White Label" },
        { name: "API Access", begin: null, grow: null, scale: "Inlcuded" },
        { name: "Custom Integrations", begin: null, grow: null, scale: "Inlcuded" },
        { name: "Support Level", begin: "Email Support", grow: "Priority Support", scale: "Dedicated Support" },
        { name: "SLA Guarantee", begin: null, grow: null, scale: "Inlcuded" },
    ];

    return (
        <div className="font-['DM_Sans'] mx-auto mt-16 max-w-[1440px] px-4 sm:mt-24 sm:px-6 md:mt-28 lg:mt-32 lg:px-16 xl:px-[144px]">
            <div className="mb-8 sm:mb-12 md:mb-16">
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-gray-500 sm:mb-3 sm:text-sm md:mb-4">
                    Compare plans
                </p>
                <h2 className="text-2xl font-bold leading-tight tracking-tight text-balance text-[#1A1A1A] md:text-[40px]">
                    Pick your poison,
                    <br />
                    to match your team&apos;s needs
                </h2>
            </div>

            <div className="w-full">
                <div className="flex w-full max-w-[1152px] justify-between border-b border-gray-100 bg-[#FFFEF9] py-3 sm:py-4 lg:py-8">
                    <div className="w-2/5 lg:w-[360px] shrink-0 pr-2 lg:pr-4"></div>
                    <div className="w-1/5 lg:w-[188px] shrink-0 text-left">
                        <h4 className="text-[16px] lg:text-[20px] font-bold text-[#1A1A1A] mb-1 leading-tight">Begin</h4>
                        <p className="text-[#1A1A1A]/60 mb-2 lg:mb-4 text-[12px] lg:text-[14px] font-medium leading-tight">$0/m</p>
                        <a href="#" className="inline-flex items-center text-[#A18249] text-[14px] lg:text-[16px] font-bold hover:underline">
                            <span className="hidden md:inline">Try now</span>
                            <span className="md:hidden">Try</span>
                            <ArrowUpRight className="ml-1 w-3 h-3 lg:w-4 lg:h-4" />
                        </a>
                    </div>
                    <div className="w-1/5 lg:w-[188px] shrink-0 text-left">
                        <h4 className="text-[16px] lg:text-[20px] font-bold text-[#1A1A1A] mb-1 leading-tight">Grow</h4>
                        <p className="text-[#1A1A1A]/60 mb-2 lg:mb-4 text-[12px] lg:text-[14px] font-medium leading-tight">$29/m</p>
                        <a href="#" className="inline-flex items-center text-[#A18249] text-[14px] lg:text-[16px] font-bold hover:underline">
                            <span className="hidden md:inline">Sign Up</span>
                            <span className="md:hidden">Join</span>
                            <ArrowUpRight className="ml-1 w-3 h-3 lg:w-4 lg:h-4" />
                        </a>
                    </div>
                    <div className="w-1/5 lg:w-[188px] shrink-0 text-left">
                        <h4 className="text-[16px] lg:text-[20px] font-bold text-[#1A1A1A] mb-1 leading-tight">Scale</h4>
                        <p className="text-[#1A1A1A]/60 mb-2 lg:mb-4 text-[12px] lg:text-[14px] font-medium leading-tight hidden lg:block">Tailored for you :)</p>
                        <p className="text-[#1A1A1A]/60 mb-2 lg:mb-4 text-[12px] lg:text-[14px] font-medium leading-tight block lg:hidden">Custom</p>
                        <a href="#" className="inline-flex items-center text-[#A18249] text-[14px] lg:text-[16px] font-bold hover:underline">
                            <span className="hidden md:inline">Contact Us</span>
                            <span className="md:hidden">Contact</span>
                            <ArrowUpRight className="ml-1 w-3 h-3 lg:w-4 lg:h-4" />
                        </a>
                    </div>
                </div>

                <div className="flex flex-col">
                    {features.map((feature, idx) => (
                        <div key={idx} className="flex w-full max-w-[1152px] items-center justify-between border-b border-gray-100 py-3 transition-colors hover:bg-gray-50/50 sm:py-4 lg:py-8">
                            <div className="w-2/5 lg:w-[360px] shrink-0 pr-2 lg:pr-4">
                                <span className="text-[#1A1A1A] font-bold text-[13px] lg:text-[16px] leading-tight">{feature.name}</span>
                            </div>
                            <div className="w-1/5 lg:w-[188px] shrink-0 flex items-center justify-start">
                                {feature.begin ? (
                                    <div className="flex items-center gap-1 lg:gap-2">
                                        <Check className="w-3 h-3 lg:w-4 lg:h-4 text-green-600 shrink-0" />
                                        <span className="text-[#1A1A1A]/80 text-[12px] lg:text-[14px] font-medium leading-tight">{feature.begin}</span>
                                    </div>
                                ) : (
                                    <div className="h-[2px] w-3 lg:w-4 bg-gray-200" />
                                )}
                            </div>
                            <div className="w-1/5 lg:w-[188px] shrink-0 flex items-center justify-start">
                                {feature.grow ? (
                                    <div className="flex items-center gap-1 lg:gap-2">
                                        <Check className="w-3 h-3 lg:w-4 lg:h-4 text-green-600 shrink-0" />
                                        <span className="text-[#1A1A1A]/80 text-[12px] lg:text-[14px] font-medium leading-tight">{feature.grow}</span>
                                    </div>
                                ) : (
                                    <div className="h-[2px] w-3 lg:w-4 bg-gray-200" />
                                )}
                            </div>
                            <div className="w-1/5 lg:w-[188px] shrink-0 flex items-center justify-start">
                                {feature.scale ? (
                                    <div className="flex items-center gap-1 lg:gap-2">
                                        <Check className="w-3 h-3 lg:w-4 lg:h-4 text-green-600 shrink-0" />
                                        <span className="text-[#1A1A1A]/80 text-[12px] lg:text-[14px] font-medium leading-tight">{feature.scale}</span>
                                    </div>
                                ) : (
                                    <div className="h-[2px] w-3 lg:w-4 bg-gray-200" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ComparisonTable;
