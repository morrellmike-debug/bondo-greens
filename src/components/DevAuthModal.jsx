import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function DevAuthModal() {
  const { authenticateDev, devPassword, setDevPassword } = useAuth();
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!authenticateDev(devPassword)) {
      setError('Invalid password');
      setDevPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Dev Site Access</h2>
        <p className="text-gray-600 mb-6">
          This is the development environment. Please authenticate to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={devPassword}
              onChange={(e) => setDevPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 text-base focus:outline-none focus:border-green-700"
              placeholder="Enter dev password"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4">❌ {error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-green-700 text-white font-medium py-2 px-4 rounded hover:bg-green-800 transition"
          >
            Authenticate
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Dev environment - registration testing in progress
        </p>
      </div>
    </div>
  );
}
