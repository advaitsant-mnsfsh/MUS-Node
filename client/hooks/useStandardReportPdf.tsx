import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { StandardReportPDF } from '../components/report/pdf/StandardReportPDF';
import { AlternativeReportPDF } from '../components/report/pdf/AlternativeReportPDF';
import { HybridReportPDF } from '../components/report/pdf/HybridReportPDF';
import { AnalysisReport, Screenshot } from '../types';

interface UseStandardReportPdfProps {
    report: AnalysisReport | null;
    url: string;
    screenshots: Screenshot[];
    whiteLabelLogo?: string | null;
}

export const useStandardReportPdf = ({ report, url, screenshots, whiteLabelLogo }: UseStandardReportPdfProps) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const generateStandardPdf = async () => {
        if (!report) return;
        setIsGenerating(true);
        try {
            const blob = await pdf(<StandardReportPDF report={report} url={url} screenshots={screenshots} whiteLabelLogo={whiteLabelLogo} />).toBlob();
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `ux-audit-${url.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Standard PDF Generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const generateAlternativePdf = async () => {
        if (!report) return;
        setIsGenerating(true);
        try {
            const blob = await pdf(<AlternativeReportPDF report={report} url={url} screenshots={screenshots} whiteLabelLogo={whiteLabelLogo} />).toBlob();
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `ux-audit-alt-${url.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Alternative PDF Generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const generateHybridPdf = async () => {
        if (!report) return;
        setIsGenerating(true);
        try {
            const blob = await pdf(<HybridReportPDF report={report} url={url} screenshots={screenshots} whiteLabelLogo={whiteLabelLogo} />).toBlob();
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `ux-audit-hybrid-${url.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Hybrid PDF Generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return { generateStandardPdf, generateAlternativePdf, generateHybridPdf, isGenerating };
};
