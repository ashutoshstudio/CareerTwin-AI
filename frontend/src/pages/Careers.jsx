/**
 * Careers.jsx — All Career Paths listing page (new white theme)
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CAREER_PATHS } from '../data/careerPaths';
import { PersistentShiningDots } from '../components/PersistentShiningDots';

function Careers() {
  return (
    <div id="page-careers" className="careers-page" style={{ position: 'relative' }}>
      <PersistentShiningDots count={55} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 8 }}
        >
          <div className="section__tag">Supported Roles</div>
          <h1 className="section__title">
            Explore <strong>in-demand</strong><br />career paths.
          </h1>
          <p className="section__subtitle">
            CareerTwin AI benchmarks your profile against real requirements for
            today's most sought-after technology roles. Click any role to learn more.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="careers-grid">
          {CAREER_PATHS.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -4 }}
            >
              <Link
                to={`/careers/${c.slug}`}
                className="career-card"
                id={`careers-card-${c.slug}`}
                style={{ display: 'block' }}
              >
                <div className="career-card__top">
                  <span className="career-card__icon">{c.icon}</span>
                  <span className="career-card__demand">{c.demand}</span>
                </div>
                <h2 className="career-card__title">{c.title}</h2>
                <p style={{ fontSize: '.78rem', color: 'var(--text-sec)', marginBottom: 12, lineHeight: 1.5 }}>
                  {c.tagline}
                </p>
                <div className="career-card__skills">
                  {c.skills.map((sk) => (
                    <span key={sk} className="skill-tag">{sk}</span>
                  ))}
                </div>
                <div style={{ marginTop: 16, fontSize: '.75rem', color: 'var(--muted-green)', fontWeight: 600 }}>
                  View details →
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            textAlign: 'center',
            padding: '60px 0 40px',
            borderTop: '1px solid var(--border)',
            marginTop: 60,
          }}
        >
          <p style={{ fontSize: '1.2rem', fontWeight: 300, letterSpacing: '-0.03em', color: 'var(--black)', marginBottom: 24 }}>
            Not sure which path suits you?
          </p>
          <Link to="/register" className="btn btn--primary">
            Take the Career Assessment →
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default Careers;
