import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, Home, LayoutDashboard } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const hideNavOnTest = location.pathname === '/test';

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavOnTest && (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
              <BookOpen className="w-6 h-6" />
              <span>NCERT Prep</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link to="/" className="hover:text-indigo-600 transition-colors hidden sm:flex items-center gap-1">
                <Home className="w-4 h-4" /> Home
              </Link>
              <Link to="/dashboard" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            </nav>
          </div>
        </header>
      )}
      
      <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
      
      {!hideNavOnTest && (
        <footer className="bg-slate-100 py-6 border-t border-slate-200 text-center text-sm text-slate-500 mt-auto">
          <p>NCERT MCQ Practice Platform. Offline-first & Privacy focused.</p>
        </footer>
      )}
    </div>
  );
}
