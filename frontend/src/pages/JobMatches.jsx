/**
 * JobMatches.jsx — Curated Entry-Level Vacancy Matching
 * Route: /job-matches
 * Connected to FastAPI backend:
 *   GET    /api/v1/jobs/match
 *   GET    /api/v1/jobs/saved
 *   POST   /api/v1/jobs/save/:job_id
 *   DELETE /api/v1/jobs/save/:job_id
 */

import React, { Component, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  MapPin,
  Clock,
  Building2,
  SlidersHorizontal,
  Info,
  ShieldAlert,
  ChevronDown,
  X,
  FileText,
  Percent,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Loading from '../components/Loading';

// Error Boundary
class JobMatchesErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('JobMatches component crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: 520, margin: '0 auto', background: 'var(--bg-card, #ffffff)', padding: 32, borderRadius: 16, border: '1px solid var(--border)' }}>
            <AlertCircle size={44} color="#f87171" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-strong)' }}>
              Unable to Display Job Matches
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

function getGradeBadgeStyle(grade) {
  switch (grade) {
    case 'High Match':
      return {
        bg: 'rgba(16, 185, 129, 0.12)',
        border: 'rgba(16, 185, 129, 0.35)',
        text: 'var(--emerald-light, #10b981)',
      };
    case 'Good Match':
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

function JobMatchesContent() {
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [matchesData, setMatchesData] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocationType, setSelectedLocationType] = useState('All');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [includeResume, setIncludeResume] = useState(true);

  // Modal / Drawer state for calculation details
  const [inspectedJob, setInspectedJob] = useState(null);
  const [applicationJob, setApplicationJob] = useState(null);

  // Notification state
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchMatches = async (showLoadingSpinner = true) => {
    if (!token) {
      setLoading(false);
      return;
    }
    if (showLoadingSpinner) setLoading(true);
    else setRefreshing(true);
    setErrorMsg(null);

    try {
      const [res, savedList] = await Promise.all([
        api.getJobMatches(
          {
            role_category: selectedCategory !== 'All' ? selectedCategory : undefined,
            location_type: selectedLocationType !== 'All' ? selectedLocationType : undefined,
            include_resume_skills: includeResume,
          },
          token
        ),
        api.getSavedJobs(token).catch(() => []),
      ]);

      setMatchesData(res);
      setSavedJobIds(new Set((savedList || []).map((s) => s.job_id)));
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch job matches from server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMatches(true);
  }, [token, selectedCategory, selectedLocationType, includeResume]);

  const handleToggleSave = async (jobId, isCurrentlySaved) => {
    if (!token) return;
    try {
      if (isCurrentlySaved) {
        await api.unsaveJob(jobId, token);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
        setSuccessMsg('Job removed from your saved bookmarks.');
      } else {
        await api.saveJob(jobId, token);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.add(jobId);
          return next;
        });
        setSuccessMsg('Job saved to your bookmarks.');
      }
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update job bookmark.');
    }
  };

  // Filter and search
  const filteredMatches = useMemo(() => {
    const list = matchesData?.matches || [];
    return list.filter((job) => {
      if (showSavedOnly && !savedJobIds.has(job.id)) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = job.title?.toLowerCase().includes(query);
        const matchesCompany = job.company?.toLowerCase().includes(query);
        const matchesSkills = job.required_skills?.some((s) => s.name?.toLowerCase().includes(query));
        if (!matchesTitle && !matchesCompany && !matchesSkills) return false;
      }

      return true;
    });
  }, [matchesData, savedJobIds, showSavedOnly, searchQuery]);

  if (loading) {
    return (
      <div id="page-job-matches" className="page" style={{ padding: '60px 0', textAlign: 'center' }}>
        <Loading message="Evaluating curated entry-level tech vacancies against student competencies..." />
      </div>
    );
  }

  return (
    <div id="page-job-matches" className="page" style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
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
            <Briefcase size={20} />
          </div>
          <span style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--emerald-light, #10b981)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Academic Prototype Module
          </span>
        </div>
        <div className="page-heading">Entry-Level Vacancy Matching</div>
        <div className="page-subtitle">
          Curated benchmark vacancies evaluated transparently against your verified profile skills
          and proficiency levels. Sample vacancies are strictly labelled for academic evaluation.
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
              padding: '12px 18px',
              borderRadius: 14,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontWeight: 600,
              fontSize: '.88rem',
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
              padding: '12px 18px',
              borderRadius: 14,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontWeight: 600,
              fontSize: '.88rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Control Toolbar */}
      <div
        style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '20px 24px',
          marginBottom: 28,
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
          {/* Search box */}
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              id="job-search-input"
              className="form-input"
              style={{ paddingLeft: 38, width: '100%', fontSize: '.88rem' }}
              placeholder="Search by role, company, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Role Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label htmlFor="role-category-filter" style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text-strong)' }}>
              Role:
            </label>
            <select
              id="role-category-filter"
              className="form-input"
              style={{ padding: '8px 12px', fontSize: '.85rem', width: 170 }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Python Developer">Python Developer</option>
              <option value="Machine Learning Engineer">ML Engineer</option>
              <option value="Full Stack Developer">Full Stack</option>
              <option value="Cloud Engineer">Cloud Engineer</option>
            </select>
          </div>

          {/* Location Type Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label htmlFor="location-filter" style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text-strong)' }}>
              Location:
            </label>
            <select
              id="location-filter"
              className="form-input"
              style={{ padding: '8px 12px', fontSize: '.85rem', width: 130 }}
              value={selectedLocationType}
              onChange={(e) => setSelectedLocationType(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          {/* Refresh button */}
          <button
            id="refresh-matches-btn"
            className="btn btn--secondary"
            style={{ padding: '8px 14px', fontSize: '.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => fetchMatches(false)}
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Checkbox toggles row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem', color: 'var(--text-sec)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                id="saved-only-toggle"
                checked={showSavedOnly}
                onChange={(e) => setShowSavedOnly(e.target.checked)}
                style={{ accentColor: 'var(--emerald-light, #10b981)', width: 15, height: 15 }}
              />
              Show Saved / Bookmarked Only ({savedJobIds.size})
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem', color: 'var(--text-sec)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                id="include-resume-skills-toggle"
                checked={includeResume}
                onChange={(e) => setIncludeResume(e.target.checked)}
                style={{ accentColor: 'var(--emerald-light, #10b981)', width: 15, height: 15 }}
              />
              Include unmerged resume skills
            </label>
          </div>

          <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredMatches.length}</strong> of {matchesData?.total_matched || 0} evaluated vacancies
          </div>
        </div>
      </div>

      {/* Vacancies Grid */}
      {filteredMatches.length === 0 ? (
        <div style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <Briefcase size={36} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 6 }}>
            No Vacancies Match Your Filter
          </h3>
          <p style={{ fontSize: '.85rem', color: 'var(--text-sec)', maxWidth: 440, margin: '0 auto 16px' }}>
            Try broadening your search query or reset the role and location filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedLocationType('All');
              setShowSavedOnly(false);
            }}
            className="btn btn--secondary"
            style={{ fontSize: '.85rem' }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {filteredMatches.map((job) => {
            const isSaved = savedJobIds.has(job.id);
            const gradeStyle = getGradeBadgeStyle(job.match_grade);

            return (
              <motion.div
                key={job.id}
                id={`job-card-${job.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'var(--bg-card, #ffffff)',
                  border: isSaved ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border)',
                  borderRadius: 20,
                  padding: '24px 28px',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
                  position: 'relative',
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                }}
              >
                {/* Top Row: Title, Company, Sample Badge, Match Score, Bookmark */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        border: '1px solid rgba(59, 130, 246, 0.25)',
                        fontSize: '.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 10,
                        textTransform: 'uppercase',
                      }}>
                        {job.sample_notice ? 'Academic Sample' : 'Listing'}
                      </span>
                      <span style={{
                        background: 'var(--bg-main, #f3f4f6)',
                        color: 'var(--text-sec)',
                        fontSize: '.72rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 10,
                      }}>
                        {job.role_category}
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-strong)', marginBottom: 4 }}>
                      {job.title}
                    </h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '.82rem', color: 'var(--text-sec)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, color: 'var(--text-strong)' }}>
                        <Building2 size={14} color="var(--text-muted)" />
                        {job.company}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={14} color="var(--text-muted)" />
                        {job.location}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={14} color="var(--text-muted)" />
                        {job.experience_required}
                      </span>
                    </div>
                  </div>

                  {/* Right side: Score & Bookmark Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      textAlign: 'right',
                      padding: '8px 14px',
                      borderRadius: 14,
                      background: gradeStyle.bg,
                      border: `1px solid ${gradeStyle.border}`,
                    }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: gradeStyle.text, lineHeight: 1.1 }}>
                        {job.match_score}%
                      </div>
                      <div style={{ fontSize: '.7rem', fontWeight: 700, color: gradeStyle.text }}>
                        {job.match_grade}
                      </div>
                    </div>

                    <button
                      id={`bookmark-btn-${job.id}`}
                      onClick={() => handleToggleSave(job.id, isSaved)}
                      style={{
                        background: isSaved ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                        border: '1px solid var(--border)',
                        color: isSaved ? 'var(--emerald-light, #10b981)' : 'var(--text-muted)',
                        borderRadius: 12,
                        padding: 10,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                      title={isSaved ? 'Remove from bookmarks' : 'Save / Bookmark job'}
                    >
                      {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '.86rem', color: 'var(--text-sec)', lineHeight: 1.5, marginBottom: 16 }}>
                  {job.description}
                </p>

                {/* Skills Analysis Pill Rows */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 18, background: 'var(--bg-main, #fafafa)', padding: '14px 16px', borderRadius: 14, border: '1px solid var(--border)' }}>
                  {/* Matching skills */}
                  <div>
                    <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--emerald-light, #10b981)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={13} />
                      Matching Required Skills ({job.matching_skills?.filter(s => s.is_required).length || 0})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {job.matching_skills?.filter(s => s.is_required).length === 0 ? (
                        <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No required skills possessed yet
                        </span>
                      ) : (
                        job.matching_skills.filter(s => s.is_required).map((skill) => (
                          <span
                            key={skill.name}
                            style={{
                              background: 'rgba(16, 185, 129, 0.1)',
                              border: '1px solid rgba(16, 185, 129, 0.25)',
                              color: 'var(--emerald-light, #10b981)',
                              padding: '2px 8px',
                              borderRadius: 8,
                              fontSize: '.74rem',
                              fontWeight: 600,
                            }}
                          >
                            {skill.name} (Lvl {skill.student_level}/{skill.required_level})
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Missing required skills */}
                  <div>
                    <div style={{ fontSize: '.75rem', fontWeight: 700, color: '#f59e0b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={13} />
                      Missing / Deficit Required Skills ({job.missing_required_skills?.length || 0})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {job.missing_required_skills?.length === 0 ? (
                        <span style={{ fontSize: '.75rem', color: 'var(--emerald-light, #10b981)', fontWeight: 600 }}>
                          ✓ All required skills met!
                        </span>
                      ) : (
                        job.missing_required_skills.map((skill) => (
                          <span
                            key={skill.name}
                            style={{
                              background: 'rgba(245, 158, 11, 0.1)',
                              border: '1px solid rgba(245, 158, 11, 0.25)',
                              color: '#f59e0b',
                              padding: '2px 8px',
                              borderRadius: 8,
                              fontSize: '.74rem',
                              fontWeight: 600,
                            }}
                          >
                            {skill.name} (Req Lvl {skill.required_level})
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Controls: Inspect Math Breakdown & View Application Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>
                    Dataset Attribution: {job.source_attribution}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      id={`inspect-math-btn-${job.id}`}
                      className="btn btn--secondary"
                      style={{ padding: '6px 14px', fontSize: '.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
                      onClick={() => setInspectedJob(job)}
                    >
                      <Percent size={14} />
                      <span>Calculation Breakdown</span>
                    </button>

                    <button
                      id={`view-application-btn-${job.id}`}
                      className="btn btn--primary"
                      style={{ padding: '6px 16px', fontSize: '.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
                      onClick={() => setApplicationJob(job)}
                    >
                      <span>Application Info</span>
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Global Academic Disclaimer Banner */}
      <div
        id="job-matching-disclaimer"
        style={{
          background: 'rgba(59, 130, 246, 0.04)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: 20,
          padding: '20px 24px',
          marginTop: 36,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
        }}
      >
        <ShieldAlert size={22} color="#3b82f6" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '.82rem', color: 'var(--text-sec)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text-strong)', display: 'block', marginBottom: 4 }}>
            Academic Prototype Notice & Transparency Disclaimer
          </strong>
          Skill match percentages are evaluated mathematically against documented entry-level vacancy
          specifications. A high match score indicates syllabus and competency alignment, not a guaranteed
          interview shortlisting or commercial employment offer. All vacancies are curated benchmark
          demonstrations and never claim to represent active real-world hiring processes.
        </div>
      </div>

      {/* Modal: Transparent Match Calculation Breakdown */}
      <AnimatePresence>
        {inspectedJob && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              zIndex: 1000,
            }}
            onClick={() => setInspectedJob(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                background: 'var(--bg-card, #ffffff)',
                borderRadius: 20,
                padding: '28px 32px',
                maxWidth: 580,
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                border: '1px solid var(--border)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                  Transparent Match Calculation
                </h3>
                <button
                  onClick={() => setInspectedJob(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>
                {inspectedJob.title}
              </div>
              <div style={{ fontSize: '.8rem', color: 'var(--text-sec)', marginBottom: 20 }}>
                {inspectedJob.company} • Overall Score: <strong>{inspectedJob.match_score}%</strong> ({inspectedJob.match_grade})
              </div>

              {/* Point Allocation Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <div style={{ background: 'var(--bg-main, #fafafa)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', fontWeight: 700, marginBottom: 4 }}>
                    <span>1. Required Skills Alignment (70% Max)</span>
                    <span style={{ color: 'var(--emerald-light, #10b981)' }}>
                      {inspectedJob.score_breakdown?.required_skills_score} / 70.0 pts
                    </span>
                  </div>
                  <div style={{ fontSize: '.76rem', color: 'var(--text-sec)' }}>
                    Calculated by candidate proficiency fulfillment across {inspectedJob.required_skills?.length} mandatory core skills.
                  </div>
                </div>

                <div style={{ background: 'var(--bg-main, #fafafa)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', fontWeight: 700, marginBottom: 4 }}>
                    <span>2. Preferred Skills Alignment (20% Max)</span>
                    <span style={{ color: '#3b82f6' }}>
                      {inspectedJob.score_breakdown?.preferred_skills_score} / 20.0 pts
                    </span>
                  </div>
                  <div style={{ fontSize: '.76rem', color: 'var(--text-sec)' }}>
                    Bonus points for possessing complementary tools and frameworks.
                  </div>
                </div>

                <div style={{ background: 'var(--bg-main, #fafafa)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', fontWeight: 700, marginBottom: 4 }}>
                    <span>3. Role Affinity & Experience (10% Max)</span>
                    <span style={{ color: '#f59e0b' }}>
                      {inspectedJob.score_breakdown?.affinity_score} / 10.0 pts
                    </span>
                  </div>
                  <div style={{ fontSize: '.76rem', color: 'var(--text-sec)' }}>
                    Matches student's expressed career target role and verified entry-level experience tier.
                  </div>
                </div>
              </div>

              {/* Formula text */}
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 12, padding: '12px 16px', fontSize: '.78rem', color: 'var(--text-sec)', marginBottom: 20 }}>
                <strong>Formula:</strong> {inspectedJob.score_breakdown?.formula}
              </div>

              <button
                onClick={() => setInspectedJob(null)}
                className="btn btn--secondary"
                style={{ width: '100%', fontSize: '.85rem' }}
              >
                Close Breakdown
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Application Information */}
      <AnimatePresence>
        {applicationJob && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              zIndex: 1000,
            }}
            onClick={() => setApplicationJob(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                background: 'var(--bg-card, #ffffff)',
                borderRadius: 20,
                padding: '28px 32px',
                maxWidth: 520,
                width: '100%',
                border: '1px solid var(--border)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                  Application Details
                </h3>
                <button
                  onClick={() => setApplicationJob(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>
                {applicationJob.title}
              </div>
              <div style={{ fontSize: '.82rem', color: 'var(--text-sec)', marginBottom: 16 }}>
                {applicationJob.company} • {applicationJob.location}
              </div>

              <div style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: 14,
                padding: '16px 18px',
                fontSize: '.82rem',
                color: 'var(--text-sec)',
                lineHeight: 1.5,
                marginBottom: 20,
              }}>
                <strong style={{ color: 'var(--text-strong)', display: 'block', marginBottom: 6 }}>
                  ⚠️ Academic Sample Vacancy
                </strong>
                This is a documented demonstration vacancy created for academic evaluation in the CareerTwin AI research prototype.
                Active commercial hiring or actual recruitment applications are not processed for this sample record.
              </div>

              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Sample Application Portal URL:
                </span>
                <a
                  href={applicationJob.application_url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: 'var(--emerald-light, #10b981)',
                    fontSize: '.85rem',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    wordBreak: 'break-all',
                  }}
                >
                  {applicationJob.application_url || 'https://demo.careertwin.ai/apply/' + applicationJob.id}
                </a>
              </div>

              <button
                onClick={() => setApplicationJob(null)}
                className="btn btn--primary"
                style={{ width: '100%', fontSize: '.85rem' }}
              >
                Close Application Info
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function JobMatches() {
  return (
    <JobMatchesErrorBoundary>
      <JobMatchesContent />
    </JobMatchesErrorBoundary>
  );
}

export default JobMatches;
