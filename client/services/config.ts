export const getBackendUrl = () => {
    // Priority: 
    // 1. Auto-detected Railway Origin (Dynamic)
    // 2. Environment variable VITE_BACKEND_URL
    // 3. Environment variable VITE_API_URL
    // 4. Static Production URL (as final fallback)

    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const origin = window.location.origin;

        // 1. Check for local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:8080';
        }

        // 2. Support dynamic Railway environments (e.g., stage-1) by default
        // We prioritize this over VITE_ vars because those are often baked-in at build time
        if (hostname.endsWith('.railway.app')) {
            console.log(`[Config] 🚂 Auto-detected Railway Origin: ${origin}`);
            return origin;
        }

        const envUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL;
        if (envUrl) {
            console.log(`[Config] 🛠️ Using Environment Backend: ${envUrl}`);
            return envUrl;
        }

        console.log(`[Config] 🏠 Using Hardcoded Production: https://mus-node-production.up.railway.app`);
    }

    // Static Production URL (as final fallback)
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
