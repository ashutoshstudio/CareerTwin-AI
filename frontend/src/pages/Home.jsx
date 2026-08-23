/**
 * Home.jsx — CareerTwin AI Professional Landing Page
 * Sections: Hero | Stats | Features | How It Works | Career Paths | XAI | CTA
 */

import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { CAREER_PATHS } from '../data/careerPaths';

/* ── Data ──────────────────────────────────────────────────────────────── */
const STATS = [
  { value: '95%',    label: 'Prediction Accuracy',    icon: '🎯' },
  { value: '50+',    label: 'Career Paths Covered',    icon: '🗺️' },
  { value: '200+',   label: 'Skills Tracked',          icon: '🧠' },
  { value: '10,000+',label: 'Jobs Analyzed',           icon: '💼' },
];

const FEATURES = [
  {
    icon: '🎯',
    title: 'Career Readiness Score',
    desc: 'Get a personalised ML-powered readiness score showing exactly how prepared you are for your target role — with a clear percentage and breakdown.',
    color: '#6366f1',
  },
  {
    icon: '🔍',
    title: 'Skill Gap Analysis',
    desc: 'Instantly discover which skills you are missing for your dream job. Visual radar charts reveal your strengths and exact gaps to fill.',
    color: '#22d3ee',
  },
  {
    icon: '💼',
    title: 'Intelligent Job Matching',
    desc: 'Semantic AI matching compares your profile against thousands of real job descriptions and ranks the best-fit roles just for you.',
    color: '#a78bfa',
  },
  {
    icon: '🧠',
    title: 'Explainable AI (XAI)',
    desc: 'Unlike black-box systems, CareerTwin AI uses SHAP and LIME to explain every prediction — you always know why you got a particular score.',
    color: '#34d399',
  },
  {
    icon: '📊',
    title: 'Interactive Dashboard',
    desc: 'A rich analytics dashboard gives you a bird\'s-eye view of your career journey — progress charts, skill trends, and readiness history.',
    color: '#f59e0b',
  },
  {
    icon: '🤖',
    title: 'AI Recommendations',
    desc: 'Receive actionable, AI-generated next steps: which courses to take, which skills to learn first, and which jobs to apply to now.',
    color: '#ec4899',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Build Your Profile',
    desc: 'Enter your education, skills, work experience, certifications, and target job roles. Your digital career twin is created instantly.',
    icon: '👤',
  },
  {
    num: '02',
    title: 'Take the Assessment',
    desc: 'Complete a smart career assessment. Our ML model analyses your inputs against industry benchmarks and real job market data.',
    icon: '📝',
  },
  {
    num: '03',
    title: 'Get Insights & Match Jobs',
    desc: 'Receive your readiness score, skill gap chart, matched job listings, and XAI-powered explanations — all on one dashboard.',
    icon: '🚀',
  },
];



const XAI_ITEMS = [
  { label: 'SHAP Values',           desc: 'Shows which features most impacted your readiness score',       icon: '📉' },
  { label: 'LIME Explanations',     desc: 'Local interpretable model for individual prediction explanation', icon: '🔬' },
  { label: 'Feature Importance',    desc: 'Ranked list of skills driving your career match score',          icon: '📋' },
  { label: 'Confidence Score',      desc: 'Each prediction comes with a model confidence percentage',       icon: '✅' },
];

