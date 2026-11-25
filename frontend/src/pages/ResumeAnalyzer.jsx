/**
 * ResumeAnalyzer.jsx — Real Resume Text Extraction & Skill Analysis
 * Route: /resume-analyzer
 * Connected to FastAPI backend: POST /api/v1/resume/analyze & GET /api/v1/resume/history
 */

import { Component, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  GraduationCap,
  Mail,
  Phone,
  Check,
  Clock,
  Sparkles,
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

function ResumeAnalyzer() {
  const { token } = useAuth();
  const fileInputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [syncingProfile, setSyncingProfile] = useState(false);

  // Load latest analysis and history on component mount
  useEffect(() => {
    let isMounted = true;
    if (!token) return;

    async function loadInitialData() {
      setHistoryLoading(true);
      try {
        const histData = await api.getResumeHistory(token);
        if (isMounted) setHistory(histData || []);

        try {
          const latestData = await api.getLatestResume(token);
          if (isMounted && latestData) {
            setAnalysisResult(latestData);
          }
        } catch {
          // No latest resume yet, which is completely normal for a new user
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Could not load resume history:', err.message);
        }
      } finally {
        if (isMounted) setHistoryLoading(false);
      }
    }

    loadInitialData();
    return () => { isMounted = false; };
  }, [token]);

  // Handle Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setErrorMsg('');
    setSuccessMsg('');

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      setErrorMsg('Unsupported file format. Please upload a PDF (.pdf) or Word document (.docx).');
      return;
    }

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMsg(`File exceeds the 5 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please select a smaller document.`);
      return;
    }

    if (file.size === 0) {
      setErrorMsg('The selected file is empty (0 bytes).');
      return;
    }

    setSelectedFile(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select a PDF or DOCX resume to analyze.');
      return;
    }
    if (!token) {
      setErrorMsg('You must be logged in to analyze your resume.');
      return;
    }

    setAnalyzing(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const result = await api.analyzeResume(selectedFile, token);
      setAnalysisResult(result);
      setSuccessMsg(`Resume "${selectedFile.name}" analyzed successfully!`);

      // Refresh history list
      try {
        const updatedHistory = await api.getResumeHistory(token);
        setHistory(updatedHistory || []);
      } catch {
        // Non-blocking
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSyncToProfile = async () => {
    if (!analysisResult || !token) return;

    setSyncingProfile(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Fetch current profile
      const currentProfile = await api.getProfile(token);
      const existingSkills = Array.isArray(currentProfile.skills) ? currentProfile.skills : [];
      const existingNames = new Set(existingSkills.map((s) => s.name.toLowerCase().trim()));

      // 2. Identify new skills not already in profile
      const extractedSkills = analysisResult.extracted_skills || [];
      const newSkillsToAdd = [];

      for (const item of extractedSkills) {
        if (!existingNames.has(item.name.toLowerCase().trim())) {
          newSkillsToAdd.push({
            name: item.name,
            level: 3, // Default intermediate level for newly discovered skills
          });
          existingNames.add(item.name.toLowerCase().trim());
        }
      }

      const mergedSkills = [...existingSkills, ...newSkillsToAdd];

      // 3. Build update payload preserving existing profile values unless empty
      const payload = {
        skills: mergedSkills,
        education_level: currentProfile.education_level || analysisResult.education?.degree || undefined,
        institution: currentProfile.institution || analysisResult.education?.institution || undefined,
        graduation_year: currentProfile.graduation_year || analysisResult.education?.graduation_year || undefined,
        github_url: currentProfile.github_url || analysisResult.contact_info?.github_url || undefined,
        linkedin_url: currentProfile.linkedin_url || analysisResult.contact_info?.linkedin_url || undefined,
      };

      await api.updateProfile(payload, token);
      setSuccessMsg(
        newSkillsToAdd.length > 0
          ? `Successfully synchronized ${newSkillsToAdd.length} newly extracted skill(s) to your profile!`
          : 'Profile already contains all extracted skills. No duplicate skills were added.'
      );
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sync skills with profile.');
    } finally {
      setSyncingProfile(false);
    }
  };

  const loadPastAnalysis = async (id) => {
    if (!token) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.getLatestResume(token);
      if (res && res.id === id) {
        setAnalysisResult(res);
      } else {
        // Fetch specific analysis from API
        const specific = await (await fetch(`${api.API_BASE_URL || 'http://127.0.0.1:8000/api/v1'}/resume/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })).json();
        setAnalysisResult(specific);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load past analysis.');
    }
  };

  // Group extracted skills by category
  const groupedSkills = (analysisResult?.extracted_skills || []).reduce((acc, curr) => {
    const cat = curr.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr.name);
    return acc;
  }, {});

  return (
    <div id="page-resume-analyzer" className="page" style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 60 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="page-heading">Resume Text & Skill Analyzer</div>
        <div className="page-subtitle">
          Extract genuine text from PDF and Word resumes, detect verified skills, and review findings before updating your student profile.
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

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Upload Box & Analysis Results */}
        <div>
          {/* Upload Area */}
          <div
            style={{
              background: 'var(--bg-card, #ffffff)',
              border: dragActive ? '2px dashed #10b981' : '1px solid var(--border)',
              borderRadius: 20,
              padding: '32px 28px',
              marginBottom: 24,
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease',
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <UploadCloud size={32} />
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-strong)', marginBottom: 6 }}>
              Upload Your Resume
            </h3>
            <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Supports selectable <strong>PDF</strong> and <strong>DOCX</strong> files up to 5 MB.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="resume-file-input"
            />

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                id="browse-files-btn"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn--outline"
                style={{
                  padding: '10px 22px',
                  fontSize: '.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <FileText size={16} />
                <span>{selectedFile ? 'Change File' : 'Browse Files'}</span>
              </button>

              <button
                type="button"
                id="analyze-resume-btn"
                disabled={!selectedFile || analyzing}
                onClick={handleAnalyze}
                className="btn btn--primary"
                style={{
                  padding: '10px 24px',
                  fontSize: '.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  opacity: !selectedFile || analyzing ? 0.6 : 1,
                  cursor: !selectedFile || analyzing ? 'not-allowed' : 'pointer',
                }}
              >
                {analyzing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Extracting Text & Skills...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Analyze Resume</span>
                  </>
                )}
              </button>
            </div>

            {selectedFile && (
              <div
                style={{
                  marginTop: 16,
                  padding: '10px 14px',
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: 10,
                  fontSize: '.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'var(--text-strong)',
                }}
              >
                <FileText size={15} color="#10b981" />
                <span>Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          {/* Processing State */}
          {analyzing && (
            <div
              style={{
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: '40px 24px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                marginBottom: 24,
              }}
            >
              <Loading message="Parsing resume text, scanning skill taxonomy, and extracting metadata..." />
            </div>
          )}

          {/* Analysis Results Display */}
          {analysisResult && !analyzing && (
            <div
              id="analysis-results-card"
              style={{
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: '28px 30px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              {/* Status Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                    Analysis Results: {analysisResult.filename}
                  </h3>
                  <div style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Analyzed on {new Date(analysisResult.created_at).toLocaleDateString()} at {new Date(analysisResult.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {analysisResult.file_type.toUpperCase()} • {(analysisResult.file_size_bytes / 1024).toFixed(1)} KB
                  </div>
                </div>

                <div
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: '.8rem',
                    fontWeight: 700,
                    background: analysisResult.status === 'completed' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    color: analysisResult.status === 'completed' ? '#10b981' : '#f87171',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {analysisResult.status === 'completed' ? <Check size={14} /> : <AlertCircle size={14} />}
                  <span>{analysisResult.status === 'completed' ? 'Extraction Successful' : 'Unreadable / Scanned'}</span>
                </div>
              </div>

              {/* Extraction Warnings Banner if present */}
              {analysisResult.warnings && analysisResult.warnings.length > 0 && (
                <div
                  style={{
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: 14,
                    padding: '14px 18px',
                    marginBottom: 24,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f59e0b', fontWeight: 700, fontSize: '.86rem', marginBottom: 6 }}>
                    <AlertTriangle size={16} />
                    <span>Document Processing Notices</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: '.82rem', color: 'var(--text-muted)' }}>
                    {analysisResult.warnings.map((w, idx) => (
                      <li key={idx} style={{ marginTop: 4 }}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Summary snippet */}
              {analysisResult.summary && (
                <div
                  style={{
                    padding: '12px 16px',
                    background: 'var(--bg, #f8fafc)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    fontSize: '.85rem',
                    color: 'var(--text-strong)',
                    marginBottom: 24,
                  }}
                >
                  <span style={{ fontWeight: 700 }}>Summary: </span>
                  {analysisResult.summary}
                </div>
              )}

              {/* Extracted Skills Section */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                    Extracted Skills ({analysisResult.extracted_skills?.length || 0})
                  </h4>
                  {analysisResult.extracted_skills?.length > 0 && (
                    <button
                      type="button"
                      id="sync-profile-btn"
                      disabled={syncingProfile}
                      onClick={handleSyncToProfile}
                      className="btn btn--primary"
                      style={{
                        padding: '6px 14px',
                        fontSize: '.8rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Sparkles size={14} />
                      <span>{syncingProfile ? 'Syncing...' : 'Sync to Student Profile'}</span>
                    </button>
                  )}
                </div>

                {Object.keys(groupedSkills).length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '.85rem', padding: '16px 0' }}>
                    No skills were identified in this document.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {Object.entries(groupedSkills).map(([cat, skillsList]) => (
                      <div key={cat} style={{ background: 'var(--bg, #f8fafc)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                          {cat} ({skillsList.length})
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {skillsList.map((skill) => (
                            <span
                              key={skill}
                              style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.25)',
                                color: '#047857',
                                padding: '4px 10px',
                                borderRadius: 8,
                                fontSize: '.82rem',
                                fontWeight: 600,
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Extracted Education Section */}
              <div style={{ marginBottom: 28 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong)', marginBottom: 12 }}>
                  Education Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div style={{ padding: '12px 14px', background: 'var(--bg, #f8fafc)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Detected Degree</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <GraduationCap size={16} color="#10b981" />
                      <span>{analysisResult.education?.degree || 'Not detected'}</span>
                    </div>
                  </div>

                  <div style={{ padding: '12px 14px', background: 'var(--bg, #f8fafc)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Institution</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginTop: 4 }}>
                      {analysisResult.education?.institution || 'Not detected'}
                    </div>
                  </div>

                  <div style={{ padding: '12px 14px', background: 'var(--bg, #f8fafc)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Graduation Year</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginTop: 4 }}>
                      {analysisResult.education?.graduation_year || 'Not detected'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-strong)', marginBottom: 12 }}>
                  Detected Contact Information
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                  {analysisResult.contact_info?.email && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '.84rem', color: 'var(--text-strong)' }}>
                      <Mail size={15} color="#10b981" />
                      <span>{analysisResult.contact_info.email}</span>
                    </div>
                  )}
                  {analysisResult.contact_info?.phone && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '.84rem', color: 'var(--text-strong)' }}>
                      <Phone size={15} color="#10b981" />
                      <span>{analysisResult.contact_info.phone}</span>
                    </div>
                  )}
                  {analysisResult.contact_info?.github_url && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '.84rem', color: 'var(--text-strong)' }}>
                      <GithubIcon size={15} style={{ color: '#10b981' }} />
                      <a href={analysisResult.contact_info.github_url} target="_blank" rel="noreferrer" style={{ color: '#10b981', textDecoration: 'none' }}>
                        GitHub Profile
                      </a>
                    </div>
                  )}
                  {analysisResult.contact_info?.linkedin_url && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '.84rem', color: 'var(--text-strong)' }}>
                      <LinkedinIcon size={15} style={{ color: '#10b981' }} />
                      <a href={analysisResult.contact_info.linkedin_url} target="_blank" rel="noreferrer" style={{ color: '#10b981', textDecoration: 'none' }}>
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {!analysisResult.contact_info?.email && !analysisResult.contact_info?.phone && !analysisResult.contact_info?.github_url && !analysisResult.contact_info?.linkedin_url && (
                    <div style={{ fontSize: '.84rem', color: 'var(--text-muted)' }}>No contact info parsed from resume text.</div>
                  )}
                </div>
              </div>

              {/* Extracted Text Preview */}
              {analysisResult.text_preview && (
                <div>
                  <h4 style={{ fontSize: '.9rem', fontWeight: 800, color: 'var(--text-strong)', marginBottom: 8 }}>
                    Text Preview (First 800 characters)
                  </h4>
                  <pre
                    style={{
                      background: 'var(--bg, #f8fafc)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      padding: 14,
                      fontSize: '.78rem',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      maxHeight: 160,
                      overflowY: 'auto',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {analysisResult.text_preview}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Upload History & Instructions */}
        <div>
          {/* Instructions Card */}
          <div
            style={{
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: '24px 22px',
              marginBottom: 24,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            <h4 style={{ fontSize: '.95rem', fontWeight: 800, color: 'var(--text-strong)', marginBottom: 12 }}>
              How Resume Parsing Works
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '.84rem', color: 'var(--text-muted)' }}>
              <div>
                <strong style={{ color: 'var(--text-strong)' }}>1. Genuine Text Extraction:</strong> Reads raw text streams directly from PDF and DOCX files without external OCR dependencies.
              </div>
              <div>
                <strong style={{ color: 'var(--text-strong)' }}>2. Precise Skill Matching:</strong> Compares text against our 50+ programming, data science, web, cloud, and soft skill taxonomy.
              </div>
              <div>
                <strong style={{ color: 'var(--text-strong)' }}>3. You Are in Control:</strong> Extracted skills are only synced to your profile when you explicitly confirm.
              </div>
            </div>
          </div>

          {/* Upload History Card */}
          <div
            style={{
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: '24px 22px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={16} color="var(--text-muted)" />
                <h4 style={{ fontSize: '.95rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                  Analysis History
                </h4>
              </div>
              <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {history.length} {history.length === 1 ? 'file' : 'files'}
              </span>
            </div>

            {historyLoading ? (
              <div style={{ textAlign: 'center', padding: '16px 0', fontSize: '.84rem', color: 'var(--text-muted)' }}>
                Loading previous analyses...
              </div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0', fontSize: '.84rem', color: 'var(--text-muted)' }}>
                No resumes analyzed yet. Upload your first document to see your history.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => loadPastAnalysis(item.id)}
                    style={{
                      padding: '10px 12px',
                      background: analysisResult?.id === item.id ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg, #f8fafc)',
                      border: analysisResult?.id === item.id ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border)',
                      borderRadius: 12,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--text-strong)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 170 }}>
                        {item.filename}
                      </div>
                      <span
                        style={{
                          fontSize: '.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: item.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: item.status === 'completed' ? '#10b981' : '#f87171',
                        }}
                      >
                        {item.file_type.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, fontSize: '.75rem', color: 'var(--text-muted)' }}>
                      <span>{item.skills_count} skills detected</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

class ResumeAnalyzerErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ResumeAnalyzerErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div id="page-resume-analyzer" className="page" style={{ maxWidth: 960, margin: '40px auto', padding: '32px', textAlign: 'center' }}>
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
              Something went wrong loading the Resume Analyzer
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

export default function ResumeAnalyzerWrapper(props) {
  return (
    <ResumeAnalyzerErrorBoundary>
      <ResumeAnalyzer {...props} />
    </ResumeAnalyzerErrorBoundary>
  );
}
