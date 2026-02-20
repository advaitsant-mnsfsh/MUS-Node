import { createAuthClient } from "better-auth/react"
import { emailOTPClient } from "better-auth/client/plugins"

const getBaseURL = () => {
    // Priority 1: Explicitly set Backend/API URLs (usually for advanced dev)
    if (import.meta.env.VITE_AUTH_BACKEND_URL) return import.meta.env.VITE_AUTH_BACKEND_URL;

    // Priority 2: Universal Railway Backend (Default)
    // This ensures signups and logins happen on the same DB regardless of where you run the frontend.
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
