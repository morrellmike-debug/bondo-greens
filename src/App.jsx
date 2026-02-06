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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-[100] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl sm:text-2xl font-bold text-green-700">BONDO GREENS 2026</div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage('registration')}
                className={`px-3 py-2 rounded text-sm font-bold transition-all border ${
                  currentPage === 'registration' ? 'bg-green-700 text-white border-green-800' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm'
                }`}
              >
                REGISTRATION
              </button>
              <button
                onClick={() => setCurrentPage('checkin')}
                className={`px-3 py-2 rounded text-sm font-bold transition-all border ${
                  currentPage === 'checkin' ? 'bg-green-700 text-white border-green-800' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm'
                }`}
              >
                CHECK-IN
              </button>
              {/* UNLOCKED ADMIN FOR DEMO - NO TOGGLE NEEDED */}
              <button
                onClick={() => setCurrentPage('admin')}
                className={`px-3 py-2 rounded text-sm font-bold transition-all border ${
                  currentPage === 'admin' ? 'bg-green-700 text-white border-green-800' : 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 shadow-sm'
                }`}
              >
                ADMIN PANEL 🔓
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-grow">
        {currentPage === 'registration' && <RegistrationForm />}
        {currentPage === 'checkin' && <CheckInDashboard />}
        {currentPage === 'admin' && <AdminPanel />}
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
