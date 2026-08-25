/**
 * HowItWorks.jsx — Premium How It Works Page
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PersistentShiningDots } from '../components/PersistentShiningDots';

const STEPS = [
  {
    num: '01',
    title: 'Build Your Profile',
    desc: 'Enter your education, skills, work experience, certifications, projects and target job roles. Upload your resume for automatic extraction. Your digital career twin is created instantly.',
    icon: '👤',
    detail: ['Academic background', 'Skills & certifications', 'Projects & GitHub', 'Career preferences'],
  },
  {
    num: '02',
    title: 'Take the Assessment',
    desc: 'Complete a smart career-readiness assessment. Our ML model (Random Forest with SHAP explanations) analyses your inputs against industry benchmarks and real job market data to produce your score.',
    icon: '📝',
    detail: ['Skill proficiency quiz', 'Domain knowledge test', 'Soft skills evaluation', 'Career goals alignment'],
  },
  {
    num: '03',
    title: 'Receive Insights',
    desc: 'Get your Career Readiness Score, detailed Skill Gap analysis, ATS Resume Score, matched job listings, and full XAI-powered explanations — all in one premium dashboard.',
    icon: '🎯',
    detail: ['Career readiness score', 'Skill gap radar chart', 'Top job matches', 'Explainability report'],
  },
  {
    num: '04',
    title: 'Follow Your Roadmap',
    desc: 'Act on your personalised AI-generated learning roadmap. Each step is tailored to your current skill level and target role with curated resources and milestones.',
    icon: '🗺️',
    detail: ['Month-by-month plan', 'Curated course links', 'Progress tracking', 'Dynamic reassessment'],
  },
];

function HowItWorks() {
  return (
    <div id="page-how-it-works" className="how-page" style={{ position: 'relative' }}>
      <PersistentShiningDots count={55} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 16 }}
        >
          <div className="section__tag">The Process</div>
          <h1 className="section__title" style={{ maxWidth: 560 }}>
            How CareerTwin AI<br /><strong>works for you.</strong>
          </h1>
          <p className="section__subtitle" style={{ marginBottom: 0 }}>
            From profile creation to personalised career insights — a clear, transparent,
            four-step process powered by explainable machine learning.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="how-steps">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className="how-step"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px 0px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="how-step__num">
                <span style={{ fontSize: '.65rem', fontWeight: 800 }}>{step.num}</span>
              </div>
              <div className="how-step__body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: '1.2rem' }}>{step.icon}</span>
                  <h2 className="how-step__title" style={{ margin: 0 }}>{step.title}</h2>
                </div>
                <p className="how-step__desc" style={{ marginBottom: 16 }}>{step.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {step.detail.map((d) => (
                    <span key={d} style={{
                      padding: '3px 10px',
                      background: 'var(--soft-green)',
                      color: 'var(--dark-green)',
                      borderRadius: '99px',
                      fontSize: '.7rem',
                      fontWeight: 600,
                    }}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ paddingTop: 40, paddingBottom: 80 }}
        >
          <p style={{
            fontSize: 'clamp(1.4rem,2.5vw,1.8rem)',
            fontWeight: 300,
            letterSpacing: '-0.04em',
            color: 'var(--black)',
            marginBottom: 24,
            lineHeight: 1.3,
          }}>
            Ready to start your journey?
          </p>
          <Link to="/register" className="btn btn--primary">
            Create Your Profile →
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default HowItWorks;
