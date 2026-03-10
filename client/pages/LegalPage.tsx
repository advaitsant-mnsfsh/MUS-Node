import React from 'react';
import { useNavigate } from 'react-router-dom';

const sections = [
    {
        id: '1',
        title: 'Service Overview',
        content:
            'MyUXScore is an AI-powered tool that analyzes websites and generates UX audit reports. Results are based on automated analysis and are intended to support, not replace, professional UX judgment.',
    },
    {
        id: '2',
        title: 'Use of the Service',
        content:
            'You must provide a valid URL or screenshot for analysis. You agree not to use the service for any unlawful or malicious purpose, and you are responsible for ensuring you have the right to analyze any website you submit.',
    },
    {
        id: '3',
        title: 'Accuracy of Reports',
        content:
            'Our reports are generated using AI and automated tools. While we put genuine effort into making them accurate and useful, results may not always be perfect. We recommend using them as a starting point alongside your own expertise.',
    },
    {
        id: '4',
        title: 'Intellectual Property',
        content:
            'All generated reports are for your private or commercial use. You may not resell or redistribute the core analysis engine or platform.',
    },
    {
        id: '5',
        title: 'Data & Privacy',
        content:
            'Submitted URLs and screenshots are stored on our servers to generate and retain your reports. We handle your data with care and do not share it with third parties for marketing or advertising purposes. For full details on how we handle your data, please refer to our Privacy Policy.',
    },
    {
        id: '6',
        title: 'Limitation of Liability',
        content:
            'We have built MyUXScore to be as helpful and reliable as possible. That said, audit reports are AI-generated and may occasionally miss things. We kindly ask that you use the reports as guidance rather than as a final verdict, and we cannot be held responsible for decisions made solely based on them.',
    },
    {
        id: '7',
        title: 'Changes to Terms',
        content:
            'We may update these terms occasionally. Continued use of the service after changes means you accept the revised terms.',
    },
    {
        id: '8',
        title: 'Contact',
        content: null,
        contactEmail: 'hello@myuxscore.com',
    },
];

const LegalPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white text-black font-sans bg-[radial-gradient(#E5E7EB_1px,transparent_1px)] bg-[size:32px_32px]">
            <div className="w-full max-w-3xl mx-auto px-6 pt-16 pb-24">

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-zinc-400 font-black text-[11px] uppercase tracking-[0.2em] mb-12 hover:text-black transition-colors group"
                >
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>

                {/* Header */}
                <div className="mb-14">
                    <img src="/logo.png" alt="MyUXScore Logo" className="h-10 w-auto object-contain mb-6" />
                    <div className="border-l-4 border-black pl-6">
                        <h1 className="text-5xl font-black uppercase leading-tight tracking-tighter">
                            Security,<br />Privacy &amp; Terms
                        </h1>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mt-3">
                            Last updated: March 10, 2026
                        </p>
                    </div>
                    <p className="text-base font-medium text-zinc-600 mt-6 leading-relaxed max-w-xl">
                        We believe in being straightforward about how MyUXScore works and how we handle your data. Here is everything you need to know.
                    </p>
                </div>

                {/* Indigo accent bar */}
                <div className="h-1.5 w-16 bg-[#6366f1] mb-14" />

                {/* Sections */}
                <div className="space-y-10">
                    {sections.map((section) => (
                        <div key={section.id} className="border-t-2 border-zinc-100 pt-8">
                            <div className="flex items-start gap-4">
                                <span className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.15em] mt-1 flex-shrink-0 w-6">
                                    {section.id}
                                </span>
                                <div>
                                    <h2 className="font-black uppercase tracking-tight text-black text-lg mb-3">
                                        {section.title}
                                    </h2>
                                    {section.content && (
                                        <p className="text-zinc-600 font-medium leading-relaxed text-[15px]">
                                            {section.content}
                                        </p>
                                    )}
                                    {section.contactEmail && (
                                        <p className="text-zinc-600 font-medium leading-relaxed text-[15px]">
                                            For any questions, reach out to us at{' '}
                                            <a
                                                href={`mailto:${section.contactEmail}`}
                                                className="font-black text-black underline underline-offset-4 decoration-2 hover:text-[#6366f1] transition-colors"
                                            >
                                                {section.contactEmail}
                                            </a>
                                            .
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer acknowledgement */}
                <div className="mt-16 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-500 leading-relaxed">
                        By using MyUXScore, you acknowledge that you have read and agree to these terms.
                    </p>
                </div>
            </div>

            {/* Page footer */}
            <footer className="border-t-2 border-zinc-100 py-8 px-6">
                <div className="max-w-3xl mx-auto flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    <span>© 2024 MYUXSCORE</span>
                    <span>Version 0.4.2-BETA</span>
                </div>
            </footer>
        </div>
    );
};

export default LegalPage;
