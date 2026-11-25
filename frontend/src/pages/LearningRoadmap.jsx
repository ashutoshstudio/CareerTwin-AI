import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Target,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Award,
  AlertCircle,
  Compass,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';

function LearningRoadmap() {
  const { token } = useAuth();

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(token));
  const [regenerating, setRegenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'in_progress' | 'completed'
  const [expandedWeeks, setExpandedWeeks] = useState(new Set([1, 2]));

  // Load roadmap on mount
  useEffect(() => {
    let ignore = false;
    if (!token) return;

    async function fetchRoadmap() {
      try {
        setErrorMsg(null);
        const data = await api.getRoadmap(token);
        if (!ignore && data) {
          setRoadmap(data);
          // Expand current week and week 1 by default
          const initialExpanded = new Set([1]);
          if (data.current_week) initialExpanded.add(data.current_week);
          setExpandedWeeks(initialExpanded);
        }
      } catch (err) {
        if (!ignore) {
          setErrorMsg(err.message || 'Unable to load personalized learning roadmap.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchRoadmap();
    return () => {
      ignore = true;
    };
  }, [token]);

  // Handle regeneration
  const handleRegenerate = useCallback(async () => {
    if (!token || regenerating) return;
    try {
      setRegenerating(true);
      setErrorMsg(null);
      const updated = await api.generateRoadmap({}, token);
      setRoadmap(updated);
      const newExpanded = new Set([1]);
      if (updated.current_week) newExpanded.add(updated.current_week);
      setExpandedWeeks(newExpanded);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to regenerate roadmap from latest skill gaps.');
    } finally {
      setRegenerating(false);
    }
  }, [token, regenerating]);

  // Handle topic checklist item toggle
  const handleToggleItem = useCallback(
    async (itemId, isCompleted) => {
      if (!token || togglingId) return;
      try {
        setTogglingId(itemId);
        // Optimistic UI update
        setRoadmap((prev) => {
          if (!prev) return prev;
          let totalItems = 0;
          let completedItems = 0;
          const updatedWeeks = prev.weeks.map((w) => {
            const updatedItems = w.items.map((it) => {
              const done = it.id === itemId ? isCompleted : it.is_completed;
              if (done) completedItems += 1;
              totalItems += 1;
              return { ...it, is_completed: done };
            });
            return {
              ...w,
              items: updatedItems,
              is_completed: updatedItems.length > 0 && updatedItems.every((it) => it.is_completed),
            };
          });

          const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 1000) / 10 : 0;
          return {
            ...prev,
            weeks: updatedWeeks,
            total_items: totalItems,
            completed_items: completedItems,
            completion_percentage: pct,
          };
        });

        // Persist to SQLite backend
        const serverRoadmap = await api.toggleRoadmapItem(
          { item_id: itemId, is_completed: isCompleted },
          token
        );
        setRoadmap(serverRoadmap);
      } catch (err) {
        setErrorMsg('Failed to update topic progress: ' + err.message);
      } finally {
        setTogglingId(null);
      }
    },
    [token, togglingId]
  );

  // Toggle week accordion
  const toggleWeekExpand = useCallback((weekNum) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNum)) {
        next.delete(weekNum);
      } else {
        next.add(weekNum);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    if (!roadmap?.weeks) return;
    setExpandedWeeks(new Set(roadmap.weeks.map((w) => w.week_number)));
  }, [roadmap]);

  const collapseAll = useCallback(() => {
    setExpandedWeeks(new Set());
  }, []);

  // Filtered weeks
  let filteredWeeks = roadmap?.weeks || [];
  if (filterStatus === 'completed') {
    filteredWeeks = filteredWeeks.filter((w) => w.is_completed);
  } else if (filterStatus === 'in_progress') {
    filteredWeeks = filteredWeeks.filter((w) => !w.is_completed);
  }

  // Derived metrics
  const totalHours = roadmap?.weeks?.reduce((acc, w) => acc + (w.estimated_hours || 0), 0) || 0;
  const completedWeeks = roadmap?.weeks?.filter((w) => w.is_completed).length || 0;

  let nextTask = null;
  if (roadmap?.weeks) {
    for (const w of roadmap.weeks) {
      for (const it of (w.items || [])) {
        if (!it.is_completed) {
          nextTask = {
            weekNumber: w.week_number,
            weekTitle: w.title,
            topic: it,
            milestone: w.milestone,
          };
          break;
        }
      }
      if (nextTask) break;
    }
  }

  // Loading state
  if (loading) {
    return (
      <div id="page-learning-roadmap" className="page" style={{ padding: '60px 0', textAlign: 'center' }}>
        <Loading message="Synthesizing personalized learning plan from your verified skill gaps..." />
      </div>
    );
  }

  // Error state
  if (errorMsg && !roadmap) {
    return (
      <div id="page-learning-roadmap" className="page" style={{ maxWidth: 640, margin: '40px auto', textAlign: 'center' }}>
        <div style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 20,
          padding: '36px 32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}>
          <AlertTriangle size={36} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-strong)', marginBottom: 8 }}>
            Unable to Load Roadmap
          </h2>
          <p style={{ fontSize: '.88rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            {errorMsg}
          </p>
          <button
            onClick={() => {
              setLoading(true);
              api.getRoadmap(token).then(setRoadmap).catch((e) => setErrorMsg(e.message)).finally(() => setLoading(false));
            }}
            className="btn btn--primary"
            style={{ padding: '9px 20px', fontSize: '.85rem' }}
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  // Empty onboarding state
  if (!roadmap || !roadmap.weeks || roadmap.weeks.length === 0) {
    return (
      <div id="page-learning-roadmap" className="page" style={{ maxWidth: 740, margin: '40px auto', textAlign: 'center' }}>
        <div style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '48px 32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}>
          <div style={{
            width: 54,
            height: 54,
            borderRadius: 16,
            background: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--emerald)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Compass size={28} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-strong)', marginBottom: 8 }}>
            No Learning Roadmap Generated Yet
          </h2>
          <p style={{ fontSize: '.9rem', color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto 24px', lineHeight: 1.6 }}>
            Generate your personalized, week-by-week curriculum tailored directly to your benchmark skill gaps for your desired career role.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="btn btn--primary"
              style={{ padding: '10px 22px', fontSize: '.88rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <Sparkles size={16} />
              <span>{regenerating ? 'Generating Roadmap...' : 'Generate Initial Roadmap'}</span>
            </button>
            <Link
              to="/profile"
              className="btn btn--outline"
              style={{ padding: '10px 20px', fontSize: '.88rem' }}
            >
              Update Target Role
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const targetRole = roadmap.target_role || 'Selected Career';
  const pct = Math.round(roadmap.completion_percentage || 0);

  return (
    <div id="page-learning-roadmap" className="page" style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 60 }}>
      {/* ── Top Header ───────────────────────────────────────── */}
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
              Personalized Learning Roadmap
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
              <Target size={12} />
              {targetRole}
            </span>
          </div>
          <div className="page-subtitle" style={{ margin: 0 }}>
            Structured week-by-week curriculum engineered from your verified skill gaps to achieve benchmark readiness for {targetRole}.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
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
            <RefreshCw size={14} className={regenerating ? 'animate-spin' : ''} />
            <span>{regenerating ? 'Syncing...' : 'Sync with Skill Gap'}</span>
          </button>
        </div>
      </div>

      {/* ── Notification Banner ─────────────────────────────── */}
      <AnimatePresence>
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
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontWeight: 600,
              fontSize: '.88rem',
            }}
          >
            <AlertCircle size={18} />
            <div style={{ flex: 1 }}>{errorMsg}</div>
            <button
              onClick={() => setErrorMsg(null)}
              style={{ background: 'none', border: 'none', color: '#f87171', fontWeight: 700, cursor: 'pointer', fontSize: '.82rem' }}
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4 High-Level Metric Cards ────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {/* Metric 1: Completion */}
        <div style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '20px 18px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Progress
            </span>
            <span style={{
              fontSize: '.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 99,
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#059669',
            }}>
              {pct}% Done
            </span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--emerald)', marginTop: 4 }}>
            {pct}%
          </div>
          <div style={{ width: '100%', height: 6, background: 'rgba(15, 23, 42, 0.08)', borderRadius: 99, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--grad-emerald)', borderRadius: 99, transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
            {roadmap.completed_items} of {roadmap.total_items} actionable topics completed
          </div>
        </div>

        {/* Metric 2: Active Week */}
        <div style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '20px 18px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Current Phase
            </span>
            <Clock size={16} color="var(--emerald)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-strong)', marginTop: 4 }}>
            Week {roadmap.current_week}
            <span style={{ fontSize: '.88rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: 4 }}>/ {roadmap.total_weeks}</span>
          </div>
          <div style={{ fontSize: '.75rem', color: 'var(--emerald)', fontWeight: 600, marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {roadmap.weeks?.[roadmap.current_week - 1]?.title || 'Active Curriculum Phase'}
          </div>
          <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {roadmap.total_weeks - completedWeeks} weeks remaining
          </div>
        </div>

        {/* Metric 3: Total Study Hours */}
        <div style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '20px 18px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Estimated Effort
            </span>
            <BookOpen size={16} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-strong)', marginTop: 4 }}>
            ~{totalHours} hrs
          </div>
          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
            ~{Math.round(totalHours / (roadmap.total_weeks || 1))} hrs/week recommended
          </div>
          <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Theory, practice & capstone
          </div>
        </div>

        {/* Metric 4: Milestones */}
        <div style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '20px 18px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Milestones
            </span>
            <Award size={16} color="var(--emerald)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--emerald)', marginTop: 4 }}>
            {completedWeeks}
            <span style={{ fontSize: '.88rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: 4 }}>/ {roadmap.total_weeks}</span>
          </div>
          <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
            {completedWeeks === roadmap.total_weeks ? 'All milestones fulfilled!' : `${roadmap.total_weeks - completedWeeks} milestones pending`}
          </div>
          <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Validated by hands-on labs
          </div>
        </div>
      </div>

      {/* ── Immediate Next Action Card ──────────────────────── */}
      {nextTask && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.28)',
          borderRadius: 18,
          padding: '20px 24px',
          marginBottom: 28,
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--emerald)',
              flexShrink: 0,
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recommended Next Step (Week {nextTask.weekNumber})
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-strong)', marginTop: 2 }}>
                {nextTask.topic.title}
              </div>
              <div style={{ fontSize: '.84rem', color: 'var(--text)', marginTop: 2, maxWidth: 600 }}>
                {nextTask.topic.description}
              </div>
            </div>
          </div>

          <button
            onClick={() => handleToggleItem(nextTask.topic.id, true)}
            disabled={Boolean(togglingId)}
            className="btn btn--primary"
            style={{ padding: '8px 18px', fontSize: '.82rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <CheckCircle2 size={15} />
            <span>Mark Complete</span>
          </button>
        </div>
      )}

      {/* ── Timeline Filters & Controls ──────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
        paddingBottom: 14,
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: 4 }}>
            Filter:
          </span>
          <button
            onClick={() => setFilterStatus('all')}
            style={{
              padding: '5px 14px',
              borderRadius: 99,
              fontSize: '.78rem',
              fontWeight: 700,
              border: '1px solid var(--border)',
              cursor: 'pointer',
              background: filterStatus === 'all' ? 'var(--grad-emerald)' : 'var(--bg-card, #ffffff)',
              color: filterStatus === 'all' ? '#ffffff' : 'var(--text)',
            }}
          >
            All Weeks ({roadmap.weeks.length})
          </button>
          <button
            onClick={() => setFilterStatus('in_progress')}
            style={{
              padding: '5px 14px',
              borderRadius: 99,
              fontSize: '.78rem',
              fontWeight: 700,
              border: '1px solid var(--border)',
              cursor: 'pointer',
              background: filterStatus === 'in_progress' ? 'var(--grad-emerald)' : 'var(--bg-card, #ffffff)',
              color: filterStatus === 'in_progress' ? '#ffffff' : 'var(--text)',
            }}
          >
            Pending ({roadmap.weeks.filter((w) => !w.is_completed).length})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            style={{
              padding: '5px 14px',
              borderRadius: 99,
              fontSize: '.78rem',
              fontWeight: 700,
              border: '1px solid var(--border)',
              cursor: 'pointer',
              background: filterStatus === 'completed' ? 'var(--grad-emerald)' : 'var(--bg-card, #ffffff)',
              color: filterStatus === 'completed' ? '#ffffff' : 'var(--text)',
            }}
          >
            Completed ({completedWeeks})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.8rem' }}>
          <button onClick={expandAll} style={{ background: 'none', border: 'none', color: 'var(--emerald)', fontWeight: 600, cursor: 'pointer' }}>
            Expand All
          </button>
          <span style={{ color: 'var(--border)' }}>•</span>
          <button onClick={collapseAll} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}>
            Collapse All
          </button>
        </div>
      </div>

      {/* ── Weekly Curriculum Accordion ──────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredWeeks.map((week) => {
          const isExpanded = expandedWeeks.has(week.week_number);
          const isCurrent = week.week_number === roadmap.current_week && !week.is_completed;
          const weekCompletedCount = week.items.filter((it) => it.is_completed).length;

          return (
            <div
              key={week.week_number}
              style={{
                background: 'var(--bg-card, #ffffff)',
                border: week.is_completed
                  ? '1px solid rgba(16, 185, 129, 0.35)'
                  : isCurrent
                  ? '1px solid var(--border-glow, rgba(16, 185, 129, 0.55))'
                  : '1px solid var(--border)',
                borderRadius: 18,
                boxShadow: isCurrent ? '0 4px 20px rgba(16, 185, 129, 0.08)' : '0 4px 18px rgba(0,0,0,0.03)',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Week Header */}
              <div
                onClick={() => toggleWeekExpand(week.week_number)}
                style={{
                  padding: '20px 24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 14,
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: week.is_completed
                      ? 'rgba(16, 185, 129, 0.12)'
                      : isCurrent
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'var(--bg-2, #f1f5f9)',
                    color: week.is_completed ? '#059669' : isCurrent ? 'var(--emerald)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '.85rem',
                    flexShrink: 0,
                  }}>
                    {week.is_completed ? <CheckCircle2 size={20} /> : `W${week.week_number}`}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Week {week.week_number}
                      </span>
                      {week.is_completed && (
                        <span style={{ fontSize: '.68rem', fontWeight: 700, padding: '1px 8px', borderRadius: 99, background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
                          Completed
                        </span>
                      )}
                      {isCurrent && (
                        <span style={{ fontSize: '.68rem', fontWeight: 700, padding: '1px 8px', borderRadius: 99, background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7' }}>
                          Active Phase
                        </span>
                      )}
                      <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>
                        &bull; {week.estimated_hours} hrs
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-strong)', margin: 0 }}>
                      {week.title}
                    </h3>
                    <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {week.focus_area}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text-strong)' }}>
                      {weekCompletedCount} / {week.items.length} Done
                    </div>
                    <div style={{ width: 80, height: 5, background: 'rgba(15, 23, 42, 0.08)', borderRadius: 99, marginTop: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${week.items.length > 0 ? (weekCompletedCount / week.items.length) * 100 : 0}%`,
                          height: '100%',
                          background: week.is_completed ? '#10b981' : 'var(--grad-emerald)',
                          borderRadius: 99,
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ color: 'var(--text-muted)' }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </div>

              {/* Collapsible Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                      {/* Milestone Target */}
                      <div style={{
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        borderRadius: 12,
                        padding: '10px 16px',
                        marginBottom: 16,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        fontSize: '.82rem',
                        color: 'var(--text)',
                      }}>
                        <Award size={16} color="#d97706" style={{ flexShrink: 0 }} />
                        <div>
                          <strong style={{ color: '#b45309' }}>Milestone Target: </strong>
                          {week.milestone}
                        </div>
                      </div>

                      {/* Targeted Skills Tags */}
                      {week.skills && week.skills.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                          <span style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: 4 }}>
                            Targeted Skills:
                          </span>
                          {week.skills.map((s, idx) => (
                            <span
                              key={idx}
                              style={{
                                display: 'inline-block',
                                padding: '3px 10px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.25)',
                                color: 'var(--emerald)',
                                borderRadius: 99,
                                fontSize: '.74rem',
                                fontWeight: 600,
                              }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Checklist Items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {week.items.map((item) => {
                          const isDone = item.is_completed;
                          const isBusy = togglingId === item.id;

                          return (
                            <div
                              key={item.id}
                              style={{
                                background: isDone ? 'rgba(16, 185, 129, 0.04)' : '#ffffff',
                                border: isDone ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border)',
                                borderRadius: 14,
                                padding: '14px 18px',
                                transition: 'all 0.2s',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleItem(item.id, !isDone);
                                  }}
                                  disabled={isBusy}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    marginTop: 2,
                                    color: isDone ? 'var(--emerald)' : 'var(--text-muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                  title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                                >
                                  {isDone ? (
                                    <CheckCircle2 size={19} color="var(--emerald)" />
                                  ) : (
                                    <Circle size={19} color="var(--text-muted)" />
                                  )}
                                </button>

                                <div style={{ flex: 1 }}>
                                  <div style={{
                                    fontSize: '.9rem',
                                    fontWeight: 700,
                                    color: isDone ? 'var(--text-muted)' : 'var(--text-strong)',
                                    textDecoration: isDone ? 'line-through' : 'none',
                                  }}>
                                    {item.title}
                                  </div>
                                  <div style={{ fontSize: '.82rem', color: 'var(--text)', marginTop: 2, lineHeight: 1.5 }}>
                                    {item.description}
                                  </div>

                                  {/* Free Resources */}
                                  {item.resources && item.resources.length > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                                      <span style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                        Resources:
                                      </span>
                                      {item.resources.map((res, rIdx) => (
                                        <a
                                          key={rIdx}
                                          href={res.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            padding: '2px 8px',
                                            borderRadius: 6,
                                            background: 'rgba(16, 185, 129, 0.08)',
                                            border: '1px solid rgba(16, 185, 129, 0.22)',
                                            color: 'var(--emerald)',
                                            fontSize: '.72rem',
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                          }}
                                        >
                                          <span>{res.title}</span>
                                          <ExternalLink size={11} />
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LearningRoadmap;
