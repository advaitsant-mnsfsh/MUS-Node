import React from 'react';
import { LandingHero } from '../LandingHero';
import { URLInputForm } from '../URLInputForm';
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
        <div className="min-h-screen bg-page-bg text-slate-800 font-sans flex flex-col items-center justify-start pt-12 sm:pt-20">
            <div className="w-full mb-8">
                <LandingHero />
            </div>

            <main className="w-full max-w-4xl px-4">
                <URLInputForm
                    onAnalyze={onAnalyze}
                    isLoading={isLoading}
                    whiteLabelLogo={whiteLabelLogo}
                    onWhiteLabelLogoChange={onWhiteLabelLogoChange}
                />
                {error && renderError()}
            </main>
        </div>
    );
};
