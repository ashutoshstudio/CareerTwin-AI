/**
 * Profile.jsx — Student Profile Management Page
 * Route: /profile
 * Connected to FastAPI backend: GET /api/v1/profile/me & PUT /api/v1/profile/me
 */

import { Component, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_SUPPORTED_ROLES } from '../data/careerPaths';
import {
  User,
  GraduationCap,
  Building,
  Calendar,
  Briefcase,
  Target,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Loading from '../components/Loading';

function GithubIcon({ size = 16, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

function LinkedinIcon({ size = 16, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const TARGET_ROLES = ALL_SUPPORTED_ROLES;

const EDUCATION_LEVELS = [
  'Bachelor of Computer Applications (BCA)',
  'Bachelor of Technology (B.Tech / B.E.)',
  'Bachelor of Science (B.Sc Computer Science / IT)',
  'Master of Computer Applications (MCA)',
  'Master of Science (M.Sc)',
  'Diploma in Computer Engineering',
  'Other',
];

function Profile() {
  const { user, token, updateUser } = useAuth();

  const [loading, setLoading] = useState(() => Boolean(token));
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [headline, setHeadline] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [institution, setInstitution] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [experienceMonths, setExperienceMonths] = useState(0);
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [skills, setSkills] = useState([]);

  // New skill addition state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(3);

  const fetchProfile = useCallback(async (showLoadingSpinner = false) => {
    if (!token) return;
    if (showLoadingSpinner) setLoading(true);
    try {
      setErrorMsg('');
      const data = await api.getProfile(token);
      setFullName(data.full_name || user?.name || '');
      setEmail(data.email || user?.email || '');
      setHeadline(data.headline || '');
      setEducationLevel(data.education_level || '');
      setInstitution(data.institution || '');
      setGraduationYear(data.graduation_year ? String(data.graduation_year) : '');
      setExperienceMonths(data.experience_months || 0);
      setGithubUrl(data.github_url || '');
      setLinkedinUrl(data.linkedin_url || '');
      setTargetRole(data.target_role || '');
      setSkills(Array.isArray(data.skills) ? data.skills : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load profile. Please verify the backend server.');
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    let ignore = false;
    if (!token) return;

    async function load() {
      try {
        setErrorMsg('');
        const data = await api.getProfile(token);
        if (!ignore) {
          setFullName(data.full_name || user?.name || '');
          setEmail(data.email || user?.email || '');
          setHeadline(data.headline || '');
          setEducationLevel(data.education_level || '');
          setInstitution(data.institution || '');
          setGraduationYear(data.graduation_year ? String(data.graduation_year) : '');
          setExperienceMonths(data.experience_months || 0);
          setGithubUrl(data.github_url || '');
          setLinkedinUrl(data.linkedin_url || '');
          setTargetRole(data.target_role || '');
          setSkills(Array.isArray(data.skills) ? data.skills : []);
        }
      } catch (err) {
        if (!ignore) {
          setErrorMsg(err.message || 'Failed to load profile. Please verify the backend server.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();
    return () => { ignore = true; };
  }, [token, user]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = newSkillName.trim();
    if (!trimmed) return;

    const currentSkills = Array.isArray(skills) ? skills : [];
    // Check duplicate skill name
    if (currentSkills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg(`Skill "${trimmed}" is already added.`);
      return;
    }

    setSkills([...currentSkills, { name: trimmed, level: Number(newSkillLevel) }]);
    setNewSkillName('');
    setNewSkillLevel(3);
    setErrorMsg('');
  };

  const handleRemoveSkill = (index) => {
    setSkills((skills || []).filter((_, i) => i !== index));
  };

  const handleSkillLevelChange = (index, newLevel) => {
    setSkills(
      (skills || []).map((s, i) => (i === index ? { ...s, level: Number(newLevel) } : s))
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    const payload = {
      full_name: fullName.trim() || undefined,
      headline: headline.trim() || null,
      education_level: educationLevel.trim() || null,
      institution: institution.trim() || null,
      graduation_year: graduationYear ? parseInt(graduationYear, 10) : null,
      experience_months: parseInt(experienceMonths, 10) || 0,
      github_url: githubUrl.trim() || null,
      linkedin_url: linkedinUrl.trim() || null,
      target_role: targetRole.trim() || null,
      skills: (skills || []).map((s) => ({ name: (s.name || '').trim(), level: Number(s.level) || 1 })),
    };

    try {
      const updated = await api.updateProfile(payload, token);
      setSuccessMsg('Profile updated successfully!');
      if (updated.full_name && updateUser) {
        updateUser({ name: updated.full_name });
      }
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div id="page-profile" className="page" style={{ padding: '60px 0', textAlign: 'center' }}>
        <Loading message="Loading your student profile..." />
      </div>
    );
  }

  return (
    <div id="page-profile" className="page" style={{ maxWidth: 960, margin: '0 auto', paddingBottom: 60 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="page-heading">Student Profile</div>
        <div className="page-subtitle">
          Manage your personal details, academic background, target career, and verified skills.
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
              justifyContent: 'space-between',
              gap: 10,
              fontWeight: 600,
              fontSize: '.9rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={fetchProfile}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#f87171',
                padding: '5px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: '.82rem',
                fontWeight: 600,
              }}
            >
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSave} noValidate>
        {/* Section 1: Basic Information */}
        <div
          style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '28px 32px',
            marginBottom: 24,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: '1.25rem' }}>👤</span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-strong)' }}>
              Personal & Contact Details
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-fullname">
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="profile-fullname"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">
                Registered Email
              </label>
              <input
                id="profile-email"
                className="form-input"
                type="email"
                value={email}
                disabled
                style={{ opacity: 0.65, cursor: 'not-allowed', background: 'rgba(0,0,0,0.02)' }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" htmlFor="profile-headline">
                Professional Headline
              </label>
              <input
                id="profile-headline"
                className="form-input"
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Final Year BCA Student | Aspiring Machine Learning Engineer"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Academic & Career Goals */}
        <div
          style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '28px 32px',
            marginBottom: 24,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: '1.25rem' }}>🎓</span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-strong)' }}>
              Education & Target Career
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-education">
                Education Level / Degree
              </label>
              <div style={{ position: 'relative' }}>
                <GraduationCap size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="profile-education"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  list="education-options"
                  type="text"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  placeholder="e.g. BCA, B.Tech"
                />
                <datalist id="education-options">
                  {EDUCATION_LEVELS.map((ed) => (
                    <option key={ed} value={ed} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-institution">
                Institution / University
              </label>
              <div style={{ position: 'relative' }}>
                <Building size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="profile-institution"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Delhi University, IP University"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-grad-year">
                Graduation Year
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="profile-grad-year"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  type="number"
                  min="1970"
                  max="2100"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  placeholder="e.g. 2026"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-experience">
                Prior Work / Internship Experience (Months)
              </label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="profile-experience"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  type="number"
                  min="0"
                  max="360"
                  value={experienceMonths}
                  onChange={(e) => setExperienceMonths(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" htmlFor="profile-target-role">
                Target Career Path
              </label>
              <div style={{ position: 'relative' }}>
                <Target size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="profile-target-role"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  list="role-options"
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Data Scientist"
                />
                <datalist id="role-options">
                  {TARGET_ROLES.map((role) => (
                    <option key={role} value={role} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Professional Profiles & Links */}
        <div
          style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '28px 32px',
            marginBottom: 24,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: '1.25rem' }}>🔗</span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-strong)' }}>
              Online Presence & Portfolios
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-github">
                GitHub Profile URL
              </label>
              <div style={{ position: 'relative' }}>
                <GithubIcon size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="profile-github"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/your-username"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-linkedin">
                LinkedIn Profile URL
              </label>
              <div style={{ position: 'relative' }}>
                <LinkedinIcon size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="profile-linkedin"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/your-profile"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Skills & Proficiency Levels */}
        <div
          style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '28px 32px',
            marginBottom: 32,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: '1.25rem' }}>🧠</span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-strong)' }}>
              Skills & Proficiency Levels
            </h2>
          </div>
          <p style={{ fontSize: '.84rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            Rate your skills from 1 (Beginner) to 5 (Expert). These will be used for your ML readiness score and skill gap benchmarks.
          </p>

          {/* Add Skill Row */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              marginBottom: 20,
              padding: '14px 16px',
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px dashed rgba(16, 185, 129, 0.3)',
              borderRadius: 14,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: '1 1 200px' }}>
              <input
                id="new-skill-input"
                className="form-input"
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Skill name (e.g. Python, SQL, Docker)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(e);
                  }
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label htmlFor="new-skill-level" style={{ fontSize: '.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Level:
              </label>
              <select
                id="new-skill-level"
                className="form-input"
                style={{ width: 140, padding: '8px 12px' }}
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(Number(e.target.value))}
              >
                <option value={1}>1 - Beginner</option>
                <option value={2}>2 - Elementary</option>
                <option value={3}>3 - Intermediate</option>
                <option value={4}>4 - Advanced</option>
                <option value={5}>5 - Expert</option>
              </select>
            </div>
            <button
              type="button"
              id="add-skill-btn"
              onClick={handleAddSkill}
              className="btn btn--primary"
              style={{
                padding: '9px 18px',
                fontSize: '.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Plus size={15} /> Add Skill
            </button>
          </div>

          {/* Skills List */}
          {(skills || []).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '.88rem' }}>
              No skills added yet. Add your programming languages, frameworks, and tools above.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {(skills || []).map((skill, index) => (
                <div
                  key={`${skill.name}-${index}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg, #f8fafc)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    fontSize: '.85rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-strong)' }}>{skill.name}</div>
                    <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleSkillLevelChange(index, star)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            padding: 0,
                            color: star <= skill.level ? '#10b981' : '#cbd5e1',
                          }}
                          title={`Set level to ${star}`}
                        >
                          ★
                        </button>
                      ))}
                      <span style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginLeft: 6 }}>
                        Lvl {skill.level}/5
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(index)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 6,
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                    title={`Remove ${skill.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', alignItems: 'center' }}>
          <button
            type="submit"
            id="profile-save-btn"
            disabled={saving}
            className="btn btn--primary"
            style={{
              padding: '14px 32px',
              fontSize: '.95rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.75 : 1,
            }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

class ProfileErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ProfileErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div id="page-profile" className="page" style={{ maxWidth: 960, margin: '40px auto', padding: '32px', textAlign: 'center' }}>
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
              Something went wrong displaying your profile
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginBottom: 20 }}>
              {this.state.error?.message || 'An unexpected error occurred while rendering the profile.'}
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Reload Profile
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ProfileWrapper(props) {
  return (
    <ProfileErrorBoundary>
      <Profile {...props} />
    </ProfileErrorBoundary>
  );
}
