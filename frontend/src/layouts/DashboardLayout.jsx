/**
 * DashboardLayout.jsx — Protected Student Dashboard Layout
 * Checks authentication: redirects guests/new users to /login
 */

import { Component, Suspense } from 'react';
import { Outlet, NavLink, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';

// Layout-level Error Boundary to prevent any child module crash from blanking the dashboard
class DashboardErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard module rendering error caught by DashboardErrorBoundary:', error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.pathname !== this.props.pathname && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '60px 24px', textAlign: 'center', maxWidth: 640, margin: '40px auto' }}>
          <div style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 20,
            padding: '36px 32px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              color: '#ef4444',
            }}>
              <AlertCircle size={30} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', marginBottom: 8 }}>
              Unable to Display Module
            </h2>
            <p style={{ fontSize: '.88rem', color: 'var(--text-sec, #64748b)', marginBottom: 24, lineHeight: 1.5 }}>
              {this.state.error?.message || 'An unexpected rendering error occurred while loading this module.'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="btn btn--secondary"
                style={{ fontSize: '.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <RefreshCw size={14} />
                <span>Try Again</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn btn--primary"
                style={{ fontSize: '.85rem' }}
              >
                Reload Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function DashboardModuleLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '40vh',
      width: '100%',
    }}>
      <Loading message="Loading module content..." />
    </div>
  );
}

const NAV_ITEMS = [
  { to: '/dashboard',        label: 'Dashboard',        icon: '▪' },
  { to: '/profile',          label: 'Profile',          icon: '▪' },
  { to: '/resume-analyzer',  label: 'Resume Analyzer',  icon: '▪' },
  { to: '/ats-score',        label: 'ATS Score',        icon: '▪' },
  { to: '/assessment',       label: 'Assessment',       icon: '▪' },
  { to: '/career-readiness', label: 'Career Readiness', icon: '▪' },
  { to: '/skill-gap',        label: 'Skill Gap',        icon: '▪' },
  { to: '/job-matches',      label: 'Job Matches',      icon: '▪' },
  { to: '/explainable-ai',   label: 'Explainable AI',   icon: '▪' },
  { to: '/assistant',        label: 'Career Assistant', icon: '▪' },
  { to: '/roadmap',          label: 'Learning Roadmap', icon: '▪' },
  { to: '/github-analyzer',  label: 'GitHub Analyzer',  icon: '▪' },
  { to: '/mock-interview',   label: 'Mock Interview',   icon: '▪' },
  { to: '/reports',          label: 'Reports',          icon: '▪' },
];

const PAGE_TRANSITION = {
  initial:  { opacity: 0, y: 12 },
  animate:  { opacity: 1, y: 0  },
  exit:     { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

function DashboardLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // If new user / guest is not authenticated, redirect to /register
  if (!isAuthenticated) {
    return <Navigate to={`/register?redirect=${encodeURIComponent(pathname)}`} replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout--dashboard">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="sidebar" id="dashboard-sidebar">
        <div className="sidebar__brand">
          <span className="sidebar__brand-symbol">◈</span>
          CareerTwin AI
        </div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              id={`sidebar-link-${item.to.replace(/\//g, '').replace(/-/g, '_')}`}
              className={({ isActive }) =>
                isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      className="sidebar__active-dot"
                      layoutId="sidebar-active-dot"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Info and Logout in sidebar bottom */}
        <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 2 }}>
            {user?.name || 'Student User'}
          </div>
          <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.email || 'student@example.com'}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              fontSize: '.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="dashboard__content">
        <header className="dashboard__header">
          <span className="dashboard__header-title">◈ CareerTwin AI</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: '.8rem', color: 'var(--emerald-light)', fontWeight: 600 }}>
              ● Online: {user?.name}
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '4px 10px',
                color: 'var(--text-muted)',
                fontSize: '.75rem',
                cursor: 'pointer',
              }}
            >
              Sign Out
            </button>
          </div>
        </header>

        <main className="dashboard__main">
          <DashboardErrorBoundary pathname={pathname}>
            <Suspense fallback={<DashboardModuleLoader />}>
              <AnimatePresence mode="wait">
                <motion.div key={pathname} {...PAGE_TRANSITION}>
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </DashboardErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
