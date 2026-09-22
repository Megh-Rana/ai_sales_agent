import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setServiceToken } from '../services/dataBackboneService';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthUser {
  user_id: string;
  email: string;
  role: 'admin' | 'sales_rep' | string;
  full_name: string | null;
  must_change_password?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  changePassword: (newPassword: string, oldPassword?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'vidur_auth_token';
const USER_KEY = 'vidur_auth_user';
const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ── sessionStorage persistence ──
  // Survives page refreshes within the same tab.
  // Cleared automatically when the browser window/tab is closed.
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = sessionStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!token && !!user;

  // Sync token and user to sessionStorage on every change
  useEffect(() => {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
      setServiceToken(token);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
      setServiceToken(null);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(USER_KEY);
    }
  }, [user]);

  // Sync service token on initial load (sessionStorage restore)
  useEffect(() => {
    if (token) setServiceToken(token);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Authentication failed.' }));
        const detail = errorData.detail ?? 'Authentication failed.';
        // Attach status for lockout detection
        const err = new Error(detail) as Error & { status: number };
        err.status = response.status;
        throw err;
      }

      const data = await response.json();
      const newToken = data.access_token;
      setToken(newToken);
      setUser({
        user_id: data.user_id,
        email: data.email,
        role: data.role,
        full_name: data.full_name ?? null,
        must_change_password: !!data.must_change_password,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (newPassword: string, oldPassword?: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          new_password: newPassword,
          old_password: oldPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to update password.' }));
        throw new Error(errorData.detail ?? 'Failed to update password.');
      }

      setUser((prev) => (prev ? { ...prev, must_change_password: false } : null));
    } finally {
      setLoading(false);
    }
  }, [token]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setServiceToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, isAuthenticated, login, changePassword, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
