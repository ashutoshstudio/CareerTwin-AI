/**
 * Footer.jsx — CareerTwin AI Clean Minimal Footer
 */

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__brand-wrap">
          <div className="footer__brand">
            <span style={{ color: 'var(--emerald-light)' }}>◈</span>
            CareerTwin AI
          </div>
          <p className="footer__tagline">
            An Explainable Machine Learning-Based Career Readiness,
            Skill Gap and Job Matching System.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} CareerTwin AI. All rights reserved.</span>
          <span>Built as a BCA Data Science Academic Project</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
