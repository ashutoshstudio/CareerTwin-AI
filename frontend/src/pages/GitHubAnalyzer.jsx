import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Star,
  GitFork,
  Code2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Layers,
  Award,
  Lightbulb,
  Clock,
  User,
  ArrowRight,
  TrendingUp,
  FolderGit2,
  Target,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';
import { CATEGORIZED_ROLES } from '../data/careerPaths';

function getGradeStyle(grade) {
  if (grade?.includes('A') || grade?.includes('Outstanding')) {
    return {
      bg: 'rgba(16, 185, 129, 0.1)',
      text: '#059669',
      border: 'rgba(16, 185, 129, 0.3)',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      bar: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    };
  }
  if (grade?.includes('B') || grade?.includes('Strong')) {
    return {
      bg: 'rgba(59, 130, 246, 0.1)',
      text: '#2563eb',
      border: 'rgba(59, 130, 246, 0.3)',
      badge: 'bg-blue-50 text-blue-700 border-blue-300',
      bar: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    };
  }
  if (grade?.includes('C') || grade?.includes('Moderate')) {
    return {
      bg: 'rgba(245, 158, 11, 0.1)',
      text: '#d97706',
      border: 'rgba(245, 158, 11, 0.3)',
      badge: 'bg-amber-50 text-amber-700 border-amber-300',
      bar: 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)',
    };
  }
  return {
    bg: 'rgba(244, 63, 94, 0.1)',
    text: '#e11d48',
    border: 'rgba(244, 63, 94, 0.3)',
    badge: 'bg-rose-50 text-rose-700 border-rose-300',
    bar: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
  };
}

function getLanguageColor(language) {
  const colors = {
    Python: 'bg-blue-500',
    JavaScript: 'bg-amber-400',
    TypeScript: 'bg-sky-500',
    HTML: 'bg-orange-500',
    CSS: 'bg-indigo-500',
    SQL: 'bg-pink-500',
    Java: 'bg-red-500',
    'C++': 'bg-purple-500',
    Go: 'bg-cyan-500',
    Rust: 'bg-amber-700',
    PHP: 'bg-violet-500',
    Shell: 'bg-emerald-500',
  };
  return colors[language] || 'bg-slate-400';
}

function extractUsernameFromUrl(url) {
  if (!url) return '';
  const cleaned = url.trim().replace(/\/$/, '');
  const parts = cleaned.split('/');
  return parts[parts.length - 1].replace('@', '');
}

