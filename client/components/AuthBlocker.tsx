import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { signUp, signIn, sendOtp, verifyOtp, updateProfile } from '../services/authService';
import { createLead, verifyLead } from '../services/leadService';
import { transferAuditOwnership } from '../services/auditStorage';
import { X } from 'lucide-react';

interface AuthBlockerProps {
    onUnlock: () => void;
    isUnlocked: boolean;
    auditUrl: string;
    auditId?: string | null; // Optional audit ID to transfer ownership
    onClose?: () => void;
    initialLoginMode?: boolean; // New prop to control initial state
}

export const AuthBlocker: React.FC<AuthBlockerProps> = ({ onUnlock, isUnlocked, auditUrl, auditId, onClose, initialLoginMode = false }) => {
    const [isLoginMode, setIsLoginMode] = useState(initialLoginMode); // Toggle between Sign Up and Login
    const [isHidden, setIsHidden] = useState(false); // Local state to close the modal
    const [step, setStep] = useState<'email' | 'otp' | 'password'>('email'); // For Signup flow
    const [tempPassword] = useState(() => Math.random().toString(36).slice(-12) + 'A1!'); // Bridge password

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);

    // If unlocked or hidden, don't render anything
    if (isUnlocked || isHidden) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please fill in email and password.");
            return;
        }

        setIsLoading(true);
        const { session, error } = await signIn(email, password);
        setIsLoading(false);

        if (error) {
            toast.error(error);
        } else if (session) {
            // Try to verify lead just in case
            await verifyLead(email);

            // Transfer audit ownership if auditId exists
            if (auditId && session.user) {
                const { success } = await transferAuditOwnership(auditId, session.user.id);
                if (success) {
                    console.log('[AuthBlocker] Audit ownership transferred successfully');
                }
            }

            toast.success('Welcome back!');
            onUnlock();
        }
    };

    const handleSignupStep1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError(null);

        if (!email) {
            toast.error("Please enter your business email.");
            return;
        }

        // --- Email Validation ---
        const restrictedDomains = [
            'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
            'aol.com', 'icloud.com', 'protonmail.com', 'mail.com',
            'live.com', 'msn.com'
        ];
        const emailDomain = email.split('@')[1]?.toLowerCase();
        if (emailDomain && restrictedDomains.includes(emailDomain)) {
            setEmailError("Please use your work email address (generic providers like Gmail are not accepted).");
            return;
        }

        setIsLoading(true);
        // Start Signup with Bridge Password
        const { error } = await signUp(email, tempPassword, { name: email.split('@')[0] });
        setIsLoading(false);

        if (error) {
            if (error.includes("already exist")) {
                toast.error("Email already registered. Please login.");
                setIsLoginMode(true);
            } else {
                toast.error("Error: " + error);
            }
        } else {
            toast.success('Verification code sent to ' + email);
            setStep('otp');
        }
    };

    const handleSignupStep2 = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp) return;

        setIsLoading(true);
        const { session, error } = await verifyOtp(email, otp);
        setIsLoading(false);

        if (error || !session) {
            toast.error(error || "Verification failed");
            return;
        }

        // OTP Verified, move to Password setup
        setStep('password');
    };

    const handleSignupStep3 = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || !confirmPassword) {
            toast.error("Please enter and confirm your password.");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }

        setIsLoading(true);
        const { changePassword } = await import('../services/authService');
        // Update to REAL password
        const { error } = await changePassword(password, tempPassword);

        if (error) {
            setIsLoading(false);
            toast.error("Error setting password: " + error.message);
            return;
        }

        // Create Lead
        await createLead({ email, name: email.split('@')[0], audit_url: auditUrl });
        await verifyLead(email);

        // Transfer audit ownership
        if (auditId) {
            const authService = await import('../services/authService');
            const session = await authService.getCurrentSession();
            if (session?.user?.id) {
                await transferAuditOwnership(auditId, session.user.id);
            }
        }

        setIsLoading(false);
        toast.success('Welcome! Your account is ready.');
        onUnlock();
    };

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 font-['DM_Sans']">
            {/* Backdrop with stronger blur and dark overlay */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"></div>

            {/* Modal Card - Neo Brutalist Style */}
            <div className="relative z-10 w-full max-w-md bg-white border-2 border-black shadow-neo p-6 md:p-8">

                {/* Close Button (Optional, but good for modals) */}
                {/* Close Button - Always visible now */}
                <button onClick={() => setIsHidden(true)} className="absolute top-4 right-4 p-2 rounded-full border-2 border-transparent hover:border-black hover:bg-black/5 transition-colors text-black">
                    <X size={24} />
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">
                        {isLoginMode ? 'Welcome Back' : 'Unlock Full Audit Report'}
                    </h2>
                    <p className="mt-2 text-slate-600 text-sm">
                        {isLoginMode
                            ? 'Log in to access your saved reports.'
                            : 'Get instant access to your detailed strategic roadmap and UI/UX insights.'}
                    </p>
                </div>

                {isLoginMode ? (
                    // LOGIN FORM
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
                                Business Email <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                className="w-full h-12 px-4 bg-white border-2 border-black rounded-none shadow-neo focus:outline-none focus:shadow-neo-hover transition-all text-base placeholder-slate-400"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-2">
                                Password <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="password"
                                id="password"
                                required
                                className="w-full h-12 px-4 bg-white border-2 border-black rounded-none shadow-neo focus:outline-none focus:shadow-neo-hover transition-all text-base placeholder-slate-400"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 mt-4 bg-black hover:bg-slate-800 text-white border-2 border-black rounded-none shadow-neo hover:shadow-neo-hover active:translate-x-px active:translate-y-px active:shadow-none text-base font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Logging In...
                                </>
                            ) : (
                                'Log In'
                            )}
                        </button>
                    </form>
                ) : step === 'email' ? (
                    // SIGNUP FORM (Hybrid)

                    <form onSubmit={handleSignupStep1} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
                                Business Email <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                className={`w-full h-12 px-4 bg-white border-2 border-black rounded-none shadow-neo focus:outline-none focus:shadow-neo-hover transition-all text-base placeholder-slate-400 ${emailError ? 'border-red-600 bg-red-50' : 'border-black'}`}
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (emailError) setEmailError(null);
                                }}
                            />
                            {emailError && <p className="text-red-600 text-xs mt-1 font-bold">{emailError}</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 mt-4 bg-black hover:bg-slate-800 text-white border-2 border-black rounded-none shadow-neo hover:shadow-neo-hover active:translate-x-px active:translate-y-px active:shadow-none text-base font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Checking...
                                </>
                            ) : (
                                'Continue to Signup'
                            )}
                        </button>
                        <p className="text-center text-xs text-slate-500 mt-6 font-medium">
                            Step 1 of 3: Verification
                        </p>
                    </form>
                ) : step === 'otp' ? (
                    // OTP VERIFICATION STEP
                    <form onSubmit={handleSignupStep2} className="space-y-6">
                        <div className="text-center">
                            <label htmlFor="otp" className="block text-sm font-semibold text-slate-900 mb-4">
                                Enter Verification Code sent to <span className="text-brand">{email}</span>
                            </label>
                            <input
                                type="text"
                                id="otp"
                                required
                                autoFocus
                                className="w-full h-16 px-4 bg-white border-2 border-black rounded-none shadow-neo focus:outline-none focus:shadow-neo-hover transition-all text-center tracking-[0.5em] text-2xl font-mono"
                                placeholder="------"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                            <p className="mt-2 text-xs text-slate-500">
                                Can't find it? Check your spam folder.
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-black hover:bg-slate-800 text-white border-2 border-black rounded-none shadow-neo hover:shadow-neo-hover active:translate-x-px active:translate-y-px active:shadow-none text-base font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </>
                            ) : (
                                'Verify Code'
                            )}
                        </button>
                        <p className="text-center text-xs text-slate-500 mt-4 font-medium">
                            Step 2 of 3: Security Check
                        </p>
                        <button
                            type="button"
                            onClick={() => setStep('email')}
                            className="w-full text-sm text-slate-500 hover:text-black font-semibold underline decoration-2 underline-offset-4"
                        >
                            Change Email
                        </button>
                    </form>
                ) : (
                    // STEP 3: PASSWORD SETUP
                    <form onSubmit={handleSignupStep3} className="space-y-6">
                        <div className="p-4 bg-slate-50 border-l-4 border-brand mb-4">
                            <p className="text-sm font-bold text-slate-800">Welcome to MUS!</p>
                            <p className="text-xs text-slate-600">Final step: Secure your account with a password.</p>
                        </div>
                        <div>
                            <label htmlFor="pass" className="block text-sm font-semibold text-slate-900 mb-2">
                                Create Password <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="password"
                                id="pass"
                                required
                                className="w-full h-12 px-4 bg-white border-2 border-black rounded-none shadow-neo focus:outline-none focus:shadow-neo-hover transition-all text-base placeholder-slate-400"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={8}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm" className="block text-sm font-semibold text-slate-900 mb-2">
                                Confirm Password <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="password"
                                id="confirm"
                                required
                                className="w-full h-12 px-4 bg-white border-2 border-black rounded-none shadow-neo focus:outline-none focus:shadow-neo-hover transition-all text-base placeholder-slate-400"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                minLength={8}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 mt-4 bg-black hover:bg-slate-800 text-white border-2 border-black rounded-none shadow-neo hover:shadow-neo-hover active:translate-x-px active:translate-y-px active:shadow-none text-base font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Finalizing...
                                </>
                            ) : (
                                'Complete Registration'
                            )}
                        </button>
                        <p className="text-center text-xs text-slate-500 mt-6 font-medium">
                            Step 3 of 3: Finalize
                        </p>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t-2 border-slate-100 text-center">
                    <p className="text-sm text-slate-600 font-medium">
                        {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLoginMode(!isLoginMode);
                                setStep('email');
                                setEmailError(null);
                            }}
                            className="text-black font-bold hover:underline decoration-2 underline-offset-2 ml-1"
                        >
                            {isLoginMode ? "Sign Up" : "Log In"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

