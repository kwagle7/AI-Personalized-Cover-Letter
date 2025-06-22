
export const generateCoverLetter = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch('/api/generate-cover-letter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to generate cover letter');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error generating cover letter:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unknown error occurred while generating the cover letter.');
  }
};
