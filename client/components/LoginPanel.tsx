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
    const [step, setStep] = useState<'email' | 'otp' | 'password' | 'forgot'>('email'); // For flows
    const [tempPassword] = useState(() => Math.random().toString(36).slice(-12) + 'A1!'); // Bridge password

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [orgType, setOrgType] = useState('');

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
        // Update to REAL password using our bridge password as currentPassword
        const { error } = await changePassword(password, tempPassword);

        if (error) {
            setIsLoading(false);
            toast.error("Error setting password: " + error.message);
            return;
        }

        // Create Lead
        await createLead({ email, name: email.split('@')[0], audit_url: window.location.href });
        await verifyLead(email);

        // Transfer audit ownership
        const authService = await import('../services/authService');
        const session = await authService.getCurrentSession();
        if (auditId && session?.user?.id) {
            await transferAuditOwnership(auditId, session.user.id);
        }

        setIsLoading(false);
        toast.success('Welcome! Your account is ready.');
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || !confirmPassword) {
            toast.error("Please fill in all fields.");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        const { resetPasswordUnsecure } = await import('../services/authService');
        const { success, error } = await resetPasswordUnsecure(email, password);
        setIsLoading(false);

        if (success) {
            toast.success("Password reset successfully! You can now log in.");
            setStep('email');
            setIsLoginMode(true);
            setPassword('');
            setConfirmPassword('');
        } else {
            toast.error(error || "Failed to reset password");
        }
    };

    return (
        <div className="w-full max-w-md mx-auto px-6 pb-6 min-h-[540px] flex flex-col font-['DM_Sans']">
            {/* Header - Fixed Height */}
            <div className="h-24 flex flex-col justify-center mb-6 text-center md:text-left">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {step === 'forgot' ? 'Reset Password' : isLoginMode ? 'Welcome Back' : 'Unlock Full Audit Report'}
                </h2>
                <p className="text-sm text-slate-600 line-clamp-2">
                    {step === 'forgot'
                        ? 'Enter your email and a new password to reset your account.'
                        : isLoginMode
                            ? 'Log in to access your saved reports.'
                            : 'Get instant access to your detailed strategic roadmap and UI/UX insights.'}
                </p>
            </div>

            {/* Form */}
            {step === 'forgot' ? (
                // FORGOT PASSWORD FORM
                <form onSubmit={handleResetPassword} className="flex-grow flex flex-col">
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
                            <label htmlFor="new-password" className="block text-sm font-semibold text-slate-900 mb-2 text-left">
                                New Password <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="password"
                                id="new-password"
                                required
                                className="w-full h-12 px-4 bg-white border-2 border-black rounded-none shadow-neo focus:outline-none focus:shadow-neo-hover transition-all text-base placeholder-slate-400"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={8}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-new" className="block text-sm font-semibold text-slate-900 mb-2 text-left">
                                Confirm New Password <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="password"
                                id="confirm-new"
                                required
                                className="w-full h-12 px-4 bg-white border-2 border-black rounded-none shadow-neo focus:outline-none focus:shadow-neo-hover transition-all text-base placeholder-slate-400"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                minLength={8}
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
                                Resetting...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setStep('email')}
                        className="mt-4 text-sm text-slate-500 hover:text-black font-semibold underline decoration-2 underline-offset-4"
                    >
                        Back to Login
                    </button>
                </form>
            ) : isLoginMode ? (
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
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="password" className="block text-sm font-semibold text-slate-900 text-left">
                                    Password <span className="text-red-600">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setStep('forgot')}
                                    className="text-xs font-bold text-slate-500 hover:text-black transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </div>
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
                                onClick={() => { setIsLoginMode(false); setStep('email'); }}
                                className="text-black font-bold hover:underline decoration-2 underline-offset-2 ml-1"
                            >
                                Sign Up
                            </button>
                        </p>
                    </div>
                </form>
            ) : (
                // SIGNUP FORM
                step === 'email' ? (
                    <form onSubmit={handleSignupStep1} className="flex-grow flex flex-col">
                        <div className="space-y-6 flex-grow">
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
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 mt-8 bg-black hover:bg-slate-800 text-white border-2 border-black rounded-none shadow-neo hover:shadow-neo-hover active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-base font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                'Continue to Signup'
                            )}
                        </button>
                        <p className="text-center text-xs text-slate-500 mt-6 font-medium">
                            Step 1 of 3: Verification
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
                ) : step === 'otp' ? (
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
                                'Verify Code'
                            )}
                        </button>
                        <p className="text-center text-xs text-slate-500 mt-4 font-medium">
                            Step 2 of 3: Security Check
                        </p>
                        <button
                            type="button"
                            onClick={() => setStep('email')}
                            className="w-full mt-4 text-sm text-slate-500 hover:text-black font-semibold underline decoration-2 underline-offset-4 mb-6"
                        >
                            Change Email
                        </button>
                    </form>
                ) : (
                    // STEP 3: PASSWORD SETUP
                    <form onSubmit={handleSignupStep3} className="flex-grow flex flex-col">
                        <div className="space-y-6 flex-grow">
                            <div className="p-4 bg-slate-50 border-l-4 border-brand mb-4">
                                <p className="text-sm font-bold text-slate-800">Welcome to MUS!</p>
                                <p className="text-xs text-slate-600">Final step: Secure your account with a password.</p>
                            </div>
                            <div>
                                <label htmlFor="pass" className="block text-sm font-semibold text-slate-900 mb-2 text-left">
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
                                <label htmlFor="confirm" className="block text-sm font-semibold text-slate-900 mb-2 text-left">
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
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 mt-8 bg-black hover:bg-slate-800 text-white border-2 border-black rounded-none shadow-neo hover:shadow-neo-hover active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-base font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Setting up...
                                </>
                            ) : (
                                'Complete Registration'
                            )}
                        </button>
                        <p className="text-center text-xs text-slate-500 mt-6 font-medium">
                            Step 3 of 3: Finalize
                        </p>
                    </form>
                )
            )}
        </div>
    );
};
