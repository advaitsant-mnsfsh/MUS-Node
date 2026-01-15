import React, { useState, useEffect } from 'react';
import { Zap, ImagePlus, Globe, X, Loader2, Plus } from 'lucide-react';

export interface WidgetConfig {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
    fontFamily?: string;
    logoUrl?: string;
    logoPosition?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    monsoonLogoPosition?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
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
            setStatusMessage('Analyzing your request...');

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
                    setStatusMessage('Report Ready! Redirecting...');
                    // Success! Redirect.
                    setTimeout(() => {
                        if (data.resultUrl) {
                            window.top!.location.href = data.resultUrl;
                        } else {
                            // Fallback
                            setPollingJobId(null);
                            setIsLoading(false);
                            setError('Report generated but no URL returned.');
                        }
                    }, 1000);
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

    const containerStyle: React.CSSProperties = {
        backgroundColor,
        color: textColor,
        fontFamily,
        padding: paddingValue,
        height: '100%',
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

        // FORCE absolute positioning for Monsoon Logo to prevent hiding
        if (isMonsoon) {
            const absoluteStyle: React.CSSProperties = {
                position: 'absolute',
                zIndex: 50,
                maxHeight: heightStr || '40px',
                height: heightStr || 'auto',
                objectFit: 'contain',
                // Vertical Position
                ...(isTop ? { top: '0.5rem' } : { bottom: '0.5rem' }),
                // Horizontal Position
                ...(pos.includes('left') ? { left: '0.5rem' } : {}),
                ...(pos.includes('right') ? { right: '0.5rem' } : {}),
                ...(pos.includes('center') ? { left: '50%', transform: 'translateX(-50%)' } : {}),
                pointerEvents: 'none', // Allow clicking through if it overlaps input
                opacity: 0.8 // Slight transparency to look more like a watermark if overlapping
            };
            return <img src={url} alt="Powered by Monsoonfish" style={absoluteStyle} />;
        }

        // Standard flow for Client Logo (user controlled)
        const style: React.CSSProperties = {
            maxHeight: heightStr || '40px',
            height: heightStr || 'auto',
            objectFit: 'contain',
            marginBottom: isTop ? '1rem' : 0,
            marginTop: !isTop ? '1rem' : 0,
            ...(pos.includes('center') ? { marginLeft: 'auto', marginRight: 'auto', display: 'block' } : {}),
            ...(pos.includes('right') ? { marginLeft: 'auto', display: 'block' } : {}),
            ...(pos.includes('left') ? { marginRight: 'auto', display: 'block' } : {})
        };

        return <img src={url} alt="Client Logo" style={style} />;
    };

    return (
        <div style={containerStyle} className="widget-container">
            <style>{`
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
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 40, // Below logo (50)
                    borderRadius,
                    padding: '1rem',
                    textAlign: 'center'
                }}>
                    <Loader2 className="animate-spin" size={32} style={{ color: primaryColor, marginBottom: '1rem' }} />
                    <div style={{ color: textColor, fontWeight: 500 }}>{statusMessage}</div>
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
                flex: 1,
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
                    border: '1px solid #e2e8f0',
                    borderRadius,
                    padding: '0.5rem',
                    backgroundColor: inputBackgroundColor,
                    transition: 'border-color 0.2s',
                    width: inputWidthStyle,
                    boxSizing: 'border-box'
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
                            background: '#f1f5f9',
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
                        marginTop: 'auto',
                        backgroundColor: primaryColor,
                        color: '#fff',
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
                        boxSizing: 'border-box'
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
