/**
 * api.js — CareerTwin AI API Service Layer
 * Connects frontend React components to the FastAPI backend.
 */

// Standardized API base URL pointing to FastAPI /api/v1
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000/api/v1';

/* ── Demo data (preserved for uncompleted ML / Matching modules) ─────────── */

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

/* ── HTTP Request Helper ─────────────────────────────────────────────────── */

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr) {
    const error = new Error('Unable to connect to the CareerTwin AI backend server. Please verify that FastAPI is running on port 8000.');
    error.status = 0;
    error.original = netErr;
    throw error;
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    let detail = data?.detail;
    if (Array.isArray(detail)) {
      detail = detail.map((d) => d.msg || JSON.stringify(d)).join('; ');
    } else if (typeof detail === 'object' && detail !== null) {
      detail = JSON.stringify(detail);
    }
    const error = new Error(detail || data?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;

    // Automatically trigger session reset on 401 Unauthorized so user is not stuck with expired JWT
    if (response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('careertwin:auth-expired', { detail: { message: detail } }));
    }

    throw error;
  }

  return data;
}

/* ── Service functions ───────────────────────────────────────────────────── */

export const api = {
  /** Register a new user */
  register: async ({ name, email, password }) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        full_name: name,
        email,
        password,
      }),
    });
  },

  /** Login existing user */
  login: async ({ email, password }) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    });
  },

  /** Get current authenticated user profile */
  getProfile: async (token) => {
    return request('/profile/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /** Update user profile */
  updateProfile: async (profileData, token) => {
    return request('/profile/me', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
  },

  /** Upload and analyze resume file (PDF or DOCX) */
  analyzeResume: async (file, token) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/resume/analyze', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  },

  /** Get user's resume analysis history */
  getResumeHistory: async (token) => {
    return request('/resume/history', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /** Get user's latest resume analysis */
  getLatestResume: async (token) => {
    return request('/resume/latest', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /** Health check */
  getHealth: async () => {
    const res = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`);
    return res.json();
  },

  /** Career readiness assessment for logged-in student */
  getReadiness: async (token) => {
    if (!token) return DEMO_READINESS;
    try {
      return await request('/readiness/latest', {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      return DEMO_READINESS;
    }
  },

  /** Assess student career readiness with Scikit-learn model */
  assessReadiness: async (payload, token) => {
    return request('/readiness/assess', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },

  /** Get career readiness assessment history */
  getReadinessHistory: async (token) => {
    return request('/readiness/history', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /** Get ML readiness model metadata & test metrics */
  getReadinessModelInfo: async () => {
    return request('/readiness/model-info');
  },

  /** Explainable AI: get SHAP and LIME feature attributions for readiness model */
  getReadinessExplanation: async (payload = {}, token) => {
    return request('/readiness/explain', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },

  /** Explainable AI: get global model feature importance and methodology */
  getGlobalXai: async () => {
    return request('/readiness/global-xai');
  },

  /** Skill gap analysis for logged-in student */
  getSkillGap: async (token) => {
    if (!token) return DEMO_SKILL_GAP;
    try {
      return await request('/skill-gap/latest', {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      return DEMO_SKILL_GAP;
    }
  },

  /** Analyze student skill gap against target role */
  analyzeSkillGap: async (payload, token) => {
    return request('/skill-gap/analyze', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },

  /** Get skill gap analysis history */
  getSkillGapHistory: async (token) => {
    return request('/skill-gap/history', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /** Get benchmark role definitions */
  getSkillGapRoles: async () => {
    return request('/skill-gap/roles');
  },

  /** Career Recommendations: get latest evaluated recommendations */
  getRecommendations: async (token) => {
    return request('/recommendations/latest', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /** Career Recommendations: trigger transparent evaluation */
  evaluateRecommendations: async (payload = {}, token) => {
    return request('/recommendations/evaluate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },

  /** Career Recommendations: get documented roles catalog */
  getRecommendationCatalog: async () => {
    return request('/recommendations/catalog');
  },

  /** Career Recommendations: get evaluation history */
  getRecommendationHistory: async (token) => {
    return request('/recommendations/history', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /** Job matching: evaluate vacancies against student skills */
  getJobMatches: async (params = {}, token) => {
    if (!token) return { total_matched: DEMO_JOB_MATCHES.length, matches: DEMO_JOB_MATCHES };
    const query = new URLSearchParams();
    if (params.role_category) query.append('role_category', params.role_category);
    if (params.location_type) query.append('location_type', params.location_type);
    if (params.min_match_score) query.append('min_match_score', params.min_match_score);
    if (params.include_resume_skills !== undefined) query.append('include_resume_skills', params.include_resume_skills);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/jobs/match${qs}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /** Job matching: get specific job detail with match metrics */
  getJobDetail: async (jobId, token) => {
    return request(`/jobs/${jobId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /** Job matching: bookmark / save job */
  saveJob: async (jobId, token) => {
    return request(`/jobs/save/${jobId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /** Job matching: remove bookmark */
  unsaveJob: async (jobId, token) => {
    return request(`/jobs/save/${jobId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /** Job matching: get student's saved bookmarks */
  getSavedJobs: async (token) => {
    return request('/jobs/saved', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /** Job matching: get all raw curated vacancies */
  getJobVacancies: async () => {
    return request('/jobs/vacancies');
  },

  /** ATS score for uploaded resume (demo) */
  getAtsScore:   async () => DEMO_ATS_SCORE,

  /** GitHub profile analysis (demo) */
  getGitHub:     async () => DEMO_GITHUB,

  /** Send message to AI career assistant (demo) */
  chatAssistant: async (message) => ({
    response: 'Based on your current skills, focus next on advanced SQL, machine learning model evaluation and statistics.',
  }),

  /** Get learning roadmap for target role (demo) */
  getRoadmap:    async (role = 'Data Scientist') => [],

  /** Start mock interview session (demo) */
  startInterview: async () => ({
    question: 'Explain the difference between supervised and unsupervised learning.',
  }),
};

export default api;
