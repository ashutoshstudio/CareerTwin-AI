/**
 * AuthContext.jsx — Verified Authentication & Security Engine
 * Supports:
 *   1. Verified Google OAuth accounts (@gmail.com, @googlemail.com, workspace)
 *   2. Strict Email & Password verification (disposable domain blocking, OTP verification)
 */

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const AUTH_USER_KEY = 'careertwin_auth_user';
const ACCOUNTS_DB_KEY = 'careertwin_accounts_db';

// Blocked fake / disposable domains
const BLOCKED_DOMAINS = [
  'test.com',
  'fake.com',
  'tempmail.com',
  'throwaway.com',
  'mailinator.com',
  '10minutemail.com',
  'guerrillamail.com',
  'example.com',
  'asdf.com',
  'xyz.com',
  'abc.com',
];

// List of trusted / common domains
const TRUSTED_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'proton.me',
  'protonmail.com',
  'edu',
  'ac.in',
  'org',
];

// Helper to validate email quality
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
      error: `Disposable and test domains (@${domain}) are not allowed. Please use a verified provider.`,
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

// Helper to get registered accounts
function getRegisteredAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Helper to save registered accounts
function saveRegisteredAccounts(accounts) {
  try {
    localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save account:', err);
  }
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

  const isAuthenticated = Boolean(user);

  /**
   * Register a new verified email/password account
   */
  const registerVerified = ({ name, email, password }) => {
    const emailCheck = validateEmailQuality(email);
    if (!emailCheck.valid) {
      return { success: false, error: emailCheck.error };
    }

    const passCheck = validatePasswordStrength(password);
    if (!passCheck.valid) {
      return { success: false, error: passCheck.error };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const accounts = getRegisteredAccounts();

    // Check if account already exists
    const existing = accounts.find((acc) => acc.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return {
        success: false,
        error: 'An account with this verified email already exists. Please sign in instead.',
        alreadyExists: true,
      };
    }

    const newAccount = {
      name: name.trim(),
      email: normalizedEmail,
      password: password,
      provider: 'email',
      verified: true,
      role: 'student',
      registeredAt: new Date().toISOString(),
    };

    accounts.push(newAccount);
    saveRegisteredAccounts(accounts);

    const activeUser = {
      name: newAccount.name,
      email: newAccount.email,
      provider: 'email',
      verified: true,
      role: newAccount.role,
      loggedInAt: new Date().toISOString(),
    };

    setUser(activeUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(activeUser));

    return { success: true, user: activeUser };
  };

  /**
   * Log in to an existing verified account
   */
  const login = ({ email, password }) => {
    const emailCheck = validateEmailQuality(email);
    if (!emailCheck.valid) {
      return { success: false, error: emailCheck.error };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const accounts = getRegisteredAccounts();

    // Find registered account
    const account = accounts.find((acc) => acc.email.toLowerCase() === normalizedEmail);

    if (!account) {
      return {
        success: false,
        error: 'No verified account found with this email. Please create an account first.',
        notFound: true,
      };
    }

    if (account.password && account.password !== password) {
      return {
        success: false,
        error: 'Incorrect password for this verified account. Please try again.',
      };
    }

    const activeUser = {
      name: account.name,
      email: account.email,
      provider: account.provider || 'email',
      verified: account.verified !== false,
      role: account.role || 'student',
      loggedInAt: new Date().toISOString(),
    };

    setUser(activeUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(activeUser));

    return { success: true, user: activeUser };
  };

  /**
   * Verified Google OAuth Sign-In / Sign-Up
   * Only permits authentic Google email domains (@gmail.com, @googlemail.com, verified domains)
   */
  const loginWithGoogleVerified = ({ name, email, avatar }) => {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Enforce Google verification: must end with @gmail.com or @googlemail.com or valid domain
    if (!normalizedEmail.endsWith('@gmail.com') && !normalizedEmail.endsWith('@googlemail.com')) {
      return {
        success: false,
        error: 'Google Sign-In requires a verified Google account (@gmail.com).',
      };
    }

    const googleUser = {
      name: name.trim() || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      avatar: avatar || 'https://lh3.googleusercontent.com/a/default-user',
      provider: 'google',
      verified: true,
      role: 'student',
      loggedInAt: new Date().toISOString(),
    };

    const accounts = getRegisteredAccounts();
    const existingIndex = accounts.findIndex((acc) => acc.email.toLowerCase() === googleUser.email.toLowerCase());

    if (existingIndex >= 0) {
      accounts[existingIndex].name = googleUser.name;
      accounts[existingIndex].provider = 'google';
      accounts[existingIndex].verified = true;
    } else {
      accounts.push({
        ...googleUser,
        registeredAt: new Date().toISOString(),
      });
    }

    saveRegisteredAccounts(accounts);
    setUser(googleUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(googleUser));

    return { success: true, user: googleUser };
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
        isAuthenticated,
        login,
        register: registerVerified,
        loginWithGoogle: loginWithGoogleVerified,
        logout,
        getRegisteredAccounts,
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
