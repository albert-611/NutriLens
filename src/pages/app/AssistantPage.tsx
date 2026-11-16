import React, { useState, useEffect, useRef } from 'react';
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
  ChevronRight,
  Info,
  X,
  Bot,
  User as UserIcon,
} from 'lucide-react';
import {
  assistantService,
  toSafeArray,
  ConversationSummary,
  ChatMessageItem,
  PersonalContextSummary,
} from '../../services/assistantService';
import { MarkdownView } from '../../components/assistant/MarkdownView';

const SUGGESTED_PROMPTS = [
  'What should I eat for breakfast today?',
  'Can I eat eggs based on my health profile?',
  'Suggest a high-protein meal within my daily budget.',
  'How much protein have I consumed today?',
  'Suggest a Bangladeshi meal plan for my nutrition goals.',
  'What foods should I avoid with my allergies?',
];

export const AssistantPage: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  
  // Context Modal State
  const [showContextModal, setShowContextModal] = useState(false);
  const [personalContext, setPersonalContext] = useState<PersonalContextSummary | null>(null);
  const [loadingContext, setLoadingContext] = useState(false);

  // Rename Conversation State
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Mobile sidebar drawer
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load user's conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsInitializing(true);
      setErrorMsg(null);
      const list = await assistantService.listConversations();
      setConversations(list);
      if (list.length > 0 && !activeConversationId) {
        selectConversation(list[0].id);
      }
    } catch (err: any) {
      console.warn('Could not load conversations:', err);
    } finally {
      setIsInitializing(false);
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
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    setErrorMsg(null);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Optimistically append user's message
    const tempUserMsgId = `temp-${Date.now()}`;
    const userMsg: ChatMessageItem = {
      id: tempUserMsgId,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await assistantService.sendMessage(text, activeConversationId || undefined);

      const asstMsg: ChatMessageItem = {
        id: response.message_id,
        role: 'assistant',
        content: response.reply,
        created_at: response.created_at,
        metadata: {
          model: response.model_used,
          provider: response.provider,
          citations: response.citations,
        },
      };

      setMessages((prev) => [...prev, asstMsg]);

      // If this was a new conversation, update activeConversationId and reload list
      if (!activeConversationId && response.conversation_id) {
        setActiveConversationId(response.conversation_id);
        const updatedList = await assistantService.listConversations();
        setConversations(updatedList);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to NutriLens AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-grow
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
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

  return (
    <div className="flex h-[calc(100vh-4.2rem)] -m-4 sm:-m-6 bg-slate-50 dark:bg-forest-root overflow-hidden">
      {/* 1. Conversations Sidebar (Desktop & Mobile Drawer) */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white dark:bg-forest-card border-r border-slate-200 dark:border-forest-border flex flex-col transition-transform duration-200 ease-in-out`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 dark:border-forest-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                Conversations
              </h2>
              <p className="text-[10px] text-slate-400">Strictly Isolated & Private</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-forest-cardHover"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={startNewConversation}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No conversations yet. Start one!
            </div>
          ) : (
            conversations.map((conv) => {
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
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-semibold border border-emerald-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-forest-cardHover'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                    <span className="truncate">{conv.title}</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleStartRename(e, conv)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteConversation(e, conv.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer: Data Isolation Guarantee */}
        <div className="p-3 border-t border-slate-100 dark:border-forest-border/60">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Zero Cross-User Data Access</span>
          </div>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* 2. Main Chat Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Workspace Top Bar */}
        <div className="h-14 px-4 sm:px-6 bg-white dark:bg-forest-card border-b border-slate-200 dark:border-forest-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-forest-cardHover"
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>NutriLens AI</span>
                  <span className="hidden sm:inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    Personal Nutrition Assistant
                  </span>
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                    <Sparkles className="w-2.5 h-2.5 text-teal-500" />
                    <span>Gemma 4 26B Active</span>
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  Personalized using verified health profile & meal records
                </p>
              </div>
            </div>
          </div>

          {/* Context Transparency Button */}
          <button
            onClick={fetchContextSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-forest-border hover:bg-slate-50 dark:hover:bg-forest-cardHover text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Active Profile Context</span>
            <span className="sm:hidden">Context</span>
          </button>
        </div>

        {/* Workspace Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 ? (
            /* Empty State / Welcome Screen */
            <div className="max-w-2xl mx-auto py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                <Bot className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Welcome to Your Personal Nutrition Assistant
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                  I analyze your verified food composition records, cross-reference known allergies, and personalize recommendations according to your specific dietary goals.
                </p>
              </div>

              {/* Verified Clinical Guardrails Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Deterministic Nutrients from FAO Bangladesh FCTB & FoodNetBD</span>
              </div>

              {/* Prompt Suggestions */}
              <div className="pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Suggested Questions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {SUGGESTED_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="p-3 rounded-xl border border-slate-200 dark:border-forest-border hover:border-emerald-500/50 bg-white dark:bg-forest-card hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-xs text-slate-700 dark:text-slate-200 transition-all flex items-start justify-between group shadow-2xs"
                    >
                      <span>{prompt}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 shrink-0 mt-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Message Bubbles Stream */
            messages.map((msg) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl ${
                    isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'
                  }`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`relative px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                        isUser
                          ? 'bg-emerald-600 text-white rounded-br-xs'
                          : 'bg-white dark:bg-forest-card border border-slate-200/80 dark:border-forest-border text-slate-900 dark:text-white rounded-bl-xs'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <MarkdownView content={msg.content} />
                      )}

                      {!isUser && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-forest-root transition-colors"
                          title="Copy text"
                        >
                          {copiedMsgId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Assistant Metadata & Citations */}
                    {!isUser && (
                      <div className="flex flex-wrap items-center gap-1.5 px-1 pt-0.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-teal-700 dark:text-teal-300 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-md">
                          <Bot className="w-2.5 h-2.5" />
                          <span>{msg.metadata?.model ? (msg.metadata.model.includes('gemma') ? 'Gemma 4 26B' : msg.metadata.model) : 'Gemma 4 26B'}</span>
                        </span>
                        {msg.metadata?.citations?.map((cite, cIdx) => (
                          <span
                            key={cIdx}
                            className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-forest-cardHover px-2 py-0.5 rounded-md"
                          >
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                            {cite}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-forest-cardHover text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-1">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-3xl mr-auto items-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white dark:bg-forest-card border border-slate-200/80 dark:border-forest-border shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-slate-400 ml-2">Consulting verified food composition tables...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between">
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
        </div>

        {/* 3. Bottom Chat Input */}
        <div className="p-4 bg-white dark:bg-forest-card border-t border-slate-200 dark:border-forest-border shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-slate-50 dark:bg-forest-root border border-slate-300 dark:border-forest-border rounded-2xl p-2 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 transition-colors">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask NutriLens AI about your meals, allergies, or nutrition targets..."
                rows={1}
                disabled={isLoading}
                className="w-full resize-none bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none max-h-32 py-1 px-2"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white transition-all shrink-0 shadow-2xs"
                title="Send message (Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 px-1">
              <span>Press <kbd className="font-mono bg-slate-100 dark:bg-forest-root px-1 py-0.5 rounded">Enter</kbd> to send, <kbd className="font-mono bg-slate-100 dark:bg-forest-root px-1 py-0.5 rounded">Shift + Enter</kbd> for newline</span>
              <span className="hidden sm:inline">NutriLens AI strictly enforces personal data isolation</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Active Personal Context Modal */}
      {showContextModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-forest-card rounded-2xl border border-slate-200 dark:border-forest-border p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-forest-border/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  My Active AI Context & Health Profile
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
                {/* Notice */}
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  NutriLens AI only accesses the verified personal data below. No other user can ever view or access this information.
                </p>

                {/* Physical Vitals & Profile */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Physical Profile & Vitals</span>
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

                {/* Daily Budget & Spending */}
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

                {/* Nutrition Goals & Today's Intake */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Daily Goals & Confirmed Intake (Today)</span>
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

                  {/* Confirmed Foods Eaten Today */}
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

                {/* Allergies & Conditions */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Clinical Restrictions & Allergies</span>
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

                {/* Dietary Preferences */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-teal-500" />
                    <span>Preferences & Dislikes</span>
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
