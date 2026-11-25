/**
 * Home.jsx — CareerTwin AI Premium Motion-First Landing Page
 * Theme: Nordic Emerald & Frosted Glass
 * Fully integrated with Auth: guests/new users are routed to /register or /login,
 * while logged-in users go directly to their chosen tools / roadmap / dashboard.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import { Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTypewriter } from '../hooks/useTypewriter';
import { DEMO_READINESS, DEMO_JOB_MATCHES } from '../services/api';
import { Interactive3DAvatar } from '../components/Interactive3DAvatar';
import { PersistentShiningDots } from '../components/PersistentShiningDots';

/* ── Reusable scroll reveal wrapper ────────────────────────────────────── */
function Reveal({ children, delay = 0, className = '', y = 28 }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Floating particles component ───────────────────────────────────────── */
function Particles({ count = 20 }) {
  const [particles] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      bottom: `${Math.random() * 30}%`,
      size: `${Math.random() * 3 + 2}px`,
      duration: `${Math.random() * 6 + 5}s`,
      delay: `${Math.random() * 8}s`,
      opacity: Math.random() * 0.6 + 0.3,
    }))
  );

  return (
    <div className="hero__particles">
      {particles.map((p) => (
        <div
          key={p.id}
          className="hero__particle"
          style={{
            left: p.left,
            bottom: p.bottom,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

/* ── Animated count-up number ───────────────────────────────────────────── */
function CountNumber({ to, suffix = '', duration = 1600 }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  const frame = useRef(null);

  useEffect(() => {
    if (!inView) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * to));
      if (progress < 1) frame.current = requestAnimationFrame(step);
      else setDisplay(to);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [inView, to, duration]);

  return <span ref={ref}>{display}{suffix}</span>;
}

/* ─────────────────────────────────────────────────────────────────────────
   DATA
   ───────────────────────────────────────────────────────────────────────── */
const READINESS_BARS = [
  { label: 'Technical Skills', pct: DEMO_READINESS.breakdown.technicalSkills },
  { label: 'Projects',         pct: DEMO_READINESS.breakdown.projects         },
  { label: 'Communication',    pct: DEMO_READINESS.breakdown.communication    },
  { label: 'Problem Solving',  pct: DEMO_READINESS.breakdown.problemSolving   },
];

const XAI_POS = ['Strong Python proficiency', 'Relevant ML projects', 'SQL knowledge', 'Good GitHub activity'];
const XAI_NEG = ['Missing: Deep Learning', 'Limited industry experience', 'Missing: Power BI', 'No cloud certification'];

const ROADMAP_STEPS = [
  { num: '01', title: 'Python & Statistics',   desc: 'Build strong foundations in Python programming and statistical thinking.' },
  { num: '02', title: 'SQL & Data Analysis',   desc: 'Master querying, data wrangling, and exploratory data analysis.' },
  { num: '03', title: 'Machine Learning',      desc: 'Learn supervised and unsupervised algorithms with scikit-learn.' },
  { num: '04', title: 'Projects & Portfolio',  desc: 'Build 2–3 end-to-end ML projects and publish them on GitHub.' },
  { num: '05', title: 'Interview Preparation', desc: 'Practice ML case studies, coding challenges, and system design.' },
];

const PILL_OPTIONS = [
  'Resume Analysis', 'Career Readiness', 'Skill Gap', 'Job Matching',
  'AI Assistant', 'Learning Roadmap', 'GitHub Analysis', 'Mock Interview',
];

const PILL_ROUTE_MAP = {
  'Resume Analysis':   '/resume-analyzer',
  'Career Readiness':  '/career-readiness',
  'Skill Gap':         '/skill-gap',
  'Job Matching':      '/job-matches',
  'AI Assistant':      '/assistant',
  'Learning Roadmap':  '/roadmap',
  'GitHub Analysis':   '/github-analyzer',
  'Mock Interview':    '/mock-interview',
};

/* ═══════════════════════════════════════════════════════════════════════════
   HERO SECTION — Mouse parallax + floating cards + particles + orbs
   ═══════════════════════════════════════════════════════════════════════════ */
const HERO_CARDS = [
  {
    label: 'Career Readiness', value: 82,  suffix: '',   unit: '/ 100',
    trend: '↑ +12 this month', barW: 82,
    cls: 'float-bob-1',
    style: { top: '-2%', left: '-8%' },
    pulseDelay: 0, ox: 0.55, oy: 0.55,
  },
  {
    label: 'GitHub Score', value: 84,  suffix: '',   unit: '/ 100',
    trend: '↑ Active committer', barW: 84,
    cls: 'float-bob-4',
    style: { top: '-4%', right: '-4%' },
    pulseDelay: 0.8, ox: -0.5, oy: 0.6,
  },
  {
    label: 'Skill Match', value: 89,  suffix: '%',  unit: '',
    trend: '↑ Above average', barW: 89,
    cls: 'float-bob-2',
    style: { top: '44%', right: '-12%' },
    pulseDelay: 1.6, ox: -0.55, oy: -0.45,
  },
  {
    label: 'ATS Score', value: 78,  suffix: '%',  unit: '',
    trend: '↑ Good format', barW: 78,
    cls: 'float-bob-3',
    style: { bottom: '8%', left: '-10%' },
    pulseDelay: 2.4, ox: 0.6, oy: -0.5,
  },
  {
    label: 'Job Match', value: 91,  suffix: '%',  unit: '',
    trend: '↑ Top candidate', barW: 91,
    cls: 'float-bob-5',
    style: { bottom: '-2%', right: '-6%' },
    pulseDelay: 3.2, ox: -0.4, oy: -0.7,
  },
];

function HeroCard({ card, springX, springY }) {
  const x = useTransform(springX, (v) => v * card.ox);
  const y = useTransform(springY, (v) => v * card.oy);

  return (
    <motion.div
      className={`hero-card ${card.cls}`}
      style={{ ...card.style, x, y }}
      initial={{ opacity: 0, scale: 0.7, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.9 + card.pulseDelay * 0.18, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.06, zIndex: 10 }}
    >
      {/* Pulse rings */}
      <div className="hero-card__pulse" style={{ animationDelay: `${card.pulseDelay}s` }} />
      <div className="hero-card__pulse-2" style={{ animationDelay: `${card.pulseDelay + 1}s` }} />

      <div className="hero-card__label">
        <span className="hero-card__dot" />
        {card.label}
      </div>
      <div className="hero-card__value">
        <CountNumber to={card.value} suffix={card.suffix} duration={1800} />
        {card.unit && (
          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: 2 }}>
            {card.unit}
          </span>
        )}
      </div>
      <div className="hero-card__bar">
        <motion.div
          className="hero-card__bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${card.barW}%` }}
          transition={{ duration: 1.2, delay: 1.2 + card.pulseDelay * 0.18, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="hero-card__trend">{card.trend}</div>
    </motion.div>
  );
}

function HeroSection() {
  const { isAuthenticated } = useAuth();
  const HERO_TEXT = "Know where you stand.\nKnow where you're going.";
  const { displayed, done } = useTypewriter({ text: HERO_TEXT, speed: 40, startDelay: 500 });

  const mouseX   = useMotionValue(0);
  const mouseY   = useMotionValue(0);
  const springX  = useSpring(mouseX, { stiffness: 45, damping: 16 });
  const springY  = useSpring(mouseY, { stiffness: 45, damping: 16 });

  useEffect(() => {
    const handleGlobalMove = (e) => {
      const normX = (e.clientX / window.innerWidth - 0.5) * 35;
      const normY = (e.clientY / window.innerHeight - 0.5) * 35;
      mouseX.set(normX);
      mouseY.set(normY);
    };
    window.addEventListener('mousemove', handleGlobalMove);
    return () => window.removeEventListener('mousemove', handleGlobalMove);
  }, [mouseX, mouseY]);

  const onMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(((e.clientX - rect.left) / rect.width  - 0.5) * 35);
    mouseY.set(((e.clientY - rect.top)  / rect.height - 0.5) * 35);
  }, [mouseX, mouseY]);

  const startCtaUrl = isAuthenticated ? '/dashboard' : '/register?redirect=%2Fdashboard';

  return (
    <section className="hero" onMouseMove={onMouseMove}>
      {/* Animated ambient orbs */}
      <div className="hero__orb hero__orb--1" />
      <div className="hero__orb hero__orb--2" />
      <div className="hero__orb hero__orb--3" />

      {/* Floating particles */}
      <Particles count={24} />

      {/* Grid dot pattern */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(16,185,129,0.12) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="hero__inner">
          {/* ── Left: copy ──────────────────────────── */}
          <div>
            <motion.div
              className="hero__eyebrow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
            >
              BCA Data Science · Academic Project 2024–25
            </motion.div>

            <motion.h1
              className="hero__heading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{ whiteSpace: 'pre-line' }}
            >
              <span className="anim-gradient-text">{displayed}</span>
              {!done && <span className="animate-blink" style={{
                display: 'inline-block', width: 3, height: '1em',
                background: 'var(--emerald-light)', verticalAlign: 'text-bottom',
                marginLeft: 2, borderRadius: 2,
              }} />}
            </motion.h1>

            <motion.p
              className="hero__desc"
              initial={{ opacity: 0 }}
              animate={{ opacity: done ? 1 : 0 }}
              transition={{ duration: 0.6 }}
            >
              CareerTwin AI analyses your skills, resume, projects and experience
              to reveal your career readiness score, identify skill gaps and match
              you with opportunities that fit your real potential.
            </motion.p>

            <motion.div
              className="hero__cta-group"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: done ? 1 : 0, y: done ? 0 : 12 }}
              transition={{ duration: 0.5 }}
            >
              <Link to={startCtaUrl} className="btn btn--primary" id="hero-cta-start">
                Start Free Assessment <span className="btn__arrow">→</span>
              </Link>
              <Link to="/how-it-works" className="btn btn--outline" id="hero-cta-how">
                See How It Works
              </Link>
            </motion.div>

            {/* Live stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: done ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{ display: 'flex', gap: 28, marginTop: 40, flexWrap: 'wrap' }}
            >
              {[
                { num: 200, suffix: '+', label: 'Skills tracked' },
                { num: 95,  suffix: '%', label: 'ML accuracy'    },
                { num: 50,  suffix: '+', label: 'Career paths'   },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--emerald-light)', lineHeight: 1, textShadow: '0 0 16px rgba(16,185,129,0.4)' }}>
                    <CountNumber to={s.num} suffix={s.suffix} duration={2000} />
                  </div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: 3D Interactive Character + floating analytics cards ─────── */}
          <div className="hero-visual">
            <Interactive3DAvatar springX={springX} springY={springY} />
            {HERO_CARDS.map((card) => (
              <HeroCard key={card.label} card={card} springX={springX} springY={springY} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   INTEREST PILLS
   ═══════════════════════════════════════════════════════════════════════════ */
function PillsSection() {
  const { isAuthenticated } = useAuth();
  const [selected, setSelected] = useState([]);
  const toggle = (p) => setSelected((prev) =>
    prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
  );

  // Target destination based on selection
  const firstTarget = selected.length > 0 ? (PILL_ROUTE_MAP[selected[0]] || '/dashboard') : '/dashboard';
  const exploreUrl = isAuthenticated
    ? firstTarget
    : `/register?redirect=${encodeURIComponent(firstTarget)}`;

  return (
    <Reveal>
      <section className="pills-section" id="explore-section">
        <div className="container">
          <p className="pills-title">What would you like to <span className="anim-gradient-text">explore?</span></p>
          <p className="pills-subtitle">Select every area you're interested in — we'll guide you.</p>

          <div className="pills-grid">
            {PILL_OPTIONS.map((pill, i) => {
              const active = selected.includes(pill);
              return (
                <motion.button
                  key={pill}
                  id={`pill-${pill.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`pill ${active ? 'pill--active' : ''}`}
                  onClick={() => toggle(pill)}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.055, duration: 0.4 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <AnimatePresence mode="wait">
                    {active && (
                      <motion.span
                        key="check"
                        initial={{ scale: 0, opacity: 0, rotate: -90 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <Check size={13} strokeWidth={3} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {pill}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {selected.length === 0 ? (
              <motion.p key="empty" className="pills-feedback"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                Choose areas above to get started.
              </motion.p>
            ) : (
              <motion.div key="selected"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35 }}>
                <p className="pills-feedback">
                  Great choices! Ready to explore: <strong>{selected.join(', ')}</strong>
                </p>
                <Link to={exploreUrl}>
                  <motion.button className="pills-cta" id="pills-cta-btn"
                    whileHover={{ scale: 1.04, x: 4 }} whileTap={{ scale: 0.97 }}>
                    Start Exploring →
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CAREER READINESS — animated score + bars
   ═══════════════════════════════════════════════════════════════════════════ */
function ReadinessSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });

  return (
    <section className="readiness-section" id="readiness-section">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <Reveal>
            <div className="section__tag">Career Readiness</div>
            <h2 className="section__title">How prepared<br /><span className="anim-gradient-text">are you?</span></h2>
            <p className="section__subtitle">
              Your Career Readiness Score is calculated by our ML model from your
              skills, projects, experience and assessments — with full XAI transparency.
            </p>
          </Reveal>

          <div ref={ref}>
            <motion.div
              style={{ position: 'relative', display: 'inline-block' }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Outer glow ring */}
              <motion.div style={{
                position: 'absolute', inset: -20, borderRadius: '50%',
                border: '1px solid rgba(16,185,129,0.3)',
                animation: inView ? 'pulseRing 3s ease-out infinite' : 'none',
              }} />
              <div className="readiness-score">
                {inView ? <CountNumber to={DEMO_READINESS.overall} duration={1800} /> : '0'}
              </div>
            </motion.div>
            <div className="readiness-label">/ 100 Career Readiness Score</div>

            <div className="readiness-bars">
              {READINESS_BARS.map((bar, i) => (
                <div key={bar.label}>
                  <div className="skill-bar__label">
                    <span>{bar.label}</span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={inView ? { opacity: 1 } : {}}
                      transition={{ delay: 0.4 + i * 0.1 }}
                    >
                      {bar.pct}%
                    </motion.span>
                  </div>
                  <div className="skill-bar__track">
                    <motion.div
                      className="skill-bar__fill"
                      initial={{ scaleX: 0 }}
                      animate={inView ? { scaleX: bar.pct / 100 } : {}}
                      transition={{ duration: 1.1, delay: 0.3 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   JOB MATCHING
   ═══════════════════════════════════════════════════════════════════════════ */
function JobMatchSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });

  return (
    <section className="jobs-section" id="jobmatch-section">
      <div className="container">
        <Reveal>
          <div className="section__tag">Intelligent Job Matching</div>
          <h2 className="section__title">Jobs ranked <span className="anim-gradient-text">for you.</span></h2>
          <p className="section__subtitle">
            Semantic AI matches your full profile against thousands of live job postings
            and shows your compatibility percentage — not just keyword overlap.
          </p>
        </Reveal>

        <div ref={ref} className="jobs-grid">
          {DEMO_JOB_MATCHES.map((job, i) => (
            <motion.div
              key={job.title}
              className="job-card shimmer-card"
              id={`job-card-${i}`}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.55, delay: i * 0.14 }}
              whileHover={{ y: -7, scale: 1.03 }}
            >
              <motion.div
                className="job-card__match"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.14 }}
              >
                {inView ? <CountNumber to={job.match} suffix="%" duration={1600} /> : '—'}
              </motion.div>
              <div className="job-card__title">{job.title}</div>
              <div className="job-card__company">{job.company}</div>
              <div className="job-card__location">📍 {job.location}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXPLAINABLE AI
   ═══════════════════════════════════════════════════════════════════════════ */
function XAISection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });

  return (
    <section className="xai-section section" id="xai-section">
      <div className="container">
        <Reveal>
          <div className="section__tag">Explainable AI · SHAP + LIME</div>
          <h2 className="section__title">Why did you get <span className="anim-gradient-text">this score?</span></h2>
          <p className="section__subtitle">
            Every prediction is explained with SHAP values and LIME — so you always
            know what to celebrate and what to improve.
          </p>
        </Reveal>

        <div ref={ref} className="xai-grid">
          <div>
            <div className="xai-column__title xai-column--pos">✓ Working in Your Favour</div>
            {XAI_POS.map((item, i) => (
              <motion.div key={item} className="xai-item"
                initial={{ opacity: 0, x: -24 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                whileHover={{ x: 6, color: 'var(--text-strong)' }}>
                <span className="xai-item__prefix--pos">+</span>{item}
              </motion.div>
            ))}
          </div>
          <div>
            <div className="xai-column__title xai-column--neg">↑ Areas to Improve</div>
            {XAI_NEG.map((item, i) => (
              <motion.div key={item} className="xai-item"
                initial={{ opacity: 0, x: 24 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                whileHover={{ x: -6, color: 'var(--text-strong)' }}>
                <span className="xai-item__prefix--neg">−</span>{item}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROADMAP
   ═══════════════════════════════════════════════════════════════════════════ */
function RoadmapSection() {
  const { isAuthenticated } = useAuth();
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });

  const roadmapUrl = isAuthenticated ? '/roadmap' : '/register?redirect=%2Froadmap';

  return (
    <section className="roadmap-section" id="roadmap-section">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
          <Reveal>
            <div className="section__tag">Learning Roadmap</div>
            <h2 className="section__title">Your path to <span className="anim-gradient-text">Data Scientist.</span></h2>
            <p className="section__subtitle">
              CareerTwin AI generates a personalised month-by-month plan from your current
              skill level to your target role. No guesswork — just a clear path forward.
            </p>
            <div style={{ marginTop: 28 }}>
              <Link to={roadmapUrl} className="btn btn--primary">View Full Roadmap →</Link>
            </div>
          </Reveal>

          <div ref={ref} className="roadmap-list">
            {ROADMAP_STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                className="roadmap-step"
                initial={{ opacity: 0, x: 30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.55, delay: i * 0.12 }}
                whileHover={{ x: 4 }}
              >
                <motion.div
                  className="roadmap-step__num"
                  animate={inView ? { boxShadow: ['0 0 0px rgba(16,185,129,0)', '0 0 16px rgba(16,185,129,0.5)', '0 0 0px rgba(16,185,129,0)'] } : {}}
                  transition={{ duration: 2.5, delay: i * 0.3, repeat: Infinity }}
                >
                  {step.num}
                </motion.div>
                <div className="roadmap-step__body">
                  <div className="roadmap-step__title">{step.title}</div>
                  <div className="roadmap-step__desc">{step.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CAREER ASSISTANT — animated chat with typing effect
   ═══════════════════════════════════════════════════════════════════════════ */
function AssistantSection() {
  const { isAuthenticated } = useAuth();
  const AI_REPLY = 'Based on your profile, focus next on advanced SQL, machine learning model evaluation, and cloud fundamentals (AWS or GCP).';
  const { displayed: aiText, done: aiDone } = useTypewriter({ text: AI_REPLY, speed: 26, startDelay: 1200 });
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });

  const assistantUrl = isAuthenticated ? '/assistant' : '/register?redirect=%2Fassistant';

  return (
    <section className="assistant-section section" id="assistant-section">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <Reveal>
            <div className="section__tag">AI Career Assistant</div>
            <h2 className="section__title">Ask anything.<br /><span className="anim-gradient-text">Get clarity.</span></h2>
            <p className="section__subtitle">
              Our RAG-powered career assistant understands your profile and gives personalised,
              context-aware career guidance — available 24/7.
            </p>
            <div style={{ marginTop: 28 }}>
              <Link to={assistantUrl} className="btn btn--primary">Open Assistant →</Link>
            </div>
          </Reveal>

          <motion.div ref={ref} className="chat-window"
            initial={{ opacity: 0, y: 28, rotateX: 4 }}
            animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
            <div className="chat-header">
              <div className="chat-dot glow-dot" />
              <div className="chat-header__title">CareerTwin AI Assistant</div>
              <div style={{ marginLeft: 'auto', fontSize: '.7rem', color: 'var(--emerald-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--emerald-light)', display: 'inline-block', animation: 'glowPulse 2s infinite' }} />
                Online
              </div>
            </div>
            <div className="chat-messages">
              <motion.div className="chat-bubble chat-bubble--user"
                initial={{ opacity: 0, y: 10, x: 20 }}
                animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
                transition={{ delay: 0.4 }}>
                What should I learn to become a Data Scientist?
              </motion.div>
              <motion.div className="chat-bubble chat-bubble--ai"
                initial={{ opacity: 0, y: 10, x: -20 }}
                animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
                transition={{ delay: 0.9 }}>
                {inView ? (
                  <>
                    {aiText}
                    {!aiDone && <span className="animate-blink" style={{ marginLeft: 2, opacity: 0.8 }}>▋</span>}
                  </>
                ) : '…'}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK INTERVIEW
   ═══════════════════════════════════════════════════════════════════════════ */
function MockInterviewSection() {
  const { isAuthenticated } = useAuth();
  const interviewUrl = isAuthenticated ? '/mock-interview' : '/register?redirect=%2Fmock-interview';

  return (
    <section className="interview-section section--alt section" id="interview-section">
      <div className="container">
        <Reveal>
          <div className="section__tag">AI Mock Interview</div>
          <h2 className="section__title" style={{ marginBottom: 40 }}>
            Practice until <span className="anim-gradient-text">you're confident.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          <motion.div className="interview-card shimmer-card"
            whileHover={{ y: -5, boxShadow: '0 12px 60px rgba(0,0,0,0.5), 0 0 40px rgba(16,185,129,0.2)' }}
            transition={{ duration: 0.3 }}>
            <div className="interview-q-label">Sample Interview Question</div>
            <p className="interview-question">
              "Explain the difference between supervised and unsupervised learning."
            </p>
            <Link to={interviewUrl} className="btn btn--primary" id="interview-start-btn">
              Start Mock Interview <span className="btn__arrow">→</span>
            </Link>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FINAL CTA
   ═══════════════════════════════════════════════════════════════════════════ */
function FinalCTA() {
  const { isAuthenticated } = useAuth();
  const ctaUrl = isAuthenticated ? '/dashboard' : '/register?redirect=%2Fdashboard';

  return (
    <Reveal>
      <section className="final-cta" id="final-cta">
        <div className="container">
          <motion.p
            className="final-cta__heading"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            Your career has a direction.<br />
            <span className="anim-gradient-text">Let's make it clearer.</span>
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link to={ctaUrl} className="btn btn--primary" id="final-cta-btn" style={{ fontSize: '1rem', padding: '16px 36px' }}>
              Start Your Career Assessment <span className="btn__arrow">→</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOME PAGE — COMPOSED
   ═══════════════════════════════════════════════════════════════════════════ */
function Home() {
  return (
    <div id="page-home" style={{ background: 'var(--bg)', position: 'relative' }}>
      {/* Persistent Full-Page Background Shining Spots */}
      <PersistentShiningDots count={60} />
      <HeroSection />
      <PillsSection />
      <ReadinessSection />
      <JobMatchSection />
      <XAISection />
      <RoadmapSection />
      <AssistantSection />
      <MockInterviewSection />
      <FinalCTA />
    </div>
  );
}

export default Home;
