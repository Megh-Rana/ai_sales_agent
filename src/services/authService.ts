/**
 * Authentication Service for Vidur Sales Platform.
 * Communicates with backend /api/auth endpoints and manages session storage.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'vidur_access_token';
const USER_KEY = 'vidur_auth_user';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export const authService = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getUser(): AuthUser | null {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && token.length > 10;
  },

  setSession(token: string, user: AuthUser): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to store session:', e);
    }
  },

  clearSession(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
  },

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let detail = 'Invalid email or password';
      try {
        const err = await res.json();
        detail = err.detail || detail;
      } catch {
        // use fallback
      }
      throw new Error(detail);
    }

    const data: AuthResponse = await res.json();
    this.setSession(data.access_token, data.user);
    return data;
  },

  async register(email: string, password: string, name?: string, company?: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, company }),
    });

    if (!res.ok) {
      let detail = 'Registration failed';
      try {
        const err = await res.json();
        detail = err.detail || detail;
      } catch {
        // use fallback
      }
      throw new Error(detail);
    }

    const data: AuthResponse = await res.json();
    this.setSession(data.access_token, data.user);
    return data;
  },

  logout(): void {
    this.clearSession();
  },
};
