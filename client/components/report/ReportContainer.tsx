import React, { useState, useEffect } from 'react';
import { AnalysisReport, Screenshot, AuditInput } from '../../types';
import { saveSharedAudit } from '../../services/auditStorage';
import { useAuth } from '../../contexts/AuthContext';
import { useReportPdf } from '../../hooks/useReportPdf';
import { useStandardReportPdf } from '../../hooks/useStandardReportPdf';
import { useCompetitorReportPdf } from '../../hooks/useCompetitorReportPdf';
import { ASSETS } from './constants';
import toast from 'react-hot-toast';
import { ReportLayout } from './ReportLayout';

interface ReportContainerProps {
    report: AnalysisReport | null;
    url: string;
    screenshots: Screenshot[];
    screenshotMimeType: string;
    performanceError: string | null;
    auditId: string | null;
    onRunNewAudit: () => void;
    whiteLabelLogo?: string | null;
    isSharedView?: boolean;
    inputs?: AuditInput[];
}

export const ReportContainer: React.FC<ReportContainerProps> = ({
    report,
    url,
    screenshots,
    auditId,
    onRunNewAudit,
    whiteLabelLogo,
    screenshotMimeType,
    isSharedView = false,
    inputs = []
}) => {
    // --- AUTH LOGIC ---
    const { user, isLoading: isAuthLoading } = useAuth();
    const [isLocked, setIsLocked] = useState(!isSharedView);

    useEffect(() => {
        if (user && !isSharedView) {
            setIsLocked(false);
        }
    }, [user, isSharedView]);

    // --- PDF LOGIC (React-PDF Primary, Legacy Fallback) ---
    // Determine report type FIRST (needed for hook conditionals)
    const isCompetitorReport = !!report?.["Competitor Analysis expert"];
    const isStandardReport = !!(report?.["UX Audit expert"]);

    // Legacy method (heavy, image-based) - Fallback only
    const { generatePdf: generateLegacyPdf, isPdfGenerating: isLegacyPdfGenerating, pdfError } = useReportPdf({
        report,
        url,
        screenshots,
        whiteLabelLogo,
        defaultLogoSrc: ASSETS.headerLogo
    });

    // New React-PDF method (lightweight, text-selectable) - For Standard Reports
    const { generateStandardPdf, isGenerating: isStandardPdfGenerating } = useStandardReportPdf({
        report,
        url,
        screenshots
    });

    // Competitor Report PDF (React-PDF based)
    const competitorAnalysis = report?.["Competitor Analysis expert"];
    const { generatePdf: generateCompetitorPdf, isGenerating: isCompetitorPdfGenerating } = useCompetitorReportPdf({
        data: competitorAnalysis,
        url
    });

    // Select the appropriate PDF generator based on report type
    const generatePdf = isCompetitorReport ? generateCompetitorPdf : generateStandardPdf;
    const isPdfGenerating = isCompetitorReport ? isCompetitorPdfGenerating : isStandardPdfGenerating;

    // --- SHARE LOGIC ---
    const [isSharing, setIsSharing] = useState(false);
    const handleShareAudit = async () => {
        if (!report || isSharing) return;
        setIsSharing(true);
        try {
            let sharedAuditId = auditId;
            if (!sharedAuditId) {
                sharedAuditId = await saveSharedAudit({
                    url,
                    report,
                    screenshots,
                    screenshotMimeType,
                    whiteLabelLogo,
                });
            }
            const shareUrl = `${window.location.origin}/shared/${sharedAuditId}`;
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Share link copied to clipboard!', { icon: '🔗' });
        } catch (error) {
            console.error('Error sharing audit:', error);
            toast.error('Failed to create share link.');
        } finally {
            setIsSharing(false);
        }
    };

    // --- DATA PREP ---
    const desktopScreenshots = screenshots.filter(s => !s.isMobile);
    const primaryScreenshot = desktopScreenshots[0] || screenshots[0];
    const competitorScreenshot = desktopScreenshots[1] || screenshots[1];

    const getScreenshotSrc = (s: Screenshot | undefined) => {
        if (!s) return undefined;
        if (s.url && s.url.startsWith('/uploads')) {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://mus-node-production.up.railway.app' : 'http://localhost:8080');
            return `${backendUrl}${s.url}`;
        }
        if (s.url) return s.url;
        if (s.data) return `data:image/jpeg;base64,${s.data}`;
        return undefined;
    };

    const primaryScreenshotSrc = getScreenshotSrc(primaryScreenshot);
    const competitorScreenshotSrc = getScreenshotSrc(competitorScreenshot);

    // isReportReady check (moved after PDF hooks)
    const isReportReady = !!report && (isStandardReport || isCompetitorReport);

    // Default to Standard unless specifically Competitor
    const auditMode = isCompetitorReport ? 'competitor' : 'standard';

    return (
        <ReportLayout
            report={report}
            isReportReady={isReportReady}
            auditMode={auditMode}
            isLocked={isLocked}
            isAuthLoading={isAuthLoading}
            onUnlock={() => setIsLocked(false)}
            url={url}
            whiteLabelLogo={whiteLabelLogo}
            isSharedView={isSharedView}
            primaryScreenshotSrc={primaryScreenshotSrc}
            competitorScreenshotSrc={competitorScreenshotSrc}
            pdfError={pdfError}
            onGeneratePdf={generatePdf}
            isPdfGenerating={isPdfGenerating}
            onShareAudit={handleShareAudit}
            isSharing={isSharing}
            onRunNewAudit={onRunNewAudit}
            inputs={inputs}
        />
    );
};
