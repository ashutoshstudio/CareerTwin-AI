/**
 * Assessment.jsx — Career Recommendations & Role Assessment
 * Route: /assessment
 * Connected to FastAPI backend:
 *   POST /api/v1/recommendations/evaluate
 *   GET  /api/v1/recommendations/latest
 *   GET  /api/v1/recommendations/catalog
 *   GET  /api/v1/recommendations/history
 */

import { Component, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Loading from '../components/Loading';

// Error Boundary
class AssessmentErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Assessment page crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: 520, margin: '0 auto', background: 'var(--bg-card, #ffffff)', padding: 32, borderRadius: 16, border: '1px solid var(--border)' }}>
            <AlertCircle size={44} color="#f87171" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-strong)' }}>
              Unable to Display Career Recommendations
            </h2>
            <p style={{ fontSize: '.88rem', color: 'var(--text-sec)', marginBottom: 20 }}>
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="btn btn--primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function getTierBadgeStyle(tier) {
  switch (tier) {
    case 'Strong Match':
      return {
        bg: 'rgba(16, 185, 129, 0.12)',
        border: 'rgba(16, 185, 129, 0.35)',
        text: 'var(--emerald-light, #10b981)',
      };
    case 'Moderate Match':
      return {
        bg: 'rgba(59, 130, 246, 0.12)',
        border: 'rgba(59, 130, 246, 0.35)',
        text: '#3b82f6',
      };
    default:
      return {
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.35)',
        text: '#f59e0b',
      };
  }
}

