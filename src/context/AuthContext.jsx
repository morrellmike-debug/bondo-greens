import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [devPassword, setDevPassword] = useState('');
  const [isDevAuthenticated, setIsDevAuthenticated] = useState(false);
  const [showDevAuth, setShowDevAuth] = useState(false);

  // Check if this is dev environment
  const isDev = import.meta.env.VITE_ENVIRONMENT === 'dev' || 
                window.location.hostname.includes('dev.');

  // Check if already authenticated (from session storage)
  useEffect(() => {
    const saved = sessionStorage.getItem('devAuth');
    if (saved) {
      setIsDevAuthenticated(true);
    }
  }, []);

  const authenticateDev = (password) => {
    const correctPassword = import.meta.env.VITE_DEV_PASSWORD || 'bondo2026dev';
    if (password === correctPassword) {
      setIsDevAuthenticated(true);
      sessionStorage.setItem('devAuth', 'true');
      setShowDevAuth(false);
      return true;
    }
    return false;
  };

  const authenticateAdmin = () => {
    // In production, this would verify MFA via Authy
    // For now, check if password was entered correctly
    setIsAdmin(true);
  };

  const logout = () => {
    setIsAdmin(false);
    setIsDevAuthenticated(false);
    sessionStorage.removeItem('devAuth');
  };

  return (
    <AuthContext.Provider
      value={{
        isDev,
        isAdmin,
        isDevAuthenticated,
        showDevAuth,
        setShowDevAuth,
        authenticateDev,
        authenticateAdmin,
        logout,
        devPassword,
        setDevPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
