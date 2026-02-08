import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminGate({ children }) {
  const { isAdmin, adminLoading, loginAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // While checking stored token on mount
  if (adminLoading) {
    return (
      <div className="text-center py-20">
        <div className="text-lg text-gray-500">Checking authentication...</div>
      </div>
    );
  }

  // Authenticated — render admin content
  if (isAdmin) {
    return <>{children}</>;
  }

  // Login form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await loginAdmin(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-xl border border-slate-100">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">🔒</span>
      </div>
      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Admin Login</h2>
      <p className="text-slate-500 font-medium mb-8 text-center max-w-sm px-6">
        Sign in with your admin credentials to access the event cockpit.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm px-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="admin@bondogreens.com"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter password"
            required
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-6 py-3 bg-green-700 text-white rounded-xl font-bold uppercase tracking-tight hover:bg-green-800 transition-all shadow-lg shadow-green-200 active:scale-95 disabled:opacity-50"
        >
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
