import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiClient } from '../lib/apiClient';
import { connectSocket, disconnectSocket } from '../lib/socket';
import { queryClient } from '../lib/queryClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    const token = localStorage.getItem('vybeboard_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await apiClient.get('/auth/me');
      setUser(data.user);
      connectSocket(token);
    } catch {
      localStorage.removeItem('vybeboard_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = async (credentials) => {
    const { data } = await apiClient.post('/auth/login', credentials);
    localStorage.setItem('vybeboard_token', data.token);
    setUser(data.user);
    connectSocket(data.token);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await apiClient.post('/auth/register', payload);
    localStorage.setItem('vybeboard_token', data.token);
    setUser(data.user);
    connectSocket(data.token);
    return data.user;
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('vybeboard_token');
      disconnectSocket();
      // Clear the entire React Query cache so the next user
      // never sees any data belonging to the previous session.
      queryClient.clear();
      setUser(null);
    }
  };

  const updateUser = (partial) => setUser((prev) => ({ ...prev, ...partial }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
