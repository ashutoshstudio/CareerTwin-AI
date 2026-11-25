/**
 * MockInterview.jsx — Module 13: AI Mock Interview System
 *
 * Interactive, personalized AI mock interviewer grounded in the student's
 * CareerTwin profile, resume, readiness, skill gaps, ATS evaluation, and
 * GitHub portfolio. Supports Setup, Active Interview with adaptive questioning,
 * Complete Evaluation Report with 100-pt rubrics, and Persistent History.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CATEGORIZED_ROLES } from '../data/careerPaths';
import {
  Mic,
  Play,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Award,
  BarChart3,
  History,
  Trash2,
  FileText,
  Sparkles,
  RotateCcw,
  StopCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Target,
  Layers,
  ShieldAlert,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';

const INTERVIEW_TYPE_CARDS = [
  {
    value: 'Mixed',
    label: 'Mixed Interview',
    desc: 'Realistic blend of HR warm-up, Technical skills, and Behavioral scenarios.',
  },
  {
    value: 'Technical',
    label: 'Technical Interview',
    desc: 'Deep focus on coding, SQL, architectures, and role-specific concepts.',
  },
  {
    value: 'Behavioral',
    label: 'Behavioral (STAR)',
    desc: 'Teamwork, conflict resolution, debugging setbacks, and ownership.',
  },
  {
    value: 'HR',
    label: 'HR & Culture Fit',
    desc: 'Self-introduction, strengths, growth areas, motivation, and career goals.',
  },
];

const DIFFICULTY_LEVELS = [
  { value: 'Beginner', label: 'Beginner', desc: 'Foundational concepts & entry-level check' },
  { value: 'Intermediate', label: 'Intermediate', desc: 'Practical application & trade-offs' },
  { value: 'Advanced', label: 'Advanced', desc: 'Optimization, scale & edge cases' },
];

const QUESTION_COUNTS = [
  { count: 5, duration: 15, label: 'Quick Practice' },
  { count: 10, duration: 25, label: 'Standard Session' },
  { count: 15, duration: 40, label: 'Full Simulation' },
];

const RUBRIC_LABELS = {
  technical_accuracy: 'Technical Accuracy',
  relevance: 'Relevance',
  explanation_clarity: 'Explanation & Clarity',
  completeness: 'Completeness',
  communication_quality: 'Communication Quality',
  structure: 'Structure & STAR',
  specificity: 'Specificity',
  self_awareness: 'Self-Awareness',
};

function formatTimer(seconds) {
  const s = Math.max(0, Number(seconds) || 0);
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatDate(isoString) {
  if (!isoString) return 'Just now';
  try {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

function getScoreBadgeClass(score) {
  if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
  if (score >= 60) return 'text-blue-700 bg-blue-50 border-blue-300';
  if (score >= 45) return 'text-amber-700 bg-amber-50 border-amber-300';
  return 'text-rose-700 bg-rose-50 border-rose-300';
}

function getDifficultyColor(diff) {
  if (diff === 'Advanced') return 'text-rose-700 bg-rose-50 border-rose-200';
  if (diff === 'Intermediate') return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-emerald-700 bg-emerald-50 border-emerald-200';
}

export default function MockInterview() {
  const { token } = useAuth();

  // Navigation view: 'setup' | 'active' | 'report' | 'history'
  const [view, setView] = useState('setup');

  // Setup form states
  const [selectedRole, setSelectedRole] = useState('Data Analyst');
  const [interviewType, setInterviewType] = useState('Mixed');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [setupContext, setSetupContext] = useState(null);
  const [providerMode, setProviderMode] = useState('heuristic_rubrics');
  const [providerModel, setProviderModel] = useState('');

  // Active session states
  const [activeInterview, setActiveInterview] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [briefAck, setBriefAck] = useState(null);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Report view states
  const [reportData, setReportData] = useState(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  // History view states
  const [historyList, setHistoryList] = useState([]);

  // Loading & error handling
  const [isLoadingSetup, setIsLoadingSetup] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // 1. Initial Load: Fetch Setup Context & Profile
  useEffect(() => {
    let isMounted = true;

    async function loadSetupData() {
      if (!token) {
        setIsLoadingSetup(false);
        return;
      }
      try {
        const [contextRes, historyRes] = await Promise.allSettled([
          api.getMockInterviewContext(token),
          api.getMockInterviewHistory(token),
        ]);

        if (!isMounted) return;

        if (contextRes.status === 'fulfilled' && contextRes.value) {
          const ctx = contextRes.value;
          setSetupContext(ctx);
          if (ctx.default_target_role) {
            setSelectedRole(ctx.default_target_role);
          }
          if (ctx.provider_mode) {
            setProviderMode(ctx.provider_mode);
          }
          if (ctx.provider_model) {
            setProviderModel(ctx.provider_model);
          }
        }

        if (historyRes.status === 'fulfilled' && Array.isArray(historyRes.value)) {
          setHistoryList(historyRes.value);
        }
      } catch (err) {
        console.error('Failed to load mock interview setup context:', err);
      } finally {
        if (isMounted) setIsLoadingSetup(false);
      }
    }

    loadSetupData();
    return () => {
      isMounted = false;
    };
  }, [token]);

  // 2. Active Session Timer
  useEffect(() => {
    if (view !== 'active') return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [view]);

  // Refresh history helper
  const refreshHistory = useCallback(async () => {
    if (!token) return;
    setIsLoadingHistory(true);
    try {
      const data = await api.getMockInterviewHistory(token);
      setHistoryList(data || []);
    } catch (err) {
      console.error('Failed to refresh history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [token]);

  // Start interview handler
  const handleStartInterview = async () => {
    if (!token) return;
    setIsStarting(true);
    setErrorMessage(null);
    try {
      const payload = {
        target_role: selectedRole,
        interview_type: interviewType,
        difficulty: difficulty,
        total_questions: totalQuestions,
      };

      const res = await api.startMockInterview(payload, token);
      const q1 = res.current_question || res.first_question;
      setActiveInterview(res);
      setActiveQuestion(q1);
      setAnswerText('');
      setElapsedSeconds(0);
      setBriefAck(null);
      setAdaptiveDifficulty(q1?.difficulty || difficulty);
      setAnsweredCount(0);
      setView('active');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to start mock interview.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleCompleteInterview = useCallback(
    async (endedEarlyFlag = false, targetId = null) => {
      const idToFinish = targetId || activeInterview?.interview_id || activeInterview?.id;
      if (!idToFinish) return;
      setIsCompleting(true);
      setErrorMessage(null);
      try {
        const report = await api.completeMockInterview(
          idToFinish,
          {
            elapsed_seconds: elapsedSeconds,
            ended_early: endedEarlyFlag,
          },
          token
        );
        setReportData(report);
        setExpandedQuestionId(report.questions?.[0]?.id || null);
        setShowEndConfirm(false);
        setView('report');
        refreshHistory();
      } catch (err) {
        setErrorMessage(err.message || 'Failed to complete interview and generate report.');
      } finally {
        setIsCompleting(false);
      }
    },
    [activeInterview, elapsedSeconds, token, refreshHistory]
  );

  const handleSubmitAnswer = async () => {
    const clean = answerText.trim();
    if (!clean || !activeInterview || !activeQuestion || isSubmitting) return;

    const interviewId = activeInterview.interview_id || activeInterview.id;
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await api.submitMockInterviewAnswer(
        interviewId,
        {
          question_id: activeQuestion.id,
          answer: clean,
          elapsed_seconds: elapsedSeconds,
        },
        token
      );

      setAnsweredCount(res.answered_questions);
      setAdaptiveDifficulty(res.adaptive_difficulty);
      setBriefAck(res.brief_acknowledgement);
      setAnswerText('');

      if (res.is_last_question_completed || !res.next_question) {
        await handleCompleteInterview(false, interviewId);
      } else {
        setActiveQuestion(res.next_question);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit answer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewReport = async (interviewId) => {
    setErrorMessage(null);
    setIsCompleting(true);
    try {
      const report = await api.getMockInterviewReport(interviewId, token);
      setReportData(report);
      setExpandedQuestionId(report.questions?.[0]?.id || null);
      setView('report');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load interview report.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleResumeInterview = async (interviewId) => {
    setErrorMessage(null);
    setIsStarting(true);
    try {
      const detail = await api.getMockInterviewDetail(interviewId, token);
      if (!detail || detail.status !== 'in_progress') {
        await handleViewReport(interviewId);
        return;
      }
      const nextUnanswered = (detail.questions || []).find((q) => !q.student_answer);
      if (!nextUnanswered) {
        await handleCompleteInterview(false, detail.id);
        return;
      }
      setActiveInterview({
        interview_id: detail.id,
        target_role: detail.target_role,
        interview_type: detail.interview_type,
        difficulty: detail.difficulty,
        total_questions: detail.total_questions,
        interviewer_intro: detail.interviewer_intro,
        provider_used: detail.ai_provider_used,
      });
      setActiveQuestion(nextUnanswered);
      setElapsedSeconds(detail.duration_seconds || 0);
      setAnswerText('');
      setAnsweredCount(detail.answered_questions || 0);
      setAdaptiveDifficulty(nextUnanswered.difficulty);
      setView('active');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resume mock interview.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleDeleteInterview = async (e, interviewId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this mock interview session and its evaluation report?')) return;
    try {
      await api.deleteMockInterview(interviewId, token);
      refreshHistory();
      if (reportData?.interview_id === interviewId || reportData?.id === interviewId) {
        setReportData(null);
        setView('setup');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete interview record.');
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  const estDuration =
    QUESTION_COUNTS.find((q) => q.count === totalQuestions)?.duration || 20;

  return (
    <div id="page-mock-interview" className="page" style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 60 }}>
      {/* ── Page Header ──────────────────────────────────────────────── */}
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
              <Mic style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <h1 className="page-heading" style={{ margin: 0 }}>
                AI Mock Interview Studio
              </h1>
              <p className="page-subtitle" style={{ margin: 0, marginTop: 4 }}>
                Adaptive, role-specific interview simulations grounded in your resume, readiness score, and skill gaps.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div
            style={{
              fontSize: '0.8rem',
              padding: '6px 12px',
              borderRadius: 10,
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border)',
              color: 'var(--text, #334155)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Sparkles style={{ width: 14, height: 14, color: 'var(--emerald, #10b981)' }} />
            <span>
              {providerMode === 'external_llm'
                ? `Gemini Active (${providerModel})`
                : 'Deterministic Rubric Engine'}
            </span>
          </div>

          {view !== 'active' && (
            <>
              <button
                onClick={() => {
                  setErrorMessage(null);
                  setView('setup');
                }}
                className={view === 'setup' ? 'btn btn--primary' : 'btn btn--outline'}
                style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Play style={{ width: 14, height: 14 }} />
                <span>New Session</span>
              </button>

              <button
                onClick={() => {
                  setErrorMessage(null);
                  setView('history');
                  refreshHistory();
                }}
                className={view === 'history' ? 'btn btn--primary' : 'btn btn--outline'}
                style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <History style={{ width: 14, height: 14 }} />
                <span>History ({historyList.length})</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Error Banner ─────────────────────────────────────────────── */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: 20,
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
          <AlertCircle style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2, color: '#e11d48' }} />
          <div style={{ flex: 1 }}>{errorMessage}</div>
          <button
            onClick={() => setErrorMessage(null)}
            style={{ background: 'none', border: 'none', color: '#e11d48', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* ── VIEW A: INTERVIEW SETUP ──────────────────────────────────── */}
      {view === 'setup' && (
        isLoadingSetup ? (
          <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
            <Loading message="Loading your personalized CareerTwin interview context..." />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {/* Left Column: Configuration Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* 1. Target Role */}
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
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Target style={{ width: 16, height: 16, color: 'var(--emerald, #10b981)' }} />
                  <span>1. Target Career Role</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <select
                    id="interview-role-select"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="form-input"
                    style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 10, fontSize: '0.9rem', fontWeight: 600 }}
                  >
                    {CATEGORIZED_ROLES.map((group) => (
                      <optgroup key={group.category} label={group.category}>
                        {group.roles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {setupContext?.default_target_role === selectedRole && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '6px 12px',
                        borderRadius: 20,
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: '#059669',
                        border: '1px solid rgba(16, 185, 129, 0.28)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Saved Profile Role
                    </span>
                  )}
                </div>
              </div>

              {/* 2. Interview Type */}
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
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Layers style={{ width: 16, height: 16, color: 'var(--emerald, #10b981)' }} />
                  <span>2. Interview Type</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                  {INTERVIEW_TYPE_CARDS.map((card) => {
                    const active = interviewType === card.value;
                    return (
                      <button
                        key={card.value}
                        type="button"
                        onClick={() => setInterviewType(card.value)}
                        style={{
                          padding: 14,
                          borderRadius: 14,
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          background: active ? 'rgba(16, 185, 129, 0.08)' : '#f8fafc',
                          border: active ? '1.5px solid var(--emerald, #10b981)' : '1px solid var(--border)',
                          color: 'var(--text-strong, #0f172a)',
                        }}
                      >
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{card.label}</span>
                          {active && <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--emerald, #10b981)' }} />}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', lineHeight: 1.4, margin: 0 }}>{card.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Difficulty & Question Count */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                {/* Difficulty */}
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
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 12 }}>
                    3. Starting Difficulty
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {DIFFICULTY_LEVELS.map((lvl) => {
                      const active = difficulty === lvl.value;
                      return (
                        <button
                          key={lvl.value}
                          type="button"
                          onClick={() => setDifficulty(lvl.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 12,
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: active ? 'rgba(16, 185, 129, 0.08)' : '#f8fafc',
                            border: active ? '1.5px solid var(--emerald, #10b981)' : '1px solid var(--border)',
                            color: 'var(--text-strong, #0f172a)',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{lvl.label}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)' }}>{lvl.desc}</div>
                          </div>
                          {active && <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--emerald, #10b981)', flexShrink: 0 }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Questions & Duration */}
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
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 12 }}>
                    4. Session Length
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {QUESTION_COUNTS.map((item) => {
                      const active = totalQuestions === item.count;
                      return (
                        <button
                          key={item.count}
                          type="button"
                          onClick={() => setTotalQuestions(item.count)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 12,
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: active ? 'rgba(16, 185, 129, 0.08)' : '#f8fafc',
                            border: active ? '1.5px solid var(--emerald, #10b981)' : '1px solid var(--border)',
                            color: 'var(--text-strong, #0f172a)',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                              {item.count} Questions — {item.label}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                              <Clock style={{ width: 12, height: 12 }} />
                              <span>Estimated: ~{item.duration} minutes</span>
                            </div>
                          </div>
                          {active && <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--emerald, #10b981)', flexShrink: 0 }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Personalized Context & Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Session Summary Card */}
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
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award style={{ width: 18, height: 18, color: 'var(--emerald, #10b981)' }} />
                  <span>Interview Summary</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-muted, #64748b)' }}>Target Role</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-strong, #0f172a)' }}>{selectedRole}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-muted, #64748b)' }}>Format</span>
                    <span style={{ fontWeight: 700, color: 'var(--emerald, #10b981)' }}>{interviewType}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-muted, #64748b)' }}>Difficulty</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-strong, #0f172a)' }}>{difficulty} (Adaptive)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-muted, #64748b)' }}>Questions</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-strong, #0f172a)' }}>{totalQuestions}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted, #64748b)' }}>Est. Duration</span>
                    <span style={{ fontWeight: 700, color: 'var(--emerald, #10b981)' }}>~{estDuration} minutes</span>
                  </div>
                </div>

                <button
                  id="btn-start-interview"
                  onClick={handleStartInterview}
                  disabled={isStarting}
                  className="btn btn--primary"
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {isStarting ? (
                    <>
                      <RefreshCw style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                      <span>Preparing Interviewer...</span>
                    </>
                  ) : (
                    <>
                      <Play style={{ width: 16, height: 16 }} />
                      <span>Start Mock Interview</span>
                    </>
                  )}
                </button>
              </div>

              {/* Context Grounding Card */}
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
                <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Briefcase style={{ width: 16, height: 16, color: 'var(--emerald, #10b981)' }} />
                  <span>Personalization Sources</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted, #64748b)' }}>Verified Skills</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-strong, #0f172a)' }}>
                      {setupContext?.context_summary?.claimed_skills_count || 0} recorded
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted, #64748b)' }}>Resume Analysis</span>
                    <span style={{ fontWeight: 700, color: setupContext?.context_summary?.has_resume ? '#059669' : 'var(--text-muted, #64748b)' }}>
                      {setupContext?.context_summary?.has_resume ? 'Connected' : 'Pending'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted, #64748b)' }}>Career Readiness</span>
                    <span style={{ fontWeight: 700, color: setupContext?.context_summary?.has_readiness ? '#059669' : 'var(--text-muted, #64748b)' }}>
                      {setupContext?.context_summary?.readiness_score != null
                        ? `${Math.round(setupContext.context_summary.readiness_score)}%`
                        : 'Pending'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted, #64748b)' }}>ATS Resume Score</span>
                    <span style={{ fontWeight: 700, color: setupContext?.context_summary?.has_ats ? '#059669' : 'var(--text-muted, #64748b)' }}>
                      {setupContext?.context_summary?.ats_score != null
                        ? `${Math.round(setupContext.context_summary.ats_score)}/100`
                        : 'Pending'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted, #64748b)' }}>GitHub Portfolio</span>
                    <span style={{ fontWeight: 700, color: setupContext?.context_summary?.has_github ? '#059669' : 'var(--text-muted, #64748b)' }}>
                      {setupContext?.context_summary?.has_github
                        ? `${setupContext.context_summary.github_repos_count} repos`
                        : 'Pending'}
                    </span>
                  </div>
                </div>
                {setupContext?.context_summary?.missing_skills?.length > 0 && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', display: 'block', marginBottom: 8 }}>
                      Detected Skill Gaps to Probe Gently:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(setupContext?.context_summary?.missing_skills || []).map((s) => (
                        <span
                          key={s}
                          style={{
                            fontSize: '0.7rem',
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            color: '#d97706',
                            fontWeight: 600,
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      )}

      {/* ── VIEW B: ACTIVE INTERVIEW SESSION ─────────────────────────── */}
      {view === 'active' && activeInterview && activeQuestion && (
        <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Status & Progress Bar */}
          <div
            className="card"
            style={{
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                <span style={{ fontWeight: 800, color: 'var(--text-strong, #0f172a)' }}>
                  Question {activeQuestion.question_order} of {activeInterview.total_questions}
                </span>
                <span style={{ color: 'var(--emerald, #10b981)', fontWeight: 700 }}>
                  {activeInterview.target_role} • {activeInterview.interview_type}
                </span>
              </div>
              <div style={{ width: '100%', height: 6, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: 'var(--grad-emerald)',
                    borderRadius: 999,
                    transition: 'width 0.3s ease',
                    width: `${Math.round(((activeQuestion.question_order - 1) / activeInterview.total_questions) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  padding: '6px 12px',
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  color: 'var(--text-strong, #0f172a)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Clock style={{ width: 14, height: 14, color: 'var(--emerald, #10b981)' }} />
                <span>{formatTimer(elapsedSeconds)}</span>
              </div>

              <button
                id="btn-end-interview"
                type="button"
                onClick={() => setShowEndConfirm(true)}
                disabled={isSubmitting || isCompleting}
                style={{
                  padding: '6px 14px',
                  borderRadius: 10,
                  background: 'rgba(244, 63, 94, 0.08)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  color: '#e11d48',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <StopCircle style={{ width: 14, height: 14 }} />
                <span>End Interview</span>
              </button>
            </div>
          </div>

          {/* Interviewer Intro on Question 1 */}
          {activeQuestion.question_order === 1 && activeInterview.interviewer_intro && (
            <div
              style={{
                padding: 16,
                borderRadius: 14,
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontSize: '0.9rem',
                color: '#059669',
                lineHeight: 1.5,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <Sparkles style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2, color: '#059669' }} />
              <span>{activeInterview.interviewer_intro}</span>
            </div>
          )}

          {/* Brief Interviewer Acknowledgement from Previous Answer (Non-Spoiling) */}
          {briefAck && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: 14,
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontSize: '0.85rem',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <CheckCircle2 style={{ width: 16, height: 16, flexShrink: 0, color: '#059669' }} />
              <span>{briefAck}</span>
            </motion.div>
          )}

          {/* Active Question Card */}
          <motion.div
            key={activeQuestion.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
            style={{
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: 24,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '3px 10px',
                  borderRadius: 8,
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  color: '#059669',
                }}
              >
                {activeQuestion.category}
              </span>
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${getDifficultyColor(
                  adaptiveDifficulty || activeQuestion.difficulty
                )}`}
              >
                {adaptiveDifficulty || activeQuestion.difficulty} Difficulty
              </span>
              {activeQuestion.topic && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', padding: '3px 8px', borderRadius: 8, background: '#f8fafc', border: '1px solid var(--border)' }}>
                  Topic: {activeQuestion.topic}
                </span>
              )}
            </div>

            <h2
              id="active-question-text"
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-strong, #0f172a)',
                lineHeight: 1.5,
                marginBottom: 20,
              }}
            >
              {activeQuestion.question_text}
            </h2>

            {/* Answer Textarea */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <textarea
                id="interview-answer-input"
                rows={6}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={4000}
                disabled={isSubmitting || isCompleting}
                placeholder="Type your interview answer clearly... For behavioral questions, use Situation, Task, Action, and Result (STAR)."
                className="form-input"
                style={{
                  width: '100%',
                  borderRadius: 14,
                  padding: 16,
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  resize: 'vertical',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{answerText.length} / 4000 chars</span>
                  <span>•</span>
                  <span>Ctrl + Enter to submit</span>
                </div>

                <button
                  id="btn-submit-answer"
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={!answerText.trim() || isSubmitting || isCompleting}
                  className="btn btn--primary"
                  style={{
                    padding: '10px 24px',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {isSubmitting || isCompleting ? (
                    <>
                      <RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                      <span>
                        {answeredCount + 1 >= activeInterview.total_questions
                          ? 'Generating Final Report...'
                          : 'Evaluating & Adapting Next Question...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Send style={{ width: 14, height: 14 }} />
                      <span>
                        {activeQuestion.question_order >= activeInterview.total_questions
                          ? 'Submit & Finish Interview'
                          : 'Submit Answer'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* End Interview Confirmation Modal */}
          {showEndConfirm && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
              <div
                className="card"
                style={{
                  maxWidth: 440,
                  width: '100%',
                  padding: 24,
                  borderRadius: 20,
                  background: 'var(--bg-card, #ffffff)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ padding: 10, borderRadius: 12, background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', flexShrink: 0 }}>
                    <AlertTriangle style={{ width: 20, height: 20 }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', margin: 0 }}>End Incomplete Interview?</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)', marginTop: 4, lineHeight: 1.5 }}>
                      You have answered {answeredCount} of {activeInterview.total_questions} questions.
                      Ending now will mark the session as ended early and generate your report for answered questions.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowEndConfirm(false)}
                    className="btn btn--outline"
                    style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: 10 }}
                  >
                    Continue Interview
                  </button>
                  <button
                    id="btn-confirm-end-interview"
                    type="button"
                    onClick={() => handleCompleteInterview(true)}
                    disabled={isCompleting}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 10,
                      background: '#e11d48',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isCompleting ? 'Finalizing...' : 'End & View Report'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── VIEW C: FINAL INTERVIEW EVALUATION REPORT ────────────────── */}
      {view === 'report' && reportData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Deterministic Fallback Notice if Applicable */}
          {reportData.fallback_used && (
            <div
              style={{
                padding: 14,
                borderRadius: 12,
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                color: '#d97706',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <ShieldAlert style={{ width: 16, height: 16, flexShrink: 0, color: '#d97706' }} />
              <span>
                Evaluated using CareerTwin deterministic rubric fallback ({reportData.ai_provider_used}).
              </span>
            </div>
          )}

          {/* Hero Score Summary Card */}
          <div
            className="card"
            style={{
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: 24,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                borderRadius: 16,
                background: '#f8fafc',
                border: '1px solid var(--border)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted, #64748b)', marginBottom: 8 }}>
                Overall Interview Score
              </span>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--emerald, #10b981)', lineHeight: 1, marginBottom: 8 }}>
                {Math.round(reportData.overall_score)}
                <span style={{ fontSize: '1.25rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>/100</span>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${getScoreBadgeClass(
                  reportData.overall_score
                )}`}
              >
                {reportData.performance_grade}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', margin: 0 }}>
                    {reportData.target_role} — {reportData.interview_type} Report
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', margin: '4px 0 0 0' }}>
                    Difficulty: {reportData.difficulty} • Questions Answered: {reportData.answered_questions}/{reportData.total_questions} • Duration: {formatTimer(reportData.duration_seconds)}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => setView('setup')}
                    className="btn btn--primary"
                    style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <RotateCcw style={{ width: 14, height: 14 }} />
                    <span>Retake Interview</span>
                  </button>
                  <button
                    onClick={() => {
                      refreshHistory();
                      setView('history');
                    }}
                    className="btn btn--outline"
                    style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <History style={{ width: 14, height: 14 }} />
                    <span>History</span>
                  </button>
                </div>
              </div>

              <div
                style={{
                  padding: 16,
                  borderRadius: 14,
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                  fontSize: '0.9rem',
                  color: 'var(--text, #334155)',
                  lineHeight: 1.6,
                }}
              >
                {reportData.executive_summary}
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontStyle: 'italic', margin: 0 }}>{reportData.disclaimer}</p>
            </div>
          </div>

          {/* Rubric Category Averages */}
          {Object.keys(reportData.category_scores || {}).length > 0 && (
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
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 style={{ width: 18, height: 18, color: 'var(--emerald, #10b981)' }} />
                <span>Rubric Competency Breakdown</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                {Object.entries(reportData.category_scores).map(([key, val]) => (
                  <div key={key} style={{ padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: 4 }}>
                      {RUBRIC_LABELS[key] || key.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', marginBottom: 8 }}>
                      {val.average_score}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>/{val.max_score}</span>
                    </div>
                    <div style={{ width: '100%', height: 6, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          background: 'var(--grad-emerald)',
                          borderRadius: 999,
                          width: `${Math.min(100, val.percentage || 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths, Weaknesses, Improvements & Skills to Practise */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            <div
              className="card"
              style={{
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: 20,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#059669', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 style={{ width: 16, height: 16 }} />
                <span>Key Strengths</span>
              </h3>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.85rem', color: 'var(--text, #334155)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(reportData.strengths || []).map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div
              className="card"
              style={{
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: 20,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#d97706', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle style={{ width: 16, height: 16 }} />
                <span>Areas Missing / Weaknesses</span>
              </h3>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.85rem', color: 'var(--text, #334155)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(reportData.weaknesses || []).map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>

            <div
              className="card"
              style={{
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: 20,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2563eb', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp style={{ width: 16, height: 16 }} />
                <span>Suggested Improvements</span>
              </h3>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.85rem', color: 'var(--text, #334155)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(reportData.suggested_improvements || []).map((imp, idx) => (
                  <li key={idx}>{imp}</li>
                ))}
              </ul>
            </div>

            <div
              className="card"
              style={{
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: 20,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--emerald, #10b981)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen style={{ width: 16, height: 16 }} />
                <span>Recommended Concepts & Skills to Practise</span>
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(reportData.recommended_skills_to_practise || []).map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 8,
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      color: '#059669',
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Question-by-Question Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText style={{ width: 18, height: 18, color: 'var(--emerald, #10b981)' }} />
              <span>Question-by-Question Detailed Evaluation</span>
            </h3>

            {(reportData.questions || []).map((q) => {
              const isExpanded = expandedQuestionId === q.id;
              const ev = q.evaluation_json || {};
              return (
                <div
                  key={q.id}
                  className="card"
                  style={{
                    background: 'var(--bg-card, #ffffff)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    style={{
                      width: '100%',
                      padding: 16,
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--emerald, #10b981)' }}>
                          Q{q.question_order}
                        </span>
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 6, background: '#f8fafc', border: '1px solid var(--border)', color: 'var(--text-muted, #64748b)' }}>
                          {q.category}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded border ${getDifficultyColor(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                        {q.topic && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)' }}>{q.topic}</span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-strong, #0f172a)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {q.question_text}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                          q.score != null
                            ? getScoreBadgeClass(q.score)
                            : 'text-slate-400 bg-slate-50 border-slate-200'
                        }`}
                      >
                        {q.score != null ? `${q.score}/100` : 'Unanswered'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp style={{ width: 16, height: 16, color: 'var(--text-muted, #64748b)' }} />
                      ) : (
                        <ChevronDown style={{ width: 16, height: 16, color: 'var(--text-muted, #64748b)' }} />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 16, fontSize: '0.85rem' }}>
                      <div style={{ marginTop: 12 }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>
                          Full Question
                        </span>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-strong, #0f172a)', lineHeight: 1.5, margin: 0 }}>{q.question_text}</p>
                      </div>

                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>
                          Your Submitted Answer
                        </span>
                        <div style={{ padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid var(--border)', color: 'var(--text, #334155)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                          {q.student_answer || 'No answer submitted before ending interview.'}
                        </div>
                      </div>

                      {ev.category_scores && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {Object.entries(ev.category_scores).map(([ckey, cval]) => (
                            <span
                              key={ckey}
                              style={{ padding: '4px 10px', borderRadius: 8, background: '#f8fafc', border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text, #334155)' }}
                            >
                              {RUBRIC_LABELS[ckey] || ckey}:{' '}
                              <strong style={{ color: 'var(--emerald, #10b981)' }}>
                                {cval.score}/{cval.max}
                              </strong>
                            </span>
                          ))}
                        </div>
                      )}

                      {ev.star_assessment && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ color: 'var(--text-muted, #64748b)', fontWeight: 700, fontSize: '0.75rem' }}>STAR Check:</span>
                          {Object.entries(ev.star_assessment).map(([k, ok]) => (
                            <span
                              key={k}
                              style={{
                                padding: '2px 8px',
                                borderRadius: 6,
                                textTransform: 'capitalize',
                                fontSize: '0.75rem',
                                border: `1px solid ${ok ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'}`,
                                background: ok ? 'rgba(16, 185, 129, 0.1)' : '#f8fafc',
                                color: ok ? '#059669' : 'var(--text-muted, #64748b)',
                              }}
                            >
                              {k}: {ok ? 'Present' : 'Missing'}
                            </span>
                          ))}
                        </div>
                      )}

                      {q.student_answer && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                          <div style={{ padding: 12, borderRadius: 12, background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <span style={{ fontWeight: 800, color: '#059669', display: 'block', marginBottom: 4 }}>What Did Well</span>
                            <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--text, #334155)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {(ev.what_did_well || []).map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>

                          <div style={{ padding: 12, borderRadius: 12, background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                            <span style={{ fontWeight: 800, color: '#d97706', display: 'block', marginBottom: 4 }}>Missing / Improve</span>
                            <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--text, #334155)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {[...(ev.what_was_missing || []), ...(ev.improvements || [])].map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {ev.suggested_stronger_answer && (
                        <div style={{ padding: 14, borderRadius: 12, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          <span style={{ fontWeight: 800, color: '#059669', display: 'block', marginBottom: 4 }}>
                            Suggested Illustrative Sample Answer
                          </span>
                          <p style={{ color: 'var(--text, #334155)', lineHeight: 1.6, margin: 0 }}>{ev.suggested_stronger_answer}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── VIEW D: INTERVIEW HISTORY ────────────────────────────────── */}
      {view === 'history' && (
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <History style={{ width: 18, height: 18, color: 'var(--emerald, #10b981)' }} />
              <span>Past Mock Interview Sessions</span>
            </h2>
            <button
              onClick={() => setView('setup')}
              className="btn btn--primary"
              style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Play style={{ width: 14, height: 14 }} />
              <span>New Session</span>
            </button>
          </div>

          {isLoadingHistory ? (
            <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
              <Loading message="Loading interview history..." />
            </div>
          ) : historyList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted, #64748b)', fontSize: '0.9rem' }}>
              <Mic style={{ width: 40, height: 40, color: 'var(--border)', margin: '0 auto 12px auto' }} />
              <p style={{ margin: 0 }}>You haven't started any mock interviews yet.</p>
              <button
                onClick={() => setView('setup')}
                style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--emerald, #10b981)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Configure your first AI interview →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {historyList.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    background: '#f8fafc',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, color: 'var(--text-strong, #0f172a)', fontSize: '0.95rem' }}>{item.target_role}</span>
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 6, background: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.25)', fontWeight: 600 }}>
                        {item.interview_type}
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded border ${getDifficultyColor(item.difficulty)}`}>
                        {item.difficulty}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: 6,
                          fontWeight: 600,
                          background: item.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : item.status === 'in_progress' ? 'rgba(245, 158, 11, 0.1)' : '#f1f5f9',
                          color: item.status === 'completed' ? '#059669' : item.status === 'in_progress' ? '#d97706' : 'var(--text-muted, #64748b)',
                        }}
                      >
                        {item.status === 'completed'
                          ? 'Completed'
                          : item.status === 'in_progress'
                            ? 'In Progress'
                            : 'Ended Early'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>
                      {formatDate(item.created_at)} • Answered {item.answered_questions}/{item.total_questions} questions • {formatTimer(item.duration_seconds)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {item.overall_score != null && (
                      <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${getScoreBadgeClass(item.overall_score)}`}>
                        {Math.round(item.overall_score)}/100
                      </span>
                    )}

                    {item.status === 'in_progress' ? (
                      <button
                        onClick={() => handleResumeInterview(item.id)}
                        className="btn btn--primary"
                        style={{ fontSize: '0.8rem', padding: '6px 14px', borderRadius: 8 }}
                      >
                        Resume
                      </button>
                    ) : (
                      <button
                        onClick={() => handleViewReport(item.id)}
                        className="btn btn--outline"
                        style={{ fontSize: '0.8rem', padding: '6px 14px', borderRadius: 8 }}
                      >
                        View Report
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDeleteInterview(e, item.id)}
                      style={{
                        padding: 8,
                        borderRadius: 8,
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--text-muted, #64748b)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Delete session"
                    >
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
