import { createAuthClient } from "better-auth/react"
import { emailOTPClient } from "better-auth/client/plugins"

const getBaseURL = () => {
    // Priority 1: Explicitly set Backend/API URLs (usually for advanced dev)
    if (import.meta.env.VITE_AUTH_BACKEND_URL) return import.meta.env.VITE_AUTH_BACKEND_URL;

    // Priority 2: Local Development Detection
    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost')) {
            return "http://localhost:8080";
        }
    }

    // Priority 3: Universal Railway Backend (Default)
    return "https://mus-node-production.up.railway.app";
}

export const authClient = createAuthClient({
    baseURL: getBaseURL(),
    fetchOptions: {
        credentials: 'include' // CRITICAL: Allow cross-origin cookies
    },
    plugins: [
        emailOTPClient()
    ]
})
