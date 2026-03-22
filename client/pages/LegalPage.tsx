import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const sections = [
    {
        id: '1',
        title: 'Service overview',
        content:
            'MyUXScore is an AI-powered tool that analyzes websites and generates UX audit reports. Results are based on automated analysis and are intended to support, not replace, professional UX judgment.',
    },
    {
        id: '2',
        title: 'Use of the service',
        content:
            'You must provide a valid URL or screenshot for analysis. You agree not to use the service for any unlawful or malicious purpose, and you are responsible for ensuring you have the right to analyze any website you submit.',
    },
    {
        id: '3',
        title: 'Accuracy of reports',
        content:
            'Our reports are generated using AI and automated tools. While we put genuine effort into making them accurate and useful, results may not always be perfect. We recommend using them as a starting point alongside your own expertise.',
    },
    {
        id: '4',
        title: 'Intellectual property',
        content:
            'All generated reports are for your private or commercial use. You may not resell or redistribute the core analysis engine or platform.',
    },
    {
        id: '5',
        title: 'Data & privacy',
        content:
            'Submitted URLs and screenshots are stored on our servers to generate and retain your reports. We handle your data with care and do not share it with third parties for marketing or advertising purposes. For full details on how we handle your data, please refer to our Privacy Policy.',
    },
    {
        id: '6',
        title: 'Limitation of liability',
        content:
            'We have built MyUXScore to be as helpful and reliable as possible. That said, audit reports are AI-generated and may occasionally miss things. We kindly ask that you use the reports as guidance rather than as a final verdict, and we cannot be held responsible for decisions made solely based on them.',
    },
    {
        id: '7',
        title: 'Changes to terms',
        content:
            'We may update these terms occasionally. Continued use of the service after changes means you accept the revised terms.',
    },
    {
        id: '8',
        title: 'Contact',
        content: null,
        contactEmail: 'shravani@myuxscore.com',
    },
];

const SURFACE: React.CSSProperties = {
    border: '0.5px solid var(--high-grey, #1A1A1A)',
    boxShadow: 'none',
};

const LegalPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-dvh bg-page-bg font-sans text-text-primary">
            <div
                className="pointer-events-none fixed inset-0 opacity-[0.3]"
                style={{
                    backgroundImage: 'radial-gradient(rgb(148 163 184 / 0.22) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
                aria-hidden
            />

            <div className="relative z-10 mx-auto w-full max-w-3xl px-5 pb-20 pt-12 md:px-8 md:pt-16">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="group mb-10 inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary"
                >
                    <ChevronLeft
                        className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
                        strokeWidth={2}
                    />
                    Back
                </button>

                <header className="mb-12">
                    <img src="/logo.png" alt="MyUXScore" className="mb-6 h-10 w-auto object-contain" />
                    <div className="max-w-xl border-l-2 border-brand pl-5 md:pl-6">
                        <h1 className="text-3xl font-bold leading-tight tracking-tight text-text-primary md:text-4xl">
                            Security, privacy &amp; terms
                        </h1>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                            Last updated: March 10, 2026
                        </p>
                    </div>
                    <p className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary">
                        We are straightforward about how MyUXScore works and how we handle your data. Here is what you need to
                        know.
                    </p>
                </header>

                <div className="mb-12 h-1 w-12 rounded-full bg-brand" aria-hidden />

                <div>
                    {sections.map((section, index) => (
                        <article
                            key={section.id}
                            className={`py-9 ${index > 0 ? 'border-t border-slate-200/80' : ''}`}
                            style={index > 0 ? { borderTopWidth: '0.5px' } : undefined}
                        >
                            <div className="flex items-start gap-4 md:gap-6">
                                <span className="mt-0.5 w-7 shrink-0 text-xs font-semibold tabular-nums text-text-secondary">
                                    {section.id}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h2 className="mb-3 text-lg font-bold tracking-tight text-text-primary">{section.title}</h2>
                                    {section.content && (
                                        <p className="text-[15px] leading-relaxed text-text-secondary">{section.content}</p>
                                    )}
                                    {section.contactEmail && (
                                        <p className="text-[15px] leading-relaxed text-text-secondary">
                                            For questions, write to{' '}
                                            <a
                                                href={`mailto:${section.contactEmail}`}
                                                className="font-semibold text-brand underline decoration-brand/30 underline-offset-2 transition-colors hover:text-brand-hover"
                                            >
                                                {section.contactEmail}
                                            </a>
                                            .
                                        </p>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="mt-14 rounded-lg bg-white p-6 md:p-8" style={SURFACE}>
                    <p className="text-sm leading-relaxed text-text-secondary">
                        By using MyUXScore, you acknowledge that you have read and agree to these terms.
                    </p>
                </div>
            </div>

            <footer className="relative z-10 border-t border-slate-200/80 py-8" style={{ borderTopWidth: '0.5px' }}>
                <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary md:flex-row md:px-8">
                    <span>© 2024 MyUXScore</span>
                    <span>v0.4.2-beta</span>
                </div>
            </footer>
        </div>
    );
};

export default LegalPage;
