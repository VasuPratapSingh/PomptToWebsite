
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
          /* Ensure content within body respects viewport */
          body > * { max-width: 100%; box-sizing: border-box; }
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
    <div className={cn(
        "w-full h-full flex items-center justify-center bg-transparent p-1 sm:p-2 overflow-hidden", // Reduced padding slightly
        className
    )}>
      <iframe
        srcDoc={iframeContent}
        title="Live Preview"
        // Apply aspect ratio, control size, and style
        className={cn(
            "aspect-[9/16]", // Force 9:16 vertical aspect ratio
            "h-full w-auto", // Let height dictate width based on aspect ratio
            "max-h-full max-w-[calc(100%-0.5rem)]", // Prevent exceeding container bounds, slightly reduced max-width for padding
            "border border-border/30 rounded-md sm:rounded-lg", // Adjusted rounding for smaller screens
            "bg-white", // White background for the preview content itself
            "shadow-lg sm:shadow-xl" // Adjusted shadow for smaller screens
        )}
        sandbox="allow-scripts allow-same-origin"
        // allowTransparency prop removed as it's deprecated/non-standard
      />
    </div>
  );
}
