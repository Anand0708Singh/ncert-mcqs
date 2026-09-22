import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { CheckSquare, Square, Play, Settings } from 'lucide-react';
import questionBank from '../data/question_bank.json';

export default function ChapterSelect() {
  const navigate = useNavigate();
  const { activeBookId, selectedChapters, toggleChapter, setTestSettings } = useStore();
  
  if (!activeBookId) {
    navigate('/');
    return null;
  }
  
  const book = (questionBank as any)[activeBookId];

  const handleStart = () => {
    if (selectedChapters.length === 0) return;
    navigate('/config');
  };
  
  const toggleAll = () => {
    if (selectedChapters.length === book.chapters.length) {
      setTestSettings({ chapters: [] });
      useStore.setState({ selectedChapters: [] });
    } else {
      const allIds = book.chapters.map((c: any) => c.chapterId);
      setTestSettings({ chapters: allIds });
      useStore.setState({ selectedChapters: allIds });
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto py-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Select Chapters</h1>
          <p className="text-slate-500 mt-1">{book.bookTitle}</p>
        </div>
        <button 
          onClick={toggleAll}
          className="text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          {selectedChapters.length === book.chapters.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {book.chapters.map((chapter: any, idx: number) => {
          const isSelected = selectedChapters.includes(chapter.chapterId);
          return (
            <div 
              key={chapter.chapterId}
              onClick={() => toggleChapter(chapter.chapterId)}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4
                ${isSelected ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
            >
              <div className={`mt-0.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                {isSelected ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Chapter {idx + 1}</p>
                <h3 className={`text-lg font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                  {chapter.chapterTitle}
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  {chapter.questions.length} Questions
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-4 bg-white/80 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-lg flex items-center justify-between">
        <div className="font-medium text-slate-700">
          <span className="text-indigo-600 font-bold">{selectedChapters.length}</span> Chapters Selected
        </div>
        <button 
          onClick={handleStart}
          disabled={selectedChapters.length === 0}
          className="bg-indigo-600 disabled:bg-slate-300 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Settings className="w-5 h-5" /> Test Settings
        </button>
      </div>
    </div>
  );
}
