import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateCycleStatus } from '../utils/cycleCalculations';
import {
  UserCheck,
  Shield,
  PauseCircle,
  PlayCircle,
  UserX,
  AlertOctagon,
  Sparkles,
  Send,
  Heart,
} from 'lucide-react';

export const BuddySection: React.FC = () => {
  const { buddyProfile, updateBuddyProfile, cycleSettings } = useApp();
  const currentStatus = calculateCycleStatus(cycleSettings);

  const [messages, setMessages] = useState<
    { id: string; sender: 'me' | 'buddy'; text: string; time: string }[]
  >([
    {
      id: 'm-1',
      sender: 'buddy',
      text: 'Hello from LotusWisdom_89! I am in my luteal phase too today. Hope you have a restful evening with warm chai ☕',
      time: '10:14 AM',
    },
    {
      id: 'm-2',
      sender: 'me',
      text: 'Thank you! So comforting to know someone else understands this gentle nesting feeling. Sending warmth your way!',
      time: '10:20 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'me' as const,
      text: inputText.trim(),
      time: 'Just now',
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Buddy automated warm reply after a brief pause
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'buddy',
          text: '🌸 Receiving your supportive energy! Remember to be extra kind to yourself today.',
          time: 'Just now',
        },
      ]);
    }, 1500);
  };

  const handleTogglePause = () => {
    updateBuddyProfile({ isPaused: !buddyProfile.isPaused });
    setNotification(buddyProfile.isPaused ? 'Buddy check-ins resumed' : 'Buddy check-ins paused');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUnmatch = () => {
    if (window.confirm('Unmatch with current cycle buddy? You will be paired with someone new when requested.')) {
      updateBuddyProfile({
        status: 'searching',
        matchedBuddyName: undefined,
      });
      setNotification('Unmatched safely.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleBlockAndReport = () => {
    if (window.confirm('Block and report this user? They will not be able to contact you again.')) {
      updateBuddyProfile({
        status: 'searching',
        matchedBuddyName: undefined,
      });
      setNotification('User blocked and reported to Sakhi Safety.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleToggleOptIn = () => {
    const nextVal = !buddyProfile.isOptedIn;
    updateBuddyProfile({
      isOptedIn: nextVal,
      status: nextVal ? 'connected' : 'inactive',
      matchedBuddyName: nextVal ? 'LotusWisdom_89' : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#D9658B]" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3D1E28]">
              Cycle Buddy Companion
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#7E5265] mt-1">
            An anonymous peer paired by cycle phase for quiet, gentle solidarity.
          </p>
        </div>

        <button
          onClick={handleToggleOptIn}
          className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition-all ${
            buddyProfile.isOptedIn
              ? 'bg-[#FCECEF] text-[#D9658B] border-[#D9658B]'
              : 'bg-[#3D1E28] text-white border-[#3D1E28]'
          }`}
        >
          {buddyProfile.isOptedIn ? 'Opted In to Buddy System' : 'Opt In to Buddy System'}
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-[#F3FAF5] border border-[#BFE7D0] text-[#226947] rounded-2xl text-xs flex items-center gap-2">
          <Heart className="w-4 h-4 text-[#58B988]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Safety & Zero-Exposure Guarantee Box */}
      <div className="p-4 bg-[#FFF8F8] rounded-2xl border border-[#F4D5DC] text-xs text-[#7E5265] flex items-start gap-3">
        <Shield className="w-5 h-5 text-[#D9658B] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#3D1E28]">Zero-Exposure Privacy Safeguard:</strong> Your daily symptom logs, intimacy entries, menstrual flow intensity, email, and phone number are NEVER shared with your buddy. Only your current cycle phase estimate (e.g., Luteal Phase) is visible to foster shared understanding.
        </div>
      </div>

      {!buddyProfile.isOptedIn ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#F4D5DC] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FFF0F3] text-[#D9658B] flex items-center justify-center mx-auto text-xl">
            🌸
          </div>
          <h3 className="text-lg font-serif font-bold text-[#3D1E28]">
            Buddy System is Currently Inactive
          </h3>
          <p className="text-xs text-[#7E5265] max-w-md mx-auto">
            When you opt in, Sakhi safely pairs you with a fellow user in a matching cycle phase for uplifting, anonymous encouragement.
          </p>
          <button
            onClick={handleToggleOptIn}
            className="px-6 py-2.5 bg-[#D9658B] text-white rounded-2xl text-xs font-bold shadow-xs hover:bg-[#C54E74] transition-colors"
          >
            Activate Anonymous Cycle Buddy
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Buddy Profile & Safety Controls Card */}
          <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#FFF0F3] border border-[#F4D5DC] flex items-center justify-center text-2xl">
                🪷
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#D9658B]">
                  Matched Buddy
                </span>
                <h4 className="text-base font-serif font-bold text-[#3D1E28]">
                  {buddyProfile.matchedBuddyName || 'Searching for Buddy...'}
                </h4>
                <div className="text-[11px] text-[#7E5265]">
                  Paired in {currentStatus.phaseTitle}
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#FFF8F8] rounded-xl border border-[#F4D5DC] space-y-1 text-xs text-[#7E5265]">
              <div className="flex justify-between">
                <span>Your Pseudonym:</span>
                <strong className="text-[#3D1E28]">{buddyProfile.pseudonym}</strong>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold text-[#58B988]">
                  {buddyProfile.isPaused ? 'Paused' : 'Active Connection'}
                </span>
              </div>
            </div>

            {/* Safety & Management Actions */}
            <div className="space-y-2 pt-2 border-t border-[#FCECEF]">
              <button
                onClick={handleTogglePause}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#F4D5DC] text-xs font-medium text-[#7E5265] hover:bg-[#FFF0F3] transition-colors"
              >
                <span className="flex items-center gap-2">
                  {buddyProfile.isPaused ? (
                    <PlayCircle className="w-4 h-4 text-[#58B988]" />
                  ) : (
                    <PauseCircle className="w-4 h-4 text-[#E8A735]" />
                  )}
                  <span>{buddyProfile.isPaused ? 'Resume Check-ins' : 'Pause Check-ins'}</span>
                </span>
              </button>

              <button
                onClick={handleUnmatch}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#F4D5DC] text-xs font-medium text-[#7E5265] hover:bg-rose-50 hover:text-rose-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <UserX className="w-4 h-4 text-rose-500" />
                  <span>Unmatch Current Buddy</span>
                </span>
              </button>

              <button
                onClick={handleBlockAndReport}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-rose-200 text-xs font-medium text-rose-700 bg-rose-50/50 hover:bg-rose-100 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  <span>Block & Report</span>
                </span>
              </button>
            </div>
          </div>

          {/* Supportive Anonymous Chat Area */}
          <div className="lg:col-span-2 p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs flex flex-col justify-between h-[440px]">
            {/* Message Feed */}
            <div className="space-y-3 overflow-y-auto pr-2 scrollbar-none flex-1">
              <div className="text-center py-2">
                <span className="text-[10px] text-[#7E5265] bg-[#FFF8F8] px-3 py-1 rounded-full border border-[#F4D5DC]">
                  Safe, respectful conversation. Messages are encrypted and non-permanent.
                </span>
              </div>

              {messages.map((m) => {
                const isMe = m.sender === 'me';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-[#D9658B] text-white rounded-br-xs'
                          : 'bg-[#FFF0F3] text-[#3D1E28] border border-[#F4D5DC] rounded-bl-xs'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[9px] text-[#7E5265] mt-1 px-1">{m.time}</span>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-[#FCECEF] flex items-center gap-2">
              <input
                type="text"
                disabled={buddyProfile.isPaused}
                placeholder={
                  buddyProfile.isPaused
                    ? 'Check-ins are paused. Click resume on the left to chat.'
                    : 'Send a gentle encouraging note to your buddy...'
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:outline-none focus:ring-2 focus:ring-[#D9658B] disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={buddyProfile.isPaused || !inputText.trim()}
                className="p-2.5 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-xl transition-all shadow-xs disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
