import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { getBackendUrl } from '../../services/config';
import { setUserTypeProperty } from '../../lib/analytics';

interface BetaAccessPageProps {
    onAuthorized: () => void;
}

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
                body: JSON.stringify({ code: code.trim() })
            });

            if (response.ok) {
                const data = await response.json();

                // Store the access type for Google Analytics separation
                if (data.type) {
                    localStorage.setItem('mus_auth_type', data.type);
                } else {
                    localStorage.setItem('mus_auth_type', 'beta');
                }

                // Store in sessionStorage for faster frontend persistence during navigate
                sessionStorage.setItem('beta_authorized', 'true');

                // Immediately set GA user property for current session
                setUserTypeProperty();

                toast.success('Access Granted!');
                onAuthorized();
            } else {
                toast.error('Invalid access code');
            }
        } catch (error) {
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
                body: JSON.stringify({ email: waitlistEmail.trim() })
            });

            if (response.ok) {
                setWaitlistSuccess(true);
            } else {
                toast.error('Failed to join waitlist');
            }
        } catch (error) {
            toast.error('Error joining waitlist');
        } finally {
            setIsWaitlistSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-black flex flex-col font-sans bg-[radial-gradient(#E5E7EB_1px,transparent_1px)] bg-[size:32px_32px]">
            <main className="flex-grow flex items-center justify-center w-full max-w-7xl mx-auto px-8 pt-20 pb-12 lg:pt-32 lg:pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 w-full lg:items-stretch">
                    <div className="flex flex-col justify-between py-2 md:py-0">
                        <div>
                            <img src="/logo.png" alt="MyUXScore Logo" className="h-12 md:h-14 lg:h-[64px] w-auto object-contain mb-3 lg:mb-4" />
                            <div className="space-y-2">
                                <h1 className="text-7xl lg:text-[100px] font-black uppercase leading-[0.85] tracking-tighter">
                                    BETA<br />
                                    <span className="bg-[#FFC107] px-4 mt-2 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">ACCESS</span>
                                </h1>
                            </div>
                            <p className="text-xl lg:text-2xl font-medium text-zinc-600 max-w-md leading-relaxed mt-6">
                                Experience the next evolution of user experience measurement. Professional-grade insights powered by our proprietary framework.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 pt-10 mt-auto">
                            <div className="flex -space-x-3">
                                <div className="w-12 h-12 rounded-full border-2 border-black bg-zinc-100 flex items-center justify-center overflow-hidden">
                                    <div className="w-full h-full bg-zinc-200"></div>
                                </div>
                                <div className="w-12 h-12 rounded-full border-2 border-black bg-zinc-200 flex items-center justify-center overflow-hidden">
                                    <div className="w-full h-full bg-zinc-300"></div>
                                </div>
                                <div className="w-12 h-12 rounded-full border-2 border-black bg-[#FFC107] flex items-center justify-center text-xs font-black">
                                    1K+
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Trusted by 1,000+ UX Designers</p>
                        </div>
                    </div>

                    <div className="flex justify-start lg:justify-end relative">
                        <div className="absolute -top-12 -right-4 lg:-right-8 z-20 w-32 h-32 bg-white rounded-full border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-center p-4">
                            <span className="text-[#6366f1] text-[11px] font-bold uppercase leading-tight tracking-tighter">
                                Strictly Limited Capacity
                            </span>
                        </div>
                        <div className="w-full max-w-md bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative">
                            <div className="h-2 w-full bg-[#6366f1] border-b-4 border-black"></div>
                            <div className="p-8 lg:p-12">
                                <div className="mb-10">
                                    <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Claim Entry</h2>
                                    <p className="text-sm font-medium text-zinc-500">Enter your unique invitation code to begin.</p>
                                </div>
                                <form className="space-y-8" onSubmit={handleSubmit}>
                                    <div>
                                        <label className="block uppercase font-black text-[11px] tracking-[0.2em] mb-3 text-black">Access Code</label>
                                        <input
                                            className="w-full p-5 text-xl font-mono font-bold bg-white border-4 border-black focus:ring-0 focus:border-black focus:outline-none placeholder-zinc-200"
                                            placeholder="UX-000-000-000"
                                            type="text"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-[#FFC107] text-black p-6 font-black text-xl uppercase tracking-widest flex items-center justify-center gap-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                    >
                                        {isSubmitting ? 'Verifying...' : 'Grant Access'}
                                        {!isSubmitting && (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        )}
                                    </button>
                                </form>
                                <div className="mt-10 pt-8 border-t-2 border-zinc-100 flex flex-col items-start gap-3">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">No invitation code?</span>
                                    <button
                                        onClick={() => setShowWaitlist(true)}
                                        className="inline-flex items-center gap-2 text-black font-black text-sm uppercase group underline underline-offset-8 decoration-2"
                                    >
                                        Join the waitlist
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="p-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 gap-6">
                <div className="flex items-center gap-4">
                    <span>© 2024 MYUXSCORE</span>
                    <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                    <span>Version 0.4.2-BETA</span>
                </div>
                <div className="flex gap-8">
                    <a href="/legal" className="hover:text-black transition-colors uppercase tracking-[0.2em]">Security, Privacy &amp; Terms</a>
                </div>
            </footer>

            {/* Waitlist Modal */}
            {showWaitlist && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-white border-4 border-black p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => {
                                setShowWaitlist(false);
                                setWaitlistSuccess(false);
                            }}
                            className="absolute top-4 right-4 text-black hover:scale-110 transition-transform"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {!waitlistSuccess ? (
                            <>
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Join the Waitlist</h3>
                                <p className="text-sm font-medium mb-6 text-zinc-500">Be the first to know when we open more beta slots.</p>
                                <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                                    <div>
                                        <input
                                            type="email"
                                            value={waitlistEmail}
                                            onChange={(e) => setWaitlistEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            required
                                            className="w-full bg-white border-4 border-black px-4 py-3 font-bold focus:outline-none placeholder-zinc-200"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isWaitlistSubmitting}
                                        className="w-full bg-[#FFC107] text-black font-black uppercase tracking-widest py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                    >
                                        {isWaitlistSubmitting ? "Sending..." : "Notify Me"}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black uppercase mb-3">You're In!</h3>
                                <p className="font-bold text-sm leading-relaxed text-zinc-600">
                                    We've added you to the waitlist.<br />You'll be notified as soon as there's an update.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};
