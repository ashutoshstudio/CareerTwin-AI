/**
 * SkillGap.jsx — Student Skill Gap Analysis & Prioritized Recommendations
 * Route: /skill-gap
 * Connected to FastAPI backend: POST /api/v1/skill-gap/analyze & GET /api/v1/skill-gap/latest
 */

import React, { Component, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Check,
  X,
  TrendingUp,
  Clock,
  Layers,
  ArrowUpRight,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Loading from '../components/Loading';

const SUPPORTED_ROLES = [
  'Data Analyst',
  'Python Developer',
  'Machine Learning Engineer',
];

function SkillGap() {
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Data Analyst');
  const [includeResumeSkills, setIncludeResumeSkills] = useState(true);
  const [gapData, setGapData] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'met', 'improve', 'missing'
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Initial data loading
  useEffect(() => {
    let isMounted = true;
    if (!token) {
      setLoading(false);
      return;
    }

    async function loadInitial() {
      try {
        setLoading(true);
        setErrorMsg('');

        // 1. Fetch latest skill gap
        try {
          const latest = await api.getSkillGap(token);
          if (isMounted && latest && latest.target_role) {
            setGapData(latest);
            setSelectedRole(latest.target_role);
          }
        } catch (err) {
          console.warn('Could not load latest skill gap:', err);
        }

        // 2. Fetch history
        try {
          const hist = await api.getSkillGapHistory(token);
          if (isMounted) setHistory(hist || []);
        } catch {
          // non-blocking
        }
      } catch (err) {
        if (isMounted) setErrorMsg(err.message || 'Failed to initialize skill gap analysis.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInitial();
    return () => { isMounted = false; };
  }, [token]);

  const handleRunAnalysis = async (roleToAnalyze = selectedRole) => {
    if (!token) {
      setErrorMsg('Please log in to analyze your skill gaps.');
      return;
    }

    setAnalyzing(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const result = await api.analyzeSkillGap(
        {
          target_role: roleToAnalyze,
          include_resume_skills: includeResumeSkills,
        },
        token
      );

      setGapData(result);
      setSelectedRole(result.target_role);
      setSuccessMsg(`Skill gap analysis updated for ${result.target_role}!`);

      // Refresh history
      try {
        const hist = await api.getSkillGapHistory(token);
        setHistory(hist || []);
      } catch {
        // non-blocking
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to execute skill gap analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'high') {
      return { background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.25)', label: 'High Priority' };
    }
    if (priority === 'medium') {
      return { background: 'rgba(245, 158, 11, 0.1)', color: '#b45309', border: '1px solid rgba(245, 158, 11, 0.25)', label: 'Medium Priority' };
    }
    if (priority === 'low') {
      return { background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.25)', label: 'Low Priority' };
    }
    return { background: 'rgba(16, 185, 129, 0.1)', color: '#047857', border: '1px solid rgba(16, 185, 129, 0.25)', label: 'Requirement Met' };
  };

  const getFilteredSkills = () => {
    const list = gapData?.skills_comparison || [];
    if (activeTab === 'met') return list.filter((s) => s.status === 'met');
    if (activeTab === 'improve') return list.filter((s) => s.status === 'needs_improvement');
    if (activeTab === 'missing') return list.filter((s) => s.status === 'missing');
    return list;
  };

  if (loading) {
    return (
      <div id="page-skill-gap" className="page" style={{ padding: '60px 0', textAlign: 'center' }}>
        <Loading message="Evaluating student skill profile against entry-level role requirements..." />
      </div>
    );
  }

  const comparisons = getFilteredSkills();
  const coverage = gapData?.skill_coverage_percentage || 0;
  const alignment = gapData?.proficiency_alignment_percentage || 0;

  return (
    <div id="page-skill-gap" className="page" style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 60 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="page-heading">Skill Gap Analysis</div>
        <div className="page-subtitle">
          Benchmark your verified competencies against essential entry-level industry requirements, identify missing skills, and review prioritized learning actions.
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

      {/* Role Selection Toolbar */}
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
          <label htmlFor="skill-gap-role-select" style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text-strong)' }}>
            Benchmark Target Role:
          </label>
          <select
            id="skill-gap-role-select"
            className="form-input"
            style={{ padding: '8px 14px', width: 220, fontSize: '.9rem' }}
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              handleRunAnalysis(e.target.value);
            }}
          >
            {SUPPORTED_ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '.84rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              id="skill-gap-resume-checkbox"
              checked={includeResumeSkills}
              onChange={(e) => setIncludeResumeSkills(e.target.checked)}
            />
            <span>Include unmerged resume skills</span>
          </label>
        </div>

        <button
          type="button"
          id="run-skill-gap-btn"
          disabled={analyzing}
          onClick={() => handleRunAnalysis(selectedRole)}
          className="btn btn--primary"
          style={{
            padding: '10px 22px',
            fontSize: '.88rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {analyzing ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>Analyzing Competencies...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Analyze Skill Gap</span>
            </>
          )}
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {/* Coverage Percentage */}
        <div
          style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '20px 18px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Skill Coverage
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: coverage >= 70 ? '#10b981' : coverage >= 50 ? '#f59e0b' : '#ef4444', marginTop: 4 }}>
            {coverage}%
          </div>
          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {gapData ? `${gapData.met_count + gapData.improvement_count}/${gapData.total_required} skills possessed` : 'Evaluating'}
          </div>
        </div>

        {/* Proficiency Alignment */}
        <div
          style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '20px 18px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Proficiency Alignment
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: alignment >= 70 ? '#10b981' : alignment >= 50 ? '#f59e0b' : '#ef4444', marginTop: 4 }}>
            {alignment}%
          </div>
          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Level fulfillment vs role benchmarks
          </div>
        </div>

        {/* Met Requirements */}
        <div
          style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '20px 18px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Proficiency Met
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', marginTop: 4 }}>
            {gapData?.met_count || 0}
          </div>
          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Skills meeting benchmark target
          </div>
        </div>

        {/* Gaps to Close */}
        <div
          style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '20px 18px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Gaps to Close
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ef4444', marginTop: 4 }}>
            {(gapData?.missing_count || 0) + (gapData?.improvement_count || 0)}
          </div>
          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {gapData?.missing_count || 0} missing, {gapData?.improvement_count || 0} need upgrade
          </div>
        </div>
      </div>

      {/* Evaluated Skills Breakdown */}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-strong)' }}>
              Competency Level Comparison
            </h3>
            <p style={{ fontSize: '.84rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Comparing your current verified proficiency against benchmark requirements for <strong>{gapData?.target_role || selectedRole}</strong>.
            </p>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: 6, background: 'var(--bg, #f8fafc)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              style={{
                border: 'none',
                background: activeTab === 'all' ? '#ffffff' : 'transparent',
                fontWeight: activeTab === 'all' ? 700 : 500,
                color: activeTab === 'all' ? 'var(--text-strong)' : 'var(--text-muted)',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: '.8rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'all' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              All ({gapData?.skills_comparison?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('met')}
              style={{
                border: 'none',
                background: activeTab === 'met' ? '#ffffff' : 'transparent',
                fontWeight: activeTab === 'met' ? 700 : 500,
                color: activeTab === 'met' ? '#047857' : 'var(--text-muted)',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: '.8rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'met' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              Met ({gapData?.met_count || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('improve')}
              style={{
                border: 'none',
                background: activeTab === 'improve' ? '#ffffff' : 'transparent',
                fontWeight: activeTab === 'improve' ? 700 : 500,
                color: activeTab === 'improve' ? '#b45309' : 'var(--text-muted)',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: '.8rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'improve' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              Needs Upgrade ({gapData?.improvement_count || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('missing')}
              style={{
                border: 'none',
                background: activeTab === 'missing' ? '#ffffff' : 'transparent',
                fontWeight: activeTab === 'missing' ? 700 : 500,
                color: activeTab === 'missing' ? '#dc2626' : 'var(--text-muted)',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: '.8rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'missing' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              Missing ({gapData?.missing_count || 0})
            </button>
          </div>
        </div>

        {/* Comparison List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {comparisons.map((item) => {
            const priorityBadge = getPriorityBadge(item.priority);
            return (
              <div
                key={item.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  background: 'var(--bg, #f8fafc)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: '.92rem', color: 'var(--text-strong)' }}>
                      {item.name}
                    </span>
                    <span
                      style={{
                        fontSize: '.7rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: item.category === 'Core Requirement' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                        color: item.category === 'Core Requirement' ? '#047857' : '#475569',
                      }}
                    >
                      {item.category}
                    </span>
                  </div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {item.status === 'met' && '✓ Requirement fulfilled'}
                    {item.status === 'needs_improvement' && `Proficiency gap: ${item.gap} level(s)`}
                    {item.status === 'missing' && 'Skill not present on student profile'}
                  </div>
                </div>

                {/* Level Comparison Display */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Current Level</div>
                    <div style={{ fontWeight: 800, fontSize: '.88rem', color: item.current_level > 0 ? 'var(--text-strong)' : '#ef4444' }}>
                      {item.current_level > 0 ? `${item.current_level}/5` : '0 (None)'}
                    </div>
                  </div>

                  <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>→</div>

                  <div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Target Level</div>
                    <div style={{ fontWeight: 800, fontSize: '.88rem', color: '#10b981' }}>
                      {item.required_level}/5
                    </div>
                  </div>

                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: '.75rem',
                      fontWeight: 700,
                      background: priorityBadge.background,
                      color: priorityBadge.color,
                      border: priorityBadge.border,
                      marginLeft: 8,
                    }}
                  >
                    {priorityBadge.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prioritized Learning Recommendations */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <BookOpen size={18} color="#3b82f6" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-strong)' }}>
            Prioritized Learning Recommendations
          </h3>
        </div>
        <p style={{ fontSize: '.84rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          Actionable steps ranked to maximize your career readiness and close high-priority competency deficits first.
        </p>

        {gapData?.recommendations?.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#10b981', fontWeight: 600, fontSize: '.9rem' }}>
            🎉 Excellent! All required skills for {gapData?.target_role || selectedRole} meet or exceed benchmark standards.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {gapData?.recommendations?.map((rec, idx) => {
              const priorityBadge = getPriorityBadge(rec.priority);
              return (
                <div
                  key={`${rec.skill_name}-${idx}`}
                  style={{
                    padding: '16px 20px',
                    background: 'var(--bg, #f8fafc)',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'start',
                    justifyContent: 'space-between',
                    gap: 16,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: '1 1 300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--text-strong)' }}>
                        {rec.skill_name}
                      </span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 6,
                          fontSize: '.72rem',
                          fontWeight: 700,
                          background: priorityBadge.background,
                          color: priorityBadge.color,
                          border: priorityBadge.border,
                        }}
                      >
                        {priorityBadge.label}
                      </span>
                    </div>
                    <p style={{ fontSize: '.85rem', color: 'var(--text-strong)', lineHeight: 1.5, margin: 0 }}>
                      {rec.recommendation}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: 120 }}>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Action Required</div>
                    <div style={{ fontSize: '.82rem', fontWeight: 700, color: rec.action_type === 'acquire_missing' ? '#dc2626' : '#b45309', marginTop: 2 }}>
                      {rec.action_type === 'acquire_missing' ? 'Acquire Skill' : `Level ${rec.current_level} → ${rec.target_level}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Analysis History */}
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
              Skill Gap History
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
                  <span style={{ fontSize: '.84rem', fontWeight: 800, color: item.skill_coverage_percentage >= 70 ? '#10b981' : '#f59e0b' }}>
                    {Math.round(item.skill_coverage_percentage)}% Cov.
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: '.74rem', color: 'var(--text-muted)' }}>
                  <span>{item.missing_count} missing</span>
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

class SkillGapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SkillGapErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div id="page-skill-gap" className="page" style={{ maxWidth: 960, margin: '40px auto', padding: '32px', textAlign: 'center' }}>
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
              Something went wrong loading Skill Gap Analysis
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

export default function SkillGapWrapper(props) {
  return (
    <SkillGapErrorBoundary>
      <SkillGap {...props} />
    </SkillGapErrorBoundary>
  );
}
