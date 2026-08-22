/**
 * Footer.jsx — Site-wide footer (reusable)
 */

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <p className="footer__text">
        &copy; {year} CareerTwin AI &mdash; BCA Data Science Final Year Project
      </p>
    </footer>
  );
}

export default Footer;
