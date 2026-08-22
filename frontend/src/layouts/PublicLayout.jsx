/**
 * PublicLayout.jsx — Layout wrapper for public pages
 * Used by: Home, Login, Register
 *
 * Structure: Navbar → page content → Footer
 */

import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function PublicLayout() {
  return (
    <div className="layout layout--public">
      <Navbar />
      <main className="layout__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
