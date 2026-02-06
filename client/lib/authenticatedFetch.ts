import { authClient } from '../lib/auth-client';

/**
 * Enhanced fetch that automatically includes session authentication
 * Works around cross-origin cookie limitations by using Authorization header
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    console.log(`[authenticatedFetch] 🔵 Starting request to: ${url}`);

    // Get current session
    const { data: session } = await authClient.getSession();
    console.log(`[authenticatedFetch] Session data:`, session);

    const sessionToken = (session as any)?.session?.token;
    console.log(`[authenticatedFetch] Session token exists: ${!!sessionToken}, Length: ${sessionToken?.length || 0}`);

    if (sessionToken) {
        console.log(`[authenticatedFetch] Token preview: ${sessionToken.substring(0, 20)}...`);
    } else {
        console.warn(`[authenticatedFetch] ⚠️ NO SESSION TOKEN FOUND!`);
    }

    // Merge headers
    const headers = new Headers(options.headers || {});

    // Add session token if available
    if (sessionToken) {
        headers.set('Authorization', `Bearer ${sessionToken}`);
        console.log(`[authenticatedFetch] ✅ Added Authorization header`);
    }

    // Always include credentials for cookie-based fallback
    const enhancedOptions: RequestInit = {
        ...options,
        headers,
        credentials: 'include'
    };

    console.log(`[authenticatedFetch] Final headers:`, Object.fromEntries(headers.entries()));
    console.log(`[authenticatedFetch] 🚀 Making request...`);

    return fetch(url, enhancedOptions);
}
