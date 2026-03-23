import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  Send,
  MessageSquare,
  CheckCircle2,
  Loader2,
  Lightbulb,
} from "lucide-react";
import { getBackendUrl } from "../services/config";

export const FeedbackPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    jobId: "",
    websiteUrl: "",
    errorDetails: "",
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("email", user.email ?? "");
      payload.append("jobId", formData.jobId);
      payload.append("websiteUrl", formData.websiteUrl);
      payload.append("errorDetails", formData.errorDetails);
      if (screenshot) {
        payload.append("screenshot", screenshot);
      }

      const apiUrl = getBackendUrl();
      const response = await fetch(`${apiUrl}/api/v1/feedback`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.id}`,
        },
        body: payload,
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success("Feedback submitted successfully!");
      } else {
        throw new Error("Failed to submit feedback");
      }
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[#fef9f1] font-['DM_Sans']">
        <Loader2
          className="h-9 w-9 animate-spin text-brand"
          aria-hidden
        />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-[#fef9f1] font-['DM_Sans']">
        <div className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <MessageSquare
              className="h-8 w-8 text-brand"
              strokeWidth={1.75}
              aria-hidden
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a] md:text-3xl">
            Sign in to send feedback
          </h1>
          <p className="mt-3 max-w-md text-base font-medium leading-relaxed text-text-secondary">
            We use your account email so we can follow up. Sign in and you’ll
            land back here.
          </p>
          <Link
            to="/login?returnUrl=/feedback"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-base font-bold text-white transition-opacity hover:opacity-95"
          >
            Sign in
          </Link>
          <Link
            to="/"
            className="mt-4 text-sm font-semibold text-brand hover:underline"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-[#fef9f1] font-['DM_Sans']">
        <div className="mx-auto w-full max-w-lg px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-2 ring-emerald-200/80">
            <CheckCircle2
              className="h-9 w-9 text-emerald-600"
              strokeWidth={2}
              aria-hidden
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a] md:text-3xl">
            Thanks for the feedback
          </h1>
          <p className="mt-3 text-base font-medium leading-relaxed text-text-secondary">
            We’ve received your message. Our team reviews submissions regularly
            and will reach out if we need more detail.
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setScreenshot(null);
              setFormData({ jobId: "", websiteUrl: "", errorDetails: "" });
            }}
            className="mt-10 inline-flex items-center justify-center rounded-lg border border-[#ccc] bg-white px-6 py-3 text-base font-bold text-[#1a1a1a] shadow-sm transition-colors hover:bg-neutral-50"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-[#ccc] bg-white px-4 py-3 text-base font-medium text-[#1a1a1a] outline-none transition-shadow placeholder:text-[#94a3b8] focus:border-brand focus:ring-2 focus:ring-brand/25";

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#fef9f1] font-['DM_Sans']">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand">
              <MessageSquare className="h-3.5 w-3.5" aria-hidden />
              Feedback
            </div>
            <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-[#1a1a1a] md:text-[2.25rem]">
              We’re listening
            </h1>
            <p className="mt-2 max-w-xl text-base font-medium leading-relaxed text-text-secondary md:text-lg">
              Bugs, rough edges, or ideas — tell us what you ran into. Optional
              fields help us reproduce issues faster.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-[#ccc] bg-white p-6 shadow-sm md:p-8"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#1a1a1a]">
                  Your email
                </label>
                <div className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-sm font-semibold text-text-secondary">
                  {user.email ?? "—"}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="jobId" className="block text-sm font-bold text-[#1a1a1a]">
                  Audit / job ID{" "}
                  <span className="font-medium text-[#94a3b8]">(optional)</span>
                </label>
                <input
                  id="jobId"
                  type="text"
                  value={formData.jobId}
                  onChange={(e) =>
                    setFormData({ ...formData, jobId: e.target.value })
                  }
                  className={inputClass}
                  placeholder="From report URL"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="websiteUrl" className="block text-sm font-bold text-[#1a1a1a]">
                Website URL{" "}
                <span className="font-medium text-[#94a3b8]">(optional)</span>
              </label>
              <input
                id="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) =>
                  setFormData({ ...formData, websiteUrl: e.target.value })
                }
                className={inputClass}
                placeholder="https://example.com"
                autoComplete="url"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="feedback-screenshot"
                className="block text-sm font-bold text-[#1a1a1a]"
              >
                Reference screenshot{" "}
                <span className="font-medium text-[#94a3b8]">(optional)</span>
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  id="feedback-screenshot"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setScreenshot(e.target.files?.[0] ?? null)
                  }
                  className="w-full text-sm font-medium text-[#1a1a1a] file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
                />
                {screenshot && (
                  <button
                    type="button"
                    onClick={() => setScreenshot(null)}
                    className="shrink-0 text-sm font-semibold text-brand hover:underline"
                  >
                    Remove file
                  </button>
                )}
              </div>
              {screenshot && (
                <p className="text-xs font-medium text-text-secondary">
                  Attached: {screenshot.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="errorDetails" className="block text-sm font-bold text-[#1a1a1a]">
                Your message
              </label>
              <textarea
                id="errorDetails"
                required
                rows={6}
                value={formData.errorDetails}
                onChange={(e) =>
                  setFormData({ ...formData, errorDetails: e.target.value })
                }
                className={`${inputClass} resize-y min-h-[140px]`}
                placeholder="What happened? What did you expect? Steps to reproduce help a lot."
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-8 py-3.5 text-base font-bold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  Sending…
                </>
              ) : (
                <>
                  Send feedback
                  <Send className="h-5 w-5" aria-hidden />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 flex gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4 md:p-5">
          <Lightbulb
            className="mt-0.5 h-5 w-5 shrink-0 text-brand"
            aria-hidden
          />
          <p className="text-sm font-medium leading-relaxed text-[#475569]">
            This goes to our engineering team. For urgent production issues,
            include the audit ID and roughly when it occurred — we usually
            triage within a day.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
