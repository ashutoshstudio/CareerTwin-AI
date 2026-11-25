/**
 * CareerDetail.jsx — Dynamic detail page for each career path
 * Route: /careers/:slug
 * Uses CAREER_PATHS data from src/data/careerPaths.js
 */

import { useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { CAREER_PATHS } from '../data/careerPaths';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

function CareerDetail() {
  const { slug } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [settingGoal, setSettingGoal] = useState(false);
  const [goalFeedback, setGoalFeedback] = useState('');

  const career = CAREER_PATHS.find((c) => c.slug === slug);

  /* Redirect to /careers if slug not found */
  if (!career) return <Navigate to="/careers" replace />;

  const handleSetTargetGoal = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setSettingGoal(true);
    setGoalFeedback('');
    try {
      await api.updateProfile({ target_role: career.title }, token);
      setGoalFeedback(`✓ "${career.title}" set as your target career goal!`);
      setTimeout(() => setGoalFeedback(''), 4000);
    } catch (err) {
      setGoalFeedback(`Failed to update goal: ${err.message || 'Server error'}`);
    } finally {
      setSettingGoal(false);
    }
  };

  return (
    <div id={`page-career-${slug}`} style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: '100px' }}>

      {/* ── Breadcrumb ───────────────────────────────────────── */}
      <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: 32 }}>
          <Link to="/" style={{ color: 'var(--primary-light)' }}>Home</Link>
          <span>/</span>
          <Link to="/careers" style={{ color: 'var(--primary-light)' }}>Careers</Link>
          <span>/</span>
          <span>{career.title}</span>
        </div>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '40px 48px',
          marginBottom: 32,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 24,
        }}>
          <div>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>{career.icon}</div>
            <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 900, color: 'var(--text-strong)', marginBottom: 8, letterSpacing: '-0.02em' }}>
              {career.title}
            </h1>
            <p style={{ color: 'var(--text)', fontSize: '1.05rem', maxWidth: 560, lineHeight: 1.7, marginBottom: 16 }}>
              {career.tagline}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
              <span style={{
                display: 'inline-block',
                padding: '5px 16px',
                background: 'rgba(20,184,166,.1)',
                border: '1px solid rgba(20,184,166,.25)',
                borderRadius: 999,
                fontSize: '.8rem',
                fontWeight: 600,
                color: 'var(--primary-light)',
              }}>
                {career.demand} demand
              </span>

              {user ? (
                <button
                  type="button"
                  onClick={handleSetTargetGoal}
                  disabled={settingGoal}
                  style={{
                    padding: '6px 16px',
                    background: 'linear-gradient(135deg, #0d9488, #10b981)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 999,
                    fontSize: '.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(13, 148, 136, 0.2)',
                  }}
                >
                  {settingGoal ? 'Setting...' : '🎯 Set as My Target Goal'}
                </button>
              ) : (
                <Link
                  to="/register"
                  style={{
                    padding: '6px 16px',
                    background: 'rgba(20, 184, 166, 0.1)',
                    border: '1px solid rgba(20, 184, 166, 0.3)',
                    color: '#0d9488',
                    borderRadius: 999,
                    fontSize: '.8rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Sign Up to Track This Goal →
                </Link>
              )}
            </div>

            {goalFeedback && (
              <div style={{ marginTop: 10, fontSize: '.82rem', color: '#0d9488', fontWeight: 600 }}>
                {goalFeedback}
              </div>
            )}
          </div>
          <div style={{
            background: 'rgba(20,184,166,.08)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '24px 32px',
            textAlign: 'center',
            minWidth: 180,
          }}>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Avg. Salary</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary-light)' }}>{career.avgSalary}</div>
            <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{career.salaryRange}</div>
          </div>
        </div>

        {/* ── 2-column grid ────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>

          {/* Overview */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '32px 36px', gridColumn: '1 / -1' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 14 }}>📖 Role Overview</h2>
            <p style={{ color: 'var(--text)', lineHeight: 1.8, fontSize: '.95rem' }}>{career.overview}</p>
          </div>

          {/* Skills Required */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '32px 36px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 20 }}>🧠 Skills Required</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {career.skillsDetailed.map((sk) => (
                <div key={sk.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-strong)', fontSize: '.9rem' }}>{sk.name}</span>
                    <span style={{
                      padding: '2px 10px',
                      borderRadius: 99,
                      fontSize: '.68rem',
                      fontWeight: 700,
                      ...(sk.level === 'Expert'
                        ? { background: 'rgba(20,184,166,.15)', color: '#2dd4bf', border: '1px solid rgba(20,184,166,.3)' }
                        : sk.level === 'Intermediate'
                        ? { background: 'rgba(139,92,246,.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,.3)' }
                        : { background: 'rgba(245,158,11,.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,.3)' }),
                    }}>
                      {sk.level}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '.8rem', lineHeight: 1.6 }}>{sk.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Roadmap */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '32px 36px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 20 }}>🗺️ Learning Roadmap</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {career.roadmap.map((step, i) => (
                <div key={step.month} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', paddingBottom: 18 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '.7rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    {i < career.roadmap.length - 1 && (
                      <div style={{ width: 2, flex: 1, background: 'var(--border)', minHeight: 20 }} />
                    )}
                  </div>
                  <div style={{ paddingTop: 6 }}>
                    <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--primary-light)', letterSpacing: '.04em', marginBottom: 2 }}>{step.month}</div>
                    <div style={{ color: 'var(--text)', fontSize: '.875rem', lineHeight: 1.5 }}>{step.focus}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom row ───────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 48 }}>

          {/* Job Roles */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 30px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 16 }}>💼 Job Roles</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {career.roles.map((role) => (
                <div key={role} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  color: 'var(--text)', fontSize: '.85rem',
                }}>
                  <span style={{ color: 'var(--primary-light)' }}>→</span> {role}
                </div>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 30px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 16 }}>🔧 Key Tools</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {career.tools.map((tool) => (
                <span key={tool} style={{
                  padding: '4px 12px',
                  background: 'rgba(20,184,166,.08)',
                  border: '1px solid rgba(20,184,166,.18)',
                  borderRadius: 99,
                  fontSize: '.72rem',
                  fontWeight: 600,
                  color: 'var(--primary-light)',
                }}>
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 30px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 16 }}>🏅 Top Certifications</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {career.certifications.map((cert) => (
                <div key={cert} style={{
                  padding: '8px 14px',
                  background: 'rgba(139,92,246,.08)',
                  border: '1px solid rgba(139,92,246,.18)',
                  borderRadius: 10,
                  fontSize: '.78rem',
                  color: '#a78bfa',
                  lineHeight: 1.4,
                }}>
                  🎓 {cert}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Companies ────────────────────────────────────────── */}
        {/* Recommended Capstone Projects & Technical Interview Focus */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Projects */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 30px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 16 }}>🚀 Recommended Capstone Projects</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(career.recommended_projects || []).map((proj, idx) => (
                <div key={idx} style={{
                  padding: '12px 14px',
                  background: 'rgba(20, 184, 166, 0.06)',
                  border: '1px solid rgba(20, 184, 166, 0.2)',
                  borderRadius: 12,
                  fontSize: '.82rem',
                  color: 'var(--text)',
                  lineHeight: 1.5,
                }}>
                  📌 {proj}
                </div>
              ))}
            </div>
          </div>

          {/* Interview Topics */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 30px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 16 }}>🎯 Technical Interview Focus</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(career.interview_topics || []).map((topic, idx) => (
                <div key={idx} style={{
                  padding: '8px 12px',
                  background: 'var(--bg-2, #f8fafc)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  fontSize: '.8rem',
                  color: 'var(--text-sec)',
                }}>
                  💬 {topic}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 36px', marginBottom: 48 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 16 }}>🏢 Companies Hiring</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {career.companies.map((co) => (
              <span key={co} style={{
                padding: '6px 18px',
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: 99,
                fontSize: '.82rem',
                fontWeight: 600,
                color: 'var(--text-strong)',
              }}>
                {co}
              </span>
            ))}
          </div>
        </div>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <div style={{
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(20,184,166,.12) 0%, rgba(139,92,246,.12) 100%)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '48px 32px',
          marginBottom: 80,
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-strong)', marginBottom: 12 }}>
            Ready to become a {career.title}?
          </h2>
          <p style={{ color: 'var(--text)', marginBottom: 28 }}>
            Let CareerTwin AI analyse your profile, identify your skill gaps, and create your personalised roadmap.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              padding: '13px 28px',
              background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)',
              color: '#0b0f19',
              fontWeight: 700,
              borderRadius: 12,
              fontSize: '.95rem',
              textDecoration: 'none',
            }}>
              Get Started Free →
            </Link>
            <Link to="/careers" style={{
              padding: '13px 28px',
              background: 'transparent',
              border: '1px solid rgba(20,184,166,.3)',
              color: 'var(--primary-light)',
              fontWeight: 600,
              borderRadius: 12,
              fontSize: '.95rem',
              textDecoration: 'none',
            }}>
              ← Explore More Careers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CareerDetail;
