import { authClient } from '../lib/auth-client';

/**
 * Enhanced fetch that automatically includes session authentication
 * Works around cross-origin cookie limitations by using Authorization header
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    // Get current session
    const { data: session } = await authClient.getSession();
    const sessionToken = (session as any)?.session?.token;

    // Merge headers
    const headers = new Headers(options.headers || {});

    // Add session token if available
    if (sessionToken) {
        headers.set('Authorization', `Bearer ${sessionToken}`);
    }

    // Always include credentials for cookie-based fallback
    const enhancedOptions: RequestInit = {
        ...options,
        headers,
        credentials: 'include'
    };

    return fetch(url, enhancedOptions);
}
