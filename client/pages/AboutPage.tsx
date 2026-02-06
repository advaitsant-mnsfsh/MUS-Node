import React from 'react';
import { Target, Zap, Shield, Search, Layout, Smartphone, Lock, Eye, CheckCircle } from 'lucide-react';
import { Footer } from '../components/Footer';

export const AboutPage: React.FC = () => {
    return (
        <div className="min-h-[calc(100vh-5rem)] bg-page-bg font-['DM_Sans'] flex flex-col">
            <div className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">

                {/* 1. Header Section */}
                <section className="text-center space-y-6 max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight">
                        We Fix What Your <br />
                        <span className="text-brand">Users Hate.</span>
                    </h1>
                    <p className="text-xl text-text-secondary leading-relaxed">
                        Data-driven UX analysis that turns "meh" websites into conversion machines.
                        No vague opinions—just actionable, brutal honesty.
                    </p>
                </section>

                {/* 2. Mission Section */}
                <section className="bg-white p-8 md:p-12 rounded-xl border-2 border-border-main shadow-neo">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1 space-y-4">
                            <h2 className="text-2xl md:text-3xl font-bold text-text-primary uppercase tracking-wide flex items-center gap-3">
                                <Target className="w-8 h-8 text-brand" />
                                Our Mission
                            </h2>
                            <p className="text-lg text-text-secondary">
                                Most websites fail not because of what they lack, but because of what they ignore.
                                Our mission is to democratize high-end UX auditing. We believe every business deserves
                                a website that works flawlessly, communicates clearly, and converts effectively.
                            </p>
                            <p className="text-lg text-text-secondary font-medium">
                                We combine AI precision with design principles to catch clear errors before your users do.
                            </p>
                        </div>
                        {/* Decorative or Abstract Visual */}
                        <div className="w-full md:w-1/3 flex justify-center">
                            <div className="relative w-48 h-48 bg-accent-yellow rounded-full border-2 border-black flex items-center justify-center shadow-neo-sm rotate-3">
                                <div className="absolute inset-0 border-2 border-black rounded-full -translate-x-2 -translate-y-2"></div>
                                <Zap className="w-20 h-20 text-text-primary" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. How It Works Section */}
                <section className="space-y-10">
                    <div className="text-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-text-primary inline-block bg-accent-cyan/10 px-6 py-2 rounded-full border-2 border-accent-cyan">
                            How It Works
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="bg-white p-8 rounded-lg border-2 border-border-main hover:shadow-neo transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-brand group-hover:scale-110 transition-transform">01</div>
                            <div className="w-12 h-12 bg-brand text-white rounded-lg flex items-center justify-center mb-6 border-2 border-black shadow-neo-sm">
                                <Search className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-3">Analyze</h3>
                            <p className="text-text-secondary">
                                Submit your URL. Our AI scans your site against 250+ UX parameters, checking layout, accessibility, and clarity.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white p-8 rounded-lg border-2 border-border-main hover:shadow-neo transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-brand group-hover:scale-110 transition-transform">02</div>
                            <div className="w-12 h-12 bg-accent-yellow text-black rounded-lg flex items-center justify-center mb-6 border-2 border-black shadow-neo-sm">
                                <Layout className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-3">Benchmark</h3>
                            <p className="text-text-secondary">
                                We compare your metrics against industry standards and even your direct competitors to see where you stand.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white p-8 rounded-lg border-2 border-border-main hover:shadow-neo transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-brand group-hover:scale-110 transition-transform">03</div>
                            <div className="w-12 h-12 bg-accent-cyan text-black rounded-lg flex items-center justify-center mb-6 border-2 border-black shadow-neo-sm">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-3">Optimize</h3>
                            <p className="text-text-secondary">
                                Get a scored report with prioritized "Fix Now" items. Implement the changes and watch your conversion rate grow.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 4. What We Check Section */}
                <section>
                    <div className="bg-text-primary text-white rounded-xl p-8 md:p-16 border-2 border-black shadow-neo overflow-hidden relative">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[16px_16px]"></div>

                        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
                            <h2 className="text-3xl md:text-4xl font-bold">What We Check</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-left">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-accent-green shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-lg">Visual Hierarchy</h4>
                                        <p className="text-slate-300 text-sm">Does the user know where to look?</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-accent-green shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-lg">Mobile Responsiveness</h4>
                                        <p className="text-slate-300 text-sm">Does it break on small screens?</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-accent-green shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-lg">Accessibility (a11y)</h4>
                                        <p className="text-slate-300 text-sm">Can everyone use your site?</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-accent-green shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-lg">Load Performance</h4>
                                        <p className="text-slate-300 text-sm">Is it fast enough to keep attention?</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-accent-green shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-lg">Microcopy & Clarity</h4>
                                        <p className="text-slate-300 text-sm">Are you confusing your users?</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-accent-green shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-lg">Trust Signals</h4>
                                        <p className="text-slate-300 text-sm">Do users feel safe buying?</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </div>

            {/* 5. Footer */}
            <Footer />
        </div>
    );
};

export default AboutPage;
