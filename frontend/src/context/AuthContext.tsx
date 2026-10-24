import React, { createContext, useContext, useState } from 'react';
import type { Role, UserProfile } from '../types';

interface AuthContextType {
  currentUser: UserProfile | null;
  role: Role | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('clubpulse_token'));
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('clubpulse_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email: string, password: string) => {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    setToken(data.accessToken);
    setCurrentUser(data.user);
    localStorage.setItem('clubpulse_token', data.accessToken);
    localStorage.setItem('clubpulse_user', JSON.stringify(data.user));
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    setToken(data.accessToken);
    setCurrentUser(data.user);
    localStorage.setItem('clubpulse_token', data.accessToken);
    localStorage.setItem('clubpulse_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('clubpulse_token');
    localStorage.removeItem('clubpulse_user');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser ? currentUser.role : null,
        isAuthenticated: !!token && !!currentUser,
        token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