export default function GitHubAnalyzer() {
  const { token } = useAuth();

  const [usernameInput, setUsernameInput] = useState('');
  const [profileGithubUsername, setProfileGithubUsername] = useState('');
  const [targetRole, setTargetRole] = useState('Data Analyst');
  const [activeTab, setActiveTab] = useState('overview');

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);
  const [error, setError] = useState(null);

  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);

  // Fetch initial profile & latest analysis
  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      if (!token) {
        setInitialLoading(false);
        return;
      }
      try {
        const [profileRes, latestRes, historyRes] = await Promise.allSettled([
          api.getProfile(token),
          api.getLatestGitHub(token),
          api.getGitHubHistory(token),
        ]);

        if (!isMounted) return;

        if (profileRes.status === 'fulfilled' && profileRes.value) {
          const userGithub = extractUsernameFromUrl(profileRes.value.github_url);
          if (userGithub) {
            setProfileGithubUsername(userGithub);
            setUsernameInput((prev) => prev || userGithub);
          }
          if (profileRes.value.target_role) {
            setTargetRole(profileRes.value.target_role);
          }
        }

        if (latestRes.status === 'fulfilled' && latestRes.value) {
          setAnalysis(latestRes.value);
          if (latestRes.value.username) {
            setUsernameInput(latestRes.value.username);
          }
          if (latestRes.value.target_role) {
            setTargetRole(latestRes.value.target_role);
          }
        }

        if (historyRes.status === 'fulfilled' && Array.isArray(historyRes.value)) {
          setHistory(historyRes.value);
        }
      } catch (err) {
        console.error('Failed to load GitHub initial state:', err);
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    }

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Execute Analysis Handler
  const handleAnalyze = useCallback(
    async (e, usernameOverride = null) => {
      if (e) e.preventDefault();
      const userToAnalyze = (usernameOverride || usernameInput).trim();
      if (!userToAnalyze) {
        setError('Please enter a GitHub username to analyze.');
        return;
      }

      setLoading(true);
      setError(null);
      setSyncFeedback(null);

      try {
        const result = await api.analyzeGitHub(
          { username: userToAnalyze, target_role: targetRole },
          token
        );
        setAnalysis(result);
        setUsernameInput(result.username);

        // Refresh history
        const refreshedHistory = await api.getGitHubHistory(token).catch(() => []);
        setHistory(refreshedHistory);
      } catch (err) {
        setError(err.message || 'Failed to analyze GitHub profile. Please check the username or API limits.');
      } finally {
        setLoading(false);
      }
    },
    [usernameInput, targetRole, token]
  );

  // Sync Skills Handler
  const handleSyncSkills = useCallback(async () => {
    if (!token || !analysis) return;
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await api.syncGitHubSkills({ analysis_id: analysis.id }, token);
      setSyncFeedback({
        type: 'success',
        message: res.message,
        synced: res.synced_skills,
      });
    } catch (err) {
      setSyncFeedback({
        type: 'error',
        message: err.message || 'Failed to sync skills to profile.',
      });
    } finally {
      setSyncing(false);
    }
  }, [analysis, token]);

  if (initialLoading) {
    return <Loading message="Loading GitHub Analyzer..." />;
  }

  const gradeStyle = analysis ? getGradeStyle(analysis.grade) : null;
  const categories = analysis?.category_scores
    ? [
        {
          key: 'project_quality',
          title: 'Project Quality & Originality',
          score: analysis.category_scores.project_quality,
          max: 25,
          desc: 'Original non-fork code, multi-file architectures & curation',
        },
        {
          key: 'skill_diversity',
          title: 'Technical Skill Breadth',
          score: analysis.category_scores.skill_diversity,
          max: 20,
          desc: 'Versatility across distinct languages, frameworks & tools',
        },
        {
          key: 'documentation',
          title: 'Repository Documentation',
          score: analysis.category_scores.documentation,
          max: 15,
          desc: 'Informative repository descriptions, topic tags & READMEs',
        },
        {
          key: 'coding_activity',
          title: 'Coding Activity & Longevity',
          score: analysis.category_scores.coding_activity,
          max: 20,
          desc: 'Recent push activity, update recency & active profile age',
        },
        {
          key: 'community_engagement',
          title: 'Community Engagement',
          score: analysis.category_scores.community_engagement,
          max: 10,
          desc: 'Open-source stars, public forks & peer recognition',
        },
        {
          key: 'role_relevance',
          title: 'Career-Role Relevance',
          score: analysis.category_scores.role_relevance,
          max: 10,
          desc: `Alignment with target role benchmarks (${analysis.target_role})`,
        },
      ]
    : [];

  return (
    <div id="page-github-analyzer" className="page" style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 60 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--emerald, #10b981)',
              }}
            >
              <FolderGit2 style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <h1 className="page-heading" style={{ margin: 0 }}>
                GitHub Profile & Portfolio Analyzer
              </h1>
              <p className="page-subtitle" style={{ margin: 0, marginTop: 4 }}>
                Evaluate your practical code repositories, skill breadth, and portfolio quality against target career roles.
              </p>
            </div>
          </div>
        </div>

        {/* Target Role Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card, #ffffff)', border: '1px solid var(--border)', borderRadius: 12, padding: '6px 12px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>Target Role:</span>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="form-input"
            style={{ padding: '4px 8px', fontSize: '0.85rem', fontWeight: 600, borderRadius: 8, border: '1px solid var(--border)', background: '#fff' }}
          >
            {CATEGORIZED_ROLES.map((group) => (
              <optgroup key={group.category} label={group.category}>
                {group.roles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Input & Search Section */}
      <div
        className="card"
        style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: 24,
          marginBottom: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
              <Search
                style={{
                  width: 18,
                  height: 18,
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted, #64748b)',
                }}
              />
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter public GitHub username (e.g. torvalds, octocat)"
                className="form-input"
                style={{
                  width: '100%',
                  paddingLeft: 42,
                  paddingRight: 14,
                  paddingTop: 12,
                  paddingBottom: 12,
                  borderRadius: 12,
                  fontSize: '0.95rem',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn--primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 12,
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              {loading ? (
                <>
                  <RefreshCw style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                  <span>Analyzing GitHub...</span>
                </>
              ) : (
                <>
                  <Sparkles style={{ width: 16, height: 16 }} />
                  <span>Analyze Portfolio</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Prefill helper */}
          {profileGithubUsername && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>
              <span>From your CareerTwin profile:</span>
              <button
                type="button"
                onClick={() => {
                  setUsernameInput(profileGithubUsername);
                  handleAnalyze(null, profileGithubUsername);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--emerald, #10b981)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <User style={{ width: 13, height: 13 }} />
                Analyze @{profileGithubUsername}
              </button>
            </div>
          )}
        </form>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 12,
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              color: '#e11d48',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <AlertTriangle style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2, color: '#e11d48' }} />
            <div>
              <p style={{ fontWeight: 700, margin: 0 }}>GitHub Analysis Notice</p>
              <p style={{ margin: 0, marginTop: 2, fontSize: '0.85rem' }}>{error}</p>
            </div>
          </motion.div>
        )}

        {/* Sync Success / Info Banner */}
        {syncFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 12,
              background: syncFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
              border: `1px solid ${syncFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
              color: syncFeedback.type === 'success' ? '#059669' : '#e11d48',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            {syncFeedback.type === 'success' ? (
              <CheckCircle2 style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2, color: '#059669' }} />
            ) : (
              <XCircle style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2, color: '#e11d48' }} />
            )}
            <div>
              <p style={{ fontWeight: 700, margin: 0 }}>{syncFeedback.message}</p>
              {syncFeedback.synced && syncFeedback.synced.length > 0 && (
                <p style={{ margin: 0, marginTop: 4, fontSize: '0.85rem', color: '#059669' }}>
                  Added to profile: {syncFeedback.synced.join(', ')}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Results Body */}
      {analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Profile Overview & Score Hero */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {/* Profile Card */}
            <div
              className="card"
              style={{
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <img
                    src={analysis.profile_info?.avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}
                    alt={analysis.profile_info?.username || analysis.username || 'GitHub'}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      border: '2px solid rgba(16, 185, 129, 0.3)',
                      objectFit: 'cover',
                    }}
                  />
                  <div>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', margin: 0 }}>
                      {analysis.profile_info?.name || analysis.profile_info?.username || analysis.username || 'Developer'}
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--emerald, #10b981)', fontFamily: 'monospace', fontWeight: 600, margin: '2px 0 0 0' }}>
                      @{analysis.profile_info?.username || analysis.username}
                    </p>
                    <a
                      href={analysis.profile_info?.html_url || `https://github.com/${analysis.username}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.75rem',
                        color: 'var(--text-muted, #64748b)',
                        textDecoration: 'none',
                        marginTop: 4,
                      }}
                    >
                      <span>View GitHub Profile</span>
                      <ExternalLink style={{ width: 12, height: 12 }} />
                    </a>
                  </div>
                </div>

                {analysis.profile_info?.bio && (
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text, #334155)',
                      fontStyle: 'italic',
                      background: 'rgba(248, 250, 252, 0.8)',
                      border: '1px solid var(--border)',
                      padding: 12,
                      borderRadius: 12,
                      margin: 0,
                    }}
                  >
                    &quot;{analysis.profile_info.bio}&quot;
                  </p>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600, display: 'block' }}>Public Repos</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)' }}>
                      {analysis.profile_info?.public_repos_count ?? analysis.total_repos_analyzed ?? 0}
                    </span>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600, display: 'block' }}>Followers</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)' }}>
                      {analysis.profile_info?.followers ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  paddingTop: 16,
                  marginTop: 16,
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted, #64748b)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock style={{ width: 14, height: 14 }} />
                  Joined {analysis.profile_info?.created_at ? new Date(analysis.profile_info.created_at).getFullYear() : 'N/A'}
                </span>
                <button
                  onClick={handleSyncSkills}
                  disabled={syncing}
                  className="btn btn--outline"
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    padding: '6px 14px',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {syncing ? (
                    <RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Sparkles style={{ width: 14, height: 14 }} />
                  )}
                  <span>Sync Skills</span>
                </button>
              </div>
            </div>

            {/* Score & Dial Hero */}
            <div
              className="card"
              style={{
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: 24,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald, #10b981)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Portfolio Evaluation
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', margin: '4px 0 0 0' }}>
                      GitHub Benchmark Score
                    </h3>
                  </div>
                  <div
                    style={{
                      padding: '4px 14px',
                      borderRadius: 20,
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      background: gradeStyle?.bg,
                      color: gradeStyle?.text,
                      border: `1px solid ${gradeStyle?.border}`,
                    }}
                  >
                    {analysis.grade}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginTop: 20, alignItems: 'center' }}>
                  {/* Score Number Display */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 20,
                      borderRadius: 16,
                      background: '#f8fafc',
                      border: '1px solid var(--border)',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--emerald, #10b981)', lineHeight: 1 }}>
                      {analysis.overall_score}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginTop: 4, fontWeight: 700, textTransform: 'uppercase' }}>
                      out of 100 points
                    </div>
                    <div style={{ width: '100%', background: '#e2e8f0', height: 8, borderRadius: 999, marginTop: 12, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          background: gradeStyle?.bar || 'var(--grad-emerald)',
                          borderRadius: 999,
                          width: `${analysis.overall_score}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Quick Metric Pills */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ padding: '12px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ padding: 8, borderRadius: 8, background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}>
                        <FolderGit2 style={{ width: 16, height: 16 }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>Analyzed Repos</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)' }}>{analysis.total_repos_analyzed}</div>
                      </div>
                    </div>

                    <div style={{ padding: '12px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ padding: 8, borderRadius: 8, background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}>
                        <Star style={{ width: 16, height: 16 }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>Earned Stars</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)' }}>{analysis.total_stars}</div>
                      </div>
                    </div>

                    <div style={{ padding: '12px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ padding: 8, borderRadius: 8, background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                        <GitFork style={{ width: 16, height: 16 }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>Total Forks</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)' }}>{analysis.total_forks}</div>
                      </div>
                    </div>

                    <div style={{ padding: '12px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ padding: 8, borderRadius: 8, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald, #10b981)' }}>
                        <Award style={{ width: 16, height: 16 }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>Matched Skills</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)' }}>{(analysis.matched_skills || []).length} skills</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transparency Notice */}
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 14,
                  borderTop: '1px solid var(--border)',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted, #64748b)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Lightbulb style={{ width: 16, height: 16, color: '#f59e0b', flexShrink: 0 }} />
                <span>
                  Transparent Scoring Notice: Scores reflect repository documentation, languages, and open-source hygiene. Public metadata does not evaluate execution complexity without deep static analysis.
                </span>
              </div>
            </div>
          </div>

          {/* 6 Category Breakdown Grid */}
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers style={{ width: 18, height: 18, color: 'var(--emerald, #10b981)' }} />
              Score Breakdown by Dimension
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {categories.map((cat) => {
                const pct = Math.round((cat.score / cat.max) * 100);
                return (
                  <div
                    key={cat.key}
                    className="card"
                    style={{
                      background: 'var(--bg-card, #ffffff)',
                      border: '1px solid var(--border)',
                      borderRadius: 16,
                      padding: 18,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-strong, #0f172a)' }}>{cat.title}</span>
                        <span style={{ fontWeight: 800, color: 'var(--emerald, #10b981)', fontFamily: 'monospace' }}>
                          {cat.score} / {cat.max}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginTop: 4, margin: 0 }}>{cat.desc}</p>
                    </div>
                    <div style={{ width: '100%', background: '#e2e8f0', height: 6, borderRadius: 999, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          background: 'var(--grad-emerald)',
                          borderRadius: 999,
                          width: `${pct}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
            {[
              { id: 'overview', label: 'Overview & Stack', icon: Code2 },
              { id: 'repositories', label: `Repositories (${(analysis.repositories || []).length})`, icon: FolderGit2 },
              { id: 'skills', label: 'Role Alignment', icon: Target },
              { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
              { id: 'projects', label: 'Recommended Projects', icon: Sparkles },
            ].map((tab) => {
              const IconComponent = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 12,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.15s ease',
                    background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                    color: isSelected ? '#059669' : 'var(--text-muted, #64748b)',
                    border: isSelected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                  }}
                >
                  <IconComponent style={{ width: 15, height: 15 }} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Overview & Stack */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              {/* Languages Distribution */}
              <div
                className="card"
                style={{
                  background: 'var(--bg-card, #ffffff)',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  padding: 24,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Code2 style={{ width: 18, height: 18, color: 'var(--emerald, #10b981)' }} />
                  Programming Language Distribution
                </h4>
                {Object.keys(analysis.languages || {}).length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>No primary programming languages detected across public repositories.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {Object.entries(analysis.languages || {}).map(([lang, data]) => (
                      <div key={lang} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: 'var(--text-strong, #0f172a)' }}>
                            <span className={`w-2.5 h-2.5 rounded-full ${getLanguageColor(lang)}`} />
                            {lang}
                          </span>
                          <span style={{ color: 'var(--text-muted, #64748b)' }}>
                            {data.count} repos ({data.percentage}%)
                          </span>
                        </div>
                        <div style={{ width: '100%', background: '#e2e8f0', height: 6, borderRadius: 999, overflow: 'hidden' }}>
                          <div
                            className={`h-full ${getLanguageColor(lang)}`}
                            style={{ width: `${data.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Strengths & Weaknesses */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Strengths */}
                <div
                  className="card"
                  style={{
                    background: 'var(--bg-card, #ffffff)',
                    border: '1px solid var(--border)',
                    borderRadius: 20,
                    padding: 20,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  }}
                >
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#059669', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 style={{ width: 16, height: 16 }} />
                    Key Portfolio Strengths
                  </h4>
                  {(analysis.strengths || []).length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>No notable strengths identified yet.</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(analysis.strengths || []).map((str, idx) => (
                        <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text, #334155)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ color: '#059669', fontWeight: 800 }}>•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Weaknesses */}
                <div
                  className="card"
                  style={{
                    background: 'var(--bg-card, #ffffff)',
                    border: '1px solid var(--border)',
                    borderRadius: 20,
                    padding: 20,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  }}
                >
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#d97706', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle style={{ width: 16, height: 16 }} />
                    Areas for Optimization
                  </h4>
                  {(analysis.weaknesses || []).length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>Portfolio has zero critical warnings detected.</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(analysis.weaknesses || []).map((weak, idx) => (
                        <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text, #334155)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ color: '#d97706', fontWeight: 800 }}>•</span>
                          <span>{weak}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Repositories */}
          {activeTab === 'repositories' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(analysis.repositories || []).length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', background: '#f8fafc', borderRadius: 16, border: '1px dashed var(--border)', color: 'var(--text-muted, #64748b)', fontSize: '0.9rem' }}>
                  No repositories found in analysis.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                  {(analysis.repositories || []).map((repo, idx) => (
                    <div
                      key={idx}
                      className="card"
                      style={{
                        background: 'var(--bg-card, #ffffff)',
                        border: '1px solid var(--border)',
                        borderRadius: 16,
                        padding: 20,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <a
                            href={repo.html_url || `https://github.com/${analysis.username}/${repo.name}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontWeight: 700,
                              fontSize: '0.95rem',
                              color: 'var(--emerald, #10b981)',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <FolderGit2 style={{ width: 16, height: 16, color: 'var(--text-muted, #64748b)' }} />
                            <span>{repo.name}</span>
                            <ExternalLink style={{ width: 12, height: 12, color: 'var(--text-muted, #64748b)' }} />
                          </a>

                          {repo.is_fork && (
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#f1f5f9', color: 'var(--text-muted, #64748b)', border: '1px solid var(--border)' }}>
                              Fork
                            </span>
                          )}
                        </div>

                        <p style={{ fontSize: '0.8rem', color: 'var(--text, #334155)', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {repo.description || 'No description provided for this repository.'}
                        </p>

                        {/* Topics */}
                        {repo.topics && repo.topics.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 4 }}>
                            {repo.topics.map((t, tIdx) => (
                              <span
                                key={tIdx}
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '2px 8px',
                                  borderRadius: 6,
                                  background: 'rgba(16, 185, 129, 0.08)',
                                  color: '#059669',
                                  border: '1px solid rgba(16, 185, 129, 0.2)',
                                  fontWeight: 600,
                                }}
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          paddingTop: 12,
                          marginTop: 12,
                          borderTop: '1px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.8rem',
                          color: 'var(--text-muted, #64748b)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {repo.language && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--text-strong, #0f172a)' }}>
                              <span className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)}`} />
                              {repo.language}
                            </span>
                          )}
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Star style={{ width: 14, height: 14, color: '#f59e0b' }} />
                            {repo.stars ?? 0}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <GitFork style={{ width: 14, height: 14 }} />
                            {repo.forks ?? 0}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.75rem' }}>
                          Score: <strong style={{ color: 'var(--emerald, #10b981)' }}>{repo.quality_score ?? 0}/10</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Role Alignment */}
          {activeTab === 'skills' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div
                className="card"
                style={{
                  background: 'var(--bg-card, #ffffff)',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  padding: 24,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Target style={{ width: 18, height: 18, color: 'var(--emerald, #10b981)' }} />
                      Target Role Competency Alignment: {analysis.target_role}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', margin: '4px 0 0 0' }}>
                      Comparing detected technologies from your GitHub against official industry benchmarks.
                    </p>
                  </div>
                  <button
                    onClick={handleSyncSkills}
                    disabled={syncing}
                    className="btn btn--primary"
                    style={{ fontSize: '0.8rem', fontWeight: 600, padding: '8px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {syncing ? <RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : <Sparkles style={{ width: 14, height: 14 }} />}
                    <span>Sync Verified Skills</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  {/* Matched Skills */}
                  <div style={{ padding: 16, borderRadius: 14, background: '#f8fafc', border: '1px solid var(--border)' }}>
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 style={{ width: 16, height: 16 }} />
                        Demonstrated Role Skills ({(analysis.matched_skills || []).length})
                      </span>
                    </div>
                    {(analysis.matched_skills || []).length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', margin: 0 }}>No role-specific skills detected in repository metadata.</p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {(analysis.matched_skills || []).map((skill, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 8,
                              background: 'rgba(16, 185, 129, 0.1)',
                              color: '#059669',
                              border: '1px solid rgba(16, 185, 129, 0.25)',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <CheckCircle2 style={{ width: 12, height: 12 }} />
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Missing Skills */}
                  <div style={{ padding: 16, borderRadius: 14, background: '#f8fafc', border: '1px solid var(--border)' }}>
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#d97706', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <XCircle style={{ width: 16, height: 16 }} />
                        Undemonstrated Role Skills ({(analysis.missing_skills || []).length})
                      </span>
                    </div>
                    {(analysis.missing_skills || []).length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: '#059669', margin: 0 }}>All target role competencies are evidenced on GitHub!</p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {(analysis.missing_skills || []).map((skill, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 8,
                              background: 'rgba(245, 158, 11, 0.1)',
                              color: '#d97706',
                              border: '1px solid rgba(245, 158, 11, 0.25)',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <AlertTriangle style={{ width: 12, height: 12 }} />
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* All Detected Technologies Grouped */}
              <div
                className="card"
                style={{
                  background: 'var(--bg-card, #ffffff)',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  padding: 24,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                }}
              >
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Layers style={{ width: 18, height: 18, color: 'var(--emerald, #10b981)' }} />
                  All Detected Technologies ({(analysis.detected_technologies || []).length})
                </h4>
                {(analysis.detected_technologies || []).length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)', margin: 0 }}>No additional technologies detected.</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(analysis.detected_technologies || []).map((t, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          background: '#f8fafc',
                          color: 'var(--text-strong, #0f172a)',
                          border: '1px solid var(--border)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--emerald, #10b981)' }} />
                        <span>{t.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>({t.category})</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Recommendations */}
          {activeTab === 'recommendations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(analysis.recommendations || []).length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', background: '#f8fafc', borderRadius: 16, border: '1px dashed var(--border)', color: 'var(--text-muted, #64748b)', fontSize: '0.9rem' }}>
                  No recommendations found. Your portfolio meets high standards!
                </div>
              ) : (
                (analysis.recommendations || []).map((rec, idx) => (
                  <div
                    key={idx}
                    className="card"
                    style={{
                      background: 'var(--bg-card, #ffffff)',
                      border: '1px solid var(--border)',
                      borderRadius: 16,
                      padding: 20,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          color: '#059669',
                          padding: '3px 10px',
                          borderRadius: 20,
                          background: 'rgba(16, 185, 129, 0.12)',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                        }}
                      >
                        {rec.category}
                      </span>
                    </div>

                    <div>
                      <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', margin: '0 0 6px 0' }}>{rec.issue}</h5>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)', margin: 0 }}>
                        <strong style={{ color: 'var(--text, #334155)' }}>Why it matters:</strong> {rec.importance}
                      </p>
                    </div>

                    <div
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        fontSize: '0.85rem',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                      }}
                    >
                      <ArrowRight style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2, color: '#059669' }} />
                      <div>
                        <strong>Recommended Action:</strong> {rec.suggestion}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 5: Recommended Projects */}
          {activeTab === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  padding: 14,
                  borderRadius: 12,
                  fontSize: '0.85rem',
                  color: '#059669',
                }}
              >
                Building projects that address your undemonstrated skills is the fastest way to improve your GitHub portfolio score and demonstrate career readiness.
              </div>
              {(analysis.recommended_projects || []).length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', background: '#f8fafc', borderRadius: 16, border: '1px dashed var(--border)', color: 'var(--text-muted, #64748b)', fontSize: '0.9rem' }}>
                  No specific project recommendations available.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  {(analysis.recommended_projects || []).map((proj, idx) => (
                    <div
                      key={idx}
                      className="card"
                      style={{
                        background: 'var(--bg-card, #ffffff)',
                        border: '1px solid var(--border)',
                        borderRadius: 16,
                        padding: 20,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 16,
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div
                          style={{
                            padding: 8,
                            width: 'fit-content',
                            borderRadius: 10,
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: 'var(--emerald, #10b981)',
                          }}
                        >
                          <Sparkles style={{ width: 16, height: 16 }} />
                        </div>
                        <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', margin: 0 }}>{proj.title}</h5>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', lineHeight: 1.5, margin: 0 }}>{proj.description}</p>
                      </div>

                      <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {(proj.suggested_tech || []).map((t, tIdx) => (
                            <span
                              key={tIdx}
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: 6,
                                background: '#f1f5f9',
                                color: 'var(--text, #334155)',
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        {proj.relevance_to_role && (
                          <p style={{ fontSize: '0.75rem', color: '#059669', fontStyle: 'italic', margin: 0 }}>
                            {proj.relevance_to_role}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Historical Analyses Drawer */}
          {history.length > 1 && (
            <div
              className="card"
              style={{
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: 20,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp style={{ width: 14, height: 14, color: 'var(--emerald, #10b981)' }} />
                Previous Analyses ({history.length})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleAnalyze(null, item.username)}
                    style={{
                      fontSize: '0.8rem',
                      padding: '6px 12px',
                      borderRadius: 8,
                      background: '#f8fafc',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      color: 'var(--text-strong, #0f172a)',
                    }}
                  >
                    <span style={{ fontFamily: 'monospace', color: 'var(--emerald, #10b981)', fontWeight: 600 }}>@{item.username}</span>
                    <span style={{ color: 'var(--text-muted, #64748b)' }}>({item.target_role})</span>
                    <span style={{ fontWeight: 800, color: 'var(--emerald, #10b981)' }}>{item.overall_score} pts</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State when no analysis has run */}
      {!analysis && !loading && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--bg-card, #ffffff)',
            border: '2px dashed var(--border)',
            borderRadius: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: 'var(--emerald, #10b981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FolderGit2 style={{ width: 32, height: 32 }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', margin: 0 }}>No GitHub Portfolio Analyzed Yet</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)', maxWidth: 440, margin: '8px auto 0 auto', lineHeight: 1.5 }}>
              Enter your public GitHub username above to generate an objective 100-point portfolio assessment, discover skill gaps, and explore tailored project suggestions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
