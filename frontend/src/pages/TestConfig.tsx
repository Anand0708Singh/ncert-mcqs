import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Play, Settings2, Clock, CheckCircle2, GraduationCap } from 'lucide-react';
import questionBank from '../data/question_bank.json';

export default function TestConfig() {
  const navigate = useNavigate();
  const { testSettings, setTestSettings, selectedChapters, activeBookId, startTest } = useStore();
  
  if (!activeBookId || selectedChapters.length === 0) {
    navigate('/chapters');
    return null;
  }

  const book = (questionBank as any)[activeBookId];
  let availableQuestions: any[] = [];
  book.chapters.forEach((ch: any) => {
    if (selectedChapters.includes(ch.chapterId)) {
      availableQuestions = [...availableQuestions, ...ch.questions];
    }
  });

  const handleStart = () => {
    // Filter questions based on difficulty if needed
    let pool = availableQuestions;
    if (testSettings.difficulty !== 'all') {
      pool = pool.filter(q => q.difficulty === testSettings.difficulty);
    }
    
    // Randomize if requested
    if (testSettings.isRandomized) {
      pool = [...pool].sort(() => Math.random() - 0.5);
    }
    
    // Slice count
    const finalQuestions = pool.slice(0, testSettings.questionCount);
    
    if (finalQuestions.length === 0) {
      alert("No questions match your criteria.");
      return;
    }
    
    startTest(finalQuestions);
    navigate('/test');
  };

  return (
    <div className="max-w-3xl mx-auto w-full py-8 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 mb-8">
        <Settings2 className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-slate-900">Configure Your Session</h1>
      </div>

      <div className="space-y-8">
        {/* Mode Selection */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Mode</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={`cursor-pointer rounded-xl border-2 p-4 flex gap-3 transition-colors ${testSettings.mode === 'practice' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300'}`}>
              <input type="radio" name="mode" className="sr-only" checked={testSettings.mode === 'practice'} onChange={() => setTestSettings({ mode: 'practice', timer: 0 })} />
              <GraduationCap className={`w-6 h-6 ${testSettings.mode === 'practice' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <div>
                <div className={`font-bold ${testSettings.mode === 'practice' ? 'text-indigo-900' : 'text-slate-700'}`}>Practice Mode</div>
                <div className="text-sm text-slate-500 mt-1">Answers & explanations shown immediately. No timer.</div>
              </div>
            </label>
            <label className={`cursor-pointer rounded-xl border-2 p-4 flex gap-3 transition-colors ${testSettings.mode === 'mock' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300'}`}>
              <input type="radio" name="mode" className="sr-only" checked={testSettings.mode === 'mock'} onChange={() => setTestSettings({ mode: 'mock', timer: 30 })} />
              <Clock className={`w-6 h-6 ${testSettings.mode === 'mock' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <div>
                <div className={`font-bold ${testSettings.mode === 'mock' ? 'text-indigo-900' : 'text-slate-700'}`}>Mock Test</div>
                <div className="text-sm text-slate-500 mt-1">Exam simulation. Timed. Answers shown at the end.</div>
              </div>
            </label>
          </div>
        </section>

        {/* Question Count */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">Number of Questions</h2>
            <span className="text-sm text-slate-500">{availableQuestions.length} available</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {[10, 20, 30, 50, availableQuestions.length].map((num) => (
              <button
                key={num}
                onClick={() => setTestSettings({ questionCount: num })}
                className={`px-5 py-2.5 rounded-lg font-medium border-2 transition-colors
                  ${testSettings.questionCount === num ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'}`}
              >
                {num === availableQuestions.length ? 'All' : num}
              </button>
            ))}
          </div>
        </section>

        {/* Timer (if Mock Test) */}
        {testSettings.mode === 'mock' && (
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <h2 className="text-lg font-bold text-slate-800 mb-4">Time Limit (Minutes)</h2>
             <div className="flex flex-wrap gap-3">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setTestSettings({ timer: mins })}
                    className={`px-5 py-2.5 rounded-lg font-medium border-2 transition-colors
                      ${testSettings.timer === mins ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'}`}
                  >
                    {mins} min
                  </button>
                ))}
             </div>
          </section>
        )}

        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Randomize Questions</h2>
            <p className="text-sm text-slate-500">Shuffle question and option order</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={testSettings.isRandomized} onChange={(e) => setTestSettings({ isRandomized: e.target.checked })} />
            <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </section>

      </div>

      <div className="mt-8">
        <button onClick={handleStart} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-lg shadow-md transition-colors">
          <Play className="w-6 h-6 fill-current" /> Start {testSettings.mode === 'practice' ? 'Practice' : 'Mock Test'}
        </button>
      </div>
    </div>
  );
}
