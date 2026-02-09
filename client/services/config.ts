export const getBackendUrl = () => {
    // Priority: 
    // 1. Environment variable VITE_BACKEND_URL
    // 2. Environment variable VITE_API_URL
    // 3. Static Production URL (as hardcoded fallback for reliability)
    const envUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL;

    if (envUrl) return envUrl;

    // Hardcoded production fallback per user request to ensure audits go to Railway
    return 'https://mus-node-production.up.railway.app';
};

export const getBaseUrlForStatic = () => {
    const url = getBackendUrl();
    let base = url.endsWith('/') ? url.slice(0, -1) : url;

    // Strip /api or /api/v1 from the end to get the root for /uploads
    if (base.endsWith('/api/v1')) {
        base = base.slice(0, -7);
    } else if (base.endsWith('/api')) {
        base = base.slice(0, -4);
    }

    return base;
};
