
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Removed CardDescription as it's not used
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Bot, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
    sender: 'bot' | 'user';
    text: string;
}

const initialMessages: Message[] = [
    { sender: 'bot', text: "Hello! 👋 How can I help you generate your website today?" },
    { sender: 'bot', text: "Try typing a description in the prompt box on the left, like 'Create a landing page for a coffee shop'." },
    { sender: 'bot', text: "You can also click one of the example prompts to get started quickly!" },
];

export function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages] = useState<Message[]>(initialMessages); // Removed setMessages as it's not used

    // Placeholder for future input handling if needed
    // const handleSendMessage = (text: string) => {
    //   setMessages([...messages, { sender: 'user', text }]);
    //   // Add bot response logic here
    // };

    return (
        // AnimatePresence handles the mounting/unmounting animation
        <AnimatePresence>
            {/* Conditionally render the Popover based on visibility (optional, Popover handles its own open state) */}
            <motion.div
                initial={{ opacity: 0, y: 50 }} // Start off-screen and invisible
                animate={{ opacity: 1, y: 0 }} // Animate to visible and on-screen
                exit={{ opacity: 0, y: 50 }} // Animate out
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="fixed bottom-6 right-6 z-50" // Ensure positioning
            >
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Button
                                variant="default" // Use primary color
                                size="icon"
                                className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center bg-gradient-to-br from-primary to-accent hover:from-primary/90 hover:to-accent/90" // Added gradient
                                aria-label="Toggle Chat Bot"
                            >
                                <AnimatePresence mode="wait">
                                    {isOpen ? (
                                        <motion.div key="close" initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: 90, scale: 0 }}>
                                            <X className="h-6 w-6" />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="open" initial={{ rotate: 90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: -90, scale: 0 }}>
                                            <MessageSquare className="h-6 w-6" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Button>
                        </motion.div>
                    </PopoverTrigger>
                    <PopoverContent
                        side="top"
                        align="end"
                        className="w-80 md:w-96 p-0 border-none shadow-xl rounded-xl bg-transparent backdrop-blur-xl mr-2 mb-1" // Align popover slightly off the button
                        sideOffset={10} // Add space between trigger and popover
                    >
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                >
                                    {/* Use Card for structure and consistent styling */}
                                    <Card className="border-none bg-card/80 backdrop-blur-md overflow-hidden rounded-xl">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4 border-b bg-card/90">
                                            <div className="flex items-center gap-2">
                                                <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                                                    <Bot className="h-5 w-5 text-primary" />
                                                </motion.div>
                                                <CardTitle className="text-lg font-semibold">Help Bot</CardTitle>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
                                                <X className="h-4 w-4" />
                                                <span className="sr-only">Close chat</span>
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <ScrollArea className="h-72 p-4">
                                                <div className="space-y-4">
                                                    {messages.map((message, index) => (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ opacity: 0, x: message.sender === 'user' ? 20 : -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                                            className={cn(
                                                                "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm shadow-sm", // Added shadow-sm
                                                                message.sender === 'user'
                                                                    ? "ml-auto bg-primary text-primary-foreground"
                                                                    : "bg-muted"
                                                            )}
                                                        >
                                                            {message.text}
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                            {/* Placeholder for input if needed later
                                            <div className="p-4 border-t">
                                                Input area
                                            </div>
                                            */}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </PopoverContent>
                </Popover>
            </motion.div>
        </AnimatePresence>
    );
}
