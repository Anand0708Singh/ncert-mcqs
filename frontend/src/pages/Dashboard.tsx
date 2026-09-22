import React from 'react';
import { useStore } from '../store/useStore';
import { LayoutDashboard, Target, Trophy, Clock, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { testHistory, bookmarkedQuestions } = useStore();

  const totalTests = testHistory.length;
  const totalAttempted = testHistory.reduce((acc, test) => acc + test.attempts.length, 0);
  const totalCorrect = testHistory.reduce((acc, test) => acc + test.score, 0);
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  
  const bestScoreTest = [...testHistory].sort((a, b) => (b.score / b.totalQuestions) - (a.score / a.totalQuestions))[0];
  const bestScorePercentage = bestScoreTest ? Math.round((bestScoreTest.score / bestScoreTest.totalQuestions) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto w-full py-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-slate-900">Your Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 font-medium mb-2">Tests Taken</div>
          <div className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            {totalTests}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 font-medium mb-2">Questions Attempted</div>
          <div className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-500" /> {totalAttempted}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 font-medium mb-2">Overall Accuracy</div>
          <div className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-green-500" /> {overallAccuracy}%
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 font-medium mb-2">Best Score</div>
          <div className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" /> {bestScorePercentage}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Tests</h2>
          {testHistory.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
              <p className="text-slate-500 mb-4">You haven't taken any tests yet.</p>
              <Link to="/" className="text-indigo-600 font-medium hover:underline">Start Practicing</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {[...testHistory].reverse().slice(0, 5).map(test => {
                const date = new Date(test.date).toLocaleDateString();
                const scorePct = Math.round((test.score / test.totalQuestions) * 100);
                return (
                  <div key={test.id} className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{test.settings.mode === 'mock' ? 'Mock Test' : 'Practice Session'}</div>
                      <div className="text-sm text-slate-500 mt-1">{date} • {test.totalQuestions} Questions</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold text-lg ${scorePct >= 80 ? 'text-green-600' : scorePct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {scorePct}%
                      </div>
                      <div className="text-xs font-bold text-slate-400 uppercase">Score</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Links</h2>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-slate-700">
              <Flag className="w-5 h-5 text-indigo-500" />
              <span className="font-medium">Bookmarks:</span>
              <span className="font-bold">{bookmarkedQuestions.length}</span>
            </div>
            
            <Link to="/" className="block w-full text-center py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition-colors">
              Continue Practice
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
