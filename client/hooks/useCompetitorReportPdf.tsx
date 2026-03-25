import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { CompetitorReportPDF } from "../components/report/pdf/CompetitorReportPDF";
import { CompetitorAnalysisData } from "../types";

const getRouteForPdfFilename = (rawUrl: string): string => {
  const input = (rawUrl || "").trim();
  if (!input) return "site";
  const withProto =
    input.startsWith("http://") || input.startsWith("https://")
      ? input
      : `https://${input}`;

  try {
    const u = new URL(withProto);
    const hostname = u.hostname;
    let pathname = u.pathname || "/";
    if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
    return `${hostname}${pathname}`;
  } catch {
    const noProto = input.replace(/^https?:\/\//, "");
    return noProto.split("?")[0].split("#")[0];
  }
};

const toSafeFilenameSlug = (text: string): string => {
  return (text || "")
    .replace(/[^a-zA-Z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
};

interface UseCompetitorReportPdfProps {
  data: CompetitorAnalysisData | null;
  url: string;
  competitorUrl?: string;
  whiteLabelLogo?: string | null;
  primaryScreenshotUrl?: string;
  competitorScreenshotUrl?: string;
}

export const useCompetitorReportPdf = ({
  data,
  url,
  competitorUrl,
  whiteLabelLogo,
  primaryScreenshotUrl,
  competitorScreenshotUrl,
}: UseCompetitorReportPdfProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const route = getRouteForPdfFilename(url);
  const slug = toSafeFilenameSlug(route);

  const generatePdf = async () => {
    if (!data) return;
    setIsGenerating(true);
    try {
      const blob = await pdf(
        <CompetitorReportPDF
          data={data}
          url={url}
          competitorUrl={competitorUrl}
          whiteLabelLogo={whiteLabelLogo}
          primaryScreenshotUrl={primaryScreenshotUrl}
          competitorScreenshotUrl={competitorScreenshotUrl}
        />,
      ).toBlob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `myuxscore-competitor-analysis-${slug}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Competitor PDF Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return { generatePdf, isGenerating };
};
