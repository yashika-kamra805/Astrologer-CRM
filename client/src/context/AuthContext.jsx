import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getToken, removeToken, setToken } from '../lib/auth';
import * as authApi from '../features/auth/services/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      setUser(res.data.astrologer);
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    setToken(res.data.accessToken);
    setUser(res.data.astrologer);
    return res;
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    setToken(res.data.accessToken);
    setUser(res.data.astrologer);
    return res;
  };

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, isAuthenticated: !!user }),
    [user, loading, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
