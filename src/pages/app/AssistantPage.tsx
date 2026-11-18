import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Edit2,
  Check,
  Copy,
  AlertTriangle,
  Heart,
  Target,
  ShieldCheck,
  RefreshCw,
  MessageSquare,
  Search,
  Menu,
  Globe,
  Info,
  X,
  Paperclip,
  Database,
  Bot,
} from 'lucide-react';
import {
  assistantService,
  toSafeArray,
  ConversationSummary,
  ChatMessageItem,
  PersonalContextSummary,
} from '../../services/assistantService';
import { useAuth } from '../../context/AuthContext';
import { MarkdownView } from '../../components/assistant/MarkdownView';
import { anim, UP, EASE, reduceMotion } from '../../lib/anim';
import '../../styles/chatbox.css';

interface PromptChip {
  icon: 'db' | 'shield' | 'spark' | 'target';
  label: string;
  prompt: string;
}

const CHIPS: PromptChip[] = [
  { icon: 'db', label: "Today's intake", prompt: 'What food did I intake today?' },
  { icon: 'shield', label: 'Foods to avoid', prompt: 'What foods should I avoid with my health profile?' },
  { icon: 'spark', label: 'Meal ideas', prompt: 'Suggest a healthy Bangladeshi meal within my budget' },
  { icon: 'target', label: 'Protein target', prompt: 'How much protein have I consumed today towards my goal?' },
];

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good Morning';
  if (h >= 12 && h < 17) return 'Good Afternoon';
  if (h >= 17 && h < 21) return 'Good Evening';
  return 'Good Night';
}

