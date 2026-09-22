import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Trophy, CheckCircle2, XCircle, RotateCcw, Home, Clock, AlertCircle } from 'lucide-react';

export default function Results() {
  const navigate = useNavigate();
  const { 
    activeQuestions, attempts, testSettings, timeRemaining, 
    addTestResult, resetTest 
  } = useStore();
  
  const [saved, setSaved] = useState(false);

  // Calculate results once
  const total = activeQuestions.length;
  const answered = Object.keys(attempts).length;
  const correct = Object.values(attempts).filter(a => a.isCorrect).length;
  const incorrect = answered - correct;
  const skipped = total - answered;
  const scorePercentage = Math.round((correct / total) * 100) || 0;
  
  const timeTaken = (testSettings.timer * 60) - timeRemaining;
  const m = Math.floor(timeTaken / 60);
  const s = timeTaken % 60;
  const timeStr = `${m}m ${s}s`;

  useEffect(() => {
    if (activeQuestions.length > 0 && !saved) {
      addTestResult({
        id: new Date().getTime().toString(),
        date: new Date().toISOString(),
        settings: testSettings,
        attempts: Object.values(attempts),
        score: correct,
        totalQuestions: total,
        timeTakenMs: timeTaken * 1000
      });
      setSaved(true);
    }
  }, [activeQuestions, saved, addTestResult, testSettings, attempts, correct, total, timeTaken]);

  const handleReturnHome = () => {
    resetTest();
    navigate('/');
  };

  const handleReview = () => {
    // A full app would have a dedicated review page or mode. 
    // Here we'll just show the answers inline if they scroll down.
  };

  if (activeQuestions.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">No recent test found.</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-indigo-600 underline">Go Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full py-8 animate-in slide-in-from-bottom-8 duration-500">
      
      {/* Score Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center mb-8">
        <div className="w-24 h-24 mx-auto bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
          <Trophy className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Test Completed!</h1>
        <p className="text-slate-500 mb-8">Here is how you performed.</p>
        
        <div className="flex items-center justify-center gap-4 sm:gap-12 text-center divide-x divide-slate-100">
          <div className="px-4">
            <div className="text-4xl font-extrabold text-indigo-600">{scorePercentage}%</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">Accuracy</div>
          </div>
          <div className="px-4">
            <div className="text-4xl font-extrabold text-slate-800">{correct} <span className="text-2xl text-slate-400">/ {total}</span></div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">Score</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
          <div className="text-2xl font-bold text-slate-800">{correct}</div>
          <div className="text-xs font-bold text-slate-400 uppercase">Correct</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center">
          <XCircle className="w-8 h-8 text-red-500 mb-2" />
          <div className="text-2xl font-bold text-slate-800">{incorrect}</div>
          <div className="text-xs font-bold text-slate-400 uppercase">Incorrect</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center">
          <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
          <div className="text-2xl font-bold text-slate-800">{skipped}</div>
          <div className="text-xs font-bold text-slate-400 uppercase">Skipped</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center">
          <Clock className="w-8 h-8 text-blue-500 mb-2" />
          <div className="text-2xl font-bold text-slate-800">{timeStr}</div>
          <div className="text-xs font-bold text-slate-400 uppercase">Time</div>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={handleReturnHome} className="flex-1 bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
          <Home className="w-5 h-5" /> Back to Home
        </button>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Review Answers</h2>
        <div className="space-y-6">
          {activeQuestions.map((q, idx) => {
            const attempt = attempts[q.id];
            const isCorrect = attempt?.isCorrect;
            const isSkipped = !attempt;

            return (
              <div key={q.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`mt-1 shrink-0 ${isCorrect ? 'text-green-500' : isSkipped ? 'text-amber-500' : 'text-red-500'}`}>
                    {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : isSkipped ? <AlertCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Q{idx + 1}. {q.question}</h3>
                    <div className="space-y-2">
                      {q.options.map(opt => {
                        const isSelected = attempt?.selectedOption === opt.id;
                        const isActualCorrect = opt.id === q.correctAnswer;
                        
                        let optClass = "text-slate-600";
                        if (isActualCorrect) optClass = "text-green-600 font-bold flex items-center gap-2";
                        else if (isSelected && !isCorrect) optClass = "text-red-600 line-through flex items-center gap-2";

                        return (
                          <div key={opt.id} className={optClass}>
                            {opt.id}. {opt.text}
                            {isActualCorrect && <CheckCircle2 className="w-4 h-4 inline" />}
                            {isSelected && !isCorrect && <XCircle className="w-4 h-4 inline" />}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg text-sm text-slate-700">
                      <span className="font-bold text-slate-900">Explanation:</span> {q.explanation}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
