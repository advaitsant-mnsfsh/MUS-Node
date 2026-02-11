import React, { useState, useEffect } from 'react';
import { Zap, ImagePlus, Globe, X, Loader2, Plus, Copy, Check } from 'lucide-react';

// Helper to determine if background is dark
const isDarkBackground = (color: string | undefined): boolean => {
    if (!color || color === 'transparent') return false;

    let r = 255, g = 255, b = 255;

    if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length >= 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }
    } else if (color.startsWith('rgb')) {
        const match = color.match(/\d+/g);
        if (match && match.length >= 3) {
            r = parseInt(match[0]);
            g = parseInt(match[1]);
            b = parseInt(match[2]);
        }
    }

    // Perceived brightness (Luma)
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma < 128;
};

export interface WidgetConfig {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
    fontFamily?: string;
    logoUrl?: string;
    logoPosition?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    monsoonLogoPosition?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    // ... (rest of interface is implied unchanged by context, but I need to be careful not to delete it)

    inputHeight?: string;
    buttonHeight?: string;
    logoHeight?: string;
    monsoonLogoHeight?: string;
    inputBackgroundColor?: string;
    placeholderColor?: string;
    placeholderText?: string;
    uploadIconUrl?: string;
    submitIconUrl?: string;
    layout?: 'horizontal' | 'vertical';
    paddingPercentage?: number;
    inputWidthPercentage?: number;
    buttonWidthPercentage?: number;
    gap?: string;
    alignment?: 'left' | 'center' | 'right';
    apiKey?: string;
    // Container Styling
    containerBorder?: string;
    containerBorderRadius?: string;
    containerBoxShadow?: string;
    // Enhanced Spacing Controls
    inputMarginBottom?: string;  // Space between input and button (vertical) or button (horizontal)
    buttonMarginBottom?: string; // Space between button and logo (vertical only)
    logoMarginTop?: string;      // Additional space above logo
    contentMarginTop?: string;   // Space from top border to content
    contentMarginBottom?: string; // Space from content to bottom border
    contentMarginLeft?: string;  // Space from left border to content
    contentMarginRight?: string; // Space from right border to content
    // Widget Size Constraints
    widgetMinHeight?: string;
    widgetMaxHeight?: string;
    widgetMinWidth?: string;
    widgetMaxWidth?: string;
    monsoonLogoColor?: 'original' | 'white' | 'black';
    tagBackgroundColor?: string;
    tagTextColor?: string;
    inputBorderColor?: string;
    buttonTextColor?: string;

    // Loading State Styling
    loadingText?: string;
    loadingBackgroundColor?: string;
    loadingTextColor?: string;
    loadingSpinnerColor?: string;
    loadingMessageFontSize?: string;

    // Success/Share State Styling
    successTitle?: string;
    successDescription?: string;
    successBackgroundColor?: string;
    successTextColor?: string;
    shareLinkBackgroundColor?: string;
    shareLinkTextColor?: string;
    copyButtonColor?: string;
    copyButtonIconColor?: string;
    viewReportButtonColor?: string;
    viewReportButtonTextColor?: string;
    viewReportButtonText?: string;
    resultLayout?: 'vertical' | 'horizontal';
    resultGap?: string;
}

interface EmbeddableInputProps {
    config: WidgetConfig;
}

