"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
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

const initialState = {
  message: null,
  code: null,
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending}>
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
  const handleDownload = () => {
    if (!code) return;

    const zip = new (require('jszip'))(); // Lazy load jszip

    zip.file("index.html", code.html);
    zip.file("style.css", code.css);
    zip.file("script.js", code.javascript);

    zip.generateAsync({ type: "blob" })
      .then(function (content: Blob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "website.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      });
  };

  if (!code?.html) return null;

  return (
    <Button variant="outline" onClick={handleDownload}>
      <Download className="mr-2 h-4 w-4" /> Download Code
    </Button>
  );
}


export default function Home() {
  const [state, formAction] = useFormState(generateWebsiteAction, initialState);
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
    setShowSuggestions(true);
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
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background">
      {/* Left Panel: Prompt Input */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full p-4 lg:p-6 flex flex-col border-r border-border">
         <Card className="flex flex-col flex-grow overflow-hidden shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-6 w-6 text-primary" />
              PromptToSite
            </CardTitle>
            <CardDescription>Describe the website you want to create.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow gap-4 overflow-hidden">
           <form action={formAction} ref={formRef} className="flex flex-col flex-grow gap-4">
             <div className="flex flex-col flex-grow gap-1.5 relative">
                <Label htmlFor="prompt">Your Prompt</Label>
                 <Textarea
                  id="prompt"
                  name="prompt"
                  placeholder="e.g., Create a simple portfolio website for a photographer..."
                  className="flex-grow resize-none text-base" // Ensure text area grows
                  rows={10} // Start with a reasonable number of rows
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
                 {state?.errors?.prompt && (
                    <p id="prompt-error" className="text-sm font-medium text-destructive">
                        {state.errors.prompt[0]}
                    </p>
                 )}
              </div>
              <div className="flex flex-wrap gap-2 justify-start items-center mt-auto pt-4 border-t border-border">
                <SubmitButton />
                <DownloadButton code={state?.code}/>
              </div>
            </form>
           </CardContent>
         </Card>
      </div>

      {/* Right Panel: Live Preview */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full p-4 lg:p-6 flex">
        <ScrollArea className="w-full h-full rounded-lg border bg-card">
          <div className="p-1"> {/* Added padding around preview area */}
              {state?.code ? (
                  <LivePreview
                  html={state.code.html}
                  css={state.code.css}
                  javascript={state.code.javascript}
                  className="min-h-[400px] md:min-h-full" // Ensure minimum height
                  />
              ) : (
                <div className="flex items-center justify-center h-[400px] md:h-full text-muted-foreground text-center p-4">
                    <p>Your generated website preview will appear here.</p>
                </div>
             )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
