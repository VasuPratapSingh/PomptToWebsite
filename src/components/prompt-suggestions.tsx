"use client";

import React from "react"; // Explicit React import
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion
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

  // Use AnimatePresence in the parent component (page.tsx) for better control

  if (!isVisible || !hasSuggestions) {
    return null;
  }

  return (
    // Removed motion wrapper here, handle animation in parent
    <Card
      className={cn(
        "absolute z-10 mt-1 w-full shadow-lg max-h-60 overflow-hidden rounded-lg border bg-popover text-popover-foreground",
        // Remove animation classes handled by framer-motion in parent
        // "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=top]:slide-in-from-bottom-2"
      )}
      // Remove data attributes handled by framer-motion logic
      // data-state={shouldRender ? "open" : "closed"}
      // data-side="top"
    >
      <ScrollArea className="h-full">
        <CardContent className="p-2">
          <ul>
            {filteredSuggestions.map((suggestion, index) => (
              <li key={index}>
                 <motion.div
                  whileHover={{ backgroundColor: "hsla(var(--accent))", color: "hsla(var(--accent-foreground))" }}
                  transition={{ duration: 0.1 }}
                >
                    <button
                      type="button"
                      className="w-full text-left p-2 rounded-md text-sm focus:outline-none focus:bg-accent focus:text-accent-foreground transition-colors"
                      onClick={() => onSelectSuggestion(suggestion)}
                      // Use mousedown to register click before blur hides the suggestions
                      onMouseDown={(e) => e.preventDefault()}
                      aria-label={`Select suggestion: ${suggestion}`}
                    >
                      {suggestion}
                    </button>
                 </motion.div>
              </li>
            ))}
          </ul>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
