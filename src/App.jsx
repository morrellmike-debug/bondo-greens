import { useState, useEffect } from 'react';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import RegistrationForm from './components/RegistrationForm';
import CheckInDashboard from './components/CheckInDashboard';
import AdminPanel from './components/AdminPanel';
import AdminGate from './components/AdminGate';
import ComingSoon from './components/ComingSoon';
import DevAuthModal from './components/DevAuthModal';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const { isDev, isDevAuthenticated, isAdmin, authenticateAdmin } = useAuth();
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
            <div className="text-xl sm:text-2xl font-bold text-green-700 uppercase tracking-tighter">
              BONDO GREENS 2026
            </div>
            <div className="flex gap-1 overflow-x-auto">
              <button
                onClick={() => setCurrentPage('registration')}
                className={`px-3 py-2 rounded font-medium transition whitespace-nowrap ${
                  currentPage === 'registration'
                    ? 'bg-green-700 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Registration
              </button>

              <button
                onClick={() => setCurrentPage('checkin')}
                className={`px-3 py-2 rounded font-medium transition whitespace-nowrap ${
                  currentPage === 'checkin'
                    ? 'bg-green-700 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Check-In
              </button>

              <button
                onClick={() => setCurrentPage('inventory')}
                className={`px-3 py-2 rounded font-medium transition whitespace-nowrap ${
                  currentPage === 'inventory'
                    ? 'bg-green-700 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Inventory
              </button>

              <button
                onClick={() => setCurrentPage('admin')}
                className={`px-3 py-2 rounded font-medium transition whitespace-nowrap ${
                  currentPage === 'admin'
                    ? 'bg-green-700 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero / Header Section (Restored) */}
      {currentPage === 'registration' && (
        <div className="w-full bg-gradient-to-b from-blue-50 to-white py-8 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-black text-gray-900 uppercase italic">
              The Legend <span className="text-green-700">Continues</span>
            </h2>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.4em] mt-2">
              Est. 2001 • Baldwin, Kansas
            </p>
          </div>
        </div>
      )}

      {/* Page Content */}
      <main className={`max-w-7xl mx-auto py-8 px-4 ${currentPage === 'admin' ? '' : 'max-w-4xl'}`}>
        {currentPage === 'registration' && <RegistrationForm />}
        {currentPage === 'checkin' && <CheckInDashboard showInventory={false} />}
        {currentPage === 'inventory' && <CheckInDashboard showInventory={true} showRoster={false} />}
        {currentPage === 'admin' && (
          <AdminGate>
            <AdminPanel />
          </AdminGate>
        )}
      </main>

      {/* Discrete Admin Toggle (Hidden if already admin) */}
      {!isAdmin && (
        <button
          onClick={() => authenticateAdmin()}
          className="fixed bottom-4 right-4 p-2 bg-gray-200 text-gray-400 rounded-full hover:text-green-700 transition shadow-sm z-50"
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
