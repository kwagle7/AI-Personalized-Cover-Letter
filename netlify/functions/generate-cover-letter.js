const { GoogleGenAI } = require('@google/genai');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error: Missing GEMINI_API_KEY' }),
      };
    }

    const { prompt } = JSON.parse(event.body);
    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required field: prompt' }),
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.0-flash';
    //const model = 'gemini-2.5-flash-preview-04-17';

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    // Extract text from the response
    const text = response.text;
    if (typeof text !== 'string') {
      throw new Error('Unexpected response format from Gemini API');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ text: text.trim() }),
    };
  } catch (error) {
    console.error('--- ERROR in generate-cover-letter function ---');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to generate cover letter',
        details: error.message 
      }),
    };
  }
};
