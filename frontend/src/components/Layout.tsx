import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, Home, LayoutDashboard, Settings, Layers } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const hideNavOnTest = location.pathname === '/test';

  return (
    <div className="min-h-[100dvh] flex flex-col pb-16 sm:pb-0">
      {!hideNavOnTest && (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
              <BookOpen className="w-6 h-6" />
              <span>NCERT MCQs</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link to="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                <Home className="w-4 h-4" /> Home
              </Link>
              <Link to="/chapters" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                <Layers className="w-4 h-4" /> Practice
              </Link>
              <Link to="/dashboard" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            </nav>
          </div>
        </header>
      )}
      
      <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative">
        <Outlet />
      </main>
      
      {!hideNavOnTest && (
        <footer className="hidden sm:block bg-slate-100 py-6 border-t border-slate-200 text-center text-sm text-slate-500 mt-auto">
          <p>NCERT MCQ Practice Platform. Offline-first & Privacy focused.</p>
        </footer>
      )}

      {/* Mobile Bottom Navigation */}
      {!hideNavOnTest && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around items-center h-16 pb-safe">
          <Link to="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/' ? 'text-indigo-600' : 'text-slate-500'}`}>
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link to="/chapters" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/chapters' ? 'text-indigo-600' : 'text-slate-500'}`}>
            <Layers className="w-5 h-5" />
            <span className="text-[10px] font-medium">Practice</span>
          </Link>
          <Link to="/dashboard" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/dashboard' ? 'text-indigo-600' : 'text-slate-500'}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-medium">Dashboard</span>
          </Link>
        </div>
      )}
    </div>
  );
}
