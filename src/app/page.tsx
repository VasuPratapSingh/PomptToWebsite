
"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { generateWebsiteAction } from "./actions";
import { PromptSuggestions } from "@/components/prompt-suggestions";
import { LivePreview } from "@/components/live-preview";
import { Wand2, Download, Loader2, Sparkles } from "lucide-react"; // Added Sparkles icon
import { useToast } from "@/hooks/use-toast";
import JSZip from 'jszip';
import { cn } from "@/lib/utils";
import { promptExamples } from "@/lib/prompt-examples"; // Import preset prompts

const initialState = {
  message: null,
  code: null,
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
        type="submit"
        disabled={pending}
        aria-disabled={pending}
        className="w-full sm:w-auto transition-all transform hover:scale-105 active:scale-95 duration-200 ease-in-out animate-in fade-in zoom-in-95" // Added animation
      >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" /> Generate Website
        </>
      )}
    </Button>
  );
}

function DownloadButton({ code }: { code: { html: string, css: string, javascript: string } | null | undefined }) {
  const handleDownload = async () => {
    if (!code) return;

    const zip = new JSZip();

    // Ensure file content is not null/undefined before adding
    zip.file("index.html", code.html || "");
    zip.file("style.css", code.css || "");
    zip.file("script.js", code.javascript || "");

    try {
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = "website.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error creating zip file:", error);
      // Optionally show a toast message for the error
    }
  };

  if (!code?.html) return null;

  return (
    <Button
        variant="outline"
        onClick={handleDownload}
        className="w-full sm:w-auto transition-all transform hover:scale-105 active:scale-95 duration-200 ease-in-out animate-in fade-in zoom-in-95" // Added animation
      >
      <Download className="mr-2 h-4 w-4" /> Download Code
    </Button>
  );
}


export default function Home() {
  const [state, formAction] = useActionState(generateWebsiteAction, initialState);
  const [promptValue, setPromptValue] = React.useState("");
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state?.message) {
      toast({
        title: state.errors ? "Error" : "Status",
        description: state.message,
        variant: state.errors ? "destructive" : "default",
      });
    }
  }, [state, toast]);


  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptValue(event.target.value);
    setShowSuggestions(event.target.value.length > 0); // Show suggestions only if there's input
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setPromptValue(suggestion);
    setShowSuggestions(false); // Hide suggestions after selection
    // Optionally trigger generation immediately after selection
    // formRef.current?.requestSubmit();
  };

   const handlePresetClick = (presetPrompt: string) => {
    handleSelectSuggestion(presetPrompt);
    // Focus the textarea after selecting a preset
    formRef.current?.querySelector<HTMLTextAreaElement>('#prompt')?.focus();
  };


  const handleTextareaFocus = () => {
     if (promptValue) {
       setShowSuggestions(true);
     }
  }

  const handleTextareaBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 150);
  }


  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background overflow-hidden"> {/* Prevent body scroll */}
      {/* Left Panel: Prompt Input */}
      <ScrollArea className="w-full md:w-1/2 md:max-h-screen"> {/* Make left panel scrollable */}
        <div className="p-4 md:p-6 lg:p-8 flex flex-col min-h-full"> {/* Use min-h-full */}
         <Card className="flex flex-col flex-grow overflow-hidden shadow-lg transition-shadow hover:shadow-xl rounded-xl animate-in fade-in duration-300"> {/* Enhanced Card */}
            <CardHeader className="flex-shrink-0 pb-4"> {/* Adjusted padding */}
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold"> {/* Bolder Title */}
                <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary animate-pulse" /> {/* Pulse animation */}
                PromptToSite
              </CardTitle>
              <CardDescription className="text-base">Describe the website you want to create, or try a preset.</CardDescription> {/* Updated description */}
            </CardHeader>
            <CardContent className="flex flex-col flex-grow gap-4 p-4 md:p-6 pt-0"> {/* Adjusted padding */}
            <form action={formAction} ref={formRef} className="flex flex-col flex-grow gap-4">
              <div className="flex flex-col flex-grow gap-1.5 relative">
                  <Label htmlFor="prompt" className="text-lg font-semibold">Your Prompt</Label> {/* Larger Label */}
                  <div className="relative flex-grow">
                    <Textarea
                      id="prompt"
                      name="prompt"
                      placeholder="e.g., Create a sleek landing page for a mobile app promoting sustainable travel..."
                      className="min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px] w-full resize-none text-base sm:text-lg rounded-lg shadow-inner transition-shadow focus:shadow-md" // Enhanced Textarea
                      value={promptValue}
                      onChange={handleInputChange}
                      onFocus={handleTextareaFocus}
                      onBlur={handleTextareaBlur}
                      aria-describedby="prompt-error"
                      required
                    />
                    <PromptSuggestions
                      inputValue={promptValue}
                      onSelectSuggestion={handleSelectSuggestion}
                      isVisible={showSuggestions}
                    />
                  </div>
                  {state?.errors?.prompt && (
                      <p id="prompt-error" className="text-sm font-medium text-destructive animate-in fade-in"> {/* Error animation */}
                          {state.errors.prompt[0]}
                      </p>
                  )}
                </div>

                {/* Preset Prompts Section */}
                <div className="mt-4 flex-shrink-0">
                  <Label className="text-base font-medium mb-2 block">Try these examples:</Label>
                  <div className="flex flex-wrap gap-2">
                    {promptExamples.map((example, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePresetClick(example)}
                        className="transition-all transform hover:scale-105 active:scale-95 duration-150 ease-in-out text-xs sm:text-sm animate-in fade-in zoom-in-95" // Animation for presets
                        aria-label={`Use preset prompt: ${example}`}
                      >
                        {example.length > 40 ? `${example.substring(0, 37)}...` : example} {/* Truncate long presets */}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Buttons container at the bottom */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-start items-center mt-auto pt-4 border-t border-border flex-shrink-0"> {/* Increased gap */}
                  <SubmitButton />
                  <DownloadButton code={state?.code}/>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Right Panel: Live Preview */}
      <div className="w-full md:w-1/2 md:max-h-screen p-4 md:p-6 lg:p-8 flex">
        <ScrollArea className="w-full h-full rounded-xl border bg-gradient-to-br from-card via-background to-card shadow-inner transition-shadow hover:shadow-lg animate-in fade-in duration-500 delay-150"> {/* Gradient & Delayed Fade-in */}
          {/* Use flexbox to manage preview/placeholder height */}
          <div className="flex flex-col h-full p-1">
              {state?.code ? (
                  <div className="animate-in fade-in duration-700 h-full"> {/* Slower fade-in for content */}
                    <LivePreview
                        html={state.code.html}
                        css={state.code.css}
                        javascript={state.code.javascript}
                        className="flex-grow w-full" // Allow preview to grow
                    />
                  </div>
              ) : (
                <div className="flex flex-grow items-center justify-center text-muted-foreground text-center p-4 animate-pulse"> {/* Pulse animation for placeholder */}
                    <p className="text-lg">Your generated website preview will appear here.</p> {/* Larger text */}
                </div>
              )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
