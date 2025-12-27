
import React from 'react';
import { ExamAnalysis, Priority } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { DepthBadge } from './PreparationDepthBadge';

interface ResultViewProps {
  data: ExamAnalysis;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ data, onReset }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          {/* Using text-slate-900 explicitly and dark:text-white ensures visibility in both modes */}
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-400 mt-1">
            Analysis Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Your personalized exam strategy based on historical patterns.
          </p>
        </div>
        <button 
          onClick={onReset}
          className="font-bold text-sm flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white transition-colors">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Syllabus & Weightage Breakdown
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.syllabus.map((unit, uIdx) => (
                <div key={uIdx} className="p-6">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-5">{unit.title}</h3>
                  <div className="space-y-5">
                    {unit.topics.map((topic, tIdx) => (
                      <div key={tIdx} className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-3">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-lg leading-tight">{topic.name}</span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <DepthBadge depth={topic.depth} />
                            <PriorityBadge priority={topic.priority} />
                          </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900/50 rounded-xl p-3 border border-slate-200/50 dark:border-slate-700/50">
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                            "{topic.reasoning}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-slate-900 dark:text-white transition-colors">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Strategic Insights
            </h2>
            <ul className="space-y-4">
              {data.keyInsights.map((insight, idx) => (
                <li key={idx} className="flex gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-indigo-500 font-black">#</span>
                  {insight}
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-500/20 p-8 text-white">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
              <svg className="w-6 h-6 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Master Roadmap
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-200 mb-4">Urgent Focus</h3>
                <div className="flex flex-wrap gap-2">
                  {data.studyPlan.masterNow.map((item, idx) => (
                    <span key={idx} className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-bold border border-white/10">{item}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-200 mb-4">Conceptual Depth</h3>
                <div className="flex flex-wrap gap-2">
                  {data.studyPlan.deepDive.map((item, idx) => (
                    <span key={idx} className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-bold border border-white/10">{item}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-200 mb-4">Revision Checklist</h3>
                <div className="flex flex-wrap gap-2">
                  {data.studyPlan.quickRevision.map((item, idx) => (
                    <span key={idx} className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-bold border border-white/10">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
