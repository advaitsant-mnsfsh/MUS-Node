import React from 'react';
import { AnalysisReport } from '../../types';
import { StandardReportView } from './views/StandardReportView';
import { CompetitorReportView } from './views/CompetitorReportView';
import { SkeletonLoader } from '../SkeletonLoader';

interface ReportRendererProps {
    report: AnalysisReport | null;
    primaryScreenshotSrc?: string;
    competitorScreenshotSrc?: string;
    isCompetitorReport?: boolean;
    // Context inputs passed down for Competitor view
    primaryUrl?: string;
    competitorUrl?: string;
}

export const ReportRenderer: React.FC<ReportRendererProps> = ({
    report,
    primaryScreenshotSrc,
    competitorScreenshotSrc,
    isCompetitorReport,
    primaryUrl,
    competitorUrl
}) => {
    if (!report) {
        return (
            <div className="p-8 space-y-8">
                <SkeletonLoader className="h-40 w-full rounded-xl" />
                <SkeletonLoader className="h-64 w-full rounded-xl" />
                <SkeletonLoader className="h-64 w-full rounded-xl" />
            </div>
        );
    }

    // COMPETITOR REPORT
    if (isCompetitorReport && report['Competitor Analysis expert']) {
        return (
            <div className="p-6">
                <CompetitorReportView
                    data={report['Competitor Analysis expert']}
                    primaryUrl={primaryUrl || 'Primary URL'}
                    competitorUrl={competitorUrl || 'Competitor URL'}
                    primaryScreenshot={primaryScreenshotSrc}
                    competitorScreenshot={competitorScreenshotSrc}
                />
            </div>
        );
    }

    // STANDARD REPORT
    return <StandardReportView report={report} primaryScreenshotSrc={primaryScreenshotSrc} />;
};
