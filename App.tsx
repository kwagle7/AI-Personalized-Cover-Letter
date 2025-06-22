
import React, { useState, useCallback, useEffect } from 'react';
import jsPDF from 'jspdf';
import { generateCoverLetter as callGeminiApi } from './services/geminiService';
import { LoadingSpinner } from './components/LoadingSpinner';
import { TextAreaField } from './components/TextAreaField';
import { Button } from './components/Button';
import { CopyIcon, CheckIcon, AlertTriangleIcon, DownloadIcon, UserIcon, MapPinIcon, PhoneIcon, MailIcon, LinkedinIcon, LinkIcon } from './components/Icons';
import { InputField } from './components/InputField';

const App: React.FC = () => {
  // Personal Information State
  const [fullName, setFullName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [linkedin, setLinkedin] = useState<string>('');
  const [website, setWebsite] = useState<string>('');

  const [resumeContent, setResumeContent] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  useEffect(() => {
    setIsFormValid(
      fullName.trim() !== '' &&
      email.trim() !== '' && 
      jobDescription.trim() !== ''
    );
  }, [fullName, email, jobDescription]);


  const handleGenerateCoverLetter = useCallback(async () => {
    if (!isFormValid) {
      setError('Please fill in your Full Name, Email, and the Job Description.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setCoverLetter('');
    setIsCopied(false);

    try {
      // System-level instruction about the persona and task.
      let systemInstruction = `You are an expert career advisor and an exceptionally creative professional writer.
Your sole task is to generate ONLY the text for a professional cover letter as described below.
Adhere strictly to all formatting and content guidelines. Do NOT include any conversational preamble,
self-correction, or any text that is not part of the cover letter itself.
The output MUST start directly with the cover letter content (e.g., a subject line or salutation).
The output MUST end directly with the cover letter closing phrase.
Output ONLY the cover letter.`;
      
      // User-facing prompt with details
      let userPrompt = `
Generate a highly compelling, modern, and personalized cover letter for ${fullName}.
The tone should be confident, enthusiastic, and engaging – think less like a stuffy traditional document and more like a direct, personable message that showcases personality.
Avoid clichés and overly formal phrases. If appropriate for the role and company, consider a brief, relevant storytelling element or a strong hook in the introduction.

Crucially, the entire cover letter, including all creative elements, formatting, and bullet points, MUST be extremely concise. Aim for a total word count of 220-320 words. The final output must comfortably fit on a single A4 page in PDF format with standard margins and specified font sizes (body text around 10.5pt).

The cover letter should be based on the following job description:
--- JOB DESCRIPTION START ---
${jobDescription}
--- JOB DESCRIPTION END ---
`;

      if (resumeContent.trim() !== '') {
        userPrompt += `

And the following resume:
--- RESUME START ---
${resumeContent}
--- RESUME END ---

When using the resume, focus on extracting relevant skills, experiences, and achievements that align with the job description.
`;
      } else {
        userPrompt += `
The candidate has not provided a resume. Generate the cover letter based on the job description, making general inferences about skills where appropriate, but lean into the creative and enthusiastic aspects.
`;
      }

      if (website.trim() !== '') {
        userPrompt += `
The candidate has provided a personal website/portfolio: ${website.trim()}.
Review this site. If it showcases a clear learning journey, unique projects, or a blog that powerfully reflects their passion and skills relevant to the role, weave this in naturally. If the portfolio content is strong and central to their candidacy for *this specific role*, you *may* consider creating a very brief, distinct section for it using a markdown heading like '## Portfolio Highlights:' or '## A Glimpse of My Work:', but only if it enhances the letter significantly and fits the strict single-page conciseness.
`;
      }

      userPrompt += `
Cover Letter Formatting and Content Rules (Strictly Follow):
1. Start DIRECTLY with the cover letter content (e.g., Subject line, or "Dear [Hiring Manager],"). NO PREAMBLE.
2. Clearly state the position being applied for (if discernible from the description).
3. Highlight how ${fullName}'s skills and experience match the job requirements in a creative, non-formulaic way.
4. Express genuine enthusiasm for the role and the company.
5. Maintain a professional yet dynamic and unique voice.
6. Be impeccably structured for readability and visual appeal in the final PDF. This includes an introduction, body, and conclusion.
7. For distinct sections (e.g., highlights, value proposition, or the optional portfolio snapshot), start the line for the section title with '## ' followed by the title (e.g., '## Key Strengths I Offer:').
8. For bullet points, start each bullet line with a hyphen "-" or asterisk "*" followed by a space (e.g., "- My skill" or "* Another skill"). Ensure bulleted lists are clearly delineated and the points themselves are concise.
9. For emphasis on key skills or achievements within paragraphs or bullet points, use markdown bold like **this** or __this__. Do not use bold for '##' section titles.
10. If a strong visual break is needed and fits the creative tone, insert a line containing only '---***---'. This will be rendered as a prominent graphical separator. Use sparingly (at most once or twice).
11. Conclude with a professional closing phrase such as "Sincerely," or "Warm regards,". Do NOT add a name after the closing phrase.
12. Ensure the ENTIRE output is ONLY the cover letter content itself, adhering to the single-page conciseness. NO EXTRA TEXT.

Begin Cover Letter Content Now:
`;
      // The Gemini service will combine systemInstruction and userPrompt appropriately.
      // For this example, let's combine them into a single prompt string if your service doesn't handle systemInstruction separately.
      const fullPrompt = `${systemInstruction}\n\n${userPrompt}`;

      const result = await callGeminiApi(fullPrompt);
      setCoverLetter(result);
    } catch (err) {
      console.error("Error generating cover letter:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Check console for details. Ensure your API_KEY is correctly configured.');
    } finally {
      setIsLoading(false);
    }
  }, [jobDescription, fullName, email, resumeContent, website, isFormValid]);

  const handleCopyToClipboard = useCallback(() => {
    if (coverLetter) {
      const textToCopy = `${coverLetter.trim()}\n\n${fullName}`;
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          setError('Failed to copy text to clipboard.');
        });
    }
  }, [coverLetter, fullName]);

  const handleDownloadPdf = useCallback(() => {
    if (!coverLetter || !fullName) {
        setError("Cover letter content or full name is missing for PDF generation.");
        return;
    }

    setIsDownloadingPdf(true);
    setError(null);

    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
      const margin = 20; // mm
      const textWidth = pageWidth - (margin * 2);
      let yPosition = margin;
      
      const headerColor = '#26A69A'; // Teal
      const bodyTextColor = '#1a202c'; // Darker gray for better contrast on white
      const defaultFontSize = 10.5; 
      const headingFontSize = 14; 
      const nameFontSize = 20;
      const contactFontSize = 9;
      const dateFontSize = 10;
      const bulletChar = "• ";
      const paragraphSpacingMM = 2; 
      const lineSpacingFactor = 1.15; 
      const bulletIndentFactor = 4; // mm, how much to indent bullet text

      // --- PDF Header ---
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(nameFontSize);
      doc.setTextColor(headerColor);
      doc.text(fullName, margin, yPosition);
      yPosition += (doc.getLineHeightFactor() * nameFontSize / doc.internal.scaleFactor) * 0.7;


      let linkedInText = linkedin.trim();
      if (linkedInText && !linkedInText.toLowerCase().startsWith('linkedin.com/in/') && !linkedInText.toLowerCase().startsWith('http')) {
        linkedInText = `linkedin.com/in/${linkedInText}`;
      } else if (linkedInText.toLowerCase().startsWith('http')) {
        // keep as is if full URL
      }

      const websiteText = website.trim();
      const formattedWebsite = websiteText ? (websiteText.startsWith('http') ? websiteText : `https://${websiteText}`) : '';

      const contactInfoParts = [
        location.trim(),
        phone.trim(),
        email.trim(),
        linkedInText ? linkedInText : '', 
        formattedWebsite
      ].filter(Boolean);
      const contactInfoString = contactInfoParts.join('  |  ');

      if (contactInfoString) {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(contactFontSize);
        doc.setTextColor(headerColor); 
        doc.text(contactInfoString, margin, yPosition);
        yPosition += (doc.getLineHeightFactor() * contactFontSize / doc.internal.scaleFactor) * 0.9;
      }
      
      yPosition += 2.5; 
      doc.setDrawColor(headerColor);
      doc.setLineWidth(0.5); 
      doc.line(margin, yPosition, pageWidth - margin, yPosition); 
      yPosition += 6; 

      // --- Date ---
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
      });
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(dateFontSize);
      doc.setTextColor(bodyTextColor); 
      doc.text(formattedDate, margin, yPosition);
      yPosition += (doc.getLineHeightFactor() * dateFontSize / doc.internal.scaleFactor) + 5; 


      // --- PDF Body ---
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(defaultFontSize);
      doc.setTextColor(bodyTextColor);
      doc.setLineHeightFactor(lineSpacingFactor);

      const calculateLineHeight = (fontSize: number, customLineSpacingFactor?: number) => (fontSize * (customLineSpacingFactor || doc.getLineHeightFactor())) / doc.internal.scaleFactor;
      let currentLineHeight = calculateLineHeight(defaultFontSize);

      const aiGeneratedContent = coverLetter.trim();
      const rawLines = aiGeneratedContent.split('\n');
      
      let isInsideBulletList = false;

      for (let i = 0; i < rawLines.length; i++) {
        let lineText = rawLines[i];
        
        if (yPosition > pageHeight - margin - currentLineHeight - ( (i === rawLines.length -1) ? calculateLineHeight(defaultFontSize) * 2.5 : 0 ) ) { 
           break; 
        }
        
        const trimmedLine = lineText.trim();
        const nextLineTrimmed = (i + 1 < rawLines.length) ? rawLines[i+1].trim() : null;
        
        const bulletRegex = /^\s*([\*\-])\s*(.*)/; // Regex to catch '*' or '-' bullets, possibly with no space after
        const bulletMatch = trimmedLine.match(bulletRegex);
       
        const isStartingNewBulletList = bulletMatch && !isInsideBulletList;
        const isEndingCurrentBulletList = isInsideBulletList && !bulletMatch && trimmedLine !== ""; // End list if not a bullet and not an empty line

        if (isStartingNewBulletList) {
            yPosition += paragraphSpacingMM * 0.5; // Slightly less space before a new bullet list starts
            isInsideBulletList = true;
        } else if (isEndingCurrentBulletList) {
            yPosition += paragraphSpacingMM * 0.75; 
            isInsideBulletList = false;
        }

        // 1. Decorative Separator
        if (trimmedLine === '---***---') {
            if (isInsideBulletList) { yPosition += paragraphSpacingMM; isInsideBulletList = false; }
            yPosition += currentLineHeight * 0.5; 
            if (yPosition > pageHeight - margin - 5) break;
            doc.setDrawColor(headerColor);
            doc.setLineWidth(0.8); 
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 5; 
            currentLineHeight = calculateLineHeight(defaultFontSize); 
            continue;
        }

        // 2. Markdown Heading (##)
        if (trimmedLine.startsWith('## ')) {
            if (isInsideBulletList) { yPosition += paragraphSpacingMM; isInsideBulletList = false; }
            const headingText = trimmedLine.substring(3).trim();
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(headingFontSize);
            doc.setTextColor(headerColor);
            currentLineHeight = calculateLineHeight(headingFontSize);
            yPosition += paragraphSpacingMM * 0.5; 
            if (yPosition + currentLineHeight > pageHeight - margin) break;
            
            const splitHeading = doc.splitTextToSize(headingText, textWidth);
            splitHeading.forEach((hLine: string) => {
                if (yPosition + currentLineHeight > pageHeight - margin) return;
                doc.text(hLine, margin, yPosition);
                yPosition += currentLineHeight;
            });

            doc.setFont('Helvetica', 'normal'); 
            doc.setFontSize(defaultFontSize);
            doc.setTextColor(bodyTextColor);
            currentLineHeight = calculateLineHeight(defaultFontSize);
            yPosition += paragraphSpacingMM * 0.75; 
            continue;
        }
        
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(defaultFontSize);
        doc.setTextColor(bodyTextColor);
        currentLineHeight = calculateLineHeight(defaultFontSize);

        // 3. Bullet Points (using regex match)
        let textToPrint = trimmedLine;
        let indent = 0;
        
        if (bulletMatch) {
            textToPrint = bulletMatch[2].trim(); // Content of the bullet point
            indent = bulletIndentFactor; 
        }

        const splitLines = doc.splitTextToSize(textToPrint, textWidth - indent);

        splitLines.forEach((subLine: string, subLineIndex: number) => {
            if (yPosition + currentLineHeight > pageHeight - margin - ( (i === rawLines.length -1 && subLineIndex === splitLines.length -1) ? calculateLineHeight(defaultFontSize) * 2.5 : 0 ) ) {
                return; 
            }

            let currentX = margin;
            if (bulletMatch) {
                if (subLineIndex === 0) { 
                    doc.text(bulletChar, currentX, yPosition);
                }
                currentX += indent; 
            }
            
            const parts = subLine.split(/(\*\*.*?\*\*|__.*?__)/g).filter((part: string) => part); 
            parts.forEach((part: string) => {
                const effectiveTextWidth = textWidth - (currentX - margin);
                if (effectiveTextWidth <= 0) return;

                if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
                    doc.setFont('Helvetica', 'bold');
                    const boldText = part.substring(2, part.length - 2);
                    doc.text(boldText, currentX, yPosition, { maxWidth: effectiveTextWidth });
                    currentX += doc.getStringUnitWidth(boldText) * defaultFontSize / doc.internal.scaleFactor;
                } else {
                    doc.setFont('Helvetica', 'normal');
                    doc.text(part, currentX, yPosition, { maxWidth: effectiveTextWidth });
                    currentX += doc.getStringUnitWidth(part) * defaultFontSize / doc.internal.scaleFactor;
                }
            });
            yPosition += currentLineHeight;
        });
        
        if (!bulletMatch && trimmedLine !== "") { 
             yPosition += paragraphSpacingMM * 0.25; // Less spacing after normal lines to be tight
        } else if (bulletMatch && nextLineTrimmed !== null && !(nextLineTrimmed.match(bulletRegex))) {
            // This was the last item of a bullet list that has non-bullet text following it
             yPosition += paragraphSpacingMM * 0.5; 
             isInsideBulletList = false; 
        }
         if (trimmedLine === "" && nextLineTrimmed !== null && nextLineTrimmed !== "") { 
             yPosition += paragraphSpacingMM * 0.75;
         }


      } 
      
      if (yPosition + calculateLineHeight(defaultFontSize) * 2.5 < pageHeight - margin) { 
        yPosition += calculateLineHeight(defaultFontSize) * 0.5; 
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(defaultFontSize);
        doc.setTextColor(bodyTextColor);
        doc.text(fullName, margin, yPosition);
      } else {
        // console.warn("Not enough space to append name at the end of the PDF.");
      }

      // Create a filename with the user's full name and current date
      const safeFullName = fullName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
      const filename = `cover-letter-${safeFullName}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      doc.save(filename);

    } catch (e) {
      console.error("Error generating PDF:", e);
      setError("Failed to generate PDF. Please try again or check the console for details.");
      if (e instanceof Error) {
        console.error(e.stack);
      }
    } finally {
      setIsDownloadingPdf(false);
    }
  }, [coverLetter, fullName, location, phone, email, linkedin, website]);


  const allInputsDisabled = isLoading || isDownloadingPdf;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Cover Letter Generator</h1>
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <span>Powered by AI</span>
            <span className="mx-2">•</span>
            <span>Create a tailored cover letter in seconds</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Personal Info Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                id="fullName"
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                disabled={allInputsDisabled}
                required
              />
              <InputField
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                disabled={allInputsDisabled}
                required
              />
              <InputField
                id="phone"
                label="Phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(123) 456-7890"
                disabled={allInputsDisabled}
              />
              <InputField
                id="linkedin"
                label="LinkedIn Profile"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="linkedin.com/in/yourprofile"
                disabled={allInputsDisabled}
              />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                className="border-b-2 border-indigo-500 text-indigo-600 px-4 py-4 text-sm font-medium"
              >
                Cover Letter
              </button>
              <button
                className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-4 py-4 text-sm font-medium"
                disabled
              >
                Resume (Coming Soon)
              </button>
            </nav>
          </div>

          <div className="px-4 py-5 sm:p-6">
            {/* Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side - Job Description */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700">
                    Job Description
                  </label>
                  <span className="text-xs text-gray-500">
                    {jobDescription.length} characters
                  </span>
                </div>
                <div className="mt-1">
                  <TextAreaField
                    id="jobDescription"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    rows={16}
                    disabled={allInputsDisabled}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="mt-4">
                  <Button
                    onClick={handleGenerateCoverLetter}
                    disabled={!isFormValid || allInputsDisabled}
                    className="w-full justify-center"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner className="w-5 h-5 mr-2" />
                        Generating...
                      </>
                    ) : (
                      'Generate Cover Letter'
                    )}
                  </Button>
                </div>
              </div>

              {/* Right Side - Generated Cover Letter */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Generated Cover Letter
                  </label>
                  {coverLetter && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCopyToClipboard}
                        disabled={isCopied}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {isCopied ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={handleDownloadPdf}
                        disabled={isDownloadingPdf}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Download PDF
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-1">
                  {coverLetter ? (
                    <div className="h-[500px] overflow-y-auto p-4 border border-gray-300 rounded-md bg-gray-50">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
                        {coverLetter}
                      </pre>
                    </div>
                  ) : (
                    <div className="h-[500px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No cover letter generated yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Paste a job description and click "Generate Cover Letter" to get started.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Resume Textarea (for form validation) */}
        <div className="hidden">
          <TextAreaField
            id="resumeContent"
            value={resumeContent}
            onChange={(e) => setResumeContent(e.target.value)}
          />
        </div>

      </main>

      {/* Error Alert */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-md">
          <div className="rounded-md bg-red-50 p-4 shadow-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error generating cover letter</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Cover Letter Generator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
