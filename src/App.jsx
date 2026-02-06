import { useState, useEffect } from 'react';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import RegistrationForm from './components/RegistrationForm';
import CheckInDashboard from './components/CheckInDashboard';
import AdminPanel from './components/AdminPanel';
import ComingSoon from './components/ComingSoon';
import DevAuthModal from './components/DevAuthModal';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const { isDevAuthenticated, isAdmin, authenticateAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState('registration');

  // Hard-coded dev access bypass for the meeting
  if (!isDevAuthenticated) {
    return <DevAuthModal />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl sm:text-2xl font-bold text-green-700">BONDO GREENS 2026</div>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage('registration')}
                className={`px-4 py-2 rounded font-medium transition ${
                  currentPage === 'registration' ? 'bg-green-700 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Registration
              </button>
              <button
                onClick={() => setCurrentPage('checkin')}
                className={`px-4 py-2 rounded font-medium transition ${
                  currentPage === 'checkin' ? 'bg-green-700 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Check-In
              </button>
              {isAdmin && (
                <button
                  onClick={() => setCurrentPage('admin')}
                  className={`px-4 py-2 rounded font-medium transition ${
                    currentPage === 'admin' ? 'bg-green-700 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Admin
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>
        {currentPage === 'registration' && <RegistrationForm />}
        {currentPage === 'checkin' && <CheckInDashboard />}
        {currentPage === 'admin' && <AdminPanel />}
      </main>

      {/* Forced Admin Toggle for Demo */}
      <button
        onClick={() => authenticateAdmin()}
        className="fixed bottom-4 right-4 p-3 bg-white text-2xl rounded-full border border-gray-300 shadow-lg z-[9999]"
        title="Admin Toggle"
      >
        ⚙️
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
