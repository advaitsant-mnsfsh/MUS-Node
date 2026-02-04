import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { sendOtp, verifyOtp } from '../services/authService';
import toast from 'react-hot-toast';

export const LoginPanel: React.FC = () => {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // Use local state for simplicity, but could pull from AuthContext if needed
    // const { signIn } = useAuth(); 

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await sendOtp(email);
            if (error) {
                toast.error(error);
                return;
            }
            toast.success("OTP sent to your email!");
            setStep('otp');
            setResendTimer(30);
        } catch (err) {
            toast.error("Failed to send OTP. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setIsLoading(true);
        const token = otp.join('');

        try {
            const { session, error } = await verifyOtp(email, token);
            if (error) {
                toast.error(error);
                return;
            }

            if (session) {
                toast.success("Successfully logged in!");
                console.log('Logged in session:', session);
                // Parent component (App.tsx) listening to AuthContext will handle redirect
            }
        } catch (err) {
            toast.error("Failed to verify OTP.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setResendTimer(30);
        const { error } = await sendOtp(email);
        if (error) toast.error("Failed to resend OTP");
        else toast.success("OTP resent!");
    };

    const handleOtpChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        pastedData.split('').forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    return (
        <div className="w-full max-w-md mx-auto px-6 pb-6">
            {/* Header */}
            <div className="mb-8 text-center md:text-left">
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                    Login to access your report
                </h2>
                <p className="text-sm text-text-secondary">
                    Get detailed scores and recommendations
                </p>
            </div>

            {/* Form */}
            <form onSubmit={step === 'email' ? handleSendOtp : (e) => { e.preventDefault(); handleVerifyOtp(); }} className="space-y-6">

                {/* Email Input */}
                <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2 text-left">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={step === 'otp'}
                        placeholder="siddhant.sharma@monsoonfish.com"
                        className="w-full h-14 px-4 text-base bg-white border-2 border-border-main rounded-none shadow-neo focus:outline-none focus:shadow-neo-hover disabled:opacity-50 disabled:cursor-not-allowed transition-shadow placeholder:text-slate-400"
                    />
                </div>

                {/* OTP Input (Always visible with opacity transaction) */}
                <div className={`transition-all duration-300 ${step === 'email' ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
                    <label className="block text-sm font-semibold text-text-primary mb-2 text-left">
                        Enter OTP
                    </label>
                    <div className="flex gap-2 justify-between mb-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                onPaste={index === 0 ? handleOtpPaste : undefined}
                                disabled={step === 'email'}
                                className="w-full aspect-square text-center text-xl sm:text-2xl font-bold bg-white border-2 border-border-main rounded-none shadow-neo focus:outline-none focus:shadow-neo-hover disabled:cursor-not-allowed transition-shadow"
                            />
                        ))}
                    </div>
                    {/* Resend OTP - Right aligned */}
                    <div className="text-right mt-2">
                        {step === 'otp' && (
                            resendTimer > 0 ? (
                                <p className="text-sm text-text-secondary">Resend OTP in ({resendTimer}s)</p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    className="text-sm text-brand hover:text-brand-hover font-medium transition-colors"
                                >
                                    Resend OTP
                                </button>
                            )
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading || (step === 'email' && !email) || (step === 'otp' && otp.join('').length < 6)}
                    className="w-full h-14 bg-white border-2 border-border-main rounded-none shadow-neo hover:shadow-neo-hover active:shadow-neo active:translate-x-[1px] active:translate-y-[1px] text-base font-bold text-text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-neo disabled:active:translate-x-0 disabled:active:translate-y-0 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {step === 'email' ? 'Sending...' : 'Verifying...'}
                        </>
                    ) : (
                        step === 'email' ? 'Get OTP' : 'Login'
                    )}
                </button>
            </form>
        </div>
    );
};
