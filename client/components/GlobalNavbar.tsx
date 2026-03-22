import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Info,
  KeyRound,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "../contexts/AuthContext";
import { UserBadge } from "./UserBadge";
import { AuthBlocker } from "./AuthBlocker";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  authOnly?: boolean;
};

const MOBILE_DRAWER_EASE = [0.25, 0.1, 0.25, 1] as const;
const MOBILE_DRAWER_DURATION = 0.26;

const MOBILE_MAIN_NAV: NavItem[] = [
  { to: "/", label: "Assess Now", icon: Sparkles },
  {
    to: "/dashboard",
    label: "My Reports",
    icon: LayoutDashboard,
    authOnly: true,
  },
  { to: "/about", label: "About", icon: Info },
  { to: "/api-keys", label: "API Keys", icon: KeyRound },
  { to: "/pricing", label: "Pricing", icon: Tag },
  { to: "/feedback", label: "Feedback", icon: MessageSquare, authOnly: true },
];

export const GlobalNavbar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState(false); // false = signup, true = login
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Redirect to dashboard after successful login
    navigate("/dashboard");
  };

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileMenuOpen, closeMobileMenu]);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-50 font-['DM_Sans']">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex justify-between items-center h-16">
          {/* Left: Logo */}
          <div className="shrink-0 z-10">
            <Link to="/">
              <Logo imgClass="h-8" />
            </Link>
          </div>

          {/* Center: Absolute Stable Navigation */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-8">
            {/* Assess Now - Always visible */}
            <Link
              to="/"
              className={`text-sm font-bold transition-colors ${
                isActive("/")
                  ? "text-brand"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Assess Now
            </Link>

            {/* My Reports (was Dashboard) - Visible only when logged in */}
            {user && (
              <Link
                to="/dashboard"
                className={`text-sm font-semibold transition-colors ${
                  isActive("/dashboard")
                    ? "text-brand"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                My Reports
              </Link>
            )}

            {/* About - Always visible & Stable */}
            <Link
              to="/about"
              className={`text-sm font-semibold transition-colors ${
                isActive("/about")
                  ? "text-brand"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              About
            </Link>

            {/* API Keys - Always visible */}
            <Link
              to="/api-keys"
              className={`text-sm font-semibold transition-colors ${
                isActive("/api-keys")
                  ? "text-brand"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              API Keys
            </Link>

            {/* Pricing - Always visible */}
            <Link
              to="/pricing"
              className={`text-sm font-semibold transition-colors ${
                isActive("/pricing")
                  ? "text-brand"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Pricing
            </Link>

            {/* Feedback - Visible only when logged in */}
            {user && (
              <Link
                to="/feedback"
                className={`text-sm font-semibold transition-colors ${
                  isActive("/feedback")
                    ? "text-brand"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Feedback
              </Link>
            )}
          </div>

          {/* Right: Auth Section (desktop) + Mobile Menu Toggle */}
          <div className="flex items-center gap-3 sm:gap-4 z-10">
            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <UserBadge />
              ) : (
                <>
                  <button
                    onClick={() => {
                      setAuthInitialMode(false); // Signup mode
                      setShowAuthModal(true);
                    }}
                    className="text-sm font-bold text-text-primary hover:text-brand transition-colors"
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => {
                      setAuthInitialMode(true); // Login mode
                      setShowAuthModal(true);
                    }}
                    className="px-4 py-2 bg-white text-text-primary border-1 border-border-main font-semibold text-sm hover:bg-slate-50 transition-all shadow-neo hover:shadow-neo-hover active:shadow-none active:translate-x-px active:translate-y-px"
                  >
                    Login
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu toggle — matches neo / app chrome */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-md border-1 border-border-main bg-white p-2 text-text-primary shadow-neo transition-all hover:bg-slate-50 hover:shadow-neo-hover active:shadow-none active:translate-x-px active:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              aria-label={
                isMobileMenuOpen ? "Close main menu" : "Open main menu"
              }
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-drawer"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" strokeWidth={2} aria-hidden />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={2} aria-hidden />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: drawer + full-bleed scrim (same warm family as shell — no cold blur sheet) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-nav-overlay"
            className="fixed inset-x-0 top-16 bottom-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              type: "tween",
              duration: MOBILE_DRAWER_DURATION,
              ease: MOBILE_DRAWER_EASE,
            }}
          >
            {/* Full-bleed scrim: warm dim only (no backdrop-blur) so it doesn’t read as a separate “glass” layer vs. the drawer */}
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              className="absolute inset-0 z-0 cursor-pointer border-0 bg-amber-950/15 p-0 transition-colors hover:bg-amber-950/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                type: "tween",
                duration: MOBILE_DRAWER_DURATION * 0.85,
                ease: MOBILE_DRAWER_EASE,
              }}
              onClick={closeMobileMenu}
            />
            <motion.aside
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Main navigation"
              className="relative z-10 flex h-full w-[min(88vw,20rem)] max-w-[20rem] flex-col border-r border-slate-200/80 bg-page-bg shadow-[4px_0_28px_-6px_rgba(15,23,42,0.12)]"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              transition={{
                type: "tween",
                duration: MOBILE_DRAWER_DURATION,
                ease: MOBILE_DRAWER_EASE,
              }}
            >
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 pb-6 pt-5">
                <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-text-secondary">
                  Navigate
                </p>
                <p className="mb-4 text-xs text-text-secondary/90">
                  Jump to any section of the app.
                </p>

                <nav className="flex flex-col gap-1" aria-label="Primary">
                  {MOBILE_MAIN_NAV.filter((item) => !item.authOnly || user).map(
                    ({ to, label, icon: Icon }) => {
                      const active = isActive(to);
                      return (
                        <Link
                          key={to}
                          to={to}
                          onClick={closeMobileMenu}
                          className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                            active
                              ? "bg-white text-brand ring-1 ring-slate-200/80"
                              : "text-text-primary hover:bg-white/80 hover:text-text-primary"
                          }`}
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white transition-transform group-active:scale-[0.97] ${
                              active ? "text-brand" : "text-text-secondary"
                            }`}
                          >
                            <Icon className="h-4 w-4" strokeWidth={2} />
                          </span>
                          <span className="min-w-0 flex-1">{label}</span>
                          {active && (
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                              aria-hidden
                            />
                          )}
                        </Link>
                      );
                    },
                  )}
                </nav>
              </div>

              <div className="shrink-0 border-t border-slate-200/90 bg-page-bg px-4 py-4">
                <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-text-secondary">
                  Account
                </p>
                {user ? (
                  <div className="flex items-center gap-3">
                    <UserBadge />
                    <span className="min-w-0 truncate text-xs font-medium text-text-secondary">
                      {user.email}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthInitialMode(false);
                        setShowAuthModal(true);
                        closeMobileMenu();
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-text-primary transition-colors hover:bg-slate-50"
                    >
                      Sign Up
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthInitialMode(true);
                        setShowAuthModal(true);
                        closeMobileMenu();
                      }}
                      className="w-full rounded-lg border border-slate-900/10 bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
                    >
                      Login
                    </button>
                  </div>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthBlocker
          onUnlock={handleAuthSuccess}
          isUnlocked={false}
          auditUrl=""
          onClose={() => setShowAuthModal(false)}
          initialLoginMode={authInitialMode}
        />
      )}
    </nav>
  );
};
