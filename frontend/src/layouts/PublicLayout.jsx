/**
 * PublicLayout.jsx — Full-width layout for public pages
 */

import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PAGE_VARIANTS = {
  initial:  { opacity: 0 },
  animate:  { opacity: 1, transition: { duration: 0.35 } },
  exit:     { opacity: 0, transition: { duration: 0.2  } },
};

function PublicLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="layout--public">
      <Navbar />
      <main className={isHome ? 'layout__main--home' : 'layout__main'}>
        <AnimatePresence mode="wait">
          <motion.div key={pathname} variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
