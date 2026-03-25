import React, { useState } from "react";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";

/** Match AuthBlocker / navbar auth modal — thin slate border, no neo shadow */
const MODAL_CLASS =
  "relative z-10 w-full max-w-md rounded-lg border border-slate-300 bg-white shadow-none";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 bg-white px-4 text-base text-text-primary outline-none transition-colors placeholder:text-slate-400 focus-visible:border-slate-300 focus-visible:ring-2 focus-visible:ring-brand/25 disabled:opacity-60";

const BTN_PRIMARY =
  "flex h-14 w-full items-center justify-center gap-2 rounded-lg border border-slate-900/10 bg-brand text-base font-bold text-white shadow-none transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { changePassword, user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [isOtpFlow, setIsOtpFlow] = useState(false);
  const [otpStep, setOtpStep] = useState<"send" | "verify">("send");
  const [otp, setOtp] = useState("");

  if (!isOpen) return null;

  const resetFlowState = () => {
    setIsOtpFlow(false);
    setOtpStep("send");
    setOtp("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(false);
  };

  const handleSendResetOtp = async () => {
    if (!user?.email) return;
    setLoading(true);
    setError(null);

    const { sendOtp } = await import("../services/authService");
    const { error } = await sendOtp(user.email, "forget-password");

    if (error) {
      setError(error);
    } else {
      setOtpStep("verify");
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

    const { resetPasswordWithOtp } = await import("../services/authService");
    const { success: resetSuccess, error: resetError } =
      await resetPasswordWithOtp(user.email, otp, newPassword);

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
      setError(
        result.error ||
          "Failed to update password. Is your current password correct?",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-['DM_Sans'] animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-amber-950/15 backdrop-blur-lg"
        aria-hidden
        onClick={onClose}
      />
      <div
        className={`${MODAL_CLASS} animate-in zoom-in-95 overflow-hidden duration-200`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 rounded-lg p-2 text-text-secondary transition-colors hover:bg-slate-100 hover:text-text-primary"
          aria-label="Close"
        >
          <X className="h-5 w-5" strokeWidth={2} />
        </button>

        <div className="flex flex-col items-center px-6 pb-2 pt-8 md:px-8 md:pb-4 md:pt-10">
          <div className="mt-1 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">
              {isOtpFlow ? "Reset Password" : "Change Password"}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              {isOtpFlow
                ? "Verify your identity to secure your account."
                : "Update your credentials to keep your account safe."}
            </p>
          </div>
        </div>

        <div className="px-6 pb-8 md:px-8">
          {success ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg border border-slate-300 bg-white">
                <CheckCircle2 className="h-10 w-10 text-brand" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-text-primary">
                Password Updated!
              </h3>
              <p className="text-sm text-text-secondary">
                Your security settings have been successfully updated.
              </p>
            </div>
          ) : isOtpFlow ? (
            <div className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {otpStep === "send" ? (
                <div className="space-y-6">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-1 text-sm font-semibold text-text-primary">
                      Forgot your password?
                    </p>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      We&apos;ll send a security code to{" "}
                      <span className="font-semibold text-text-primary">
                        {user?.email}
                      </span>
                      .
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendResetOtp}
                    disabled={loading}
                    className={BTN_PRIMARY}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Send Reset Code"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOtpFlow(false)}
                    className="w-full text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary hover:underline"
                  >
                    Back to Regular Form
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetWithOtp} className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-text-primary">
                      SECURITY CODE
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="------"
                      className={`${INPUT_CLASS} h-16 text-center font-mono text-2xl tracking-[0.5em]`}
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-text-primary">
                        NEW PASSWORD
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`${INPUT_CLASS} h-12`}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-text-primary">
                        CONFIRM NEW PASSWORD
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`${INPUT_CLASS} h-12`}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={BTN_PRIMARY}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Verify & Update Password"
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-semibold text-text-primary">
                    CURRENT PASSWORD
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsOtpFlow(true)}
                    className="text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary hover:underline"
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
                  className={`${INPUT_CLASS} h-12`}
                />
              </div>

              <div className="my-2 h-px bg-slate-200" />

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-primary">
                    NEW PASSWORD
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${INPUT_CLASS} h-12`}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-primary">
                    CONFIRM NEW PASSWORD
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${INPUT_CLASS} h-12`}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={loading} className={BTN_PRIMARY}>
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-4 w-full text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary"
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
