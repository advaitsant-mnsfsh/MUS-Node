import { createAuthClient } from "better-auth/react"
import { emailOTPClient } from "better-auth/client/plugins"

const getBaseURL = () => {
    if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL;
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    if (import.meta.env.PROD) return "https://mus-node-production.up.railway.app";
    return "http://localhost:8080";
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
