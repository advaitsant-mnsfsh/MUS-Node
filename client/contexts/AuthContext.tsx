import React, { createContext, useContext, useEffect, useState } from 'react';
import { authClient } from '../lib/auth-client';

// Adapting types for compatibility. 
// Ideally, you'd replace 'Session' / 'User' usage across the app with Better-Auth types eventually.
// For now, we define loose types that match the "Shape" expected by consumers.
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
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    isLoading: true,
    signOut: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // using the builtin hook from better-auth
    const { data: sessionData, isPending, error } = authClient.useSession();

    // PERSISTENCE HINT: Try to get a hint from localStorage to avoid initial flicker
    const [userHint, setUserHint] = useState<User | null>(() => {
        const saved = localStorage.getItem('mus_user_hint');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (sessionData?.user) {
            localStorage.setItem('mus_user_hint', JSON.stringify(sessionData.user));
            setUserHint(sessionData.user as unknown as User);
        } else if (!isPending && !sessionData) {
            localStorage.removeItem('mus_user_hint');
            setUserHint(null);
        }
    }, [sessionData, isPending]);

    // Derived state - Use hint if pending to avoid "loading" flash
    const session = sessionData ? (sessionData as unknown as Session) : null;
    const user = (sessionData?.user as unknown as User) || (isPending ? userHint : null);
    const isLoading = isPending && !userHint; // Only "loading" if we don't even have a hint


    const signOut = async () => {
        await authClient.signOut();
        // The hook will automatically update the state
    };

    return (
        <AuthContext.Provider value={{ session, user, isLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
