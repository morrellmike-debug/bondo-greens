import { useState, useEffect } from 'react';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import RegistrationForm from './components/RegistrationForm';
import AdminPanel from './components/AdminPanel';
import AdminGate from './components/AdminGate';
import DevAuthModal from './components/DevAuthModal';

function AppContent() {
  const { isDevAuthenticated, isAdmin, authenticateAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState('registration');

  if (!isDevAuthenticated) {
    return <DevAuthModal />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-500 uppercase tracking-tighter shrink-0">
              BONDO GREENS 2026
            </div>
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setCurrentPage('registration')}
                className={`px-4 py-2 rounded-xl font-black uppercase text-xs tracking-widest transition ${
                  currentPage === 'registration'
                    ? 'bg-green-700 text-white shadow-lg shadow-green-200 dark:shadow-none'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Registration
              </button>

              <button
                onClick={() => setCurrentPage('admin')}
                className={`px-4 py-2 rounded-xl font-black uppercase text-xs tracking-widest transition ${
                  currentPage === 'admin'
                    ? 'bg-green-700 text-white shadow-lg shadow-green-200 dark:shadow-none'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      {currentPage === 'registration' && (
        <div className="w-full bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 py-12 border-b border-gray-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
              The Legend <span className="text-green-600">Continues</span>
            </h2>
            <p className="text-xs sm:text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.5em] mt-4">
              Est. 2001 • Baldwin, Kansas
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4">
        {currentPage === 'registration' && <RegistrationForm />}
        {currentPage === 'admin' && (
          <AdminGate>
            <AdminPanel />
          </AdminGate>
        )}
      </main>

      {!isAdmin && (
        <button
          onClick={() => authenticateAdmin()}
          className="fixed bottom-6 right-6 p-3 bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600 rounded-full hover:text-green-600 transition shadow-xl z-50 border dark:border-slate-700"
          title="Admin Unlock"
        >
          ⚙️
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
