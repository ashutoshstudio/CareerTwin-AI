/**
 * Navbar.jsx — Premium top navigation bar
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      {/* Brand */}
      <Link to="/" id="navbar-logo" className="navbar__brand">
        <span className="navbar__logo-icon">⚡</span>
        <span className="navbar__logo-text">CareerTwin <span className="navbar__logo-ai">AI</span></span>
      </Link>

      {/* Nav links */}
      <div className="navbar__links">
        {[
          { to: '/',            label: 'Home'         },
          { to: '/about',       label: 'About'        },
          { to: '/how-it-works',label: 'How It Works' },
          { to: '/careers',     label: 'Careers'      },
          { to: '/login',       label: 'Login'        },
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
            className={pathname === to ? 'navbar__link navbar__link--active' : 'navbar__link'}
          >
            {label}
          </Link>
        ))}
        <Link to="/register" id="nav-register" className="navbar__cta">
          Get Started Free →
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
