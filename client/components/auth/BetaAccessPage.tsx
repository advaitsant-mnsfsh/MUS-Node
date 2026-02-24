import React, { useState } from 'react';
import { Logo } from '../Logo';
import toast from 'react-hot-toast';
import { getBackendUrl } from '../../services/config';

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
        <div className="min-h-screen bg-[#FFFBF0] text-black flex flex-col items-center justify-center p-4 font-sans selection:bg-yellow-300">
            {/* Brutalist Background Pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white border-4 border-black p-8 md:p-10 relative transition-all animate-in fade-in zoom-in-95 duration-300">
                    {/* Top Accent Bar */}
                    <div className="absolute top-0 left-0 w-full h-3 bg-indigo-600 border-b-4 border-black"></div>

                    <div className="flex justify-center mb-8 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <Logo className="scale-110" />
                    </div>

                    <div className="text-center mb-10">
                        <div className="inline-block px-3 py-1 bg-yellow-300 border-2 border-black font-black uppercase text-[10px] tracking-widest mb-4">
                            Private Entry
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter mb-3 leading-none italic">
                            Beta Access
                        </h1>
                        <p className="text-black font-bold text-sm leading-snug max-w-[280px] mx-auto opacity-80">
                            Enter your exclusive access code to unlock the Beta Access to MyUXScore.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-1">Access Code</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="---- ---- ----"
                                className="w-full bg-[#FEFCE8] border-4 border-black px-6 py-5 text-center text-xl tracking-[0.3em] font-black focus:outline-none focus:bg-white transition-all placeholder:text-black/20"
                                disabled={isSubmitting}
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !code.trim()}
                            className="w-full bg-black text-white font-black uppercase tracking-widest py-5 border-4 border-black hover:bg-neutral-900 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Grant Access</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 flex flex-col items-center justify-center gap-3 border-t-2 border-black/5 pt-6">
                        <p className="text-[10px] uppercase font-black tracking-widest text-black/50 text-center leading-relaxed">
                            Don't have an access code yet?<br />
                            <button
                                type="button"
                                onClick={() => setShowWaitlist(true)}
                                className="text-black hover:underline underline-offset-4 decoration-2 decoration-yellow-400 transition-all"
                            >
                                Join the waitlist now
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            {/* Waitlist Modal */}
            {showWaitlist && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative animate-in zoom-in-95 duration-200">
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
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-4 italic">Join the Waitlist</h3>
                                <p className="text-sm font-bold mb-6 opacity-70">Be the first to know when we open more beta slots.</p>
                                <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                                    <div>
                                        <input
                                            type="email"
                                            value={waitlistEmail}
                                            onChange={(e) => setWaitlistEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            required
                                            className="w-full bg-[#FEFCE8] border-4 border-black px-4 py-3 font-bold focus:outline-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isWaitlistSubmitting}
                                        className="w-full bg-yellow-300 text-black font-black uppercase tracking-widest py-3 border-4 border-black hover:bg-yellow-400 transition-all active:scale-[0.98]"
                                    >
                                        {isWaitlistSubmitting ? "Sending..." : "Notify Me"}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-green-100 border-4 border-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black uppercase mb-3 text-green-700">You're In!</h3>
                                <p className="font-bold text-sm leading-relaxed">
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