export const EmbeddableInput: React.FC<EmbeddableInputProps> = ({ config }) => {
    // Styles derived from config
    const primaryColor = config.primaryColor || '#4F46E5'; // Indigo-600
    const backgroundColor = config.backgroundColor || '#FFFFFF';
    const textColor = config.textColor || '#1E293B'; // Slate-800
    const borderRadius = config.borderRadius || '12px';
    const fontFamily = config.fontFamily || 'inherit';
    const inputBackgroundColor = config.inputBackgroundColor || '#ffffff';
    const placeholderColor = config.placeholderColor || '#94a3b8'; // slate-400 default
    const placeholderText = config.placeholderText || 'Enter URL...';
    const tagBackgroundColor = config.tagBackgroundColor || '#f1f5f9';
    const tagTextColor = config.tagTextColor || 'inherit';
    const inputBorderColor = config.inputBorderColor || '#e2e8f0';

    // Auto-determine logo color if not forced
    const derivedLogoColor = config.monsoonLogoColor || (isDarkBackground(config.backgroundColor) ? 'white' : 'original');

    // Layout
    const layout = config.layout || 'vertical';
    const paddingPercentage = config.paddingPercentage !== undefined ? config.paddingPercentage : 100;
    // Calculate padding: default is 1.5rem (24px). If percentage is 50, use 0.75rem.
    // 1.5rem * (percentage / 100)
    const paddingValue = `${1.5 * (paddingPercentage / 100)}rem`;

    const inputWidthPercentage = config.inputWidthPercentage;
    const buttonWidthPercentage = config.buttonWidthPercentage;
    const gap = config.gap || '1rem';
    const alignment = config.alignment || 'left';

    // Alignment mapping
    const alignItemsMap = {
        'left': 'flex-start',
        'center': 'center',
        'right': 'flex-end'
    };
    const justifyContentMap = {
        'left': 'flex-start',
        'center': 'center',
        'right': 'flex-end'
    };

    const containerAlignItems = layout === 'vertical' ? (alignItemsMap[alignment] || 'flex-start') : 'flex-start'; // In horizontal, usually align-items handles vertical alignment of row which we want top
    const containerJustifyContent = layout === 'horizontal' ? (justifyContentMap[alignment] || 'flex-start') : 'flex-start';

    // Default widths with Gap Calculation
    // Vertical: 100%
    // Horizontal: calc(50% - (gap / 2))
    const horizontalDefaultWidth = `calc(50% - (${gap} / 2))`;

    // Determine final width styles
    const inputWidthStyle = inputWidthPercentage !== undefined ? `${inputWidthPercentage}%` : (layout === 'horizontal' ? horizontalDefaultWidth : '100%');
    const buttonWidthStyle = buttonWidthPercentage !== undefined ? `${buttonWidthPercentage}%` : (layout === 'horizontal' ? horizontalDefaultWidth : '100%');

    // Sizing
    const inputHeight = config.inputHeight || 'auto';
    const buttonHeight = config.buttonHeight || 'auto';
    const logoHeight = config.logoHeight || '40px';
    const monsoonLogoHeight = config.monsoonLogoHeight || '40px';

    const [url, setUrl] = useState('');
    const [items, setItems] = useState<{ type: 'url' | 'file'; value: string | File; id: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pollingJobId, setPollingJobId] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState('Initializing...');
    const [error, setError] = useState<string | null>(null);
    const [shareableLink, setShareableLink] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);

    // Send height to parent for iframe auto-resize
    useEffect(() => {
        const sendHeight = () => {
            // Calculate height based on content
            const height = document.body.scrollHeight;
            window.parent.postMessage({ type: 'widget-resize', height }, '*');
        };

        sendHeight();

        // Send again after delays to catch late renders
        setTimeout(sendHeight, 100);
        setTimeout(sendHeight, 500);
        setTimeout(sendHeight, 1000);
        setTimeout(sendHeight, 2000);

        const observer = new ResizeObserver(sendHeight);
        observer.observe(document.body);

        return () => observer.disconnect();
    }, [items, pollingJobId, error]);

    const handleAddUrl = () => {
        if (!url.trim()) return;
        try {
            new URL(url); // Validate
            setItems([...items, { type: 'url', value: url, id: crypto.randomUUID() }]);
            setUrl('');
            setError(null);
        } catch {
            setError('Invalid URL');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setItems([...items, { type: 'file', value: e.target.files[0], id: crypto.randomUUID() }]);
            setError(null);
        }
    };

    const handleRemove = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const handleSubmit = async () => {
        if (items.length === 0 && !url) {
            setError('Add at least one item');
            return;
        }

        setIsLoading(true);
        setError(null);

        // Auto-add current URL if valid
        const finalItems = [...items];
        if (url) {
            try {
                new URL(url);
                finalItems.push({ type: 'url', value: url, id: 'temp' });
            } catch { }
        }

        try {
            // 1. Process files to Base64 (backend expects this for now in the widget endpoint)
            const processedInputs = await Promise.all(finalItems.map(async (item) => {
                if (item.type === 'url') {
                    return { type: 'url', url: item.value as string };
                } else {
                    const file = item.value as File;
                    const base64 = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.readAsDataURL(file);
                    });
                    // Remove header: data:image/png;base64,
                    return { type: 'upload', filesData: [base64.split(',')[1]] };
                }
            }));

            // 2. Submit to API
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${apiUrl}/api/external/audit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey || 'YOUR_PUBLIC_KEY'}`
                },
                body: JSON.stringify({ inputs: processedInputs })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Submission failed');
            }

            // 3. Start Polling
            setPollingJobId(data.jobId);
            setStatusMessage(config.loadingText || 'Analyzing your request...');

        } catch (err: any) {
            setError(err.message || 'Error submitting audit');
            setIsLoading(false);
        }
    };

    // Polling Effect
    useEffect(() => {
        if (!pollingJobId) return;

        let isMounted = true;
        const apiUrl = import.meta.env.VITE_API_URL || '';

        const checkStatus = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/external/audit/${pollingJobId}`, {
                    headers: {
                        'Authorization': `Bearer ${config.apiKey || 'YOUR_PUBLIC_KEY'}`
                    }
                });

                if (!response.ok) {
                    // If error, keep retrying or fail?
                    console.warn("Polling error", response.status);
                    return;
                }

                const data = await response.json();

                if (!isMounted) return;

                if (data.status === 'completed') {
                    // Success! Show result card - NO auto-redirect
                    setStatusMessage('Complete! Your audit is ready.');
                    setShareableLink(data.resultUrl);
                    setShowResult(true);
                    setPollingJobId(null);
                    setIsLoading(false);
                } else if (data.status === 'failed') {
                    setPollingJobId(null);
                    setIsLoading(false);
                    setError(data.error || 'Audit failed during analysis.');
                } else {
                    // Still processing
                    setStatusMessage('Analyzing... This may take a moment.');
                }

            } catch (err) {
                console.error("Polling fetch error", err);
            }
        };

        const interval = setInterval(checkStatus, 3000);

        // Initial check immediately? No, wait 3s.
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [pollingJobId, config.apiKey]);

    // Use granular spacing controls or fall back to paddingPercentage
    const contentMarginTop = config.contentMarginTop || paddingValue;
    const contentMarginBottom = config.contentMarginBottom || paddingValue;
    const contentMarginLeft = config.contentMarginLeft || paddingValue;
    const contentMarginRight = config.contentMarginRight || paddingValue;

    const containerStyle: React.CSSProperties = {
        backgroundColor,
        color: textColor,
        fontFamily,
        paddingTop: contentMarginTop,
        paddingLeft: contentMarginLeft,
        paddingRight: contentMarginRight,
        paddingBottom: contentMarginBottom,
        minHeight: config.widgetMinHeight || '100%',
        maxHeight: config.widgetMaxHeight || 'none',
        minWidth: config.widgetMinWidth || 'auto',
        maxWidth: config.widgetMaxWidth || 'none',
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxSizing: 'border-box',
        border: config.containerBorder || 'none',
        borderRadius: config.containerBorderRadius || '0px',
        boxShadow: config.containerBoxShadow || 'none'
    };

    const defaultLogo = '/logo.png'; // Relative path works because widget runs in Iframe on our domain

    // Helper to render a logo at a specific position
    const renderLogo = (url: string, position: string | undefined, isMonsoon: boolean, heightStr?: string) => {
        const pos = position || (isMonsoon ? 'bottom-center' : 'top-center');
        const isTop = pos.startsWith('top');

        // FORCE positioning for Monsoon Logo to prevent hiding
        if (isMonsoon) {
            const flowStyle: React.CSSProperties = {
                display: 'block',
                marginTop: config.logoMarginTop || '2rem', // Use config or default
                alignSelf: pos.includes('left') ? 'flex-start' : pos.includes('right') ? 'flex-end' : 'center',
                maxHeight: heightStr || '40px',
                height: heightStr || 'auto',
                objectFit: 'contain',
                pointerEvents: 'none',
                opacity: 0.8,
                position: 'relative',
                zIndex: 60,
                filter: derivedLogoColor === 'white' ? 'brightness(0) invert(1)' :
                    derivedLogoColor === 'black' ? 'grayscale(100%) brightness(0)' : 'none'
            };
            return <img src={url} alt="Powered by Monsoonfish" style={flowStyle} />;
        }

        // Standard flow for Client Logo (user controlled)
        const style: React.CSSProperties = {
            maxHeight: heightStr || '40px',
            height: heightStr || 'auto',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 60,
            marginBottom: isTop ? '1rem' : 0,
            marginTop: !isTop ? '1rem' : 0,
            ...(pos.includes('center') ? { marginLeft: 'auto', marginRight: 'auto', display: 'block' } : {}),
            ...(pos.includes('right') ? { marginLeft: 'auto', display: 'block' } : {}),
            ...(pos.includes('left') ? { marginRight: 'auto', display: 'block' } : {})
        };

        return <img src={url} alt="Client Logo" style={style} />;
    };

    // Derived State Styles
    const isDark = isDarkBackground(config.backgroundColor);

    const loadingBg = config.loadingBackgroundColor || (isDark ? '#000000' : '#ffffff');
    const loadingTxt = config.loadingTextColor || config.textColor || (isDark ? '#e2e8f0' : '#1e293b');
    const loadingSpin = config.loadingSpinnerColor || config.primaryColor;
    const loadingMsgSize = config.loadingMessageFontSize || '1rem';

    const successBg = config.successBackgroundColor || (isDark ? '#000000' : '#ffffff');
    const successTxt = config.successTextColor || config.textColor || (isDark ? '#e2e8f0' : '#1e293b');
    const shareLinkBg = config.shareLinkBackgroundColor || (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)');
    const shareLinkTxt = config.shareLinkTextColor || successTxt;

    const successTitleText = config.successTitle || 'Audit Complete!';
    const successDescText = config.successDescription || 'Your report is ready. Copy the link or view it now.';
    const copyBtnColor = config.copyButtonColor || config.primaryColor;
    const copyIconCol = config.copyButtonIconColor || '#fff';
    const viewBtnColor = config.viewReportButtonColor || config.primaryColor;
    const viewBtnTxtColor = config.viewReportButtonTextColor || '#fff';
    const viewBtnLabel = config.viewReportButtonText || 'View Report Now';

    const resultLayout = config.resultLayout || 'vertical';
    const resultGap = config.resultGap || '1rem';

    return (
        <div style={containerStyle} className="widget-container">
            <style>{`
                html, body {
                    background-color: transparent !important;
                    margin: 0;
                    padding: 0;
                    padding-bottom: 2px; /* Prevent bottom border/shadow clipping */

                }
                .widget-input::placeholder {
                    color: ${placeholderColor} !important;
                    opacity: 1;
                }
            `}</style>

            {/* Loading Overlay */}
            {pollingJobId && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: loadingBg,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 40,
                    borderRadius,
                    padding: '1rem',
                    textAlign: 'center'
                }}>
                    <Loader2 className="animate-spin" size={32} style={{ color: loadingSpin, marginBottom: '1rem' }} />
                    <div style={{ color: loadingTxt, fontWeight: 500 }}>{statusMessage}</div>
                </div>
            )}

            {/* Result Card */}
            {showResult && shareableLink && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: successBg,
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 40,
                    borderRadius,
                    padding: '2rem',
                    textAlign: 'center',
                    animation: 'fadeIn 0.3s ease-in-out'
                }}>
                    <Check size={48} style={{ color: '#10b981', marginBottom: '1rem' }} />
                    <h3 style={{ color: successTxt, marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 600 }}>{successTitleText}</h3>
                    <p style={{ color: successTxt, opacity: 0.7, marginBottom: '1.5rem', fontSize: '0.9rem' }}>{successDescText}</p>

                    <div style={{
                        display: 'flex',
                        flexDirection: resultLayout === 'horizontal' ? 'row' : 'column',
                        width: '100%',
                        maxWidth: '100%',
                        gap: resultGap,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            width: resultLayout === 'horizontal' ? 'auto' : '100%',
                            flex: resultLayout === 'horizontal' ? 1 : 'none',
                            maxWidth: '400px',
                            padding: '0.75rem 1rem',
                            backgroundColor: shareLinkBg,
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxSizing: 'border-box'
                        }}>
                            <input
                                readOnly
                                value={shareableLink}
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    background: 'transparent',
                                    color: shareLinkTxt,
                                    fontSize: '0.85rem',
                                    outline: 'none',
                                    minWidth: 0
                                }}
                            />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(shareableLink);
                                }}
                                style={{
                                    background: copyBtnColor,
                                    color: copyIconCol,
                                    border: 'none',
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Copy size={16} />
                            </button>
                        </div>

                        <button
                            onClick={() => window.top!.location.href = shareableLink}
                            style={{
                                background: viewBtnColor,
                                color: viewBtnTxtColor,
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {viewBtnLabel}
                        </button>
                    </div>
                </div>
            )}

            {/* Top Logos */}
            {config.logoUrl && (config.logoPosition?.startsWith('top') || (!config.logoPosition && false)) && renderLogo(config.logoUrl, config.logoPosition, false, config.logoHeight)}
            {(config.monsoonLogoPosition?.startsWith('top')) && renderLogo(defaultLogo, config.monsoonLogoPosition, true, (() => {
                // Enforce minimum height for Monsoon Logo
                const h = parseInt(config.monsoonLogoHeight || '20');
                return (isNaN(h) || h < 15) ? '20px' : config.monsoonLogoHeight;
            })())}


            <div style={{
                display: 'flex',
                flexDirection: layout === 'horizontal' ? 'row' : 'column',
                flexWrap: 'wrap',
                gap: gap,
                alignContent: 'flex-start',
                alignItems: containerAlignItems,
                justifyContent: containerJustifyContent
            }}>
                {/* ... Input ... */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: `1px solid ${inputBorderColor}`,
                    borderRadius,
                    padding: '0.5rem',
                    backgroundColor: inputBackgroundColor,
                    transition: 'border-color 0.2s',
                    width: inputWidthStyle,
                    boxSizing: 'border-box',
                    marginBottom: config.inputMarginBottom || '0'
                }}>
                    <input
                        className="widget-input"
                        type="text"
                        value={url}
                        onChange={(e) => { setUrl(e.target.value); setError(null); }}
                        placeholder={placeholderText}
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            padding: '0.5rem',
                            fontSize: '1rem',
                            minWidth: 0,
                            backgroundColor: 'transparent'
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <label style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', color: '#64748b', display: 'flex', alignItems: 'center' }} title="Upload Image">
                                <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                                {config.uploadIconUrl ? (
                                    <img src={config.uploadIconUrl} alt="Upload" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                                ) : (
                                    <ImagePlus size={20} />
                                )}
                            </label>
                            <button onClick={handleAddUrl} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: primaryColor, display: 'flex', alignItems: 'center' }}>
                                {config.submitIconUrl ? (
                                    <img src={config.submitIconUrl} alt="Add" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                                ) : (
                                    <Plus size={20} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && <div style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</div>}

                {/* Items List */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {items.map(item => (
                        <div key={item.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.25rem 0.5rem',
                            background: tagBackgroundColor,
                            color: tagTextColor,
                            borderRadius: '99px',
                            fontSize: '0.875rem',
                            maxWidth: '100%'
                        }}>
                            {item.type === 'url' ? <Globe size={14} /> : <Zap size={14} />}
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                                {item.type === 'url' ? (item.value as string) : (item.value as File).name}
                            </span>
                            <button onClick={() => handleRemove(item.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isLoading || (items.length === 0 && !url)}
                    style={{
                        backgroundColor: primaryColor,
                        color: config.buttonTextColor || '#fff',
                        border: 'none',
                        padding: '0.75rem',
                        borderRadius,
                        fontWeight: 600,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        width: buttonWidthStyle,
                        boxSizing: 'border-box',
                        marginBottom: config.buttonMarginBottom || '0'
                    }}
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Run Audit'}
                </button>
            </div>

            {/* Bottom Logos */}
            {config.logoUrl && config.logoPosition?.startsWith('bottom') && renderLogo(config.logoUrl, config.logoPosition, false, config.logoHeight)}
            {/* FORCE RENDER: If not explicitly top, render at bottom. Even if they type garbage, it shows at bottom. */}
            {(!config.monsoonLogoPosition || !config.monsoonLogoPosition.startsWith('top')) && renderLogo(defaultLogo, config.monsoonLogoPosition, true, (() => {
                // Enforce minimum height for Monsoon Logo
                const h = parseInt(config.monsoonLogoHeight || '20');
                return (isNaN(h) || h < 15) ? '20px' : config.monsoonLogoHeight;
            })())}
        </div>
    );
};
