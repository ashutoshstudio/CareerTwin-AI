/**
 * AdminLayout.jsx — Premium Admin Layout (dark-green sidebar)
 */

import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_NAV_ITEMS = [
  { to: '/admin',           label: 'Admin Dashboard', end: true },
  { to: '/admin/users',     label: 'Users'                      },
  { to: '/admin/jobs',      label: 'Jobs'                       },
  { to: '/admin/skills',    label: 'Skills'                     },
  { to: '/admin/roles',     label: 'Career Roles'               },
  { to: '/admin/analytics', label: 'Analytics'                  },
];

function AdminLayout() {
  const { pathname } = useLocation();

  return (
    <div className="layout--admin">
      <aside className="admin-sidebar" id="admin-sidebar">
        <div className="admin-sidebar__brand">◈ Admin Portal</div>
        <nav>
          {ADMIN_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              id={`admin-nav-${item.to.replace(/\//g, '-')}`}
              className={({ isActive }) =>
                isActive ? 'admin-sidebar__link admin-sidebar__link--active' : 'admin-sidebar__link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="admin-content">
        <header className="admin-header">
          <span className="admin-header__title">CareerTwin AI — Admin Dashboard</span>
        </header>
        <main className="admin-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
