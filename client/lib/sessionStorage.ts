/**
 * Simple session storage using localStorage
 * This bypasses cross-origin cookie issues entirely
 */

interface StoredSession {
    token: string;
    user: any;
    expiresAt: number;
}

const SESSION_KEY = 'auth_session';

export function saveSession(token: string, user: any, expiresIn: number = 30 * 24 * 60 * 60 * 1000) {
    const session: StoredSession = {
        token,
        user,
        expiresAt: Date.now() + expiresIn
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    console.log('[SessionStorage] ✅ Session saved to localStorage');
}

export function getSession(): StoredSession | null {
    try {
        const stored = localStorage.getItem(SESSION_KEY);
        if (!stored) {
            console.log('[SessionStorage] No session found in localStorage');
            return null;
        }

        const session: StoredSession = JSON.parse(stored);

        // Check if expired
        if (Date.now() > session.expiresAt) {
            console.log('[SessionStorage] Session expired, clearing');
            clearSession();
            return null;
        }

        console.log('[SessionStorage] ✅ Valid session found:', session.user.email);
        return session;
    } catch (e) {
        console.error('[SessionStorage] Error reading session:', e);
        return null;
    }
}

export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    console.log('[SessionStorage] Session cleared');
}
