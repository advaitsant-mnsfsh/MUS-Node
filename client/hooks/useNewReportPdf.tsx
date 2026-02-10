import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { NewReportPDF } from '../components/report/NewReportPDF';
import { AnalysisReport, Screenshot } from '../types';

interface UseNewReportPdfProps {
    report: AnalysisReport | null;
    url: string;
    screenshots: Screenshot[];
}

export const useNewReportPdf = ({ report, url, screenshots }: UseNewReportPdfProps) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const generateNewPdf = async () => {
        if (!report) return;
        setIsGenerating(true);
        try {
            const blob = await pdf(<NewReportPDF report={report} url={url} screenshots={screenshots} />).toBlob();
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

    return { generateNewPdf, isGenerating };
};
