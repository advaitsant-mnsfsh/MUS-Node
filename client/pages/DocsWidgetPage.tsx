import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, ArrowLeft } from "lucide-react";
import { Footer } from "../components/Footer";

// Figma: "API Keys Widget Doc" node 1858:3765 — single content column max 656px (incl. Advanced Style grid)

const DOC_COLUMN_MAX = 656;
const WIDGET_SCRIPT_URL = "https://widget.myuxscore.com/widget.js";

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div
      className="flex items-stretch justify-between font-['DM_Sans'] w-full"
      style={{
        backgroundColor: "#4d4d4d",
        border: "0.5px solid rgba(0,0,0,0.1)",
        borderRadius: 4,
        padding: 12,
        gap: 10,
      }}
    >
      <pre
        className="font-mono flex-1 min-w-0 overflow-x-auto whitespace-pre-wrap"
        style={{
          fontSize: 12,
          fontWeight: 400,
          color: "#fafafa",
          lineHeight: "normal",
        }}
      >
        {code}
      </pre>
      <div className="flex flex-row items-stretch shrink-0">
        <div className="flex h-full items-end justify-end">
          <button
            type="button"
            onClick={handleCopy}
            className="hover:opacity-70 transition-opacity p-0.5"
            title="Copy code"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 text-[#666666]" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const DocCard: React.FC<{
  step: string;
  stepColWidth?: number;
  title: string;
  description: string;
  code: string;
}> = ({ step, stepColWidth = 16, title, description, code }) => (
  <div
    className="flex flex-col font-['DM_Sans'] w-full"
    style={{
      backgroundColor: "#ffffff",
      border: "1px solid #e5e5e5",
      borderRadius: 12,
      padding: 24,
      gap: 24,
    }}
  >
    <div className="flex items-start w-full" style={{ gap: 12 }}>
      <span
        className="font-semibold text-[#666666] shrink-0 flex flex-col justify-center"
        style={{ fontSize: 15, width: stepColWidth, lineHeight: 1.5 }}
      >
        {step}
      </span>
      <div className="flex flex-col flex-1 min-w-0" style={{ gap: 8 }}>
        <p
          className="font-bold text-[#1a1a1a] w-full"
          style={{ fontSize: 14, lineHeight: 1.5 }}
        >
          {title}
        </p>
        <p
          className="font-medium text-[#1a1a1a] w-full"
          style={{ fontSize: 14, lineHeight: 1.5, letterSpacing: "-0.5px" }}
        >
          {description}
        </p>
      </div>
    </div>
    <CodeBlock code={code} />
  </div>
);

