export const isBetaSubdomain = () => {
    // For local testing, we can check if the hostname starts with 'beta' 
    // or if we've manually set a flag in localStorage for development.
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return localStorage.getItem('MOCK_BETA_MODE') === 'true';
    }
    return window.location.hostname.startsWith('beta.');
};

export const hasBetaAccess = () => {
    // Check both cookie and sessionStorage for robustness within a single session
    const hasCookie = document.cookie.split(';').some((item) => item.trim().startsWith('beta_authorized='));
    const hasSession = sessionStorage.getItem('beta_authorized') === 'true';
    return hasCookie || hasSession;
};
