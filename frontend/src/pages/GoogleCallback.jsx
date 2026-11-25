/**
 * GoogleCallback.jsx — Handles OAuth 2.0 redirect completion
 * Validates single-use ticket from FastAPI callback, establishes CareerTwin JWT session,
 * and navigates safely to the user's dashboard or requested destination.
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';

function sanitizeDestination(raw) {
  if (!raw || typeof raw !== 'string') return '/dashboard';
  const clean = raw.trim();
  if (!clean.startsWith('/') || clean.startsWith('//')) return '/dashboard';
  return clean;
}

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeGoogleLogin } = useAuth();
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    queueMicrotask(async () => {
      if (isCancelled) return;
      const ticket = searchParams.get('ticket');
      const oauthError = searchParams.get('oauth_error');
      const target = sanitizeDestination(searchParams.get('redirect'));

      if (oauthError) {
        navigate(`/login?oauth_error=${encodeURIComponent(oauthError)}`, { replace: true });
        return;
      }

      if (!ticket) {
        setErrorMsg('Missing authentication ticket from Google sign-in callback.');
        return;
      }

      const res = await completeGoogleLogin(ticket);
      if (isCancelled) return;

      if (res.success) {
        navigate(target, { replace: true });
      } else {
        setErrorMsg(res.error || 'Could not finalize Google Sign-In session.');
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [searchParams, completeGoogleLogin, navigate]);

  return (
    <div id="page-google-callback" className="auth-page" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div
        className="auth-card"
        style={{
          background: 'rgba(255, 255, 255, 0.96)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 24,
          padding: '40px 32px',
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
        }}
      >
        {!errorMsg ? (
          <div style={{ padding: '20px 0' }}>
            <Loading message="Completing secure Google Sign-In..." />
            <p style={{ marginTop: 14, fontSize: '.85rem', color: 'var(--text-muted)' }}>
              Verifying credentials and preparing your CareerTwin dashboard...
            </p>
          </div>
        ) : (
          <div>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertCircle size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-strong)', marginBottom: 8 }}>
              Google Sign-In Failed
            </h2>
            <p style={{ fontSize: '.86rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 22 }}>
              {errorMsg}
            </p>
            <Link
              to="/login"
              className="btn btn--primary"
              style={{ display: 'inline-block', padding: '10px 22px', textDecoration: 'none', fontWeight: 700, fontSize: '.88rem' }}
            >
              Return to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