const StyleCard: React.FC<{
  title: string;
  props: { name: string; value: string }[];
}> = ({ title, props }) => (
  <div
    className="flex flex-col min-w-0 font-['DM_Sans'] w-full"
    style={{
      backgroundColor: "#ffffff",
      border: "1px solid #e5e5e5",
      borderRadius: 12,
      padding: 24,
    }}
  >
    <div className="flex flex-col w-full" style={{ gap: 8 }}>
      <p
        className="font-bold text-[#1a1a1a] w-full"
        style={{ fontSize: 14, lineHeight: 1.5 }}
      >
        {title}
      </p>
      <div className="flex flex-col w-full" style={{ gap: 8 }}>
        {props.map((p, i) => (
          <div
            key={i}
            className="flex items-baseline justify-between w-full gap-2.5"
            style={{ lineHeight: 1.5 }}
          >
            <code
              className="font-mono font-medium flex-1 min-w-0 text-left"
              style={{
                fontSize: 12,
                color: "#0c52e0",
                letterSpacing: "-0.5px",
              }}
            >
              {p.name}
            </code>
            <span
              className="font-medium text-[#1a1a1a] text-right min-w-0"
              style={{ fontSize: 14 }}
            >
              {p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const BackLink: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center hover:opacity-70 transition-opacity text-left self-start"
    style={{ gap: 2 }}
  >
    <div className="w-5 h-5 shrink-0 flex items-center justify-center">
      <ArrowLeft className="w-4 h-4 text-[#666666]" strokeWidth={1.75} />
    </div>
    <span
      className="font-semibold text-[#666666]"
      style={{ fontSize: 14, lineHeight: 1.5 }}
    >
      Back To API Keys
    </span>
  </button>
);

export const DocsWidgetPage: React.FC = () => {
  const navigate = useNavigate();

  const htmlCode = `<!-- 1. The Container (Place where you want the widget) -->
<div id="audit-widget-root" style="width: 100%;"></div>

<!-- 2. The Logic (Paste before </body>) -->
<script src="${WIDGET_SCRIPT_URL}"></script>
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
        script.src = "${WIDGET_SCRIPT_URL}";
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

  const goBack = () => navigate("/api-keys");

  return (
    <div className="font-['DM_Sans'] w-full bg-[#fafafa]">
      <div
        className="flex flex-col w-full mx-auto gap-8 px-4 py-10 sm:px-6 md:px-0 lg:py-16"
        style={{ maxWidth: DOC_COLUMN_MAX }}
      >
        <div
          className="flex flex-col w-full rounded-xl py-1"
          style={{ gap: 16 }}
        >
          <BackLink onClick={goBack} />

          <div className="flex items-center w-full" style={{ gap: 8 }}>
            <div className="w-6 h-6 shrink-0 flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M8 4L4 8l4 4M16 4l4 4-4 4M10 12h4"
                  stroke="#1a1a1a"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1
              className="font-bold text-[#1a1a1a] capitalize"
              style={{ fontSize: 24, lineHeight: "normal" }}
            >
              Widget Setup Doc
            </h1>
          </div>

          <div className="flex flex-col w-full" style={{ gap: 16 }}>
            <DocCard
              step="01"
              title="HTML and Vanilla JavaScript"
              description="To initiate the setup simply include the container DIV and place the script tag just before the closing body tag."
              code={htmlCode}
            />
            <DocCard
              step="02"
              stepColWidth={20}
              title="REACT / NEXT.JS (JSX)"
              description="Ideal for contemporary web applications, manages asynchronous loading and clean component mounting."
              code={jsxCode}
            />
          </div>
        </div>

        {/* Same width as doc cards — 2×2 grid inside 656px */}
        <div className="flex flex-col w-full" style={{ gap: 16 }}>
          <div
            className="flex flex-col w-full"
            style={{ gap: 8, lineHeight: 1.5, letterSpacing: "-0.5px" }}
          >
            <h2
              className="font-bold text-[#1a1a1a] w-full"
              style={{ fontSize: 16 }}
            >
              Advanced Style Reference
            </h2>
            <p
              className="font-medium text-[#666666] w-full"
              style={{ fontSize: 14 }}
            >
              Tailor each pixel of the widget to align seamlessly with your
              brand identity. Ensure these properties are included within the{" "}
              <code
                className="font-mono text-[#0c52e0]"
                style={{ fontSize: 14 }}
              >
                styles
              </code>{" "}
              object.
            </p>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 w-full"
            style={{ gap: 16 }}
          >
            <StyleCard
              title="Layout and Sizing"
              props={[
                { name: "layout", value: "'vertical' | 'horizontal'" },
                { name: "alignment", value: "'left' | 'center' | 'right'" },
                { name: "inputHeight", value: "e.g. '50px'" },
                { name: "paddingPercentage", value: "0-100" },
              ]}
            />
            <StyleCard
              title="Colors and Branding"
              props={[
                { name: "primaryColor", value: "Hex Code" },
                { name: "backgroundColor", value: "Hex Code" },
                { name: "textColor", value: "Hex Code" },
                { name: "borderRadius", value: "e.g. '12px'" },
              ]}
            />
            <StyleCard
              title="Loading States"
              props={[
                { name: "layout", value: "'vertical' | 'horizontal'" },
                { name: "alignment", value: "'left' | 'center' | 'right'" },
                { name: "inputHeight", value: "e.g. '50px'" },
              ]}
            />
            <StyleCard
              title="Success Screens"
              props={[
                { name: "layout", value: "'vertical' | 'horizontal'" },
                { name: "alignment", value: "'left' | 'center' | 'right'" },
                { name: "inputHeight", value: "e.g. '50px'" },
              ]}
            />
          </div>
        </div>

        <div className="w-full pb-4">
          <BackLink onClick={goBack} />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DocsWidgetPage;
