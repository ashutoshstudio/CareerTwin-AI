/**
 * Careers.jsx — Comprehensive 42-Role Career Discovery & Comparison Hub
 * Nordic Emerald Light & Frosted Crystal Glass design system
 */

import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CAREER_PATHS, CAREER_CATEGORIES } from '../data/careerPaths';
import { PersistentShiningDots } from '../components/PersistentShiningDots';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

function Careers() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [comparedSlugs, setComparedSlugs] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [settingRoleSlug, setSettingRoleSlug] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: CAREER_PATHS.length };
    CAREER_PATHS.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered roles
  const filteredRoles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CAREER_PATHS.filter((role) => {
      const matchesCategory =
        selectedCategory === 'All' || role.category === selectedCategory;
      const matchesSearch =
        !q ||
        role.title.toLowerCase().includes(q) ||
        role.tagline.toLowerCase().includes(q) ||
        role.skills.some((s) => s.toLowerCase().includes(q)) ||
        role.tools.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleCompare = (slug, e) => {
    e.preventDefault();
    e.stopPropagation();
    setComparedSlugs((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((s) => s !== slug);
      }
      if (prev.length >= 2) {
        return [prev[1], slug];
      }
      return [...prev, slug];
    });
  };

  const handleSetTargetRole = async (roleTitle, slug) => {
    if (!token) {
      navigate('/login');
      return;
    }
    setSettingRoleSlug(slug);
    setFeedbackMsg('');
    try {
      await api.updateProfile({ target_role: roleTitle }, token);
      setFeedbackMsg(`"${roleTitle}" set as your target role!`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      setFeedbackMsg(`Failed to set role: ${err.message || 'Server error'}`);
    } finally {
      setSettingRoleSlug(null);
    }
  };

  const comparedRoles = useMemo(() => {
    return comparedSlugs
      .map((slug) => CAREER_PATHS.find((p) => p.slug === slug))
      .filter(Boolean);
  }, [comparedSlugs]);

  return (
    <div id="page-careers" className="careers-page" style={{ position: 'relative', minHeight: '100vh', paddingBottom: 100 }}>
      <PersistentShiningDots count={40} />

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ paddingTop: 32, marginBottom: 28, textAlign: 'center' }}
        >
          <div className="section__tag">Career Explorer & Role Catalog</div>
          <h1 className="section__title" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, marginTop: 8 }}>
            Explore <strong>40+ In-Demand</strong> Technology Roles
          </h1>
          <p className="section__subtitle" style={{ maxWidth: 720, margin: '12px auto 0', color: 'var(--text-muted)' }}>
            Discover industry-benchmarked entry-level career trajectories across 9 domains.
            Search, filter, compare paths side-by-side, or select your target career goal.
          </p>
        </motion.div>

        {/* Global Feedback Banner */}
        <AnimatePresence>
          {feedbackMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                maxWidth: 600,
                margin: '0 auto 20px',
                padding: '12px 20px',
                borderRadius: 12,
                background: 'rgba(20, 184, 166, 0.12)',
                border: '1px solid rgba(20, 184, 166, 0.3)',
                color: '#0f766e',
                fontWeight: 600,
                fontSize: '0.88rem',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(20, 184, 166, 0.08)',
              }}
            >
              ✓ {feedbackMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Filter Bar */}
        <div style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '24px',
          marginBottom: 32,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <span style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '1.1rem',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}>
              🔍
            </span>
            <input
              type="text"
              id="career-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title (e.g. Python Developer, DevOps, Cloud), skill (React, SQL, Docker), or tool..."
              style={{
                width: '100%',
                padding: '14px 44px 14px 46px',
                borderRadius: 14,
                border: '1px solid var(--border)',
                background: 'var(--bg, #f8fafc)',
                color: 'var(--text-strong, #0f172a)',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  padding: 4,
                }}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Pill Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: 4 }}>
              Category:
            </span>
            {CAREER_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    fontSize: '0.82rem',
                    fontWeight: isActive ? 600 : 500,
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(20, 184, 166, 0.16), rgba(16, 185, 129, 0.12))'
                      : 'var(--bg, #f1f5f9)',
                    color: isActive ? '#0d9488' : 'var(--text-muted, #64748b)',
                    border: isActive
                      ? '1px solid rgba(20, 184, 166, 0.4)'
                      : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{cat}</span>
                  <span style={{
                    fontSize: '0.72rem',
                    opacity: 0.8,
                    background: isActive ? 'rgba(20, 184, 166, 0.2)' : 'rgba(0,0,0,0.06)',
                    padding: '1px 6px',
                    borderRadius: 8,
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Results Summary & Reset */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 18,
            paddingTop: 14,
            borderTop: '1px solid var(--border)',
            fontSize: '0.84rem',
            color: 'var(--text-muted)',
          }}>
            <div>
              Showing <strong>{filteredRoles.length}</strong> of {CAREER_PATHS.length} career paths
              {selectedCategory !== 'All' && <span> in <em>{selectedCategory}</em></span>}
              {searchQuery && <span> matching "<em>{searchQuery}</em>"</span>}
            </div>
            {(selectedCategory !== 'All' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary, #0d9488)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Roles Grid */}
        {filteredRoles.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--bg-card, #ffffff)',
            borderRadius: 20,
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔍</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 8 }}>
              No roles matched your search
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 440, margin: '0 auto 20px' }}>
              We could not find any career profile matching your current criteria. Try clearing search filters or browsing by category.
            </p>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
            >
              View All 40+ Profiles
            </button>
          </div>
        ) : (
          <div className="careers-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24,
          }}>
            {filteredRoles.map((c, i) => {
              const isCompared = comparedSlugs.includes(c.slug);
              return (
                <motion.div
                  key={c.slug}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.3) }}
                  whileHover={{ y: -4 }}
                  style={{ height: '100%' }}
                >
                  <div
                    className="career-card"
                    id={`careers-card-${c.slug}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      background: 'var(--bg-card, #ffffff)',
                      border: isCompared
                        ? '2px solid rgba(20, 184, 166, 0.7)'
                        : '1px solid var(--border)',
                      borderRadius: 18,
                      padding: 24,
                      position: 'relative',
                      boxShadow: isCompared
                        ? '0 8px 24px rgba(20, 184, 166, 0.12)'
                        : '0 4px 16px rgba(0, 0, 0, 0.02)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Top Row: Icon, Category & Demand */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.8rem' }}>{c.icon}</span>
                        <div>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            color: 'var(--text-muted)',
                            display: 'block',
                          }}>
                            {c.category}
                          </span>
                          <span style={{
                            display: 'inline-block',
                            marginTop: 2,
                            padding: '2px 8px',
                            background: 'rgba(20, 184, 166, 0.08)',
                            borderRadius: 6,
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: 'var(--primary-light, #0d9488)',
                          }}>
                            {c.demand}
                          </span>
                        </div>
                      </div>

                      {/* Compare Checkbox Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleCompare(c.slug, e)}
                        title={isCompared ? 'Remove from comparison' : 'Compare with another role'}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 8,
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: isCompared ? 'rgba(20, 184, 166, 0.15)' : 'var(--bg, #f1f5f9)',
                          color: isCompared ? '#0f766e' : 'var(--text-muted, #64748b)',
                          border: isCompared ? '1px solid rgba(20, 184, 166, 0.4)' : '1px solid transparent',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isCompared ? '✓ Compared' : '+ Compare'}
                      </button>
                    </div>

                    {/* Title */}
                    <h2 style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: 'var(--text-strong, #0f172a)',
                      marginBottom: 8,
                      lineHeight: 1.3,
                    }}>
                      <Link
                        to={`/careers/${c.slug}`}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        {c.title}
                      </Link>
                    </h2>

                    {/* Tagline */}
                    <p style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-sec, #475569)',
                      marginBottom: 16,
                      lineHeight: 1.5,
                      flexGrow: 1,
                    }}>
                      {c.tagline}
                    </p>

                    {/* Core Skills Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                      {c.skills.slice(0, 4).map((sk) => (
                        <span
                          key={sk}
                          style={{
                            padding: '3px 9px',
                            background: 'var(--bg, #f8fafc)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            fontSize: '0.72rem',
                            color: 'var(--text-muted, #64748b)',
                            fontWeight: 500,
                          }}
                        >
                          {sk}
                        </span>
                      ))}
                      {c.skills.length > 4 && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '3px 4px' }}>
                          +{c.skills.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Salary & Action Row */}
                    <div style={{
                      paddingTop: 12,
                      borderTop: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Avg. Salary
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-strong)' }}>
                          {c.avgSalary}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {user && (
                          <button
                            type="button"
                            onClick={() => handleSetTargetRole(c.title, c.slug)}
                            disabled={settingRoleSlug === c.slug}
                            title="Set this as your target career role"
                            style={{
                              background: 'transparent',
                              border: '1px solid rgba(20, 184, 166, 0.3)',
                              color: '#0d9488',
                              borderRadius: 8,
                              padding: '5px 10px',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {settingRoleSlug === c.slug ? 'Setting...' : 'Set Goal'}
                          </button>
                        )}

                        <Link
                          to={`/careers/${c.slug}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.78rem',
                            color: 'var(--primary, #0d9488)',
                            fontWeight: 600,
                            textDecoration: 'none',
                          }}
                        >
                          Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Floating Compare Drawer / Dock */}
        <AnimatePresence>
          {comparedSlugs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              style={{
                position: 'fixed',
                bottom: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(20, 184, 166, 0.4)',
                borderRadius: 20,
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                zIndex: 100,
                maxWidth: '90vw',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-strong)' }}>
                  Compare Roles ({comparedSlugs.length}/2):
                </span>
                {comparedRoles.map((r) => (
                  <span
                    key={r.slug}
                    style={{
                      background: 'rgba(20, 184, 166, 0.1)',
                      border: '1px solid rgba(20, 184, 166, 0.3)',
                      color: '#0f766e',
                      padding: '4px 10px',
                      borderRadius: 10,
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {r.icon} {r.title}
                    <button
                      type="button"
                      onClick={() => setComparedSlugs((prev) => prev.filter((s) => s !== r.slug))}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0f766e',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '0.8rem',
                        lineHeight: 1,
                      }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowCompareModal(true)}
                  disabled={comparedRoles.length < 2}
                  style={{
                    background: comparedRoles.length === 2
                      ? 'linear-gradient(135deg, #0d9488, #10b981)'
                      : '#cbd5e1',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '8px 16px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: comparedRoles.length === 2 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {comparedRoles.length === 2 ? 'Compare Now →' : 'Select 2nd Role'}
                </button>

                <button
                  type="button"
                  onClick={() => setComparedSlugs([])}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Side-by-Side Comparison Modal */}
        <AnimatePresence>
          {showCompareModal && comparedRoles.length === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                zIndex: 1000,
              }}
              onClick={() => setShowCompareModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                style={{
                  background: 'var(--bg-card, #ffffff)',
                  borderRadius: 24,
                  maxWidth: 960,
                  width: '100%',
                  maxHeight: '88vh',
                  overflowY: 'auto',
                  padding: '32px 36px',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
                  border: '1px solid var(--border)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-strong)', margin: 0 }}>
                      Career Path Side-by-Side Comparison
                    </h2>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                      Benchmarking core requirements, expected compensations, and foundational project scopes
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCompareModal(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.4rem',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* 2-Column Comparison Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {comparedRoles.map((role) => (
                    <div
                      key={role.slug}
                      style={{
                        background: 'var(--bg, #f8fafc)',
                        border: '1px solid var(--border)',
                        borderRadius: 18,
                        padding: 24,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <span style={{ fontSize: '2rem' }}>{role.icon}</span>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                            {role.category}
                          </div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-strong)', margin: 0 }}>
                            {role.title}
                          </h3>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.84rem', color: 'var(--text-sec)', lineHeight: 1.5, marginBottom: 16 }}>
                        {role.tagline}
                      </p>

                      {/* Key Stats */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 12,
                        background: 'var(--bg-card, #ffffff)',
                        padding: 12,
                        borderRadius: 12,
                        border: '1px solid var(--border)',
                        marginBottom: 16,
                      }}>
                        <div>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Salary</span>
                          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary, #0d9488)' }}>{role.avgSalary}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Market Demand</span>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-strong)' }}>{role.demand}</div>
                        </div>
                      </div>

                      {/* Core Skills Required */}
                      <div style={{ marginBottom: 16 }}>
                        <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 8 }}>
                          Core Benchmark Skills
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {role.skills.map((s) => (
                            <span
                              key={s}
                              style={{
                                padding: '4px 10px',
                                background: 'rgba(20, 184, 166, 0.1)',
                                border: '1px solid rgba(20, 184, 166, 0.25)',
                                color: '#0f766e',
                                borderRadius: 8,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Tools & Technologies */}
                      <div style={{ marginBottom: 16 }}>
                        <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 8 }}>
                          Industry Tools
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {role.tools.map((t) => (
                            <span
                              key={t}
                              style={{
                                padding: '3px 8px',
                                background: 'var(--bg-card, #ffffff)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-muted)',
                                borderRadius: 6,
                                fontSize: '0.72rem',
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Capstone Project */}
                      {role.recommended_projects && role.recommended_projects.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                          <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 6 }}>
                            Recommended Beginner Capstone
                          </h4>
                          <p style={{
                            fontSize: '0.78rem',
                            color: 'var(--text-sec)',
                            background: 'var(--bg-card, #ffffff)',
                            padding: '10px 12px',
                            borderRadius: 8,
                            border: '1px solid var(--border)',
                            margin: 0,
                            lineHeight: 1.4,
                          }}>
                            📌 {role.recommended_projects[0]}
                          </p>
                        </div>
                      )}

                      {/* Modal Action Buttons */}
                      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                        {user && (
                          <button
                            type="button"
                            onClick={() => handleSetTargetRole(role.title, role.slug)}
                            disabled={settingRoleSlug === role.slug}
                            style={{
                              flex: 1,
                              padding: '10px 14px',
                              borderRadius: 10,
                              border: 'none',
                              background: 'linear-gradient(135deg, #0d9488, #10b981)',
                              color: '#ffffff',
                              fontWeight: 600,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                            }}
                          >
                            {settingRoleSlug === role.slug ? 'Setting...' : 'Set as My Goal'}
                          </button>
                        )}
                        <Link
                          to={`/careers/${role.slug}`}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 10,
                            border: '1px solid var(--border)',
                            background: 'var(--bg-card, #ffffff)',
                            color: 'var(--text-strong)',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            textAlign: 'center',
                          }}
                        >
                          View Full Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            textAlign: 'center',
            padding: '50px 0 20px',
            borderTop: '1px solid var(--border)',
            marginTop: 60,
          }}
        >
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-strong)', marginBottom: 10 }}>
            Uncertain which role aligns best with your existing skill set?
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
            Upload your resume or run our comprehensive multi-module Career Readiness assessment.
          </p>
          <Link to="/career-readiness" className="btn btn--primary">
            Run Career Readiness Assessment →
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default Careers;
