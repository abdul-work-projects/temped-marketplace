'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserType } from '@/types';
import { mockUsers } from '@/lib/data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, type: UserType) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const foundUser = mockUsers.find(u => u.email === email);

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  const loginWithGoogle = async () => {
    // Simulate Google OAuth
    await new Promise(resolve => setTimeout(resolve, 800));

    // For demo, log in as first teacher
    const demoUser = mockUsers[0];
    setUser(demoUser);
    localStorage.setItem('currentUser', JSON.stringify(demoUser));
    return { success: true };
  };

  const signup = async (email: string, password: string, type: UserType) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user already exists
    if (mockUsers.find(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      type,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
