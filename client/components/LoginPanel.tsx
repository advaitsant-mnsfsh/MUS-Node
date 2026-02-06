import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { signUp, signIn, sendOtp, verifyOtp, updateProfile } from '../services/authService';
import { createLead, verifyLead } from '../services/leadService';
import { transferAuditOwnership } from '../services/auditStorage';

interface LoginPanelProps {
    auditId?: string | null;
}

export const LoginPanel: React.FC<LoginPanelProps> = ({ auditId }) => {
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
            await verifyLead(email); // Try to verify lead just in case

            // Transfer audit ownership if auditId exists
            if (auditId && session.user) {
                console.log(`[LoginPanel] 🔓 User Logged In: ${session.user.id} (${session.user.email})`);
                console.log(`[LoginPanel] 🔄 Transferring Audit ${auditId} to User ${session.user.id}...`);

                const { success, error } = await transferAuditOwnership(auditId, session.user.id);

                if (success) {
                    console.log(`[LoginPanel] ✅ Audit ${auditId} ownership transferred successfully!`);
                } else {
                    console.error(`[LoginPanel] ❌ Failed to transfer audit ownership:`, error);
                }
            } else if (session.user) {
                console.log(`[LoginPanel] 🔓 User Logged In: ${session.user.id}. No Audit ID to transfer.`);
            }

            toast.success('Welcome back!');
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

        setIsLoading(true);

        // BETTER-AUTH MIGRATION: 
        // Use standard signUp (which sends OTP because of sendVerificationOnSignUp: true)
        // This sets the password immediately.
        const { error } = await signUp(email, password, { name, org_type: orgType });

        setIsLoading(false);

        if (error) {
            toast.error("Error creating account: " + error);
        } else {
            toast.success('Verification code sent to ' + email);
            setStep('otp');
        }
    };

    const handleSignupStep2 = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp) return;

        setIsLoading(true);
        // 1. Verify OTP (which logs in)
        const { session, error } = await verifyOtp(email, otp);

        if (error || !session) {
            setIsLoading(false);
            toast.error(error || "Verification failed");
            return;
        }

        // 2. Password is already set during signUp, skipping updateProfile.

        // 3. Create Lead (Safe now as we are authenticated)
        const { error: leadError } = await createLead({
            email,
            name,
            organization_type: orgType,
            audit_url: window.location.href
        });

        if (leadError) {
            console.warn("Failed to capture lead data:", leadError);
        }

        // 4. Mark Verified
        await verifyLead(email);

        // 5. Transfer audit ownership if auditId exists
        if (auditId && session && session.user) {
            console.log(`[LoginPanel] ✨ User Signed Up: ${session.user.id} (${session.user.email})`);
            console.log(`[LoginPanel] 🔄 Transferring Audit ${auditId} to New User ${session.user.id}...`);

            const { success, error } = await transferAuditOwnership(auditId, session.user.id);

            if (success) {
                console.log(`[LoginPanel] ✅ Audit ${auditId} ownership transferred successfully!`);
            } else {
                console.error(`[LoginPanel] ❌ Failed to transfer audit ownership:`, error);
            }
        } else if (session?.user) {
            console.log(`[LoginPanel] ✨ User Signed Up: ${session.user.id}. No Audit ID to transfer.`);
        }

        setIsLoading(false);
        toast.success('Account created successfully!');
    };

    return (
        <div className="w-full max-w-md mx-auto px-6 pb-6 min-h-[540px] flex flex-col font-['DM_Sans']">
            {/* Header - Fixed Height */}
            <div className="h-24 flex flex-col justify-center mb-6 text-center md:text-left">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {isLoginMode ? 'Welcome Back' : 'Unlock Full Audit Report'}
                </h2>
                <p className="text-sm text-slate-600 line-clamp-2">
                    {isLoginMode
                        ? 'Log in to access your saved reports.'
                        : 'Get instant access to your detailed strategic roadmap and UI/UX insights.'}
                </p>
            </div>

            {/* Form */}
            {isLoginMode ? (
                // LOGIN FORM
                <form onSubmit={handleLogin} className="flex-grow flex flex-col">
                    <div className="space-y-6 flex-grow">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2 text-left">
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
                            <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-2 text-left">
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
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 mt-8 bg-black hover:bg-slate-800 text-white border-2 border-black rounded-none shadow-neo hover:shadow-neo-hover active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-base font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Logging In...
                            </>
                        ) : (
                            'Log In'
                        )}
                    </button>

                    <div className="mt-auto pt-6 border-t-2 border-slate-100 text-center">
                        <p className="text-sm text-slate-600 font-medium">
                            Don't have an account?
                            <button
                                type="button"
                                onClick={() => { setIsLoginMode(false); setStep('info'); }}
                                className="text-black font-bold hover:underline decoration-2 underline-offset-2 ml-1"
                            >
                                Sign Up
                            </button>
                        </p>
                    </div>
                </form>
            ) : (
                // SIGNUP FORM
                step === 'info' ? (
                    <form onSubmit={handleSignupStep1} className="flex-grow flex flex-col">
                        <div className="space-y-4 flex-grow">
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2 text-left">
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
                                <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2 text-left">
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
                                <label htmlFor="orgType" className="block text-sm font-semibold text-slate-900 mb-2 text-left">
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
                                <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-2 text-left">
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
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 mt-4 bg-black hover:bg-slate-800 text-white border-2 border-black rounded-none shadow-neo hover:shadow-neo-hover active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-base font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                        <p className="text-center text-xs text-slate-500 mt-4 mb-2">
                            We'll send a one-time verification code to your email.
                        </p>

                        <div className="mt-auto pt-6 border-t-2 border-slate-100 text-center">
                            <p className="text-sm text-slate-600 font-medium">
                                Already have an account?
                                <button
                                    type="button"
                                    onClick={() => setIsLoginMode(true)}
                                    className="text-black font-bold hover:underline decoration-2 underline-offset-2 ml-1"
                                >
                                    Log In
                                </button>
                            </p>
                        </div>
                    </form>
                ) : (
                    // OTP VERIFICATION STEP
                    <form onSubmit={handleSignupStep2} className="flex-grow flex flex-col">
                        <div className="flex-grow flex flex-col justify-center">
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
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 mt-6 bg-black hover:bg-slate-800 text-white border-2 border-black rounded-none shadow-neo hover:shadow-neo-hover active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-base font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify & Create Account'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep('info')}
                            className="w-full mt-4 text-sm text-slate-500 hover:text-black font-semibold underline decoration-2 underline-offset-4 mb-6"
                        >
                            Change Details
                        </button>
                    </form>
                )
            )}
        </div>
    );
};
