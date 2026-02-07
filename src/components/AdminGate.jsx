import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminGate({ children }) {
  const { isAdmin, authenticateAdmin } = useAuth();
  const [isAttempting, setIsAttempting] = useState(false);

  // Auto-unlock helper if button fails
  const handleUnlock = () => {
    setIsAttempting(true);
    authenticateAdmin();
  };

  // If already admin, just show content
  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-xl border border-slate-100">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">🔒</span>
      </div>
      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Admin Restricted</h2>
      <p className="text-slate-500 font-medium mb-8 text-center max-w-sm px-6">
        This area is for organizers only. Please click below to authenticate.
      </p>
      <button
        onClick={handleUnlock}
        className="px-10 py-4 bg-green-700 text-white rounded-2xl font-black uppercase tracking-tighter hover:bg-green-800 transition-all shadow-lg shadow-green-200 active:scale-95"
      >
        {isAttempting ? 'Unlocking...' : 'Unlock Admin Panel'}
      </button>
    </div>
  );
}
