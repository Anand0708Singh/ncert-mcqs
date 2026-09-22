import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { BookOpen, GraduationCap, Target } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { setActiveBook, metadata, loadMetadata } = useStore();
  
  useEffect(() => {
    loadMetadata();
  }, [loadMetadata]);
  
  if (!metadata) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const handleSelectBook = (bookId: string) => {
    setActiveBook(bookId);
    navigate('/chapters');
  };

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto w-full py-12 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
        <GraduationCap className="w-10 h-10 text-indigo-600" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
        Master NCERT with Confidence
      </h1>
      <p className="text-lg text-slate-600 mb-10 max-w-xl">
        Practice chapter-wise MCQs directly from your NCERT textbooks. Test yourself with Mock Tests and track your progress offline.
      </p>
      
      <div className="w-full text-left space-y-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" /> Available Subjects
        </h2>
        
        {metadata.books.map((book: any) => {
          const totalQuestions = book.chapters.reduce((acc: number, ch: any) => acc + ch.questionCount, 0);
          
          return (
            <div 
              key={book.bookId}
              onClick={() => handleSelectBook(book.bookId)}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-indigo-300"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {book.bookTitle}
                  </h3>
                  <p className="text-slate-500 mt-1">Class 10 • Central Board</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Target className="w-4 h-4" /> {totalQuestions} MCQs
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-sm font-medium text-slate-600">
                  {book.chapters.length} Chapters
                </div>
              </div>
              <button className="mt-6 w-full bg-slate-900 text-white font-medium py-2.5 rounded-xl group-hover:bg-indigo-600 transition-colors">
                Start Practice
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
