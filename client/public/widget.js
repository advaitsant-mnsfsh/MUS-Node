(function (window) {
    const HEADER_HEIGHT = 400; // Default height

    function createQueryString(params) {
        return Object.keys(params)
            .filter(key => params[key] !== undefined && params[key] !== null)
            .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
            .join('&');
    }

    const AuditWidget = {
        /**
         * Mounts the Audit Widget into a container.
         * @param {Object} config Configuration object
         * @param {string} config.container Selector for the container element (e.g., '#widget-root')
         * @param {string} config.apiKey YOUR_API_KEY from the dashboard
         * @param {Object} config.styles Custom styling options
         * @param {string} [config.styles.primaryColor] Hex color for buttons/highlights
         * @param {string} [config.styles.backgroundColor] Background color of the widget
         * @param {string} [config.styles.textColor] Main text color
         * @param {string} [config.styles.borderRadius] CSS border-radius (e.g., '12px')
         * @param {string} [config.styles.fontFamily] Font family to use
         * @param {string} [config.styles.logoUrl] URL to your logo
         * @param {string} [config.styles.logoPosition] 'top-left' | 'top-center' | 'top-right'
         */
        mount: function (config) {
            const container = document.querySelector(config.container);
            if (!container) {
                console.error('AuditWidget: Container element not found:', config.container);
                return;
            }

            if (!config.apiKey) {
                console.error('AuditWidget: apiKey is required');
                return;
            }

            // Base URL - In production, this would be hardcoded to your hosted app URL
            // For development, we try to detect or default to localhost, but hardcoding the current origin is safest for relative use
            // Scripts are usually served from the app itself, so we can use that origin.
            // If script is loaded from CDN, we'd need the app URL passed or hardcoded.
            // We'll calculate it from the script tag src if possible, or just default to the one in the example.
            // Ideally, the script knows where it came from.

            // Let's assume the script is hosted at origin/widget.js
            let baseUrl = '';
            const scriptTag = document.querySelector('script[src*="widget.js"]');
            if (scriptTag) {
                try {
                    const url = new URL(scriptTag.src);
                    baseUrl = url.origin;
                } catch (e) {
                    baseUrl = 'http://localhost:5173';
                }
            } else {
                baseUrl = 'http://localhost:5173';
            }

            const styles = config.styles || {};

            const params = {
                apiKey: config.apiKey,
                primaryColor: styles.primaryColor,
                backgroundColor: styles.backgroundColor,
                textColor: styles.textColor,
                borderRadius: styles.borderRadius,
                fontFamily: styles.fontFamily,
                logoUrl: styles.logoUrl,
                logoPosition: styles.logoPosition,
                monsoonLogoPosition: styles.monsoonLogoPosition,
                inputBackgroundColor: styles.inputBackgroundColor,
                placeholderColor: styles.placeholderColor,
                placeholderText: styles.placeholderText,
                uploadIconUrl: styles.uploadIconUrl,
                submitIconUrl: styles.submitIconUrl,
                layout: styles.layout,
                paddingPercentage: styles.paddingPercentage,
                inputWidthPercentage: styles.inputWidthPercentage,
                buttonWidthPercentage: styles.buttonWidthPercentage,
                gap: styles.gap,
                alignment: styles.alignment,
                inputHeight: styles.inputHeight,
                buttonHeight: styles.buttonHeight,
                logoHeight: styles.logoHeight,
                monsoonLogoHeight: styles.monsoonLogoHeight,
                containerBorder: styles.containerBorder,
                containerBorderRadius: styles.containerBorderRadius,
                containerBoxShadow: styles.containerBoxShadow,
                // Enhanced spacing controls
                inputMarginBottom: styles.inputMarginBottom,
                buttonMarginBottom: styles.buttonMarginBottom,
                logoMarginTop: styles.logoMarginTop,
                contentMarginTop: styles.contentMarginTop,
                contentMarginBottom: styles.contentMarginBottom,
                contentMarginLeft: styles.contentMarginLeft,
                contentMarginRight: styles.contentMarginRight,
                // Widget size constraints
                widgetMinHeight: styles.widgetMinHeight,
                widgetMaxHeight: styles.widgetMaxHeight,
                widgetMinWidth: styles.widgetMinWidth,
                widgetMaxWidth: styles.widgetMaxWidth,
                monsoonLogoColor: styles.monsoonLogoColor,
                tagBackgroundColor: styles.tagBackgroundColor,
                tagTextColor: styles.tagTextColor,
                inputBorderColor: styles.inputBorderColor,
                buttonTextColor: styles.buttonTextColor,

                // Loading
                loadingText: styles.loadingText,
                loadingBackgroundColor: styles.loadingBackgroundColor,
                loadingTextColor: styles.loadingTextColor,
                loadingSpinnerColor: styles.loadingSpinnerColor,

                // Success
                successTitle: styles.successTitle,
                successDescription: styles.successDescription,
                successBackgroundColor: styles.successBackgroundColor,
                successTextColor: styles.successTextColor,
                shareLinkBackgroundColor: styles.shareLinkBackgroundColor,
                shareLinkTextColor: styles.shareLinkTextColor,
                copyButtonColor: styles.copyButtonColor,
                viewReportButtonColor: styles.viewReportButtonColor,
                viewReportButtonTextColor: styles.viewReportButtonTextColor
            };

            const queryString = createQueryString(params);
            const iframeSrc = `${baseUrl}/embed?${queryString}`;

            const iframe = document.createElement('iframe');
            iframe.src = iframeSrc;
            iframe.width = '100%';
            iframe.style.border = 'none';
            iframe.style.overflow = 'hidden';
            iframe.style.backgroundColor = 'transparent';
            iframe.setAttribute('allowtransparency', 'true');
            iframe.setAttribute('scrolling', 'no');
            iframe.title = 'Audit Widget';

            // Auto-resize iframe based on content height
            window.addEventListener('message', function (e) {
                if (e.data && e.data.type === 'widget-resize' && e.data.height) {
                    console.log('Widget resize:', e.data.height);
                    iframe.style.setProperty('height', e.data.height + 'px', 'important');
                }
            });

            container.innerHTML = ''; // Clear container
            container.appendChild(iframe);
        }
    };

    window.AuditWidget = AuditWidget;

})(window);
