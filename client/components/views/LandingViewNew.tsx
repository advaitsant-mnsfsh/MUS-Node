import React from 'react';
import { GlobalNavbar } from '../GlobalNavbar';
import { LandingHero } from '../LandingHero';
import { URLInputForm } from '../URLInputForm';
import { Footer } from '../Footer';
import { AuditInput } from '../../types';

interface LandingViewProps {
    onAnalyze: (inputs: AuditInput[], auditMode: 'standard' | 'competitor') => void;
    isLoading: boolean;
    whiteLabelLogo: string | null;
    onWhiteLabelLogoChange: (logo: string | null) => void;
    error: string | null;
    renderError: () => React.ReactNode;
}

export const LandingView: React.FC<LandingViewProps> = ({
    onAnalyze,
    isLoading,
    whiteLabelLogo,
    onWhiteLabelLogoChange,
    error,
    renderError
}) => {
    return (
        <div className="h-[calc(100vh-5rem)] w-full flex flex-col relative bg-page-bg font-sans overflow-x-hidden overflow-y-auto custom-scrollbar">

            {/* Main Content (Hero + Input) */}
            <main className="w-full min-h-full flex flex-col items-center pt-16 md:pt-[8vh] px-4 pb-20 animate-in fade-in duration-500 z-10">
                <LandingHero />

                <div className="w-full max-w-4xl mt-8 space-y-6">
                    {/* Error Display */}
                    {error && (
                        <div className="w-full flex justify-center">
                            {renderError()}
                        </div>
                    )}

                    {/* Input Form */}
                    <URLInputForm
                        onAnalyze={onAnalyze}
                        isLoading={isLoading}
                        whiteLabelLogo={whiteLabelLogo}
                        onWhiteLabelLogoChange={onWhiteLabelLogoChange}
                    />
                </div>
            </main>

            {/* Inline Style for background grid if needed, or rely on global CSS */}
            <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>
        </div>
    );
};
