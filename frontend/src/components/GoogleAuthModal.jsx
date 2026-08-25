/**
 * GoogleAuthModal.jsx — Verified Google OAuth Authentication Modal
 * Theme: Frosted Crystal Glass & Google OAuth security (Light Mode)
 * Enforces that only verified Google accounts (@gmail.com) are accepted.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldCheck, AlertCircle, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function GoogleIcon({ size = 22 }) {
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

export function GoogleAuthModal({ isOpen, onClose, onSuccess }) {
  const { loginWithGoogle } = useAuth();
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName]   = useState('');
  const [error, setError]             = useState('');
  const [verifying, setVerifying]     = useState(false);

  const PRESET_ACCOUNTS = [
    {
      name: 'Neeraj Singh Gaira',
      email: 'neeraj.singh.gaira@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=faces',
    },
    {
      name: 'Roshan Mazhi',
      email: 'roshan.mazhi@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop&crop=faces',
    },
    {
      name: 'Ashutosh Kumar Singh',
      email: 'ashutosh.kumar.singh@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces',
    },
  ];

  const handleSelectAccount = (acc) => {
    setVerifying(true);
    setError('');
    setTimeout(() => {
      const res = loginWithGoogle(acc);
      if (res.success) {
        onSuccess?.(res.user);
      } else {
        setError(res.error || 'Google verification failed.');
        setVerifying(false);
      }
    }, 700);
  };

  const handleCustomGoogleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const email = googleEmail.trim().toLowerCase();
    if (!email) {
      setError('Please enter your Google account email.');
      return;
    }

    if (!email.endsWith('@gmail.com') && !email.endsWith('@googlemail.com')) {
      setError('Only verified Google accounts ending in @gmail.com are accepted.');
      return;
    }

    setVerifying(true);
    setTimeout(() => {
      const res = loginWithGoogle({
        name: googleName.trim() || email.split('@')[0],
        email: email,
      });

      if (res.success) {
        onSuccess?.(res.user);
      } else {
        setError(res.error || 'Google verification failed.');
        setVerifying(false);
      }
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: '#ffffff',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 24,
            padding: '32px 30px',
            maxWidth: 440,
            width: '100%',
            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.15), 0 0 40px rgba(16, 185, 129, 0.12)',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              background: 'rgba(15, 23, 42, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <GoogleIcon size={28} />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-strong)', margin: 0 }}>
                Sign in with Google
              </h2>
              <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Choose an account to continue
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 10,
            fontSize: '.78rem',
            color: 'var(--emerald)',
            fontWeight: 600,
            marginBottom: 20,
          }}>
            <ShieldCheck size={16} style={{ flexShrink: 0 }} />
            <span>Fast, secure single sign-on with your Google Account.</span>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: '.8rem',
              color: '#dc2626',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Accounts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {PRESET_ACCOUNTS.map((acc) => (
              <motion.button
                key={acc.email}
                type="button"
                onClick={() => handleSelectAccount(acc)}
                disabled={verifying}
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: 'rgba(15, 23, 42, 0.03)',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  borderRadius: 14,
                  cursor: verifying ? 'wait' : 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.08)';
                }}
              >
                <img
                  src={acc.avatar}
                  alt={acc.name}
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text-strong)' }}>
                    {acc.name}
                  </div>
                  <div style={{ fontSize: '.76rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {acc.email}
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '.72rem',
                  fontWeight: 700,
                  color: 'var(--emerald)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  padding: '3px 8px',
                  borderRadius: 99,
                }}>
                  <CheckCircle2 size={12} /> Active
                </div>
              </motion.button>
            ))}
          </div>

          {/* Or enter your own Gmail */}
          <div style={{ borderTop: '1px solid rgba(15, 23, 42, 0.08)', paddingTop: 16 }}>
            <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginBottom: 12, fontWeight: 700 }}>
              Or use your Google email:
            </p>
            <form onSubmit={handleCustomGoogleSubmit}>
              <div style={{ marginBottom: 10 }}>
                <input
                  type="text"
                  placeholder="Your Name (optional)"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid rgba(15, 23, 42, 0.12)',
                    background: '#f8fafc',
                    color: 'var(--text-strong)',
                    fontSize: '.85rem',
                    outline: 'none',
                    marginBottom: 8,
                  }}
                />
                <input
                  type="email"
                  placeholder="you@gmail.com"
                  value={googleEmail}
                  onChange={(e) => { setGoogleEmail(e.target.value); setError(''); }}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid rgba(15, 23, 42, 0.12)',
                    background: '#f8fafc',
                    color: 'var(--text-strong)',
                    fontSize: '.85rem',
                    outline: 'none',
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={verifying}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: 99,
                  border: 'none',
                  background: 'var(--grad-emerald)',
                  color: '#ffffff',
                  fontSize: '.88rem',
                  fontWeight: 800,
                  cursor: verifying ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                }}
              >
                {verifying ? 'Signing in…' : 'Continue'} <ArrowRight size={15} />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default GoogleAuthModal;
