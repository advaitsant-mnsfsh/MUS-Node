import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function UserBadge() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    if (!user) return null;

    const initials = user.email
        ? user.email.substring(0, 2).toUpperCase()
        : 'U';

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-10 h-10 bg-brand text-white border-2 border-border-main rounded-full hover:bg-brand-hover transition-all shadow-neo hover:shadow-neo-hover active:shadow-none active:translate-x-px active:translate-y-px"
                aria-label="User menu"
            >
                <div className="text-sm font-bold">
                    {initials}
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-auto min-w-[260px] bg-white rounded-lg border-2 border-black shadow-neo-sm py-1 origin-top-right animate-in fade-in zoom-in-95 duration-100 z-50">
                    <div className="px-5 py-4 border-b-2 border-slate-100">
                        <p className="text-xs text-text-secondary uppercase font-black tracking-wider mb-1">Signed in as</p>
                        <p className="text-sm font-bold text-text-primary break-words leading-tight">
                            {user.email}
                        </p>
                    </div>

                    {/* Placeholder for future functionality */}
                    <div className="px-5 py-3 border-b-2 border-slate-100">
                        <p className="text-sm font-medium text-slate-400 cursor-not-allowed flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            Change Password / Reset
                        </p>
                    </div>

                    <button
                        onClick={async () => {
                            setIsOpen(false);
                            await signOut();
                            navigate('/');
                        }}
                        className="w-full text-left px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        Sign Out
                    </button>
                </div>

            )}

            {/* Backdrop to close menu when clicking outside */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
