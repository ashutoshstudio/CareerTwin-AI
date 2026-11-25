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

  /** Initiate real Google OAuth 2.0 authorization code flow */
  getGoogleAuthUrl: async (redirect = '/dashboard') => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const params = new URLSearchParams({
      redirect,
      frontend_origin: origin,
    });
    return request(`/auth/google/login?${params.toString()}`, {
      method: 'GET',
    });
  },

  /** Exchange one-time OAuth callback ticket for CareerTwin JWT AuthResponse */
  exchangeGoogleTicket: async (ticket) => {
    return request('/auth/google/exchange', {
      method: 'POST',
      body: JSON.stringify({ ticket }),
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
    if (params.source_type) query.append('source_type', params.source_type);
    if (params.role_category) query.append('role_category', params.role_category);
    if (params.location_type) query.append('location_type', params.location_type);
    if (params.remote_only !== undefined) query.append('remote_only', params.remote_only);
    if (params.job_source) query.append('job_source', params.job_source);
    if (params.min_match_score) query.append('min_match_score', params.min_match_score);
    if (params.sort_by) query.append('sort_by', params.sort_by);
    if (params.scoring_model) query.append('scoring_model', params.scoring_model);
    if (params.include_resume_skills !== undefined) query.append('include_resume_skills', params.include_resume_skills);
    if (params.limit) query.append('limit', params.limit);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/jobs/match${qs}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /** Job matching: get external job provider status */
  getJobProviders: async () => {
    return request('/jobs/providers');
  },

  /** Job matching: fetch live external listings */
  getLiveJobs: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.location) query.append('location', params.location);
    if (params.role_category) query.append('role_category', params.role_category);
    if (params.remote_only !== undefined) query.append('remote_only', params.remote_only);
    if (params.provider) query.append('provider', params.provider);
    if (params.limit) query.append('limit', params.limit);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/jobs/live${qs}`);
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

  /** ATS Evaluation: Score uploaded PDF/DOCX file */
  scoreResumeFile: async (formData, token) => {
    const base = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    const res = await fetch(`${base}/api/v1/ats/score-file`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Upload failed with status ${res.status}`);
    }
    return res.json();
  },

  /** ATS Evaluation: Score resume text */
  scoreResumeText: async (payload, token) => {
    return request('/ats/score-text', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  },

  /** ATS Evaluation: Score latest uploaded resume */
  scoreLatestResume: async (targetRole, token) => {
    const qs = targetRole ? `?target_role=${encodeURIComponent(targetRole)}` : '';
    return request(`/ats/score-latest${qs}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /** ATS Evaluation: Get latest evaluation */
  getLatestAtsScore: async (token) => {
    if (!token) return null;
    return request('/ats/latest', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /** ATS Evaluation: Get evaluation history */
  getAtsHistory: async (token) => {
    if (!token) return [];
    return request('/ats/history', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /** ATS score for uploaded resume (backwards compatibility) */
  getAtsScore: async (token) => {
    if (!token) return DEMO_ATS_SCORE;
    try {
      const latest = await request('/ats/latest', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return latest || DEMO_ATS_SCORE;
    } catch {
      return DEMO_ATS_SCORE;
    }
  },

  /** GitHub portfolio analysis */
  analyzeGitHub: async ({ username, target_role }, token) => {
    return request('/github/analyze', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ username, target_role }),
    });
  },

  /** Get latest GitHub portfolio evaluation for authenticated student */
  getLatestGitHub: async (token) => {
    if (!token) return null;
    return request('/github/latest', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /** Get GitHub analysis history */
  getGitHubHistory: async (token) => {
    if (!token) return [];
    return request('/github/history', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /** Sync detected GitHub technical skills into student profile */
  syncGitHubSkills: async (payload = {}, token) => {
    return request('/github/sync-skills', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  },

  /** GitHub profile analysis (backwards compatibility) */
  getGitHub: async (token) => {
    if (!token) return DEMO_GITHUB;
    try {
      const latest = await request('/github/latest', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return latest || DEMO_GITHUB;
    } catch {
      return DEMO_GITHUB;
    }
  },

  /** Send message to AI career assistant (live endpoint with backward compatibility fallback) */
  chatAssistant: async (messageOrPayload, token) => {
    if (!token) {
      return {
        response: 'Based on your current skills, focus next on advanced SQL, machine learning model evaluation and statistics.',
      };
    }
    const payload = typeof messageOrPayload === 'string'
      ? { message: messageOrPayload }
      : (messageOrPayload || { message: 'Analyze my readiness' });

    try {
      const res = await request('/career-assistant/chat', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      return {
        response: res.assistant_response,
        conversation_id: res.conversation_id,
        relevant_context: res.relevant_context,
        provider_used: res.provider_used,
      };
    } catch {
      return {
        response: 'Based on your current skills, focus next on advanced SQL, machine learning model evaluation and statistics.',
      };
    }
  },

  /** Send structured message to Career Assistant */
  sendCareerAssistantMessage: async (payload, token) => {
    return request('/career-assistant/chat', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  },

  /** List student's career assistant conversations */
  getCareerAssistantConversations: async (token) => {
    if (!token) return [];
    return request('/career-assistant/conversations', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /** Get messages for a specific conversation */
  getCareerAssistantMessages: async (conversationId, token) => {
    if (!token || !conversationId) return null;
    return request(`/career-assistant/conversations/${conversationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /** Delete a conversation */
  deleteCareerAssistantConversation: async (conversationId, token) => {
    return request(`/career-assistant/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /** Retry last assistant message in a conversation with live AI */
  retryCareerAssistantMessage: async (conversationId, token) => {
    return request(`/career-assistant/conversations/${conversationId}/retry`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /** Get student CareerTwin context snapshot */
  getCareerAssistantContext: async (targetRole, token) => {
    if (!token) return null;
    const query = targetRole ? `?target_role=${encodeURIComponent(targetRole)}` : '';
    return request(`/career-assistant/context${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /** Get learning roadmap for logged-in student */
  getRoadmap: async (token) => {
    if (!token) return null;
    return request('/roadmap', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /** Generate or regenerate personalized roadmap */
  generateRoadmap: async (payload = {}, token) => {
    return request('/roadmap/generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  },

  /** Toggle roadmap checklist topic item completion */
  toggleRoadmapItem: async ({ item_id, is_completed }, token) => {
    return request('/roadmap/toggle-item', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ item_id, is_completed }),
    });
  },

  /** Get compact roadmap progress summary for dashboard */
  getRoadmapSummary: async (token) => {
    if (!token) return { has_roadmap: false, completion_percentage: 0 };
    try {
      return await request('/roadmap/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      return { has_roadmap: false, completion_percentage: 0 };
    }
  },

  /** Get mock interview setup context & defaults */
  getMockInterviewContext: async (token) => {
    if (!token) return null;
    return request('/mock-interviews/context', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /** Start personalized AI mock interview session */
  startMockInterview: async (payload = {}, token) => {
    return request('/mock-interviews/start', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  },

  /** Submit answer to active mock interview question */
  submitMockInterviewAnswer: async (interviewId, payload, token) => {
    return request(`/mock-interviews/${interviewId}/answer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  },

  /** Complete mock interview session and generate final evaluation report */
  completeMockInterview: async (interviewId, payload = {}, token) => {
    return request(`/mock-interviews/${interviewId}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  },

  /** Get authenticated student's mock interview history */
  getMockInterviewHistory: async (token) => {
    if (!token) return [];
    return request('/mock-interviews/history', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /** Get details of a specific mock interview session */
  getMockInterviewDetail: async (interviewId, token) => {
    if (!token || !interviewId) return null;
    return request(`/mock-interviews/${interviewId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /** Get final report for a completed mock interview */
  getMockInterviewReport: async (interviewId, token) => {
    if (!token || !interviewId) return null;
    return request(`/mock-interviews/${interviewId}/report`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /** Delete a mock interview session */
  deleteMockInterview: async (interviewId, token) => {
    return request(`/mock-interviews/${interviewId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /** Backward-compatible helper */
  startInterview: async (payload = {}, token) => {
    if (token) {
      return request('/mock-interviews/start', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
    }
    return {
      question: 'Explain the difference between supervised and unsupervised learning.',
    };
  },

  /** Get report preview with current assessment statuses across all 10 modules */
  getReportPreview: async (targetRole, token) => {
    const query = targetRole ? `?target_role=${encodeURIComponent(targetRole)}` : '';
    return request(`/reports/preview${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /** Generate a new career readiness report */
  generateReport: async (payload = {}, token) => {
    return request('/reports/generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  },

  /** Get report generation history */
  getReportHistory: async (token) => {
    return request('/reports/history', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /** Download generated PDF report */
  downloadReportPdf: async (reportId, filename = 'CareerTwin_Report.pdf', token) => {
    const url = `${API_BASE_URL}/reports/${reportId}/download`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      let errMsg = 'Failed to download report PDF';
      try {
        const errJson = await res.json();
        errMsg = errJson.detail || errMsg;
      } catch {
        // use default
      }
      throw new Error(errMsg);
    }
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
    return true;
  },
};

export default api;
