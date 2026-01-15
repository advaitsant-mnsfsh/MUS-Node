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
            containerBorder: searchParams.get('containerBorder') || undefined,
            containerBorderRadius: searchParams.get('containerBorderRadius') || undefined,
            containerBoxShadow: searchParams.get('containerBoxShadow') || undefined,
            // Enhanced spacing controls
            inputMarginBottom: searchParams.get('inputMarginBottom') || undefined,
            buttonMarginBottom: searchParams.get('buttonMarginBottom') || undefined,
            logoMarginTop: searchParams.get('logoMarginTop') || undefined,
            contentMarginTop: searchParams.get('contentMarginTop') || undefined,
            contentMarginBottom: searchParams.get('contentMarginBottom') || undefined,
            contentMarginLeft: searchParams.get('contentMarginLeft') || undefined,
            contentMarginRight: searchParams.get('contentMarginRight') || undefined,
            // Widget size constraints
            widgetMinHeight: searchParams.get('widgetMinHeight') || undefined,
            widgetMaxHeight: searchParams.get('widgetMaxHeight') || undefined,
            widgetMinWidth: searchParams.get('widgetMinWidth') || undefined,
            widgetMaxWidth: searchParams.get('widgetMaxWidth') || undefined,
        };
    }, [searchParams]);

    return (
        <div style={{ width: '100vw', margin: 0, padding: 0, backgroundColor: 'transparent' }}>
            <EmbeddableInput config={config} />
        </div>
    );
};

export default EmbedPage;
