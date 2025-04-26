
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
import { Wand2, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import JSZip from 'jszip';
import { cn } from "@/lib/utils"; // Import cn

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
        className="w-full sm:w-auto transition-transform transform hover:scale-105 active:scale-95"
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

    zip.file("index.html", code.html);
    zip.file("style.css", code.css);
    zip.file("script.js", code.javascript);

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
        className="w-full sm:w-auto transition-transform transform hover:scale-105 active:scale-95"
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
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Left Panel: Prompt Input */}
      <div className="w-full md:w-1/2 md:max-h-screen p-4 md:p-6 lg:p-8 flex flex-col border-r border-border">
         <Card className="flex flex-col flex-grow overflow-hidden shadow-md transition-shadow hover:shadow-lg rounded-xl">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl">
              <Wand2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              PromptToSite
            </CardTitle>
            <CardDescription>Describe the website you want to create.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow gap-4 overflow-y-auto p-4 md:p-6 pt-0">
           <form action={formAction} ref={formRef} className="flex flex-col flex-grow gap-4">
             <div className="flex flex-col flex-grow gap-1.5 relative">
                <Label htmlFor="prompt">Your Prompt</Label>
                <div className="relative flex-grow">
                   <Textarea
                    id="prompt"
                    name="prompt"
                    placeholder="e.g., Create a simple portfolio website for a photographer..."
                    className="min-h-[150px] sm:min-h-[200px] md:min-h-[250px] lg:min-h-[300px] w-full resize-none text-sm sm:text-base rounded-lg" // Ensure text area grows
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
                    <p id="prompt-error" className="text-sm font-medium text-destructive">
                        {state.errors.prompt[0]}
                    </p>
                 )}
              </div>
              {/* Buttons container at the bottom */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-start items-center mt-auto pt-4 border-t border-border flex-shrink-0">
                <SubmitButton />
                <DownloadButton code={state?.code}/>
              </div>
            </form>
           </CardContent>
         </Card>
      </div>

      {/* Right Panel: Live Preview */}
      <div className="w-full md:w-1/2 md:max-h-screen p-4 md:p-6 lg:p-8 flex">
        {/* Ensure ScrollArea takes full height of its container */}
        <ScrollArea className="w-full h-full rounded-xl border bg-card shadow-inner transition-shadow hover:shadow-lg">
           {/* Use flexbox to manage preview/placeholder height */}
           <div className="flex flex-col h-full p-1">
              {state?.code ? (
                  <div className="animate-in fade-in duration-500 h-full"> {/* Added animation here */}
                    <LivePreview
                        html={state.code.html}
                        css={state.code.css}
                        javascript={state.code.javascript}
                        className="flex-grow w-full" // Allow preview to grow
                    />
                  </div>
              ) : (
                <div className="flex flex-grow items-center justify-center text-muted-foreground text-center p-4">
                    <p>Your generated website preview will appear here.</p>
                </div>
             )}
           </div>
        </ScrollArea>
      </div>
    </div>
  );
}
