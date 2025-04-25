// The use server directive is critical to Neon. Without it, Neon's edge functions will not work.
'use server';

/**
 * @fileOverview Generates website code based on a text prompt.
 *
 * - generateWebsiteCode - A function that handles the website code generation process.
 * - GenerateWebsiteCodeInput - The input type for the generateWebsiteCode function.
 * - GenerateWebsiteCodeOutput - The return type for the generateWebsiteCode function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateWebsiteCodeInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the desired website.'),
});
export type GenerateWebsiteCodeInput = z.infer<typeof GenerateWebsiteCodeInputSchema>;

const GenerateWebsiteCodeOutputSchema = z.object({
  html: z.string().describe('The generated HTML code for the website.'),
  css: z.string().describe('The generated CSS code for the website.'),
  javascript: z.string().describe('The generated JavaScript code for the website.'),
});
export type GenerateWebsiteCodeOutput = z.infer<typeof GenerateWebsiteCodeOutputSchema>;

export async function generateWebsiteCode(input: GenerateWebsiteCodeInput): Promise<GenerateWebsiteCodeOutput> {
  return generateWebsiteCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWebsiteCodePrompt',
  input: {
    schema: z.object({
      prompt: z.string().describe('A text prompt describing the desired website.'),
    }),
  },
  output: {
    schema: z.object({
      html: z.string().describe('The generated HTML code for the website.'),
      css: z.string().describe('The generated CSS code for the website.'),
      javascript: z.string().describe('The generated JavaScript code for the website.'),
    }),
  },
  prompt: `You are an expert web developer. Generate the HTML, CSS, and JavaScript code for a website based on the following description: {{{prompt}}}. Return the code in a JSON format:

{
  "html": "...",
  "css": "...",
  "javascript": "..."
}
`,
});

const generateWebsiteCodeFlow = ai.defineFlow<
  typeof GenerateWebsiteCodeInputSchema,
  typeof GenerateWebsiteCodeOutputSchema
>({
  name: 'generateWebsiteCodeFlow',
  inputSchema: GenerateWebsiteCodeInputSchema,
  outputSchema: GenerateWebsiteCodeOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
