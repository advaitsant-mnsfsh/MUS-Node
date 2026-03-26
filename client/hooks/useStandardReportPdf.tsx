import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { StandardReportPDF } from '../components/report/pdf/StandardReportPDF';

import { AnalysisReport, Screenshot } from '../types';

const getRouteForPdfFilename = (rawUrl: string): string => {
    const input = (rawUrl || '').trim();
    if (!input) return 'site';
    const withProto =
        input.startsWith('http://') || input.startsWith('https://')
            ? input
            : `https://${input}`;

    try {
        const u = new URL(withProto);
        const hostname = u.hostname; // includes www if user typed it
        let pathname = u.pathname || '/';
        // keep "/" for root, but remove trailing slash for non-root
        if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
        return `${hostname}${pathname}`;
    } catch {
        // fallback: strip protocol + query/hash
        const noProto = input.replace(/^https?:\/\//, '');
        const withoutQuery = noProto.split('?')[0].split('#')[0];
        return withoutQuery;
    }
};

const toSafeFilenameSlug = (text: string): string => {
    return (text || '')
        .replace(/[^a-zA-Z0-9.]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
};

interface UseStandardReportPdfProps {
    report: AnalysisReport | null;
    url: string;
    screenshots: Screenshot[];
    whiteLabelLogo?: string | null;
}

export const useStandardReportPdf = ({ report, url, screenshots, whiteLabelLogo }: UseStandardReportPdfProps) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const route = getRouteForPdfFilename(url);
    const slug = toSafeFilenameSlug(route);

    const generateStandardPdf = async () => {
        if (!report) return;
        setIsGenerating(true);
        try {
            const blob = await pdf(<StandardReportPDF report={report} url={url} screenshots={screenshots} whiteLabelLogo={whiteLabelLogo} />).toBlob();
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `myuxscore-ux-audit-${slug}.pdf`;
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

    return { generateStandardPdf, isGenerating };
};
