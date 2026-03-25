import React from "react";
import PricingHero from "../components/pricing/PricingHero";
import PricingCard from "../components/pricing/PricingCard";
import ComparisonTable from "../components/pricing/ComparisonTable";
import FAQSection from "../components/pricing/FAQSection";
import PricingCTA from "../components/pricing/PricingCTA";
import Footer from "../components/Footer";

const PricingPage: React.FC = () => {
  const plans = [
    {
      title: "Begin",
      price: "$0",
      description: "For professionals looking to try our auditing tools",
      buttonText: "Access Now",
      isHighlighted: true,
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
      buttonText: "Coming Soon",

      badge: "Most Popular",
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
      price: "Prices Tailored for you :)",
      description:
        "For global teams that require a suite of auditing, compliance and support",
      buttonText: "Contact Us",
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

  return (
    <div className="relative w-full overflow-x-hidden bg-[#FFFEF9] font-['DM_Sans']">
      <PricingHero />

      {/* Inter-Section Decorative Rings — scale like API Keys page */}
      <img
        src="/ring-left-center.png"
        alt=""
        className="pointer-events-none absolute left-0 top-[min(52vh,420px)] z-0 h-auto w-[48px] select-none sm:w-[56px] md:top-[400px] md:w-[64px] lg:w-[80px]"
        aria-hidden
      />
      <img
        src="/ring-right-center.png"
        alt=""
        className="pointer-events-none absolute right-0 top-[min(60vh,520px)] z-0 h-auto w-[48px] select-none sm:w-[56px] md:top-[550px] md:w-[64px] lg:w-[80px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto mt-10 w-full max-w-[1440px] px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-16 xl:px-[140px]">
        <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-5 md:grid-cols-3 md:gap-6">
          {plans.map((plan, index) => (
            <PricingCard key={index} {...plan} />
          ))}
        </div>
      </div>

      <ComparisonTable />

      <FAQSection />

      <PricingCTA />
      <Footer />
    </div>
  );
};

export default PricingPage;
