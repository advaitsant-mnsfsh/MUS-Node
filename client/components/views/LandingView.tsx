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
        <div className="h-[calc(100vh-5rem)] bg-page-bg text-slate-800 font-sans flex flex-col items-center justify-start pt-layout-top p-container gap-section-sm overflow-y-auto">
            <main className="w-full flex flex-col items-center gap-section-sm">
                <section className="w-full" aria-label="Hero Section">
                    <LandingHero />
                </section>

                <section className="w-full max-w-4xl px-4" aria-label="Audit Input Form">
                    <URLInputForm
                        onAnalyze={onAnalyze}
                        isLoading={isLoading}
                        whiteLabelLogo={whiteLabelLogo}
                        onWhiteLabelLogoChange={onWhiteLabelLogoChange}
                    />
                    {error && renderError()}
                </section>
            </main>
        </div>
    );
};
