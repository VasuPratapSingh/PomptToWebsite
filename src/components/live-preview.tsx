
"use client";

import React from "react";
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
          /* Basic reset and ensure full height, transparent background */
          html, body { height: 100%; margin: 0; padding: 0; overflow: auto; font-family: sans-serif; background-color: transparent; }
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
    // Container to center the iframe and manage layout
    <div className={cn("w-full h-full flex items-center justify-center bg-transparent p-2 overflow-hidden", className)}>
      <iframe
        srcDoc={iframeContent}
        title="Live Preview"
        // Apply aspect ratio, control size, and style
        className={cn(
            "aspect-[9/16]", // Force 9:16 vertical aspect ratio
            "h-full w-auto", // Let height dictate width based on aspect ratio
            "max-h-full max-w-full", // Prevent exceeding container bounds
            "border border-border/30 rounded-lg", // Consistent border and rounding
            "bg-white", // White background for the preview content itself
            "shadow-xl" // Enhanced shadow for better depth
        )}
        sandbox="allow-scripts allow-same-origin"
        allowTransparency={true} // Use camelCase for React prop
      />
    </div>
  );
}
