"use client";

import * as React from "react"; // Import React
import { cn } from "@/lib/utils";

interface LivePreviewProps {
  html: string;
  css: string;
  javascript: string;
  className?: string;
}

export function LivePreview({ html, css, javascript, className }: LivePreviewProps) {
  const [iframeContent, setIframeContent] = React.useState("");

  React.useEffect(() => {
    const documentContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; font-family: sans-serif; } /* Basic reset */
          ${css}
        </style>
        <title>Live Preview</title>
      </head>
      <body>
        ${html}
        <script>${javascript}<\/script>
      </body>
      </html>
    `;
    setIframeContent(documentContent);
  }, [html, css, javascript]);

  return (
    <div className={cn("w-full h-full bg-card rounded-lg shadow-sm overflow-hidden", className)}>
      <iframe
        srcDoc={iframeContent}
        title="Live Preview"
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin" // Allow scripts but restrict some potentially harmful actions
      />
    </div>
  );
}
