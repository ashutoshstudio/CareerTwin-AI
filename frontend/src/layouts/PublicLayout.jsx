/**
 * PublicLayout.jsx — Full-width layout for public pages (no padding constraint on Home)
 */

import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function PublicLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="layout layout--public">
      <Navbar />
      <main className={isHome ? 'layout__main--home' : 'layout__main'}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
