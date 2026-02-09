import React, { useState } from 'react';
import { Copy, Check, Code, Globe, Zap, Settings, ShieldCheck, Terminal, Cpu } from 'lucide-react';
import { Footer } from '../components/Footer';

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group rounded-xl border-2 border-black bg-slate-900 overflow-hidden shadow-neo-sm transform transition-all hover:-translate-y-1 hover:shadow-neo">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40"></div>
                    </div>
                    <span className="text-xs font-mono text-slate-400 ml-2 uppercase tracking-widest">{language}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                    title="Copy code"
                >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>
            <div className="p-5 overflow-x-auto">
                <pre className="font-mono text-sm text-slate-300 leading-relaxed">
                    <code>{code}</code>
                </pre>
            </div>
            {copied && (
                <div className="absolute top-3 right-12 text-[10px] font-bold text-emerald-400 uppercase tracking-tighter bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                    Copied!
                </div>
            )}
        </div>
    );
};

export const DocsWidgetPage: React.FC = () => {
    const htmlCode = `<!-- 1. The Container (Place where you want the widget) -->
<div id="audit-widget-root" style="width: 100%;"></div>

<!-- 2. The Logic (Paste before </body>) -->
<script src="https://mus-node.vercel.app/widget.js"></script>
<script>
  window.addEventListener('load', function() {
    if (typeof AuditWidget !== 'undefined') {
        AuditWidget.mount({
          container: '#audit-widget-root',
          apiKey: 'YOUR_API_KEY_HERE', // <--- Get this from your Dashboard
          styles: {
            layout: 'vertical',
            primaryColor: '#6366F1',
            borderRadius: '12px',
            containerBoxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }
        });
    }
  });
</script>`;

    const jsxCode = `"use client";
import React, { useEffect } from 'react';

export default function AuditWidget() {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://mus-node.vercel.app/widget.js";
        script.async = true;
        document.body.appendChild(script);

        const checkWidget = setInterval(() => {
            if (window.AuditWidget) {
                clearInterval(checkWidget);
                window.AuditWidget.mount({
                    container: '#audit-widget-spot',
                    apiKey: 'YOUR_API_KEY_HERE',
                    styles: {
                        layout: 'vertical',
                        primaryColor: '#6366F1',
                        borderRadius: '16px'
                    }
                });
            }
        }, 100);
        return () => clearInterval(checkWidget);
    }, []);

    return <div id="audit-widget-spot" className="w-full"></div>;
}`;

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-page-bg font-['DM_Sans'] flex flex-col">
            <div className="grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">

                {/* Header */}
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold uppercase tracking-widest">
                        <Code className="w-3 h-3" /> Documentation
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-text-primary tracking-tight">
                        Embed the <span className="text-brand">MUS Node</span> Widget
                    </h1>
                    <p className="text-xl text-text-secondary max-w-2xl leading-relaxed">
                        Transform your website into an audit powerhouse. Install our lightweight widget in minutes and start offering high-end UX analysis to your users.
                    </p>
                </div>

                {/* Steps Section */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border-2 border-black shadow-neo-sm space-y-3">
                        <div className="w-10 h-10 bg-accent-yellow rounded-lg border-2 border-black flex items-center justify-center shadow-neo-xs">
                            <Settings className="w-5 h-5 text-black" />
                        </div>
                        <h3 className="font-bold text-lg">1. Generate API Key</h3>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            Head to your dashboard and create a new API key. This authenticates your widget requests.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border-2 border-black shadow-neo-sm space-y-3">
                        <div className="w-10 h-10 bg-accent-cyan rounded-lg border-2 border-black flex items-center justify-center shadow-neo-xs">
                            <Zap className="w-5 h-5 text-black" />
                        </div>
                        <h3 className="font-bold text-lg">2. Copy Embed Code</h3>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            Choose between the lightweight HTML script or our full React/JSX implementation.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border-2 border-black shadow-neo-sm space-y-3">
                        <div className="w-10 h-10 bg-white rounded-lg border-2 border-black flex items-center justify-center shadow-neo-xs">
                            <Globe className="w-5 h-5 text-brand" />
                        </div>
                        <h3 className="font-bold text-lg">3. Go Live</h3>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            Deploy the code to your site. Your users can now run audits directly from your domain.
                        </p>
                    </div>
                </div>

                {/* Implementation Guides */}
                <div className="space-y-12 pt-8">

                    {/* HTML / Vanilla JS */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100 text-orange-600 border border-orange-200">
                                <Terminal className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-text-primary uppercase tracking-tight">HTML & Vanilla JavaScript</h2>
                        </div>
                        <div className="space-y-4">
                            <p className="text-text-secondary font-medium">
                                The fastest way to get started. Just add the container DIV and the script tag at the end of your body.
                            </p>
                            <CodeBlock language="html" code={htmlCode} />
                        </div>
                    </div>

                    {/* React / JSX */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 border border-blue-200">
                                <Cpu className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-text-primary uppercase tracking-tight">React / Next.js (JSX)</h2>
                        </div>
                        <div className="space-y-4">
                            <p className="text-text-secondary font-medium">
                                Perfect for modern web apps. Our script handles asynchronous loading and clean mounting.
                            </p>
                            <CodeBlock language="jsx" code={jsxCode} />
                        </div>
                    </div>

                    {/* Advanced Styles Reference */}
                    <div className="space-y-8 pt-8 border-t border-slate-200">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-text-primary uppercase tracking-tight flex items-center gap-3">
                                <Settings className="w-6 h-6 text-brand" />
                                Advanced Style Reference
                            </h2>
                            <p className="text-text-secondary max-w-2xl">
                                Customize every pixel of the widget to match your brand identity. Pass these properties inside the <code className="text-brand font-bold">styles</code> object.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Category: Layout & Sizing */}
                            <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 space-y-4">
                                <h4 className="font-bold uppercase text-xs tracking-widest text-brand">Layout & Sizing</h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex justify-between border-b border-slate-50 pb-2">
                                        <code className="text-indigo-600">layout</code>
                                        <span className="text-slate-500">'vertical' | 'horizontal'</span>
                                    </li>
                                    <li className="flex justify-between border-b border-slate-50 pb-2">
                                        <code className="text-indigo-600">alignment</code>
                                        <span className="text-slate-500">'left' | 'center' | 'right'</span>
                                    </li>
                                    <li className="flex justify-between border-b border-slate-50 pb-2">
                                        <code className="text-indigo-600">inputHeight</code>
                                        <span className="text-slate-500">e.g. '50px'</span>
                                    </li>
                                    <li className="flex justify-between border-b border-slate-50 pb-2">
                                        <code className="text-indigo-600">paddingPercentage</code>
                                        <span className="text-slate-500">0 - 100</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Category: Colors */}
                            <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 space-y-4">
                                <h4 className="font-bold uppercase text-xs tracking-widest text-brand">Colors & Branding</h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex justify-between border-b border-slate-50 pb-2">
                                        <code className="text-indigo-600">primaryColor</code>
                                        <span className="text-slate-500">Hex Code</span>
                                    </li>
                                    <li className="flex justify-between border-b border-slate-50 pb-2">
                                        <code className="text-indigo-600">backgroundColor</code>
                                        <span className="text-slate-500">Hex Code</span>
                                    </li>
                                    <li className="flex justify-between border-b border-slate-50 pb-2">
                                        <code className="text-indigo-600">textColor</code>
                                        <span className="text-slate-500">Hex Code</span>
                                    </li>
                                    <li className="flex justify-between border-b border-slate-50 pb-2">
                                        <code className="text-indigo-600">borderRadius</code>
                                        <span className="text-slate-500">e.g. '12px'</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Category: Loading State */}
                            <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 space-y-4">
                                <h4 className="font-bold uppercase text-xs tracking-widest text-brand">Loading States</h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex justify-between border-b border-slate-50 pb-2">
                                        <code className="text-indigo-600">loadingText</code>
                                        <span className="text-slate-500">Custom String</span>
                                    </li>
                                    <li className="flex justify-between border-b border-slate-50 pb-2">
                                        <code className="text-indigo-600">loadingSpinnerColor</code>
                                        <span className="text-slate-500">Hex Code</span>
                                    </li>
                                    <li className="flex justify-between border-b border-slate-50 pb-2">
                                        <code className="text-indigo-600">loadingTextColor</code>
                                        <span className="text-slate-500">Hex Code</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Category: Success View */}
                            <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 space-y-4">
                                <h4 className="font-bold uppercase text-xs tracking-widest text-brand">Success Screen</h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex justify-between border-b border-slate-50 pb-2">
                                        <code className="text-indigo-600">successTitle</code>
                                        <span className="text-slate-500">Custom Title</span>
                                    </li>
                                    <li className="flex justify-between border-b border-slate-50 pb-2">
                                        <code className="text-indigo-600">viewReportButtonText</code>
                                        <span className="text-slate-500">'Open Report' etc.</span>
                                    </li>
                                    <li className="flex justify-between border-b border-slate-50 pb-2">
                                        <code className="text-indigo-600">copyButtonColor</code>
                                        <span className="text-slate-500">Hex Code</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Integration Tips */}
                <div className="bg-text-primary text-white rounded-3xl p-8 md:p-12 border-2 border-black shadow-neo relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand/20 blur-[100px] rounded-full -translate-y-12 translate-x-12"></div>
                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-400 text-black rounded-xl flex items-center justify-center border-2 border-black shadow-neo-xs shrink-0">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Pro Implementation Tips</h2>
                                <p className="text-slate-400">Maximize the impact of your integration</p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8 text-sm">
                            <div className="space-y-2">
                                <h4 className="font-bold text-brand uppercase tracking-widest text-[10px]">Security</h4>
                                <p className="text-slate-300 leading-relaxed">
                                    Never expose your API Key in unencrypted public repositories. Always use environment variables for local development.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-bold text-brand uppercase tracking-widest text-[10px]">Styling</h4>
                                <p className="text-slate-300 leading-relaxed">
                                    Use the <code className="text-brand font-bold bg-white/5 px-1 rounded">styles</code> object to match the widget aesthetics perfectly with your brand colors.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-bold text-brand uppercase tracking-widest text-[10px]">Performance</h4>
                                <p className="text-slate-300 leading-relaxed">
                                    Our script is optimized and asynchronous. It won't block your page's initial render or affect SEO scores.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-bold text-brand uppercase tracking-widest text-[10px]">Support</h4>
                                <p className="text-slate-300 leading-relaxed">
                                    Having trouble? Check the browser console for specific error messages or reach out to our team.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <Footer />
        </div>
    );
};

export default DocsWidgetPage;
