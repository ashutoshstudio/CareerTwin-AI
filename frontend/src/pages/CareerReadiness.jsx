/**
 * CareerReadiness.jsx — Genuine ML-Powered Career Readiness Prediction
 * Route: /career-readiness
 * Connected to FastAPI backend: POST /api/v1/readiness/assess & GET /api/v1/readiness/latest
 */

import { Component, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Briefcase,
  GraduationCap,
  Code2,
  Globe,
  Info,
  Clock,
  Check,
  X,
  Cpu,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Loading from '../components/Loading';
import { CATEGORIZED_ROLES } from '../data/careerPaths';

function CareerReadiness() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(() => Boolean(token));
  const [assessing, setAssessing] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Data Analyst');
  const [includeResumeSkills, setIncludeResumeSkills] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [explanation, setExplanation] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Initial data loading
  useEffect(() => {
    let isMounted = true;
    if (!token) return;

    async function loadData() {
      try {
        setErrorMsg('');

        // 1. Fetch latest assessment
        try {
          const latest = await api.getReadiness(token);
          if (isMounted && latest && latest.target_role) {
            setAssessment(latest);
            setSelectedRole(latest.target_role);

            // Fetch initial explanation
            api.getReadinessExplanation({ target_role: latest.target_role }, token)
              .then((xai) => { if (isMounted) setExplanation(xai); })
              .catch(() => {});
          }
        } catch (err) {
          console.warn('Could not load latest readiness assessment:', err);
        }

        // 2. Fetch history
        try {
          const hist = await api.getReadinessHistory(token);
          if (isMounted) setHistory(hist || []);
        } catch {
          // non-blocking
        }

        // 3. Fetch model transparency info
        try {
          const info = await api.getReadinessModelInfo();
          if (isMounted) setModelInfo(info);
        } catch {
          // non-blocking
        }
      } catch (err) {
        if (isMounted) setErrorMsg(err.message || 'Failed to initialize readiness assessment.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [token]);

  const handleRunAssessment = async (roleToAssess = selectedRole) => {
    if (!token) {
      setErrorMsg('Please log in to assess your career readiness.');
      return;
    }

    setAssessing(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const result = await api.assessReadiness(
        {
          target_role: roleToAssess,
          include_resume_skills: includeResumeSkills,
        },
        token
      );

      setAssessment(result);
      setSelectedRole(result.target_role);
      setSuccessMsg(`Career readiness assessed for ${result.target_role}!`);

      // Refresh explanation
      try {
        const xai = await api.getReadinessExplanation(
          { target_role: result.target_role, include_resume_skills: includeResumeSkills },
          token
        );
        setExplanation(xai);
      } catch (xErr) {
        console.warn('Could not update XAI explanation:', xErr);
      }

      // Refresh history
      try {
        const hist = await api.getReadinessHistory(token);
        setHistory(hist || []);
      } catch {
        // non-blocking
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to assess career readiness.');
    } finally {
      setAssessing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#10b981'; // Emerald
    if (score >= 50) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const getCategoryBadgeStyle = (category) => {
    if (category === 'High Readiness') {
      return { background: 'rgba(16, 185, 129, 0.12)', color: '#047857', border: '1px solid rgba(16, 185, 129, 0.3)' };
    }
    if (category === 'Moderate Readiness') {
      return { background: 'rgba(245, 158, 11, 0.12)', color: '#b45309', border: '1px solid rgba(245, 158, 11, 0.3)' };
    }
    return { background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.3)' };
  };

  if (loading) {
    return (
      <div id="page-career-readiness" className="page" style={{ padding: '60px 0', textAlign: 'center' }}>
        <Loading message="Loading ML career readiness models and student competencies..." />
      </div>
    );
  }

  const score = assessment?.readiness_score || 0;
  const scoreColor = getScoreColor(score);
  const dims = assessment?.dimension_scores || { technical_skills: 0, experience: 0, education: 0, portfolio: 0 };

  return (
    <div id="page-career-readiness" className="page" style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 60 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="page-heading">Career Readiness Prediction</div>
        <div className="page-subtitle">
          Scientific Scikit-learn ensemble assessment evaluating student competency alignment against entry-level job market standards.
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

      {/* Role Selection & Execution Toolbar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <label htmlFor="target-role-select" style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text-strong)' }}>
            Target Entry-Level Role:
          </label>
          <select
            id="target-role-select"
            className="form-input"
            style={{ padding: '8px 14px', width: 220, fontSize: '.9rem' }}
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              handleRunAssessment(e.target.value);
            }}
          >
            {CATEGORIZED_ROLES.map((group) => (
              <optgroup key={group.category} label={group.category}>
                {group.roles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </optgroup>
            ))}
          </select>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '.84rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              id="include-resume-checkbox"
              checked={includeResumeSkills}
              onChange={(e) => setIncludeResumeSkills(e.target.checked)}
            />
            <span>Include unmerged resume skills</span>
          </label>
        </div>

        <button
          type="button"
          id="run-assessment-btn"
          disabled={assessing}
          onClick={() => handleRunAssessment(selectedRole)}
          className="btn btn--primary"
          style={{
            padding: '10px 22px',
            fontSize: '.88rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {assessing ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>Evaluating Model...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Assess Readiness</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Overview & Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 24, marginBottom: 28, alignItems: 'start' }}>
        {/* Left: Overall Readiness Gauge Card */}
        <div
          id="readiness-gauge-card"
          style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '32px 24px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
            Overall Career Readiness
          </div>

          {/* Radial / Circle Score Indicator */}
          <div
            style={{
              position: 'relative',
              width: 170,
              height: 170,
              margin: '0 auto 20px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="170" height="170" viewBox="0 0 170 170" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="85"
                cy="85"
                r="70"
                stroke="var(--border, #e2e8f0)"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="85"
                cy="85"
                r="70"
                stroke={scoreColor}
                strokeWidth="12"
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * score) / 100}
                strokeLinecap="round"
                fill="none"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-strong)', lineHeight: 1 }}>
                {Math.round(score)}%
              </div>
              <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Readiness Index
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <span
              style={{
                display: 'inline-block',
                padding: '6px 16px',
                borderRadius: 20,
                fontSize: '.88rem',
                fontWeight: 700,
                ...getCategoryBadgeStyle(assessment?.readiness_category),
              }}
            >
              {assessment?.readiness_category || 'Assessing'}
            </span>
          </div>

          <div style={{ fontSize: '.84rem', color: 'var(--text-muted)', lineHeight: 1.5, padding: '0 8px' }}>
            Targeting <strong>{assessment?.target_role || selectedRole}</strong>.
            Evaluated by Scikit-learn Random Forest model (version: {assessment?.model_version || 'rf_v1.0'}).
          </div>
        </div>

        {/* Right: 4 Dimensional Progress Breakdowns */}
        <div
          style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '28px 30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-strong)', marginBottom: 20 }}>
            Readiness Breakdown by Dimension
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* 1. Technical Skills */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.9rem', fontWeight: 700, color: 'var(--text-strong)' }}>
                  <Code2 size={16} color="#10b981" />
                  <span>Technical Competencies</span>
                </div>
                <span style={{ fontSize: '.88rem', fontWeight: 800, color: getScoreColor(dims.technical_skills) }}>
                  {dims.technical_skills}%
                </span>
              </div>
              <div style={{ height: 8, background: 'var(--border, #e2e8f0)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${dims.technical_skills}%`, background: getScoreColor(dims.technical_skills), borderRadius: 10, transition: 'width 0.6s ease' }} />
              </div>
            </div>

            {/* 2. Prior Experience */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.9rem', fontWeight: 700, color: 'var(--text-strong)' }}>
                  <Briefcase size={16} color="#3b82f6" />
                  <span>Work & Internship Experience</span>
                </div>
                <span style={{ fontSize: '.88rem', fontWeight: 800, color: getScoreColor(dims.experience) }}>
                  {dims.experience}%
                </span>
              </div>
              <div style={{ height: 8, background: 'var(--border, #e2e8f0)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${dims.experience}%`, background: '#3b82f6', borderRadius: 10, transition: 'width 0.6s ease' }} />
              </div>
            </div>

            {/* 3. Academic Education */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.9rem', fontWeight: 700, color: 'var(--text-strong)' }}>
                  <GraduationCap size={16} color="#8b5cf6" />
                  <span>Academic Qualification</span>
                </div>
                <span style={{ fontSize: '.88rem', fontWeight: 800, color: getScoreColor(dims.education) }}>
                  {dims.education}%
                </span>
              </div>
              <div style={{ height: 8, background: 'var(--border, #e2e8f0)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${dims.education}%`, background: '#8b5cf6', borderRadius: 10, transition: 'width 0.6s ease' }} />
              </div>
            </div>

            {/* 4. Portfolio & Online Presence */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.9rem', fontWeight: 700, color: 'var(--text-strong)' }}>
                  <Globe size={16} color="#06b6d4" />
                  <span>Portfolio Presence (GitHub & LinkedIn)</span>
                </div>
                <span style={{ fontSize: '.88rem', fontWeight: 800, color: getScoreColor(dims.portfolio) }}>
                  {dims.portfolio}%
                </span>
              </div>
              <div style={{ height: 8, background: 'var(--border, #e2e8f0)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${dims.portfolio}%`, background: '#06b6d4', borderRadius: 10, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Skills Coverage Section */}
      <div
        style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '28px 30px',
          marginBottom: 28,
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-strong)', marginBottom: 6 }}>
          Core Competency Alignment for {assessment?.target_role || selectedRole}
        </h3>
        <p style={{ fontSize: '.84rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          Direct match between your profile skills and essential entry-level competencies required for this role.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Matching Core Skills */}
          <div style={{ background: 'var(--bg, #f8fafc)', padding: '18px 20px', borderRadius: 14, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontWeight: 700, fontSize: '.88rem', marginBottom: 12 }}>
              <Check size={16} />
              <span>Possessed Core Skills ({assessment?.matching_core_skills?.length || 0})</span>
            </div>
            {assessment?.matching_core_skills?.length === 0 ? (
              <div style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>No matching core skills found on your profile yet.</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {assessment.matching_core_skills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      color: '#047857',
                      padding: '5px 12px',
                      borderRadius: 8,
                      fontSize: '.82rem',
                      fontWeight: 600,
                    }}
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Missing Core Skills */}
          <div style={{ background: 'var(--bg, #f8fafc)', padding: '18px 20px', borderRadius: 14, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f59e0b', fontWeight: 700, fontSize: '.88rem', marginBottom: 12 }}>
              <X size={16} />
              <span>Recommended Core Skills to Acquire ({assessment?.missing_core_skills?.length || 0})</span>
            </div>
            {assessment?.missing_core_skills?.length === 0 ? (
              <div style={{ fontSize: '.82rem', color: '#10b981', fontWeight: 600 }}>All core skills for this role are present!</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {assessment.missing_core_skills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      color: '#b45309',
                      padding: '5px 12px',
                      borderRadius: 8,
                      fontSize: '.82rem',
                      fontWeight: 600,
                    }}
                  >
                    + {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Explainable AI: SHAP & LIME Attribution */}
      {explanation && (
        <div
          id="xai-readiness-breakdown"
          style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 20,
            padding: '24px 28px',
            marginBottom: 28,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cpu size={20} color="var(--emerald-light, #10b981)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-strong)', margin: 0 }}>
                Explainable AI: SHAP Feature Attribution
              </h3>
            </div>
            <a
              href="/explainable-ai"
              style={{
                fontSize: '.78rem',
                fontWeight: 700,
                color: 'var(--emerald-light, #10b981)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              Open Full XAI Dashboard →
            </a>
          </div>

          <p style={{ fontSize: '.84rem', color: 'var(--text-sec)', marginBottom: 16, lineHeight: 1.5 }}>
            Exact mathematical decomposition of your score using <strong>SHAP TreeExplainer</strong> on the trained RandomForest model.
            Baseline expected score is <strong>{explanation.base_value} pts</strong>.
          </p>

          {/* Fidelity Badge */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 12,
            padding: '10px 14px',
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
            fontSize: '.78rem',
          }}>
            <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>
              Fidelity Verification: Base ({explanation.base_value} pts) + Net SHAP ({explanation.fidelity_check?.sum_shap > 0 ? `+${explanation.fidelity_check?.sum_shap}` : explanation.fidelity_check?.sum_shap} pts) = Predicted {explanation.predicted_score}%
            </span>
            <span style={{ fontWeight: 700, color: 'var(--emerald-light, #10b981)' }}>
              ✓ Exact Match (Δ = {explanation.fidelity_check?.discrepancy} pts)
            </span>
          </div>

          {/* Drivers Grid: Positive vs Negative */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
            {/* Positive */}
            <div style={{ background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem', fontWeight: 700, color: 'var(--emerald-light, #10b981)', marginBottom: 10 }}>
                <TrendingUp size={15} />
                <span>Top Score Boosters (+ Points)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {explanation.positive_contributors?.slice(0, 3).map((item) => (
                  <div key={item.feature_name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.8rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{item.feature_label}</span>
                    <span style={{ fontWeight: 800, color: 'var(--emerald-light, #10b981)' }}>+{item.shap_value} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Negative */}
            <div style={{ background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem', fontWeight: 700, color: '#f87171', marginBottom: 10 }}>
                <TrendingDown size={15} />
                <span>Top Development Areas (- Points)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {explanation.negative_contributors?.slice(0, 3).map((item) => (
                  <div key={item.feature_name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.8rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{item.feature_label}</span>
                    <span style={{ fontWeight: 800, color: '#f87171' }}>{item.shap_value} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            * <em>Attribution Note:</em> {explanation.causal_disclaimer}
          </div>
        </div>
      )}

      {/* Model Transparency & Scientific Limitations */}
      <div
        style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '24px 28px',
          marginBottom: 28,
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Info size={18} color="#3b82f6" />
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong)' }}>
            Model Transparency & Evaluation Metrics
          </h4>
        </div>

        {modelInfo && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: '10px 14px', background: 'var(--bg, #f8fafc)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Test R² Score</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', marginTop: 2 }}>
                {modelInfo.metrics.r2_score}
              </div>
            </div>

            <div style={{ padding: '10px 14px', background: 'var(--bg, #f8fafc)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Test Accuracy</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', marginTop: 2 }}>
                {(modelInfo.metrics.accuracy * 100).toFixed(1)}%
              </div>
            </div>

            <div style={{ padding: '10px 14px', background: 'var(--bg, #f8fafc)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Mean Absolute Error</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-strong)', marginTop: 2 }}>
                {modelInfo.metrics.mae} pts
              </div>
            </div>

            <div style={{ padding: '10px 14px', background: 'var(--bg, #f8fafc)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Evaluation Samples</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-strong)', marginTop: 2 }}>
                {modelInfo.metrics.train_samples + modelInfo.metrics.test_samples}
              </div>
            </div>
          </div>
        )}

        <div style={{ fontSize: '.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <strong>Scientific Limitations:</strong>
          <ul style={{ margin: '6px 0 0 0', paddingLeft: 18 }}>
            {(assessment?.limitations || []).map((lim, i) => (
              <li key={i}>{lim}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* History of Past Assessments */}
      {history.length > 0 && (
        <div
          style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '24px 28px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Clock size={16} color="var(--text-muted)" />
            <h4 style={{ fontSize: '.95rem', fontWeight: 800, color: 'var(--text-strong)' }}>
              Assessment History
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {history.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '12px 14px',
                  background: 'var(--bg, #f8fafc)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '.86rem', color: 'var(--text-strong)' }}>
                    {item.target_role}
                  </div>
                  <span style={{ fontSize: '.84rem', fontWeight: 800, color: getScoreColor(item.readiness_score) }}>
                    {Math.round(item.readiness_score)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: '.74rem', color: 'var(--text-muted)' }}>
                  <span>{item.readiness_category}</span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

class CareerReadinessErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CareerReadinessErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div id="page-career-readiness" className="page" style={{ maxWidth: 960, margin: '40px auto', padding: '32px', textAlign: 'center' }}>
          <div
            style={{
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: '36px 24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚠️</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-strong)', marginBottom: 8 }}>
              Something went wrong loading Career Readiness
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginBottom: 20 }}>
              {this.state.error?.message || 'An unexpected error occurred while rendering the page.'}
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
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

export default function CareerReadinessWrapper(props) {
  return (
    <CareerReadinessErrorBoundary>
      <CareerReadiness {...props} />
    </CareerReadinessErrorBoundary>
  );
}
