import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { signUp, signIn, sendOtp, verifyOtp, updateProfile } from '../services/authService';
import { createLead, verifyLead } from '../services/leadService';
import { transferAuditOwnership } from '../services/auditStorage';
import { X } from 'lucide-react';

/** Modal + form chrome aligned with Beta / app shell — thin border, no neo shadow */
const AUTH_MODAL_CLASS =
    'relative z-10 w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-none md:p-8';

const AUTH_INPUT =
    'w-full rounded-lg border border-slate-300 bg-white px-4 text-base text-text-primary outline-none transition-shadow placeholder:text-slate-400 focus-visible:border-slate-300 focus-visible:ring-2 focus-visible:ring-brand/25 disabled:opacity-60';

const AUTH_BTN_PRIMARY =
    'flex h-14 w-full items-center justify-center gap-2 rounded-lg border-0 bg-[#1E293B] text-base font-bold text-white shadow-none transition-colors hover:bg-[#334155] disabled:cursor-not-allowed disabled:opacity-70';

interface AuthBlockerProps {
    onUnlock: () => void;
    isUnlocked: boolean;
    auditUrl: string;
    auditId?: string | null; // Optional audit ID to transfer ownership
    ownerId?: string | null; // ID of current owner to avoid redundant transfers
    onClose?: () => void;
    initialLoginMode?: boolean; // New prop to control initial state
}

