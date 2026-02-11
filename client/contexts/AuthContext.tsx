import React, { createContext, useContext, useEffect, useState } from 'react';
import { authClient } from '../lib/auth-client';
import { getSession as getStoredSession, clearSession as clearStoredSession } from '../lib/sessionStorage';

export interface User {
    id: string;
    email?: string;
    name?: string;
    image?: string;
    [key: string]: any;
}

export interface Session {
    user: User;
    [key: string]: any;
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    isLoading: true,
    signOut: async () => { },
    changePassword: async () => ({ success: false, error: 'Auth not initialized' }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // using the builtin hook from better-auth
    const { data: sessionData, isPending } = authClient.useSession();

    // Secondary source of truth: our manual localStorage session
    const [manualSession, setManualSession] = useState(getStoredSession());

    useEffect(() => {
        // Sync manual session with better-auth session if found
        if (sessionData?.user) {
            // We don't have the token here (it's in the cookie), 
            // but we at least update the user info in our manual store hint
            localStorage.setItem('mus_user_hint', JSON.stringify(sessionData.user));
            setManualSession(prev => ({
                token: prev?.token || '', // Keep existing token if we have it
                user: sessionData.user as unknown as User,
                expiresAt: prev?.expiresAt || (Date.now() + 30 * 24 * 60 * 60 * 1000)
            }));
        } else if (!isPending && !sessionData) {
            // If better-auth explicitly says no session, check if we have a manual one
            // We keep it because the Bearer token will still work even if cookies fail!
            const stored = getStoredSession();
            if (stored) {
                setManualSession(stored);
            }
        }
    }, [sessionData, isPending]);

    // Derived state
    const user = (sessionData?.user as unknown as User) || (manualSession?.user as unknown as User) || null;
    const session = sessionData ? (sessionData as unknown as Session) : (manualSession ? { user: manualSession.user } as unknown as Session : null);
    const isLoading = isPending && !user;

    const signOut = async () => {
        clearStoredSession();
        setManualSession(null);
        localStorage.removeItem('mus_user_hint');
        await authClient.signOut();
    };

    const changePassword = async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
        try {
            const { error } = await authClient.changePassword({
                newPassword,
                currentPassword,
                revokeOtherSessions: true,
            });

            if (error) {
                return { success: false, error: error.message || 'Failed to change password' };
            }

            return { success: true };
        } catch (e: any) {
            console.error('[AuthContext] Change Password Error:', e);
            return { success: false, error: e.message || 'An unexpected error occurred' };
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, isLoading, signOut, changePassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
