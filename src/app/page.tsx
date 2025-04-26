

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useActionState } from "react"; // Use react's useActionState
import { useFormStatus } from "react-dom"; // Keep useFormStatus from react-dom
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { generateWebsiteAction } from "./actions";
import { PromptSuggestions } from "@/components/prompt-suggestions";
import { LivePreview } from "@/components/live-preview";
import { ChatBot } from "@/components/chat-bot";
import { Wand2, Download, Loader2, Sparkles, Mic, MicOff, Maximize, Minimize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { cn } from "@/lib/utils";
import { promptExamples } from "@/lib/prompt-examples";


const initialState = {
  message: null,
  code: null,
  errors: null,
};

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition | undefined;
    webkitSpeechRecognition: typeof SpeechRecognition | undefined;
  }
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      whileHover={{ scale: 1.03, y: -2, boxShadow: "0px 5px 15px hsla(var(--primary)/0.2)" }}
      whileTap={{ scale: 0.97, y: 0, boxShadow: "0px 2px 8px hsla(var(--primary)/0.1)" }}
      className="w-full sm:w-auto"
    >
      <Button
        type="submit"
        disabled={pending}
        aria-disabled={pending}
        className="w-full sm:w-auto transition-all duration-300 ease-in-out flex items-center justify-center shadow-md hover:shadow-lg bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:from-[hsl(var(--primary)/0.9)] hover:to-[hsl(var(--accent)/0.9)] text-primary-foreground px-4 py-2 text-sm sm:text-base" // Adjusted padding/text size
      >
        {pending ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mr-2"
            >
              <Loader2 className="h-4 w-4" />
            </motion.div>
             Generating...
          </>
        ) : (
          <>
             <motion.div
               initial={{ scale: 0, rotate: -90 }}
               animate={{ scale: 1, rotate: 0 }}
               transition={{ delay: 0.2, type: "spring", stiffness: 500, damping: 20 }}
               className="mr-2"
             >
              <Wand2 className="h-4 w-4" />
             </motion.div>
            Generate Website
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
    zip.file("index.html", code.html || "");
    zip.file("style.css", code.css || "");
    zip.file("script.js", code.javascript || "");

    try {
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "website.zip"); // Use file-saver's saveAs
    } catch (error) {
      console.error("Error creating zip file:", error);
    }
  };

  return (
    <AnimatePresence>
        {code?.html && (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                whileHover={{ scale: 1.03, y: -2, boxShadow: "0px 5px 15px hsla(var(--foreground)/0.1)" }}
                whileTap={{ scale: 0.97, y: 0, boxShadow: "0px 2px 8px hsla(var(--foreground)/0.05)" }}
                transition={{ type: "spring", stiffness: 400, damping: 17, delay: 0.45 }} // Slight delay
                className="w-full sm:w-auto"
            >
            <Button
                variant="outline"
                onClick={handleDownload}
                className="w-full sm:w-auto transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg px-4 py-2 text-sm sm:text-base" // Adjusted padding/text size
                aria-label="Download website code as ZIP"
            >
                 <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 500, damping: 20 }}
                    className="mr-2"
                 >
                    <Download className="h-4 w-4" />
                 </motion.div>
                Download Code
            </Button>
            </motion.div>
        )}
    </AnimatePresence>
  );
}


