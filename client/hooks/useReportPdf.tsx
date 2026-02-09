import { useState } from 'react';
import ReactDOM from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalysisReport, Screenshot } from '../types';
import { ReportPDFTemplate } from '../components/report/ReportPDFTemplate';

interface UseReportPdfProps {
    report: AnalysisReport | null;
    url: string;
    screenshots: Screenshot[];
    whiteLabelLogo?: string | null;
    defaultLogoSrc?: string;
}

// Helper to convert colors before html2canvas sees them
const convertModernColorsToRgb = (container: HTMLElement) => {
    // console.log('[PDF Debug] Starting color conversion for container:', container.tagName);
    const colorConverter = document.createElement('canvas');
    colorConverter.width = 1;
    colorConverter.height = 1;
    const ctx = colorConverter.getContext('2d', { willReadFrequently: true });

    if (!ctx) return;

    const toRgb = (color: string) => {
        if (!color || (!color.includes('oklch') && !color.includes('oklab'))) return color;
        try {
            ctx.clearRect(0, 0, 1, 1);
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, 1, 1);
            const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
            const result = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
            // console.log(`[PDF Debug] Converted ${color} to ${result}`);
            return result;
        } catch (e) {
            return color;
        }
    };

    // Traverse all elements
    const elements = container.querySelectorAll('*');

    elements.forEach((el) => {
        if (el instanceof HTMLElement) {
            const style = window.getComputedStyle(el);
            const props = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor'];

            props.forEach(prop => {
                const val = style.getPropertyValue(prop);
                if (val) {
                    if (val.includes('oklch') || val.includes('oklab')) {
                        // Browser kept it as oklch/oklab, convert to RGB
                        const newVal = toRgb(val);
                        el.style.setProperty(prop, newVal, 'important');
                    } else {
                        // Browser already converted it (or it's normal), Inline it to persist against stylesheet nuking
                        el.style.setProperty(prop, val, 'important');
                    }
                }
            });

            // Check Box Shadow and Text Shadow - Clear complex oklch to prevent crash
            ['box-shadow', 'text-shadow', 'filter', 'backdrop-filter', 'fill', 'stroke'].forEach(prop => {
                const val = style.getPropertyValue(prop);
                if (val && (val.includes('oklch') || val.includes('oklab'))) {
                    el.style.setProperty(prop, 'none', 'important');
                }
            });
        }
    });
};

