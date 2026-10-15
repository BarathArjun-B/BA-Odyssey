import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const isDevBypass = import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS !== 'false';

const DEV_USER = {
  id: 'dev-founder',
  firstName: 'Commander',
  lastName: '',
  username: 'founder',
  email: 'founder@odyssey.local',
  isDevBypass: true
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(isDevBypass ? DEV_USER : null);
  const [loading, setLoading] = useState(true);
  const isCheckingRef = useRef(false);

  const checkAuth = async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data.user);
    } catch {
      if (isDevBypass) {
        try {
          // Attempt login with local dev credentials
          const { data: loginData } = await api.post('/auth/login', {
            email: 'founder@odyssey.local',
            password: 'Password123!',
          });
          if (loginData?.data?.accessToken) {
            localStorage.setItem('ba_access_token', loginData.data.accessToken);
            setUser(loginData.data.user);
            return;
          }
        } catch {
          // If login fails, attempt to register the local dev user
          try {
            const { data: regData } = await api.post('/auth/register', {
              firstName: 'Commander',
              lastName: 'Odyssey',
              username: 'founder',
              email: 'founder@odyssey.local',
              password: 'Password123!',
            });
            if (regData?.data?.accessToken) {
              localStorage.setItem('ba_access_token', regData.data.accessToken);
              setUser(regData.data.user);
              return;
            }
          } catch {
            // Backend offline or unreachable, fall back to DEV_USER object
            setUser(DEV_USER);
          }
        }
      } else {
        setUser(null);
      }
    } finally {
      isCheckingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth();

    const handleUnauthorized = () => {
      if (isDevBypass) {
        checkAuth();
      } else {
        setUser(null);
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data?.data?.accessToken) {
      localStorage.setItem('ba_access_token', data.data.accessToken);
    }
    setUser(data.data.user);
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    if (data?.data?.accessToken) {
      localStorage.setItem('ba_access_token', data.data.accessToken);
    }
    setUser(data.data.user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors in dev bypass mode if backend server is not running
    } finally {
      localStorage.removeItem('ba_access_token');
      if (isDevBypass) {
        setUser(DEV_USER);
      } else {
        setUser(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-muted font-catalogue animate-pulse">Initializing Interface...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isDevBypass, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

