import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminGate({ children }) {
  const { isAdmin, adminLoading, adminToken, mustChangePassword, clearMustChangePassword, loginAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [setupError, setSetupError] = useState('');
  const [setupSubmitting, setSetupSubmitting] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);

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

  // Reset password form
  const handleReset = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    if (resetNewPassword.length < 6) {
      setResetError('Password must be at least 6 characters');
      return;
    }
    setResetSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, new_password: resetNewPassword, reset_token: resetToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setResetSuccess(data.message || 'Password has been reset. You can now log in.');
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetSubmitting(false);
    }
  };

  if (resetMode) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-xl border border-slate-100">
        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">🔓</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Reset Password</h2>
        <p className="text-slate-500 font-medium mb-8 text-center max-w-sm px-6">
          Enter your email, the reset token, and a new password.
        </p>

        {resetSuccess ? (
          <div className="w-full max-w-sm px-6 space-y-4">
            <p className="text-green-700 text-sm text-center font-medium">{resetSuccess}</p>
            <button
              onClick={() => { setResetMode(false); setResetSuccess(''); setResetError(''); setResetToken(''); setResetNewPassword(''); }}
              className="w-full px-6 py-3 bg-green-700 text-white rounded-xl font-bold uppercase tracking-tight hover:bg-green-800 transition-all shadow-lg shadow-green-200 active:scale-95"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="w-full max-w-sm px-6 space-y-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Reset Token</label>
              <input
                type="text"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-base font-mono focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="From your environment config"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="At least 6 characters"
                required
              />
            </div>

            {resetError && (
              <p className="text-red-600 text-sm text-center">{resetError}</p>
            )}

            <button
              type="submit"
              disabled={resetSubmitting}
              className="w-full px-6 py-3 bg-green-700 text-white rounded-xl font-bold uppercase tracking-tight hover:bg-green-800 transition-all shadow-lg shadow-green-200 active:scale-95 disabled:opacity-50"
            >
              {resetSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {!resetSuccess && (
          <button
            onClick={() => { setResetMode(false); setResetError(''); setResetToken(''); setResetNewPassword(''); }}
            className="mt-4 text-sm text-slate-500 hover:text-slate-700 underline"
          >
            Back to login
          </button>
        )}
      </div>
    );
  }

  // Setup form — bootstrap first admin account
  const handleSetup = async (e) => {
    e.preventDefault();
    setSetupError('');
    if (password.length < 6) {
      setSetupError('Password must be at least 6 characters');
      return;
    }
    setSetupSubmitting(true);
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Setup failed');
      // Auto-login with the returned token
      await loginAdmin(email, password);
    } catch (err) {
      setSetupError(err.message);
    } finally {
      setSetupSubmitting(false);
    }
  };

  if (setupMode) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-xl border border-slate-100">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">🛠️</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Admin Setup</h2>
        <p className="text-slate-500 font-medium mb-8 text-center max-w-sm px-6">
          Create the first admin account to get started.
        </p>

        <form onSubmit={handleSetup} className="w-full max-w-sm px-6 space-y-4">
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
              placeholder="At least 6 characters"
              required
            />
          </div>

          {setupError && (
            <p className="text-red-600 text-sm text-center">{setupError}</p>
          )}

          <button
            type="submit"
            disabled={setupSubmitting}
            className="w-full px-6 py-3 bg-green-700 text-white rounded-xl font-bold uppercase tracking-tight hover:bg-green-800 transition-all shadow-lg shadow-green-200 active:scale-95 disabled:opacity-50"
          >
            {setupSubmitting ? 'Creating account...' : 'Create Admin Account'}
          </button>
        </form>

        <button
          onClick={() => { setSetupMode(false); setSetupError(''); }}
          className="mt-4 text-sm text-slate-500 hover:text-slate-700 underline"
        >
          Back to login
        </button>
      </div>
    );
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

      <div className="mt-4 flex gap-4">
        <button
          onClick={() => { setResetMode(true); setError(''); }}
          className="text-sm text-slate-500 hover:text-slate-700 underline"
        >
          Forgot password?
        </button>
        <button
          onClick={() => { setSetupMode(true); setError(''); }}
          className="text-sm text-slate-500 hover:text-slate-700 underline"
        >
          First time setup
        </button>
      </div>
    </div>
  );
}
