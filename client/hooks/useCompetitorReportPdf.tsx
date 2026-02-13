import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { CompetitorReportPDF } from '../components/report/pdf/CompetitorReportPDF';
import { CompetitorAnalysisData } from '../types';

interface UseCompetitorReportPdfProps {
    data: CompetitorAnalysisData | null;
    url: string;
}

export const useCompetitorReportPdf = ({ data, url }: UseCompetitorReportPdfProps) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePdf = async () => {
        if (!data) return;
        setIsGenerating(true);
        try {
            const blob = await pdf(<CompetitorReportPDF data={data} url={url} />).toBlob();
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `competitor-analysis-${url.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Competitor PDF Generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return { generatePdf, isGenerating };
};
