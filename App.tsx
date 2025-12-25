
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ExamAnalysis } from './types';
import { analyzeExamMaterial, FileData } from './services/geminiService';
import { ResultView } from './components/ResultView';

interface UploadedFile {
  file: File;
  preview: string;
}

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'input'>('landing');
  const [darkMode, setDarkMode] = useState(false);
  const [syllabus, setSyllabus] = useState('');
  const [questions, setQuestions] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ExamAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // File states
  const [syllabusFiles, setSyllabusFiles] = useState<UploadedFile[]>([]);
  const [questionFiles, setQuestionFiles] = useState<UploadedFile[]>([]);

  const syllabusInputRef = useRef<HTMLInputElement>(null);
  const questionInputRef = useRef<HTMLInputElement>(null);

  const toggleTheme = () => setDarkMode(!darkMode);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'syllabus' | 'question') => {
    const files = Array.from(e.target.files || []) as File[];
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    if (type === 'syllabus') {
      setSyllabusFiles(prev => [...prev, ...newFiles]);
    } else {
      setQuestionFiles(prev => [...prev, ...newFiles]);
    }
    if (e.target) e.target.value = '';
  };

  const removeFile = (index: number, type: 'syllabus' | 'question') => {
    if (type === 'syllabus') {
      setSyllabusFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setQuestionFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleAnalyze = async () => {
    const hasSyllabus = syllabus.trim() || syllabusFiles.length > 0;
    const hasQuestions = questions.trim() || questionFiles.length > 0;

    if (!hasSyllabus || !hasQuestions) {
      setError("Please provide both syllabus and past questions to continue.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const syllabusParts: FileData[] = await Promise.all(
        syllabusFiles.map(async (f) => ({
          inlineData: {
            data: await fileToBase64(f.file),
            mimeType: f.file.type
          }
        }))
      );

      const questionParts: FileData[] = await Promise.all(
        questionFiles.map(async (f) => ({
          inlineData: {
            data: await fileToBase64(f.file),
            mimeType: f.file.type
          }
        }))
      );

      const result = await analyzeExamMaterial(syllabus, questions, syllabusParts, questionParts);
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = useCallback(() => {
    setAnalysisResult(null);
    setSyllabus('');
    setQuestions('');
    setSyllabusFiles([]);
    setQuestionFiles([]);
    setError(null);
    setView('input');
  }, []);

  const ThemeToggle = () => (
    <button 
      onClick={toggleTheme}
      className={`p-2.5 rounded-xl transition-all border ${
        darkMode 
          ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700' 
          : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-50'
      } shadow-sm`}
      aria-label="Toggle Theme"
    >
      {darkMode ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
      )}
    </button>
  );

  const Footer = () => (
    <footer className={`py-12 border-t mt-20 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <a 
            href="https://www.linkedin.com/in/murugayesu-arularasan-754034326" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`${darkMode ? 'text-slate-500 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-600'} transition-colors`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          </a>
          <a 
            href="https://github.com/Murugayesu" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`${darkMode ? 'text-slate-500 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-600'} transition-colors`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
        </div>
        <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Developed by <a href="https://www.linkedin.com/in/murugayesu-arularasan-754034326" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">Murugayesu Arularasan</a>
        </p>
        <p className={`text-xs ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>© 2025 ExamSense AI. Powered by Advanced Intelligence.</p>
      </div>
    </footer>
  );

  if (analysisResult) {
    return (
      <div className={`min-h-screen transition-colors ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <div className="max-w-7xl mx-auto px-4 pt-4 flex justify-end">
          <ThemeToggle />
        </div>
        <ResultView data={analysisResult} onReset={handleReset} />
        <Footer />
      </div>
    );
  }

  if (view === 'landing') {
    return (
      <div className={`min-h-screen transition-colors ${darkMode ? 'bg-slate-950' : 'bg-white'}`}>
        <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
            <span className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>ExamSense AI</span>
          </div>
          <ThemeToggle />
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className={`inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase rounded-full ${darkMode ? 'bg-indigo-950/50 text-indigo-400 border border-indigo-900/50' : 'bg-indigo-50 text-indigo-600'}`}>
            AI-Powered Exam Intelligence
          </div>
          <h1 className={`text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Stop Guessing. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-400">Master Your Exams</span> with Data.
          </h1>
          <p className={`text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            ExamSense AI decodes your syllabus and past papers to identify the 20% of content that yields 80% of marks. Get a prioritized roadmap in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => setView('input')}
              className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 hover:scale-[1.02]"
            >
              Start Free Analysis
            </button>
            <button className={`px-10 py-5 border rounded-2xl font-bold text-lg transition-all ${darkMode ? 'bg-slate-900 text-white border-slate-700 hover:bg-slate-800' : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50'}`}>
              Watch Demo
            </button>
          </div>

          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            <div className="space-y-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/50' : 'bg-indigo-100 text-indigo-600'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Pattern Recognition</h3>
              <p className={darkMode ? 'text-slate-500' : 'text-slate-500'}>Our AI maps recurring concepts across multiple years of question papers to find high-probability topics.</p>
            </div>
            <div className="space-y-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-blue-950 text-blue-400 border border-blue-900/50' : 'bg-blue-100 text-blue-600'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Actionable Roadmap</h3>
              <p className={darkMode ? 'text-slate-500' : 'text-slate-500'}>Don't just know what to study, know how. AI suggests the required depth from basic to complex application.</p>
            </div>
            <div className="space-y-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' : 'bg-emerald-100 text-emerald-600'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Efficiency First</h3>
              <p className={darkMode ? 'text-slate-500' : 'text-slate-500'}>Save dozens of hours spent manually flipping through books. Focus your energy where it matters most.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <header className={`border-b transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <button onClick={() => setView('landing')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>ExamSense <span className="text-indigo-500">AI</span></h1>
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-extrabold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Strategic Analysis Tool</h2>
          <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Upload your syllabus and past papers below. Our AI will analyze the intersection to create your master plan.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-start gap-3 animate-in slide-in-from-top-4 duration-300">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 01-18 0z" /></svg>
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className={`text-sm font-bold flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  Exam Syllabus
                </label>
                <button 
                  onClick={() => syllabusInputRef.current?.click()}
                  className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors border ${darkMode ? 'bg-slate-800 text-indigo-400 border-slate-700 hover:bg-slate-700' : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Upload File
                </button>
                <input 
                  type="file" 
                  ref={syllabusInputRef} 
                  className="hidden" 
                  accept=".pdf,image/*" 
                  multiple 
                  onChange={(e) => handleFileUpload(e, 'syllabus')}
                />
              </div>
              
              <div className="relative group">
                <textarea
                  value={syllabus}
                  onChange={(e) => setSyllabus(e.target.value)}
                  placeholder="Paste syllabus text here..."
                  className={`w-full h-64 p-4 rounded-2xl border outline-none transition-all resize-none shadow-sm text-sm ${
                    darkMode 
                    ? 'bg-slate-800 text-slate-100 border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500' 
                    : 'bg-white text-slate-900 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {syllabusFiles.map((f, i) => (
                  <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border ${darkMode ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/50' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <span className="truncate max-w-[120px]">{f.file.name}</span>
                    <button onClick={() => removeFile(i, 'syllabus')} className="hover:text-red-500 ml-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className={`text-sm font-bold flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 01-18 0z" /></svg>
                  Past Questions
                </label>
                <button 
                  onClick={() => questionInputRef.current?.click()}
                  className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors border ${darkMode ? 'bg-slate-800 text-indigo-400 border-slate-700 hover:bg-slate-700' : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Upload File
                </button>
                <input 
                  type="file" 
                  ref={questionInputRef} 
                  className="hidden" 
                  accept=".pdf,image/*" 
                  multiple 
                  onChange={(e) => handleFileUpload(e, 'question')}
                />
              </div>

              <div className="relative group">
                <textarea
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                  placeholder="Paste questions here..."
                  className={`w-full h-64 p-4 rounded-2xl border outline-none transition-all resize-none shadow-sm text-sm ${
                    darkMode 
                    ? 'bg-slate-800 text-slate-100 border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500' 
                    : 'bg-white text-slate-900 border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {questionFiles.map((f, i) => (
                  <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border ${darkMode ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/50' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <span className="truncate max-w-[120px]">{f.file.name}</span>
                    <button onClick={() => removeFile(i, 'question')} className="hover:text-red-500 ml-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`w-full py-5 rounded-2xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-3 ${
                isAnalyzing 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-500/20'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Documents & Data...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  Generate Strategic Analysis
                </>
              )}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
