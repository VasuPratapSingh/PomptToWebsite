
"use client";

import * as React from "react"; // Added explicit React import
import { promptExamples } from "@/lib/prompt-examples";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface PromptSuggestionsProps {
  inputValue: string;
  onSelectSuggestion: (suggestion: string) => void;
  isVisible: boolean;
}

export function PromptSuggestions({
  inputValue,
  onSelectSuggestion,
  isVisible,
}: PromptSuggestionsProps) {
  const filteredSuggestions = React.useMemo(() => {
    if (!inputValue) return [];
    return promptExamples.filter((ex) =>
      ex.toLowerCase().includes(inputValue.toLowerCase())
    ).slice(0, 5); // Limit suggestions
  }, [inputValue]);

  const hasSuggestions = filteredSuggestions.length > 0;
  const shouldRender = isVisible && hasSuggestions;
  const [internalVisible, setInternalVisible] = React.useState(shouldRender);

  // Manage visibility for animations
  React.useEffect(() => {
    if (shouldRender) {
      setInternalVisible(true);
    } else {
      // Allow exit animation to complete before removing from DOM
      const timer = setTimeout(() => setInternalVisible(false), 150); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [shouldRender]);

  if (!internalVisible) {
    return null;
  }

  return (
    <Card
      className={cn(
        "absolute z-10 mt-1 w-full shadow-lg max-h-60 overflow-hidden rounded-lg border bg-popover text-popover-foreground",
        // Animation classes
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=top]:slide-in-from-bottom-2"
      )}
      data-state={shouldRender ? "open" : "closed"} // Control animation state
      data-side="top" // Set side for slide-in animation direction
    >
      <ScrollArea className="h-full">
        <CardContent className="p-2">
          <ul>
            {filteredSuggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  type="button"
                  className="w-full text-left p-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground focus:outline-none focus:bg-accent focus:text-accent-foreground transition-colors"
                  onClick={() => onSelectSuggestion(suggestion)}
                  // Use mousedown to register click before blur hides the suggestions
                  onMouseDown={(e) => e.preventDefault()}
                  aria-label={`Select suggestion: ${suggestion}`}
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
