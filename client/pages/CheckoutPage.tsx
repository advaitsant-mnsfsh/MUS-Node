import React, { useState } from 'react';
import { Trash2, ChevronDown, CheckCircle2, Lock, MessageSquare, Check } from 'lucide-react';
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
                    onUnlock={() => {}} 
                    auditUrl="checkout" 
                    initialLoginMode={true}
                    onClose={() => navigate('/pricing')}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-page-bg text-text-primary font-sans pt-8 pb-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8">
                    
                    {/* Left Column: Cart Items */}
                    <div className="lg:col-span-8">
                        <h1 className="text-3xl md:text-[32px] font-bold tracking-tight mb-2 text-[#111111]">Your Cart</h1>
                        <p className="text-text-secondary text-sm md:text-[15px] mb-8">
                            MyUXScore is a trusted growth partner to millions of everyday entrepreneurs.
                        </p>

                        <div className="border border-report-border rounded-lg p-6 bg-white flex flex-col md:flex-row md:items-start justify-between">
                            <div className="flex items-start gap-5 flex-1">
                                <div className="flex-1 mt-1">
                                    <div className="relative inline-block w-44 mb-3">
                                        <select 
                                            value={selectedPlanIndex}
                                            onChange={(e) => setSelectedPlanIndex(Number(e.target.value))}
                                            className="appearance-none border border-report-border rounded-md px-3 py-2 text-[17px] font-bold w-full bg-white focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand pr-8 text-[#111111] cursor-pointer"
                                        >
                                            {PLANS.map((plan, idx) => (
                                                <option key={idx} value={idx}>{plan.title} Plan</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-primary pointer-events-none" />
                                    </div>
                                    
                                    <p className="text-[13px] text-text-secondary mb-5">{selectedPlan.description}</p>
                                    
                                    <div className="border-t border-[#E5E5E5] pt-4 pr-4">
                                        <h4 className="text-[13px] font-bold mb-3">What's included:</h4>
                                        <ul className="flex flex-col gap-2">
                                            {selectedPlan.features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" strokeWidth={3} />
                                                    <span className="text-[13px] font-medium text-text-primary">
                                                        {feature}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-row md:flex-col justify-between items-end mt-6 md:mt-1 gap-4">
                                <div className="text-[17px] font-bold text-[#0D8775] tracking-tight">{subtotalDisplay}</div>
                                <button className="text-gray-500 hover:text-black transition-colors mt-auto md:mb-1">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-[#F8F8F8] border border-[#EDEDED] rounded-lg p-7 pt-8">
                            <h2 className="text-[22px] font-bold mb-8 tracking-tight">Order Summary</h2>
                            
                            <div className="flex justify-between items-center mb-5 pb-5 border-b border-[#E5E5E5] text-[15px]">
                                <span className="text-text-primary font-medium">Billing Cycle</span>
                                <div className="relative inline-block w-32">
                                    <select 
                                        value={durationMonths}
                                        onChange={(e) => setDurationMonths(Number(e.target.value))}
                                        className="appearance-none border border-report-border rounded-md px-3 py-1.5 text-[14px] w-full bg-white focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand pr-8 font-medium cursor-pointer"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                                            <option key={month} value={month}>{month} Month{month > 1 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-primary pointer-events-none" />
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-end mb-4">
                                <span className="font-bold text-[17px]">Subtotal</span>
                                <span className="font-bold text-xl text-[#0D8775] tracking-tight">{subtotalDisplay}</span>
                            </div>
                            
                            <p className="text-[13px] text-text-secondary mb-3">
                                Subtotal does not include applicable taxes and fees
                            </p>
                            
                            <div className="mb-7 text-center">
                                <button className="text-[13px] font-bold underline decoration-1 underline-offset-2 text-text-primary hover:text-brand transition-colors">
                                    Have a promo code?
                                </button>
                            </div>
                            
                            <button className="w-full h-12 flex items-center justify-center bg-[#1A1A1A] text-white font-bold rounded-lg hover:bg-black transition-colors mb-7 text-sm">
                                Ready for Checkout
                            </button>
                            
                            <div className="flex flex-col items-center pt-2">
                                <div className="flex items-center gap-2 mb-3">
                                    <Lock className="w-4 h-4 text-text-primary" />
                                    <span className="text-[13px] font-bold">Secure Payment</span>
                                </div>
                                <div className="flex gap-2 mb-5">
                                    <div className="h-6 w-9 bg-white flex items-center justify-center text-[8px] font-bold border border-gray-200 text-blue-800 italic rounded-sm">VISA</div>
                                    <div className="h-6 w-9 bg-white flex items-center justify-center text-[8px] font-bold border border-gray-200 text-orange-600 rounded-sm">MC</div>
                                    <div className="h-6 w-9 bg-white flex items-center justify-center text-[8px] font-bold border border-gray-200 text-blue-500 rounded-sm">AMEX</div>
                                    <div className="h-6 w-9 bg-white flex items-center justify-center text-[8px] font-bold border border-gray-200 text-gray-800 rounded-sm">UPI</div>
                                </div>
                                <p className="text-[13px] text-center text-text-primary leading-[1.6]">
                                    We also accept Indian Debit Cards, UPI and Netbanking.
                                </p>
                            </div>
                        </div>
                        
                        <div className="mt-6 text-center px-4">
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <CheckCircle2 className="w-4 h-4 text-text-primary" />
                                <span className="text-[15px] font-bold">Quality You Can Trust</span>
                            </div>
                            <p className="text-[13px] text-text-primary leading-[1.6]">
                                Your MyUXScore Guides are available 24/7/365 to answer your questions and help you better understand your purchase.
                            </p>
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
            
            {/* Floating Contact Us */}
            <div className="fixed bottom-6 right-6">
                <button className="bg-white border border-report-border text-text-primary font-bold py-3 px-5 rounded-full shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-colors text-sm">
                    <MessageSquare className="w-5 h-5 text-text-primary" />
                    Contact Us
                </button>
            </div>
        </div>
    );
}
