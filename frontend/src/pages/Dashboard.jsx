/**
 * Dashboard.jsx — Dynamic Student Career Intelligence Dashboard
 * Route: /dashboard
 * Connected to live backend APIs:
 *   - GET /api/v1/profile/me
 *   - GET /api/v1/readiness/latest
 *   - GET /api/v1/skill-gap/latest
 *   - GET /api/v1/recommendations/latest
 *   - GET /api/v1/jobs/match
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Target,
  Briefcase,
  Compass,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Layers,
  MapPin,
  Award,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Loading from '../components/Loading';

function getReadinessBadge(category) {
  switch (category) {
    case 'High Readiness':
      return { bg: 'rgba(16, 185, 129, 0.12)', text: '#059669', border: 'rgba(16, 185, 129, 0.35)' };
    case 'Moderate Readiness':
      return { bg: 'rgba(59, 130, 246, 0.12)', text: '#2563eb', border: 'rgba(59, 130, 246, 0.35)' };
    default:
      return { bg: 'rgba(245, 158, 11, 0.12)', text: '#d97706', border: 'rgba(245, 158, 11, 0.35)' };
  }
}

function getMatchTierStyle(tier) {
  if (tier === 'Strong Match') {
    return { bg: 'rgba(16, 185, 129, 0.12)', text: '#059669', border: 'rgba(16, 185, 129, 0.3)' };
  }
  if (tier === 'Potential Match') {
    return { bg: 'rgba(59, 130, 246, 0.12)', text: '#2563eb', border: 'rgba(59, 130, 246, 0.3)' };
  }
  return { bg: 'rgba(245, 158, 11, 0.12)', text: '#d97706', border: 'rgba(245, 158, 11, 0.3)' };
}

function Dashboard() {
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(() => Boolean(token));
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Live state from backend
  const [profile, setProfile] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [skillGap, setSkillGap] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [jobMatches, setJobMatches] = useState(null);
  const [roadmapSummary, setRoadmapSummary] = useState(null);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (!token) return;

    if (isRefresh) setRefreshing(true);
    setErrorMsg(null);

    try {
      const [profRes, readRes, gapRes, recRes, jobRes, roadRes] = await Promise.all([
        api.getProfile(token).catch((err) => {
          console.warn('Profile fetch warning:', err);
          return null;
        }),
        api.getReadiness(token).catch((err) => {
          console.warn('Readiness fetch warning:', err);
          return null;
        }),
        api.getSkillGap(token).catch((err) => {
          console.warn('Skill gap fetch warning:', err);
          return null;
        }),
        api.getRecommendations(token).catch((err) => {
          console.warn('Recommendations fetch warning:', err);
          return null;
        }),
        api.getJobMatches({}, token).catch((err) => {
          console.warn('Job matches fetch warning:', err);
          return null;
        }),
        api.getRoadmapSummary(token).catch((err) => {
          console.warn('Roadmap summary fetch warning:', err);
          return null;
        }),
      ]);

      if (profRes) setProfile(profRes);
      if (readRes && readRes.readiness_score !== undefined) setReadiness(readRes);
      if (gapRes && gapRes.skill_coverage_percentage !== undefined) setSkillGap(gapRes);
      if (recRes && recRes.recommendations) setRecommendations(recRes);
      if (jobRes && Array.isArray(jobRes.matches)) setJobMatches(jobRes);
      if (roadRes && roadRes.has_roadmap !== undefined) setRoadmapSummary(roadRes);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to synchronize dashboard with backend server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    let ignore = false;
    if (!token) return;

    async function load() {
      try {
        setErrorMsg(null);
        const [profRes, readRes, gapRes, recRes, jobRes, roadRes] = await Promise.all([
          api.getProfile(token).catch(() => null),
          api.getReadiness(token).catch(() => null),
          api.getSkillGap(token).catch(() => null),
          api.getRecommendations(token).catch(() => null),
          api.getJobMatches({}, token).catch(() => null),
          api.getRoadmapSummary(token).catch(() => null),
        ]);

        if (!ignore) {
          if (profRes) setProfile(profRes);
          if (readRes && readRes.readiness_score !== undefined) setReadiness(readRes);
          if (gapRes && gapRes.skill_coverage_percentage !== undefined) setSkillGap(gapRes);
          if (recRes && recRes.recommendations) setRecommendations(recRes);
          if (jobRes && Array.isArray(jobRes.matches)) setJobMatches(jobRes);
          if (roadRes && roadRes.has_roadmap !== undefined) setRoadmapSummary(roadRes);
        }
      } catch (err) {
        if (!ignore) {
          setErrorMsg(err.message || 'Unable to synchronize dashboard with backend server.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();
    return () => { ignore = true; };
  }, [token]);

  if (loading) {
    return (
      <div id="page-dashboard" className="page" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <Loading message="Aggregating live career intelligence from machine learning backend..." />
      </div>
    );
  }

  // Derive dynamic display values
  const studentName = profile?.full_name || user?.name || 'Student';
  const targetRole = profile?.target_role || readiness?.target_role || skillGap?.target_role || 'Not set';
  const hasProfileSkills = Array.isArray(profile?.skills) && profile.skills.length > 0;
  const hasAssessments = Boolean(readiness && readiness.readiness_score !== undefined);

  const readinessScore = readiness?.readiness_score != null
    ? `${readiness.readiness_score.toFixed(1)}%`
    : 'Pending';

  const readinessBadge = readiness?.readiness_category
    ? getReadinessBadge(readiness.readiness_category)
    : null;

  const coverageScore = skillGap?.skill_coverage_percentage != null
    ? `${skillGap.skill_coverage_percentage.toFixed(0)}%`
    : hasProfileSkills ? 'Calculating' : '0%';

  const topRecommended = recommendations?.top_role || 'Explore Roles';
  const topFitScore = recommendations?.top_fit_score != null
    ? `${recommendations.top_fit_score.toFixed(0)}% Fit`
    : 'Run Evaluation';

  const matchedJobsCount = jobMatches?.total_matched ?? 0;
  const topJobMatch = jobMatches?.matches?.[0];

  return (
    <div id="page-dashboard" className="page" style={{ paddingBottom: 60 }}>
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 28,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 className="page-heading" style={{ margin: 0 }}>
              Welcome back, {studentName}
            </h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 10px',
              borderRadius: 99,
              fontSize: '.72rem',
              fontWeight: 700,
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#059669',
              border: '1px solid rgba(16, 185, 129, 0.28)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              Active Twin
            </span>
          </div>
          <div className="page-subtitle" style={{ margin: 0 }}>
            {profile?.headline ? (
              <span>{profile.headline}</span>
            ) : (
              <span>
                Target Role: <strong>{targetRole}</strong> &bull; {profile?.skills?.length || 0} verified skills tracked
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="btn btn--outline"
            style={{
              padding: '9px 16px',
              fontSize: '.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#ffffff',
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Sync Data'}
          </button>
          <Link
            to="/profile"
            className="btn btn--primary"
            style={{
              padding: '9px 16px',
              fontSize: '.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            Manage Profile &rarr;
          </Link>
        </div>
      </div>

      {/* ── Error Banner ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 14,
              padding: '12px 18px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: '#dc2626',
              fontSize: '.88rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>{errorMsg}</div>
            <button
              onClick={() => fetchDashboardData(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '.82rem',
                textDecoration: 'underline',
              }}
            >
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Onboarding Welcome Banner (if new profile) ───────────────────────── */}
      {!hasProfileSkills && !hasAssessments && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.06) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.28)',
            borderRadius: 18,
            padding: '24px 26px',
            marginBottom: 32,
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Sparkles size={20} color="#059669" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-strong)' }}>
              Get Started with Your Digital Career Twin
            </h3>
          </div>
          <p style={{ margin: '0 0 16px 0', fontSize: '.88rem', color: 'var(--text-sec)', maxWidth: 680, lineHeight: 1.5 }}>
            CareerTwin AI benchmarks your technical capabilities against industry roles. Start by uploading your resume or adding your technical skills to receive personalized readiness scores and job matches.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Link to="/resume-analyzer" className="btn btn--primary" style={{ fontSize: '.8rem', padding: '8px 16px' }}>
              Upload Resume (PDF/DOCX) &rarr;
            </Link>
            <Link to="/profile" className="btn btn--outline" style={{ fontSize: '.8rem', padding: '8px 16px', background: '#fff' }}>
              Add Skills Manually
            </Link>
          </div>
        </motion.div>
      )}

      {/* ── 4 Quick Stat Cards ──────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 18,
        marginBottom: 32,
      }}>
        {/* Card 1: Readiness */}
        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
          <Link
            to="/career-readiness"
            style={{
              display: 'block',
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 18,
              padding: '22px 20px',
              textDecoration: 'none',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Career Readiness
              </span>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={16} color="#059669" />
              </div>
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#059669', lineHeight: 1, marginBottom: 8 }}>
              {readinessScore}
            </div>
            {readinessBadge ? (
              <span style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: 99,
                fontSize: '.72rem',
                fontWeight: 700,
                background: readinessBadge.bg,
                color: readinessBadge.text,
                border: `1px solid ${readinessBadge.border}`,
              }}>
                {readiness?.readiness_category}
              </span>
            ) : (
              <span style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                Click to compute ML score &rarr;
              </span>
            )}
          </Link>
        </motion.div>

        {/* Card 2: Skill Gap Coverage */}
        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
          <Link
            to="/skill-gap"
            style={{
              display: 'block',
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 18,
              padding: '22px 20px',
              textDecoration: 'none',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Role Skill Coverage
              </span>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={16} color="#0284c7" />
              </div>
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#0284c7', lineHeight: 1, marginBottom: 8 }}>
              {coverageScore}
            </div>
            <div style={{ fontSize: '.78rem', color: 'var(--text-sec)' }}>
              {skillGap ? (
                <span><strong>{skillGap.met_count}</strong> met &bull; <strong>{skillGap.missing_count}</strong> missing</span>
              ) : (
                <span>Benchmark against {targetRole} &rarr;</span>
              )}
            </div>
          </Link>
        </motion.div>

        {/* Card 3: Top Recommendation */}
        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
          <Link
            to="/assessment"
            style={{
              display: 'block',
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 18,
              padding: '22px 20px',
              textDecoration: 'none',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Top Career Fit
              </span>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={16} color="#6366f1" />
              </div>
            </div>
            <div style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-strong)',
              lineHeight: 1.2,
              marginBottom: 8,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {topRecommended}
            </div>
            <div style={{ fontSize: '.78rem', color: '#6366f1', fontWeight: 700 }}>
              {topFitScore} &rarr;
            </div>
          </Link>
        </motion.div>

        {/* Card 4: Matched Vacancies */}
        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
          <Link
            to="/job-matches"
            style={{
              display: 'block',
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 18,
              padding: '22px 20px',
              textDecoration: 'none',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Matched Vacancies
              </span>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Briefcase size={16} color="#d97706" />
              </div>
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#d97706', lineHeight: 1, marginBottom: 8 }}>
              {matchedJobsCount}
            </div>
            <div style={{ fontSize: '.78rem', color: 'var(--text-sec)' }}>
              {topJobMatch ? (
                <span>Top match: <strong>{topJobMatch.match_score}%</strong> &bull; View &rarr;</span>
              ) : (
                <span>Browse curated vacancies &rarr;</span>
              )}
            </div>
          </Link>
        </motion.div>
      </div>

      {/* ── Learning Roadmap Progress Section ───────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, rgba(139, 92, 246, 0.03) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.22)',
          borderRadius: 20,
          padding: '24px 26px',
          boxShadow: '0 2px 14px rgba(99, 102, 241, 0.04)',
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={18} color="#6366f1" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                    Personalized Learning Roadmap
                  </h3>
                  <span style={{
                    fontSize: '.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 99,
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: '#6366f1',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                  }}>
                    {roadmapSummary?.target_role || targetRole}
                  </span>
                </div>
                <div style={{ fontSize: '.78rem', color: 'var(--text-sec)', marginTop: 2 }}>
                  Structured week-by-week curriculum engineered to close your identified skill gaps
                </div>
              </div>
            </div>

            <Link
              to="/roadmap"
              className="btn btn--primary"
              style={{
                fontSize: '.82rem',
                padding: '8px 18px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{roadmapSummary?.has_roadmap ? 'View Full Roadmap' : 'Generate Roadmap'}</span>
              &rarr;
            </Link>
          </div>

          {/* Progress Bar & Key Indicators */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            background: '#ffffff',
            borderRadius: 14,
            padding: '16px 20px',
            border: '1px solid var(--border)',
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-sec)', fontWeight: 600 }}>Curriculum Progress</span>
                <span style={{ fontWeight: 800, color: '#6366f1' }}>
                  {Math.round(roadmapSummary?.completion_percentage || 0)}%
                </span>
              </div>
              <div style={{ width: '100%', height: 7, borderRadius: 99, background: 'rgba(15, 23, 42, 0.06)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${roadmapSummary?.completion_percentage || 0}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)', borderRadius: 99 }}
                />
              </div>
              <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
                {roadmapSummary?.completed_items || 0} of {roadmapSummary?.total_items || 0} topics completed
              </div>
            </div>

            <div>
              <div style={{ fontSize: '.8rem', color: 'var(--text-sec)', fontWeight: 600, marginBottom: 4 }}>
                Current Phase
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                Week {roadmapSummary?.current_week || 1}
                <span style={{ fontSize: '.78rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: 4 }}>
                  of {roadmapSummary?.total_weeks || 4}
                </span>
              </div>
              <div style={{ fontSize: '.72rem', color: '#059669', fontWeight: 600, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {roadmapSummary?.milestone ? `Milestone: ${roadmapSummary.milestone}` : 'Foundational skills in progress'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '.8rem', color: 'var(--text-sec)', fontWeight: 600, marginBottom: 4 }}>
                Next Recommended Task
              </div>
              <div style={{
                fontSize: '.85rem',
                fontWeight: 700,
                color: 'var(--text-strong)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {roadmapSummary?.next_recommended_task || 'Complete initial skill assessment'}
              </div>
              <Link to="/roadmap" style={{ fontSize: '.72rem', color: '#6366f1', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: 4 }}>
                Open milestone checklist &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Dashboard Content Grid ─────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: 24,
      }}>
        {/* ── Left Column: Readiness Dimensions & Skill Gap ─────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Card: Dimensional Score Breakdown */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '24px 24px',
            boxShadow: '0 2px 12px rgba(15, 23, 42, 0.03)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={18} color="#059669" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                  Readiness Dimensions
                </h3>
              </div>
              <Link to="/explainable-ai" style={{ fontSize: '.78rem', color: '#059669', fontWeight: 700, textDecoration: 'none' }}>
                XAI Explanation &rarr;
              </Link>
            </div>

            {readiness?.dimension_scores ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Technical Competency', key: 'technical_skills', val: readiness.dimension_scores.technical_skills || 0, color: '#10b981' },
                  { label: 'Practical Experience', key: 'experience', val: readiness.dimension_scores.experience || 0, color: '#0284c7' },
                  { label: 'Academic Qualification', key: 'education', val: readiness.dimension_scores.education || 0, color: '#6366f1' },
                  { label: 'Portfolio & Code Presence', key: 'portfolio', val: readiness.dimension_scores.portfolio || 0, color: '#8b5cf6' },
                ].map((dim) => (
                  <div key={dim.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', marginBottom: 5 }}>
                      <span style={{ color: 'var(--text-strong)', fontWeight: 600 }}>{dim.label}</span>
                      <span style={{ color: dim.color, fontWeight: 800 }}>{dim.val.toFixed(0)}%</span>
                    </div>
                    <div style={{ width: '100%', height: 7, borderRadius: 99, background: 'rgba(15, 23, 42, 0.06)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${dim.val}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{ height: '100%', background: dim.color, borderRadius: 99 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-sec)', fontSize: '.85rem' }}>
                <p style={{ margin: '0 0 12px 0' }}>No readiness evaluation recorded yet.</p>
                <Link to="/career-readiness" className="btn btn--primary" style={{ fontSize: '.78rem', padding: '6px 14px' }}>
                  Run Assessment Now
                </Link>
              </div>
            )}
          </div>

          {/* Card: Skill Gap & Learning Recommendations */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '24px 24px',
            boxShadow: '0 2px 12px rgba(15, 23, 42, 0.03)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={18} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                  Prioritized Skill Gaps
                </h3>
              </div>
              <Link to="/skill-gap" style={{ fontSize: '.78rem', color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}>
                Full Breakdown &rarr;
              </Link>
            </div>

            {skillGap?.recommendations && skillGap.recommendations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {skillGap.recommendations.slice(0, 3).map((rec, i) => (
                  <div
                    key={rec.skill_name || i}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'rgba(15, 23, 42, 0.02)',
                      border: '1px solid rgba(15, 23, 42, 0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                        {rec.skill_name}
                      </span>
                      <span style={{
                        fontSize: '.7rem',
                        fontWeight: 700,
                        padding: '1px 7px',
                        borderRadius: 99,
                        background: rec.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: rec.priority === 'high' ? '#dc2626' : '#d97706',
                      }}>
                        {rec.priority?.toUpperCase()} PRIORITY
                      </span>
                    </div>
                    <div style={{ fontSize: '.78rem', color: 'var(--text-sec)', lineHeight: 1.45 }}>
                      {rec.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-sec)', fontSize: '.85rem' }}>
                <p style={{ margin: '0 0 12px 0' }}>No skill gaps analyzed yet.</p>
                <Link to="/skill-gap" className="btn btn--outline" style={{ fontSize: '.78rem', padding: '6px 14px', background: '#fff' }}>
                  Analyze Skill Gap
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Recommendations & Matched Vacancies ─────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Card: Career Recommendations */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '24px 24px',
            boxShadow: '0 2px 12px rgba(15, 23, 42, 0.03)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Compass size={18} color="#6366f1" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                  Evaluated Career Paths
                </h3>
              </div>
              <Link to="/assessment" style={{ fontSize: '.78rem', color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>
                All Roles &rarr;
              </Link>
            </div>

            {recommendations?.recommendations && recommendations.recommendations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recommendations.recommendations.slice(0, 3).map((role, idx) => {
                  const tierStyle = getMatchTierStyle(role.match_tier);
                  return (
                    <div
                      key={role.role_name || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: 14,
                        border: '1px solid var(--border)',
                        background: '#ffffff',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '.88rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                          {role.role_name}
                        </div>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {role.matching_skills?.length || 0} matching skills &bull; {role.demand_level} Demand
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '.95rem', fontWeight: 900, color: tierStyle.text }}>
                          {role.fit_score?.toFixed(0)}%
                        </div>
                        <span style={{
                          fontSize: '.68rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 99,
                          background: tierStyle.bg,
                          color: tierStyle.text,
                        }}>
                          {role.match_tier}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-sec)', fontSize: '.85rem' }}>
                <p style={{ margin: '0 0 12px 0' }}>Evaluate your fit across multi-factor technology roles.</p>
                <Link to="/assessment" className="btn btn--primary" style={{ fontSize: '.78rem', padding: '6px 14px' }}>
                  Run Career Evaluation
                </Link>
              </div>
            )}
          </div>

          {/* Card: Top Matched Vacancies */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '24px 24px',
            boxShadow: '0 2px 12px rgba(15, 23, 42, 0.03)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Briefcase size={18} color="#d97706" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                  Entry-Level Job Matches
                </h3>
              </div>
              <Link to="/job-matches" style={{ fontSize: '.78rem', color: '#d97706', fontWeight: 700, textDecoration: 'none' }}>
                Explore All ({matchedJobsCount}) &rarr;
              </Link>
            </div>

            {jobMatches?.matches && jobMatches.matches.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {jobMatches.matches.slice(0, 3).map((job) => (
                  <Link
                    key={job.id}
                    to="/job-matches"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 14,
                      border: '1px solid rgba(15, 23, 42, 0.08)',
                      background: '#ffffff',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '.88rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                        {job.title}
                      </div>
                      <div style={{ fontSize: '.74rem', color: 'var(--text-sec)', display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <span>{job.company}</span>
                        <span>&bull;</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <MapPin size={11} /> {job.location_type}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 8,
                        fontSize: '.78rem',
                        fontWeight: 800,
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: '#059669',
                      }}>
                        {job.match_score}% Match
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-sec)', fontSize: '.85rem' }}>
                <p style={{ margin: '0 0 12px 0' }}>No job listings matched your current verified skills.</p>
                <Link to="/job-matches" className="btn btn--outline" style={{ fontSize: '.78rem', padding: '6px 14px', background: '#fff' }}>
                  Browse Vacancies
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
