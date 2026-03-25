import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ChangePasswordModal } from "./ChangePasswordModal";

type UserBadgeProps = {
  /**
   * Mobile: viewport-anchored sheet (wider than the narrow nav drawer on purpose — same pattern as
   * native action sheets). Desktop: popover under the navbar avatar.
   */
  openMenuAbove?: boolean;
};

export function UserBadge({ openMenuAbove = false }: UserBadgeProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  if (!user) return null;

  const initials = user.email ? user.email.substring(0, 2).toUpperCase() : "U";

  const menuShellClass = openMenuAbove
    ? "fixed z-[110] max-h-[min(22rem,50vh)] overflow-y-auto rounded-xl border-1 border-black bg-white py-0 shadow-neo-sm animate-in fade-in slide-in-from-bottom-3 duration-200 ease-out [inset-inline:0.75rem] bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))]"
    : "absolute z-[110] mt-2 max-h-[min(22rem,70vh)] w-auto min-w-[260px] origin-top-right animate-in fade-in zoom-in-95 duration-100 top-full right-0 overflow-y-auto rounded-lg border-1 border-black bg-white py-0 ";

  /** Shell for a11y: sheet behaves like a small dialog on mobile; desktop stays a compact surface. */
  const shellAria = openMenuAbove
    ? { role: "dialog" as const, "aria-modal": true as const, "aria-label": "Account" }
    : { role: "region" as const, "aria-label": "Account menu" };

  return (
    <div className="relative z-[100]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border-main bg-brand text-white shadow-sm transition-all hover:bg-brand-hover hover:shadow-md active:shadow-sm"
        aria-expanded={isOpen}
        aria-haspopup={openMenuAbove ? "dialog" : "menu"}
        aria-label="User menu"
      >
        <div className="text-sm font-bold">{initials}</div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[90] bg-black/25"
            aria-hidden
            onClick={() => setIsOpen(false)}
          />
          <div {...shellAria} className={menuShellClass}>
            <header className="flex items-start justify-between gap-3 border-b-2 border-slate-100 px-4 py-3 sm:px-5 sm:py-4">
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-sm font-black uppercase tracking-wider text-text-secondary">
                  Signed in as
                </p>
                <p className="wrap-break-word text-sm font-bold leading-tight text-text-primary">
                  {user.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="-m-1 shrink-0 rounded-md p-1.5 text-text-secondary transition-colors hover:bg-slate-100 hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                aria-label="Close account menu"
              >
                <X className="h-5 w-5" strokeWidth={2} aria-hidden />
              </button>
            </header>

            <div role="menu" aria-label="Account actions">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  setShowPasswordModal(true);
                }}
                className="flex w-full items-center gap-2 border-b-2 border-slate-100 px-4 py-3 text-left text-sm font-medium text-text-secondary transition-all hover:bg-slate-50 hover:text-brand sm:px-5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-lock shrink-0"
                  aria-hidden
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Change Password / Reset
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={async () => {
                  setIsOpen(false);
                  await signOut();
                  navigate("/");
                }}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-[#f56560] transition-colors hover:bg-red-50 sm:px-5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="h-4 w-4 shrink-0"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}
