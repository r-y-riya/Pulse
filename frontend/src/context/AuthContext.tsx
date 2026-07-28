import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile, UserSettings, MacroTargets } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; profile?: Partial<UserProfile>; settings?: Partial<UserSettings>; macroTargets?: Partial<MacroTargets> }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('momentum_token');
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data);
        } catch (err) {
          console.error("Failed to load user profile:", err);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, refreshToken, user: userData } = res.data;
      localStorage.setItem('momentum_token', token);
      localStorage.setItem('momentum_refresh_token', refreshToken);
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { token, refreshToken, user: userData } = res.data;
      localStorage.setItem('momentum_token', token);
      localStorage.setItem('momentum_refresh_token', refreshToken);
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('momentum_token');
    localStorage.removeItem('momentum_refresh_token');
    setUser(null);
  };

  const updateProfile = async (data: any) => {
    const res = await api.put('/auth/profile', data);
    setUser(prev => prev ? { ...prev, ...res.data } : null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
