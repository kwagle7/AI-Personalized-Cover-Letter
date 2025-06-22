
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// IMPORTANT: The API key MUST be set in the environment variable process.env.API_KEY
// This application assumes process.env.API_KEY is available in the execution environment.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY environment variable not found. Please ensure it is set.");
  // In a real app, you might prevent initialization or throw a more specific error.
  // For this exercise, we proceed, and the API call will fail if the key is truly missing.
}

const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_API_KEY" }); // Fallback to prevent crash if undefined, API will reject it.

const model = 'gemini-2.5-flash-preview-04-17';

export const generateCoverLetter = async (jobDescriptionPrompt: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("Gemini API Key is not configured. Please set the API_KEY environment variable.");
  }
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: jobDescriptionPrompt,
      // No specific thinkingConfig, use default for higher quality.
      // No specific systemInstruction here, as it's part of the prompt.
    });

    // Extract text directly from the response object
    const text = response.text;
    if (typeof text !== 'string') {
        console.error("Unexpected response format from Gemini API:", response);
        throw new Error("Received an unexpected response format from the AI. Expected a text string.");
    }
    return text.trim();

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error) {
        // Check for common API key related errors (this is a guess, actual error messages may vary)
        if (error.message.includes('API key not valid') || error.message.includes('permission denied')) {
            throw new Error('There was an issue with the API key. Please ensure it is correct and has the necessary permissions.');
        }
        throw new Error(`Failed to generate cover letter: ${error.message}`);
    }
    throw new Error('An unknown error occurred while contacting the AI service.');
  }
};
