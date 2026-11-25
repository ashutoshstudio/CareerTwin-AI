/**
 * CareerAssistant.jsx — AI Career Assistant Module
 * Theme: Nordic Emerald Light & Frosted Crystal Glass
 *
 * Provides a conversational career advisor grounded in real student
 * metrics across all 11 CareerTwin AI modules. Features persistent conversation
 * memory, starter prompts, real-time contextual snapshot cards, and fallback
 * indicators with live AI retry capabilities.
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  User,
  Send,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  Briefcase,
  TrendingUp,
  FileCheck,
  GitBranch,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
  MessageSquare,
  Compass,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Loading from '../components/Loading';

const STARTER_PROMPTS = [
  {
    title: 'Analyze Career Readiness',
    prompt: 'Analyze my career readiness score and tell me what to improve next.',
    category: 'Readiness',
  },
  {
    title: 'Top Skill Gaps',
    prompt: 'What are my biggest skill gaps for my target role, and why do they matter?',
    category: 'Skills',
  },
  {
    title: 'Improve ATS Resume',
    prompt: 'How can I optimize my resume and improve my ATS keyword match score?',
    category: 'Resume',
  },
  {
    title: 'Review GitHub Portfolio',
    prompt: 'Review my GitHub portfolio score and suggest projects I should build next.',
    category: 'Portfolio',
  },
  {
    title: 'This Week\'s Learning Plan',
    prompt: 'What should I learn this week based on my personalized learning roadmap?',
    category: 'Roadmap',
  },
  {
    title: 'Role Comparison',
    prompt: 'Compare Data Analyst vs Python Developer based on my current skills.',
    category: 'Comparison',
  },
];

function formatTime(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

/**
 * High-Contrast Markdown Renderer for Assistant Responses
 * Adheres strictly to WCAG AA contrast against white / frosted cards.
 * Primary text: #1E293B (Dark Slate)
 * Strong / Headings: #0F172A (Deep Slate/Navy)
 * Secondary / Meta: #475569
 * Accent / Brand: #059669 (Emerald)
 */
