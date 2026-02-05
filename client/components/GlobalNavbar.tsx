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

    const isActive = (path: string) => location.pathname === path;

    const handleAuthSuccess = () => {
        setShowAuthModal(false);
        // Redirect to dashboard after successful login
        navigate('/dashboard');
    };

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm font-['DM_Sans']">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex justify-between items-center h-20">
                    {/* Left: Logo */}
                    <div className="shrink-0 z-10">
                        <Link to="/">
                            <Logo />
                        </Link>
                    </div>

                    {/* Center: Absolute Stable Navigation */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-8">
                        {/* About - Always visible & Stable */}
                        <Link
                            to="/about"
                            className={`text-sm font-semibold transition-colors ${isActive('/about')
                                ? 'text-[#6366F1]'
                                : 'text-[#64748B] hover:text-[#1E293B]'
                                }`}
                        >
                            About
                        </Link>

                        {/* API Keys - Always visible */}
                        <Link
                            to="/api-keys"
                            className={`text-sm font-semibold transition-colors ${isActive('/api-keys')
                                ? 'text-[#6366F1]'
                                : 'text-[#64748B] hover:text-[#1E293B]'
                                }`}
                        >
                            API Keys
                        </Link>

                        {/* Pricing - Always visible */}
                        <Link
                            to="/pricing"
                            className={`text-sm font-semibold transition-colors ${isActive('/pricing')
                                ? 'text-[#6366F1]'
                                : 'text-[#64748B] hover:text-[#1E293B]'
                                }`}
                        >
                            Pricing
                        </Link>

                        {/* Dashboard - Visible only when logged in */}
                        {user && (
                            <Link
                                to="/dashboard"
                                className={`text-sm font-semibold transition-colors ${isActive('/dashboard')
                                    ? 'text-[#6366F1]'
                                    : 'text-[#64748B] hover:text-[#1E293B]'
                                    }`}
                            >
                                Dashboard
                            </Link>
                        )}
                    </div>

                    {/* Right: Auth Section & Dynamic Links */}
                    <div className="flex items-center gap-4 z-10">
                        {user ? (
                            <>
                                {/* Start Assessment Button - Hide on landing page and dashboard */}
                                {!isActive('/') && !isActive('/dashboard') && (
                                    <Link
                                        to="/"
                                        className="px-6 py-2 bg-[#1E293B] text-white font-semibold text-sm rounded-lg hover:bg-[#374151] transition-colors"
                                    >
                                        Start Assessment
                                    </Link>
                                )}
                                {/* User Dropdown */}
                                <UserBadge />
                            </>
                        ) : (
                            <button
                                onClick={() => setShowAuthModal(true)}
                                className="px-7 py-2 bg-white text-[#1E293B] border-2 border-[#000000] font-semibold text-sm hover:bg-slate-50 transition-all shadow-neo hover:shadow-neo-hover active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
                            >
                                Login
                            </button>
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
                />
            )}
        </nav>
    );
};
