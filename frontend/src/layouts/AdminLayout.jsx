/**
 * AdminLayout.jsx — Layout wrapper for authenticated admin pages
 * Used by: AdminDashboard, Users, Jobs, Skills, Career Roles, Analytics
 *
 * Structure: Sidebar | Main content area
 */

import { Outlet, NavLink } from 'react-router-dom';

const ADMIN_NAV_ITEMS = [
  { to: '/admin',           label: '⚙️ Admin Dashboard' },
  { to: '/admin/users',     label: '👥 Users'           },
  { to: '/admin/jobs',      label: '💼 Jobs'            },
  { to: '/admin/skills',    label: '🧠 Skills'          },
  { to: '/admin/roles',     label: '🎯 Career Roles'    },
  { to: '/admin/analytics', label: '📈 Analytics'       },
];

function AdminLayout() {
  return (
    <div className="layout layout--dashboard layout--admin">
      {/* Sidebar */}
      <aside className="sidebar" id="admin-sidebar">
        <div className="sidebar__brand">Admin Portal</div>
        <nav className="sidebar__nav">
          {ADMIN_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              id={`sidebar-link-${item.to.replace('/', '').replace('/', '_')}`}
              className={({ isActive }) =>
                isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="dashboard__content">
        <header className="dashboard__header">
          <span className="dashboard__header-title">CareerTwin AI Admin Dashboard</span>
        </header>
        <main className="dashboard__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
