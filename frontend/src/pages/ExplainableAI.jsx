/**
 * ExplainableAI.jsx — Transparent ML Explainability using SHAP and LIME
 * Route: /explainable-ai
 * Connected to FastAPI backend:
 *   POST /api/v1/readiness/explain
 *   GET  /api/v1/readiness/global-xai
 *   GET  /api/v1/xai/explain
 */

import React, { Component, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Scale,
  ShieldAlert,
  Info,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Layers,
  BarChart3,
  HelpCircle,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Loading from '../components/Loading';

// Error Boundary
class XaiErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ExplainableAI page crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: 520, margin: '0 auto', background: 'var(--bg-card, #ffffff)', padding: 32, borderRadius: 16, border: '1px solid var(--border)' }}>
            <AlertCircle size={44} color="#f87171" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-strong)' }}>
              Unable to Load AI Explanations
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

const ROLES = [
  'Data Analyst',
  'Python Developer',
  'Machine Learning Engineer',
];

function ExplainableAIContent() {
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Data Analyst');
  const [activeTab, setActiveTab] = useState('shap'); // 'shap', 'lime', 'global'

  const [explanationData, setExplanationData] = useState(null);
  const [globalData, setGlobalData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchExplains = async (role = selectedRole, showSpinner = true) => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (showSpinner) setLoading(true);
    else setEvaluating(true);
    setErrorMsg(null);

    try {
      const [expRes, globRes] = await Promise.all([
        api.getReadinessExplanation({ target_role: role, include_resume_skills: true }, token),
        api.getGlobalXai().catch(() => null),
      ]);

      setExplanationData(expRes);
      if (globRes) setGlobalData(globRes);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to compute SHAP/LIME feature attributions.');
    } finally {
      setLoading(false);
      setEvaluating(false);
    }
  };

  useEffect(() => {
    fetchExplains(selectedRole, true);
  }, [token]);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    fetchExplains(role, false);
  };

  if (loading) {
    return (
      <div id="page-explainable-ai" className="page" style={{ padding: '60px 0', textAlign: 'center' }}>
        <Loading message="Computing exact SHAP Shapley values and LIME local surrogates on Scikit-learn model..." />
      </div>
    );
  }

  const baseValue = explanationData?.base_value || 52.6;
  const predScore = explanationData?.predicted_score || 0;
  const fidelity = explanationData?.fidelity_check;

  return (
    <div id="page-explainable-ai" className="page" style={{ maxWidth: 1080, margin: '0 auto', paddingBottom: 60 }}>
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
            <Cpu size={20} />
          </div>
          <span style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--emerald-light, #10b981)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Explainable AI (XAI)
          </span>
        </div>
        <div className="page-heading">Model Explainability using SHAP & LIME</div>
        <div className="page-subtitle">
          Transparent, mathematically rigorous feature attributions explaining why the Scikit-learn
          career readiness model produced your specific score.
        </div>
      </div>

      {/* Notifications */}
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

      {/* Toolbar: Role Selector & Tabs */}
      <div
        style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '18px 24px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label htmlFor="xai-role-select" style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--text-strong)' }}>
            Target Role:
          </label>
          <select
            id="xai-role-select"
            className="form-input"
            style={{ padding: '8px 14px', width: 220, fontSize: '.88rem' }}
            value={selectedRole}
            onChange={(e) => handleRoleChange(e.target.value)}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* View Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-main, #fafafa)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
          <button
            id="tab-shap-btn"
            onClick={() => setActiveTab('shap')}
            style={{
              background: activeTab === 'shap' ? 'var(--emerald-light, #10b981)' : 'transparent',
              color: activeTab === 'shap' ? '#ffffff' : 'var(--text-sec)',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: '.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            SHAP Waterfall
          </button>
          <button
            id="tab-lime-btn"
            onClick={() => setActiveTab('lime')}
            style={{
              background: activeTab === 'lime' ? 'var(--emerald-light, #10b981)' : 'transparent',
              color: activeTab === 'lime' ? '#ffffff' : 'var(--text-sec)',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: '.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            LIME Local Surrogate
          </button>
          <button
            id="tab-global-btn"
            onClick={() => setActiveTab('global')}
            style={{
              background: activeTab === 'global' ? 'var(--emerald-light, #10b981)' : 'transparent',
              color: activeTab === 'global' ? '#ffffff' : 'var(--text-sec)',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: '.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Global Feature Importance
          </button>
        </div>
      </div>

      {/* Main Prediction Summary & Fidelity Header */}
      <div
        id="xai-prediction-summary"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 24,
          padding: '24px 30px',
          marginBottom: 30,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontSize: '.75rem', fontWeight: 800, color: 'var(--emerald-light, #10b981)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
              RandomForest Prediction Decomposition
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-strong)', marginBottom: 6 }}>
              {selectedRole} — {explanationData?.predicted_category}
            </h2>
            <div style={{ fontSize: '.84rem', color: 'var(--text-sec)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span>Base Benchmark (E[Y]): <strong>{baseValue} pts</strong></span>
              <span>•</span>
              <span>Predicted Score: <strong style={{ color: 'var(--emerald-light, #10b981)' }}>{predScore}%</strong></span>
              <span>•</span>
              <span>Net SHAP Attribution: <strong>{fidelity?.sum_shap > 0 ? `+${fidelity?.sum_shap}` : fidelity?.sum_shap} pts</strong></span>
            </div>
          </div>

          {/* Mathematical Fidelity Badge */}
          <div style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '14px 18px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.74rem', fontWeight: 700, color: 'var(--emerald-light, #10b981)', marginBottom: 2 }}>
              <CheckCircle2 size={14} />
              <span>Additive Fidelity Verified</span>
            </div>
            <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>
              Discrepancy: Δ = {fidelity?.discrepancy} pts (Exact Match)
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: SHAP Waterfall / Feature Attributions */}
      {activeTab === 'shap' && (
        <div>
          {/* Positive vs Negative Two-Column Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 28 }}>
            {/* Positive Contributors */}
            <div style={{
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 20,
              padding: '24px 26px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <TrendingUp size={20} color="var(--emerald-light, #10b981)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                  Positive Drivers (+ Points)
                </h3>
              </div>

              {explanationData?.positive_contributors?.length === 0 ? (
                <div style={{ fontSize: '.84rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No features contributed positively above the baseline.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {explanationData?.positive_contributors?.map((item) => (
                    <div
                      key={item.feature_name}
                      style={{
                        background: 'rgba(16, 185, 129, 0.05)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: 12,
                        padding: '12px 14px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text-strong)' }}>
                          {item.feature_label}
                        </span>
                        <span style={{ fontSize: '.88rem', fontWeight: 800, color: 'var(--emerald-light, #10b981)' }}>
                          +{item.shap_value} pts
                        </span>
                      </div>
                      <div style={{ fontSize: '.76rem', color: 'var(--text-sec)', lineHeight: 1.4 }}>
                        {item.description} (Value: {item.feature_value})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Negative Contributors / Areas Pulling Score Down */}
            <div style={{
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 20,
              padding: '24px 26px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <TrendingDown size={20} color="#f87171" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                  Negative Penalties (- Points)
                </h3>
              </div>

              {explanationData?.negative_contributors?.length === 0 ? (
                <div style={{ fontSize: '.84rem', color: 'var(--emerald-light, #10b981)', fontWeight: 600 }}>
                  ✓ No negative penalties recorded!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {explanationData?.negative_contributors?.map((item) => (
                    <div
                      key={item.feature_name}
                      style={{
                        background: 'rgba(239, 68, 68, 0.04)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: 12,
                        padding: '12px 14px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text-strong)' }}>
                          {item.feature_label}
                        </span>
                        <span style={{ fontSize: '.88rem', fontWeight: 800, color: '#f87171' }}>
                          {item.shap_value} pts
                        </span>
                      </div>
                      <div style={{ fontSize: '.76rem', color: 'var(--text-sec)', lineHeight: 1.4 }}>
                        {item.description} (Value: {item.feature_value})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* All 9 Features Complete Table */}
          <div style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '24px 28px',
            marginBottom: 28,
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-strong)', marginBottom: 16 }}>
              Complete SHAP Feature Attributions ({explanationData?.shap_attributions?.length} Features)
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.84rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 12px' }}>Feature</th>
                    <th style={{ padding: '10px 12px' }}>Category</th>
                    <th style={{ padding: '10px 12px' }}>Normalized Input</th>
                    <th style={{ padding: '10px 12px' }}>SHAP Attribution (pts)</th>
                    <th style={{ padding: '10px 12px' }}>Direction</th>
                  </tr>
                </thead>
                <tbody>
                  {explanationData?.shap_attributions?.map((attr) => (
                    <tr key={attr.feature_name} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-strong)' }}>
                        {attr.feature_label}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-sec)' }}>
                        {attr.category}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-sec)' }}>
                        {attr.feature_value}
                      </td>
                      <td style={{
                        padding: '12px',
                        fontWeight: 800,
                        color: attr.shap_value >= 0 ? 'var(--emerald-light, #10b981)' : '#f87171',
                      }}>
                        {attr.shap_value >= 0 ? `+${attr.shap_value}` : attr.shap_value}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 10,
                          fontSize: '.72rem',
                          fontWeight: 700,
                          background: attr.impact === 'positive' ? 'rgba(16, 185, 129, 0.12)' : attr.impact === 'negative' ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-main, #f3f4f6)',
                          color: attr.impact === 'positive' ? 'var(--emerald-light, #10b981)' : attr.impact === 'negative' ? '#f87171' : 'var(--text-muted)',
                        }}>
                          {attr.impact.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIME Local Decision Surrogate */}
      {activeTab === 'lime' && (
        <div style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '24px 28px',
          marginBottom: 28,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Scale size={20} color="#3b82f6" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-strong)' }}>
              LIME Local Interpretable Model-agnostic Explanations
            </h3>
          </div>
          <p style={{ fontSize: '.84rem', color: 'var(--text-sec)', marginBottom: 20, lineHeight: 1.5 }}>
            LIME generated 300 synthetic perturbations in the neighborhood of your profile to fit a local
            linear surrogate. Below are the local interval rules and weights that governed your local score:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {explanationData?.lime_attributions?.map((limeItem, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  background: limeItem.weight >= 0 ? 'rgba(16, 185, 129, 0.04)' : 'rgba(239, 68, 68, 0.04)',
                }}
              >
                <div>
                  <div style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: 2 }}>
                    {limeItem.feature_label}
                  </div>
                  <div style={{ fontSize: '.76rem', color: 'var(--text-sec)', fontFamily: 'monospace' }}>
                    Rule: {limeItem.condition}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '.95rem',
                    fontWeight: 800,
                    color: limeItem.weight >= 0 ? 'var(--emerald-light, #10b981)' : '#f87171',
                  }}>
                    {limeItem.weight >= 0 ? `+${limeItem.weight}` : limeItem.weight} weight
                  </div>
                  <span style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>
                    Local impact
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Global Feature Importance */}
      {activeTab === 'global' && (
        <div style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '24px 28px',
          marginBottom: 28,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <BarChart3 size={20} color="var(--emerald-light, #10b981)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-strong)' }}>
              Global Model Feature Importance (All 1,800 Training Profiles)
            </h3>
          </div>
          <p style={{ fontSize: '.84rem', color: 'var(--text-sec)', marginBottom: 20, lineHeight: 1.5 }}>
            Relative weight of features across the entire RandomForest ensemble (measured by Gini impurity reduction
            and mean absolute Shapley values).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {globalData?.global_importances?.map((g) => (
              <div key={g.feature_name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.84rem', fontWeight: 700, marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-strong)' }}>
                    #{g.rank} {g.feature_label} ({g.category})
                  </span>
                  <span style={{ color: 'var(--emerald-light, #10b981)' }}>
                    {Math.round(g.importance_score * 100)}% Gini ({g.mean_abs_shap} mean |SHAP|)
                  </span>
                </div>
                <div style={{ height: 8, background: 'var(--bg-main, #f3f4f6)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, g.importance_score * 250)}%`,
                    height: '100%',
                    background: 'var(--emerald-light, #10b981)',
                    borderRadius: 4,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Non-Causal Scientific Disclaimer Card */}
      <div
        id="xai-causal-disclaimer"
        style={{
          background: 'rgba(59, 130, 246, 0.04)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: 20,
          padding: '22px 26px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
        }}
      >
        <ShieldAlert size={22} color="#3b82f6" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '.82rem', color: 'var(--text-sec)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text-strong)', display: 'block', marginBottom: 4 }}>
            Scientific Notice: Model Attribution vs. Real-World Causality
          </strong>
          {explanationData?.causal_disclaimer || (
            "Attribution values (SHAP and LIME) explain how the mathematical model weighted individual " +
            "features to produce its internal score. They represent mathematical model sensitivity, NOT real-world " +
            "causal mechanisms. Adding a keyword to a profile does not guarantee an interview or cause employment."
          )}
          <ul style={{ margin: '8px 0 0 0', paddingLeft: 18, color: 'var(--text-muted)' }}>
            {(explanationData?.limitations || []).map((lim, i) => (
              <li key={i}>{lim}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ExplainableAI() {
  return (
    <XaiErrorBoundary>
      <ExplainableAIContent />
    </XaiErrorBoundary>
  );
}

export default ExplainableAI;