function MarkdownContent({ content }) {
  const renderedElements = useMemo(() => {
    if (!content || typeof content !== 'string') return null;
    const lines = content.split('\n');
    const elements = [];
    let listItems = [];
    let listType = null; // 'ul' or 'ol'
    let inCodeBlock = false;
    let codeBlockLines = [];
    let tableLines = [];

    const flushList = (keyPrefix) => {
      if (listItems.length > 0) {
        if (listType === 'ol') {
          elements.push(
            <ol key={`${keyPrefix}-ol`} className="list-decimal pl-5 space-y-1.5 my-2.5 text-sm text-slate-800 font-normal">
              {listItems.map((item, idx) => (
                <li key={idx} className="leading-relaxed pl-1" dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`${keyPrefix}-ul`} className="list-disc pl-5 space-y-1.5 my-2.5 text-sm text-slate-800 font-normal marker:text-emerald-600">
              {listItems.map((item, idx) => (
                <li key={idx} className="leading-relaxed pl-1" dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          );
        }
        listItems = [];
        listType = null;
      }
    };

    const flushCodeBlock = (keyPrefix) => {
      if (codeBlockLines.length > 0) {
        elements.push(
          <div
            key={`${keyPrefix}-code`}
            className="my-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-sm"
          >
            <div className="bg-slate-800/80 px-3.5 py-1.5 text-xs text-slate-300 font-mono flex items-center justify-between border-b border-slate-700/60">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Code snippet</span>
              </span>
            </div>
            <pre className="p-3.5 text-xs font-mono text-slate-100 overflow-x-auto leading-relaxed">
              <code>{codeBlockLines.join('\n')}</code>
            </pre>
          </div>
        );
        codeBlockLines = [];
      }
    };

    const flushTable = (keyPrefix) => {
      if (tableLines.length >= 2) {
        const isDelimiter = (l) => /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?$/.test(l.trim());
        const parseRow = (line) => {
          let cleaned = line.trim();
          if (cleaned.startsWith('|')) cleaned = cleaned.slice(1);
          if (cleaned.endsWith('|')) cleaned = cleaned.slice(0, -1);
          return cleaned.split('|').map((c) => c.trim());
        };

        if (isDelimiter(tableLines[1])) {
          const headerCells = parseRow(tableLines[0]);
          const bodyRows = tableLines.slice(2).filter((l) => l.trim() !== '').map(parseRow);

          elements.push(
            <div key={`${keyPrefix}-table`} className="my-3 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                <thead className="bg-slate-50 font-bold text-slate-900">
                  <tr>
                    {headerCells.map((cell, cIdx) => (
                      <th key={cIdx} className="px-3.5 py-2.5 font-bold text-slate-900 border-r border-slate-200 last:border-r-0" dangerouslySetInnerHTML={{ __html: formatInline(cell) }} />
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {bodyRows.map((rowCells, rIdx) => (
                    <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      {rowCells.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2 text-slate-800 border-r border-slate-200 last:border-r-0 font-normal leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(cell) }} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          tableLines = [];
          return;
        }
      }
      tableLines.forEach((tLine, tIdx) => {
        elements.push(
          <p key={`${keyPrefix}-tab-p-${tIdx}`} className="text-sm text-slate-800 leading-relaxed my-1.5 font-normal" dangerouslySetInnerHTML={{ __html: formatInline(tLine.trim()) }} />
        );
      });
      tableLines = [];
    };

    const formatInline = (text) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-950 font-bold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="text-slate-800 italic">$1</em>')
        .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-emerald-800 border border-slate-200 text-xs font-mono font-medium">$1</code>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-emerald-700 hover:text-emerald-800 underline font-semibold transition-colors">$1</a>');
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Multi-line code fence toggling
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock(index);
          inCodeBlock = false;
        } else {
          flushList(index);
          flushTable(index);
          inCodeBlock = true;
          codeBlockLines = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        return;
      }

      // Markdown Tables (| cell | cell |)
      if (trimmed.startsWith('|') && trimmed.includes('|')) {
        flushList(index);
        tableLines.push(line);
        return;
      }
      flushTable(index);

      // Horizontal rules (---, ***, ___)
      if (/^(\*{3,}|-{3,}|_{3,})$/.test(trimmed)) {
        flushList(index);
        elements.push(<hr key={index} className="my-3 border-t border-slate-200" />);
        return;
      }

      // Heading 1 (e.g. # Title)
      if (trimmed.startsWith('# ')) {
        flushList(index);
        elements.push(
          <h2 key={index} className="text-xl font-black text-slate-950 mt-5 mb-2.5 pb-1 border-b border-slate-200 flex items-center gap-2">
            <span className="w-2.5 h-5 bg-emerald-600 rounded-full inline-block flex-shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace(/^#\s+/, '')) }} />
          </h2>
        );
        return;
      }

      // Heading 2 (e.g. ## Core Overview)
      if (trimmed.startsWith('## ')) {
        flushList(index);
        elements.push(
          <h3 key={index} className="text-lg font-extrabold text-slate-950 mt-5 mb-2.5 pb-1 border-b border-emerald-100 flex items-center gap-2">
            <span className="w-2 h-4.5 bg-emerald-600 rounded-full inline-block flex-shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace(/^##\s+/, '')) }} />
          </h3>
        );
        return;
      }

      // Heading 3 (e.g. ### Role Benchmark Rationale: ...)
      if (trimmed.startsWith('### ')) {
        flushList(index);
        elements.push(
          <h4 key={index} className="text-base font-bold text-slate-900 mt-4 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-emerald-600 rounded-full inline-block flex-shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace(/^###\s+/, '')) }} />
          </h4>
        );
        return;
      }

      // Heading 4 (e.g. #### 1. Feature or Subheading)
      if (trimmed.startsWith('#### ')) {
        flushList(index);
        elements.push(
          <h5 key={index} className="text-sm font-bold text-slate-900 mt-3 mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-3 bg-emerald-500 rounded-full inline-block flex-shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace(/^####\s+/, '')) }} />
          </h5>
        );
        return;
      }

      // Blockquote (e.g. > Note: ...)
      if (trimmed.startsWith('> ')) {
        flushList(index);
        elements.push(
          <div
            key={index}
            className="my-2.5 pl-3.5 py-2 border-l-4 border-emerald-500 bg-emerald-50/60 rounded-r-lg text-sm text-slate-800 font-medium"
            dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace('> ', '')) }}
          />
        );
        return;
      }

      // Numbered List (e.g. 1. Item)
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        if (listType !== 'ol') flushList(index);
        listType = 'ol';
        listItems.push(formatInline(numMatch[2]));
        return;
      }

      // Bullet List (e.g. - Item or * Item)
      const bulletMatch = trimmed.match(/^[-*]\s+(.*)/);
      if (bulletMatch) {
        if (listType !== 'ul') flushList(index);
        listType = 'ul';
        listItems.push(formatInline(bulletMatch[1]));
        return;
      }

      // Normal text or empty line
      flushList(index);
      if (trimmed === '') {
        elements.push(<div key={index} className="h-2" />);
      } else {
        elements.push(
          <p
            key={index}
            className="text-sm text-slate-800 leading-relaxed my-1.5 font-normal"
            dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
          />
        );
      }
    });

    flushList('end');
    flushTable('end');
    if (inCodeBlock) {
      flushCodeBlock('end');
    }

    return elements;
  }, [content]);

  return <div className="space-y-1">{renderedElements}</div>;
}

export default function CareerAssistant() {
  const { token } = useAuth();

  // State
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [contextSnapshot, setContextSnapshot] = useState(null);

  // UI state
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [retryingMsgId, setRetryingMsgId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [isContextOpen, setIsContextOpen] = useState(true);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const msgCounterRef = useRef(1);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom('auto');
  }, [messages, scrollToBottom]);

  // Initial load
  useEffect(() => {
    let isCancelled = false;

    async function initialize() {
      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        // Fetch context snapshot and conversation list in parallel
        const [contextRes, convsRes] = await Promise.allSettled([
          api.getCareerAssistantContext(null, token),
          api.getCareerAssistantConversations(token),
        ]);

        if (!isCancelled) {
          if (contextRes.status === 'fulfilled' && contextRes.value) {
            setContextSnapshot(contextRes.value);
          }
          if (convsRes.status === 'fulfilled' && Array.isArray(convsRes.value)) {
            setConversations(convsRes.value);
            // If conversations exist, load the most recent one
            if (convsRes.value.length > 0) {
              const latestId = convsRes.value[0].id;
              setActiveConversationId(latestId);
              try {
                const detail = await api.getCareerAssistantMessages(latestId, token);
                if (!isCancelled && detail?.messages) {
                  setMessages(detail.messages);
                }
              } catch (err) {
                console.error('Failed to load initial messages:', err);
              }
            }
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to initialize career assistant:', err);
          setErrorMessage(err.message || 'Could not initialize Career Assistant.');
        }
      } finally {
        if (!isCancelled) setIsInitializing(false);
      }
    }

    initialize();

    return () => {
      isCancelled = true;
    };
  }, [token]);

  // Load a selected conversation
  const handleSelectConversation = async (convId) => {
    if (convId === activeConversationId || !token) return;
    setActiveConversationId(convId);
    setIsLoadingMessages(true);
    setErrorMessage(null);
    try {
      const detail = await api.getCareerAssistantMessages(convId, token);
      setMessages(detail?.messages || []);
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setErrorMessage('Could not load conversation history.');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Start a new conversation
  const handleStartNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setInputText('');
    setErrorMessage(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Delete a conversation
  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    if (!token || isDeleting) return;

    if (!window.confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.deleteCareerAssistantConversation(convId, token);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConversationId === convId) {
        handleStartNewChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      setErrorMessage('Could not delete conversation.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Active target role and quick metrics
  const targetRole = contextSnapshot?.target_role || 'Data Analyst';

  // Send message
  const handleSendMessage = useCallback(async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || !token || isSending) return;

    setErrorMessage(null);
    setIsSending(true);

    const tempId = `temp-${msgCounterRef.current++}`;
    const optimisticUserMsg = {
      id: tempId,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);
    setInputText('');

    try {
      const payload = {
        message: text,
        conversation_id: activeConversationId || undefined,
        target_role_override: targetRole,
      };

      const res = await api.sendCareerAssistantMessage(payload, token);

      const assistantMsg = {
        id: res.message_id || `asst-${msgCounterRef.current++}`,
        role: 'assistant',
        content: res.assistant_response,
        provider_used: res.provider_used,
        relevant_context: res.relevant_context,
        is_fallback: Boolean(res.is_fallback),
        generation_mode: res.generation_mode,
        provider_error: res.provider_error,
        created_at: res.timestamp || new Date().toISOString(),
      };

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        { ...optimisticUserMsg, id: res.message_id ? res.message_id - 1 : `u-${msgCounterRef.current++}` },
        assistantMsg,
      ]);

      if (!activeConversationId && res.conversation_id) {
        setActiveConversationId(res.conversation_id);
      }

      const updatedConvs = await api.getCareerAssistantConversations(token);
      if (Array.isArray(updatedConvs)) {
        setConversations(updatedConvs);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setErrorMessage(err.message || 'Failed to communicate with Career Assistant. Please try again.');
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInputText(text);
    } finally {
      setIsSending(false);
    }
  }, [activeConversationId, targetRole, inputText, isSending, token]);

  // Retry last assistant message with live AI
  const handleRetryMessage = async (msg) => {
    if (!token || !activeConversationId || retryingMsgId) return;
    setRetryingMsgId(msg.id);
    setErrorMessage(null);

    try {
      const res = await api.retryCareerAssistantMessage(activeConversationId, token);
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === msg.id) {
            return {
              ...m,
              content: res.assistant_response,
              provider_used: res.provider_used,
              is_fallback: Boolean(res.is_fallback),
              generation_mode: res.generation_mode,
              provider_error: res.provider_error,
              relevant_context: res.relevant_context,
            };
          }
          return m;
        })
      );
    } catch (err) {
      console.error('Failed to retry message:', err);
      setErrorMessage(err.message || 'AI service is temporarily busy. Please try again.');
    } finally {
      setRetryingMsgId(null);
    }
  };

  // Key handler (Enter to send, Shift+Enter for new line)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Copy message text
  const handleCopyMessage = (msgId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };

  // Active target role and quick metrics
  const readiness = contextSnapshot?.readiness_score != null ? `${Math.round(contextSnapshot.readiness_score)}%` : 'Pending';
  const atsScore = contextSnapshot?.ats_score != null ? `${Math.round(contextSnapshot.ats_score)}/100` : 'Pending';
  const githubScore = contextSnapshot?.github_score != null ? `${Math.round(contextSnapshot.github_score)}/100` : 'Pending';
  const roadmapProgress = contextSnapshot?.roadmap_progress != null ? `${Math.round(contextSnapshot.roadmap_progress)}%` : 'Pending';

  const isGeminiActive = contextSnapshot?.provider_status?.mode === 'external_llm';
  const providerLabel = isGeminiActive
    ? `${contextSnapshot.provider_status.model || 'Gemini 3.5 Flash Lite'}`
    : 'Curriculum Guidance';

  const criticalGaps = contextSnapshot?.critical_growth_areas || [];
  const verifiedSkills = contextSnapshot?.verified_skills || [];

  return (
    <div id="page-career-assistant" className="page" style={{ maxWidth: 1180, margin: '0 auto', paddingBottom: 60 }}>
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 className="page-heading" style={{ margin: 0, color: '#0f172a', fontWeight: 800 }}>
              AI Career Assistant
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 10px',
                borderRadius: 99,
                fontSize: '.75rem',
                fontWeight: 700,
                background: isGeminiActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(241, 245, 249, 0.9)',
                color: isGeminiActive ? '#065f46' : '#334155',
                border: isGeminiActive ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid #cbd5e1',
              }}
            >
              <Sparkles size={12} className={isGeminiActive ? 'text-emerald-600' : 'text-slate-400'} />
              <span>{isGeminiActive ? `AI Mode (${providerLabel})` : 'Fallback Mode'}</span>
            </span>
          </div>
          <p style={{
            margin: 0,
            color: '#475569',
            fontSize: '.92rem',
            fontWeight: 500,
            lineHeight: 1.5,
          }}>
            Personalized career guidance grounded directly in your CareerTwin AI assessments, verified skills, and roadmap milestones.
          </p>
        </div>

        {/* Toolbar: Sidebar Toggle Button (Only ONE New Discussion button exists, located in Conversations sidebar) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setIsContextOpen(!isContextOpen)}
            className="btn btn--outline"
            style={{
              padding: '9px 16px',
              fontSize: '.84rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#ffffff',
              color: '#1e293b',
              border: '1px solid rgba(16, 185, 129, 0.28)',
              borderRadius: 12,
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
            }}
            title={isContextOpen ? 'Hide Student Context Panel' : 'Show Student Context Panel'}
          >
            {isContextOpen ? <PanelRightClose size={16} className="text-emerald-600" /> : <PanelRightOpen size={16} className="text-emerald-600" />}
            <span>{isContextOpen ? 'Hide Sidebar' : 'Show Sidebar'}</span>
          </button>
        </div>
      </div>

      {/* ── Error Banner ───────────────────────────────────────────── */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
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
            <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
            <div style={{ flex: 1 }}>{errorMessage}</div>
            <button
              onClick={() => setErrorMessage(null)}
              style={{ background: 'none', border: 'none', color: '#991b1b', fontWeight: 700, cursor: 'pointer', fontSize: '.82rem' }}
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Chat Layout ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px] h-[calc(100vh-210px)] max-h-[920px]">
        {/* Left Column: Conversation History Sidebar */}
        <div
          className="hidden md:flex lg:col-span-3 min-w-0 flex-col overflow-hidden"
          style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid rgba(16, 185, 129, 0.22)',
            borderRadius: 20,
            padding: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          {/* Exactly ONE Primary '+ New Discussion' button */}
          <button
            onClick={handleStartNewChat}
            className="btn btn--primary"
            style={{
              width: '100%',
              padding: '11px 16px',
              fontSize: '.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 16,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.28)',
            }}
          >
            <Plus size={16} />
            <span>+ New Discussion</span>
          </button>

          <div style={{
            fontSize: '.74rem',
            fontWeight: 800,
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 10,
            padding: '0 4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span>Conversations</span>
            <span style={{
              fontSize: '.7rem',
              fontWeight: 700,
              background: '#f1f5f9',
              color: '#334155',
              padding: '2px 7px',
              borderRadius: 8,
            }}>
              {conversations.length}
            </span>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {isInitializing ? (
              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                <Loading message="Loading chats..." />
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 12px', color: '#64748b', fontSize: '.84rem' }}>
                <MessageSquare size={30} className="text-slate-300" style={{ margin: '0 auto 8px' }} />
                <span>No previous conversations. Start a new career discussion!</span>
              </div>
            ) : (
              conversations.map((c) => {
                const isActive = c.id === activeConversationId;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectConversation(c.id)}
                    style={{
                      padding: '11px 13px',
                      borderRadius: 12,
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 8,
                      background: isActive ? 'rgba(16, 185, 129, 0.08)' : '#ffffff',
                      border: isActive ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid #e2e8f0',
                      boxShadow: isActive ? '0 2px 10px rgba(16, 185, 129, 0.1)' : 'none',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: '.84rem',
                        color: isActive ? '#065f46' : '#0f172a',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: 2,
                      }}>
                        {c.title || 'Career Discussion'}
                      </div>
                      {c.last_message_preview && (
                        <div style={{
                          fontSize: '.75rem',
                          color: '#475569',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {c.last_message_preview}
                        </div>
                      )}
                      <div style={{ fontSize: '.7rem', color: '#64748b', marginTop: 4 }}>
                        {formatTime(c.updated_at)} &bull; {c.message_count} messages
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteConversation(e, c.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: 4,
                        borderRadius: 6,
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                      title="Delete conversation"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Column: Live Chat Stream */}
        <div
          className={`flex flex-col overflow-hidden ${
            isContextOpen ? 'lg:col-span-6' : 'lg:col-span-9'
          }`}
          style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid rgba(16, 185, 129, 0.22)',
            borderRadius: 20,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          {/* Chat Stream Header */}
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '.86rem' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }} />
              <span style={{ fontWeight: 800, color: '#0f172a' }}>
                {activeConversationId ? 'Active Career Advisory' : 'New Advisory Session'}
              </span>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <span style={{ color: '#475569', fontWeight: 600 }}>Benchmark: <strong className="text-emerald-700">{targetRole}</strong></span>
            </div>

            <div className="md:hidden">
              <button
                onClick={handleStartNewChat}
                style={{ fontSize: '.82rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <Plus size={14} />
                <span>New</span>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar" style={{ background: '#f8fafc' }}>
            {isLoadingMessages ? (
              <div className="h-full flex items-center justify-center">
                <Loading message="Retrieving conversation..." />
              </div>
            ) : messages.length === 0 ? (
              /* Starter Onboarding Experience */
              <div className="h-full flex flex-col justify-center max-w-xl mx-auto py-6">
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 18,
                    background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                    color: '#ffffff',
                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)',
                  }}>
                    <Sparkles size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
                    Ask Me Anything About Your Career
                  </h3>
                  <p style={{ fontSize: '.88rem', color: '#475569', lineHeight: 1.6 }}>
                    I am trained on your verified CareerTwin AI assessment history across all 11 modules.
                    Select a starter prompt below or ask your own question.
                  </p>
                </div>

                {/* Starter Prompt Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {STARTER_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(p.prompt)}
                      style={{
                        padding: '13px 15px',
                        borderRadius: 14,
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Compass size={14} className="text-emerald-600 flex-shrink-0" />
                        <span style={{ fontSize: '.84rem', fontWeight: 700, color: '#0f172a' }}>
                          {p.title}
                        </span>
                      </div>
                      <div style={{ fontSize: '.78rem', color: '#475569', lineHeight: 1.45 }}>
                        {p.prompt}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Message List */
              messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const mode = msg.generation_mode || (
                  (Boolean(msg.is_fallback) || msg.provider_used === 'careertwin_deterministic')
                    ? (msg.provider_error ? 'ai_unavailable' : 'fallback_mode')
                    : 'ai_mode'
                );
                const displayModel = msg.provider_used && msg.provider_used !== 'careertwin_deterministic'
                  ? msg.provider_used.replace('gemini:', '').replace('openai:', '').replace('groq:', '')
                  : 'Gemini';

                return (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: 11,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      background: isUser ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#ffffff',
                      color: isUser ? '#ffffff' : '#059669',
                      border: isUser ? 'none' : '1px solid rgba(16, 185, 129, 0.25)',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
                    }}>
                      {isUser ? <User size={16} /> : <Bot size={16} />}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`${isUser ? 'max-w-[78%]' : 'max-w-[85%]'} rounded-2xl relative group break-words [overflow-wrap:anywhere] min-w-0`}
                      style={
                        isUser
                          ? {
                              background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                              color: '#ffffff',
                              borderBottomRightRadius: 4,
                              boxShadow: '0 4px 16px rgba(5, 150, 105, 0.25)',
                              padding: '13px 18px',
                              fontWeight: 500,
                            }
                          : {
                              background: '#ffffff',
                              border: '1px solid rgba(16, 185, 129, 0.22)',
                              color: '#1e293b',
                              borderBottomLeftRadius: 4,
                              boxShadow: '0 3px 14px rgba(15, 23, 42, 0.04)',
                              padding: '18px 22px',
                            }
                      }
                    >
                      {/* Body */}
                      {isUser ? (
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '.88rem' }}>{msg.content}</p>
                      ) : (
                        <MarkdownContent content={msg.content} />
                      )}

                      {/* Footer: Timestamp, Provider/Fallback Badge & Actions */}
                      <div
                        style={{
                          marginTop: 10,
                          paddingTop: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 8,
                          fontSize: '.72rem',
                          borderTop: isUser ? '1px solid rgba(255,255,255,0.22)' : '1px solid #f1f5f9',
                          color: isUser ? 'rgba(255,255,255,0.85)' : '#64748b',
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>{formatTime(msg.created_at)}</span>

                        {!isUser && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {/* Generation Mode Badge */}
                            {mode === 'ai_mode' ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4.5,
                                  padding: '2px 8px',
                                  borderRadius: 6,
                                  fontSize: '.71rem',
                                  fontWeight: 700,
                                  background: 'rgba(16, 185, 129, 0.12)',
                                  color: '#065f46',
                                  border: '1px solid rgba(16, 185, 129, 0.32)',
                                }}
                                title={`Real LLM response generated by ${msg.provider_used || 'Google Gemini AI'}`}
                              >
                                <Sparkles size={11} className="text-emerald-600" />
                                <span>AI Mode ({displayModel})</span>
                              </span>
                            ) : mode === 'ai_unavailable' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span
                                  title={`AI provider temporarily unavailable (${msg.provider_error || 'rate limit or network disruption'}). Grounded benchmark response supplied.`}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '2px 8px',
                                    borderRadius: 6,
                                    fontSize: '.7rem',
                                    fontWeight: 700,
                                    background: '#fef2f2',
                                    color: '#991b1b',
                                    border: '1px solid #fecaca',
                                  }}
                                >
                                  <AlertTriangle size={11} />
                                  <span>AI Unavailable</span>
                                </span>

                                <button
                                  onClick={() => handleRetryMessage(msg)}
                                  disabled={retryingMsgId === msg.id}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '2px 8px',
                                    borderRadius: 6,
                                    fontSize: '.7rem',
                                    fontWeight: 700,
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    color: '#065f46',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    cursor: retryingMsgId === msg.id ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.15s ease',
                                  }}
                                  title="Retry generating response with live Google Gemini AI"
                                >
                                  <RefreshCw size={11} className={retryingMsgId === msg.id ? 'animate-spin' : ''} />
                                  <span>{retryingMsgId === msg.id ? 'Retrying...' : 'Retry with AI'}</span>
                                </button>
                              </div>
                            ) : (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '2px 8px',
                                  borderRadius: 6,
                                  fontSize: '.7rem',
                                  fontWeight: 700,
                                  background: '#f1f5f9',
                                  color: '#334155',
                                  border: '1px solid #cbd5e1',
                                }}
                                title="Deterministic curriculum engine response based on verified student benchmarks."
                              >
                                <Compass size={11} className="text-slate-500" />
                                <span>Fallback Mode</span>
                              </span>
                            )}

                            {/* Copy Button */}
                            <button
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#64748b',
                                cursor: 'pointer',
                                padding: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3,
                                fontWeight: 600,
                              }}
                              title="Copy response text"
                            >
                              {copiedMessageId === msg.id ? (
                                <>
                                  <Check size={12} color="#059669" />
                                  <span style={{ color: '#059669' }}>Copied</span>
                                </>
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}

            {/* Thinking / Analyzing Indicator */}
            {isSending && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3.5"
              >
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 11,
                  background: '#ffffff',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Bot size={16} />
                </div>
                <div style={{
                  padding: '12px 18px',
                  borderRadius: 16,
                  borderBottomLeftRadius: 4,
                  background: '#ffffff',
                  border: '1px solid rgba(16, 185, 129, 0.22)',
                  fontSize: '.84rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
                }}>
                  <RefreshCw size={14} className="animate-spin text-emerald-600" />
                  <span>Synthesizing student data and generating career advice...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box Footer */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', background: '#ffffff', flexShrink: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 10,
              background: '#f8fafc',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 14,
              padding: '8px 12px',
              transition: 'border-color 0.15s ease',
            }}>
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your career question... (Enter to send, Shift+Enter for new line)"
                rows={2}
                disabled={isSending}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '.9rem',
                  fontFamily: 'var(--font)',
                  color: '#0f172a',
                  fontWeight: 500,
                  resize: 'none',
                  minHeight: 44,
                  maxHeight: 140,
                  padding: '4px 4px',
                }}
              />

              <button
                id="career-assistant-send-btn"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isSending}
                className="btn btn--primary"
                style={{
                  padding: '9px 18px',
                  borderRadius: 10,
                  fontSize: '.84rem',
                  fontWeight: 700,
                  flexShrink: 0,
                  background: (!inputText.trim() || isSending)
                    ? '#cbd5e1'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: (!inputText.trim() || isSending) ? 'not-allowed' : 'pointer',
                  boxShadow: (!inputText.trim() || isSending) ? 'none' : '0 3px 12px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.15s ease',
                }}
                title="Send Message"
              >
                {isSending ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
              </button>
            </div>
            <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: '.74rem', color: '#64748b', padding: '0 4px' }}>
              <span>Press <strong>Shift + Enter</strong> for a new line</span>
              <span>Grounded for <strong>{contextSnapshot?.student_name || 'Student'}</strong></span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Context & Snapshot Panel (Collapsible) */}
        {isContextOpen && (
          <div
            className="lg:col-span-3 min-w-0 flex flex-col overflow-y-auto custom-scrollbar space-y-4"
            style={{
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid rgba(16, 185, 129, 0.22)',
              borderRadius: 20,
              padding: 18,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '.9rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Briefcase size={16} className="text-emerald-600" />
                <span>Student Context</span>
              </div>
              <span style={{
                fontSize: '.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 99,
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#065f46',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}>
                {contextSnapshot?.available_modules_count || 0}/11 Assessed
              </span>
            </div>

            {/* Target Role Card */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.28)',
              borderRadius: 14,
              padding: '12px 14px',
            }}>
              <span style={{ fontSize: '.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 2 }}>
                Active Benchmark Role
              </span>
              <div style={{ fontSize: '.98rem', fontWeight: 800, color: '#0f172a' }}>
                {targetRole}
              </div>
              <div style={{ fontSize: '.76rem', color: '#475569', marginTop: 3 }}>
                {contextSnapshot?.education_level || 'Undergraduate'} &bull; {contextSnapshot?.experience_months || 0} mo exp
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                padding: '10px 14px',
                borderRadius: 12,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '.8rem', color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={14} className="text-emerald-600" />
                  Readiness
                </span>
                <span style={{ fontSize: '.86rem', fontWeight: 800, color: '#059669' }}>
                  {readiness}
                </span>
              </div>

              <div style={{
                padding: '10px 14px',
                borderRadius: 12,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '.8rem', color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileCheck size={14} className="text-emerald-600" />
                  ATS Score
                </span>
                <span style={{ fontSize: '.86rem', fontWeight: 800, color: '#0f172a' }}>
                  {atsScore}
                </span>
              </div>

              <div style={{
                padding: '10px 14px',
                borderRadius: 12,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '.8rem', color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <GitBranch size={14} className="text-sky-600" />
                  GitHub Score
                </span>
                <span style={{ fontSize: '.86rem', fontWeight: 800, color: '#0f172a' }}>
                  {githubScore}
                </span>
              </div>

              <div style={{
                padding: '10px 14px',
                borderRadius: 12,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '.8rem', color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Compass size={14} className="text-indigo-600" />
                  Roadmap Progress
                </span>
                <span style={{ fontSize: '.86rem', fontWeight: 800, color: '#0f172a' }}>
                  {roadmapProgress}
                </span>
              </div>
            </div>

            {/* Critical Growth Areas Section (Dark, high contrast badges) */}
            {criticalGaps.length > 0 && (
              <div style={{ paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '.72rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                  <AlertTriangle size={12} />
                  <span>Critical Growth Areas</span>
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {criticalGaps.slice(0, 6).map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: '.74rem',
                        fontWeight: 700,
                        background: '#fef2f2',
                        color: '#991b1b',
                        border: '1px solid #fecaca',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Verified Competencies */}
            {verifiedSkills.length > 0 && (
              <div style={{ paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '.72rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                  <CheckCircle2 size={12} />
                  <span>Verified Competencies</span>
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {verifiedSkills.slice(0, 6).map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: '.74rem',
                        fontWeight: 700,
                        background: '#ecfdf5',
                        color: '#065f46',
                        border: '1px solid #a7f3d0',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Prompts Helper */}
            <div style={{ paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                Quick Questions
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  'What are my biggest skill gaps?',
                  'Why do I need SQL for this role?',
                  'How to improve my ATS score?',
                  'What should I learn this week?',
                  'Compare Data Analyst vs Python Developer',
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q)}
                    disabled={isSending}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: 10,
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      fontSize: '.76rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.background = '#ffffff';
                    }}
                  >
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q}</span>
                    <ChevronRight size={13} className="text-slate-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{ fontSize: '.72rem', color: '#64748b', lineHeight: 1.5, paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
              Personalized career guidance is grounded in your verified CareerTwin AI assessment history.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
