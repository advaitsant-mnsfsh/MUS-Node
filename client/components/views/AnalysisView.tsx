import React from 'react';
import { SplitLayout } from '../SplitLayout';
import { LoginPanel } from '../LoginPanel';

import { AuditInput } from '../../types';

interface AnalysisViewProps {
    progress: number;
    loadingMessage: string;
    microcopy: string;
    animationData: any;
    screenshot: string | undefined | null;
    url: string;
    fullWidth: boolean;
    auditId?: string | null;
    inputs?: AuditInput[];
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
    progress,
    loadingMessage,
    microcopy,
    animationData,
    screenshot,
    url,
    fullWidth,
    auditId,
    inputs
}) => {
    // URL Rotation Logic
    const [currentUrlIndex, setCurrentUrlIndex] = React.useState(0);

    const validUrls = React.useMemo(() => {
        if (inputs && inputs.length > 0) {
            return inputs.filter(i => i.url).map(i => i.url!)
        }
        return url ? [url] : [];
    }, [inputs, url]);

    React.useEffect(() => {
        if (validUrls.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentUrlIndex(prev => (prev + 1) % validUrls.length);
        }, 2500); // Rotate every 2.5s
        return () => clearInterval(interval);
    }, [validUrls.length]);

    const displayUrl = validUrls.length > 0 ? validUrls[currentUrlIndex] : url;

    return (
        <SplitLayout
            progress={progress}
            loadingMessage={loadingMessage}
            microcopy={microcopy}
            isAnalysisComplete={false}
            animationData={animationData}
            screenshot={screenshot}
            url={displayUrl}
            fullWidth={fullWidth}
        >
            <div className="flex flex-col items-center justify-center w-full h-full animate-in fade-in duration-500">
                <LoginPanel auditId={auditId} />
            </div>
        </SplitLayout>
    );
};
