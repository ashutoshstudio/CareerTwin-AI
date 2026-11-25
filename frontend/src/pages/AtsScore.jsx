import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Target,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';
import { CATEGORIZED_ROLES } from '../data/careerPaths';

function getGradeStyle(grade) {
  if (grade?.includes('Strong')) {
    return {
      bg: 'rgba(16, 185, 129, 0.1)',
      text: '#059669',
      border: 'rgba(16, 185, 129, 0.3)',
      bar: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    };
  }
  if (grade?.includes('Good')) {
    return {
      bg: 'rgba(59, 130, 246, 0.1)',
      text: '#2563eb',
      border: 'rgba(59, 130, 246, 0.3)',
      bar: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    };
  }
  if (grade?.includes('Moderate')) {
    return {
      bg: 'rgba(245, 158, 11, 0.1)',
      text: '#d97706',
      border: 'rgba(245, 158, 11, 0.3)',
      bar: 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)',
    };
  }
  return {
    bg: 'rgba(244, 63, 94, 0.1)',
    text: '#e11d48',
    border: 'rgba(244, 63, 94, 0.3)',
    bar: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
  };
}

function AtsScore() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(() => Boolean(token));
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedRole, setSelectedRole] = useState('Data Analyst');
  const [errorMsg, setErrorMsg] = useState(null);
  const [inputTab, setInputTab] = useState('upload'); // 'upload' | 'text' | 'latest'
  const [rawText, setRawText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [expandedRecIndex, setExpandedRecIndex] = useState(0);

  // Initial load: Fetch latest evaluation and history
  useEffect(() => {
    let ignore = false;
    if (!token) return;

    async function loadData() {
      try {
        setErrorMsg(null);
        const [latestRes, histRes] = await Promise.all([
          api.getLatestAtsScore(token).catch(() => null),
          api.getAtsHistory(token).catch(() => []),
        ]);

        if (!ignore) {
          if (latestRes) {
            setEvaluation(latestRes);
            if (latestRes.target_role) setSelectedRole(latestRes.target_role);
          }
          if (Array.isArray(histRes)) setHistory(histRes);
        }
      } catch (err) {
        if (!ignore) {
          setErrorMsg(err.message || 'Unable to retrieve previous ATS evaluation.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [token]);

  // Handle file upload scoring
  const handleScoreFile = useCallback(
    async (fileToScore) => {
      const file = fileToScore || selectedFile;
      if (!token || !file) return;

      try {
        setEvaluating(true);
        setErrorMsg(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('target_role', selectedRole);

        const result = await api.scoreResumeFile(formData, token);
        setEvaluation(result);
        setHistory((prev) => [
          {
            id: result.id,
            filename: result.filename,
            target_role: result.target_role,
            overall_score: result.overall_score,
            grade: result.grade,
            created_at: result.created_at,
          },
          ...prev,
        ]);
      } catch (err) {
        setErrorMsg(err.message || 'Failed to score uploaded resume.');
      } finally {
        setEvaluating(false);
      }
    },
    [token, selectedFile, selectedRole]
  );

  // Handle raw text scoring
  const handleScoreText = useCallback(async () => {
    if (!token || !rawText.trim()) return;

    try {
      setEvaluating(true);
      setErrorMsg(null);

      const result = await api.scoreResumeText(
        {
          resume_text: rawText,
          target_role: selectedRole,
          filename: 'custom_text_resume.txt',
        },
        token
      );
      setEvaluation(result);
      setHistory((prev) => [
        {
          id: result.id,
          filename: result.filename,
          target_role: result.target_role,
          overall_score: result.overall_score,
          grade: result.grade,
          created_at: result.created_at,
        },
        ...prev,
      ]);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to score submitted resume text.');
    } finally {
      setEvaluating(false);
    }
  }, [token, rawText, selectedRole]);

  // Handle scoring latest resume from profile
  const handleScoreLatest = useCallback(
    async (roleToScore) => {
      if (!token) return;
      const role = roleToScore || selectedRole;

      try {
        setEvaluating(true);
        setErrorMsg(null);

        const result = await api.scoreLatestResume(role, token);
        setEvaluation(result);
        setHistory((prev) => [
          {
            id: result.id,
            filename: result.filename,
            target_role: result.target_role,
            overall_score: result.overall_score,
            grade: result.grade,
            created_at: result.created_at,
          },
          ...prev,
        ]);
      } catch (err) {
        setErrorMsg(err.message || 'Failed to evaluate your latest resume.');
      } finally {
        setEvaluating(false);
      }
    },
    [token, selectedRole]
  );

  // File drop handler
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      handleScoreFile(file);
    }
  };

  const gradeStyle = getGradeStyle(evaluation?.grade);
  const scoreVal = evaluation ? Math.round(evaluation.overall_score) : 0;

  if (loading) {
    return (
      <div id="page-ats-score" className="page" style={{ maxWidth: 1040, margin: '0 auto', padding: '60px 0', textAlign: 'center' }}>
        <Loading message="Loading ATS scoring engine and candidate evaluations..." />
      </div>
    );
  }

  return (
    <div id="page-ats-score" className="page" style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header Banner */}
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
              <Target style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <h1 className="page-heading" style={{ margin: 0 }}>
                ATS Resume Compatibility Scorer
              </h1>
              <p className="page-subtitle" style={{ margin: 0, marginTop: 4 }}>
                Evaluate your resume against explainable Applicant Tracking System heuristics — keyword density, section taxonomy, quantifiable achievements, and active phrasing.
              </p>
            </div>
          </div>
        </div>

        {/* Role Selector Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card, #ffffff)', border: '1px solid var(--border)', borderRadius: 12, padding: '6px 12px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>
            Target Benchmark:
          </span>
          <select
            value={selectedRole}
            onChange={(e) => {
              const newRole = e.target.value;
              setSelectedRole(newRole);
              if (evaluation) {
                handleScoreLatest(newRole);
              }
            }}
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

      {/* Dismissible Error Banner */}
      {errorMsg && (
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
          <AlertTriangle style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2, color: '#e11d48' }} />
          <div style={{ flex: 1 }}>{errorMsg}</div>
          <button
            onClick={() => setErrorMsg(null)}
            style={{ background: 'none', border: 'none', color: '#e11d48', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Submission Card (Upload or Paste Text) */}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 14, marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: 4 }}>
              Method:
            </span>
            <button
              onClick={() => setInputTab('upload')}
              style={{
                padding: '6px 14px',
                borderRadius: 10,
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: inputTab === 'upload' ? 'rgba(16, 185, 129, 0.12)' : '#f8fafc',
                color: inputTab === 'upload' ? '#059669' : 'var(--text-muted, #64748b)',
                border: inputTab === 'upload' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border)',
              }}
            >
              Upload PDF / DOCX
            </button>
            <button
              onClick={() => setInputTab('latest')}
              style={{
                padding: '6px 14px',
                borderRadius: 10,
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: inputTab === 'latest' ? 'rgba(16, 185, 129, 0.12)' : '#f8fafc',
                color: inputTab === 'latest' ? '#059669' : 'var(--text-muted, #64748b)',
                border: inputTab === 'latest' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border)',
              }}
            >
              Use Latest Resume
            </button>
            <button
              onClick={() => setInputTab('text')}
              style={{
                padding: '6px 14px',
                borderRadius: 10,
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: inputTab === 'text' ? 'rgba(16, 185, 129, 0.12)' : '#f8fafc',
                color: inputTab === 'text' ? '#059669' : 'var(--text-muted, #64748b)',
                border: inputTab === 'text' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border)',
              }}
            >
              Paste Resume Text
            </button>
          </div>
        </div>

        {/* Tab 1: File Upload */}
        {inputTab === 'upload' && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            style={{
              border: '2px dashed var(--border)',
              borderRadius: 16,
              padding: '36px 20px',
              textAlign: 'center',
              background: '#f8fafc',
              transition: 'all 0.15s ease',
            }}
          >
            <UploadCloud style={{ width: 44, height: 44, color: 'var(--emerald, #10b981)', margin: '0 auto 12px auto' }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-strong, #0f172a)', marginBottom: 4 }}>
              Drag & Drop your resume file here, or{' '}
              <label style={{ color: 'var(--emerald, #10b981)', cursor: 'pointer', textDecoration: 'underline' }}>
                Browse Files
                <input
                  type="file"
                  accept=".pdf,.docx"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setSelectedFile(file);
                      handleScoreFile(file);
                    }
                  }}
                />
              </label>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', margin: 0 }}>
              Supported formats: PDF (.pdf), Word (.docx) &bull; Max size: 5 MB
            </p>
            {selectedFile && (
              <div
                style={{
                  marginTop: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#059669',
                  padding: '4px 12px',
                  borderRadius: 20,
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.28)',
                }}
              >
                <FileText style={{ width: 14, height: 14 }} />
                <span>Selected: {selectedFile.name}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Use Latest Uploaded Resume */}
        {inputTab === 'latest' && (
          <div style={{ padding: 28, borderRadius: 16, background: '#f8fafc', border: '1px solid var(--border)', textAlign: 'center' }}>
            <Sparkles style={{ width: 36, height: 36, color: 'var(--emerald, #10b981)', margin: '0 auto 10px auto' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', margin: '0 0 6px 0' }}>Evaluate Stored Resume Profile</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)', maxWidth: 460, margin: '0 auto 16px auto', lineHeight: 1.5 }}>
              Instantly run the 100-point ATS evaluation against your previously uploaded resume or verified profile skills for {selectedRole}.
            </p>
            <button
              onClick={() => handleScoreLatest(selectedRole)}
              disabled={evaluating}
              className="btn btn--primary"
              style={{ padding: '10px 22px', borderRadius: 12, fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <RefreshCw style={{ width: 14, height: 14, animation: evaluating ? 'spin 1s linear infinite' : 'none' }} />
              <span>{evaluating ? 'Analyzing Resume...' : `Score Resume against ${selectedRole}`}</span>
            </button>
          </div>
        )}

        {/* Tab 3: Paste Raw Text */}
        {inputTab === 'text' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste your raw resume text here (Summary, Skills, Experience, Education)..."
              className="form-input"
              style={{ width: '100%', borderRadius: 12, padding: 14, fontSize: '0.85rem', lineHeight: 1.5 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleScoreText}
                disabled={evaluating || !rawText.trim()}
                className="btn btn--primary"
                style={{ padding: '10px 22px', borderRadius: 12, fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                {evaluating ? 'Analyzing...' : 'Evaluate Pasted Text'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Evaluating Skeleton Spinner */}
      {evaluating && (
        <div style={{ marginBottom: 24, padding: 48, borderRadius: 20, background: 'var(--bg-card, #ffffff)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <Loading message={`Benchmarking resume keywords, sections, and metrics against ${selectedRole}...`} />
        </div>
      )}

      {/* Evaluation Results Dashboard */}
      {evaluation && !evaluating && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* Top Score Banner Card */}
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
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
              {/* Left Score Gauge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 20,
                    background: '#f8fafc',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--emerald, #10b981)', lineHeight: 1 }}>{scoreVal}</div>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginTop: 2 }}>out of 100</div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: gradeStyle.bg,
                        color: gradeStyle.text,
                        border: `1px solid ${gradeStyle.border}`,
                      }}
                    >
                      {evaluation.grade}
                    </span>
                    <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.8rem' }}>•</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>{evaluation.target_role}</span>
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', margin: 0 }}>
                    {scoreVal >= 70 ? 'Resume Is Well-Optimized' : 'Optimization Opportunities Detected'}
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                    Parsed from <strong style={{ color: 'var(--text-strong, #0f172a)' }}>{evaluation.filename}</strong> &bull; {evaluation.word_count} words analyzed &bull; {evaluation.quantifiable_metrics_count} measurable achievements detected.
                  </p>
                </div>
              </div>

              {/* Disclaimer Pill */}
              <div
                style={{
                  maxWidth: 280,
                  fontSize: '0.75rem',
                  color: 'var(--text-muted, #64748b)',
                  background: '#f8fafc',
                  padding: 12,
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  lineHeight: 1.4,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--text-strong, #0f172a)', marginBottom: 4 }}>
                  <Info style={{ width: 14, height: 14, color: 'var(--emerald, #10b981)' }} />
                  <span>Heuristic Evaluation Note</span>
                </div>
                Transparent heuristic benchmark based on keyword frequency, section taxonomy, and metrics. Independent analytical scoring.
              </div>
            </div>
          </div>

          {/* 5-Category Breakdown Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Keyword Matching', score: evaluation.category_scores.keyword_matching, max: 30 },
              { label: 'Section Completeness', score: evaluation.category_scores.section_completeness, max: 20 },
              { label: 'Experience & Projects', score: evaluation.category_scores.experience_relevance, max: 20 },
              { label: 'Quantifiable Metrics', score: evaluation.category_scores.quantifiable_achievements, max: 15 },
              { label: 'Formatting & Readability', score: evaluation.category_scores.formatting_readability, max: 15 },
            ].map((cat, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  background: 'var(--bg-card, #ffffff)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: 16,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                    {cat.label}
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)' }}>
                    {cat.score.toFixed(1)}{' '}
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>/ {cat.max}</span>
                  </div>
                </div>
                <div style={{ width: '100%', background: '#e2e8f0', height: 6, borderRadius: 999, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      background: 'var(--grad-emerald)',
                      borderRadius: 999,
                      width: `${(cat.score / cat.max) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Breakdown: Sections & Keywords */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
            {/* Detected vs Missing Sections */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 800, color: 'var(--text-strong, #0f172a)', fontSize: '0.95rem' }}>
                <Layers style={{ width: 18, height: 18, color: 'var(--emerald, #10b981)' }} />
                <span>Resume Section Structure</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Contact Information', 'Summary / Objective', 'Technical Skills', 'Experience / Projects', 'Education'].map((sec) => {
                  const isPresent = evaluation.detected_sections.includes(sec);
                  return (
                    <div
                      key={sec}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 12,
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        background: isPresent ? 'rgba(16, 185, 129, 0.06)' : 'rgba(244, 63, 94, 0.06)',
                        border: `1px solid ${isPresent ? 'rgba(16, 185, 129, 0.22)' : 'rgba(244, 63, 94, 0.22)'}`,
                        color: 'var(--text-strong, #0f172a)',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {isPresent ? (
                          <CheckCircle2 style={{ width: 16, height: 16, color: '#059669' }} />
                        ) : (
                          <XCircle style={{ width: 16, height: 16, color: '#e11d48' }} />
                        )}
                        <span>{sec}</span>
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 20,
                          background: isPresent ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                          color: isPresent ? '#059669' : '#e11d48',
                        }}
                      >
                        {isPresent ? 'Detected' : 'Missing'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Keyword Match Distribution */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 800, color: 'var(--text-strong, #0f172a)', fontSize: '0.95rem' }}>
                <Target style={{ width: 18, height: 18, color: 'var(--emerald, #10b981)' }} />
                <span>Benchmark Keywords ({evaluation.target_role})</span>
              </div>

              {/* Matched Skills */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 style={{ width: 14, height: 14 }} />
                  <span>Matched Skills ({evaluation.matched_skills.length}):</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {evaluation.matched_skills.map((s, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        color: '#059669',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                  {evaluation.matched_skills.length === 0 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', fontStyle: 'italic' }}>No exact role keywords identified.</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle style={{ width: 14, height: 14 }} />
                  <span>Recommended Keywords to Add ({evaluation.missing_skills.length}):</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {evaluation.missing_skills.map((s, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        color: '#d97706',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                  {evaluation.missing_skills.length === 0 && (
                    <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>All benchmark keywords present!</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
            {/* Strengths Card */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: '#059669', fontWeight: 800, fontSize: '0.95rem' }}>
                <CheckCircle2 style={{ width: 18, height: 18 }} />
                <span>Key Resume Strengths</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {evaluation.strengths.map((st, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text, #334155)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      background: '#f8fafc',
                      padding: 12,
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                    }}
                  >
                    <span style={{ color: '#059669', fontWeight: 800 }}>•</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses Card */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: '#d97706', fontWeight: 800, fontSize: '0.95rem' }}>
                <AlertTriangle style={{ width: 18, height: 18 }} />
                <span>Optimization Deficits</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {evaluation.weaknesses.map((wk, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text, #334155)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      background: '#f8fafc',
                      padding: 12,
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                    }}
                  >
                    <span style={{ color: '#d97706', fontWeight: 800 }}>•</span>
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Improvement Recommendations (with Before/After Examples) */}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles style={{ width: 18, height: 18, color: 'var(--emerald, #10b981)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', margin: 0 }}>
                  Targeted Resume Improvement Recommendations
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
                {evaluation.recommendations.length} Actionable Fixes
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {evaluation.recommendations.map((rec, idx) => {
                const isExpanded = expandedRecIndex === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      borderRadius: 14,
                      border: '1px solid var(--border)',
                      background: '#f8fafc',
                      overflow: 'hidden',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      onClick={() => setExpandedRecIndex(isExpanded ? null : idx)}
                      style={{
                        padding: 16,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        userSelect: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 20,
                            background: 'rgba(16, 185, 129, 0.12)',
                            color: '#059669',
                            border: '1px solid rgba(16, 185, 129, 0.28)',
                          }}
                        >
                          {rec.category}
                        </span>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-strong, #0f172a)', margin: 0 }}>{rec.issue}</h4>
                      </div>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: '#ffffff',
                          border: '1px solid var(--border)',
                          color: 'var(--text-muted, #64748b)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isExpanded ? <ChevronUp style={{ width: 16, height: 16 }} /> : <ChevronDown style={{ width: 16, height: 16 }} />}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ padding: '0 16px 16px 16px', borderTop: '1px solid var(--border)' }}
                        >
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', marginTop: 12, marginBottom: 8 }}>
                            <strong style={{ color: 'var(--text, #334155)' }}>Why it matters: </strong>
                            {rec.importance}
                          </div>
                          <div
                            style={{
                              fontSize: '0.85rem',
                              color: '#059669',
                              marginBottom: 12,
                              background: 'rgba(16, 185, 129, 0.08)',
                              padding: 12,
                              borderRadius: 10,
                              border: '1px solid rgba(16, 185, 129, 0.2)',
                            }}
                          >
                            <strong>Recommended Improvement: </strong>
                            {rec.suggestion}
                          </div>

                          {/* Before / After Example */}
                          {rec.example_before && rec.example_after && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, paddingTop: 6 }}>
                              <div style={{ padding: 12, borderRadius: 10, background: 'rgba(244, 63, 94, 0.06)', border: '1px solid rgba(244, 63, 94, 0.2)', fontSize: '0.8rem' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                                  Before (Weak / Vague Bullet):
                                </div>
                                <div style={{ color: 'var(--text, #334155)', fontStyle: 'italic' }}>{rec.example_before}</div>
                              </div>
                              <div style={{ padding: 12, borderRadius: 10, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '0.8rem' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                                  After (Metric-Driven & Impactful):
                                </div>
                                <div style={{ color: 'var(--text-strong, #0f172a)', fontWeight: 600, whiteSpace: 'pre-line' }}>{rec.example_after}</div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Multi-Role Comparison Section */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <TrendingUp style={{ width: 18, height: 18, color: 'var(--emerald, #10b981)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', margin: 0 }}>
                Comparative Match Scores for Other Technical Roles
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', margin: '0 0 16px 0' }}>
              See how your resume content scores across alternative job tracks without modifying the original text:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              {evaluation.role_comparisons.map((rc, i) => (
                <div
                  key={i}
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    transition: 'all 0.15s ease',
                    background: rc.role_name === evaluation.target_role ? 'rgba(16, 185, 129, 0.08)' : '#f8fafc',
                    border: rc.role_name === evaluation.target_role ? '1.5px solid var(--emerald, #10b981)' : '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)' }}>{rc.role_name}</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--emerald, #10b981)' }}>{rc.overall_score.toFixed(0)}%</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                    {rc.matched_skills_count} matched &bull; {rc.missing_skills_count} missing
                  </div>
                  {rc.role_name !== evaluation.target_role && (
                    <button
                      onClick={() => handleScoreLatest(rc.role_name)}
                      style={{
                        marginTop: 10,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--emerald, #10b981)',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span>Analyze for this role</span>
                      <ArrowRight style={{ width: 12, height: 12 }} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Historical Evaluations Drawer */}
          {history.length > 1 && (
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Clock style={{ width: 16, height: 16, color: 'var(--text-muted, #64748b)' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', margin: 0 }}>Past ATS Evaluations</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {history.slice(0, 5).map((h) => (
                  <div
                    key={h.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 12,
                      borderRadius: 12,
                      background: '#f8fafc',
                      border: '1px solid var(--border)',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-strong, #0f172a)' }}>{h.filename}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>Target Role: {h.target_role}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--emerald, #10b981)' }}>{h.overall_score.toFixed(0)}%</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)' }}>{new Date(h.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default AtsScore;
