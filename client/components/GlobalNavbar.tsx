import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { UserBadge } from './UserBadge';
import { AuthBlocker } from './AuthBlocker';

export const GlobalNavbar: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authInitialMode, setAuthInitialMode] = useState(false); // false = signup, true = login

    const isActive = (path: string) => location.pathname === path;

    const handleAuthSuccess = () => {
        setShowAuthModal(false);
        // Redirect to dashboard after successful login
        navigate('/dashboard');
    };

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm font-['DM_Sans']">
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
                            className={`text-sm font-bold transition-colors ${isActive('/')
                                ? 'text-brand'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            Assess Now
                        </Link>

                        {/* My Reports (was Dashboard) - Visible only when logged in */}
                        {user && (
                            <Link
                                to="/dashboard"
                                className={`text-sm font-semibold transition-colors ${isActive('/dashboard')
                                    ? 'text-brand'
                                    : 'text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                My Reports
                            </Link>
                        )}

                        {/* About - Always visible & Stable */}
                        <Link
                            to="/about"
                            className={`text-sm font-semibold transition-colors ${isActive('/about')
                                ? 'text-brand'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            About
                        </Link>

                        {/* API Keys - Always visible */}
                        <Link
                            to="/api-keys"
                            className={`text-sm font-semibold transition-colors ${isActive('/api-keys')
                                ? 'text-brand'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            API Keys
                        </Link>

                        {/* Pricing - Always visible */}
                        <Link
                            to="/pricing"
                            className={`text-sm font-semibold transition-colors ${isActive('/pricing')
                                ? 'text-brand'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            Pricing
                        </Link>
                    </div>

                    {/* Right: Auth Section & Dynamic Links */}
                    <div className="flex items-center gap-6 z-10">
                        {user ? (
                            <>
                                {/* User Dropdown */}
                                <UserBadge />
                            </>
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
                                    className="px-7 py-2 bg-white text-text-primary border-2 border-border-main font-semibold text-sm hover:bg-slate-50 transition-all shadow-neo hover:shadow-neo-hover active:shadow-none active:translate-x-px active:translate-y-px"
                                >
                                    Login
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

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
