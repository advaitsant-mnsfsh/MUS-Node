import React, { useState, useEffect } from 'react';
import { AnalysisReport, Screenshot, AuditInput } from '../../types';
import { saveSharedAudit } from '../../services/auditStorage';
import { useAuth } from '../../contexts/AuthContext';
import { useReportPdf } from '../../hooks/useReportPdf';
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

    // --- PDF LOGIC ---
    const { generatePdf, isPdfGenerating, pdfError } = useReportPdf({
        report,
        url,
        screenshots,
        whiteLabelLogo,
        defaultLogoSrc: ASSETS.headerLogo
    });

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
    const primaryScreenshot = screenshots.find(s => !s.isMobile) || screenshots[0];
    const primaryScreenshotSrc = primaryScreenshot?.url || (primaryScreenshot?.data ? `data:image/jpeg;base64,${primaryScreenshot.data}` : undefined);

    // Determine Mode
    const isCompetitorReport = !!report?.["Competitor Analysis expert"];
    const isStandardReport = !!(report?.["UX Audit expert"]); // Basic check
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
