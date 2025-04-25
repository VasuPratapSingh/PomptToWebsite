"use server";

import { generateWebsiteCode } from '@/ai/flows/generate-website-code';
import { z } from 'zod';
import type { GenerateWebsiteCodeOutput } from '@/ai/flows/generate-website-code';

const generateSchema = z.object({
  prompt: z.string().min(10, { message: "Prompt must be at least 10 characters long." }),
});

interface GenerateWebsiteState {
    message?: string | null;
    code?: GenerateWebsiteCodeOutput | null;
    errors?: {
      prompt?: string[];
    } | null;
}

export async function generateWebsiteAction(
    prevState: GenerateWebsiteState | undefined,
    formData: FormData
): Promise<GenerateWebsiteState> {

    const validatedFields = generateSchema.safeParse({
        prompt: formData.get('prompt'),
    });

    // Return errors if validation fails
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed. Please check the prompt.',
            code: null,
        };
    }

    const { prompt } = validatedFields.data;

    try {
        const result = await generateWebsiteCode({ prompt });
        return {
            message: "Website generated successfully!",
            code: result,
            errors: null,
         };
    } catch (error) {
        console.error("Error generating website:", error);
        // Check if error has a specific structure, otherwise return generic message
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during website generation.';
        return {
            message: `Generation failed: ${errorMessage}`,
            code: null,
            errors: null,
        };
    }
}
