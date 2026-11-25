/**
 * JobMatches.jsx — Intelligent Entry-Level Vacancy & Live Job Matching
 * Route: /job-matches
 * Connected to FastAPI backend:
 *   GET    /api/v1/jobs/match
 *   GET    /api/v1/jobs/providers
 *   GET    /api/v1/jobs/live
 *   GET    /api/v1/jobs/saved
 *   POST   /api/v1/jobs/save/:job_id
 *   DELETE /api/v1/jobs/save/:job_id
 */

import { Component, useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIZED_ROLES } from '../data/careerPaths';
import {
  Briefcase,
  Search,
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
  ShieldAlert,
  X,
  Percent,
  Radio,
  Globe,
  Sparkles,
  BookOpen,
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

function getProviderBadge(job) {
  const src = (job.source || (job.is_sample ? 'curated' : 'unknown')).toLowerCase();
  switch (src) {
    case 'remotive':
      return {
        label: 'Remotive',
        bg: 'rgba(59, 130, 246, 0.1)',
        color: '#2563eb',
        border: 'rgba(59, 130, 246, 0.25)',
        attribution: 'Powered by Remotive API',
        url: 'https://remotive.com',
      };
    case 'arbeitnow':
      return {
        label: 'Arbeitnow',
        bg: 'rgba(168, 85, 247, 0.1)',
        color: '#9333ea',
        border: 'rgba(168, 85, 247, 0.25)',
        attribution: 'Powered by Arbeitnow',
        url: 'https://www.arbeitnow.com',
      };
    case 'adzuna':
      return {
        label: 'Adzuna',
        bg: 'rgba(234, 88, 12, 0.1)',
        color: '#c2410c',
        border: 'rgba(234, 88, 12, 0.25)',
        attribution: 'Jobs by Adzuna',
        url: 'https://www.adzuna.com',
      };
    default:
      return {
        label: 'Academic Benchmark',
        bg: 'rgba(16, 185, 129, 0.1)',
        color: '#059669',
        border: 'rgba(16, 185, 129, 0.25)',
        attribution: 'Curated Benchmark Dataset',
        url: null,
      };
  }
}

function formatJobDate(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return null;
  }
}

