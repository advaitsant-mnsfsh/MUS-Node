import { createAuthClient } from "better-auth/react"
import { emailOTPClient } from "better-auth/client/plugins"

const getBaseURL = () => {
    // Priority 1: Explicitly set Backend/API URLs (usually for advanced dev)
    let envUrl = import.meta.env.VITE_AUTH_BACKEND_URL || import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;
    if (envUrl) {
        if (envUrl.endsWith('/')) envUrl = envUrl.slice(0, -1);
        if (!envUrl.startsWith('http://') && !envUrl.startsWith('https://')) {
            envUrl = `https://${envUrl}`;
        }
        return envUrl;
    }

    // Priority 2: Local Development Detection
    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost') || /^192\.168\.\d+\.\d+$/.test(host) || /^10\.\d+\.\d+\.\d+$/.test(host)) {
            return `http://${host}:3000`;
        }
    }

    // Priority 3: Universal Railway Backend (Default)
    return "https://api.myuxscore.com";
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
