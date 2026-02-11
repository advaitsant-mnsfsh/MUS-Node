import React, { useState } from 'react';
import { X, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const { changePassword, user } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // OTP Flow State
    const [isOtpFlow, setIsOtpFlow] = useState(false);
    const [otpStep, setOtpStep] = useState<'send' | 'verify'>('send');
    const [otp, setOtp] = useState('');

    if (!isOpen) return null;

    const resetFlowState = () => {
        setIsOtpFlow(false);
        setOtpStep('send');
        setOtp('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError(null);
        setSuccess(false);
    };

    const handleSendResetOtp = async () => {
        if (!user?.email) return;
        setLoading(true);
        setError(null);

        const { sendOtp } = await import('../services/authService');
        const { error } = await sendOtp(user.email, 'forget-password');

        if (error) {
            setError(error);
        } else {
            setOtpStep('verify');
            toast.success("Security code sent to your email");
        }
        setLoading(false);
    };

    const handleResetWithOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.email) return;

        if (newPassword !== confirmPassword) {
            setError("New passwords don't match");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        setError(null);

        const { resetPasswordWithOtp } = await import('../services/authService');
        const { success: resetSuccess, error: resetError } = await resetPasswordWithOtp(user.email, otp, newPassword);

        if (resetSuccess) {
            setSuccess(true);
            toast.success("Password updated successfully!");
            setTimeout(() => {
                onClose();
                resetFlowState();
            }, 2000);
        } else {
            setError(resetError || "Failed to reset password. Code may be invalid.");
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
            setError("New passwords don't match");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        const result = await changePassword({ currentPassword, newPassword });
        setLoading(false);

        if (result.success) {
            setSuccess(true);
            toast.success("Password updated successfully!");
            setTimeout(() => {
                onClose();
                resetFlowState();
            }, 2000);
        } else {
            setError(result.error || "Failed to update password. Is your current password correct?");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white border-2 border-black shadow-neo w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative">

                {/* Header */}
                <div className="p-6 md:p-8 flex flex-col items-center">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full border-2 border-transparent hover:border-black hover:bg-black/5 transition-colors text-black"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="text-center mt-2">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {isOtpFlow ? 'Reset Password' : 'Change Password'}
                        </h2>
                        <p className="mt-2 text-slate-600 text-sm">
                            {isOtpFlow
                                ? 'Verify your identity to secure your account.'
                                : 'Update your credentials to keep your account safe.'}
                        </p>
                    </div>
                </div>

                <div className="px-6 pb-8 md:px-8">
                    {success ? (
                        <div className="py-8 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-white border-2 border-black shadow-neo flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-10 h-10 text-black" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Password Updated!</h3>
                            <p className="text-sm text-slate-600">Your security settings have been successfully updated.</p>
                        </div>
                    ) : isOtpFlow ? (
                        /* OTP Flow */
                        <div className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-50 border-2 border-red-600/20 text-red-600 text-xs font-bold flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {otpStep === 'send' ? (
                                <div className="space-y-6">
                                    <div className="p-4 bg-slate-50 border-l-4 border-black font-medium">
                                        <p className="text-sm text-slate-900 font-bold mb-1">Forgot your password?</p>
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            We'll send a security code to <span className="text-black font-bold">{user?.email}</span>.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleSendResetOtp}
                                        disabled={loading}
                                        className="w-full h-14 bg-black text-white font-bold border-2 border-black shadow-neo hover:shadow-neo-hover active:shadow-none active:translate-x-px active:translate-y-px transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Code"}
                                    </button>
                                    <button
                                        onClick={() => setIsOtpFlow(false)}
                                        className="w-full text-sm font-bold text-slate-500 hover:text-black hover:underline underline-offset-4 transition-colors"
                                    >
                                        Back to Regular Form
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleResetWithOtp} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">
                                            SECURITY CODE
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="------"
                                            className="w-full h-14 px-4 bg-white border-2 border-black shadow-neo focus:outline-none focus:shadow-neo-hover text-center text-2xl font-mono tracking-[0.5em] transition-all"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                                NEW PASSWORD
                                            </label>
                                            <input
                                                type="password"
                                                required
                                                minLength={8}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full h-12 px-4 bg-white border-2 border-black shadow-neo focus:outline-none focus:shadow-neo-hover transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                                CONFIRM NEW PASSWORD
                                            </label>
                                            <input
                                                type="password"
                                                required
                                                minLength={8}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full h-12 px-4 bg-white border-2 border-black shadow-neo focus:outline-none focus:shadow-neo-hover transition-all"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 bg-black text-white font-bold border-2 border-black shadow-neo hover:shadow-neo-hover active:shadow-none active:translate-x-px active:translate-y-px transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Update Password"}
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : (
                        /* Regular password change form */
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-50 border-2 border-red-600/20 text-red-600 text-xs font-bold flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-slate-900">
                                        CURRENT PASSWORD
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setIsOtpFlow(true)}
                                        className="text-xs font-bold text-slate-500 hover:text-black hover:underline underline-offset-4"
                                    >
                                        Forgot?
                                    </button>
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-12 px-4 bg-white border-2 border-black shadow-neo focus:outline-none focus:shadow-neo-hover transition-all"
                                />
                            </div>

                            <div className="h-px bg-slate-100 my-2" />

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">
                                        NEW PASSWORD
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full h-12 px-4 bg-white border-2 border-black shadow-neo focus:outline-none focus:shadow-neo-hover transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">
                                        CONFIRM NEW PASSWORD
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full h-12 px-4 bg-white border-2 border-black shadow-neo focus:outline-none focus:shadow-neo-hover transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-black text-white font-bold border-2 border-black shadow-neo hover:shadow-neo-hover active:shadow-none active:translate-x-px active:translate-y-px transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        "Update Password"
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full mt-4 text-sm font-bold text-slate-500 hover:text-black transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