function JobMatchesContent() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(() => Boolean(token));
  const [refreshing, setRefreshing] = useState(false);
  const [matchesData, setMatchesData] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [providersStatus, setProvidersStatus] = useState([]);

  // Source tab state: 'all' | 'live' | 'curated' | 'saved'
  const [sourceTab, setSourceTab] = useState('all');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocationType, setSelectedLocationType] = useState('All');
  const [selectedSource, setSelectedSource] = useState('all');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sortBy, setSortBy] = useState('match_score');
  const [includeResume, setIncludeResume] = useState(true);

  // Modal / Drawer state for calculation details
  const [inspectedJob, setInspectedJob] = useState(null);
  const [applicationJob, setApplicationJob] = useState(null);

  // Notification state
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Fetch job matches, saved bookmarks, and provider statuses
  const fetchMatches = useCallback(async (showLoadingSpinner = true) => {
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    if (showLoadingSpinner) setLoading(true);
    else setRefreshing(true);
    setErrorMsg(null);

    try {
      const backendSourceType = sourceTab === 'saved' ? 'all' : sourceTab;

      const [res, savedList, provRes] = await Promise.all([
        api.getJobMatches(
          {
            source_type: backendSourceType,
            role_category: selectedCategory !== 'All' ? selectedCategory : undefined,
            location_type: selectedLocationType !== 'All' ? selectedLocationType : undefined,
            remote_only: remoteOnly,
            job_source: selectedSource !== 'all' ? selectedSource : undefined,
            sort_by: sortBy,
            scoring_model: 'five_factor',
            include_resume_skills: includeResume,
            limit: 50,
          },
          token
        ),
        api.getSavedJobs(token).catch(() => []),
        api.getJobProviders().catch(() => null),
      ]);

      setMatchesData(res);
      setSavedJobIds(new Set((savedList || []).map((s) => s.job_id)));
      if (provRes?.providers) {
        setProvidersStatus(provRes.providers);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch job matches from server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, sourceTab, selectedCategory, selectedLocationType, remoteOnly, selectedSource, sortBy, includeResume]);

  useEffect(() => {
    let ignore = false;
    if (!token) return;

    async function load() {
      try {
        const backendSourceType = sourceTab === 'saved' ? 'all' : sourceTab;
        const [res, savedList, provRes] = await Promise.all([
          api.getJobMatches(
            {
              source_type: backendSourceType,
              role_category: selectedCategory !== 'All' ? selectedCategory : undefined,
              location_type: selectedLocationType !== 'All' ? selectedLocationType : undefined,
              remote_only: remoteOnly,
              job_source: selectedSource !== 'all' ? selectedSource : undefined,
              sort_by: sortBy,
              scoring_model: 'five_factor',
              include_resume_skills: includeResume,
              limit: 50,
            },
            token
          ),
          api.getSavedJobs(token).catch(() => []),
          api.getJobProviders().catch(() => null),
        ]);
        if (!ignore) {
          setMatchesData(res);
          setSavedJobIds(new Set((savedList || []).map((s) => s.job_id)));
          if (provRes?.providers) {
            setProvidersStatus(provRes.providers);
          }
        }
      } catch (err) {
        if (!ignore) {
          setErrorMsg(err.message || 'Failed to fetch job matches from server.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    load();
    return () => { ignore = true; };
  }, [token, sourceTab, selectedCategory, selectedLocationType, remoteOnly, selectedSource, sortBy, includeResume]);

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
      // Tab filter for saved
      if (sourceTab === 'saved' && !savedJobIds.has(job.id)) return false;

      // Tab filter for live vs curated
      if (sourceTab === 'live' && job.is_sample) return false;
      if (sourceTab === 'curated' && !job.is_sample) return false;

      // Remote only filter
      if (remoteOnly && !job.is_remote && job.location_type?.toLowerCase() !== 'remote') return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = job.title?.toLowerCase().includes(query);
        const matchesCompany = job.company?.toLowerCase().includes(query);
        const matchesCategory = job.role_category?.toLowerCase().includes(query);
        const matchesSkills = job.required_skills?.some((s) => s.name?.toLowerCase().includes(query));
        if (!matchesTitle && !matchesCompany && !matchesCategory && !matchesSkills) return false;
      }

      return true;
    });
  }, [matchesData, savedJobIds, sourceTab, remoteOnly, searchQuery]);

  if (loading) {
    return (
      <div id="page-job-matches" className="page" style={{ padding: '60px 0', textAlign: 'center' }}>
        <Loading message="Evaluating live technology vacancies against your verified profile competencies..." />
      </div>
    );
  }

  return (
    <div id="page-job-matches" className="page" style={{ maxWidth: 1080, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
          <h1 className="page-heading" style={{ margin: 0 }}>
            Job Matches & Live Vacancies
          </h1>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 10px',
            borderRadius: 99,
            fontSize: '.74rem',
            fontWeight: 700,
            background: 'rgba(16, 185, 129, 0.12)',
            color: '#059669',
            border: '1px solid rgba(16, 185, 129, 0.28)',
          }}>
            <Sparkles size={13} />
            42-Role Intelligence
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 10px',
            borderRadius: 99,
            fontSize: '.74rem',
            fontWeight: 700,
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#2563eb',
            border: '1px solid rgba(59, 130, 246, 0.25)',
          }}>
            <Radio size={13} />
            Live Provider Feeds
          </span>
        </div>
        <div className="page-subtitle" style={{ margin: 0 }}>
          Real job listings from external APIs matched transparently against candidate competencies using
          a 5-factor scoring model. Integrated with LinkedIn external search and official learning resources.
        </div>
      </div>

      {/* Provider Status Pill Bar */}
      {providersStatus.length > 0 && (
        <div
          id="job-providers-bar"
          style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '12px 18px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.78rem', fontWeight: 700, color: 'var(--text-sec)' }}>
            <Globe size={15} color="var(--emerald-light, #10b981)" />
            <span>Connected Providers:</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {providersStatus.map((p) => {
              const isActive = p.active;
              return (
                <div
                  key={p.name}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: '.74rem',
                    fontWeight: 600,
                    background: isActive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(156, 163, 175, 0.12)',
                    border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(156, 163, 175, 0.3)'}`,
                    color: isActive ? '#059669' : 'var(--text-muted)',
                  }}
                  title={p.coverage || p.message || p.terms_attribution}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: isActive ? '#10b981' : '#9ca3af',
                    }}
                  />
                  <span>{p.display_name}</span>
                  {!isActive && <span style={{ fontSize: '.68rem', opacity: 0.8 }}>(Needs Keys)</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Tab Navigation */}
      <div
        id="job-source-tabs"
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          borderBottom: '1px solid var(--border)',
          paddingBottom: 4,
          flexWrap: 'wrap',
        }}
      >
        {[
          { id: 'all', label: 'All Opportunities', count: matchesData?.total_matched || 0 },
          { id: 'live', label: 'Live External Jobs' },
          { id: 'curated', label: 'Curated Benchmarks' },
          { id: 'saved', label: `Saved Bookmarks (${savedJobIds.size})` },
        ].map((tab) => {
          const isSelected = sourceTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setSourceTab(tab.id)}
              style={{
                background: isSelected ? 'var(--bg-card, #ffffff)' : 'transparent',
                border: isSelected ? '1px solid var(--border)' : '1px solid transparent',
                borderBottom: isSelected ? '2px solid var(--emerald-light, #10b981)' : '1px solid transparent',
                color: isSelected ? 'var(--emerald-light, #10b981)' : 'var(--text-sec)',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '.86rem',
                padding: '8px 16px',
                borderRadius: '10px 10px 0 0',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
          {/* Search box */}
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              id="job-search-input"
              className="form-input"
              style={{ paddingLeft: 38, width: '100%', fontSize: '.86rem' }}
              placeholder="Search by role, company, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 42-Role Dropdown with Categories */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label htmlFor="role-category-filter" style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--text-strong)' }}>
              Profile:
            </label>
            <select
              id="role-category-filter"
              className="form-input"
              style={{ padding: '7px 12px', fontSize: '.84rem', width: 175 }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All 42 Profiles</option>
              {CATEGORIZED_ROLES.map((group) => (
                <optgroup key={group.category} label={group.category}>
                  {group.roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Job Source Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label htmlFor="job-source-filter" style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--text-strong)' }}>
              Source:
            </label>
            <select
              id="job-source-filter"
              className="form-input"
              style={{ padding: '7px 12px', fontSize: '.84rem', width: 140 }}
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
            >
              <option value="all">All Sources</option>
              <option value="remotive">Remotive</option>
              <option value="arbeitnow">Arbeitnow</option>
              <option value="adzuna">Adzuna</option>
              <option value="curated">Curated Benchmark</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label htmlFor="sort-by-filter" style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--text-strong)' }}>
              Sort:
            </label>
            <select
              id="sort-by-filter"
              className="form-input"
              style={{ padding: '7px 12px', fontSize: '.84rem', width: 145 }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="match_score">Highest Match</option>
              <option value="newest">Most Recent</option>
            </select>
          </div>

          {/* Refresh button */}
          <button
            id="refresh-matches-btn"
            className="btn btn--secondary"
            style={{ padding: '7px 14px', fontSize: '.84rem', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => fetchMatches(false)}
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Second Row: Location filter, Remote toggle, Resume toggle, count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            {/* Location Type Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text-sec)' }}>Type:</span>
              <select
                id="location-filter"
                className="form-input"
                style={{ padding: '5px 10px', fontSize: '.8rem', width: 110 }}
                value={selectedLocationType}
                onChange={(e) => setSelectedLocationType(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem', color: 'var(--text-sec)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                id="remote-only-toggle"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                style={{ accentColor: 'var(--emerald-light, #10b981)', width: 15, height: 15 }}
              />
              Remote Only
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
            Showing <strong>{filteredMatches.length}</strong> of {matchesData?.total_matched || 0} evaluated opportunities
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
            No Opportunities Match Your Current Filter
          </h3>
          <p style={{ fontSize: '.85rem', color: 'var(--text-sec)', maxWidth: 460, margin: '0 auto 16px' }}>
            Try broadening your search query, switching between Live and Curated tabs, or resetting filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedLocationType('All');
              setSelectedSource('all');
              setRemoteOnly(false);
              setSourceTab('all');
            }}
            className="btn btn--secondary"
            style={{ fontSize: '.85rem' }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {filteredMatches.map((job) => {
            const isSaved = savedJobIds.has(job.id);
            const gradeStyle = getGradeBadgeStyle(job.match_grade);
            const providerInfo = getProviderBadge(job);
            const pubDateFormatted = formatJobDate(job.published_at);

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
                {/* Top Row: Badges, Title, Company, Score, Bookmark */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 12 }}>
                  <div style={{ flex: '1 1 340px' }}>
                    {/* Badge Strip */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                      {/* Provider Badge */}
                      <span style={{
                        background: providerInfo.bg,
                        color: providerInfo.color,
                        border: `1px solid ${providerInfo.border}`,
                        fontSize: '.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 10,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        <Globe size={11} />
                        {providerInfo.label}
                      </span>

                      {/* Live vs Sample Tag */}
                      <span style={{
                        background: job.is_sample ? 'rgba(107, 114, 128, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: job.is_sample ? 'var(--text-sec)' : '#059669',
                        border: `1px solid ${job.is_sample ? 'rgba(107, 114, 128, 0.2)' : 'rgba(16, 185, 129, 0.25)'}`,
                        fontSize: '.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 10,
                        textTransform: 'uppercase',
                      }}>
                        {job.is_sample ? 'Academic Benchmark' : 'Live Listing'}
                      </span>

                      {/* Role Category */}
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

                      {/* Publication Date */}
                      {pubDateFormatted && (
                        <span style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>
                          • {pubDateFormatted}
                        </span>
                      )}
                    </div>

                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-strong)', marginBottom: 6 }}>
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
                      {job.salary_min && (
                        <span style={{ fontWeight: 600, color: 'var(--emerald-light, #10b981)' }}>
                          {job.currency || '₹'} {job.salary_min.toLocaleString()} - {job.salary_max ? job.salary_max.toLocaleString() : '+'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right side: Score & Bookmark Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      textAlign: 'right',
                      padding: '8px 16px',
                      borderRadius: 14,
                      background: gradeStyle.bg,
                      border: `1px solid ${gradeStyle.border}`,
                    }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: gradeStyle.text, lineHeight: 1.1 }}>
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

                {/* Skills Analysis Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 18, background: 'var(--bg-main, #fafafa)', padding: '14px 16px', borderRadius: 14, border: '1px solid var(--border)' }}>
                  {/* Matching skills */}
                  <div>
                    <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--emerald-light, #10b981)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={13} />
                      Matching Required Skills ({(job.matching_skills || []).filter(s => s?.is_required).length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(job.matching_skills || []).filter(s => s?.is_required).length === 0 ? (
                        <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No required skills possessed yet
                        </span>
                      ) : (
                        (job.matching_skills || []).filter(s => s?.is_required).map((skill) => (
                          <span
                            key={skill?.name || Math.random()}
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
                            {skill?.name} (Lvl {skill?.student_level ?? 0}/{skill?.required_level ?? 1})
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Missing required skills */}
                  <div>
                    <div style={{ fontSize: '.75rem', fontWeight: 700, color: '#f59e0b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={13} />
                      Missing / Deficit Skills ({(job.missing_required_skills || []).length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(job.missing_required_skills || []).length === 0 ? (
                        <span style={{ fontSize: '.75rem', color: 'var(--emerald-light, #10b981)', fontWeight: 600 }}>
                          ✓ All required skills met!
                        </span>
                      ) : (
                        (job.missing_required_skills || []).map((skill) => (
                          <span
                            key={skill?.name || Math.random()}
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
                            {skill?.name} (Req Lvl {skill?.required_level ?? 1})
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Controls: Attributions, LinkedIn Search, Calculation Breakdown, View Job */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>
                    Attribution:{' '}
                    {providerInfo.url ? (
                      <a
                        href={providerInfo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--text-sec)', textDecoration: 'underline' }}
                      >
                        {job.attribution_text || providerInfo.attribution}
                      </a>
                    ) : (
                      <span>{job.attribution_text || job.source_attribution || providerInfo.attribution}</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {/* LinkedIn External Search Link */}
                    {job.linkedin_search_url && (
                      <a
                        href={job.linkedin_search_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--secondary"
                        style={{ padding: '6px 12px', fontSize: '.78rem', display: 'flex', alignItems: 'center', gap: 5, color: '#0077b5' }}
                        title="Search similar positions on LinkedIn (external search)"
                      >
                        <Globe size={13} />
                        <span>Search on LinkedIn ↗</span>
                      </a>
                    )}

                    {/* Calculation Breakdown Modal Trigger */}
                    <button
                      id={`inspect-math-btn-${job.id}`}
                      className="btn btn--secondary"
                      style={{ padding: '6px 14px', fontSize: '.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
                      onClick={() => setInspectedJob(job)}
                    >
                      <Percent size={14} />
                      <span>Calculation Breakdown</span>
                    </button>

                    {/* View Job / Application Link */}
                    {job.application_url && !job.is_sample ? (
                      <a
                        href={job.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--primary"
                        style={{ padding: '6px 16px', fontSize: '.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <span>Apply / View Listing</span>
                        <ExternalLink size={13} />
                      </a>
                    ) : (
                      <button
                        id={`view-application-btn-${job.id}`}
                        className="btn btn--primary"
                        style={{ padding: '6px 16px', fontSize: '.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
                        onClick={() => setApplicationJob(job)}
                      >
                        <span>Application Info</span>
                        <ExternalLink size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Global Transparency & Educational Disclaimer Banner */}
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
            CareerTwin AI Educational Compatibility Notice & External Links Disclaimer
          </strong>
          Compatibility scores evaluate technical qualification overlap against documented entry-level vacancy
          requirements (50% Core Skills, 20% Secondary Skills, 15% Experience, 5% Education, 10% Role Relevance).
          A high match score represents syllabus and skill alignment, not an employer endorsement or hiring probability.
          Live external listings are provided via public partner APIs (Remotive, Arbeitnow, Adzuna) and direct you
          to third-party employer sites. LinkedIn searches are generated external browser links, not live API results.
        </div>
      </div>

      {/* Modal: Transparent 5-Factor Match Calculation Breakdown */}
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
                maxWidth: 620,
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                border: '1px solid var(--border)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-strong)', margin: 0 }}>
                  Transparent 5-Factor Match Calculation
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

              {/* 5-Factor Point Allocation Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {/* 1. Required Skills */}
                <div style={{ background: 'var(--bg-main, #fafafa)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', fontWeight: 700, marginBottom: 4 }}>
                    <span>1. Required Skills Match (50% Max)</span>
                    <span style={{ color: 'var(--emerald-light, #10b981)' }}>
                      {inspectedJob.score_breakdown?.required_skills_score ?? 0} pts
                    </span>
                  </div>
                  <div style={{ fontSize: '.76rem', color: 'var(--text-sec)' }}>
                    Evaluates candidate fulfillment across mandatory core technical requirements.
                  </div>
                </div>

                {/* 2. Secondary Skills */}
                <div style={{ background: 'var(--bg-main, #fafafa)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', fontWeight: 700, marginBottom: 4 }}>
                    <span>2. Secondary / Preferred Skills (20% Max)</span>
                    <span style={{ color: '#3b82f6' }}>
                      {inspectedJob.score_breakdown?.preferred_skills_score ?? 0} pts
                    </span>
                  </div>
                  <div style={{ fontSize: '.76rem', color: 'var(--text-sec)' }}>
                    Points earned from supplementary tooling and preferred qualifications.
                  </div>
                </div>

                {/* 3. Experience Alignment */}
                <div style={{ background: 'var(--bg-main, #fafafa)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', fontWeight: 700, marginBottom: 4 }}>
                    <span>3. Experience Alignment (15% Max)</span>
                    <span style={{ color: '#8b5cf6' }}>
                      {inspectedJob.score_breakdown?.experience_score ?? inspectedJob.score_breakdown?.affinity_score ?? 0} pts
                    </span>
                  </div>
                  <div style={{ fontSize: '.76rem', color: 'var(--text-sec)' }}>
                    Benchmarked against early-career entry profile expectations (0-24 months).
                  </div>
                </div>

                {/* 4. Education Alignment */}
                <div style={{ background: 'var(--bg-main, #fafafa)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', fontWeight: 700, marginBottom: 4 }}>
                    <span>4. Education & Background Suitability (5% Max)</span>
                    <span style={{ color: '#06b6d4' }}>
                      {inspectedJob.score_breakdown?.education_score ?? 3.5} pts
                    </span>
                  </div>
                  <div style={{ fontSize: '.76rem', color: 'var(--text-sec)' }}>
                    Suitability alignment against role catalog recommended degrees (B.Tech, BCA, MCA, B.Sc CS).
                  </div>
                </div>

                {/* 5. Role Relevance */}
                <div style={{ background: 'var(--bg-main, #fafafa)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', fontWeight: 700, marginBottom: 4 }}>
                    <span>5. Career Goal & Role Relevance (10% Max)</span>
                    <span style={{ color: '#f59e0b' }}>
                      {inspectedJob.score_breakdown?.role_relevance_score ?? 10.0} pts
                    </span>
                  </div>
                  <div style={{ fontSize: '.76rem', color: 'var(--text-sec)' }}>
                    Career goal alignment against your selected target profile in CareerTwin AI.
                  </div>
                </div>
              </div>

              {/* Mathematical Formula String */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 12,
                padding: '12px 16px',
                fontSize: '.78rem',
                color: 'var(--text-strong)',
                fontFamily: 'monospace',
                marginBottom: 20,
              }}>
                {inspectedJob.score_breakdown?.formula}
              </div>

              {/* Recommended Learning Resources for Missing Skills */}
              {inspectedJob.recommended_resources && inspectedJob.recommended_resources.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BookOpen size={15} color="var(--emerald-light, #10b981)" />
                    <span>Recommended Learning Resources for Skill Gaps</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {inspectedJob.recommended_resources.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: 'var(--bg-main, #f9fafb)',
                          border: '1px solid var(--border)',
                          borderRadius: 10,
                          color: 'var(--text-strong)',
                          fontSize: '.82rem',
                          textDecoration: 'none',
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{res.title}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--emerald-light, #10b981)', fontSize: '.75rem' }}>
                          View Resource <ExternalLink size={12} />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={() => setInspectedJob(null)}
                  className="btn btn--primary"
                  style={{ fontSize: '.85rem' }}
                >
                  Close Breakdown
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Academic Benchmark Record Notice (for sample vacancies) */}
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
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-strong)', margin: 0 }}>
                  Academic Demonstration Record
                </h3>
                <button
                  onClick={() => setApplicationJob(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: 14, padding: '14px 18px', marginBottom: 20 }}>
                <p style={{ fontSize: '.84rem', color: 'var(--text-sec)', margin: 0, lineHeight: 1.5 }}>
                  This record (<strong>{applicationJob.title}</strong> at <strong>{applicationJob.company}</strong>) is part of CareerTwin AI&apos;s
                  curated academic evaluation dataset. It is not an active commercial vacancy accepting candidate resumes.
                </p>
              </div>

              <p style={{ fontSize: '.84rem', color: 'var(--text-sec)', marginBottom: 24, lineHeight: 1.5 }}>
                To practice for this role, we recommend visiting the <strong>AI Mock Interview</strong> and <strong>Learning Roadmap</strong> modules,
                or searching active vacancies on LinkedIn or the Live External Jobs tab.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                {applicationJob.linkedin_search_url && (
                  <a
                    href={applicationJob.linkedin_search_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--secondary"
                    style={{ fontSize: '.85rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <span>Search on LinkedIn</span>
                    <ExternalLink size={13} />
                  </a>
                )}
                <button
                  onClick={() => setApplicationJob(null)}
                  className="btn btn--primary"
                  style={{ fontSize: '.85rem' }}
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function JobMatches() {
  return (
    <JobMatchesErrorBoundary>
      <JobMatchesContent />
    </JobMatchesErrorBoundary>
  );
}
