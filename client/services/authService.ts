import { authClient } from '../lib/auth-client';
import { saveSession, clearSession } from '../lib/sessionStorage';

/**
 * Update user profile (e.g. set password)
 */
export async function updateProfile(attributes: { password?: string; data?: any }) {
    // Better-auth profile update
    const { data, error } = await authClient.updateUser(attributes);
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

        // TRY ALL COMMON TOKEN PATHS
        const token = (authData as any)?.token || (authData as any)?.session?.token;
        const user = authData?.user;

        if (token && user) {
            console.log('[AuthService] ✅ Token found, saving session...');
            saveSession(token, user);
        } else {
            console.warn('[AuthService] ⚠️ No token or user found in response. Token path check:', {
                'data.token': !!(authData as any)?.token,
                'data.session.token': !!(authData as any)?.session?.token
            });
        }

        if (error) {
            return { session: null, error: error.message || 'Failed to sign up' };
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

        // TRY ALL COMMON TOKEN PATHS
        const token = (data as any)?.token || (data as any)?.session?.token;
        const user = data?.user;

        if (token && user) {
            console.log('[AuthService] ✅ Token found, saving session...');
            saveSession(token, user);
        } else {
            console.warn('[AuthService] ⚠️ No token or user found in response. Token path check:', {
                'data.token': !!(data as any)?.token,
                'data.session.token': !!(data as any)?.session?.token
            });
        }

        if (error) {
            return { session: null, error: error.message || 'Failed to sign in' };
        }

        return { session: data, error: null };
    } catch (err: any) {
        console.error('[AuthService] 💥 Unexpected error signing in:', err);
        return { session: null, error: err.message || 'Failed to sign in' };
    }
}

/**
 * Send OTP to email
 */
export async function sendOtp(email: string): Promise<{ error: string | null }> {
    try {
        // Better Auth Email OTP Request
        const { error } = await authClient.signIn.emailOtp({
            email,
            type: "sign-in" // or "email-verification"
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
 * Verify OTP
 */
export async function verifyOtp(email: string, token: string, password?: string): Promise<{ session: any; error: string | null }> {
    try {
        // 1. Verify Verification OTP
        // Note: Casting authClient to any to access plugin methods if inference fails
        const client = authClient as any;
        const { data, error } = await client.emailOtp.verifyEmail({
            email,
            otp: token
        });

        if (error) {
            console.error('Error verifying OTP:', error);
            return { session: null, error: error.message };
        }

        // 2. If password provided, Log In immediately to get session
        if (password) {
            return await signIn(email, password);
        }

        // If no password, return success but no session (user needs to login manually)
        return { session: null, error: null };

    } catch (err: any) {
        // Fallback: Try Login OTP (classic flow) just in case
        console.warn('Verification failed, trying Login OTP flow...', err);
        try {
            const { data, error } = await authClient.signIn.emailOtp({
                email,
                otp: token,
                type: "sign-in"
            });
            if (error) throw error;
            return { session: data, error: null };
        } catch (loginErr: any) {
            console.error('Unexpected error verifying OTP:', loginErr);
            return { session: null, error: loginErr.message || 'Failed to verify OTP' };
        }
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
