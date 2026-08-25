/**
 * Dashboard.jsx — Student main dashboard overview (placeholder)
 * Route: /dashboard
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DEMO_READINESS, DEMO_JOB_MATCHES, DEMO_GITHUB } from '../services/api';

const QUICK_STATS = [
  { label: 'Career Readiness',  value: `${DEMO_READINESS.overall}%`, to: '/career-readiness', color: 'var(--dark-green)' },
  { label: 'Job Match',         value: `${DEMO_JOB_MATCHES[0].match}%`, to: '/job-matches',     color: 'var(--muted-green)' },
  { label: 'GitHub Score',      value: `${DEMO_GITHUB.score}/100`,   to: '/github-analyzer', color: 'var(--dark-green)' },
  { label: 'Skills Tracked',    value: '200+',                        to: '/skill-gap',       color: 'var(--muted-green)' },
];

function Dashboard() {
  return (
    <div id="page-dashboard" className="page">
      <div className="page-heading">Welcome back</div>
      <div className="page-subtitle">Here's an overview of your career intelligence dashboard.</div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {QUICK_STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -3 }}
          >
            <Link to={s.to} style={{
              display: 'block',
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px 20px',
              textDecoration: 'none',
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.05em', color: s.color, lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: '.75rem', color: 'var(--text-sec)', marginTop: 6, fontWeight: 500 }}>
                {s.label}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Placeholder modules */}
      <div className="placeholder-card">
        <p>🚀 Full dashboard with interactive charts will be built in Phase 3+ (Backend integration).</p>
        <p style={{ marginTop: 8, fontSize: '.82rem' }}>Navigate using the sidebar to explore individual modules.</p>
      </div>
    </div>
  );
}

export default Dashboard;
