import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmbeddableInput, WidgetConfig } from '../components/EmbeddableInput';

const EmbedPage: React.FC = () => {
    const [searchParams] = useSearchParams();

    const config: WidgetConfig = useMemo(() => {
        return {
            primaryColor: searchParams.get('primaryColor') || undefined,
            backgroundColor: searchParams.get('backgroundColor') || undefined,
            textColor: searchParams.get('textColor') || undefined,
            borderRadius: searchParams.get('borderRadius') || undefined,
            fontFamily: searchParams.get('fontFamily') || undefined,
            inputBackgroundColor: searchParams.get('inputBackgroundColor') || undefined,
            inputHeight: searchParams.get('inputHeight') || undefined,
            buttonHeight: searchParams.get('buttonHeight') || undefined,
            logoHeight: searchParams.get('logoHeight') || undefined,
            monsoonLogoHeight: searchParams.get('monsoonLogoHeight') || undefined,
            logoUrl: searchParams.get('logoUrl') || undefined,
            logoPosition: searchParams.get('logoPosition') as any || 'top-center',
            monsoonLogoPosition: searchParams.get('monsoonLogoPosition') as any || 'bottom-center',
            apiKey: searchParams.get('apiKey') || undefined,
            placeholderColor: searchParams.get('placeholderColor') || undefined,
            placeholderText: searchParams.get('placeholderText') || undefined,
            uploadIconUrl: searchParams.get('uploadIconUrl') || undefined,
            submitIconUrl: searchParams.get('submitIconUrl') || undefined,
            layout: (searchParams.get('layout') as any) || undefined,
            paddingPercentage: searchParams.get('paddingPercentage') ? Number(searchParams.get('paddingPercentage')) : undefined,
            inputWidthPercentage: searchParams.get('inputWidthPercentage') ? Number(searchParams.get('inputWidthPercentage')) : undefined,
            buttonWidthPercentage: searchParams.get('buttonWidthPercentage') ? Number(searchParams.get('buttonWidthPercentage')) : undefined,
            gap: searchParams.get('gap') || undefined,
            alignment: (searchParams.get('alignment') as any) || undefined,
        };
    }, [searchParams]);

    return (
        <div style={{ height: '100vh', width: '100vw', margin: 0, padding: 0, overflow: 'hidden' }}>
            <EmbeddableInput config={config} />
        </div>
    );
};

export default EmbedPage;
