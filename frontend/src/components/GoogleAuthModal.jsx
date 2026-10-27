/**
 * GoogleAuthModal.jsx — Google OAuth Notice Modal
 * Informs the user when Google OAuth credentials are not configured in the environment,
 * and provides clear guidance and immediate navigation to the working email/password flow.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function GoogleIcon({ size = 24 }) {
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

export function GoogleAuthModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.55)',
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
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: '#ffffff',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 24,
            padding: '32px 30px',
            maxWidth: 440,
            width: '100%',
            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.15), 0 0 40px rgba(16, 185, 129, 0.1)',
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
              transition: 'background 0.2s',
            }}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'rgba(15, 23, 42, 0.04)',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <GoogleIcon size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-strong)', margin: 0 }}>
                Google Sign-In
              </h2>
              <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', margin: 0 }}>
                OAuth 2.0 Status Notice
              </p>
            </div>
          </div>

          {/* Status Box */}
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 14,
              padding: '16px',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b45309', fontWeight: 700, fontSize: '.86rem', marginBottom: 6 }}>
              <ShieldAlert size={17} style={{ flexShrink: 0 }} />
              <span>OAuth Not Configured in Development</span>
            </div>
            <p style={{ fontSize: '.82rem', color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>
              Google OAuth authentication requires production credentials (Google Cloud Client ID & Secret).
              In this local development environment, please use standard <strong>Email & Password</strong> authentication.
            </p>
          </div>

          {/* Working Alternative */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 8 }}>
              Working Alternative:
            </h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '12px 14px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 12,
                fontSize: '.82rem',
                color: 'var(--text)',
                lineHeight: 1.5,
              }}
            >
              <Mail size={16} style={{ color: 'var(--emerald)', flexShrink: 0, marginTop: 2 }} />
              <div>
                Full email registration and login is active and connected to the <strong>FastAPI backend with SQLite</strong>.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn--primary"
              style={{
                width: '100%',
                padding: '12px 20px',
                fontSize: '.9rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              Continue with Email & Password <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'transparent',
                border: '1px solid rgba(15, 23, 42, 0.12)',
                borderRadius: 12,
                fontSize: '.82rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default GoogleAuthModal;
