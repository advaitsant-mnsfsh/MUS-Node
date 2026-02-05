import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Check } from 'lucide-react';

export const PricingPage: React.FC = () => {
    const { user } = useAuth();

    const plans = [
        {
            name: 'Free',
            price: '$0',
            period: 'forever',
            features: [
                '1 audit per month',
                'Basic UX analysis',
                'Standard report',
                'Email support'
            ],
            cta: 'Get Started',
            highlighted: false
        },
        {
            name: 'Pro',
            price: '$29',
            period: 'per month',
            features: [
                '10 audits per month',
                'Advanced UX analysis',
                'Detailed reports',
                'Competitor analysis',
                'Custom branding',
                'Priority support'
            ],
            cta: 'Start Pro Trial',
            highlighted: true
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: 'contact us',
            features: [
                'Unlimited audits',
                'API access',
                'White-label solution',
                'Custom integrations',
                'Dedicated support',
                'SLA guarantee'
            ],
            cta: 'Contact Sales',
            highlighted: false
        }
    ];

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-page-bg font-['DM_Sans']">
            <div className="max-w-7xl mx-auto px-4 py-16">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-text-primary mb-6">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                        Choose the plan that fits your needs. All plans include our AI-powered UX analysis.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`bg-white p-8 rounded-lg border-2 transition-all ${plan.highlighted
                                ? 'border-brand shadow-[4px_4px_0px_0px_var(--color-brand)] scale-105'
                                : 'border-border-main shadow-neo-hover'
                                }`}
                        >
                            {plan.highlighted && (
                                <div className="inline-block px-3 py-1 bg-brand text-white text-xs font-bold rounded-full mb-4">
                                    MOST POPULAR
                                </div>
                            )}
                            <h3 className="text-2xl font-bold text-text-primary mb-2">{plan.name}</h3>
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-text-primary">{plan.price}</span>
                                <span className="text-text-secondary ml-2">{plan.period}</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                                        <span className="text-text-secondary">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                to={user ? '/' : '/login'}
                                className={`block w-full px-6 py-3 font-bold text-center rounded-lg border-2 transition-all ${plan.highlighted
                                    ? 'bg-brand text-white border-brand hover:bg-brand-hover'
                                    : 'bg-white text-text-primary border-border-main hover:bg-slate-50'
                                    }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
