import React, { useState } from 'react';
import { ChevronDown, Lock, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthBlocker } from '../components/AuthBlocker';

const PLANS = [
    {
        title: "Begin",
        price: "$0",
        description: "For professionals looking to try our auditing tools",
        features: [
            "1 audit per month",
            "Basic UX analysis",
            "Standard report",
            "Email support",
        ],
    },
    {
        title: "Grow",
        price: "$29",
        description: "For independents and small agencies.",
        features: [
            "10 audits per month",
            "Advanced UX analysis",
            "Detailed reports",
            "Competitor analysis",
            "Custom branding",
            "Report Sharing",
        ],
    },
    {
        title: "Scale",
        price: "Custom Pricing",
        description:
            "For global teams that require a suite of auditing, compliance and support",
        features: [
            "Unlimited audits",
            "API access",
            "White-label solution",
            "Custom integrations",
            "Dedicated support",
            "SLA guarantee",
        ],
    },
];

export default function CheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isLoading } = useAuth();

    // Initialize state from location, default to Grow
    const initialPlanTitle = location.state?.plan?.title || "Grow";
    const initialPlanIndex = Math.max(0, PLANS.findIndex(p => p.title === initialPlanTitle));

    const [selectedPlanIndex, setSelectedPlanIndex] = useState(initialPlanIndex);
    const [durationMonths, setDurationMonths] = useState(1); // Default to 1 month as requested

    const selectedPlan = PLANS[selectedPlanIndex];

    // Calculate Subtotal dynamically based on duration
    let subtotalDisplay = selectedPlan.price;
    if (selectedPlan.price.startsWith("$") && selectedPlan.price !== "$0") {
        const basePrice = parseInt(selectedPlan.price.replace("$", ""));
        subtotalDisplay = `$${basePrice * durationMonths}.00`;
    }

    if (isLoading) {
        return <div className="min-h-screen bg-page-bg" />; // prevents flicker
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-page-bg relative">
                <AuthBlocker
                    isUnlocked={false}
                    onUnlock={() => { }}
                    auditUrl="checkout"
                    initialLoginMode={true}
                    onClose={() => navigate('/pricing')}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-page-bg text-text-primary font-sans pt-12 md:pt-20 lg:pt-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* Back Navigation */}
                <div className="lg:max-w-5xl lg:mx-auto mb-6">
                    <button
                        onClick={() => navigate('/pricing')}
                        className="flex items-center gap-2 text-[14px] font-bold text-text-secondary hover:text-[#111111] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Pricing
                    </button>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-11 gap-8 lg:gap-12 mt-8 lg:max-w-5xl lg:mx-auto">

                    {/* Left Column: Plan Info */}
                    <div className="lg:col-span-5">
                        <h1 className="text-3xl md:text-[32px] font-bold tracking-tight mb-2 text-[#111111]">Subscribe</h1>
                        <p className="text-text-secondary text-sm md:text-[15px] mb-8">
                            MyUXScore is a trusted growth partner to millions of everyday entrepreneurs.
                        </p>

                        <div className="border border-report-border rounded-lg p-6 bg-white shadow-sm">
                            <div className="mb-6">
                                <label className="block text-[13px] font-bold text-[#111111] mb-2">Selected Plan</label>
                                <div className="relative inline-block w-full">
                                    <select
                                        value={selectedPlanIndex}
                                        onChange={(e) => setSelectedPlanIndex(Number(e.target.value))}
                                        className="appearance-none border border-report-border rounded-md px-4 py-3 text-[15px] font-bold w-full bg-[#F8F8F8] focus:outline-none focus:ring-1 focus:ring-[#111111] focus:border-[#111111] pr-8 text-[#111111] cursor-pointer"
                                    >
                                        {PLANS.map((plan, idx) => (
                                            <option key={idx} value={idx}>{plan.title} Plan - {plan.price}/mo</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-primary pointer-events-none" />
                                </div>
                                <p className="text-[13px] text-text-secondary mt-3">{selectedPlan.description}</p>
                            </div>

                            <div className="border-t border-[#E5E5E5] pt-6">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[15px] text-text-secondary font-medium">Subtotal</span>
                                    <span className="font-bold text-[#111111] text-[15px]">{selectedPlan.price}</span>
                                </div>
                                <button className="text-[13px] font-bold text-text-secondary underline decoration-1 underline-offset-2 hover:text-brand transition-colors mb-5">
                                    Add promotion code
                                </button>
                                <div className="flex justify-between items-center pt-4 border-t border-[#E5E5E5]">
                                    <span className="font-bold text-[16px] text-[#111111]">Total due today</span>
                                    <span className="font-bold text-2xl text-[#0D8775] tracking-tight">{subtotalDisplay}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Checkout Payment */}
                    <div className="lg:col-span-5 lg:col-start-7">
                        <div className="bg-white border border-report-border rounded-lg p-7 pt-8 shadow-sm">
                            <h2 className="text-[22px] font-bold mb-6 tracking-tight text-[#111111]">Checkout</h2>

                            <div className="flex justify-between items-center mb-6 pb-6 border-b border-[#E5E5E5]">
                                <span className="font-bold text-[14px] text-[#111111]">Billing Cycle</span>
                                <div className="relative inline-block w-40">
                                    <select
                                        value={durationMonths}
                                        onChange={(e) => setDurationMonths(Number(e.target.value))}
                                        className="appearance-none border border-report-border rounded-md px-3 py-2 text-[14px] w-full bg-[#F8F8F8] focus:outline-none focus:ring-1 focus:ring-[#111111] focus:border-[#111111] pr-8 font-medium cursor-pointer text-[#111111]"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                                            <option key={month} value={month}>{month} Month{month > 1 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-primary pointer-events-none" />
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="font-bold text-[14px] mb-3 text-[#111111]">Contact Information</h3>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    readOnly
                                    placeholder="Email address"
                                    className="w-full border border-report-border rounded-md px-4 py-3 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#111111] focus:border-[#111111] text-[#111111] bg-[#F8F8F8]"
                                />
                            </div>

                            <button className="w-full h-[48px] flex items-center justify-center bg-[#111111] text-white font-bold rounded-lg hover:bg-black transition-colors mb-8 text-[15px] mt-2 shadow-sm">
                                Ready for Checkout
                            </button>

                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="flex items-center gap-2 mb-4 text-[#111111]">
                                    <Lock className="w-4 h-4" strokeWidth={2.5} />
                                    <span className="font-bold text-[15px]">Secure Payment</span>
                                </div>

                                <div className="flex items-center justify-center gap-2.5 mb-5">
                                    <div className="h-8 px-2.5 bg-white border border-[#E5E5E5] rounded flex items-center justify-center text-[11px] text-blue-800 font-bold tracking-wide">VISA</div>
                                    <div className="h-8 px-2.5 bg-white border border-[#E5E5E5] rounded flex items-center justify-center text-[11px] text-orange-600 font-bold tracking-wide">MC</div>
                                    <div className="h-8 px-2.5 bg-white border border-[#E5E5E5] rounded flex items-center justify-center text-[11px] text-blue-500 font-bold tracking-wide">AMEX</div>
                                    <div className="h-8 px-2.5 bg-white border border-[#E5E5E5] rounded flex items-center justify-center text-[11px] text-black font-bold tracking-wide">UPI</div>
                                </div>

                                <p className="text-[13px] text-[#444444] font-medium max-w-[260px] leading-relaxed mx-auto">
                                    We also accept Indian Debit Cards, UPI and Netbanking.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer */}
            <div className="mt-24 border-t border-[#E5E5E5] pt-10 pb-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-[13px] text-text-secondary mb-3">
                        © {new Date().getFullYear()} MyUXScore. All rights reserved. <a href="/legal" className="underline decoration-1 underline-offset-2 hover:text-black">Privacy Policy</a>
                    </p>
                    <p className="text-[13px] text-text-primary underline decoration-1 underline-offset-2 hover:text-brand cursor-pointer inline-block">
                        Do not sell my personal information
                    </p>
                </div>
            </div>

        </div>
    );
}
