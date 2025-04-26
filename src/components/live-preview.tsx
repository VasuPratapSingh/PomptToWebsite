"use client";

import * as React from "react";
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
          /* Basic reset and ensure full height */
          html, body { height: 100%; margin: 0; padding: 0; overflow: auto; font-family: sans-serif; }
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
    // Ensure the container allows the iframe to take full height
    <div className={cn("w-full h-full bg-card rounded-lg shadow-sm overflow-hidden", className)}>
      <iframe
        srcDoc={iframeContent}
        title="Live Preview"
        className="w-full h-full border-0" // Use h-full to take available height
        sandbox="allow-scripts allow-same-origin" // Allow scripts but restrict some potentially harmful actions
      />
    </div>
  );
}
