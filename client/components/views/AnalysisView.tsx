import React from 'react';
import { SplitLayout } from '../SplitLayout';
import { LoginPanel } from '../LoginPanel';

interface AnalysisViewProps {
    progress: number;
    loadingMessage: string;
    microcopy: string;
    animationData: any;
    screenshot: string | undefined | null;
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
    return (
        <SplitLayout
            progress={progress}
            loadingMessage={loadingMessage}
            microcopy={microcopy}
            isAnalysisComplete={false}
            animationData={animationData}
            screenshot={screenshot}
            url={url}
            fullWidth={fullWidth}
        >
            <div className="flex flex-col items-center justify-center w-full h-full animate-in fade-in duration-500">
                <LoginPanel auditId={auditId} />
            </div>
        </SplitLayout>
    );
};
