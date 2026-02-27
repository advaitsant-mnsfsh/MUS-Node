declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

export const initGA = () => {
    const GA_ID = import.meta.env.VITE_GA_ID;

    // If no ID is provided, or we already initialized, abort.
    if (!GA_ID || window.gtag) return;

    // Set up the dataLayer array
    window.dataLayer = window.dataLayer || [];

    // Create the globally accessible gtag function
    window.gtag = function () {
        window.dataLayer.push(arguments);
    };

    // Default setup
    window.gtag('js', new Date());

    // Configure the measurement ID with specific SPA parameters
    window.gtag('config', GA_ID, {
        send_page_view: false, // We will manually handle this below
        linker: {
            domains: ['myuxscore.com', 'beta.myuxscore.com']
        }
    });

    // Set default user type explicitly to solve race condition
    window.gtag('set', 'user_properties', {
        user_type: "unknown"
    });
};

export const setUserTypeProperty = () => {
    if (!window.gtag) return;

    const authType = localStorage.getItem('mus_auth_type') || 'unknown';

    window.gtag('set', 'user_properties', {
        user_type: authType
    });
};

export const trackPageView = (path: string) => {
    if (!window.gtag) return;

    // Update the user property just in case they logged in on another tab
    setUserTypeProperty();

    window.gtag('event', 'page_view', {
        page_path: path,
        page_location: window.location.href,
        page_title: document.title
    });
};

export const trackEvent = (name: string, params?: Record<string, any>) => {
    if (!window.gtag) return;
    window.gtag('event', name, params);
};
