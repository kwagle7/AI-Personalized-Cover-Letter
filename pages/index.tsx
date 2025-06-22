import { useState } from 'react';
import Head from 'next/head';
import { generateCoverLetter } from '../services/geminiService';

export default function Home() {
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [allInputsDisabled, setAllInputsDisabled] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !jobTitle || !company) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');
    setCoverLetter('');
    setAllInputsDisabled(true);

    try {
      const prompt = `Write a professional cover letter for ${fullName} applying for the position of ${jobTitle} at ${company}. 
        Skills: ${skills}. Experience: ${experience}. 
        Make it concise, professional, and tailored to the job.`;
      
      const response = await generateCoverLetter(prompt);
      setCoverLetter(response);
    } catch (err) {
      console.error('Error generating cover letter:', err);
      setError('Failed to generate cover letter. Please try again.');
    } finally {
      setIsLoading(false);
      setAllInputsDisabled(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!coverLetter) return;
    
    try {
      await navigator.clipboard.writeText(coverLetter);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownloadPdf = async () => {
    if (!coverLetter || !fullName) return;
    
    setIsDownloadingPdf(true);
    
    try {
      // Dynamically import jsPDF to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      
      // Add cover letter content
      const splitText = doc.splitTextToSize(coverLetter, 180);
      doc.setFont('helvetica');
      doc.setFontSize(12);
      doc.text(splitText, 15, 20);
      
      // Create a filename with the user's full name and current date
      const safeFullName = fullName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
      const filename = `cover-letter-${safeFullName}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Save the PDF
      doc.save(filename);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <Head>
        <title>AI Cover Letter Generator</title>
        <meta name="description" content="Generate personalized cover letters with AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-sky-300">
          AI-Powered Cover Letter Generator
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800/50 p-6 rounded-lg border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-1">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={allInputsDisabled}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="John Doe"
                required
              />
            </div>
            
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-300 mb-1">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                disabled={allInputsDisabled}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="Software Engineer"
                required
              />
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-slate-300 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={allInputsDisabled}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="Tech Corp Inc."
                required
              />
            </div>
            
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-slate-300 mb-1">
                Your Skills (comma separated)
              </label>
              <input
                type="text"
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                disabled={allInputsDisabled}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="JavaScript, React, Node.js"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-slate-300 mb-1">
              Your Experience (brief summary)
            </label>
            <textarea
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              disabled={allInputsDisabled}
              rows={3}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="5+ years of experience in web development with a focus on frontend technologies..."
            />
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isLoading || allInputsDisabled}
              className={`px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-md transition-colors ${
                (isLoading || allInputsDisabled) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                '✨ Generate Cover Letter'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-700/30 border border-red-500 text-red-300 rounded-lg flex items-start space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-semibold">Operation Failed</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {coverLetter && !isLoading && (
          <div className="mt-8 p-6 bg-slate-700/50 border border-slate-600 rounded-lg shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3 sm:gap-0">
              <h2 className="text-2xl font-semibold text-sky-300">Your Generated Cover Letter:</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={handleCopyToClipboard} 
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    isCopied 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-slate-600 hover:bg-slate-500'
                  } transition-colors`}
                  disabled={allInputsDisabled}
                >
                  {isCopied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy Text
                    </>
                  )}
                </button>
                <button 
                  onClick={handleDownloadPdf} 
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-md flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={allInputsDisabled || !fullName.trim()}
                >
                  {isDownloadingPdf ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: coverLetter.replace(/\n/g, '<br />') }} />
            </div>
          </div>
        )}
      </main>
      
      <footer className="mt-12 text-center text-sm text-slate-500">
        <p>AI-Powered Cover Letter Generator - {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
