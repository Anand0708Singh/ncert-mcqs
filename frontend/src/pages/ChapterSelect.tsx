import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { CheckSquare, Square, Play, Settings } from 'lucide-react';

export default function ChapterSelect() {
  const navigate = useNavigate();
  const { activeBookId, selectedChapters, toggleChapter, setTestSettings, metadata } = useStore();
  
  if (!activeBookId || !metadata) {
    navigate('/');
    return null;
  }
  
  const book = metadata.books.find((b: any) => b.bookId === activeBookId);
  if (!book) {
    navigate('/');
    return null;
  }

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
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg transition-colors"
        >
          {selectedChapters.length === book.chapters.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {book.chapters.map((chapter: any) => {
          const isSelected = selectedChapters.includes(chapter.chapterId);
          return (
            <div
              key={chapter.chapterId}
              onClick={() => toggleChapter(chapter.chapterId)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${isSelected ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'}`}
            >
              <div className="mt-1">
                {isSelected ? <CheckSquare className="text-indigo-600" /> : <Square className="text-slate-300" />}
              </div>
              <div>
                <h3 className={`font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                  {chapter.chapterTitle}
                </h3>
                <p className="text-sm text-slate-500 mt-1">{chapter.questionCount} Questions</p>
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
