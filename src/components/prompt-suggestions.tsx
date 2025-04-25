"use client";

import type * as React from "react";
import { promptExamples } from "@/lib/prompt-examples";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  if (!isVisible || !inputValue) {
    return null;
  }

  const filteredSuggestions = promptExamples.filter((ex) =>
    ex.toLowerCase().includes(inputValue.toLowerCase())
  ).slice(0, 5); // Limit suggestions

  if (filteredSuggestions.length === 0) {
    return null;
  }

  return (
    <Card className="absolute z-10 mt-1 w-full shadow-lg max-h-60 overflow-hidden">
      <ScrollArea className="h-full">
        <CardContent className="p-2">
          <ul>
            {filteredSuggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  type="button"
                  className="w-full text-left p-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground focus:outline-none focus:bg-accent focus:text-accent-foreground"
                  onClick={() => onSelectSuggestion(suggestion)}
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
