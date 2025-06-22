
interface GenerateCoverLetterResponse {
  text: string;
  error?: string;
  details?: string;
}

export const generateCoverLetter = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch('/api/generate-cover-letter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const data: GenerateCoverLetterResponse = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || 'Failed to generate cover letter');
    }

    if (!data.text) {
      throw new Error('No content was generated');
    }

    return data.text;
  } catch (error) {
    console.error('Error generating cover letter:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unknown error occurred while generating the cover letter.');
  }
};
