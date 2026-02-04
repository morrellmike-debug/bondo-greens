import { useState } from 'react';
import './index.css';
import RegistrationForm from './components/RegistrationForm';
import CheckInDashboard from './components/CheckInDashboard';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [currentPage, setCurrentPage] = useState('registration');

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
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Demo Prototype - Feb 4, 2026
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
    </div>
  );
}