export default function Home() {
  const [state, formAction] = useActionState(generateWebsiteAction, initialState);
  const [promptValue, setPromptValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [speechApiSupported, setSpeechApiSupported] = useState(false);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false); // State for fullscreen preview

  useEffect(() => {
      // Check for SpeechRecognition API support on component mount
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
          setSpeechApiSupported(true);
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = true; // Keep listening even after pauses
          recognitionRef.current.interimResults = true; // Get results as they come

          recognitionRef.current.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
             // Update textarea with combined interim and final results for live feedback
            setPromptValue(prev => prev + finalTranscript + interimTranscript);
          };

          recognitionRef.current.onerror = (event) => {
              console.error('Speech recognition error', event.error);
              let errorMessage = `Speech recognition error: ${event.error}`;
              if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
              } else if (event.error === 'no-speech') {
                errorMessage = 'No speech detected. Please try speaking again.';
              }
              toast({ title: "Error", description: errorMessage, variant: "destructive" });
              setIsRecording(false); // Ensure recording state is reset on error
          };

          recognitionRef.current.onend = () => {
            // Only set isRecording to false if it wasn't intentionally stopped
            // This prevents flicker if stopRecording is called manually
             if (recognitionRef.current && recognitionRef.current.continuous) {
                // If continuous is true and it ends, it might be due to an error or timeout,
                // try restarting unless explicitly stopped. Check isRecording state.
                if (isRecording) {
                    // Attempt to restart if still meant to be recording
                    // recognitionRef.current.start();
                    // console.log("Recognition ended unexpectedly, trying to restart.");
                    // Note: Auto-restarting can lead to loops or unexpected behavior.
                    // It might be better to just stop and inform the user.
                     setIsRecording(false);
                     console.log("Speech recognition ended.");
                }
             } else {
                setIsRecording(false);
                console.log("Speech recognition ended.");
             }
          };
      } else {
        setSpeechApiSupported(false);
        console.warn('Speech Recognition API not supported in this browser.');
      }

      // Cleanup function to stop recognition if component unmounts while recording
      return () => {
          if (recognitionRef.current) {
              recognitionRef.current.stop();
              recognitionRef.current = null; // Clean up ref
              console.log("Speech recognition stopped on component unmount.");
          }
      };
  }, [toast, isRecording]); // Re-run effect if toast or isRecording changes (though isRecording dependency is mainly for onend logic)


   // Handle Escape key to exit fullscreen
   useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isPreviewFullscreen) {
        setIsPreviewFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPreviewFullscreen]);


  const handleToggleRecording = () => {
      if (!speechApiSupported) {
          toast({ title: "Unsupported Feature", description: "Voice input is not supported by your browser.", variant: "destructive" });
          return;
      }
      if (!recognitionRef.current) {
          toast({ title: "Error", description: "Speech recognition service not initialized.", variant: "destructive" });
          return;
      }

      if (isRecording) {
          recognitionRef.current.stop();
          setIsRecording(false);
          console.log("Stopped recording.");
      } else {
          // Clear previous prompt before starting new recording? Optional.
          // setPromptValue("");
          try {
              recognitionRef.current.start();
              setIsRecording(true);
              console.log("Started recording.");
              toast({ title: "Recording Started", description: "Speak into your microphone.", variant: "default" });
          } catch (error) {
              console.error("Error starting speech recognition:", error);
              toast({ title: "Error", description: "Could not start voice recording.", variant: "destructive" });
              setIsRecording(false);
          }
      }
  };

  useEffect(() => {
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

  const toggleFullscreenPreview = () => {
      setIsPreviewFullscreen(!isPreviewFullscreen);
  }


  return (
    <div className={cn(
        "relative flex flex-col md:flex-row min-h-screen h-screen max-h-screen overflow-hidden transition-all duration-300 ease-in-out", // Ensure h-screen and max-h-screen
        isPreviewFullscreen ? "bg-background" : "" // Adjust background for fullscreen
    )}>
        {/* Left Panel: Prompt Input */}
        <AnimatePresence>
        {!isPreviewFullscreen && (
            <motion.div
                initial={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
                className="w-full md:w-1/2 lg:w-2/5 xl:w-1/3 h-full md:max-h-screen overflow-y-auto md:overflow-y-hidden" // Adjusted widths for different screens, allow vertical scroll on small screens
            >
                <ScrollArea className="h-full"> {/* Ensure ScrollArea takes full height */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="p-4 sm:p-6 lg:p-8 flex flex-col min-h-full" // Adjusted padding, min-h-full to allow stretching
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="flex flex-col flex-grow" // Ensure this div grows
                        >
                            <Card className="flex flex-col flex-grow overflow-hidden shadow-lg rounded-xl backdrop-blur-md bg-card/70 border border-border/50 transition-all duration-300 hover:shadow-xl">
                                <CardHeader className="flex-shrink-0 pb-2 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6"> {/* Adjusted padding */}
                                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl font-bold"> {/* Adjusted text size */}
                                        <motion.div
                                            animate={{ rotate: [0, 15, -10, 15, 0], scale: [1, 1.1, 1, 1.1, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 0.5 }}
                                        >
                                            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> {/* Adjusted icon size */}
                                        </motion.div>
                                        PromptToSite
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm md:text-base">Describe the website you want to create, or try a preset.</CardDescription> {/* Adjusted text size */}
                                </CardHeader>
                                <CardContent className="flex flex-col flex-grow gap-3 sm:gap-4 p-4 sm:p-6 pt-0"> {/* Adjusted padding and gap */}
                                    <form action={formAction} ref={formRef} className="flex flex-col flex-grow gap-3 sm:gap-4"> {/* Adjusted gap */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: 0.2 }}
                                            className="flex flex-col flex-grow gap-1 sm:gap-1.5 relative" // Adjusted gap
                                        >
                                            <Label htmlFor="prompt" className="text-sm sm:text-base md:text-lg font-semibold">Your Prompt</Label> {/* Adjusted text size */}
                                            <div className="relative flex-grow flex items-start"> {/* Use flex to align items */}
                                                <Textarea
                                                    id="prompt"
                                                    name="prompt"
                                                    placeholder="e.g., Create a sleek landing page for a mobile app..." // Shortened placeholder for small screens
                                                    className="min-h-[120px] sm:min-h-[150px] md:min-h-[200px] lg:min-h-[250px] flex-grow resize-none text-sm sm:text-base rounded-lg shadow-inner bg-input/80 backdrop-blur-sm transition-shadow focus:shadow-md focus:ring-2 focus:ring-ring/50 pr-10 sm:pr-12" // Adjusted min-height, text size, padding-right
                                                    value={promptValue}
                                                    onChange={handleInputChange}
                                                    onFocus={handleTextareaFocus}
                                                    onBlur={handleTextareaBlur}
                                                    aria-describedby="prompt-error"
                                                    required
                                                />
                                                {/* Voice Input Button */}
                                                {speechApiSupported && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.5 }}
                                                        className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2" // Adjusted position
                                                    >
                                                        <Button
                                                            type="button"
                                                            variant={isRecording ? "destructive" : "ghost"}
                                                            size="icon"
                                                            onClick={handleToggleRecording}
                                                            className={cn(
                                                                "rounded-full h-7 w-7 sm:h-8 sm:w-8 transition-colors duration-200", // Adjusted size
                                                                isRecording ? "bg-red-500/80 hover:bg-red-600/80 text-white animate-pulse" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                                            )}
                                                            aria-label={isRecording ? "Stop recording" : "Start recording"}
                                                        >
                                                            {isRecording ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />} {/* Adjusted icon size */}
                                                        </Button>
                                                    </motion.div>
                                                )}
                                                <AnimatePresence>
                                                    {showSuggestions && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="absolute z-10 mt-1 w-full top-full" // Position below textarea
                                                            style={{ maxWidth: 'calc(100% - 1rem)' }} // Adjusted max width
                                                        >
                                                            <PromptSuggestions
                                                                inputValue={promptValue}
                                                                onSelectSuggestion={handleSelectSuggestion}
                                                                isVisible={showSuggestions}
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
                                                    className="text-xs sm:text-sm font-medium text-destructive" // Adjusted text size
                                                >
                                                    {state.errors.prompt[0]}
                                                </motion.p>
                                            )}
                                        </motion.div>

                                        {/* Preset Prompts Section */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: 0.3 }}
                                            className="mt-3 sm:mt-4 flex-shrink-0" // Adjusted margin
                                        >
                                            <Label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">Try these examples:</Label> {/* Adjusted text size and margin */}
                                            <div className="flex flex-wrap gap-1.5 sm:gap-2"> {/* Adjusted gap */}
                                                {promptExamples.map((example, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 17, delay: 0.1 + index * 0.05 }} // Staggered spring animation
                                                        whileHover={{ scale: 1.05, y: -1, boxShadow: "0px 3px 10px hsla(var(--foreground)/0.1)" }}
                                                        whileTap={{ scale: 0.95, y: 0, boxShadow: "0px 1px 5px hsla(var(--foreground)/0.05)" }}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handlePresetClick(example)}
                                                            className="transition-all duration-150 ease-in-out text-[10px] sm:text-xs shadow-sm hover:shadow backdrop-blur-sm bg-background/60 hover:bg-accent/20 px-2 py-1 sm:px-3" // Adjusted text size and padding
                                                            aria-label={`Use preset prompt: ${example}`}
                                                        >
                                                            {example.length > 30 ? `${example.substring(0, 27)}...` : example} {/* Shortened text further */}
                                                        </Button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>

                                        {/* Buttons container at the bottom */}
                                        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 justify-start items-center mt-auto pt-3 sm:pt-4 border-t border-border/50 flex-shrink-0"> {/* Adjusted gap, padding */}
                                            <SubmitButton />
                                            <DownloadButton code={state?.code} />
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                </ScrollArea>
            </motion.div>
        )}
        </AnimatePresence>


        {/* Right Panel: Live Preview */}
         <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: isPreviewFullscreen ? 0 : 0.2 }} // Adjust delay based on fullscreen
                className={cn(
                    "w-full md:w-1/2 lg:w-3/5 xl:w-2/3 md:max-h-screen flex flex-col relative transition-all duration-300 ease-in-out h-full", // Adjusted widths, ensure h-full
                    isPreviewFullscreen ? "md:w-full fixed inset-0 z-40 p-0" : "p-4 sm:p-6 lg:p-8" // Adjusted padding
                )}
            >
             {/* Fullscreen Toggle Button */}
              <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className={cn(
                        "absolute top-4 right-4 sm:top-6 sm:right-6 z-50", // Adjusted position
                        isPreviewFullscreen ? "top-4 right-4 sm:top-6 sm:right-6" : "top-6 right-6 md:top-8 md:right-8 lg:top-10 lg:right-10" // Further adjusted position
                    )}
                >
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={toggleFullscreenPreview}
                        className="rounded-full h-8 w-8 sm:h-9 sm:w-9 bg-card/70 hover:bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all" // Adjusted size
                        aria-label={isPreviewFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                        {isPreviewFullscreen ? <Minimize className="h-4 w-4 sm:h-5 sm:w-5" /> : <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />} {/* Adjusted icon size */}
                    </Button>
                </motion.div>
            <ScrollArea className={cn(
                "w-full h-full rounded-xl border border-border/50 bg-card/60 backdrop-blur-md shadow-inner transition-shadow hover:shadow-lg",
                isPreviewFullscreen ? "rounded-none border-0 shadow-none" : ""
             )}>
                {/* Ensure inner div takes full height */}
                <div className="flex flex-col h-full p-1 min-h-0"> {/* Added min-h-0 to prevent infinite height issues */}
                    <AnimatePresence mode="wait">
                        {state?.code ? (
                            <motion.div
                                key={previewKey}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="h-full flex-grow" // Ensure div takes full height
                            >
                                <LivePreview
                                    html={state.code.html}
                                    css={state.code.css}
                                    javascript={state.code.javascript}
                                    // className adjusted inside LivePreview
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-grow items-center justify-center h-full text-muted-foreground text-center p-4" // Ensure h-full
                            >
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: [0.8, 1.05, 1], opacity: 1 }}
                                    transition={{ duration: 0.7, ease: 'backOut', delay: 0.5 }} // Added delay
                                    className="flex flex-col items-center gap-2"
                                >
                                    <Sparkles size={36} className="text-muted-foreground/50 sm:size-48" /> {/* Adjusted size */}
                                    <p className="text-sm sm:text-base md:text-lg">Your generated website preview will appear here.</p> {/* Adjusted text size */}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </ScrollArea>
        </motion.div>


      {/* ChatBot Component - Render outside fullscreen mode */}
      <AnimatePresence>
          {!isPreviewFullscreen && <ChatBot />}
      </AnimatePresence>
    </div>
  );
}
