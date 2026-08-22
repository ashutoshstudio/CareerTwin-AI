/**
 * Navbar.jsx — Top navigation bar (reusable across layouts)
 */

import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <Link to="/" id="navbar-logo">CareerTwin AI</Link>
      </div>
      <div className="navbar__links">
        <Link
          to="/"
          id="nav-home"
          className={pathname === '/' ? 'navbar__link active' : 'navbar__link'}
        >
          Home
        </Link>
        <Link
          to="/login"
          id="nav-login"
          className={pathname === '/login' ? 'navbar__link active' : 'navbar__link'}
        >
          Login
        </Link>
        <Link
          to="/register"
          id="nav-register"
          className={pathname === '/register' ? 'navbar__link active' : 'navbar__link'}
        >
          Register
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
