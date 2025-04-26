"use client";

import React from "react";
import { useActionState } from "react"; // Import useActionState from react
import { useFormStatus } from "react-dom"; // Keep useFormStatus from react-dom
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { generateWebsiteAction } from "./actions";
import { PromptSuggestions } from "@/components/prompt-suggestions";
import { LivePreview } from "@/components/live-preview";
import { Wand2, Download, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import JSZip from 'jszip';
import { cn } from "@/lib/utils";
import { promptExamples } from "@/lib/prompt-examples";


const initialState = {
  message: null,
  code: null,
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="w-full sm:w-auto"
    >
      <Button
        type="submit"
        disabled={pending}
        aria-disabled={pending}
        className="w-full sm:w-auto transition-colors duration-200 flex items-center justify-center shadow-sm hover:shadow-md" // Added flex, items-center, justify-center for icon alignment
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
    </motion.div>
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
     <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="w-full sm:w-auto"
    >
      <Button
        variant="outline"
        onClick={handleDownload}
        className="w-full sm:w-auto transition-colors duration-200 flex items-center justify-center shadow-sm hover:shadow-md" // Added flex, items-center, justify-center
        aria-label="Download website code as ZIP"
      >
        <Download className="mr-2 h-4 w-4" /> Download Code
      </Button>
    </motion.div>
  );
}


export default function Home() {
  const [state, formAction] = useActionState(generateWebsiteAction, initialState);
  const [promptValue, setPromptValue] = React.useState("");
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [previewKey, setPreviewKey] = React.useState(0); // Key for re-rendering preview

  React.useEffect(() => {
    if (state?.message) {
      toast({
        title: state.errors ? "Error" : "Status",
        description: state.message,
        variant: state.errors ? "destructive" : "default",
      });
    }
    if (state?.code) {
      setPreviewKey(prev => prev + 1); // Increment key to force preview re-render on new code
    }
  }, [state, toast]);


  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptValue(event.target.value);
    setShowSuggestions(event.target.value.length > 0);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setPromptValue(suggestion);
    setShowSuggestions(false);
     // Directly submit the form after selecting a suggestion/preset
    setTimeout(() => {
      formRef.current?.requestSubmit();
    }, 0);
  };

   const handlePresetClick = (presetPrompt: string) => {
    handleSelectSuggestion(presetPrompt);
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
    // Removed bg-background here, it's applied globally now
    <div className="flex flex-col md:flex-row min-h-screen overflow-hidden">
      {/* Left Panel: Prompt Input */}
      <ScrollArea className="w-full md:w-1/2 md:max-h-screen">
        {/* Increased padding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col min-h-full"
        >
          {/* Card with backdrop blur for transparency effect */}
          <Card className="flex flex-col flex-grow overflow-hidden shadow-lg rounded-xl backdrop-blur-md bg-card/70 border border-border/50 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="flex-shrink-0 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold">
                 <motion.div
                    animate={{ rotate: [0, 15, -10, 15, 0], scale: [1, 1.1, 1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
                  >
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                 </motion.div>
                PromptToSite
              </CardTitle>
              <CardDescription className="text-sm sm:text-base md:text-lg">Describe the website you want to create, or try a preset.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow gap-4 p-4 md:p-6 pt-0">
              <form action={formAction} ref={formRef} className="flex flex-col flex-grow gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex flex-col flex-grow gap-1.5 relative"
                >
                  <Label htmlFor="prompt" className="text-md sm:text-lg font-semibold">Your Prompt</Label>
                  <div className="relative flex-grow">
                    <Textarea
                      id="prompt"
                      name="prompt"
                      placeholder="e.g., Create a sleek landing page for a mobile app promoting sustainable travel..."
                      // Added backdrop-blur to textarea parent if needed, or style textarea directly
                      className="min-h-[150px] sm:min-h-[200px] md:min-h-[250px] lg:min-h-[300px] w-full resize-none text-base rounded-lg shadow-inner bg-input/80 backdrop-blur-sm transition-shadow focus:shadow-md focus:ring-2 focus:ring-ring/50" // Added focus ring
                      value={promptValue}
                      onChange={handleInputChange}
                      onFocus={handleTextareaFocus}
                      onBlur={handleTextareaBlur}
                      aria-describedby="prompt-error"
                      required
                    />
                    <AnimatePresence>
                      {showSuggestions && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-10 mt-1 w-full" // Ensure positioning context
                        >
                          <PromptSuggestions
                            inputValue={promptValue}
                            onSelectSuggestion={handleSelectSuggestion}
                            isVisible={showSuggestions} // Controlled externally now
                          />
                        </motion.div>
                      )}
                  </AnimatePresence>
                  </div>
                  {state?.errors?.prompt && (
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        id="prompt-error"
                        className="text-sm font-medium text-destructive"
                       >
                          {state.errors.prompt[0]}
                      </motion.p>
                  )}
                </motion.div>

                {/* Preset Prompts Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="mt-4 flex-shrink-0"
                 >
                  <Label className="text-sm sm:text-base font-medium mb-2 block">Try these examples:</Label>
                  <div className="flex flex-wrap gap-2">
                    {promptExamples.map((example, index) => (
                       <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePresetClick(example)}
                          className="transition-colors duration-150 ease-in-out text-xs sm:text-sm shadow-sm hover:shadow" // Simplified classes
                          aria-label={`Use preset prompt: ${example}`}
                        >
                          {example.length > 40 ? `${example.substring(0, 37)}...` : example}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Buttons container at the bottom */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-start items-center mt-auto pt-4 border-t border-border/50 flex-shrink-0"
                  >
                  <SubmitButton />
                  <DownloadButton code={state?.code}/>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </ScrollArea>

      {/* Right Panel: Live Preview */}
      {/* Increased padding */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        className="w-full md:w-1/2 md:max-h-screen p-4 sm:p-6 md:p-8 lg:p-10 flex"
       >
        {/* Added backdrop blur to scroll area */}
        <ScrollArea className="w-full h-full rounded-xl border border-border/50 bg-card/60 backdrop-blur-md shadow-inner transition-shadow hover:shadow-lg">
           <div className="flex flex-col h-full p-1">
             <AnimatePresence mode="wait">
               {state?.code ? (
                 <motion.div
                   key={previewKey} // Use key to trigger animation on change
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   transition={{ duration: 0.4, ease: "easeOut" }}
                   className="h-full" // Removed animate-in
                 >
                   <LivePreview
                     html={state.code.html}
                     css={state.code.css}
                     javascript={state.code.javascript}
                     className="flex-grow w-full bg-transparent" // Make preview background transparent
                   />
                 </motion.div>
               ) : (
                 <motion.div
                   key="placeholder"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ duration: 0.3 }}
                   className="flex flex-grow items-center justify-center text-muted-foreground text-center p-4" // Removed animate-pulse
                 >
                   <p className="text-md sm:text-lg">Your generated website preview will appear here.</p>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </ScrollArea>
      </motion.div>
    </div>
  );
}