export const useReportPdf = ({ report, url, screenshots, whiteLabelLogo, defaultLogoSrc }: UseReportPdfProps) => {
    const [isPdfGenerating, setIsPdfGenerating] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);

    const generatePdf = async () => {
        if (!report) return;
        setIsPdfGenerating(true);
        setPdfError(null);

        // 1. Setup Hidden Container
        const sourceContainer = document.createElement('div');
        sourceContainer.className = "font-['DM_Sans'] bg-white text-slate-900";
        sourceContainer.style.position = 'absolute';
        sourceContainer.style.left = '-10000px';
        sourceContainer.style.top = '0';

        // 1.5 Inject Hex Overrides for Variables (Crucial for pseudo-elements & variables)
        const pdfStyle = document.createElement('style');
        pdfStyle.id = 'pdf-hex-overrides';
        pdfStyle.textContent = `
            .pdf-container {
                --color-slate-50: #f8fafc;
                --color-slate-100: #f1f5f9;
                --color-slate-200: #e2e8f0;
                --color-slate-300: #cbd5e1;
                --color-slate-400: #94a3b8;
                --color-slate-500: #64748b;
                --color-slate-600: #475569;
                --color-slate-700: #334155;
                --color-slate-800: #1e293b;
                --color-slate-900: #0f172a;
                --color-slate-950: #020617;
                
                --color-gray-50: #f9fafb;
                --color-gray-100: #f3f4f6;
                --color-gray-200: #e5e7eb;
                --color-gray-300: #d1d5db;
                --color-gray-400: #9ca3af;
                --color-gray-500: #6b7280;
                --color-gray-600: #4b5563;
                --color-gray-700: #374151;
                --color-gray-800: #1f2937;
                --color-gray-900: #111827;

                --color-white: #ffffff;
                --color-black: #000000;
                --color-red-500: #ef4444;
                --color-red-600: #dc2626;
                --color-orange-500: #f97316;
                --color-amber-500: #f59e0b;
                --color-yellow-400: #facc15;
                --color-yellow-500: #eab308;
                --color-lime-500: #84cc16;
                --color-green-500: #22c55e;
                --color-emerald-500: #10b981;
                --color-teal-500: #14b8a6;
                --color-cyan-500: #06b6d4;
                --color-sky-500: #0ea5e9;
                --color-blue-500: #3b82f6;
                --color-indigo-500: #6366f1;
                --color-violet-500: #8b5cf6;
                --color-purple-500: #a855f7;
                --color-fuchsia-500: #d946ef;
                --color-pink-500: #ec4899;
                --color-rose-500: #f43f5e;
            }
        `;
        document.head.appendChild(pdfStyle);
        sourceContainer.classList.add('pdf-container');

        // High Resolution Constants
        const CONTENT_WIDTH = 840;
        const PAGE_HEIGHT_PX = 1174;
        const MARGIN = 10;

        sourceContainer.style.width = `${CONTENT_WIDTH}px`;
        document.body.appendChild(sourceContainer);

        let root: ReactDOM.Root | null = null;
        let pages: HTMLElement[] = [];

        try {
            // 2. Render Template
            root = ReactDOM.createRoot(sourceContainer);
            await new Promise<void>((resolve) => {
                if (root) root.render(<ReportPDFTemplate report={report} url={url} screenshots={screenshots} />);
                setTimeout(resolve, 3000); // Wait for rendering
            });

            // 3. Wait for Images
            const images = Array.from(sourceContainer.querySelectorAll('img'));
            await Promise.all(images.map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise<void>(resolve => {
                    img.onload = () => resolve();
                    img.onerror = () => resolve();
                    setTimeout(() => resolve(), 3000);
                });
            }));

            // 4. PDF Init
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();

            // 5. Logo Loading (Partner/WL Logic)
            let whiteLabelImg: HTMLImageElement | null = null;
            let defaultLogoImg: HTMLImageElement | null = null;
            try {
                if (whiteLabelLogo) {
                    const img = new Image(); img.crossOrigin = 'anonymous'; img.src = whiteLabelLogo;
                    await new Promise<void>((r) => { img.onload = () => r(); img.onerror = () => r(); setTimeout(r, 1000); });
                    whiteLabelImg = img;
                } else if (defaultLogoSrc) {
                    const img = new Image(); img.crossOrigin = 'anonymous'; img.src = defaultLogoSrc;
                    await new Promise<void>((r) => { img.onload = () => r(); img.onerror = () => r(); setTimeout(r, 1000); });
                    defaultLogoImg = img;
                }
            } catch (e) { console.log(e); }

            // 6. Page Creator Helper
            const createPageDiv = (pageIndex: number) => {
                const div = document.createElement('div');
                div.className = "flex flex-col gap-0 font-['DM_Sans'] bg-white text-slate-900 relative box-border pdf-container";
                div.style.width = `${CONTENT_WIDTH}px`;
                div.style.minHeight = `${PAGE_HEIGHT_PX}px`;
                div.style.padding = '24px';
                div.style.paddingTop = '70px'; // Space for Logo
                div.style.paddingBottom = '50px'; // Space for Footer
                div.style.backgroundColor = '#ffffff';
                div.style.position = 'absolute';
                div.style.left = '-10000px';
                div.style.top = '0';

                // Header Logo
                const activeLogo = whiteLabelImg || defaultLogoImg;
                if (activeLogo) {
                    const logoClone = activeLogo.cloneNode(true) as HTMLImageElement;
                    logoClone.style.position = 'absolute';
                    logoClone.style.top = '20px';
                    logoClone.style.right = '24px';
                    logoClone.style.maxHeight = '40px';
                    logoClone.style.maxWidth = '130px';
                    logoClone.style.objectFit = 'contain';
                    div.appendChild(logoClone);
                }

                // Footer
                const footer = document.createElement('div');
                footer.style.position = 'absolute';
                footer.style.bottom = '15px';
                footer.style.left = '24px';
                footer.style.right = '24px';
                footer.style.height = '30px';
                footer.style.display = 'flex';
                footer.style.justifyContent = 'space-between';
                footer.style.alignItems = 'center';
                footer.style.borderTop = '1px solid #e2e8f0';
                footer.style.paddingTop = '8px';

                const disclaimer = document.createElement('span');
                disclaimer.innerText = "Scores are AI generated and represent an overall assessment based on 110+ factors";
                disclaimer.style.color = '#94a3b8';
                disclaimer.style.fontSize = '9px';

                const pageNum = document.createElement('span');
                pageNum.innerText = `Page ${pageIndex + 1}`;
                pageNum.style.color = '#64748b';
                pageNum.style.fontSize = '9px';
                pageNum.style.fontWeight = 'bold';

                footer.appendChild(disclaimer);
                footer.appendChild(pageNum);
                div.appendChild(footer);
                return div;
            };

            // 7. Pagination Logic (Your Smart Logic)
            const allItems = Array.from(sourceContainer.querySelectorAll('.pdf-item')) as HTMLElement[];

            // Filter nested items
            const items = allItems.filter(item => {
                let parent = item.parentElement;
                while (parent && parent !== sourceContainer) {
                    if (parent.classList.contains('pdf-item')) return false;
                    parent = parent.parentElement;
                }
                return true;
            });

            let currentPage = createPageDiv(0);
            document.body.appendChild(currentPage);
            pages.push(currentPage);

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const isHeader = item.tagName === 'H2' || item.tagName === 'H3' || item.classList.contains('pdf-section-title') || item.classList.contains('pdf-section-header');
                const isForceBreak = item.classList.contains('force-page-break-before');
                const hasContent = currentPage.children.length > 2; // >2 because of Logo logic in createPageDiv

                if (isForceBreak && hasContent) {
                    currentPage = createPageDiv(pages.length);
                    document.body.appendChild(currentPage);
                    pages.push(currentPage);
                }

                currentPage.appendChild(item);

                const currentHeight = currentPage.scrollHeight;
                const spaceRemaining = PAGE_HEIGHT_PX - currentHeight;
                const overflow = currentHeight > PAGE_HEIGHT_PX;

                // Aggressive Orphan Check
                const isOrphanHeader = isHeader && spaceRemaining < 260;

                if (overflow || isOrphanHeader) {
                    currentPage.removeChild(item);
                    currentPage = createPageDiv(pages.length);
                    document.body.appendChild(currentPage);
                    pages.push(currentPage);
                    currentPage.appendChild(item);
                }
            }

            // 7.5 Fix colors for html2canvas BEFORE capturing
            pages.forEach(page => {
                convertModernColorsToRgb(page);
            });

            // 8. Capture & Save
            await document.fonts.ready;
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const canvas = await html2canvas(page, {
                    scale: 2, // High Quality
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    windowWidth: CONTENT_WIDTH,
                    onclone: (doc) => {
                        // 1. Sanitize Stylesheets: Nuke oklch from the CSSOM to prevent parser crash
                        // We rely on convertOklchToRgb (inline styles) for the actual colors.
                        const styleTags = doc.querySelectorAll('style');
                        styleTags.forEach(style => {
                            if (style.innerHTML.includes('oklch') || style.innerHTML.includes('oklab')) {
                                // Replace complex oklch(...) and oklab(...) with a safe placeholder
                                style.innerHTML = style.innerHTML.replace(/oklch\([^)]+\)|oklab\([^)]+\)/g, '#000000');
                            }
                        });

                        // 2. Font Variant fix
                        doc.querySelectorAll('*').forEach((el) => {
                            if (el instanceof HTMLElement) el.style.fontVariant = 'normal';
                        });
                    }
                });
                const imgData = canvas.toDataURL('image/jpeg', 0.80);
                const imgWidth = pdfWidth - (MARGIN * 2);
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'JPEG', MARGIN, MARGIN, imgWidth, imgHeight);
            }

            pdf.save(`audit-report-${url.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`);

        } catch (err) {
            console.error("PDF Gen Error:", err);
            setPdfError(err instanceof Error ? err.message : "Failed to generate PDF");
        } finally {
            if (document.body.contains(sourceContainer)) document.body.removeChild(sourceContainer);
            if (pages.length > 0) pages.forEach(p => { if (document.body.contains(p)) document.body.removeChild(p); });
            const pdfStyle = document.getElementById('pdf-hex-overrides');
            if (pdfStyle) document.head.removeChild(pdfStyle);
            if (root) setTimeout(() => root?.unmount(), 0);
            setIsPdfGenerating(false);
        }
    };

    return { generatePdf, isPdfGenerating, pdfError };
};
