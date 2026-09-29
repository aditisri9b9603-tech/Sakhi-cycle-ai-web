import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { calculateCycleStatus } from '../utils/cycleCalculations';
import { getTranslation } from '../utils/translations';
import { firestore } from '../lib/firebaseClient';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import {
  Sparkles,
  Send,
  ShieldAlert,
  Loader2,
  Bot,
  User,
  Heart,
  HelpCircle,
  ShieldCheck,
  Zap,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  Lock,
  Globe,
  ExternalLink,
  Search,
} from 'lucide-react';

interface ChatSource {
  title: string;
  url: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'sakhi';
  text: string;
  timestamp: string;
  modelUsed?: string;
  groundedWithSearch?: boolean;
  searchQueries?: string[];
  sources?: ChatSource[];
}

export const SakhiAIChat: React.FC = () => {
  const { cycleSettings, dailyLogs, language } = useApp();
  const { user, isSigningIn, signInWithGoogle } = useAuth();
  const currentStatus = calculateCycleStatus(cycleSettings);
  const t = (key: string, params?: Record<string, string | number>) =>
    getTranslation(language, key, params);

  // Gemini model selection per requirements:
  // "Use gemini-3.1-pro-preview for particularly complex tasks, gemini-3.5-flash for general tasks, and gemini-3.1-flash-lite for tasks that should happen fast."
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'sakhi',
      text:
        language === 'hi'
          ? `नमस्ते ${user?.displayName ? user.displayName.split(' ')[0] : 'सखी'}! मैं आपकी समर्पित वेलनेस साथी हूँ। आप वर्तमान में अपने ${currentStatus.phaseTitle} (दिन ${currentStatus.currentDay} / ${currentStatus.totalDays}) में हैं। मैं आपकी घरेलू देखभाल, खानपान, हर्बल चाय, या पीरियड से जुड़े किसी भी सवाल में कैसे सहायता करूँ?`
          : `Hello, ${user?.displayName ? user.displayName.split(' ')[0] : 'sweet soul'}. I am Sakhi, your compassionate, culturally sensitive cycle wellness companion. You are currently in your ${currentStatus.phaseTitle} (Day ${currentStatus.currentDay} of ${currentStatus.totalDays}). How may I support your comfort, hormonal rhythm, and inner calm today?`,
      timestamp: 'Just now',
      modelUsed: 'gemini-3.5-flash',
      groundedWithSearch: true,
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from Firestore for authenticated users
  useEffect(() => {
    if (!user || user.isAnonymous || !firestore) return;

    let isMounted = true;
    async function loadPastHistory() {
      if (!user) return;
      try {
        const currentUserId = user.uid || user.id;
        const chatCol = collection(firestore!, 'users', currentUserId, 'chatHistory');
        const q = query(chatCol, orderBy('createdAt', 'asc'), limit(25));
        const snap = await getDocs(q);

        if (!snap.empty && isMounted) {
          const loaded: ChatMessage[] = [];
          snap.forEach((docItem) => {
            const data = docItem.data();
            loaded.push({
              id: docItem.id,
              sender: data.sender || 'sakhi',
              text: data.text || '',
              timestamp: data.timestamp || 'Previous session',
              modelUsed: data.modelUsed,
              groundedWithSearch: data.groundedWithSearch,
              sources: data.sources || [],
            });
          });
          if (loaded.length > 0) {
            setMessages(loaded);
          }
        }
      } catch (err) {
        console.warn('Could not load chat history from Firestore:', err);
      }
    }

    loadPastHistory();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Extract recent symptoms for context
  const recentLogs = Object.values(dailyLogs).slice(-3);
  const recentSymptomsList = Array.from(
    new Set(recentLogs.flatMap((log) => log.symptoms || []))
  );

  const samplePrompts = [
    'What soothing herbs ease pelvic cramping right now?',
    `Nutritional care best suited for my ${currentStatus.phaseTitle}`,
    'Latest clinical studies on magnesium for menstrual migraine relief',
    'Gentle somatic stretches to relieve lower back tension',
  ];

  const handleCopyMessage = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'sakhi',
        text: `Conversation refreshed. I'm listening with care—how are you feeling in your ${currentStatus.phaseTitle} today?`,
        timestamp: 'Just now',
        modelUsed: selectedModel,
      },
    ]);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Save user message to Firestore if authenticated
    if (user && !user.isAnonymous && firestore) {
      const currentUserId = user.uid || user.id;
      addDoc(collection(firestore, 'users', currentUserId, 'chatHistory'), {
        sender: 'user',
        text: textToSend.trim(),
        timestamp: userMsg.timestamp,
        createdAt: new Date().toISOString(),
      }).catch(() => {});
    }

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          phase: currentStatus.phaseTitle,
          currentDay: currentStatus.currentDay,
          totalDays: currentStatus.totalDays,
          recentSymptoms: recentSymptomsList,
          language: language,
          model: selectedModel,
          userId: user?.id,
          userEmail: user?.email,
          displayName: user?.displayName,
          history: messages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error while contacting Sakhi AI');
      }

      const sakhiMsg: ChatMessage = {
        id: `s-${Date.now()}`,
        sender: 'sakhi',
        text: data.reply || 'I am here with you. Take a deep, gentle breath and rest your body.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel,
        groundedWithSearch: data.groundedWithSearch,
        searchQueries: data.searchQueries,
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, sakhiMsg]);

      // Save assistant reply to Firestore if authenticated
      if (user && !user.isAnonymous && firestore) {
        const currentUserId = user.uid || user.id;
        addDoc(collection(firestore, 'users', currentUserId, 'chatHistory'), {
          sender: 'sakhi',
          text: sakhiMsg.text,
          timestamp: sakhiMsg.timestamp,
          modelUsed: sakhiMsg.modelUsed,
          groundedWithSearch: sakhiMsg.groundedWithSearch || false,
          sources: sakhiMsg.sources || [],
          createdAt: new Date().toISOString(),
        }).catch(() => {});
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'sakhi',
        text:
          '🌸 Gentle notice: Our wellness server is temporarily warming up. Meanwhile, sip warm herbal tea, rest with a heating pad, and take 3 deep, grounding breaths.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs flex flex-col h-[590px] relative overflow-hidden">
      {/* Header */}
      <div className="pb-3.5 border-b border-[#FCECEF] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E25574] to-[#F4A6B8] flex items-center justify-center text-white text-lg shadow-xs">
              🌸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-bold text-[#3D1E28]">
                  {t('sakhiTitle')}
                </h3>
                <span className="text-[10px] font-bold text-[#58B988] bg-[#F3FAF5] px-2 py-0.5 rounded-full border border-[#BFE7D0] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#58B988] animate-pulse" />
                  <span>Real-Time Gemini AI</span>
                </span>
              </div>
              <p className="text-[11px] text-[#7E5265]">
                Attuned to your {currentStatus.phaseTitle} · Grounded with Google Search
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearChat}
              className="p-1.5 text-[#7E5265] hover:text-[#D9658B] hover:bg-[#FFF0F3] rounded-xl transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Model Mode Selection, Search Grounding Badge & Auth Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
          {/* Model Selector */}
          <div className="flex items-center gap-1 bg-[#FFF5F7] p-1 rounded-xl border border-[#F4D5DC]">
            <button
              type="button"
              onClick={() => setSelectedModel('gemini-3.5-flash')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
                selectedModel === 'gemini-3.5-flash'
                  ? 'bg-white text-[#D9658B] shadow-2xs'
                  : 'text-[#7E5265] hover:text-[#3D1E28]'
              }`}
              title="General tasks with Google Search Grounding"
            >
              <Sparkles className="w-3 h-3 text-[#D9658B]" />
              <span>Gemini 3.5 Flash (Search Grounded)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
                selectedModel === 'gemini-3.1-flash-lite'
                  ? 'bg-white text-[#D9658B] shadow-2xs'
                  : 'text-[#7E5265] hover:text-[#3D1E28]'
              }`}
              title="Fast tasks for immediate answers"
            >
              <Zap className="w-3 h-3 text-[#D97706]" />
              <span>Flash-Lite (Fast)</span>
            </button>
          </div>

          {/* User Auth & Database Sync Status */}
          <div className="flex items-center gap-1 text-[11px]">
            {user && !user.isAnonymous ? (
              <span className="flex items-center gap-1 text-[#226947] bg-[#F3FAF5] px-2.5 py-0.5 rounded-full border border-[#BFE7D0] font-semibold" title="Chat conversation is safely saved to Cloud Firestore">
                <ShieldCheck className="w-3 h-3 text-[#58B988]" />
                <span className="truncate max-w-[130px]">{user.displayName || user.email}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => { void signInWithGoogle(); }}
                disabled={isSigningIn}
                className="flex items-center gap-1 text-[#D9658B] hover:underline bg-[#FFF0F3] px-2.5 py-0.5 rounded-full border border-[#F4D5DC] font-bold"
              >
                <Lock className="w-3 h-3" />
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Multi-turn Scrollable Message Feed */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-2 scrollbar-none">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} group`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-xl bg-[#FFF0F3] border border-[#F4D5DC] flex items-center justify-center text-xs shrink-0 mt-1 shadow-2xs">
                  🌸
                </div>
              )}

              <div className="max-w-md sm:max-w-lg space-y-1.5">
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line relative ${
                    isUser
                      ? 'bg-[#D9658B] text-white rounded-br-xs shadow-xs'
                      : 'bg-[#FFF8F8] text-[#3D1E28] border border-[#F4D5DC] rounded-bl-xs shadow-2xs'
                  }`}
                >
                  {m.text}

                  {/* Copy message button */}
                  {!isUser && (
                    <button
                      onClick={() => handleCopyMessage(m.id, m.text)}
                      className="absolute top-2 right-2 p-1 rounded-md text-[#7E5265] hover:text-[#3D1E28] hover:bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy response"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3 h-3 text-[#58B988]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                {/* Grounding Sources & Citations */}
                {!isUser && m.sources && m.sources.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-[#F8F9FA] border border-slate-200 text-[11px] space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-[#1A73E8]">
                      <Globe className="w-3 h-3" />
                      <span>Google Search Grounding Sources</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.sources.slice(0, 3).map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-[#1A73E8] text-[#1A73E8] text-[10px] hover:underline transition-colors"
                        >
                          <span className="truncate max-w-[180px]">{src.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[9px] text-[#7E5265] px-1 flex items-center gap-2 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{m.timestamp}</span>
                  {m.modelUsed && !isUser && (
                    <span className="text-[8px] bg-slate-100 px-1.5 py-0.2 rounded-sm text-slate-500">
                      {m.modelUsed}
                    </span>
                  )}
                  {m.groundedWithSearch && !isUser && (
                    <span className="text-[8px] bg-[#E8F0FE] text-[#1A73E8] px-1.5 py-0.2 rounded-sm font-semibold flex items-center gap-0.5">
                      <Search className="w-2 h-2" />
                      <span>Search Grounded</span>
                    </span>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-xl bg-[#3D1E28] text-white flex items-center justify-center text-xs shrink-0 mt-1 shadow-2xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 items-center text-xs text-[#7E5265] pl-9">
            <Loader2 className="w-4 h-4 animate-spin text-[#D9658B]" />
            <span>Sakhi is analyzing up-to-date wellness research & preparing a response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="pt-2 border-t border-[#FCECEF] flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="text-[11px] px-3 py-1 bg-[#FFF8F8] hover:bg-[#FFF0F3] text-[#7E5265] hover:text-[#3D1E28] rounded-full border border-[#F4D5DC] whitespace-nowrap transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
        }}
        className="flex items-center gap-2 pt-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t('sakhiPlaceholder')}
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:outline-none focus:ring-2 focus:ring-[#D9658B]"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="p-2.5 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-xl transition-all shadow-xs disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Medical Boundary Notice */}
      <div className="pt-2 flex items-center gap-1.5 text-[10px] text-[#7E5265]/80">
        <ShieldAlert className="w-3 h-3 text-[#D9658B] shrink-0" />
        <span>{t('sakhiEmergencyWarning')}</span>
      </div>
    </div>
  );
};
