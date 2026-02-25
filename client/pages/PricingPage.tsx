import React from 'react';
import PricingHero from '../components/pricing/PricingHero';
import PricingCard from '../components/pricing/PricingCard';
import ComparisonTable from '../components/pricing/ComparisonTable';
import FAQSection from '../components/pricing/FAQSection';
import PricingCTA from '../components/pricing/PricingCTA';
import PricingFooter from '../components/pricing/PricingFooter';

const PricingPage: React.FC = () => {
    const plans = [
        {
            title: "Begin",
            price: "$0",
            description: "For professionals looking to try our auditing tools",
            buttonText: "Get Free Audit",
            features: [
                "1 audit per month",
                "Basic UX analysis",
                "Standard report",
                "Email support"
            ]
        },
        {
            title: "Grow",
            price: "$29",
            description: "For independents and small agencies.",
            buttonText: "Start Trial",
            isHighlighted: true,
            badge: "Most Popular",
            features: [
                "10 audits per month",
                "Advanced UX analysis",
                "Detailed reports",
                "Competitor analysis",
                "Custom branding",
                "Report Sharing"
            ]
        },
        {
            title: "Scale",
            price: "Prices Tailored for you :)",
            description: "For global teams that require a suite of auditing, compliance and support",
            buttonText: "Contact Us",
            features: [
                "Unlimited audits",
                "API access",
                "White-label solution",
                "Custom integrations",
                "Dedicated support",
                "SLA guarantee"
            ]
        }

    ];

    return (
        <div className="min-h-screen bg-[#FFFEF9] font-sans relative overflow-x-hidden">
            <PricingHero />

            {/* Inter-Section Decorative Rings */}
            <img
                src="/ring-left-center.png"
                alt=""
                className="absolute top-[400px] left-0 w-[60px] md:w-[80px] h-auto pointer-events-none select-none z-0"
            />
            <img
                src="/ring-right-center.png"
                alt=""
                className="absolute top-[550px] right-0 w-[60px] md:w-[80px] h-auto pointer-events-none select-none z-0"
            />

            <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-[140px] mt-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan, index) => (
                        <PricingCard key={index} {...plan} />
                    ))}
                </div>
            </div>


            <ComparisonTable />

            <FAQSection />

            <PricingCTA />

            <PricingFooter />
        </div>
    );
};

export default PricingPage;
