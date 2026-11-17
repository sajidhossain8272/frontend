'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('doctor_tracker_token');
        const savedUser = localStorage.getItem('doctor_tracker_user');

        if (savedToken) {
          setToken(savedToken);
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }

          // Verify token against backend
          try {
            const res = await api.getMe();
            if (res.success && res.data.user) {
              setUser(res.data.user);
              localStorage.setItem('doctor_tracker_user', JSON.stringify(res.data.user));
            }
          } catch {
            // If offline, keep local user session active for resilience
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.login({ email, password });
      if (response.success && response.data) {
        const { user: loggedInUser, token: authToken } = response.data;
        setUser(loggedInUser);
        setToken(authToken);
        localStorage.setItem('doctor_tracker_token', authToken);
        localStorage.setItem('doctor_tracker_user', JSON.stringify(loggedInUser));
        router.push('/');
      }
    } catch (error: any) {
      // If backend unreachable, allow demo admin session
      if (
        email.toLowerCase() === 'admin@doctortracker.com' &&
        password === 'Password@123' &&
        error.message.includes('backend')
      ) {
        const demoUser: User = {
          id: 'demo-admin-id',
          name: 'System Administrator (Demo)',
          email: 'admin@doctortracker.com',
          role: 'admin',
        };
        const demoToken = 'demo-jwt-token-careguide-2026';
        setUser(demoUser);
        setToken(demoToken);
        localStorage.setItem('doctor_tracker_token', demoToken);
        localStorage.setItem('doctor_tracker_user', JSON.stringify(demoUser));
        router.push('/');
        return;
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('doctor_tracker_token');
    localStorage.removeItem('doctor_tracker_user');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
