/**
 * api.js — CareerTwin AI API Service Layer
 * Stub module for future FastAPI backend integration.
 * All functions currently return demo/mock data.
 * Replace return values with axios calls when backend is ready.
 */

// Base URL — switch to http://localhost:8000 when backend is running
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* ── Demo data ───────────────────────────────────────────────────────────── */

export const DEMO_READINESS = {
  overall: 82,
  breakdown: {
    technicalSkills: 78,
    projects:        88,
    communication:   74,
    problemSolving:  90,
  },
};

export const DEMO_SKILL_GAP = {
  target: 'Data Scientist',
  skills: [
    { name: 'Python',          current: 80, required: 90 },
    { name: 'SQL',             current: 65, required: 80 },
    { name: 'Machine Learning',current: 55, required: 85 },
    { name: 'Deep Learning',   current: 30, required: 70 },
    { name: 'Power BI',        current: 20, required: 60 },
  ],
};

export const DEMO_JOB_MATCHES = [
  { title: 'Data Scientist',    company: 'Google',   match: 89, location: 'Bangalore' },
  { title: 'Data Analyst',      company: 'Flipkart', match: 86, location: 'Remote'    },
  { title: 'ML Engineer',       company: 'Amazon',   match: 74, location: 'Hyderabad' },
];

export const DEMO_ATS_SCORE = { score: 78, keyword_match: 82, format_score: 73 };
export const DEMO_GITHUB    = { repos: 24, score: 84, activity: 'Good', languages: ['Python', 'JavaScript', 'SQL'] };

/* ── Service functions (stubs) ───────────────────────────────────────────── */

export const api = {
  /** Career readiness score for logged-in student */
  getReadiness:  async () => DEMO_READINESS,

  /** Skill gap analysis for a target role */
  getSkillGap:   async (targetRole = 'Data Scientist') => DEMO_SKILL_GAP,

  /** Job matches for the student profile */
  getJobMatches: async () => DEMO_JOB_MATCHES,

  /** ATS score for uploaded resume */
  getAtsScore:   async () => DEMO_ATS_SCORE,

  /** GitHub profile analysis */
  getGitHub:     async () => DEMO_GITHUB,

  /** Send message to AI career assistant */
  chatAssistant: async (message) => ({
    response: 'Based on your current skills, focus next on advanced SQL, machine learning model evaluation and statistics.',
  }),

  /** Get learning roadmap for target role */
  getRoadmap:    async (role = 'Data Scientist') => [],

  /** Start mock interview session */
  startInterview: async () => ({
    question: 'Explain the difference between supervised and unsupervised learning.',
  }),
};

export default api;
