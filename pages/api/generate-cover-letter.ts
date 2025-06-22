import { GoogleGenAI } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize the Google Generative AI client
const apiKey = process.env.GEMINI_API_KEY as string;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set');
  process.exit(1);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing required field: prompt' });
    }

    // Initialize the Gemini API
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash-preview-04-17';
    
    // Generate content
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    // Extract text from the response
    const text = response.text;
    if (typeof text !== 'string') {
      throw new Error('Unexpected response format from Gemini API');
    }

    return res.status(200).json({ text: text.trim() });
  } catch (error) {
    console.error('--- ERROR in generate-cover-letter function ---');
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return res.status(500).json({
      error: 'Failed to generate cover letter',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
