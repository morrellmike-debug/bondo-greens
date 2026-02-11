import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminGate({ children }) {
  const { isAdmin, adminLoading, adminToken, mustChangePassword, clearMustChangePassword, loginAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [changeError, setChangeError] = useState('');

  // While checking stored token on mount
  if (adminLoading) {
    return (
      <div className="text-center py-20">
        <div className="text-lg text-gray-500">Checking authentication...</div>
      </div>
    );
  }

  // Force password change screen
  if (isAdmin && mustChangePassword) {
    const handleChangePassword = async (e) => {
      e.preventDefault();
      setChangeError('');

      if (newPassword.length < 6) {
        setChangeError('Password must be at least 6 characters');
        return;
      }
      if (newPassword !== confirmPassword) {
        setChangeError('Passwords do not match');
        return;
      }

      setChangingPassword(true);
      try {
        const res = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ new_password: newPassword }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to change password');
        clearMustChangePassword();
      } catch (err) {
        setChangeError(err.message);
      } finally {
        setChangingPassword(false);
      }
    };

    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-xl border border-slate-100">
        <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">🔑</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Set Your Password</h2>
        <p className="text-slate-500 font-medium mb-8 text-center max-w-sm px-6">
          You must set a new password before continuing.
        </p>

        <form onSubmit={handleChangePassword} className="w-full max-w-sm px-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="At least 6 characters"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Re-enter password"
              required
            />
          </div>

          {changeError && (
            <p className="text-red-600 text-sm text-center">{changeError}</p>
          )}

          <button
            type="submit"
            disabled={changingPassword}
            className="w-full px-6 py-3 bg-green-700 text-white rounded-xl font-bold uppercase tracking-tight hover:bg-green-800 transition-all shadow-lg shadow-green-200 active:scale-95 disabled:opacity-50"
          >
            {changingPassword ? 'Saving...' : 'Set Password'}
          </button>
        </form>
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
