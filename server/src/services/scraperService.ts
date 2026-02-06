import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { AxePuppeteer } from '@axe-core/puppeteer';
import { retryWithBackoff } from '../utils/retry';

puppeteer.use(StealthPlugin());

export const performScrape = async (url: string, isMobile: boolean, isFirstPage: boolean, browserEndpoint?: string) => {
    let browser;
    let isRemoteBrowser = false;
    try {
        if (browserEndpoint) {
            try {
                // @ts-ignore
                const connectBrowser = () => puppeteer.connect({ browserWSEndpoint: browserEndpoint });
                browser = await retryWithBackoff(connectBrowser, 3, 2000, "Puppeteer Connect");
                isRemoteBrowser = true;
            } catch (remoteError) {
                console.warn(`[SCRAPE] Remote browser connection failed. Falling back to local browser. Error: ${(remoteError as any).message}`);
            }
        }

        if (!browser) {
            // CRITICAL SAFEGUARD: 
            // In Production (Railway/Vercel), launching local Chrome usually kills the container (OOM).
            // We MUST use a remote browser (Browserless, etc.) unless explicitly overridden.
            if (process.env.NODE_ENV === 'production' && process.env.ALLOW_LOCAL_CHROME !== 'true') {
                throw new Error("Misconfigured Scraper: Local Puppeteer launch blocked in Production to prevent crash. Please ensure 'PUPPETEER_BROWSER_ENDPOINT' secret is set correctly in ENV.");
            }

            console.log('[SCRAPE] Launching local browser...');
            browser = await puppeteer.launch({
                headless: "new",
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-blink-features=AutomationControlled'
                ]
            });
            isRemoteBrowser = false;
        }

        const page = await browser.newPage();

        // Set timeouts to prevent hanging
        page.setDefaultNavigationTimeout(60000);
        page.setDefaultTimeout(30000); // 30s timeout for all operations

        // Enhanced stealth: Set realistic User Agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Enhanced stealth: More realistic headers to bypass bot detection
        await page.setExtraHTTPHeaders({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0'
        });

        const viewport = isMobile ? { width: 390, height: 844, isMobile: true, hasTouch: true } : { width: 1920, height: 1080 };
        await page.setViewport(viewport);

        console.log(`[SCRAPE] [${isMobile ? 'MOBILE' : 'DESKTOP'}] Navigating to ${url}...`);
        // Use domcontentloaded for speed (networkidle2 is too slow on heavy sites)
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        try { await page.waitForNetworkIdle({ timeout: 2000 }).catch(() => { }); } catch (e) { }

        // Scroll logic - wrapped for safety
        try {
            await page.evaluate(async () => {
                await new Promise<void>((resolve) => {
                    let totalHeight = 0;
                    const distance = 250;
                    const maxScrolls = 15; // Reduced from 40 for speed
                    let scrolls = 0;
                    const timer = setInterval(() => {
                        const scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        scrolls++;
                        if (totalHeight >= scrollHeight || scrolls >= maxScrolls) {
                            clearInterval(timer);
                            resolve();
                        }
                    }, 100);
                });
            });
        } catch (scrollError) {
            console.warn('[SCRAPE] Scroll failed, continuing...', scrollError);
        }

        // Fix fixed positions - wrapped for safety
        try {
            await page.evaluate(() => {
                document.querySelectorAll('*').forEach((el: any) => {
                    const style = window.getComputedStyle(el);
                    if (style.position === 'fixed' || style.position === 'sticky') {
                        el.style.position = 'absolute';
                    }
                });
                window.scrollTo(0, 0);
            });
        } catch (fixError) {
            console.warn('[SCRAPE] Fix positions failed, continuing...', fixError);
        }

        // Check if page is still alive before taking screenshot
        if (page.isClosed()) {
            throw new Error('Page crashed during scraping operations');
        }

        console.log(`[SCRAPE] Taking Screenshot...`);
        let screenshotBuffer;
        try {
            screenshotBuffer = await page.screenshot({ type: 'jpeg', quality: 50, fullPage: true });
        } catch (screenshotError: any) {
            console.error('[SCRAPE] Screenshot failed:', screenshotError.message);
            throw new Error(`Screenshot failed: ${screenshotError.message}`);
        }

        const pagePath = new URL(url).pathname;

        const screenshot = {
            path: pagePath,
            data: Buffer.from(screenshotBuffer).toString('base64'),
            isMobile
        };

        // Page data extraction - wrapped for safety
        let pageData;
        try {
            pageData = await page.evaluate((isFirstPageDesktop: boolean) => {
                const text = document.body.innerText;
                let animationData = null;
                let accessibilityData = null;

                if (isFirstPageDesktop) {
                    // @ts-ignore
                    animationData = Array.from(document.querySelectorAll('*')).filter((el: any) => {
                        const style = window.getComputedStyle(el);
                        return style.getPropertyValue('animation-name') !== 'none' || (style.getPropertyValue('transition-property') !== 'all' && style.getPropertyValue('transition-property') !== '');
                    }).map((el: any) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${el.className && typeof el.className === 'string' ? `.${el.className.split(' ').filter((c: any) => c).join('.')}` : ''}`).slice(0, 20);

                    // @ts-ignore
                    accessibilityData = {
                        imagesMissingAlt: Array.from(document.querySelectorAll('img:not([alt])')).length,
                        inputsMissingLabels: Array.from(document.querySelectorAll('input:not([id]), textarea:not([id])')).filter((el: any) => !el.closest('label')).length + Array.from(document.querySelectorAll('input[id], textarea[id]')).filter((el: any) => !document.querySelector(`label[for="${el.id}"]`)).length,
                        hasSemanticElements: !!document.querySelector('main, nav, header, footer, article, section, aside'),
                        hasAriaAttributes: !!document.querySelector('[role], [aria-label], [aria-labelledby], [aria-describedby]')
                    };
                }

                return { liveText: text, animationData, accessibilityData };
            }, isFirstPage && !isMobile);
        } catch (evalError) {
            console.warn('[SCRAPE] Page evaluation failed, using fallback...', evalError);
            pageData = { liveText: '', animationData: null, accessibilityData: null };
        }

        // --- AXE-CORE ANALYSIS (Desktop First Page Only) ---
        let axeViolations: any[] = [];
        let axePasses: any[] = [];
        let axeIncomplete: any[] = [];
        let axeInapplicable: any[] = [];
        if (isFirstPage && !isMobile) {
            try {
                // Wait for animations (reduced to 2s for speed)
                await new Promise(r => setTimeout(r, 2000));

                // Check if page is still alive before running Axe
                if (page.isClosed()) {
                    console.warn('[AXE] Page already closed, skipping accessibility check');
                } else {
                    console.log(`[AXE] Running analysis on ${url}...`);

                    // Add timeout to prevent Axe from hanging
                    const axePromise = new AxePuppeteer(page)
                        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
                        .analyze();

                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Axe-Core timeout after 30s')), 30000)
                    );

                    const results = await Promise.race([axePromise, timeoutPromise]) as any;

                    console.log(`[AXE] Found ${results.violations.length} violations.`);
                    axeViolations = results.violations;

                    // Capture passes for granularity
                    const axePassesRaw = results.passes || [];
                    axePasses = axePassesRaw.map((p: any) => ({
                        id: p.id,
                        help: p.help,
                        html: (p.nodes && p.nodes.length > 0 && p.nodes[0].html) ? p.nodes[0].html : null
                    }));

                    // Capture incomplete (Manual Checks)
                    const axeIncompleteRaw = results.incomplete || [];
                    axeIncomplete = axeIncompleteRaw.map((p: any) => ({
                        id: p.id,
                        help: p.help,
                        nodes: p.nodes ? p.nodes.map((n: any) => ({ html: n.html, failureSummary: n.failureSummary })) : []
                    }));

                    // Capture inapplicable (N/A)
                    const axeInapplicableRaw = results.inapplicable || [];
                    axeInapplicable = axeInapplicableRaw.map((p: any) => ({
                        id: p.id,
                        help: p.help
                    }));
                }
            } catch (axeError) {
                console.error("Axe-Core failed (continuing audit):", axeError);
            }
        }

        try {
            if (page && !page.isClosed()) {
                await page.close();
            }
        } catch (closeError) {
            // Page likely already closed or crashed, ignoring safe cleanup error
        }

        console.log(`[SCRAPE] Scrape successful for ${url}`);
        return { screenshot, ...pageData, axeViolations, axePasses, axeIncomplete, axeInapplicable };

    } catch (error: any) {
        console.error("Scraping failed:", error);
        throw new Error(`Scraping failed: ${error.message}`);
    } finally {
        if (browser) {
            try {
                if (isRemoteBrowser) {
                    await browser.disconnect();
                } else {
                    await browser.close();
                }
            } catch (cleanupError) {
                console.warn('[SCRAPE] Browser cleanup warning:', cleanupError);
            }
        }
    }
};

export const performPerformanceCheck = async (url: string, apiKey: string, secrets: any) => {
    try {
        let pageSpeedApiKey = secrets['PAGESPEED_API_KEY'];
        if (!pageSpeedApiKey) {
            pageSpeedApiKey = process.env.PAGESPEED_API_KEY;
        }
        const usedKey = pageSpeedApiKey || apiKey;

        const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${usedKey}&category=performance&strategy=desktop`;

        const maskedKey = usedKey ? `...${usedKey.slice(-4)}` : 'undefined';
        console.log(`[Performance] Starting audit for: ${url}`);
        console.log(`[Performance] Using API Key: ${maskedKey}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        console.log(`[Performance] Fetching PageSpeed data...`);
        const psiResponse = await fetch(psiUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        console.log(`[Performance] Response Status: ${psiResponse.status}`);

        let performanceData = null;
        let error = null;

        if (!psiResponse.ok) {
            const errorText = await psiResponse.text();
            console.error(`[Performance] API Error Body:`, errorText);
            try {
                const errorBody = JSON.parse(errorText);
                error = errorBody?.error?.message || `API Error ${psiResponse.status}`;
            } catch (e) {
                error = `API Error ${psiResponse.status}: ${errorText}`;
            }
        } else {
            const psiData: any = await psiResponse.json();
            console.log(`[Performance] Data received. Lighthouse Result Present: ${!!psiData.lighthouseResult}`);

            if (psiData.lighthouseResult) {
                const audits = psiData.lighthouseResult.audits;
                performanceData = {
                    lcp: audits['largest-contentful-paint']?.displayValue || 'N/A',
                    cls: audits['cumulative-layout-shift']?.displayValue || 'N/A',
                    tbt: audits['total-blocking-time']?.displayValue || 'N/A',
                    fcp: audits['first-contentful-paint']?.displayValue || 'N/A',
                    tti: audits['interactive']?.displayValue || 'N/A',
                    si: audits['speed-index']?.displayValue || 'N/A'
                };
                console.log(`[Performance] Extracted metrics:`, performanceData);
            } else {
                console.warn(`[Performance] No lighthouseResult found in response.`);
                error = psiData.error ? psiData.error.message : "Lighthouse returned an empty result.";
            }
        }
        return { performanceData, error };
    } catch (e: any) {
        const error = e.name === 'AbortError' ? "Google PageSpeed Insights API timed out after 1 minute." : e.message;
        return { performanceData: null, error };
    }
};
