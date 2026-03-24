import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowRight, X } from 'lucide-react';
import { getBackendUrl } from '../../services/config';
import { setUserTypeProperty } from '../../lib/analytics';

interface BetaAccessPageProps {
    onAuthorized: () => void;
}

const SURFACE: React.CSSProperties = {
    border: '0.5px solid var(--high-grey, #1A1A1A)',
    boxShadow: 'none',
};

const INPUT_BASE =
    'w-full rounded-lg bg-white px-4 text-text-primary outline-none transition-shadow placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-brand/25 disabled:opacity-60';

const inputOutline: React.CSSProperties = {
    border: '0.5px solid var(--high-grey, #1A1A1A)',
    boxShadow: 'none',
};

const BTN_PRIMARY =
    'flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-[#1E293B] text-base font-bold text-white transition-colors hover:bg-[#334155] disabled:cursor-not-allowed disabled:opacity-60';

export const BetaAccessPage: React.FC<BetaAccessPageProps> = ({ onAuthorized }) => {
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showWaitlist, setShowWaitlist] = useState(false);
    const [waitlistEmail, setWaitlistEmail] = useState('');
    const [isWaitlistSubmitting, setIsWaitlistSubmitting] = useState(false);
    const [waitlistSuccess, setWaitlistSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`${getBackendUrl()}/api/public/verify-beta`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim() }),
            });

            if (response.ok) {
                const data = await response.json();

                if (data.type) {
                    localStorage.setItem('mus_auth_type', data.type);
                } else {
                    localStorage.setItem('mus_auth_type', 'beta');
                }

                sessionStorage.setItem('beta_authorized', 'true');
                setUserTypeProperty();

                toast.success('Access granted');
                onAuthorized();
            } else {
                toast.error('Invalid access code');
            }
        } catch {
            toast.error('Server error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWaitlistSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!waitlistEmail.trim()) return;

        setIsWaitlistSubmitting(true);
        try {
            const response = await fetch(`${getBackendUrl()}/api/public/beta-waitlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: waitlistEmail.trim() }),
            });

            if (response.ok) {
                setWaitlistSuccess(true);
            } else {
                toast.error('Failed to join waitlist');
            }
        } catch {
            toast.error('Error joining waitlist');
        } finally {
            setIsWaitlistSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-dvh flex-col bg-page-bg font-sans text-text-primary">
            {/* Very light grid — same family as before, toned down */}
            <div
                className="pointer-events-none fixed inset-0 opacity-[0.35]"
                style={{
                    backgroundImage: 'radial-gradient(rgb(148 163 184 / 0.25) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
                aria-hidden
            />

            <main className="relative z-10 mx-auto flex w-full max-w-6xl grow flex-col justify-start px-5 pb-16 pt-20 md:px-8 lg:justify-center lg:pt-28 lg:pb-20">
                <div className="grid w-full grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:items-stretch lg:gap-10">
                    {/* Hero — mobile: first; desktop: left column row 1 */}
                    <div className="order-1 py-1 lg:order-0 lg:col-start-1 lg:row-start-1">
                        <img
                            src="/logo.png"
                            alt="MyUXScore"
                            className="mb-5 h-11 w-auto object-contain md:h-12 lg:h-14"
                        />
                        <div className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
                                Private beta
                            </p>
                            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-text-primary md:text-5xl lg:text-[3.25rem]">
                                Measure UX
                                <br />
                                <span className="relative inline-block">
                                    <span
                                        className="relative z-10 inline-block rounded-lg bg-accent-yellow/90 px-3 py-1 text-text-primary"
                                        style={SURFACE}
                                    >
                                        like a pro
                                    </span>
                                </span>
                            </h1>
                            <p className="max-w-md text-base leading-relaxed text-text-secondary md:text-lg">
                                Professional-grade UX insights from our framework — available to a limited number of teams
                                during this beta.
                            </p>
                        </div>
                    </div>

                    {/* Form — mobile: after hero; desktop: right column spans both rows */}
                    <div className="relative order-2 flex justify-start max-lg:mt-1 lg:order-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:justify-end">
                        <div
                            className="relative w-full max-w-md overflow-visible rounded-lg bg-white"
                            style={SURFACE}
                        >
                            {/* Top-right on card, half above top edge — same mobile + desktop */}
                            <div
                                className="absolute right-3 top-0 z-20 max-w-[calc(100%-1.5rem)] -translate-y-1/2 rounded-full bg-white px-3 py-1.5 text-center sm:right-4 sm:py-2"
                                style={{
                                    boxShadow: 'none',
                                    border: '0.5px solid rgb(99 102 241 / 0.35)',
                                }}
                            >
                                <span className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-brand">
                                    Limited capacity
                                </span>
                            </div>

                            <div className="h-1 w-full shrink-0 bg-brand" aria-hidden />
                            <div className="px-5 pb-5 pt-5 sm:px-7 sm:pb-7 sm:pt-6 lg:px-10 lg:pb-10 lg:pt-8">
                                <div className="mb-4 sm:mb-5 lg:mb-8">
                                    <h2 className="mb-1.5 text-xl font-bold tracking-tight text-text-primary sm:mb-2 sm:text-2xl">
                                        Enter your invite
                                    </h2>
                                    <p className="text-sm text-text-secondary">
                                        Use the code from your invitation email to unlock the beta.
                                    </p>
                                </div>

                                <form className="space-y-4 sm:space-y-5 lg:space-y-6" onSubmit={handleSubmit}>
                                    <div>
                                        <label
                                            htmlFor="beta-code"
                                            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-secondary sm:mb-2"
                                        >
                                            Access code
                                        </label>
                                        <input
                                            id="beta-code"
                                            className={`${INPUT_BASE} h-14 font-mono text-lg font-semibold tracking-wide`}
                                            style={inputOutline}
                                            placeholder="UX-000-000-000"
                                            type="text"
                                            autoComplete="off"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <button type="submit" disabled={isSubmitting} className={BTN_PRIMARY}>
                                        {isSubmitting ? 'Verifying…' : 'Continue'}
                                        {!isSubmitting && <ArrowRight className="h-5 w-5 shrink-0" strokeWidth={2} />}
                                    </button>
                                </form>

                                <div
                                    className="mt-5 flex flex-col items-start gap-2 border-t border-slate-100 pt-5 sm:mt-6 sm:pt-6 lg:mt-8 lg:pt-8"
                                    style={{ borderTopWidth: '0.5px' }}
                                >
                                    <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                        No code yet?
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setShowWaitlist(true)}
                                        className="group inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
                                    >
                                        Join the waitlist
                                        <ArrowRight
                                            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                                            strokeWidth={2}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trusted by — mobile: after form; desktop: left column row 2, bottom-aligned vs tall form */}
                    <div className="order-3 flex flex-wrap items-center gap-4 border-t border-slate-200/80 pt-8 lg:order-0 lg:col-start-1 lg:row-start-2 lg:self-end">
                        <div className="flex -space-x-2">
                            <div
                                className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-2 ring-page-bg"
                                style={inputOutline}
                            />
                            <div
                                className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-slate-200/80 ring-2 ring-page-bg"
                                style={inputOutline}
                            />
                            <div
                                className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-yellow/80 text-xs font-bold text-text-primary ring-2 ring-page-bg"
                                style={inputOutline}
                            >
                                1k+
                            </div>
                        </div>
                        <p className="max-w-[200px] text-[11px] font-semibold uppercase leading-snug tracking-wider text-text-secondary">
                            Trusted by UX designers &amp; product teams
                        </p>
                    </div>
                </div>
            </main>

            <footer className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-[11px] font-semibold uppercase tracking-wider text-text-secondary md:flex-row md:px-8">
                <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                    <span>© 2024 MyUXScore</span>
                    <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline" aria-hidden />
                    <span>v0.4.2-beta</span>
                </div>
                <a
                    href="/legal"
                    className="text-center transition-colors hover:text-text-primary md:text-right"
                >
                    Security, privacy &amp; terms
                </a>
            </footer>

            {showWaitlist && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 backdrop-blur-[6px] animate-in fade-in duration-200">
                    <div
                        className="relative w-full max-w-md animate-in rounded-lg bg-white p-8 zoom-in-95 duration-200"
                        style={SURFACE}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                setShowWaitlist(false);
                                setWaitlistSuccess(false);
                            }}
                            className="absolute right-3 top-3 rounded-lg p-2 text-text-secondary transition-colors hover:bg-slate-100 hover:text-text-primary"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" strokeWidth={2} />
                        </button>

                        {!waitlistSuccess ? (
                            <>
                                <h3 className="mb-2 pr-10 text-xl font-bold tracking-tight text-text-primary">
                                    Join the waitlist
                                </h3>
                                <p className="mb-6 text-sm text-text-secondary">
                                    We will email you when more beta spots open.
                                </p>
                                <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                                    <input
                                        type="email"
                                        value={waitlistEmail}
                                        onChange={(e) => setWaitlistEmail(e.target.value)}
                                        placeholder="you@company.com"
                                        required
                                        className={`${INPUT_BASE} h-12`}
                                        style={inputOutline}
                                    />
                                    <button type="submit" disabled={isWaitlistSubmitting} className={BTN_PRIMARY}>
                                        {isWaitlistSubmitting ? 'Sending…' : 'Notify me'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="py-2 text-center">
                                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-200/80 bg-emerald-50 text-emerald-700">
                                    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-text-primary">You are on the list</h3>
                                <p className="text-sm leading-relaxed text-text-secondary">
                                    We will let you know when there is room for you in the beta.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
