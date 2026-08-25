/**
 * About.jsx — CareerTwin AI Premium About Page
 */

import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { PersistentShiningDots } from '../components/PersistentShiningDots';

function Reveal({ children, delay = 0 }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [.22,1,.36,1] }}
    >
      {children}
    </motion.div>
  );
}

const FEATURES = [
  { icon: '🎯', title: 'Career Readiness Score',  desc: 'ML-powered score showing how prepared you are for your target role — with full transparency.' },
  { icon: '🔍', title: 'Skill Gap Analysis',       desc: 'Visual charts that pinpoint exactly which skills are missing between you and your dream job.' },
  { icon: '💼', title: 'Intelligent Job Matching', desc: 'Semantic AI that matches your complete profile against thousands of real job descriptions.' },
  { icon: '🧠', title: 'Explainable AI (SHAP)',    desc: 'Every prediction explained with SHAP values and LIME — no black boxes, only clarity.' },
  { icon: '🗺️', title: 'Learning Roadmap',         desc: 'AI-generated personalised month-by-month learning plan from where you are to where you want to be.' },
  { icon: '🤖', title: 'AI Career Assistant',      desc: 'RAG-powered assistant that understands your profile and answers career questions in context.' },
];

const TECH_STACK = [
  'Python', 'FastAPI', 'React', 'Vite', 'scikit-learn', 'SHAP', 'LIME',
  'MongoDB', 'Pandas', 'NumPy', 'pdfplumber', 'LangChain', 'Recharts',
  'Framer Motion', 'Tailwind CSS', 'Sentence Transformers',
];

function About() {
  return (
    <div id="page-about" className="about-page" style={{ position: 'relative' }}>
      <PersistentShiningDots count={55} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <Reveal>
          <p className="about-hero-text">
            CareerTwin AI is an <strong>Explainable Machine Learning</strong>‑based
            platform that helps students understand their career readiness, close skill
            gaps and find the right opportunities.
          </p>
          <p className="about-desc">
            Built as a BCA Data Science academic project, CareerTwin AI combines real
            machine learning (Random Forest, SHAP, LIME, semantic embeddings) with a
            premium interactive interface to create a meaningful career intelligence tool.
          </p>
        </Reveal>

        {/* Stats */}
        <Reveal delay={0.1}>
          <div className="about-stats">
            {[
              { val: '95%',    label: 'ML prediction accuracy'    },
              { val: '50+',    label: 'Career paths covered'      },
              { val: '200+',   label: 'Skills tracked'            },
              { val: '10,000+',label: 'Jobs analysed'             },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="about-stat__val">{s.val}</div>
                <div className="about-stat__label">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </Reveal>

        {/* Features */}
        <Reveal delay={0.1}>
          <div style={{ marginBottom: 16 }}>
            <div className="section__tag">Core Capabilities</div>
            <h2 className="section__title">What CareerTwin AI does</h2>
          </div>
        </Reveal>

        <div className="about-features" style={{ marginBottom: 80 }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="about-feature"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -3 }}
            >
              <span className="about-feature__icon">{f.icon}</span>
              <div className="about-feature__title">{f.title}</div>
              <div className="about-feature__desc">{f.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* Tech stack */}
        <Reveal>
          <div className="section__tag">Technology Stack</div>
          <h2 className="section__title" style={{ marginBottom: 24 }}>Built with modern tools</h2>
          <div className="about-tech-grid" style={{ marginBottom: 80 }}>
            {TECH_STACK.map((t) => (
              <span key={t} className="tech-chip">{t}</span>
            ))}
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal>
          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: 60,
            paddingBottom: 60,
          }}>
            <p style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 300, letterSpacing: '-0.04em', color: 'var(--black)', marginBottom: 28, lineHeight: 1.2 }}>
              Ready to meet your<br /><strong style={{ fontWeight: 800 }}>career twin?</strong>
            </p>
            <Link to="/register" className="btn btn--primary">
              Get Started Free →
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

export default About;