/* ── Component ─────────────────────────────────────────────────────────── */
function Home() {
  const heroRef = useRef(null);
  const statsRef = useRef(null);

  /* Subtle parallax on hero orbs */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      hero.style.setProperty('--px', `${x}px`);
      hero.style.setProperty('--py', `${y}px`);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  /* Scroll reveal animation for stats cards */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('stat-card--visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const cards = statsRef.current?.querySelectorAll('.stat-card');
    cards?.forEach((card) => observer.observe(card));

    return () => {
      cards?.forEach((card) => observer.unobserve(card));
    };
  }, []);

  return (
    <div id="page-home" className="home">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="hero" ref={heroRef}>
        {/* Animated background blobs */}
        <div className="hero__blob hero__blob--1" />
        <div className="hero__blob hero__blob--2" />
        <div className="hero__blob hero__blob--3" />

        {/* Grid overlay */}
        <div className="hero__grid" />

        <div className="hero__content">
          <div className="hero__left">
            <div className="hero__badge">
              <span className="hero__badge-dot" />
              Powered by Explainable Machine Learning
            </div>

            <h1 className="hero__title">
              Your Personal<br />
              <span className="hero__title-gradient">Career Twin</span><br />
              Powered by AI
            </h1>

            <p className="hero__subtitle">
              CareerTwin AI analyses your skills, education, and goals to predict your
              career readiness, expose skill gaps, and match you to the perfect job —
              with full <strong>AI transparency</strong> so you understand every insight.
            </p>

            <div className="hero__actions">
              <Link to="/register" id="hero-cta-primary" className="btn-hero btn-hero--primary">
                🚀 Start Your Career Assessment
              </Link>
              <Link to="/login" id="hero-cta-secondary" className="btn-hero btn-hero--secondary">
                Sign In →
              </Link>
            </div>

            <div className="hero__trust">
              <span>🎯 ML-Powered Readiness Score</span>
              <span>·</span>
              <span>🔍 Skill Gap Analysis</span>
              <span>·</span>
              <span>🧠 XAI Transparency</span>
              <span>·</span>
              <span>💼 Semantic Job Matching</span>
            </div>
          </div>

          {/* 3D Floating Card Visual */}
          <div className="hero__right">
            <div className="hero__3d-scene">

              {/* Main card */}
              <div className="card-3d card-3d--main">
                <div className="card-3d__header">
                  <span className="card-3d__dot card-3d__dot--r" />
                  <span className="card-3d__dot card-3d__dot--y" />
                  <span className="card-3d__dot card-3d__dot--g" />
                  <span className="card-3d__label">Career Readiness Score</span>
                </div>
                <div className="card-3d__score-ring">
                  <svg viewBox="0 0 120 120" className="card-3d__ring-svg">
                    <circle cx="60" cy="60" r="50" className="card-3d__ring-bg" />
                    <circle cx="60" cy="60" r="50" className="card-3d__ring-fill" />
                  </svg>
                  <div className="card-3d__score-text">
                    <span className="card-3d__score-num">82%</span>
                    <span className="card-3d__score-sub">Readiness</span>
                  </div>
                </div>
                <div className="card-3d__skills">
                  {[
                    { skill: 'Python',       pct: 90 },
                    { skill: 'ML Models',    pct: 75 },
                    { skill: 'Data Viz',     pct: 68 },
                    { skill: 'SQL',          pct: 85 },
                  ].map(({ skill, pct }) => (
                    <div key={skill} className="card-3d__skill-row">
                      <span className="card-3d__skill-name">{skill}</span>
                      <div className="card-3d__skill-bar">
                        <div className="card-3d__skill-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="card-3d__skill-pct">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating chip — Job Match */}
              <div className="card-3d card-3d--chip card-3d--chip-1">
                <span className="card-3d__chip-icon">💼</span>
                <div>
                  <div className="card-3d__chip-title">Top Match</div>
                  <div className="card-3d__chip-sub">Data Scientist · 94% fit</div>
                </div>
              </div>

              {/* Floating chip — Skill Gap */}
              <div className="card-3d card-3d--chip card-3d--chip-2">
                <span className="card-3d__chip-icon">🔍</span>
                <div>
                  <div className="card-3d__chip-title">Skill Gap Found</div>
                  <div className="card-3d__chip-sub">Learn: Deep Learning</div>
                </div>
              </div>

              {/* Floating chip — XAI */}
              <div className="card-3d card-3d--chip card-3d--chip-3">
                <span className="card-3d__chip-icon">🧠</span>
                <div>
                  <div className="card-3d__chip-title">AI Explained</div>
                  <div className="card-3d__chip-sub">SHAP · LIME · Transparent</div>
                </div>
              </div>

              {/* Floating chip — Confidence */}
              <div className="card-3d card-3d--chip card-3d--chip-4">
                <span className="card-3d__chip-icon">✅</span>
                <div>
                  <div className="card-3d__chip-title">Confidence</div>
                  <div className="card-3d__chip-sub">Model accuracy: 95.2%</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero__scroll">
          <div className="hero__scroll-mouse"><div className="hero__scroll-wheel" /></div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────── */}
      <section className="stats-section" id="stats">
        <div className="container">
          <div className="stats-grid" ref={statsRef}>
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className="stat-card"
                style={{ '--delay': `${i * 120}ms` }}
              >
                <span className="stat-card__icon">{s.icon}</span>
                <div className="stat-card__value">{s.value}</div>
                <div className="stat-card__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────── */}
      <section className="section" id="features">
        <div className="container">
          <div className="section__header">
            <div className="section__tag">Core Capabilities</div>
            <h2 className="section__title">Everything You Need to<br /><span className="gradient-text">Accelerate Your Career</span></h2>
            <p className="section__subtitle">
              Six powerful AI-driven modules work together to give you a complete,
              data-backed picture of your career potential.
            </p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card" style={{ '--accent': f.color }}>
                <div className="feature-card__icon-wrap">
                  <span className="feature-card__icon">{f.icon}</span>
                </div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
                <div className="feature-card__glow" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="section section--alt" id="how-it-works">
        <div className="container">
          <div className="section__header">
            <div className="section__tag">Process</div>
            <h2 className="section__title">How <span className="gradient-text">CareerTwin AI</span> Works</h2>
            <p className="section__subtitle">
              Three simple steps — from raw profile data to actionable career intelligence.
            </p>
          </div>
          <div className="steps-grid">
            {STEPS.map((step, i) => (
              <div key={step.num} className="step-card">
                <div className="step-card__num">{step.num}</div>
                <div className="step-card__icon">{step.icon}</div>
                <h3 className="step-card__title">{step.title}</h3>
                <p className="step-card__desc">{step.desc}</p>
                {i < STEPS.length - 1 && <div className="step-card__arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAREER PATHS ──────────────────────────────────────────────── */}
      <section className="section" id="career-paths">
        <div className="container">
          <div className="section__header">
            <div className="section__tag">Supported Roles</div>
            <h2 className="section__title">Explore <span className="gradient-text">In-Demand</span> Career Paths</h2>
            <p className="section__subtitle">
              CareerTwin AI benchmarks your profile against real requirements for today's
              most sought-after technology roles.
            </p>
          </div>
          <div className="careers-grid">
            {CAREER_PATHS.map((c) => (
              <Link
                key={c.title}
                to={`/careers/${c.slug}`}
                className="career-card"
                style={{ textDecoration: 'none', display: 'block', cursor: 'pointer' }}
              >
                <div className="career-card__top">
                  <span className="career-card__icon">{c.icon}</span>
                  <span className="career-card__demand">{c.demand}</span>
                </div>
                <h3 className="career-card__title">{c.title}</h3>
                <div className="career-card__skills">
                  {c.skills.map((sk) => (
                    <span
                      key={sk}
                      className="skill-tag"
                      style={{ cursor: 'pointer' }}
                    >
                      {sk}
                    </span>
                  ))}
                </div>
                <div style={{
                  marginTop: 14,
                  fontSize: '.75rem',
                  color: 'var(--primary-light)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  opacity: 0.8,
                }}>
                  View details →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── XAI SECTION ───────────────────────────────────────────────── */}
      <section className="section section--alt" id="xai">
        <div className="container">
          <div className="xai-layout">
            <div className="xai__left">
              <div className="section__tag">Explainability First</div>
              <h2 className="section__title">We Don't Just Predict —<br /><span className="gradient-text">We Explain</span></h2>
              <p className="xai__body">
                Most career tools are black boxes. CareerTwin AI is different. Every single
                prediction is accompanied by a human-readable explanation, so you always
                know <em>what</em> influenced your score and <em>exactly</em> what to do next.
              </p>
              <div className="xai__items">
                {XAI_ITEMS.map((x) => (
                  <div key={x.label} className="xai__item">
                    <span className="xai__item-icon">{x.icon}</span>
                    <div>
                      <div className="xai__item-label">{x.label}</div>
                      <div className="xai__item-desc">{x.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="xai__right">
              {/* XAI Visual — SHAP-style bar chart */}
              <div className="xai-card">
                <div className="xai-card__header">
                  <span>🧠 SHAP Feature Importance</span>
                  <span className="xai-card__badge">Explainability Report</span>
                </div>
                {[
                  { feat: 'Python Proficiency',     val: 0.31, positive: true  },
                  { feat: 'ML Project Experience',  val: 0.24, positive: true  },
                  { feat: 'Missing: Deep Learning', val: 0.19, positive: false },
                  { feat: 'SQL Skills',             val: 0.14, positive: true  },
                  { feat: 'Missing: Cloud (AWS)',   val: 0.08, positive: false },
                  { feat: 'Communication Score',    val: 0.04, positive: true  },
                ].map((row) => (
                  <div key={row.feat} className="shap-row">
                    <span className="shap-row__label">{row.feat}</span>
                    <div className="shap-row__bar-wrap">
                      <div
                        className={`shap-row__bar ${row.positive ? 'shap-row__bar--pos' : 'shap-row__bar--neg'}`}
                        style={{ width: `${row.val * 260}px` }}
                      />
                    </div>
                    <span className="shap-row__val">{row.positive ? '+' : '-'}{(row.val * 100).toFixed(0)}%</span>
                  </div>
                ))}
                <div className="xai-card__footer">
                  Positive (green) = boosting your score &nbsp;|&nbsp; Negative (red) = gaps to close
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="cta-section" id="cta">
        <div className="cta-section__blob cta-section__blob--1" />
        <div className="cta-section__blob cta-section__blob--2" />
        <div className="container">
          <div className="cta-content">
            <div className="cta-content__tag">🚀 AI-Powered Career Intelligence</div>
            <h2 className="cta-content__title">
              Ready to Discover Your<br />
              <span className="gradient-text">Career Readiness Score?</span>
            </h2>
            <p className="cta-content__sub">
              Create your profile, take the AI assessment, and get a detailed, explainable report
              on your career readiness, skill gaps, and best-fit jobs — all in minutes.
            </p>
            <div className="cta-content__actions">
              <Link to="/register" id="cta-register-btn" className="btn-hero btn-hero--primary">
                🚀 Start Free Assessment
              </Link>
              <Link to="/dashboard" id="cta-demo-btn" className="btn-hero btn-hero--ghost">
                👁️ View Live Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;
