/**
 * DashboardLayout.jsx — Layout wrapper for authenticated student pages
 * Used by: Dashboard, Profile, Assessment, CareerReadiness,
 *           SkillGap, JobMatches, Recommendations
 *
 * Structure: Sidebar (placeholder) | Main content area
 * Note: Final sidebar design will be implemented in a later phase.
 */

import { Outlet, NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/dashboard',        label: '📊 Dashboard'         },
  { to: '/profile',          label: '👤 Profile'           },
  { to: '/resume-analyzer',  label: '📄 Resume Analyzer'   },
  { to: '/ats-score',        label: '📈 ATS Score'         },
  { to: '/assessment',       label: '📝 Assessment'        },
  { to: '/career-readiness', label: '🎯 Career Readiness'  },
  { to: '/skill-gap',        label: '🔍 Skill Gap'         },
  { to: '/job-matches',      label: '💼 Job Matches'       },
  { to: '/explainable-ai',   label: '🧠 Explainable AI'    },
  { to: '/assistant',        label: '🤖 Career Assistant'  },
  { to: '/roadmap',          label: '🗺️ Learning Roadmap'  },
  { to: '/github-analyzer',  label: '🐙 GitHub Analyzer'   },
  { to: '/mock-interview',   label: '🎙️ Mock Interview'   },
  { to: '/reports',          label: '📋 Reports'            },
];

function DashboardLayout() {
  return (
    <div className="layout layout--dashboard">
      {/* Sidebar — placeholder, final design in later phase */}
      <aside className="sidebar" id="dashboard-sidebar">
        <div className="sidebar__brand">CareerTwin AI</div>
        <nav className="sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              id={`sidebar-link-${item.to.replace('/', '').replace('-', '_')}`}
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
          <span className="dashboard__header-title">CareerTwin AI</span>
        </header>
        <main className="dashboard__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
