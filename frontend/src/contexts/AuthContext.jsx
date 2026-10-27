/**
 * AuthContext.jsx — Authentication Context for CareerTwin AI
 * Connected to FastAPI backend JWT endpoints.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

const AUTH_USER_KEY = 'careertwin_auth_user';

// Helper to validate email quality (format & disposable domains)
const BLOCKED_DOMAINS = [
  'test.com',
  'fake.com',
  'tempmail.com',
  'throwaway.com',
  'mailinator.com',
  '10minutemail.com',
  'guerrillamail.com',
  'asdf.com',
  'xyz.com',
  'abc.com',
];

export function validateEmailQuality(email) {
  const normalized = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(normalized)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }

  const domain = normalized.split('@')[1];
  if (BLOCKED_DOMAINS.includes(domain)) {
    return {
      valid: false,
      error: `Disposable and test domains (@${domain}) are not allowed. Please use an authentic email address.`,
    };
  }

  return { valid: true, domain };
}

// Helper to validate password strength
export function validatePasswordStrength(password) {
  if (!password || password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long.' };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    return { valid: false, error: 'Password must contain both letters and numbers.' };
  }
  return { valid: true };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = Boolean(user && user.token);
  const token = user?.token || null;

  // Automatically detect and clear stale or expired session tokens
  useEffect(() => {
    // 1. Validate stored token on mount
    if (token) {
      api.getProfile(token).catch((err) => {
        if (err.status === 401) {
          logout();
        }
      });
    }

    // 2. Listen for auth expiration events dispatched by API service
    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener('careertwin:auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('careertwin:auth-expired', handleAuthExpired);
    };
  }, [token]);

  /**
   * Register a new user with FastAPI backend
   */
  const register = async ({ name, email, password }) => {
    const emailCheck = validateEmailQuality(email);
    if (!emailCheck.valid) {
      return { success: false, error: emailCheck.error };
    }

    const passCheck = validatePasswordStrength(password);
    if (!passCheck.valid) {
      return { success: false, error: passCheck.error };
    }

    try {
      const res = await api.register({ name, email, password });
      const activeUser = {
        id: res.user.id,
        name: res.user.full_name,
        email: res.user.email,
        role: res.user.role,
        token: res.access_token,
        loggedInAt: new Date().toISOString(),
      };

      setUser(activeUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(activeUser));
      return { success: true, user: activeUser };
    } catch (err) {
      if (err.status === 409) {
        return {
          success: false,
          error: 'An account with this email address already exists. Please sign in instead.',
          alreadyExists: true,
        };
      }
      return {
        success: false,
        error: err.message || 'Registration failed. Please check that the backend server is running.',
      };
    }
  };

  /**
   * Log in to existing account with FastAPI backend
   */
  const login = async ({ email, password }) => {
    const emailCheck = validateEmailQuality(email);
    if (!emailCheck.valid) {
      return { success: false, error: emailCheck.error };
    }

    try {
      const res = await api.login({ email, password });
      const activeUser = {
        id: res.user.id,
        name: res.user.full_name,
        email: res.user.email,
        role: res.user.role,
        token: res.access_token,
        loggedInAt: new Date().toISOString(),
      };

      setUser(activeUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(activeUser));
      return { success: true, user: activeUser };
    } catch (err) {
      if (err.status === 401) {
        return {
          success: false,
          error: 'Incorrect email or password. Please verify your credentials.',
          unauthorized: true,
        };
      }
      return {
        success: false,
        error: err.message || 'Authentication failed. Please verify the backend server is running.',
      };
    }
  };

  /**
   * Google OAuth handler notice
   */
  const loginWithGoogle = async () => {
    return {
      success: false,
      error: 'Google OAuth authentication requires production OAuth credentials. Please register or sign in using your email and password.',
    };
  };

  /**
   * Update active user attributes in context
   */
  const updateUser = (updates) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  /**
   * Log out active session
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        register,
        loginWithGoogle,
        updateUser,
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

export default AuthContext;
