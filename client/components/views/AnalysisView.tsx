import React from 'react';
import { SplitLayout } from '../SplitLayout';
import { LoginPanel } from '../LoginPanel';
import { Screenshot } from '../../types';

interface AnalysisViewProps {
    progress: number;
    loadingMessage: string;
    microcopy: string;
    animationData: any;
    screenshot: Screenshot | undefined | null;
    url: string;
    fullWidth: boolean;
    auditId?: string | null;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
    progress,
    loadingMessage,
    microcopy,
    animationData,
    screenshot,
    url,
    fullWidth,
    auditId
}) => {
    // Resolve Backend URL for relative paths
    const resolveImageSrc = (img: Screenshot | undefined | null) => {
        if (!img) return undefined;
        if (img.data) return `data:image/jpeg;base64,${img.data}`;
        if (!img.url) return undefined;

        if (img.url.startsWith('http')) return img.url;

        const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
        const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
        const subPath = img.url.startsWith('/') ? img.url : `/${img.url}`;

        return `${baseUrl}${subPath}`;
    };

    const previewSrc = resolveImageSrc(screenshot);

    return (
        <SplitLayout
            progress={progress}
            loadingMessage={loadingMessage}
            microcopy={microcopy}
            isAnalysisComplete={false}
            animationData={animationData}
            screenshot={previewSrc}
            url={url}
            fullWidth={fullWidth}
        >
            <div className="flex flex-col items-center justify-center w-full h-full animate-in fade-in duration-500">
                <LoginPanel auditId={auditId} />
            </div>
        </SplitLayout>
    );
};
