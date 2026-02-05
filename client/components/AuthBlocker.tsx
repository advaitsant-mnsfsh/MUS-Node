import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { signUp, signIn, sendOtp, verifyOtp, updateProfile } from '../services/authService';
import { createLead, verifyLead } from '../services/leadService';
import { transferAuditOwnership } from '../services/auditStorage';
import { supabase } from '../lib/supabase';

interface AuthBlockerProps {
    onUnlock: () => void;
    isUnlocked: boolean;
    auditUrl: string;
    auditId?: string | null; // Optional audit ID to transfer ownership
}

export const AuthBlocker: React.FC<AuthBlockerProps> = ({ onUnlock, isUnlocked, auditUrl, auditId }) => {
    const [isLoginMode, setIsLoginMode] = useState(false); // Toggle between Sign Up and Login
    const [step, setStep] = useState<'info' | 'otp'>('info'); // For Signup flow

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [orgType, setOrgType] = useState('');
    const [otp, setOtp] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);

    // If unlocked, don't render anything
    if (isUnlocked) return null;

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

        if (!email || !password || !name) {
            toast.error("Please fill in all required fields.");
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
        // ------------------------

        setIsLoading(true);

        // Use OTP flow for signup verification
        const { error } = await sendOtp(email);
        setIsLoading(false);

        if (error) {
            toast.error("Error sending verification code: " + error);
        } else {
            toast.success('Verification code sent to ' + email);
            setStep('otp');
        }
    };

    const handleSignupStep2 = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp) return;

        setIsLoading(true);
        // 1. Verify OTP
        const { session, error } = await verifyOtp(email, otp);

        if (error || !session) {
            setIsLoading(false);
            toast.error(error || "Verification failed");
            return;
        }

        // 2. Set Password & Profile Data
        const { error: updateError } = await updateProfile({
            password: password,
            data: {
                full_name: name,
                org_type: orgType
            }
        });

        if (updateError) {
            console.error("Error setting password:", updateError);
            toast.error("Account verified, but failed to set password. You may need to reset it later.");
        }

        // 3. Create Lead (Safe now as we are authenticated)
        const { error: leadError } = await createLead({
            email,
            name,
            organization_type: orgType,
            audit_url: auditUrl
        });

        if (leadError) {
            console.warn("Failed to capture lead data:", leadError);
        }

        // 4. Mark Verified
        await verifyLead(email);

        // 5. Transfer audit ownership if auditId exists
        if (auditId && session.user) {
            const { success } = await transferAuditOwnership(auditId, session.user.id);
            if (success) {
                console.log('[AuthBlocker] Audit ownership transferred successfully');
            }
        }

        setIsLoading(false);
        toast.success('Account created successfully!');
        onUnlock();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-['DM_Sans']">
            {/* Backdrop with stronger blur and dark overlay */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"></div>

            {/* Modal Card - Neo Brutalist Style */}
            <div className="relative z-10 w-full max-w-md bg-white border-2 border-black shadow-neo p-6 md:p-8">

                {/* Close Button (Optional, but good for modals) */}
                {/* <button onClick={onUnlock} className="absolute top-4 right-4 text-black hover:text-slate-600">
                    <X size={24} />
                </button> */}

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
                            className="w-full h-14 mt-4 bg-black hover:bg-slate-800 text-white border-2 border-black rounded-none shadow-neo hover:shadow-neo-hover active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-base font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
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
                ) : (
                    // SIGNUP FORM (Hybrid)
                    step === 'info' ? (
                        <form onSubmit={handleSignupStep1} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2">
                                    Full Name <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    className="w-full h-12 px-4 bg-white border-2 border-black rounded-none shadow-neo focus:outline-none focus:shadow-neo-hover transition-all text-base placeholder-slate-400"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
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
                            <div>
                                <label htmlFor="orgType" className="block text-sm font-semibold text-slate-900 mb-2">
                                    Organization Type <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="orgType"
                                        className="w-full h-12 px-4 bg-white border-2 border-black rounded-none shadow-neo focus:outline-none focus:shadow-neo-hover transition-all text-base appearance-none cursor-pointer"
                                        value={orgType}
                                        onChange={(e) => setOrgType(e.target.value)}
                                    >
                                        <option value="">Select type...</option>
                                        <option value="agency">Agency / Consultancy</option>
                                        <option value="startup">Startup</option>
                                        <option value="enterprise">Enterprise</option>
                                        <option value="ecommerce">E-commerce</option>
                                        <option value="saas">SaaS</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-900">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-2">
                                    Create Password <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    required
                                    className="w-full h-12 px-4 bg-white border-2 border-black rounded-none shadow-neo focus:outline-none focus:shadow-neo-hover transition-all text-base placeholder-slate-400"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={6}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 mt-4 bg-black hover:bg-slate-800 text-white border-2 border-black rounded-none shadow-neo hover:shadow-neo-hover active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-base font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                            <p className="text-center text-xs text-slate-500 mt-4">
                                We'll send a one-time verification code to your email.
                            </p>
                        </form>
                    ) : (
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
                                className="w-full h-14 bg-black hover:bg-slate-800 text-white border-2 border-black rounded-none shadow-neo hover:shadow-neo-hover active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-base font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
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
                                    'Verify & Create Account'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep('info')}
                                className="w-full text-sm text-slate-500 hover:text-black font-semibold underline decoration-2 underline-offset-4"
                            >
                                Change Details
                            </button>
                        </form>
                    )
                )}

                <div className="mt-8 pt-6 border-t-2 border-slate-100 text-center">
                    <p className="text-sm text-slate-600 font-medium">
                        {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLoginMode(!isLoginMode);
                                setStep('info');
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

