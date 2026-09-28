import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { calculateCycleStatus } from '../utils/cycleCalculations';
import { getTranslation } from '../utils/translations';
import {
  Sparkles,
  Send,
  ShieldAlert,
  Loader2,
  Bot,
  User,
  Heart,
  HelpCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'sakhi';
  text: string;
  timestamp: string;
}

export const SakhiAIChat: React.FC = () => {
  const { cycleSettings, dailyLogs, language } = useApp();
  const currentStatus = calculateCycleStatus(cycleSettings);
  const t = (key: string, params?: Record<string, string | number>) =>
    getTranslation(language, key, params);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'sakhi',
      text:
        language === 'hi'
          ? `नमस्ते सखी! मैं आपकी वेलनेस साथी हूँ। आप वर्तमान में अपने ${currentStatus.phaseTitle} (दिन ${currentStatus.currentDay}) में हैं। मैं आपकी किसी भी तरह की घरेलू देखभाल, हर्बल चाय, या पीरियड से जुड़े सवालों में कैसे मदद कर सकती हूँ?`
          : `Hello, sweet soul. I am Sakhi, your compassionate cycle companion. You are currently in your ${currentStatus.phaseTitle} (Day ${currentStatus.currentDay} of ${currentStatus.totalDays}). How may I support your comfort and body wisdom today?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    'What soothing herbs help day 2 cramps?',
    'Why do I feel more tired in my luteal phase?',
    'How does seed cycling gently support hormones?',
    'Gentle stretches to relieve lower backache',
  ];

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

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          phase: currentStatus.phaseTitle,
          recentSymptoms: recentSymptomsList,
          language: language,
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
      };

      setMessages((prev) => [...prev, sakhiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'sakhi',
        text:
          '🌸 Gentle notice: Our wellness server is temporarily resting or the API key is being initialized. Meanwhile, remember to hydrate with warm chamomile or ginger tea and rest your lower belly on a heating pad.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs flex flex-col h-[540px]">
      {/* Header */}
      <div className="pb-3 border-b border-[#FCECEF] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E25574] to-[#F4A6B8] flex items-center justify-center text-white text-base shadow-xs">
            🌸
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#3D1E28]">
              {t('sakhiTitle')}
            </h3>
            <p className="text-[11px] text-[#7E5265]">
              Attuned to your {currentStatus.phaseTitle} · Private Server-Side Companion
            </p>
          </div>
        </div>

        <span className="text-[10px] uppercase font-bold tracking-wider text-[#58B988] bg-[#F3FAF5] px-2.5 py-0.5 rounded-full border border-[#BFE7D0]">
          Active
        </span>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-2 scrollbar-none">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-[#FFF0F3] border border-[#F4D5DC] flex items-center justify-center text-xs shrink-0 mt-1">
                  🌸
                </div>
              )}
              <div className="max-w-md space-y-1">
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    isUser
                      ? 'bg-[#D9658B] text-white rounded-br-xs'
                      : 'bg-[#FFF8F8] text-[#3D1E28] border border-[#F4D5DC] rounded-bl-xs'
                  }`}
                >
                  {m.text}
                </div>
                <div
                  className={`text-[9px] text-[#7E5265] px-1 ${
                    isUser ? 'text-right' : 'text-left'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
              {isUser && (
                <div className="w-7 h-7 rounded-full bg-[#3D1E28] text-white flex items-center justify-center text-xs shrink-0 mt-1">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 items-center text-xs text-[#7E5265] pl-9">
            <Loader2 className="w-4 h-4 animate-spin text-[#D9658B]" />
            <span>Sakhi is preparing a gentle response...</span>
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
