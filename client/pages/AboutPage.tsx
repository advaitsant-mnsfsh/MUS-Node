import React from 'react';
import { Brain, Target, Zap, Shield } from 'lucide-react';

export const AboutPage: React.FC = () => {
    return (
        <div className="min-h-[calc(100vh-5rem)] bg-page-bg font-['DM_Sans']">
            <div className="max-w-5xl mx-auto px-4 py-16">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-text-primary mb-6">
                        About UX Checkup
                    </h1>
                    <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                        AI-powered UX analysis that gives you actionable insights to improve your website's user experience
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-white p-8 rounded-lg border-2 border-border-main shadow-neo-hover">
                        <Brain className="w-12 h-12 text-brand mb-4" />
                        <h3 className="text-2xl font-bold text-text-primary mb-3">AI-Powered Analysis</h3>
                        <p className="text-text-secondary">
                            Our advanced AI analyzes your website using 250+ parameters to identify UX issues and opportunities for improvement.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-lg border-2 border-border-main shadow-neo-hover">
                        <Target className="w-12 h-12 text-brand mb-4" />
                        <h3 className="text-2xl font-bold text-text-primary mb-3">Actionable Insights</h3>
                        <p className="text-text-secondary">
                            Get specific, prioritized recommendations that you can implement immediately to improve user experience.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-lg border-2 border-border-main shadow-neo-hover">
                        <Zap className="w-12 h-12 text-brand mb-4" />
                        <h3 className="text-2xl font-bold text-text-primary mb-3">Fast Results</h3>
                        <p className="text-text-secondary">
                            Receive comprehensive UX analysis in minutes, not days. No lengthy manual audits required.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-lg border-2 border-border-main shadow-neo-hover">
                        <Shield className="w-12 h-12 text-brand mb-4" />
                        <h3 className="text-2xl font-bold text-text-primary mb-3">Competitor Analysis</h3>
                        <p className="text-text-secondary">
                            Compare your website against competitors to identify gaps and opportunities in your UX strategy.
                        </p>
                    </div>
                </div>

                {/* How It Works */}
                <div className="bg-white p-12 rounded-lg border-2 border-border-main shadow-neo-hover">
                    <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">How It Works</h2>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="shrink-0 w-10 h-10 bg-brand text-white rounded-full flex items-center justify-center font-bold">
                                1
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-text-primary mb-2">Submit Your URLs</h4>
                                <p className="text-text-secondary">
                                    Enter up to 5 URLs from your website or upload screenshots for analysis.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="shrink-0 w-10 h-10 bg-brand text-white rounded-full flex items-center justify-center font-bold">
                                2
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-text-primary mb-2">AI Analysis</h4>
                                <p className="text-text-secondary">
                                    Our AI analyzes your website's UX, checking layout, navigation, content, accessibility, and more.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="shrink-0 w-10 h-10 bg-brand text-white rounded-full flex items-center justify-center font-bold">
                                3
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-text-primary mb-2">Get Your Report</h4>
                                <p className="text-text-secondary">
                                    Receive a detailed report with scores, insights, and specific recommendations to improve your UX.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
