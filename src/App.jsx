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
  const { isDev, isDevAuthenticated, showDevAuth, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState('registration');

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
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="text-2xl font-bold text-green-700">BONDO GREENS 2026</div>
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
        </div>
      </nav>

      {/* Page Content */}
      <main>
        {currentPage === 'registration' && <RegistrationForm />}
        {currentPage === 'checkin' && (
          <ProtectedRoute requireAdmin={true}>
            <CheckInDashboard />
          </ProtectedRoute>
        )}
        {currentPage === 'admin' && (
          <ProtectedRoute requireAdmin={true}>
            <AdminPanel />
          </ProtectedRoute>
        )}
      </main>
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
