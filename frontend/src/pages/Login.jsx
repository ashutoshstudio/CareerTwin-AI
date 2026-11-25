/**
 * Login.jsx — Verified Sign In Page
 * Theme: Nordic Emerald Light & Frosted Crystal Glass
 */

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, UserPlus, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { validateEmailQuality } from '../utils/validation';
import { GoogleAuthModal } from '../components/GoogleAuthModal';
import { PersistentShiningDots } from '../components/PersistentShiningDots';

function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

function Login() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]             = useState({});
  const [globalError, setGlobalError]   = useState(null);
  const [accountNotFound, setAccountNotFound] = useState(false);
  const [shaking, setShaking]           = useState(false);

  // Google OAuth state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleLoading, setGoogleLoading]         = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const OAUTH_ERROR_MESSAGES = {
    cancelled: 'Google Sign-In was cancelled. You can try again or use email and password.',
    oauth_denied: 'Google authentication access was denied.',
    invalid_state: 'Security verification (CSRF state) expired or did not match. Please try again.',
    missing_code: 'Google did not return an authorization code. Please try again.',
    invalid_code: 'Authorization code expired or already used. Please try signing in again.',
    token_exchange_failed: 'Failed to communicate with Google authentication servers.',
    invalid_token: 'Google identity verification failed or token expired.',
    unverified_email: 'Your Google account email address is not verified.',
    account_conflict: 'This email address is already linked to a different Google account.',
    inactive_account: 'Your account is currently inactive. Please contact support.',
  };
  const oauthErrorCode = searchParams.get('oauth_error');
  const oauthErrorText = oauthErrorCode
    ? (OAUTH_ERROR_MESSAGES[oauthErrorCode] || 'Google authentication failed. Please try again.')
    : null;
  const activeGlobalError = globalError || oauthErrorText;

  const validate = () => {
    const newErrors = {};
    const emailCheck = validateEmailQuality(email);
    if (!emailCheck.valid) {
      newErrors.email = emailCheck.error;
    }

    if (!password.trim()) {
      newErrors.password = 'Please enter your password.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError(null);
    setAccountNotFound(false);

    if (!validate()) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email, password });
      if (!res.success) {
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
        if (res.unauthorized) {
          setGlobalError('Incorrect email or password. Please verify your credentials.');
        } else {
          setGlobalError(res.error || 'Authentication failed. Please check your credentials.');
        }
        return;
      }

      navigate(redirectUrl, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGlobalError(null);
    setAccountNotFound(false);
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle(redirectUrl);
      if (!res.success) {
        if (res.notConfigured) {
          setIsGoogleModalOpen(true);
        } else {
          setGlobalError(res.error || 'Could not start Google Sign-In.');
        }
        setGoogleLoading(false);
      }
    } catch {
      setGlobalError('Unable to reach backend authentication server.');
      setGoogleLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    setIsGoogleModalOpen(false);
    navigate(redirectUrl, { replace: true });
  };

  return (
    <div id="page-login" className="auth-page" style={{ position: 'relative' }}>
      <PersistentShiningDots count={45} />
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          x: shaking ? [-8, 8, -6, 6, -3, 3, 0] : 0,
        }}
        transition={{
          duration: shaking ? 0.45 : 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 24,
          padding: '40px 36px',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08), 0 0 35px rgba(16, 185, 129, 0.12)',
          maxWidth: 440,
          width: '100%',
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--emerald)', fontSize: '1.2rem', marginBottom: 16,
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)',
        }}>
          ◈
        </div>

        <h1 className="auth-card__title" style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-strong)', marginBottom: 6 }}>
          Welcome back
        </h1>
        <p className="auth-card__subtitle" style={{ fontSize: '.9rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          Sign in to continue to your dashboard
        </p>

        {/* Informative redirect badge */}
        {redirectUrl && redirectUrl !== '/dashboard' && !activeGlobalError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: '.82rem',
              color: 'var(--emerald)',
              fontWeight: 600,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Sparkles size={15} />
            <span>Sign in to access your chosen career tool.</span>
          </motion.div>
        )}

        {/* Global / Not Found Error Alert */}
        <AnimatePresence>
          {activeGlobalError && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 12,
                padding: '14px 16px',
                fontSize: '.84rem',
                color: '#dc2626',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: accountNotFound ? 10 : 0 }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{activeGlobalError}</span>
              </div>

              {accountNotFound && (
                <Link
                  to={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    background: 'var(--grad-emerald)',
                    color: '#ffffff',
                    borderRadius: 99,
                    fontSize: '.78rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    marginTop: 4,
                  }}
                >
                  <UserPlus size={13} /> Create an Account Now →
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email input group */}
          <div className="form-group" style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="form-label" htmlFor="login-email" style={{ margin: 0 }}>
                Email Address
              </label>
              <AnimatePresence>
                {errors.email && (
                  <motion.span
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    style={{
                      fontSize: '.74rem',
                      color: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontWeight: 600,
                      maxWidth: '65%',
                      textAlign: 'right',
                    }}
                  >
                    <AlertCircle size={12} style={{ flexShrink: 0 }} /> {errors.email}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: errors.email ? '#dc2626' : 'var(--text-muted)',
                  pointerEvents: 'none',
                  transition: 'color 0.2s',
                }}
              />
              <input
                className="form-input"
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setGlobalError(null);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                }}
                placeholder="you@example.com"
                autoComplete="email"
                style={{
                  paddingLeft: 42,
                  borderColor: errors.email ? 'rgba(239, 68, 68, 0.7)' : undefined,
                  boxShadow: errors.email ? '0 0 12px rgba(239, 68, 68, 0.15)' : undefined,
                }}
              />
            </div>
          </div>

          {/* Password input group */}
          <div className="form-group" style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="form-label" htmlFor="login-password" style={{ margin: 0 }}>
                Password
              </label>
              <AnimatePresence>
                {errors.password && (
                  <motion.span
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    style={{
                      fontSize: '.74rem',
                      color: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontWeight: 600,
                      maxWidth: '65%',
                      textAlign: 'right',
                    }}
                  >
                    <AlertCircle size={12} style={{ flexShrink: 0 }} /> {errors.password}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: errors.password ? '#dc2626' : 'var(--text-muted)',
                  pointerEvents: 'none',
                  transition: 'color 0.2s',
                }}
              />
              <input
                className="form-input"
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setGlobalError(null);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  paddingLeft: 42,
                  paddingRight: 42,
                  borderColor: errors.password ? 'rgba(239, 68, 68, 0.7)' : undefined,
                  boxShadow: errors.password ? '0 0 12px rgba(239, 68, 68, 0.15)' : undefined,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="form-submit"
            id="login-submit-btn"
            disabled={loading}
            style={{
              padding: '14px',
              fontSize: '.95rem',
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 20,
            }}
          >
            {loading ? 'Signing In...' : <>Sign In <span className="btn__arrow">→</span></>}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 18,
        }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(15, 23, 42, 0.1)' }} />
          <span style={{ fontSize: '.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>
            or continue with
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(15, 23, 42, 0.1)' }} />
        </div>

        {/* ── Google Sign In Button (Initiates Real Google OAuth) ─── */}
        <motion.button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          whileHover={{ scale: googleLoading ? 1 : 1.02, y: googleLoading ? 0 : -1 }}
          whileTap={{ scale: 0.98 }}
          id="google-signin-btn"
          style={{
            width: '100%',
            padding: '12px 18px',
            borderRadius: 14,
            border: '1px solid rgba(15, 23, 42, 0.12)',
            background: '#ffffff',
            color: 'var(--text-strong)',
            fontSize: '.92rem',
            fontWeight: 700,
            cursor: googleLoading ? 'wait' : 'pointer',
            opacity: googleLoading ? 0.75 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.05)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.12)';
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(15, 23, 42, 0.05)';
          }}
        >
          <GoogleIcon size={19} />
          <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </motion.button>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '.84rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <Link
            to={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            style={{ color: 'var(--emerald)', fontWeight: 700, textDecoration: 'none' }}
          >
            Create an account →
          </Link>
        </p>
      </motion.div>

      {/* Google Verified Account Picker Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
      />
    </div>
  );
}

export default Login;
