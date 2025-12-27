
import React, { useState, useCallback, useRef } from 'react';
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

  const [syllabusFiles, setSyllabusFiles] = useState<UploadedFile[]>([]);
  const [questionFiles, setQuestionFiles] = useState<UploadedFile[]>([]);

  const syllabusInputRef = useRef<HTMLInputElement>(null);
  const questionInputRef = useRef<HTMLInputElement>(null);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleGoHome = useCallback(() => {
    setView('landing');
    setAnalysisResult(null);
    setError(null);
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'syllabus' | 'question') => {
    const files = Array.from(e.target.files || []) as File[];
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    if (type === 'syllabus') setSyllabusFiles(prev => [...prev, ...newFiles]);
    else setQuestionFiles(prev => [...prev, ...newFiles]);
    if (e.target) e.target.value = '';
  };

  const removeFile = (index: number, type: 'syllabus' | 'question') => {
    if (type === 'syllabus') setSyllabusFiles(prev => prev.filter((_, i) => i !== index));
    else setQuestionFiles(prev => prev.filter((_, i) => i !== index));
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
      const sParts: FileData[] = await Promise.all(syllabusFiles.map(async (f) => ({
        inlineData: { data: await fileToBase64(f.file), mimeType: f.file.type }
      })));
      const qParts: FileData[] = await Promise.all(questionFiles.map(async (f) => ({
        inlineData: { data: await fileToBase64(f.file), mimeType: f.file.type }
      })));
      const result = await analyzeExamMaterial(syllabus, questions, sParts, qParts);
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
        darkMode ? 'bg-slate-800 border-slate-700 text-yellow-400' : 'bg-white border-slate-200 text-indigo-600'
      } shadow-sm hover:scale-110 active:scale-95`}
      aria-label="Toggle Theme"
    >
      {darkMode ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
      )}
    </button>
  );

  const SocialLinks = () => (
    <div className="flex items-center gap-3">
      <a href="https://github.com/Murugayesu" target="_blank" rel="noopener noreferrer" className={`${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition-colors`}>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
      </a>
      <a href="https://www.linkedin.com/in/murugayesu-arularasan-754034326" target="_blank" rel="noopener noreferrer" className={`${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition-colors`}>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
      </a>
    </div>
  );

  const Logo = () => (
    <button onClick={handleGoHome} className="flex items-center gap-2 hover:opacity-80 transition-all group">
      <div className="bg-indigo-600 p-1.5 rounded-lg shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <h1 className={`font-bold tracking-tight transition-colors ${darkMode ? 'text-white' : 'text-slate-900'}`}>
        ExamSense <span className="text-indigo-500">AI</span>
      </h1>
    </button>
  );

  const Footer = () => (
    <footer className={`py-12 border-t mt-20 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Crafted with passion by <a href="https://www.linkedin.com/in/murugayesu-arularasan-754034326" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">Murugayesu Arularasan</a>
          </p>
          <div className="flex gap-4 opacity-70">
            <SocialLinks />
          </div>
        </div>
        <p className={`text-xs ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>© 2025 ExamSense AI. Built for strategic academic excellence.</p>
      </div>
    </footer>
  );

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen transition-colors ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        {analysisResult ? (
          <>
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center border-b border-transparent dark:border-slate-900">
              <Logo />
              <div className="flex items-center gap-4">
                <div className="hidden sm:block opacity-60"><SocialLinks /></div>
                <ThemeToggle />
              </div>
            </div>
            <ResultView data={analysisResult} onReset={handleReset} />
            <Footer />
          </>
        ) : view === 'landing' ? (
          <div className={`min-h-screen transition-colors ${darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
            <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
              <Logo />
              <div className="flex items-center gap-6">
                <div className="hidden md:block"><SocialLinks /></div>
                <ThemeToggle />
              </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12 md:py-24 text-center">
              <div className={`inline-block px-4 py-1.5 mb-6 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full border transition-colors ${darkMode ? 'bg-indigo-950/30 text-indigo-400 border-indigo-900/50' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                Advanced Exam Intelligence
              </div>
              <h1 className={`text-4xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] transition-colors ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Study 20% Smarter. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500">Earn 80% More Marks.</span>
              </h1>
              <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed transition-colors ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Don't burn out on low-yield chapters. ExamSense AI maps your syllabus against past questions to highlight exactly where to focus.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={() => setView('input')}
                  className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-95"
                >
                  Get My Strategy
                </button>
                <a 
                  href="https://github.com/Murugayesu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full sm:w-auto px-10 py-5 border rounded-2xl font-bold text-lg transition-all ${darkMode ? 'bg-slate-900 text-white border-slate-700 hover:bg-slate-800' : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50'}`}
                >
                  View Project Code
                </a>
              </div>
              
              <div className="mt-20 relative animate-float">
                <div className="absolute inset-0 bg-indigo-500 opacity-20 blur-[120px] rounded-full"></div>
                <div className={`relative rounded-3xl border transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xl'} p-4 md:p-8 max-w-4xl mx-auto`}>
                   <div className="flex gap-2 mb-4">
                     <div className="w-3 h-3 rounded-full bg-red-400"></div>
                     <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                     <div className="w-3 h-3 rounded-full bg-green-400"></div>
                   </div>
                   <div className="space-y-4">
                     <div className={`h-8 w-3/4 rounded-lg transition-colors ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
                     <div className={`h-24 w-full rounded-lg transition-colors ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className={`h-20 w-full rounded-lg transition-colors ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
                        <div className={`h-20 w-full rounded-lg transition-colors ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
                     </div>
                   </div>
                </div>
              </div>
            </main>
            <Footer />
          </div>
        ) : (
          <>
            <header className={`border-b transition-colors sticky top-0 z-50 ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'} backdrop-blur-md`}>
              <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <Logo />
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block opacity-60"><SocialLinks /></div>
                  <ThemeToggle />
                </div>
              </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className={`text-3xl md:text-5xl font-extrabold mb-4 transition-colors ${darkMode ? 'text-white' : 'text-slate-900'}`}>Analysis Tool</h2>
                <p className={`text-base md:text-lg max-w-2xl mx-auto transition-colors ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Paste your content or upload documents. We'll handle the strategy.
                </p>
              </div>

              {error && (
                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 01-18 0z" /></svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className={`text-sm font-bold flex items-center gap-2 transition-colors ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Syllabus</label>
                      <button onClick={() => syllabusInputRef.current?.click()} className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border transition-colors ${darkMode ? 'bg-slate-800 text-indigo-400 border-slate-700' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>Upload PDF/Img</button>
                      <input type="file" ref={syllabusInputRef} className="hidden" accept=".pdf,image/*" multiple onChange={(e) => handleFileUpload(e, 'syllabus')} />
                    </div>
                    <textarea
                      value={syllabus}
                      onChange={(e) => setSyllabus(e.target.value)}
                      placeholder="Paste official syllabus topics here..."
                      className={`w-full h-72 p-4 rounded-2xl border outline-none transition-all resize-none shadow-sm text-sm ${darkMode ? 'bg-slate-800 text-slate-100 border-slate-700 focus:ring-indigo-500' : 'bg-white text-slate-900 border-slate-200 focus:ring-indigo-500'}`}
                    />
                    <div className="flex flex-wrap gap-2">
                      {syllabusFiles.map((f, i) => (
                        <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${darkMode ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/50' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                          <span className="truncate max-w-[80px]">{f.file.name}</span>
                          <button onClick={() => removeFile(i, 'syllabus')} className="hover:text-red-500">×</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className={`text-sm font-bold flex items-center gap-2 transition-colors ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Past Questions</label>
                      <button onClick={() => questionInputRef.current?.click()} className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border transition-colors ${darkMode ? 'bg-slate-800 text-indigo-400 border-slate-700' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>Upload PDF/Img</button>
                      <input type="file" ref={questionInputRef} className="hidden" accept=".pdf,image/*" multiple onChange={(e) => handleFileUpload(e, 'question')} />
                    </div>
                    <textarea
                      value={questions}
                      onChange={(e) => setQuestions(e.target.value)}
                      placeholder="Paste past exam questions here..."
                      className={`w-full h-72 p-4 rounded-2xl border outline-none transition-all resize-none shadow-sm text-sm ${darkMode ? 'bg-slate-800 text-slate-100 border-slate-700 focus:ring-indigo-500' : 'bg-white text-slate-900 border-slate-200 focus:ring-indigo-500'}`}
                    />
                    <div className="flex flex-wrap gap-2">
                      {questionFiles.map((f, i) => (
                        <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${darkMode ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/50' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                          <span className="truncate max-w-[80px]">{f.file.name}</span>
                          <button onClick={() => removeFile(i, 'question')} className="hover:text-red-500">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`w-full py-5 rounded-2xl font-bold text-white transition-all shadow-xl flex items-center justify-center gap-3 ${
                    isAnalyzing ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-500/30'
                  }`}
                >
                  {isAnalyzing ? (
                    <><div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div> Analyzing Patterns...</>
                  ) : (
                    <>Generate Strategic Roadmap</>
                  )}
                </button>
              </div>
            </main>
            <Footer />
          </>
        )}
      </div>
    </div>
  );
};

export default App;