export const AssistantPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { i18n } = useTranslation();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Mobile sidebar drawer
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Rename Conversation State
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Context Modal State
  const [showContextModal, setShowContextModal] = useState(false);
  const [personalContext, setPersonalContext] = useState<PersonalContextSummary | null>(null);
  const [loadingContext, setLoadingContext] = useState(false);

  // Animation Refs
  const orbRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const composerFormRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastComposerTop = useRef<number | null>(null);

  const isWelcome = messages.length === 0;
  const prevWelcome = useRef(isWelcome);
  const greeting = useMemo(getTimeGreeting, []);

  const userName = useMemo(() => {
    return profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Albert';
  }, [profile, user]);

  const userInitial = useMemo(() => {
    return userName.charAt(0).toUpperCase();
  }, [userName]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setErrorMsg(null);
      const list = await assistantService.listConversations();
      setConversations(list);
      if (list.length > 0 && !activeConversationId) {
        selectConversation(list[0].id);
      }
    } catch (err: any) {
      console.warn('Could not load conversations:', err);
    }
  };

  const selectConversation = async (conversationId: string) => {
    try {
      setActiveConversationId(conversationId);
      setSidebarOpen(false);
      setErrorMsg(null);
      const detail = await assistantService.getConversation(conversationId);
      setMessages(detail.messages || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load conversation messages');
    }
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setErrorMsg(null);
    setSidebarOpen(false);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  // Auto-scroll on new messages
  useEffect(() => {
    if (threadRef.current) {
      const t = threadRef.current;
      t.scrollTo({ top: t.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }, [messages.length, isLoading]);

  // Welcome Hero Entrance Animation
  useEffect(() => {
    if (isWelcome) {
      anim(orbRef.current, [{ opacity: 0, transform: 'scale(.55)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 650 });
      anim(heroTitleRef.current, UP, { duration: 560, delay: 140 });
    }
  }, [isWelcome]);

  // FLIP Transition for Composer between centered (welcome) and bottom (chat)
  useLayoutEffect(() => {
    if (!composerFormRef.current) return;
    const top = composerFormRef.current.getBoundingClientRect().top;
    if (prevWelcome.current !== isWelcome && lastComposerTop.current != null) {
      const d = lastComposerTop.current - top;
      if (d) {
        anim(composerFormRef.current, [{ transform: `translateY(${d}px)` }, { transform: 'none' }], { duration: 540, fill: 'none' });
      }
    }
    prevWelcome.current = isWelcome;
    lastComposerTop.current = top;
  });

  // Textarea auto-resize with smooth easing
  useLayoutEffect(() => {
    const t = textareaRef.current;
    if (!t) return;
    const prev = t.offsetHeight;
    t.style.transition = 'none';
    t.style.height = 'auto';
    const next = Math.max(24, Math.min(t.scrollHeight, 160));
    t.style.height = `${prev}px`;
    void t.offsetHeight; // force reflow
    t.style.transition = reduceMotion ? 'none' : `height .18s ${EASE}`;
    t.style.height = `${next}px`;
  }, [inputValue]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    setErrorMsg(null);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
    }

    if (sendBtnRef.current) {
      anim(sendBtnRef.current, [{ transform: 'scale(1)' }, { transform: 'scale(.82)' }, { transform: 'scale(1)' }], {
        duration: 260,
        fill: 'none',
      });
    }

    // Optimistically append user's message
    const tempUserMsgId = `temp-${Date.now()}`;
    const userMsg: ChatMessageItem = {
      id: tempUserMsgId,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    const streamMsgId = `stream-${Date.now()}`;
    const placeholderAsstMsg: ChatMessageItem = {
      id: streamMsgId,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
      metadata: {
        model: 'Gemma 4 26B',
        provider: 'google_ai_studio',
        citations: [
          'Food Composition Table for Bangladesh (FCTB / FCDB 2014) - INFS, University of Dhaka & FAO',
          'FoodNet Bangladesh Comprehensive Database (FoodNetBD 2024)',
        ],
      },
    };

    setMessages((prev) => [...prev, userMsg, placeholderAsstMsg]);
    setIsLoading(true);

    try {
      const response = await assistantService.sendMessage(
        text,
        activeConversationId || undefined,
        (chunkText) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === streamMsgId ? { ...m, content: chunkText } : m))
          );
        }
      );

      // Finalize the assistant message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamMsgId
            ? {
                ...m,
                id: response.message_id,
                content: response.reply,
                metadata: {
                  model: response.model_used,
                  provider: response.provider,
                  citations: response.citations,
                },
              }
            : m
        )
      );

      if (!activeConversationId && response.conversation_id) {
        setActiveConversationId(response.conversation_id);
      }
      assistantService.listConversations().then(setConversations).catch(() => {});
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m.id !== streamMsgId || m.content.trim().length > 0));
      setErrorMsg(err.message || 'Unable to connect to NutriLens AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleDeleteConversation = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await assistantService.deleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (activeConversationId === conversationId) {
        startNewConversation();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete conversation');
    }
  };

  const handleStartRename = (e: React.MouseEvent, conv: ConversationSummary) => {
    e.stopPropagation();
    setEditingConvId(conv.id);
    setEditingTitle(conv.title);
  };

  const handleSaveRename = async (e: React.FormEvent | React.MouseEvent, conversationId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!editingTitle.trim()) return;

    try {
      const updated = await assistantService.renameConversation(conversationId, editingTitle.trim());
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, title: updated.title } : c))
      );
      setEditingConvId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to rename conversation');
    }
  };

  const fetchContextSummary = async () => {
    try {
      setLoadingContext(true);
      setShowContextModal(true);
      const data = await assistantService.getContextSummary();
      setPersonalContext(data);
    } catch (err: any) {
      console.error('Failed to load personal context:', err);
    } finally {
      setLoadingContext(false);
    }
  };

  const toggleLanguage = () => {
    const next = i18n.language === 'bn' ? 'en' : 'bn';
    i18n.changeLanguage(next);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="nutrilens-chatbox h-[calc(100vh-4.2rem)] -m-4 sm:-m-6 lg:-m-8 p-2 sm:p-3 overflow-hidden select-none">
      <div className="chat-app">
        {/* 1. Floating Sidebar */}
        <aside className={`chat-side${sidebarOpen ? ' open' : ''}`} aria-label="Conversations">
          {/* Brand Header */}
          <div className="chat-brand">
            <div className="chat-brand-logo">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="chat-brand-title">NutriLens AI</div>
              <small className="chat-brand-sub">Nutrition Workspace</small>
            </div>
          </div>

          {/* Search Box */}
          <label className="chat-search">
            <Search className="w-4 h-4" />
            <input
              type="search"
              placeholder="Search conversations..."
              aria-label="Search conversations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>

          {/* Conversations Section */}
          <div className="chat-sect">
            <div className="chat-label head">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Conversations</span>
            </div>
            <div className="chat-label sub">Strictly Isolated & Private</div>
            <div className="chat-label">Recent Chats</div>

            <div role="list" className="space-y-1">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  {searchQuery ? 'No matching conversations' : 'No chats yet. Start one!'}
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  const isEditing = conv.id === editingConvId;

                  if (isEditing) {
                    return (
                      <div
                        key={conv.id}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-forest-cardHover border border-emerald-500"
                      >
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="w-full text-xs bg-white dark:bg-forest-root border border-slate-300 dark:border-forest-border rounded px-2 py-1 text-slate-900 dark:text-white focus:outline-none"
                          autoFocus
                        />
                        <div className="flex justify-end gap-1 mt-1.5">
                          <button
                            onClick={(e) => handleSaveRename(e, conv.id)}
                            className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingConvId(null)}
                            className="px-2 py-0.5 rounded bg-slate-200 dark:bg-forest-border text-slate-700 dark:text-slate-300 text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={conv.id} className="chat-item-wrap">
                      <button
                        type="button"
                        role="listitem"
                        className="chat-item"
                        aria-current={isActive ? 'true' : 'false'}
                        onClick={() => selectConversation(conv.id)}
                      >
                        <MessageSquare className="w-3.5 h-3.5 chat-item-ico shrink-0" />
                        <span>{conv.title}</span>

                        <div className="chat-item-actions">
                          <button
                            onClick={(e) => handleStartRename(e, conv)}
                            className="chat-action-btn"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteConversation(e, conv.id)}
                            className="chat-action-btn del"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* 2. Floating Main Workbench */}
        <main className={`chat-main ${isWelcome ? 'is-welcome' : 'is-chat'}`}>
          {/* Top Bar */}
          <div className="chat-topbar">
            <button
              className="chat-menu-btn"
              type="button"
              aria-label="Open conversations"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Model status pill with green pulsing dot */}
            <div className="chat-pill" title="Live Google AI Studio Gemma 4 26B streaming active">
              <span className="chat-dot" />
              <span>Gemma 4 26B</span>
            </div>

            <div className="chat-spacer" />

            {/* Language toggle: বাং / EN */}
            <button
              className="chat-pill btn"
              type="button"
              onClick={toggleLanguage}
              title="Toggle language (বাংলা / English)"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold">{i18n.language === 'bn' ? 'বাং' : 'EN'}</span>
            </button>

            {/* Active profile context trigger */}
            <button
              className="chat-pill btn chat-hide-sm"
              type="button"
              onClick={fetchContextSummary}
              title="View your verified personal clinical and dietary context"
            >
              <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Active Profile Context</span>
            </button>

            {/* New Chat Button */}
            <button
              className="chat-dark-btn"
              type="button"
              onClick={startNewConversation}
              title="Start a fresh conversation"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>

            {/* User Avatar Circle */}
            <div className="chat-avatar sm" title={userName}>
              {userInitial}
            </div>
          </div>

          {/* Chat Header (shown in chat state) */}
          {!isWelcome && (
            <div className="chat-head">
              <div className="chat-head-logo">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2>NutriLens AI</h2>
                <p>Personalized using verified health profile &amp; meal records</p>
              </div>
              <span className="chat-tag">Personal Nutrition Assistant</span>
            </div>
          )}

          {/* Welcome Hero (shown in welcome state) */}
          {isWelcome && (
            <section className="chat-hero" aria-live="polite">
              <div className="chat-orb" ref={orbRef} aria-hidden="true" />
              <h1 ref={heroTitleRef}>
                {greeting}, {userName}
                <br />
                How Can I <em>Assist You Today?</em>
              </h1>
            </section>
          )}

          {/* Message Thread (shown in chat state) */}
          {!isWelcome && (
            <section className="chat-thread" ref={threadRef} aria-live="polite">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';

                return (
                  <div
                    key={msg.id}
                    className={`chat-row${isUser ? ' chat-user-row' : ''}`}
                    data-mid={msg.id}
                  >
                    <div className="chat-bubble">
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : !msg.content ? (
                        <div className="chat-typing">
                          <i />
                          <i />
                          <i />
                          <span className="text-xs text-slate-400 ml-2">
                            NutriLens is preparing personalized advice...
                          </span>
                        </div>
                      ) : (
                        <div className="relative">
                          <MarkdownView content={msg.content} />
                          {isLoading && msg.id.startsWith('stream-') && (
                            <span className="inline-block w-1.5 h-3.5 bg-emerald-500 ml-1 animate-pulse align-middle" />
                          )}
                        </div>
                      )}

                      {/* Assistant copy button */}
                      {!isUser && msg.content && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="chat-copy-btn"
                          title="Copy text"
                        >
                          {copiedMsgId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      {/* Metadata citations */}
                      {!isUser && msg.content && (
                        <div className="chat-meta-bar">
                          <span className="chat-badge">
                            <Bot className="w-3 h-3" />
                            <span>
                              {msg.metadata?.model
                                ? msg.metadata.model.includes('gemma')
                                  ? 'Gemma 4 26B'
                                  : msg.metadata.model
                                : 'Gemma 4 26B'}
                            </span>
                          </span>
                          {msg.metadata?.citations?.map((cite, cIdx) => (
                            <span key={cIdx} className="chat-badge cite">
                              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>{cite}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing row fallback */}
              {isLoading && !messages.some((m) => m.id.startsWith('stream-')) && (
                <div className="chat-row chat-typing-row">
                  <div className="chat-bubble">
                    <span className="chat-typing" aria-label="NutriLens AI is typing">
                      <i />
                      <i />
                      <i />
                      <span className="text-xs text-slate-400 ml-2">Analyzing Bangladesh nutrition records...</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Error banner */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between max-w-[var(--chat-w)] mx-auto my-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMsg}</span>
                  </div>
                  <button
                    onClick={() => handleSendMessage()}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </section>
          )}

          {/* Spacer for Welcome State */}
          {isWelcome && <div className="chat-tail" />}

          {/* Composer with glowing emerald ambient blur */}
          <div className="chat-composer-wrap">
            <form
              className="chat-composer"
              ref={composerFormRef}
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <div className="chat-field">
                <Sparkles className="w-4 h-4 chat-field-ico" />
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask NutriLens AI about your meals, allergies, or nutrition targets..."
                  aria-label="Message"
                  disabled={isLoading}
                />
              </div>

              <div className="chat-tools">
                <button
                  type="button"
                  className="chat-chip icon-only"
                  aria-label="Attach context or meal image"
                  title="Attach meal record or context"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                </button>

                {CHIPS.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    className="chat-chip"
                    onClick={() => {
                      setInputValue(c.prompt);
                      textareaRef.current?.focus();
                    }}
                  >
                    {c.icon === 'db' && <Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                    {c.icon === 'shield' && <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                    {c.icon === 'spark' && <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                    {c.icon === 'target' && <Target className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                    <span>{c.label}</span>
                  </button>
                ))}

                <button
                  type="submit"
                  ref={sendBtnRef}
                  className={`chat-send${inputValue.trim() && !isLoading ? ' ready' : ''}`}
                  aria-label="Send"
                  disabled={!inputValue.trim() || isLoading}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Mobile Drawer Scrim */}
      <div
        className={`chat-scrim${sidebarOpen ? ' show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Active Personal Context Modal */}
      {showContextModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-forest-card rounded-2xl border border-slate-200 dark:border-forest-border p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-forest-border/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  My Active AI Context &amp; Health Profile
                </h3>
              </div>
              <button
                onClick={() => setShowContextModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-forest-cardHover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingContext ? (
              <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                <span>Loading your verified context...</span>
              </div>
            ) : personalContext ? (
              <div className="space-y-4 text-xs">
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  NutriLens AI only accesses the verified personal data below. No other user can ever view or access this information.
                </p>

                {/* Physical Profile */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Physical Profile &amp; Vitals</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                    <div className="p-1.5 rounded bg-white dark:bg-forest-card border border-slate-100 dark:border-forest-border">
                      <span className="text-slate-400 block">Weight</span>
                      <span className="font-semibold text-slate-800 dark:text-white">{personalContext.profile?.weight || '65 kg'}</span>
                    </div>
                    <div className="p-1.5 rounded bg-white dark:bg-forest-card border border-slate-100 dark:border-forest-border">
                      <span className="text-slate-400 block">Height</span>
                      <span className="font-semibold text-slate-800 dark:text-white">{personalContext.profile?.height || '170 cm'}</span>
                    </div>
                    <div className="p-1.5 rounded bg-white dark:bg-forest-card border border-slate-100 dark:border-forest-border">
                      <span className="text-slate-400 block">Activity</span>
                      <span className="font-semibold text-slate-800 dark:text-white capitalize">{personalContext.profile?.activity_level || 'Moderate'}</span>
                    </div>
                    <div className="p-1.5 rounded bg-white dark:bg-forest-card border border-slate-100 dark:border-forest-border">
                      <span className="text-slate-400 block">BMI</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{personalContext.profile?.bmi || '22.5'}</span>
                    </div>
                  </div>
                </div>

                {/* Daily Budget */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Daily Food Budget Allowance</span>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      ৳ {personalContext.budget?.daily_amount || 150} {personalContext.budget?.currency || 'BDT'}
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-white dark:bg-forest-card border border-slate-100 dark:border-forest-border">
                      <span className="text-slate-400 block">Bazar Spent Today</span>
                      <span className="font-bold text-slate-800 dark:text-white">
                        ৳ {personalContext.budget?.spent_today?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-white dark:bg-forest-card border border-slate-100 dark:border-forest-border">
                      <span className="text-slate-400 block">Remaining Budget</span>
                      <span className={`font-bold ${(personalContext.budget?.remaining_today ?? 150) < 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        ৳ {personalContext.budget?.remaining_today !== undefined ? personalContext.budget.remaining_today.toFixed(2) : '150.00'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nutrition Goals & Intake */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Daily Goals &amp; Confirmed Intake (Today)</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-white dark:bg-forest-card border border-slate-100 dark:border-forest-border">
                      <span className="text-slate-400 block">Energy Intake</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                        {personalContext.consumption_today?.calories_consumed || 0} kcal
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Target: {personalContext.goals?.daily_calorie_target || 2000} kcal
                      </span>
                    </div>
                    <div className="p-2 rounded bg-white dark:bg-forest-card border border-slate-100 dark:border-forest-border">
                      <span className="text-slate-400 block">Protein Intake</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                        {personalContext.consumption_today?.protein_g_consumed || 0} g
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Target: {personalContext.goals?.daily_protein_target_g || 65} g
                      </span>
                    </div>
                    <div className="p-2 rounded bg-white dark:bg-forest-card border border-slate-100 dark:border-forest-border">
                      <span className="text-slate-400 block">Carbohydrates</span>
                      <span className="font-bold text-sky-600 dark:text-sky-400 block">
                        {personalContext.consumption_today?.carbs_g_consumed || 0} g
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Target: {personalContext.goals?.daily_carb_target_g || 250} g
                      </span>
                    </div>
                    <div className="p-2 rounded bg-white dark:bg-forest-card border border-slate-100 dark:border-forest-border">
                      <span className="text-slate-400 block">Fat Intake</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400 block">
                        {personalContext.consumption_today?.fat_g_consumed || 0} g
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Target: {personalContext.goals?.daily_fat_target_g || 55} g
                      </span>
                    </div>
                  </div>

                  {personalContext.consumption_today?.recent_foods && personalContext.consumption_today.recent_foods.length > 0 && (
                    <div className="pt-1.5 border-t border-slate-200 dark:border-forest-border text-[11px]">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Foods Eaten Today:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {personalContext.consumption_today.recent_foods.map((food, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px]"
                          >
                            {food}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Clinical Restrictions */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Clinical Restrictions &amp; Allergies</span>
                  </h4>
                  <div className="space-y-1">
                    <p className="text-slate-500 dark:text-slate-400">
                      <strong>Food Allergies:</strong>{' '}
                      {toSafeArray(personalContext.medical?.allergies).length > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">
                          {toSafeArray(personalContext.medical?.allergies).join(', ')}
                        </span>
                      ) : (
                        'None recorded'
                      )}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      <strong>Medical Conditions:</strong>{' '}
                      {toSafeArray(personalContext.medical?.conditions).length > 0
                        ? toSafeArray(personalContext.medical?.conditions).join(', ')
                        : 'None recorded'}
                    </p>
                    {toSafeArray(personalContext.medical?.intolerances).length > 0 && (
                      <p className="text-slate-500 dark:text-slate-400">
                        <strong>Intolerances:</strong>{' '}
                        {toSafeArray(personalContext.medical?.intolerances).join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Preferences */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-teal-500" />
                    <span>Preferences &amp; Dislikes</span>
                  </h4>
                  {toSafeArray(personalContext.dietary_preferences?.favorite_foods).length > 0 && (
                    <p className="text-slate-500 dark:text-slate-400">
                      <strong>Favorite Foods:</strong>{' '}
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {toSafeArray(personalContext.dietary_preferences?.favorite_foods).join(', ')}
                      </span>
                    </p>
                  )}
                  <p className="text-slate-500 dark:text-slate-400">
                    <strong>Disliked Foods:</strong>{' '}
                    {toSafeArray(personalContext.dietary_preferences?.disliked_foods).length > 0
                      ? toSafeArray(personalContext.dietary_preferences?.disliked_foods).join(', ')
                      : 'None'}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    <strong>Preferred Cuisines:</strong>{' '}
                    {toSafeArray(personalContext.dietary_preferences?.cuisine_preferences).join(', ')}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Could not retrieve context summary.</p>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowContextModal(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
