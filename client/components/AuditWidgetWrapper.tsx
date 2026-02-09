import React, { useEffect, useRef } from 'react';

declare global {
    interface Window {
        AuditWidget: any;
    }
}

interface AuditWidgetProps {
    apiKey: string;
    styles?: {
        primaryColor?: string;
        backgroundColor?: string;
        textColor?: string;
        borderRadius?: string;
        fontFamily?: string;
        inputBackgroundColor?: string;
        inputHeight?: string;
        buttonHeight?: string;
        logoHeight?: string;
        monsoonLogoHeight?: string;
        logoUrl?: string;
        logoPosition?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
        monsoonLogoPosition?: string;
    };
}

export const AuditWidgetWrapper: React.FC<AuditWidgetProps> = ({ apiKey, styles }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scriptLoaded = useRef(false);

    useEffect(() => {
        // 1. Check if script is already present
        if (!window.AuditWidget && !document.querySelector('script[src*="widget.js"]')) {
            const script = document.createElement('script');
            // UPDATE THIS URL TO YOUR PRODUCTION DOMAIN
            script.src = 'http://localhost:5173/widget.js';
            script.async = true;
            script.onload = () => initWidget();
            document.body.appendChild(script);
        } else {
            initWidget();
        }

        function initWidget() {
            if (window.AuditWidget && containerRef.current) {
                window.AuditWidget.mount({
                    container: `#${containerRef.current.id}`,
                    apiKey: apiKey,
                    styles: styles
                });
            } else {
                // Retry if script loaded but window.AuditWidget not ready
                setTimeout(initWidget, 100);
            }
        }
    }, [apiKey, styles]);

    return <div id="audit-widget-react-root" ref={containerRef} style={{ width: '100%', minHeight: '100px' }} />;
};
