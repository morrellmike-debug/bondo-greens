import { useState } from 'react';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import RegistrationForm from './components/RegistrationForm';
import CheckInDashboard from './components/CheckInDashboard';
import AdminPanel from './components/AdminPanel';
import ComingSoon from './components/ComingSoon';
import DevAuthModal from './components/DevAuthModal';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const { isDev, isDevAuthenticated, isAdmin, authenticateAdmin } = useAuth();
  
  const [currentPage, setCurrentPage] = useState('registration');

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin') setCurrentPage('admin');
    else if (path === '/checkin') setCurrentPage('checkin');
    else setCurrentPage('registration');
  }, []);

  const navigateTo = (page) => {
    const path = page === 'registration' ? '/' : `/${page}`;
    window.history.pushState({}, '', path);
    setCurrentPage(page);
  };

  // Show ComingSoon if on production (not dev)
  if (!isDev) {
    return <ComingSoon />;
  }

  // Show dev auth modal if not authenticated yet
  if (!isDevAuthenticated) {
    return <DevAuthModal />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl sm:text-2xl font-bold text-green-700">BONDO GREENS 2026</div>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage('registration')}
                className={`px-4 py-2 rounded font-medium transition ${
                  currentPage === 'registration'
                    ? 'bg-green-700 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Registration
              </button>

              {/* Check-In only visible if admin */}
              {isAdmin && (
                <button
                  onClick={() => setCurrentPage('checkin')}
                  className={`px-4 py-2 rounded font-medium transition ${
                    currentPage === 'checkin'
                      ? 'bg-green-700 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Check-In
                </button>
              )}

              {/* Admin only visible if admin */}
              {isAdmin && (
                <button
                  onClick={() => setCurrentPage('admin')}
                  className={`px-4 py-2 rounded font-medium transition ${
                    currentPage === 'admin'
                      ? 'bg-green-700 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Admin
                </button>
              )}

              {/* Dev badge */}
              <div className="ml-4 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                DEV
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {currentPage === 'registration' && <RegistrationForm />}
        {currentPage === 'checkin' && <CheckInDashboard />}
        {currentPage === 'admin' && (
          isAdmin ? (
            <AdminPanel />
          ) : (
            <div className="p-8 text-center">
              <h2 className="text-xl font-bold text-gray-800">Admin Restricted</h2>
              <p className="text-gray-600 mt-2">Please use the admin toggle to gain access.</p>
            </div>
          )
        )}
      </main>

      {/* Admin Toggle (Fixed Visibility) */}
      <button
        onClick={() => {
          authenticateAdmin();
        }}
        className="fixed bottom-4 right-4 p-3 bg-white text-gray-400 rounded-full border border-gray-200 shadow-lg z-[9999] hover:text-green-700 hover:border-green-700 transition-all"
        title="Admin Toggle"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.5 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
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