function getDemandBadgeStyle(demand) {
  if (demand?.toLowerCase().includes('extremely')) {
    return { bg: 'rgba(139, 92, 246, 0.12)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.3)' };
  }
  if (demand?.toLowerCase().includes('very')) {
    return { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
  }
  return { bg: 'rgba(59, 130, 246, 0.12)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
}

function AssessmentContent() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(() => Boolean(token));
  const [evaluating, setEvaluating] = useState(false);
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const [includeResume, setIncludeResume] = useState(true);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Load latest recommendations and history on mount
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!token) return;

      try {
        const [recs, history] = await Promise.all([
          api.getRecommendations(token).catch((err) => {
            console.warn('Could not load latest recommendations:', err);
            return null;
          }),
          api.getRecommendationHistory(token).catch((err) => {
            console.warn('Could not load recommendation history:', err);
            return [];
          }),
        ]);

        if (isMounted) {
          if (recs) setRecommendationsData(recs);
          if (history) setHistoryList(history);
        }
      } catch (err) {
        if (isMounted) setErrorMsg(err.message || 'Failed to initialize recommendations.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [token]);

  const handleEvaluate = async () => {
    if (!token) return;
    setEvaluating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.evaluateRecommendations(
        { include_resume_skills: includeResume },
        token
      );
      setRecommendationsData(res);
      setSelectedRoleIndex(0);
      setSuccessMsg('Career recommendations evaluated successfully against current profile competencies.');

      // Refresh history
      const history = await api.getRecommendationHistory(token).catch(() => []);
      setHistoryList(history);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to evaluate recommendations. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div id="page-assessment" className="page" style={{ padding: '60px 0', textAlign: 'center' }}>
        <Loading message="Evaluating transparent career recommendations against benchmark catalog..." />
      </div>
    );
  }

  const recList = recommendationsData?.recommendations || [];
  const topRole = recommendationsData?.top_role || (recList[0]?.role_name ?? 'Data Analyst');
  const topScore = recommendationsData?.top_fit_score || (recList[0]?.fit_score ?? 0);
  const activeRole = recList[selectedRoleIndex] || recList[0];

  const activeTierStyle = getTierBadgeStyle(activeRole?.match_tier);
  const activeDemandStyle = getDemandBadgeStyle(activeRole?.demand_level);

  return (
    <div id="page-assessment" className="page" style={{ maxWidth: 1080, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(16, 185, 129, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--emerald-light, #10b981)',
          }}>
            <Compass size={20} />
          </div>
          <span style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--emerald-light, #10b981)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Career Intelligence Module
          </span>
        </div>
        <div className="page-heading">Career Recommendations & Fit Assessment</div>
        <div className="page-subtitle">
          Transparent, explainable role recommendations evaluated from your verified profile skills,
          proficiency levels, and benchmark curriculum requirements.
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: 'var(--emerald-light, #10b981)',
              padding: '14px 18px',
              borderRadius: 14,
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontWeight: 600,
              fontSize: '.9rem',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '14px 18px',
              borderRadius: 14,
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontWeight: 600,
              fontSize: '.9rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Evaluation Action Toolbar */}
      <div
        style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '20px 24px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text-strong)' }}>
            Evaluation Scope:
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.85rem', color: 'var(--text-sec)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              id="include-resume-checkbox"
              checked={includeResume}
              onChange={(e) => setIncludeResume(e.target.checked)}
              style={{ accentColor: 'var(--emerald-light, #10b981)', width: 16, height: 16 }}
            />
            Incorporate unmerged skills from latest resume
          </label>
        </div>

        <button
          id="reevaluate-recommendations-btn"
          className="btn btn--primary"
          style={{ padding: '10px 22px', fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={handleEvaluate}
          disabled={evaluating}
        >
          <RefreshCw size={16} className={evaluating ? 'spin' : ''} />
          {evaluating ? 'Evaluating Roles...' : 'Re-evaluate Recommendations'}
        </button>
      </div>

      {/* Top Recommended Hero Card */}
      <div
        id="top-recommendation-hero"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 24,
          padding: '28px 32px',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{
                background: 'var(--emerald-light, #10b981)',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: '.72rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                Rank #1 Recommendation
              </span>
              <span style={{
                background: getTierBadgeStyle(recList[0]?.match_tier).bg,
                color: getTierBadgeStyle(recList[0]?.match_tier).text,
                border: `1px solid ${getTierBadgeStyle(recList[0]?.match_tier).border}`,
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: '.72rem',
                fontWeight: 700,
              }}>
                {recList[0]?.match_tier || 'Strong Match'}
              </span>
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-strong)', marginBottom: 8 }}>
              {recList[0]?.role_name || topRole}
            </h1>
            <p style={{ fontSize: '.92rem', color: 'var(--text-sec)', maxWidth: 640, lineHeight: 1.6, marginBottom: 16 }}>
              {recList[0]?.fit_reason}
            </p>

            {/* Quick Metrics */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ background: 'var(--bg-card, #ffffff)', padding: '8px 14px', borderRadius: 12, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', display: 'block' }}>Core Competency</span>
                <span style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text-strong)' }}>
                  {recList[0]?.core_alignment_score || 0} / 50 pts
                </span>
              </div>
              <div style={{ background: 'var(--bg-card, #ffffff)', padding: '8px 14px', borderRadius: 12, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', display: 'block' }}>Matching Skills</span>
                <span style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--emerald-light, #10b981)' }}>
                  {recList[0]?.matching_skills?.length || 0} possessed
                </span>
              </div>
              <div style={{ background: 'var(--bg-card, #ffffff)', padding: '8px 14px', borderRadius: 12, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', display: 'block' }}>Priority Gaps</span>
                <span style={{ fontSize: '.95rem', fontWeight: 700, color: '#f59e0b' }}>
                  {recList[0]?.missing_or_weaker_skills?.length || 0} areas to level up
                </span>
              </div>
            </div>
          </div>

          {/* Large Circular Gauge */}
          <div style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '24px 28px',
            textAlign: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            minWidth: 170,
          }}>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
              Role Fit Score
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--emerald-light, #10b981)', lineHeight: 1.1 }}>
              {recList[0]?.fit_score || topScore}%
            </div>
            <div style={{ fontSize: '.72rem', color: 'var(--text-sec)', marginTop: 4 }}>
              Multi-Factor Alignment
            </div>
          </div>
        </div>
      </div>

      {/* Role Navigation Pills / Catalog Ranking Comparison */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-strong)' }}>
            All Evaluated Career Pathways ({recList.length})
          </h2>
          <span style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>
            Select a role to inspect detailed matching skills & next steps
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
        }}>
          {recList.map((role, idx) => {
            const isSelected = selectedRoleIndex === idx;
            const tierStyle = getTierBadgeStyle(role.match_tier);

            return (
              <div
                key={role.role_name}
                id={`role-card-select-${role.role_name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedRoleIndex(idx)}
                style={{
                  background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card, #ffffff)',
                  border: isSelected ? '2px solid var(--emerald-light, #10b981)' : '1px solid var(--border)',
                  borderRadius: 16,
                  padding: '16px 18px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? '0 4px 16px rgba(16, 185, 129, 0.12)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: '.75rem', fontWeight: 800, color: isSelected ? 'var(--emerald-light, #10b981)' : 'var(--text-muted)' }}>
                    #{role.rank}
                  </span>
                  <span style={{
                    fontSize: '.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: tierStyle.bg,
                    color: tierStyle.text,
                  }}>
                    {role.fit_score}%
                  </span>
                </div>
                <div style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>
                  {role.role_name}
                </div>
                <div style={{ fontSize: '.75rem', color: tierStyle.text, fontWeight: 600 }}>
                  {role.match_tier}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Role Breakdown Card */}
      {activeRole && (
        <motion.div
          key={activeRole.role_name}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '28px 32px',
            marginBottom: 32,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          {/* Active Role Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                  {activeRole.role_name}
                </h2>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: 14,
                  fontSize: '.72rem',
                  fontWeight: 700,
                  background: activeTierStyle.bg,
                  color: activeTierStyle.text,
                  border: `1px solid ${activeTierStyle.border}`,
                }}>
                  {activeRole.match_tier}
                </span>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: 14,
                  fontSize: '.72rem',
                  fontWeight: 600,
                  background: activeDemandStyle.bg,
                  color: activeDemandStyle.text,
                }}>
                  {activeRole.demand_level} Demand
                </span>
              </div>
              <p style={{ fontSize: '.88rem', color: 'var(--text-sec)', maxWidth: 680, lineHeight: 1.5 }}>
                {activeRole.fit_reason}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Overall Fit</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: activeTierStyle.text }}>
                {activeRole.fit_score}%
              </div>
            </div>
          </div>

          {/* Explainability Breakdown: 2 Columns (Matching Skills vs Missing / Weaker Skills) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, margin: '24px 0' }}>
            {/* Matching Skills */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.03)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 16,
              padding: '20px 22px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <CheckCircle2 size={18} color="var(--emerald-light, #10b981)" />
                <h3 style={{ fontSize: '.98rem', fontWeight: 700, color: 'var(--text-strong)' }}>
                  Matching Skills Possessed ({activeRole.matching_skills?.length || 0})
                </h3>
              </div>

              {activeRole.matching_skills?.length === 0 ? (
                <div style={{ fontSize: '.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No matching verified skills recorded for this role yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {activeRole.matching_skills.map((skill) => (
                    <div
                      key={skill.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'var(--bg-card, #ffffff)',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '.88rem', fontWeight: 600, color: 'var(--text-strong)' }}>
                          {skill.name}
                        </span>
                        <span style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginLeft: 8 }}>
                          {skill.is_core ? 'Core' : 'Secondary'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.78rem', color: 'var(--text-sec)' }}>
                        <span style={{ fontWeight: 700, color: 'var(--emerald-light, #10b981)' }}>
                          Lvl {skill.current_level}
                        </span>
                        <span>/</span>
                        <span>Req {skill.required_level}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Missing or Weaker Skills */}
            <div style={{
              background: 'rgba(245, 158, 11, 0.03)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: 16,
              padding: '20px 22px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <AlertTriangle size={18} color="#f59e0b" />
                <h3 style={{ fontSize: '.98rem', fontWeight: 700, color: 'var(--text-strong)' }}>
                  Missing or Weaker Skills ({activeRole.missing_or_weaker_skills?.length || 0})
                </h3>
              </div>

              {activeRole.missing_or_weaker_skills?.length === 0 ? (
                <div style={{ fontSize: '.82rem', color: 'var(--emerald-light, #10b981)', fontWeight: 600 }}>
                  ✓ All benchmark skills for this role are fulfilled!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {activeRole.missing_or_weaker_skills.map((skill) => (
                    <div
                      key={skill.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'var(--bg-card, #ffffff)',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '.88rem', fontWeight: 600, color: 'var(--text-strong)' }}>
                          {skill.name}
                        </span>
                        <span style={{
                          fontSize: '.68rem',
                          padding: '2px 6px',
                          borderRadius: 8,
                          marginLeft: 8,
                          background: skill.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: skill.priority === 'high' ? '#f87171' : '#f59e0b',
                          fontWeight: 700,
                        }}>
                          {skill.priority === 'high' ? 'High Priority' : 'Medium Priority'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.78rem', color: 'var(--text-sec)' }}>
                        <span style={{ color: skill.current_level === 0 ? '#f87171' : '#f59e0b', fontWeight: 700 }}>
                          {skill.current_level === 0 ? 'Missing' : `Lvl ${skill.current_level}`}
                        </span>
                        <span>/</span>
                        <span>Req {skill.required_level}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actionable Next Steps */}
          <div style={{
            background: 'var(--bg-main, #fafafa)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '20px 24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <TrendingUp size={18} color="var(--emerald-light, #10b981)" />
              <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text-strong)' }}>
                Suggested Actionable Next Steps for {activeRole.role_name}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(activeRole.suggested_next_steps || []).map((step, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '.86rem', color: 'var(--text-sec)', lineHeight: 1.5 }}>
                  <span style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--emerald-light, #10b981)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '.72rem',
                    fontWeight: 800,
                    flexShrink: 0,
                    marginTop: 2,
                  }}>
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Methodology & Academic Transparency Note */}
      <div
        id="recommendation-methodology-card"
        style={{
          background: 'rgba(59, 130, 246, 0.04)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: 20,
          padding: '24px 28px',
          marginBottom: 32,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <ShieldCheck size={20} color="#3b82f6" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-strong)' }}>
            Transparent Ranking Methodology & Limitations
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
          <div style={{ background: 'var(--bg-card, #ffffff)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Core Skills Match</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong)' }}>50% Weight</div>
            <div style={{ fontSize: '.72rem', color: 'var(--text-sec)', marginTop: 4 }}>
              Direct technical alignment with required languages & frameworks.
            </div>
          </div>

          <div style={{ background: 'var(--bg-card, #ffffff)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Secondary Competency</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong)' }}>20% Weight</div>
            <div style={{ fontSize: '.72rem', color: 'var(--text-sec)', marginTop: 4 }}>
              Supporting tools, version control, and problem solving skills.
            </div>
          </div>

          <div style={{ background: 'var(--bg-card, #ffffff)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Role Preference & Assessments</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong)' }}>15% Weight</div>
            <div style={{ fontSize: '.72rem', color: 'var(--text-sec)', marginTop: 4 }}>
              Target career intent and prior empirical readiness scores.
            </div>
          </div>

          <div style={{ background: 'var(--bg-card, #ffffff)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Education & Experience</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong)' }}>15% Weight</div>
            <div style={{ fontSize: '.72rem', color: 'var(--text-sec)', marginTop: 4 }}>
              Technical degree relevance and verified work experience.
            </div>
          </div>
        </div>

        <p style={{ fontSize: '.82rem', color: 'var(--text-sec)', lineHeight: 1.5, margin: 0 }}>
          <strong>Academic & Operational Disclaimer:</strong> {recommendationsData?.disclaimer || (
            "Role match scores evaluate technical and academic competency alignment against documented " +
            "entry-level curriculum and job benchmarks. They indicate developmental readiness and learning " +
            "priorities, not a commercial ATS hiring decision or employment guarantee."
          )}
        </p>
      </div>

      {/* History of Past Recommendation Runs */}
      {historyList.length > 1 && (
        <div style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '24px 28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Clock size={18} color="var(--text-muted)" />
            <h3 style={{ fontSize: '.98rem', fontWeight: 700, color: 'var(--text-strong)' }}>
              Past Recommendation Evaluations ({historyList.length})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {historyList.slice(0, 5).map((h) => (
              <div
                key={h.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  fontSize: '.84rem',
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--text-strong)' }}>{h.top_role}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: 12 }}>
                    {new Date(h.created_at).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--emerald-light, #10b981)' }}>
                  Fit Score: {h.top_fit_score}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Assessment() {
  return (
    <AssessmentErrorBoundary>
      <AssessmentContent />
    </AssessmentErrorBoundary>
  );
}

export default Assessment;
