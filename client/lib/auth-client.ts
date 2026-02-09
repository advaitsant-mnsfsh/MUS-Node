import { createAuthClient } from "better-auth/react"
import { emailOTPClient } from "better-auth/client/plugins"

import { getBackendUrl } from "../services/config";

const getBaseURL = () => {
    let url = getBackendUrl();
    if (url.endsWith('/api')) {
        url = url.slice(0, -4);
    }
    return url;
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
