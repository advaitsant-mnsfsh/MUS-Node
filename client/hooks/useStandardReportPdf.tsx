import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { StandardReportPDF } from '../components/report/pdf/StandardReportPDF';
import { AnalysisReport, Screenshot } from '../types';

interface UseStandardReportPdfProps {
    report: AnalysisReport | null;
    url: string;
    screenshots: Screenshot[];
}

export const useStandardReportPdf = ({ report, url, screenshots }: UseStandardReportPdfProps) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const generateStandardPdf = async () => {
        if (!report) return;
        setIsGenerating(true);
        try {
            const blob = await pdf(<StandardReportPDF report={report} url={url} screenshots={screenshots} />).toBlob();
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `new-audit-${url.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('New PDF Generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return { generateStandardPdf, isGenerating };
};
