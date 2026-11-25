/**
 * AuthContext.jsx — Authentication Context for CareerTwin AI
 * Connected to FastAPI backend JWT endpoints.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { validateEmailQuality, validatePasswordStrength } from '../utils/validation';

const AuthContext = createContext(null);

const AUTH_USER_KEY = 'careertwin_auth_user';

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

  /**
   * Log out active session
   */
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  }, []);

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
  }, [token, logout]);

  const persistAuthSession = useCallback((res) => {
    const activeUser = {
      id: res.user.id,
      name: res.user.full_name,
      email: res.user.email,
      role: res.user.role,
      authProvider: res.user.auth_provider || 'local',
      token: res.access_token,
      loggedInAt: new Date().toISOString(),
    };
    setUser(activeUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(activeUser));
    return activeUser;
  }, []);

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
      const activeUser = persistAuthSession(res);
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
      const activeUser = persistAuthSession(res);
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
   * Initiate real Google OAuth 2.0 Authorization Code flow
   */
  const loginWithGoogle = useCallback(async (redirectPath = '/dashboard') => {
    try {
      const res = await api.getGoogleAuthUrl(redirectPath);
      if (res?.authorization_url) {
        window.location.assign(res.authorization_url);
        return { success: true, redirecting: true };
      }
      return {
        success: false,
        notConfigured: true,
        error: 'Unable to obtain Google authorization URL.',
      };
    } catch (err) {
      if (err.status === 503) {
        return {
          success: false,
          notConfigured: true,
          error: err.message || 'Google OAuth credentials are not configured on the backend server.',
        };
      }
      return {
        success: false,
        error: err.message || 'Failed to initiate Google Sign-In.',
      };
    }
  }, []);

  /**
   * Complete Google OAuth sign-in by exchanging single-use callback ticket for JWT
   */
  const completeGoogleLogin = useCallback(async (ticket) => {
    try {
      const res = await api.exchangeGoogleTicket(ticket);
      const activeUser = persistAuthSession(res);
      return { success: true, user: activeUser };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Failed to finalize Google Sign-In session.',
      };
    }
  }, [persistAuthSession]);

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
   * Log out active session is hoisted above
   */

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        register,
        loginWithGoogle,
        completeGoogleLogin,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
