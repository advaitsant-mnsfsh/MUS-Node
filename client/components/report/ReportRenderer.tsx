import React from "react";
import { AnalysisReport } from "../../types";
import { StandardReportView } from "./views/StandardReportView";
import { CompetitorReportView } from "./views/CompetitorReportView";
import { SkeletonLoader } from "../SkeletonLoader";
import { REPORT_PAGE_GUTTER_X } from "./reportChrome";

interface ReportRendererProps {
  report: AnalysisReport | null;
  primaryScreenshotSrc?: string;
  competitorScreenshotSrc?: string;
  isCompetitorReport?: boolean;
  // Context inputs passed down for Competitor view
  primaryUrl?: string;
  competitorUrl?: string;
  isSharedView?: boolean;
}

export const ReportRenderer: React.FC<ReportRendererProps> = ({
  report,
  primaryScreenshotSrc,
  competitorScreenshotSrc,
  isCompetitorReport,
  primaryUrl,
  competitorUrl,
  isSharedView,
}) => {
  if (!report) {
    return (
      <div className={`${REPORT_PAGE_GUTTER_X} py-8 space-y-8`}>
        <SkeletonLoader className="h-40 w-full rounded-xl" />
        <SkeletonLoader className="h-64 w-full rounded-xl" />
        <SkeletonLoader className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  // COMPETITOR REPORT
  if (isCompetitorReport && report["Competitor Analysis expert"]) {
    return (
      <div className={`${REPORT_PAGE_GUTTER_X} pb-8`}>
        <CompetitorReportView
          data={report["Competitor Analysis expert"]}
          primaryUrl={primaryUrl || "Primary URL"}
          competitorUrl={competitorUrl || "Competitor URL"}
          primaryScreenshot={primaryScreenshotSrc}
          competitorScreenshot={competitorScreenshotSrc}
        />
      </div>
    );
  }

  // STANDARD REPORT
  return (
    <div className={`${REPORT_PAGE_GUTTER_X} pb-8`}>
      <StandardReportView
        report={report}
        primaryScreenshotSrc={primaryScreenshotSrc}
        isSharedView={isSharedView}
      />
    </div>
  );
};
