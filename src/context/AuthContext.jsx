import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null); // { id, email, role }
  const [adminToken, setAdminToken] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true); // true while checking stored token
  const [devPassword, setDevPassword] = useState('');
  const [isDevAuthenticated, setIsDevAuthenticated] = useState(false);

  // Check if this is dev environment
  const isDev = import.meta.env.VITE_ENVIRONMENT === 'dev' ||
                window.location.hostname.includes('dev.');

  // Restore dev auth + admin token from sessionStorage on mount
  useEffect(() => {
    if (sessionStorage.getItem('devAuth')) {
      setIsDevAuthenticated(true);
    }

    const storedToken = sessionStorage.getItem('adminToken');
    if (storedToken) {
      // Validate stored token against backend
      verifyToken(storedToken);
    } else {
      setAdminLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminToken(token);
        setAdminUser(data.admin);
      } else {
        // Token invalid/expired — clear it
        sessionStorage.removeItem('adminToken');
      }
    } catch {
      // Network error — clear stale token
      sessionStorage.removeItem('adminToken');
    } finally {
      setAdminLoading(false);
    }
  };

  const authenticateDev = (password) => {
    const correctPassword = import.meta.env.VITE_DEV_PASSWORD || 'bondo2026dev';
    if (password === correctPassword) {
      setIsDevAuthenticated(true);
      sessionStorage.setItem('devAuth', 'true');
      return true;
    }
    return false;
  };

  // Login admin via backend
  const loginAdmin = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setAdminToken(data.token);
    setAdminUser(data.admin);
    sessionStorage.setItem('adminToken', data.token);
    return data.admin;
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    setAdminUser(null);
    sessionStorage.removeItem('adminToken');
  };

  const logout = () => {
    logoutAdmin();
    setIsDevAuthenticated(false);
    sessionStorage.removeItem('devAuth');
  };

  const isAdmin = !!adminUser;

  return (
    <AuthContext.Provider
      value={{
        isDev,
        isAdmin,
        adminUser,
        adminToken,
        adminLoading,
        isDevAuthenticated,
        authenticateDev,
        loginAdmin,
        logoutAdmin,
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
