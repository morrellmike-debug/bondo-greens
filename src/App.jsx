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
  
  // Use a proper state-setter for the current page
  const [currentPage, setCurrentPage] = useState('registration');

  // Handle URL changes and initial load
  useEffect(() => {
    const handleNavigation = () => {
      const path = window.location.pathname;
      if (path === '/admin') setCurrentPage('admin');
      else if (path === '/checkin') setCurrentPage('checkin');
      else setCurrentPage('registration');
    };

    // Initial check
    handleNavigation();

    // Listen for back/forward browser buttons
    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  // Update navigate function to sync URL and State
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

      {/* Page Content */}
      <main>
        {currentPage === 'registration' && <RegistrationForm />}
        {currentPage === 'checkin' && <CheckInDashboard />}
        {currentPage === 'admin' && (
          <ProtectedRoute requireAdmin={true}>
            <AdminPanel />
          </ProtectedRoute>
        )}
      </main>

      {/* Admin Toggle (Dev Environment Only) */}
      {isDev && (
        <button
          onClick={() => {
            authenticateAdmin();
          }}
          className="fixed bottom-4 right-4 p-2 bg-gray-200 text-gray-400 rounded-full hover:text-green-700 hover:bg-white border border-transparent hover:border-green-700 transition shadow-sm z-50"
          title="Toggle Admin Access"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
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
