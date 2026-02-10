import { authClient } from '../lib/auth-client';
import { saveSession, clearSession } from '../lib/sessionStorage';

/**
 * Update user profile (e.g. set name)
 */
export async function updateProfile(attributes: { name?: string; image?: string }) {
    const { data, error } = await authClient.updateUser(attributes as any);
    return { data, error: error ? { message: error.message } : null };
}

/**
 * Change or Set user password
 */
export async function changePassword(newPassword: string, currentPassword: string) {
    const { data, error } = await authClient.changePassword({
        newPassword: newPassword,
        currentPassword: currentPassword,
        revokeOtherSessions: true
    });
    return { data, error: error ? { message: error.message } : null };
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, data?: any): Promise<{ session: any; error: string | null }> {
    try {
        console.log('[AuthService] 🚀 Attempting Sign Up for:', email);
        const { data: authData, error } = await authClient.signUp.email({
            email,
            password,
            name: data?.name || email.split('@')[0],
        });

        console.log('[AuthService] Sign Up Response:', { data: authData, error });

        if (error) {
            console.error('Error signing up:', error);
            return { session: null, error: error.message || 'Failed to sign up' };
        }

        // Note: Better-auth might not return a session immediately if email verification is required
        // But if it does (e.g. autoSignIn is on), we save it.
        const token = (authData as any)?.token || (authData as any)?.session?.token;
        if (token && authData?.user) {
            saveSession(token, authData.user);
        }

        return { session: authData, error: null };
    } catch (err: any) {
        console.error('[AuthService] 💥 Unexpected error signing up:', err);
        return { session: null, error: err.message || 'Failed to sign up' };
    }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<{ session: any; error: string | null }> {
    try {
        console.log('[AuthService] 🚀 Attempting Sign In for:', email);
        const { data, error } = await authClient.signIn.email({
            email,
            password,
        });

        console.log('[AuthService] Sign In Response:', { data, error });

        if (error) {
            console.error('Error signing in:', error);
            return { session: null, error: error.message || 'Failed to sign in' };
        }

        // TRY ALL COMMON TOKEN PATHS
        const token = (data as any)?.token || (data as any)?.session?.token;
        const user = (data as any)?.user;

        if (token && user) {
            console.log('[AuthService] ✅ Token found, saving session...');
            saveSession(token, user);
        }

        return { session: data, error: null };
    } catch (err: any) {
        console.error('[AuthService] 💥 Unexpected error signing in:', err);
        return { session: null, error: err.message || 'Failed to sign in' };
    }
}

/**
 * Send OTP to email (for verification or login)
 */
export async function sendOtp(email: string): Promise<{ error: string | null }> {
    try {
        const client = authClient as any;
        const { error } = await client.emailOtp.sendVerificationOtp({
            email
        });

        if (error) {
            console.error('Error sending OTP:', error);
            return { error: error.message };
        }

        return { error: null };
    } catch (err: any) {
        console.error('Unexpected error sending OTP:', err);
        return { error: err.message || 'Failed to send OTP' };
    }
}

/**
 * Verify Email with OTP
 */
export async function verifyOtp(email: string, otp: string, password?: string): Promise<{ session: any; error: string | null }> {
    try {
        const client = authClient as any;
        const { data, error } = await client.emailOtp.verifyEmail({
            email,
            otp
        });

        if (error) {
            console.error('Error verifying OTP:', error);
            return { session: null, error: error.message };
        }

        console.log('[AuthService] OTP Verified Successfully:', data);

        // If data contains session, save it
        const authData = data as any;
        const token = authData?.token || authData?.session?.token;
        const user = authData?.user;
        if (token && user) {
            saveSession(token, user);
        }

        // 2. If no session returned but password provided, Log In immediately
        if (!token && password) {
            return await signIn(email, password);
        }

        return { session: data, error: null };

    } catch (err: any) {
        console.error('Unexpected error verifying OTP:', err);
        return { session: null, error: err.message || 'Failed to verify OTP' };
    }
}

/**
 * Check if user is currently authenticated
 */
export async function getCurrentSession() {
    const { data: session } = await authClient.getSession();
    return session;
}

/**
 * Sign out
 */
export async function signOut() {
    clearSession();
    await authClient.signOut();
}
