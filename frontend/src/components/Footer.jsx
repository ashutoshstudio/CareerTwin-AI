/**
 * Footer.jsx — Professional site-wide footer
 */

import { Link } from 'react-router-dom';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner footer__inner--centered">
        {/* Brand */}
        <Link to="/" className="footer__logo">
          <span className="footer__logo-icon">⚡</span> CareerTwin <span className="footer__logo-ai">AI</span>
        </Link>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <span>&copy; {new Date().getFullYear()} CareerTwin AI. All rights reserved.</span>
      </div>

    </footer>
  );
}

export default Footer;
