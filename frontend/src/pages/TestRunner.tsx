import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, Flag, LayoutGrid, X } from 'lucide-react';

export default function TestRunner() {
  const navigate = useNavigate();
  const { 
    activeQuestions, currentQuestionIndex, attempts, testSettings, timeRemaining, 
    isTestActive, recordAttempt, nextQuestion, prevQuestion, goToQuestion, finishTest, tickTimer, toggleBookmark, bookmarkedQuestions
  } = useStore();

  const [showPalette, setShowPalette] = useState(false);

  useEffect(() => {
    if (!isTestActive || activeQuestions.length === 0) {
      navigate('/chapters');
      return;
    }

    if (testSettings.mode === 'mock' && testSettings.timer > 0) {
      const interval = setInterval(() => {
        tickTimer();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isTestActive, testSettings, tickTimer, navigate, activeQuestions.length]);

  // Auto finish when time is up
  useEffect(() => {
    if (timeRemaining === 0 && testSettings.mode === 'mock' && testSettings.timer > 0 && isTestActive) {
      finishTest();
      navigate('/results');
    }
  }, [timeRemaining, testSettings, isTestActive, finishTest, navigate]);

  if (!isTestActive || activeQuestions.length === 0) return null;

  const currentQ = activeQuestions[currentQuestionIndex];
  const attempt = attempts[currentQ.id];
  const isBookmarked = bookmarkedQuestions.includes(currentQ.id);

  const handleOptionSelect = (optionId: string) => {
    // Prevent changing answer in mock test if we want strictness, or just allow it.
    // For practice mode, we might lock it after answering.
    if (testSettings.mode === 'practice' && attempt) return; // Locked
    
    const isCorrect = optionId === currentQ.correctAnswer;
    recordAttempt(currentQ.id, optionId, isCorrect, 0); // Not tracking time accurately per question here for brevity
  };

  const handleFinish = () => {
    if (window.confirm("Are you sure you want to submit the test?")) {
      finishTest();
      navigate('/results');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto w-full relative">
      {/* Header */}
      <header className="flex items-center justify-between bg-white p-4 rounded-t-2xl border-b border-slate-200">
        <div className="font-bold text-slate-700">
          Question <span className="text-indigo-600 text-lg">{currentQuestionIndex + 1}</span> / {activeQuestions.length}
        </div>
        
        <div className="flex items-center gap-4">
          {testSettings.mode === 'mock' && testSettings.timer > 0 && (
            <div className={`flex items-center gap-2 font-mono text-lg font-bold ${timeRemaining < 60 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeRemaining)}
            </div>
          )}
          <button onClick={() => setShowPalette(!showPalette)} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 lg:hidden">
            <LayoutGrid className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Question Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-white/50 pb-24">
          <div className="flex items-start justify-between mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
              ${currentQ.difficulty === 'easy' ? 'bg-green-100 text-green-700' : currentQ.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}
            `}>
              {currentQ.difficulty}
            </span>
            <button onClick={() => toggleBookmark(currentQ.id)} className={`p-2 rounded-lg transition-colors ${isBookmarked ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
              <Flag className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 leading-relaxed mb-8">
            {currentQ.question}
          </h2>

          <div className="space-y-3">
            {currentQ.options.map(opt => {
              const isSelected = attempt?.selectedOption === opt.id;
              let stateClass = "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer";
              
              if (testSettings.mode === 'practice' && attempt) {
                if (opt.id === currentQ.correctAnswer) {
                  stateClass = "border-green-500 bg-green-50 text-green-900";
                } else if (isSelected) {
                  stateClass = "border-red-500 bg-red-50 text-red-900";
                } else {
                  stateClass = "border-slate-200 opacity-60 cursor-not-allowed";
                }
              } else if (isSelected) {
                stateClass = "border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600";
              }

              return (
                <div 
                  key={opt.id}
                  onClick={() => handleOptionSelect(opt.id)}
                  className={`p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${stateClass}`}
                >
                  <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center font-bold text-sm
                    ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}
                    ${testSettings.mode === 'practice' && attempt && opt.id === currentQ.correctAnswer ? '!bg-green-500 !text-white' : ''}
                    ${testSettings.mode === 'practice' && attempt && isSelected && !attempt.isCorrect ? '!bg-red-500 !text-white' : ''}
                  `}>
                    {opt.id}
                  </div>
                  <div className="text-base font-medium">{opt.text}</div>
                  
                  {testSettings.mode === 'practice' && attempt && (
                    <div className="ml-auto">
                      {opt.id === currentQ.correctAnswer && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                      {isSelected && !attempt.isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Practice Mode Explanation */}
          {testSettings.mode === 'practice' && attempt && (
            <div className="mt-8 p-6 bg-slate-100 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Explanation</h3>
              <p className="text-slate-800 leading-relaxed">{currentQ.explanation}</p>
              <div className="mt-4 text-xs font-medium text-slate-400">
                Source: {currentQ.source.section} (Page {currentQ.source.page})
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Palette (Desktop) */}
        <div className={`
          absolute lg:relative right-0 top-0 bottom-0 w-64 bg-white border-l border-slate-200 p-4 overflow-y-auto shadow-2xl lg:shadow-none z-40 transition-transform duration-300
          ${showPalette ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h3 className="font-bold text-slate-800">Questions</h3>
            <button onClick={() => setShowPalette(false)}><X className="w-5 h-5 text-slate-500" /></button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {activeQuestions.map((q, idx) => {
              const isAns = attempts[q.id];
              const isCurr = idx === currentQuestionIndex;
              let bg = "bg-slate-100 text-slate-600 hover:bg-slate-200";
              if (isCurr) bg = "bg-indigo-600 text-white ring-2 ring-indigo-300 ring-offset-1";
              else if (isAns) bg = "bg-indigo-100 text-indigo-700 border border-indigo-200";
              
              return (
                <button 
                  key={q.id}
                  onClick={() => { goToQuestion(idx); setShowPalette(false); }}
                  className={`w-10 h-10 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${bg}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex items-center justify-between z-30 lg:right-64">
        <button 
          onClick={prevQuestion} 
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-2 px-4 py-2 font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Prev
        </button>
        
        {currentQuestionIndex === activeQuestions.length - 1 ? (
          <button 
            onClick={handleFinish}
            className="flex items-center gap-2 px-8 py-2.5 font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors shadow-sm"
          >
            Submit Test
          </button>
        ) : (
          <button 
            onClick={nextQuestion}
            className="flex items-center gap-2 px-6 py-2.5 font-bold text-white bg-slate-900 hover:bg-indigo-600 rounded-xl transition-colors shadow-sm"
          >
            Next <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </footer>
    </div>
  );
}