export const AuthBlocker: React.FC<AuthBlockerProps> = ({ onUnlock, isUnlocked, auditUrl, auditId, ownerId, onClose, initialLoginMode = false }) => {
    const [isLoginMode, setIsLoginMode] = useState(initialLoginMode); // Toggle between Sign Up and Login
    const [isHidden, setIsHidden] = useState(false); // Local state to close the modal
    const [step, setStep] = useState<'email' | 'otp' | 'password' | 'forgot-email' | 'forgot-otp' | 'forgot-reset'>('email'); // For flows
    const [tempPassword] = useState(() => Math.random().toString(36).slice(-12) + 'A1!'); // Bridge password

    // Sync isLoginMode with prop when it changes (e.g. navbar clicks)
    React.useEffect(() => {
        setIsLoginMode(!!initialLoginMode);
        setStep('email'); // Reset step when mode changes
    }, [initialLoginMode]);

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

            // Transfer audit ownership if auditId exists and it's not already owned by this user
            if (auditId && session.user) {
                if (ownerId === session.user.id) {
                    console.log('[AuthBlocker] Audit already owned by this user. Skipping transfer.');
                } else {
                    const { success } = await transferAuditOwnership(auditId, session.user.id);
                    if (success) {
                        console.log('[AuthBlocker] Audit ownership transferred successfully');
                    }
                }
            }

            toast.success('Welcome back!');
            onUnlock();
        }
    };

    const handleForgotPasswordRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email.");
            return;
        }

        setIsLoading(true);
        const { sendOtp } = await import('../services/authService');
        const { error } = await sendOtp(email, 'forget-password');
        setIsLoading(false);

        if (error) {
            toast.error(error);
        } else {
            toast.success('Security code sent to ' + email);
            setStep('forgot-otp');
        }
    };

    const handleForgotPasswordVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp) return;
        setStep('forgot-reset');
    };

    const handleForgotPasswordReset = async (e: React.FormEvent) => {
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
        const { resetPasswordWithOtp } = await import('../services/authService');
        const { success, error } = await resetPasswordWithOtp(email, otp, password);

        if (success) {
            toast.success('Password reset successfully! You can now log in.');
            setIsLoginMode(true);
            setStep('email');
            setPassword('');
            setConfirmPassword('');
            setOtp('');
        } else {
            toast.error(error || "Failed to reset password");
        }
        setIsLoading(false);
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

        // 3. Log In with the NEW REAL password to get a session
        const authService = await import('../services/authService');
        const { session, error: loginError } = await authService.signIn(email, password);

        if (loginError || !session) {
            console.error('[AuthBlocker] Final login failed:', loginError);
            toast.error("Account created, but failed to log in automatically.");
            setIsLoading(false);
            return;
        }

        // 4. Create Lead
        await createLead({ email, name: email.split('@')[0], audit_url: auditUrl });
        await verifyLead(email);

        // 5. Transfer audit ownership (Now we have a confirmed session!)
        if (auditId && session.user) {
            if (ownerId === session.user.id) {
                console.log('[AuthBlocker] Audit already owned by this user. Skipping transfer.');
            } else {
                console.log(`[AuthBlocker] 🔄 Transferring Audit ${auditId} to ${session.user.id}...`);
                const { success, error: transferError } = await transferAuditOwnership(auditId, session.user.id);
                if (success) {
                    toast.success('Report saved to your account!', { icon: '📊' });
                } else {
                    console.error('[AuthBlocker] Ownership transfer failed:', transferError);
                }
            }
        }

        setIsLoading(false);
        toast.success('Welcome! Your account is ready.');
        onUnlock();
    };

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 font-['DM_Sans']">
            <div className="absolute inset-0 bg-amber-950/15 backdrop-blur-lg" aria-hidden />

            <div className={AUTH_MODAL_CLASS}>
                <button
                    type="button"
                    onClick={() => {
                        if (onClose) {
                            onClose();
                        } else {
                            setIsHidden(true);
                        }
                    }}
                    className="absolute right-3 top-3 rounded-lg p-2 text-text-secondary transition-colors hover:bg-slate-100 hover:text-text-primary"
                    aria-label="Close"
                >
                    <X size={22} strokeWidth={2} />
                </button>

                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                        {isLoginMode ? 'Welcome Back' : 'Unlock Full Audit Report'}
                    </h2>
                    <p className="mt-2 text-sm text-text-secondary">
                        {isLoginMode
                            ? 'Log in to access your saved reports.'
                            : 'Get instant access to your detailed strategic roadmap and UI/UX insights.'}
                    </p>
                </div>

                {isLoginMode ? (
                    // LOGIN FORM
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-text-primary">
                                Business Email <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                className={`${AUTH_INPUT} h-12`}
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <div className="mb-2 flex justify-between">
                                <label htmlFor="password" className="block text-sm font-semibold text-text-primary">
                                    Password <span className="text-red-600">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLoginMode(false);
                                        setStep('forgot-email');
                                    }}
                                    className="text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <input
                                type="password"
                                id="password"
                                required
                                className={`${AUTH_INPUT} h-12`}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" disabled={isLoading} className={`${AUTH_BTN_PRIMARY} mt-4`}>
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
                ) : step === 'forgot-email' ? (
                    // FORGOT PASSWORD: EMAIL
                    <form onSubmit={handleForgotPasswordRequest} className="space-y-6">
                        <div className="rounded-lg border border-brand/20 bg-brand/5 p-4">
                            <p className="text-sm font-bold text-text-primary">Reset Password</p>
                            <p className="text-sm text-text-secondary">Enter your business email and we'll send you a security code.</p>
                        </div>
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-text-primary">
                                Business Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                className={`${AUTH_INPUT} h-12`}
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <button type="submit" disabled={isLoading} className={AUTH_BTN_PRIMARY}>
                            {isLoading ? "Sending..." : "Send Reset Code"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsLoginMode(true);
                                setStep('email');
                            }}
                            className="w-full text-sm font-semibold text-text-secondary underline underline-offset-4 transition-colors hover:text-text-primary"
                        >
                            Back to Login
                        </button>
                    </form>
                ) : step === 'forgot-otp' ? (
                    // FORGOT PASSWORD: OTP
                    <form onSubmit={handleForgotPasswordVerify} className="space-y-6">
                        <div className="text-center">
                            <label htmlFor="otp" className="mb-4 block text-sm font-semibold text-text-primary">
                                Verification Code for <br /><span className="text-brand">{email}</span>
                            </label>
                            <input
                                type="text"
                                id="otp"
                                required
                                autoFocus
                                className={`${AUTH_INPUT} h-16 text-center font-mono text-2xl tracking-[0.5em]`}
                                placeholder="------"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                        <button type="submit" className={AUTH_BTN_PRIMARY}>
                            Confirm Security Code
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep('forgot-email')}
                            className="w-full text-sm font-semibold text-text-secondary underline underline-offset-4 transition-colors hover:text-text-primary"
                        >
                            Resend or Change Email
                        </button>
                    </form>
                ) : step === 'forgot-reset' ? (
                    // FORGOT PASSWORD: NEW PASSWORD
                    <form onSubmit={handleForgotPasswordReset} className="space-y-6">
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-4">
                            <p className="text-sm font-bold text-text-primary">Security Verified</p>
                            <p className="text-sm text-text-secondary">Now choose a new strong password for your account.</p>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-text-primary">
                                New Password
                            </label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                className={`${AUTH_INPUT} h-12`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-text-primary">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                className={`${AUTH_INPUT} h-12`}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" disabled={isLoading} className={AUTH_BTN_PRIMARY}>
                            {isLoading ? "Saving..." : "Update Password & Login"}
                        </button>
                    </form>
                ) : step === 'email' ? (
                    // SIGNUP FORM (Hybrid)

                    <form onSubmit={handleSignupStep1} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-text-primary">
                                Business Email <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                className={`${AUTH_INPUT} h-12 ${emailError ? 'border-red-500 bg-red-50 focus-visible:ring-red-200' : ''}`}
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (emailError) setEmailError(null);
                                }}
                            />
                            {emailError && <p className="mt-1 text-sm font-bold text-red-600">{emailError}</p>}
                        </div>
                        <button type="submit" disabled={isLoading} className={`${AUTH_BTN_PRIMARY} mt-4`}>
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
                        <p className="mt-6 text-center text-sm font-medium text-text-secondary">
                            Step 1 of 3: Verification
                        </p>
                    </form>
                ) : step === 'otp' ? (
                    // OTP VERIFICATION STEP
                    <form onSubmit={handleSignupStep2} className="space-y-6">
                        <div className="text-center">
                            <label htmlFor="otp" className="mb-4 block text-sm font-semibold text-text-primary">
                                Enter Verification Code sent to <span className="text-brand">{email}</span>
                            </label>
                            <input
                                type="text"
                                id="otp"
                                required
                                autoFocus
                                className={`${AUTH_INPUT} h-16 text-center font-mono text-2xl tracking-[0.5em]`}
                                placeholder="------"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                            <p className="mt-2 text-sm text-text-secondary">
                                Can't find it? Check your spam folder.
                            </p>
                        </div>
                        <button type="submit" disabled={isLoading} className={AUTH_BTN_PRIMARY}>
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
                        <p className="mt-4 text-center text-sm font-medium text-text-secondary">
                            Step 2 of 3: Security Check
                        </p>
                        <button
                            type="button"
                            onClick={() => setStep('email')}
                            className="w-full text-sm font-semibold text-text-secondary underline decoration-2 underline-offset-4 transition-colors hover:text-text-primary"
                        >
                            Change Email
                        </button>
                    </form>
                ) : (
                    // STEP 3: PASSWORD SETUP
                    <form onSubmit={handleSignupStep3} className="space-y-6">
                        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-bold text-text-primary">Welcome to MUS!</p>
                            <p className="text-sm text-text-secondary">Final step: Secure your account with a password.</p>
                        </div>
                        <div>
                            <label htmlFor="pass" className="mb-2 block text-sm font-semibold text-text-primary">
                                Create Password <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="password"
                                id="pass"
                                required
                                className={`${AUTH_INPUT} h-12`}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={8}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm" className="mb-2 block text-sm font-semibold text-text-primary">
                                Confirm Password <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="password"
                                id="confirm"
                                required
                                className={`${AUTH_INPUT} h-12`}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                minLength={8}
                            />
                        </div>

                        <button type="submit" disabled={isLoading} className={`${AUTH_BTN_PRIMARY} mt-4`}>
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
                        <p className="mt-6 text-center text-sm font-medium text-text-secondary">
                            Step 3 of 3: Finalize
                        </p>
                    </form>
                )}

                <div className="mt-8 border-t border-slate-200 pt-6 text-center">
                    <p className="text-sm font-medium text-text-secondary">
                        {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLoginMode(!isLoginMode);
                                setStep('email');
                                setEmailError(null);
                            }}
                            className="ml-1 font-bold text-text-primary underline decoration-2 underline-offset-2 transition-colors hover:text-brand"
                        >
                            {isLoginMode ? "Sign Up" : "Log In"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

