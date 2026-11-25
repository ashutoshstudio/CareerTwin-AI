/**
 * Reports.jsx — Career Readiness Reports & PDF Generator
 *
 * Integrates data from all 10 CareerTwin AI modules into a professional,
 * publication-ready PDF dossier. Allows section customization, live preview,
 * single-click generation, direct PDF download, and browsing history.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  RefreshCw,
  CheckSquare,
  Square,
  FileCheck,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  FolderDown,
  GitBranch,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';
import { CATEGORIZED_ROLES } from '../data/careerPaths';

const SECTION_DESCRIPTIONS = {
  profile: 'Student personal information, education credentials, academic metrics, and career goals.',
  readiness: 'Overall readiness score, category breakdown (technical, problem solving, projects, communication).',
  resume: 'Extracted resume skills, categorization, experience depth, and parsed resume metadata.',
  ats: 'ATS score, keyword match rate, section completeness, formatting, and weak bullet points.',
  skill_gap: 'Benchmarked skills comparison against target role requirements, critical missing skills.',
  recommendations: 'AI-driven top career recommendations, matching scores, and reasoning.',
  github: 'Public repository count, programming language spread, portfolio score, and top projects.',
  job_matches: 'Curated job vacancies matched to skill profile with location and compatibility scores.',
  xai: 'SHAP & LIME feature importances explaining which skills drove the readiness assessment.',
  roadmap: 'Structured multi-week milestone learning plan with hours and free resources.',
  action_plan: 'Synthesized executive action plan addressing identified skill and portfolio gaps.',
};

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatDate(isoString) {
  if (!isoString) return 'Just now';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
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

export default function Reports() {
  const { token } = useAuth();

  // State
  const [targetRole, setTargetRole] = useState('Data Analyst');
  const [customTitle, setCustomTitle] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);

  // UI loading & error states
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadingReportId, setDownloadingReportId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const defaultTitle = useMemo(() => `Career Readiness Report - ${targetRole}`, [targetRole]);
  const activeReportTitle = customTitle.trim() || defaultTitle;

  // Load Preview Data
  const fetchPreview = useCallback(async (role) => {
    if (!token) return;
    setIsLoadingPreview(true);
    setErrorMessage(null);
    try {
      const data = await api.getReportPreview(role, token);
      setPreviewData(data);
      if (data?.sections && data.sections.length > 0) {
        setSelectedSections(data.sections.map((s) => s.section_id));
      }
    } catch (err) {
      console.error('Failed to load report preview:', err);
      setErrorMessage(err.message || 'Could not load report preview. Please try again.');
    } finally {
      setIsLoadingPreview(false);
    }
  }, [token]);

  // Load History
  const fetchHistory = useCallback(async () => {
    if (!token) return;
    setIsLoadingHistory(true);
    try {
      const data = await api.getReportHistory(token);
      setHistory(data || []);
    } catch (err) {
      console.error('Failed to load report history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [token]);

  // Initial Data Load
  useEffect(() => {
    let isMounted = true;
    async function init() {
      if (!token) return;
      try {
        const profile = await api.getProfile(token).catch(() => null);
        const role = profile?.target_role || 'Data Analyst';
        if (isMounted) {
          setTargetRole(role);
          await fetchPreview(role);
          await fetchHistory();
        }
      } catch (e) {
        console.error('Error during initial report page load:', e);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, [token, fetchPreview, fetchHistory]);

  // Section Toggle Handler
  const handleToggleSection = (sectionId) => {
    setSelectedSections((prev) => {
      if (prev.includes(sectionId)) {
        if (prev.length <= 1) return prev;
        return prev.filter((id) => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
  };

  // Select all / Deselect all
  const allSectionIds = useMemo(() => {
    return previewData?.sections?.map((s) => s.section_id) || [];
  }, [previewData]);

  const handleSelectAll = () => {
    setSelectedSections(allSectionIds);
  };

  const handleDeselectAll = () => {
    if (allSectionIds.length > 0) {
      setSelectedSections([allSectionIds[0]]);
    }
  };

  // Generate & Download Handler
  const handleGenerate = async (downloadImmediately = true) => {
    if (!token) return;
    if (selectedSections.length === 0) {
      setErrorMessage('Please select at least one report section to include.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload = {
      title: activeReportTitle,
      selected_sections: selectedSections,
      target_role: targetRole,
    };

    try {
      const generated = await api.generateReport(payload, token);
      setSuccessMessage(`Report "${generated.title}" generated successfully! (${formatBytes(generated.file_size_bytes)})`);
      await fetchHistory();

      if (downloadImmediately && generated.id) {
        setDownloadingReportId(generated.id);
        const filename = `${generated.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
        await api.downloadReportPdf(generated.id, filename, token);
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
      setErrorMessage(err.message || 'Failed to generate PDF report. Please verify backend service.');
    } finally {
      setIsGenerating(false);
      setDownloadingReportId(null);
    }
  };

  // Download Existing Report from History
  const handleDownloadHistorical = async (reportItem) => {
    if (!token || !reportItem?.id) return;
    setDownloadingReportId(reportItem.id);
    try {
      const filename = `${reportItem.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      await api.downloadReportPdf(reportItem.id, filename, token);
    } catch (err) {
      console.error('Failed to download report:', err);
      setErrorMessage(err.message || 'Could not download PDF report.');
    } finally {
      setDownloadingReportId(null);
    }
  };

  // Snapshot metrics from preview
  const snapshot = previewData?.data_snapshot || {};
  const readinessScore = snapshot?.readiness?.readiness_score != null
    ? `${Math.round(snapshot.readiness.readiness_score)}%`
    : 'Pending';
  const atsScore = snapshot?.ats?.ats_score != null
    ? `${Math.round(snapshot.ats.ats_score)}/100`
    : 'Pending';
  const githubScore = snapshot?.github?.overall_score != null
    ? `${Math.round(snapshot.github.overall_score)}/100`
    : 'Pending';
  const availableCount = previewData?.sections?.filter((s) => s.is_available).length || 0;
  const totalCount = previewData?.sections?.length || 11;

  return (
    <div id="page-reports" className="page" style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 60 }}>
      {/* ── Page Header ────────────────────────────────────────────── */}
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
              <FileText style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <h1 className="page-heading" style={{ margin: 0 }}>
                Career Readiness Reports
              </h1>
              <p className="page-subtitle" style={{ margin: 0, marginTop: 4 }}>
                Synthesize your complete CareerTwin AI assessment history across all 10 modules into a single, publication-ready PDF executive dossier.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => {
              fetchPreview(targetRole);
              fetchHistory();
            }}
            disabled={isLoadingPreview || isGenerating}
            className="btn btn--outline"
            style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
            title="Refresh live preview"
          >
            <RefreshCw style={{ width: 14, height: 14, animation: isLoadingPreview ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh</span>
          </button>

          <button
            id="generate-download-top-btn"
            onClick={() => handleGenerate(true)}
            disabled={isGenerating || isLoadingPreview || selectedSections.length === 0}
            className="btn btn--primary"
            style={{ fontSize: '0.85rem', padding: '8px 18px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {isGenerating ? (
              <>
                <RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download style={{ width: 14, height: 14 }} />
                <span>Generate & Download</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Alerts & Feedback ──────────────────────────────────────── */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
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

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: 20,
            padding: 14,
            borderRadius: 12,
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#059669',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <CheckCircle2 style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2, color: '#059669' }} />
          <div style={{ flex: 1, fontWeight: 600 }}>{successMessage}</div>
          <button
            onClick={() => setSuccessMessage(null)}
            style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* ── Metric Snapshot Cards ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div
          className="card"
          style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '16px 20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Target Role</span>
            <Briefcase style={{ width: 16, height: 16, color: 'var(--emerald, #10b981)' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{targetRole}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginTop: 4 }}>Benchmarked profile</div>
        </div>

        <div
          className="card"
          style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '16px 20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Career Readiness</span>
            <TrendingUp style={{ width: 16, height: 16, color: 'var(--emerald, #10b981)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald, #10b981)' }}>{readinessScore}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginTop: 4 }}>
            {snapshot?.readiness?.readiness_level || 'Random Forest Model'}
          </div>
        </div>

        <div
          className="card"
          style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '16px 20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>ATS Score</span>
            <FileCheck style={{ width: 16, height: 16, color: 'var(--emerald, #10b981)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald, #10b981)' }}>{atsScore}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginTop: 4 }}>
            {snapshot?.ats?.overall_rating || 'Keyword match rate'}
          </div>
        </div>

        <div
          className="card"
          style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '16px 20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>GitHub Portfolio</span>
            <GitBranch style={{ width: 16, height: 16, color: 'var(--emerald, #10b981)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald, #10b981)' }}>{githubScore}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginTop: 4 }}>
            {snapshot?.github?.grade || 'Code Activity & Stack'}
          </div>
        </div>
      </div>

      {/* ── Report Customizer & Configuration ──────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 24 }}>
        {/* Left Column: Report Settings */}
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
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles style={{ width: 18, height: 18, color: 'var(--emerald, #10b981)' }} />
              <span>Report Settings</span>
            </h2>

            {/* Target Role Selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                Target Career Role
              </label>
              <select
                id="target-role-select"
                value={targetRole}
                onChange={(e) => {
                  setTargetRole(e.target.value);
                  fetchPreview(e.target.value);
                }}
                className="form-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, fontSize: '0.9rem', fontWeight: 600 }}
              >
                {CATEGORIZED_ROLES.map((group) => (
                  <optgroup key={group.category} label={group.category}>
                    {group.roles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', margin: '6px 0 0 0' }}>
                Aligns skill gaps, roadmaps, and ATS scoring against this benchmark role.
              </p>
            </div>

            {/* Custom Report Title */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                Report Title
              </label>
              <input
                id="report-title-input"
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={defaultTitle}
                className="form-input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, fontSize: '0.9rem' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', margin: '6px 0 0 0' }}>
                Appears on the cover page and running header of the generated PDF.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <button
                id="generate-download-main-btn"
                onClick={() => handleGenerate(true)}
                disabled={isGenerating || isLoadingPreview || selectedSections.length === 0}
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
                {isGenerating ? (
                  <>
                    <RefreshCw style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                    <span>Compiling Report PDF...</span>
                  </>
                ) : (
                  <>
                    <Download style={{ width: 16, height: 16 }} />
                    <span>Generate & Download PDF</span>
                  </>
                )}
              </button>

              <button
                id="generate-only-btn"
                onClick={() => handleGenerate(false)}
                disabled={isGenerating || isLoadingPreview || selectedSections.length === 0}
                className="btn btn--outline"
                style={{
                  width: '100%',
                  padding: '10px 20px',
                  borderRadius: 12,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <FolderDown style={{ width: 14, height: 14 }} />
                <span>Save to History Only</span>
              </button>
            </div>

            {/* Selection summary badge */}
            <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Sections Included:</span>
              <span style={{ fontWeight: 800, color: 'var(--emerald, #10b981)' }}>
                {selectedSections.length} of {allSectionIds.length}
              </span>
            </div>

            <div style={{ marginTop: 8, padding: '10px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Data Coverage:</span>
              <span style={{ fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck style={{ width: 14, height: 14 }} />
                {availableCount} of {totalCount} Ready
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Section Selector */}
        <div style={{ gridColumn: 'span 1' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Layers style={{ width: 18, height: 18, color: 'var(--emerald, #10b981)' }} />
                  <span>Select Report Sections</span>
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', margin: '4px 0 0 0' }}>
                  Choose which sections to include in your customized career dossier.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="btn btn--outline"
                  style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <CheckSquare style={{ width: 14, height: 14 }} />
                  <span>Select All</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="btn btn--secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Square style={{ width: 14, height: 14 }} />
                  <span>Deselect All</span>
                </button>
              </div>
            </div>

            {/* Loading state for sections */}
            {isLoadingPreview ? (
              <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
                <Loading message="Fetching module data snapshot..." />
              </div>
            ) : (!previewData || (previewData?.sections || []).length === 0) ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', borderRadius: 16, border: '2px dashed var(--border)', background: '#f8fafc' }}>
                <FileText style={{ width: 40, height: 40, color: 'var(--border)', margin: '0 auto 8px auto' }} />
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-strong, #0f172a)', margin: 0 }}>No report sections available</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', maxWidth: 360, margin: '6px auto 0 auto' }}>
                  Click the &quot;Refresh&quot; button above to generate a live assessment preview for your selected target role.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {previewData?.sections?.map((section) => {
                  const isChecked = selectedSections.includes(section.section_id);
                  const isAvailable = section.is_available;

                  return (
                    <div
                      key={section.section_id}
                      onClick={() => handleToggleSection(section.section_id)}
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        cursor: 'pointer',
                        userSelect: 'none',
                        transition: 'all 0.15s ease',
                        background: isChecked ? 'rgba(16, 185, 129, 0.05)' : '#f8fafc',
                        border: isChecked ? '1.5px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border)',
                        opacity: isChecked ? 1 : 0.65,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ marginTop: 2, flexShrink: 0 }}>
                          {isChecked ? (
                            <CheckSquare style={{ width: 18, height: 18, color: 'var(--emerald, #10b981)' }} />
                          ) : (
                            <Square style={{ width: 18, height: 18, color: 'var(--text-muted, #64748b)' }} />
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#e2e8f0', color: 'var(--text, #334155)' }}>
                                #{section.order}
                              </span>
                              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-strong, #0f172a)', margin: 0 }}>
                                {section.title}
                              </h3>
                            </div>

                            {/* Availability Badge */}
                            {isAvailable ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '2px 8px',
                                  borderRadius: 20,
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  background: 'rgba(16, 185, 129, 0.12)',
                                  border: '1px solid rgba(16, 185, 129, 0.28)',
                                  color: '#059669',
                                }}
                              >
                                <CheckCircle2 style={{ width: 12, height: 12 }} />
                                Data Ready
                              </span>
                            ) : (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '2px 8px',
                                  borderRadius: 20,
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  background: 'rgba(245, 158, 11, 0.1)',
                                  border: '1px solid rgba(245, 158, 11, 0.25)',
                                  color: '#d97706',
                                }}
                                title="Module not yet completed. The report will include an assessment notice."
                              >
                                <AlertCircle style={{ width: 12, height: 12 }} />
                                Not Yet Assessed
                              </span>
                            )}
                          </div>

                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                            {SECTION_DESCRIPTIONS[section.section_id] || 'Assessment section.'}
                          </p>

                          {section.data_summary && (
                            <div style={{ marginTop: 8, fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text, #334155)', background: '#ffffff', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', display: 'inline-block' }}>
                              {section.data_summary}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Report Generation History ──────────────────────────────── */}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock style={{ width: 18, height: 18, color: 'var(--emerald, #10b981)' }} />
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong, #0f172a)', margin: 0 }}>Previously Generated Reports</h2>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#f1f5f9', color: 'var(--text-muted, #64748b)', marginLeft: 4 }}>
              {history.length}
            </span>
          </div>

          <button
            onClick={fetchHistory}
            disabled={isLoadingHistory}
            className="btn btn--outline"
            style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw style={{ width: 14, height: 14, animation: isLoadingHistory ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh</span>
          </button>
        </div>

        {isLoadingHistory ? (
          <div style={{ padding: '30px 0', display: 'flex', justifyContent: 'center' }}>
            <Loading message="Loading report history..." />
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', borderRadius: 16, border: '2px dashed var(--border)', background: '#f8fafc' }}>
            <FileText style={{ width: 40, height: 40, color: 'var(--border)', margin: '0 auto 8px auto' }} />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-strong, #0f172a)', margin: '0 0 4px 0' }}>No reports generated yet</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', maxWidth: 400, margin: '0 auto' }}>
              Select your assessment sections above and click &quot;Generate & Download PDF&quot; to produce
              your first verified career readiness dossier.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ paddingBottom: 12, paddingLeft: 8 }}>Report Title</th>
                  <th style={{ paddingBottom: 12 }}>Target Role</th>
                  <th style={{ paddingBottom: 12 }}>Sections</th>
                  <th style={{ paddingBottom: 12 }}>File Size</th>
                  <th style={{ paddingBottom: 12 }}>Scores</th>
                  <th style={{ paddingBottom: 12 }}>Generated Date</th>
                  <th style={{ paddingBottom: 12, paddingRight: 8, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => {
                  const isDownloadingThis = downloadingReportId === item.id;

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s ease' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-strong, #0f172a)', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FileText style={{ width: 16, height: 16, color: 'var(--emerald, #10b981)', flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{item.title}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 0', color: 'var(--text, #334155)' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: '0.75rem', background: '#f8fafc', border: '1px solid var(--border)', fontWeight: 600 }}>
                          {item.target_role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 0', color: 'var(--text-muted, #64748b)', fontSize: '0.8rem' }}>
                        {item.selected_sections?.length || 0} sections
                      </td>
                      <td style={{ padding: '12px 0', color: 'var(--text-muted, #64748b)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        {formatBytes(item.file_size_bytes)}
                      </td>
                      <td style={{ padding: '12px 0', fontSize: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {item.overall_readiness_score != null && (
                            <span style={{ color: 'var(--emerald, #10b981)', fontWeight: 700 }} title="Readiness Score">
                              R: {Math.round(item.overall_readiness_score)}%
                            </span>
                          )}
                          {item.overall_ats_score != null && (
                            <span style={{ color: '#059669', fontWeight: 700 }} title="ATS Score">
                              ATS: {Math.round(item.overall_ats_score)}
                            </span>
                          )}
                          {item.overall_github_score != null && (
                            <span style={{ color: '#2563eb', fontWeight: 700 }} title="GitHub Score">
                              GH: {Math.round(item.overall_github_score)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 0', color: 'var(--text-muted, #64748b)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {formatDate(item.created_at)}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDownloadHistorical(item)}
                          disabled={isDownloadingThis}
                          className="btn btn--outline"
                          style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                          <Download style={{ width: 14, height: 14, animation: isDownloadingThis ? 'spin 1s linear infinite' : 'none' }} />
                          <span>{isDownloadingThis ? 'Downloading...' : 'Download'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
