/**
 * Navbar.jsx — CareerTwin AI Navigation
 * Theme: Nordic Emerald & Frosted Glass
 * Supports authentication state (logged in vs new/guest user)
 */

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const NAV_LINKS = [
  { to: '/',            label: 'Home'         },
  { to: '/about',       label: 'About'        },
  { to: '/how-it-works',label: 'How It Works' },
  { to: '/careers',     label: 'Careers'      },
];

const MENU_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:   { opacity: 0, transition: { duration: 0.2,  ease: 'easeIn'  } },
};

const ITEM_VARIANTS = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: [.22,1,.36,1] } }),
  exit:    { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <motion.nav
        className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [.22,1,.36,1] }}
      >
        {/* ── Logo ──────────────────────────────────── */}
        <Link to="/" id="navbar-logo" className="navbar__brand">
          <span className="navbar__logo-icon">🌿</span>
          CareerTwin <span className="navbar__logo-ai">AI</span>
        </Link>

        {/* ── Desktop links ──────────────────────────── */}
        <div className="navbar__links">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
              className={pathname === to ? 'navbar__link navbar__link--active' : 'navbar__link'}
            >
              {label}
            </Link>
          ))}

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 8 }}>
              <Link to="/dashboard" id="nav-dashboard" className="navbar__link" style={{ color: 'var(--emerald-light)', fontWeight: 700 }}>
                📊 Dashboard
              </Link>
              <button
                onClick={handleLogout}
                id="nav-logout-btn"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 99,
                  padding: '8px 16px',
                  color: 'var(--text-muted)',
                  fontSize: '.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'; }}
              >
                Sign Out ({user?.name?.split(' ')[0]})
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="navbar__login" id="nav-login">Login</Link>
              <Link to="/register" id="nav-register" className="navbar__cta">
                Start Free Assessment <span className="btn__arrow">→</span>
              </Link>
            </>
          )}
        </div>

        {/* ── Hamburger ─────────────────────────────── */}
        <button
          className="navbar__hamburger"
          id="navbar-hamburger"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <span
            className="navbar__bar"
            style={open ? { transform: 'translateY(7px) rotate(45deg)' } : {}}
          />
          <span
            className="navbar__bar"
            style={open ? { opacity: 0, transform: 'scaleX(0)' } : {}}
          />
          <span
            className="navbar__bar"
            style={open ? { transform: 'translateY(-7px) rotate(-45deg)' } : {}}
          />
        </button>
      </motion.nav>

      {/* ── Mobile overlay ─────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            id="mobile-menu"
            variants={MENU_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {NAV_LINKS.map(({ to, label }, i) => (
              <motion.div key={to} custom={i} variants={ITEM_VARIANTS} initial="hidden" animate="visible" exit="exit">
                <Link to={to} className="mobile-menu__link">
                  {label}
                </Link>
              </motion.div>
            ))}

            {isAuthenticated ? (
              <>
                <motion.div custom={NAV_LINKS.length} variants={ITEM_VARIANTS} initial="hidden" animate="visible" exit="exit">
                  <Link to="/dashboard" className="mobile-menu__link" style={{ color: 'var(--emerald-light)' }}>
                    📊 Dashboard
                  </Link>
                </motion.div>
                <motion.div custom={NAV_LINKS.length + 1} variants={ITEM_VARIANTS} initial="hidden" animate="visible" exit="exit">
                  <button
                    onClick={handleLogout}
                    className="mobile-menu__link"
                    style={{ background: 'none', border: 'none', color: '#f87171', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    Sign Out
                  </button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div custom={NAV_LINKS.length} variants={ITEM_VARIANTS} initial="hidden" animate="visible" exit="exit">
                  <Link to="/login" className="mobile-menu__link">
                    Login
                  </Link>
                </motion.div>
                <motion.div custom={NAV_LINKS.length + 1} variants={ITEM_VARIANTS} initial="hidden" animate="visible" exit="exit">
                  <Link to="/register" className="navbar__cta">
                    Start Free Assessment →
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
