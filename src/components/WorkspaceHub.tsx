import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { calculateCycleStatus } from '../utils/cycleCalculations';
import {
  Mail,
  MessageSquare,
  FileSpreadsheet,
  Send,
  Lock,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Plus,
  AlertCircle,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface GmailMessage {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  date?: string;
}

export const WorkspaceHub: React.FC = () => {
  const { user, accessToken, isSigningIn, signInWithGoogle, logout, hasWorkspaceAuth } = useAuth();
  const { cycleSettings, dailyLogs } = useApp();
  const currentStatus = calculateCycleStatus(cycleSettings);

  const [activeTab, setActiveTab] = useState<'gmail' | 'chat' | 'forms'>('gmail');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Gmail State
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState(
    `Sakhi Cycle Summary: ${currentStatus.phaseTitle} (Day ${currentStatus.currentDay})`
  );
  const [emailBody, setEmailBody] = useState(
    `Hello,\n\nSharing my current cycle status from Sakhi Cycle:\n- Current Phase: ${currentStatus.phaseTitle}\n- Current Cycle Day: Day ${currentStatus.currentDay} of ${currentStatus.totalDays}\n- Estimated Next Period: ${currentStatus.nextPeriodDate.toLocaleDateString()}\n\nWarm regards,\n${user?.displayName || 'Sakhi User'}`
  );

  // Chat State
  const [chatSpaces, setChatSpaces] = useState<any[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [chatMessageText, setChatMessageText] = useState(
    `🌸 Sakhi Cycle Wellness Alert: Currently in ${currentStatus.phaseTitle}. Remember to take gentle rest and stay hydrated today!`
  );

  // Forms State
  const [formTitle, setFormTitle] = useState('Sakhi Cycle Weekly Wellbeing Questionnaire');
  const [createdForms, setCreatedForms] = useState<any[]>([
    {
      formId: 'sample-form-1',
      title: 'Hormonal Wellness & Menstrual Symptom Survey',
      responderUri: 'https://docs.google.com/forms',
    },
  ]);

  // Load Gmail messages when token is available
  const fetchRecentEmails = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=health OR doctor OR wellness OR appointment OR cycle',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!res.ok) throw new Error('Failed to fetch Gmail messages');
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        const details = await Promise.all(
          data.messages.slice(0, 4).map(async (m: any) => {
            const mRes = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const mData = await mRes.json();
            const subjectHeader = mData.payload?.headers?.find((h: any) => h.name === 'Subject');
            const fromHeader = mData.payload?.headers?.find((h: any) => h.name === 'From');
            const dateHeader = mData.payload?.headers?.find((h: any) => h.name === 'Date');
            return {
              id: m.id,
              threadId: m.threadId,
              snippet: mData.snippet,
              subject: subjectHeader?.value || 'Health & Care Consultation',
              from: fromHeader?.value || 'Doctor / Clinic',
              date: dateHeader?.value ? new Date(dateHeader.value).toLocaleDateString() : '',
            };
          })
        );
        setEmails(details);
      } else {
        setEmails([]);
      }
    } catch (e: any) {
      console.warn('Gmail fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Load Google Chat spaces
  const fetchChatSpaces = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch('https://chat.googleapis.com/v1/spaces', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setChatSpaces(data.spaces || []);
        if (data.spaces?.length > 0) {
          setSelectedSpace(data.spaces[0].name);
        }
      }
    } catch (e) {
      console.warn('Chat spaces error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      if (activeTab === 'gmail') fetchRecentEmails();
      if (activeTab === 'chat') fetchChatSpaces();
    }
  }, [accessToken, activeTab]);

  // Send Email with mandatory user confirmation
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    const confirmed = window.confirm(
      `Send cycle summary email to ${recipientEmail} with subject "${emailSubject}" via your authorized Gmail account?`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(emailSubject)))}?=`;
      const messageParts = [
        `To: ${recipientEmail}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        emailBody,
      ];
      const rawMessage = messageParts.join('\r\n');
      const encodedMessage = btoa(unescape(encodeURIComponent(rawMessage)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encodedMessage }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        // Provide seamless direct Gmail web composer fallback
        const mailtoUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.open(mailtoUrl, '_blank');
        setStatusMessage('Opened in Gmail web composer with your cycle summary pre-filled!');
        setTimeout(() => setStatusMessage(null), 5000);
        return;
      }

      setStatusMessage('Email sent successfully via Gmail API!');
      setTimeout(() => setStatusMessage(null), 4000);
      fetchRecentEmails();
    } catch (err: any) {
      // Direct web fallback when token or restricted scope blocks API call
      const mailtoUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.open(mailtoUrl, '_blank');
      setStatusMessage('Opened draft in Gmail composer with your cycle summary pre-filled!');
      setTimeout(() => setStatusMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Send Google Chat Message with direct dispatch
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setLoading(true);
    try {
      const endpoint = selectedSpace
        ? `https://chat.googleapis.com/v1/${selectedSpace}/messages`
        : 'https://chat.googleapis.com/v1/spaces';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: chatMessageText }),
      });

      if (!res.ok) {
        window.open('https://chat.google.com/', '_blank');
        setStatusMessage('Opened Google Chat web app to post your message.');
        setTimeout(() => setStatusMessage(null), 5000);
        return;
      }

      setStatusMessage('Chat message posted to Google Chat space!');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      window.open('https://chat.google.com/', '_blank');
      setStatusMessage('Opened Google Chat web app with your message copied.');
      setTimeout(() => setStatusMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Create Google Form
  const handleCreateGoogleForm = async () => {
    setLoading(true);
    try {
      if (accessToken) {
        const res = await fetch('https://forms.googleapis.com/v1/forms', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            info: {
              title: formTitle,
              documentTitle: formTitle,
            },
          }),
        });

        if (res.ok) {
          const newFormData = await res.json();
          setCreatedForms((prev) => [newFormData, ...prev]);
          setStatusMessage('Google Form created successfully in your Drive!');
          setTimeout(() => setStatusMessage(null), 4000);
          return;
        }
      }

      // Seamless direct Google Forms template creation fallback
      window.open('https://forms.new', '_blank');
      setStatusMessage('Opened Google Forms creator in a new tab.');
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      window.open('https://forms.new', '_blank');
      setStatusMessage('Opened Google Forms creator in a new tab.');
      setTimeout(() => setStatusMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-3xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌐</span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3D1E28]">
                Google Workspace Sanctuary Integrations
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#7E5265] mt-1">
              Connect your Gmail, Google Chat, and Google Forms for seamless doctor inquiries and wellness journals.
            </p>
          </div>

          {/* User Sign-In / Account Status */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-2xl border border-[#F4D5DC]">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full border border-[#D9658B]"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#FCECEF] text-[#D9658B] flex items-center justify-center text-xs font-bold">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                )}
                <div className="text-left text-xs">
                  <div className="font-bold text-[#3D1E28] leading-tight">
                    {user.displayName || 'Sakhi Soul'}
                  </div>
                  <div className="text-[10px] text-[#7E5265] truncate max-w-[130px]">
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="ml-2 text-[11px] text-[#D9658B] hover:underline font-semibold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { void signInWithGoogle(); }}
                disabled={isSigningIn}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-[#3D1E28] text-xs font-bold rounded-2xl border border-slate-300 shadow-sm transition-all disabled:opacity-60"
              >
                {isSigningIn ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#D9658B]" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                )}
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Integration Service Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#FCECEF]">
          {[
            { id: 'gmail', label: 'Gmail (Doctor Inquiries)', icon: Mail },
            { id: 'chat', label: 'Google Chat (Wellness Alerts)', icon: MessageSquare },
            { id: 'forms', label: 'Google Forms (Health Intake)', icon: FileSpreadsheet },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#D9658B] text-white shadow-xs'
                    : 'bg-white/80 text-[#7E5265] hover:bg-white border border-[#F4D5DC]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-[#F3FAF5] border border-[#BFE7D0] text-[#226947] rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#58B988]" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-[#FFF0F3] border border-[#F4D5DC] text-[#D9658B] rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#D9658B]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!hasWorkspaceAuth ? (
        <div className="glass-card p-10 rounded-3xl text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-[#FFF0F3] text-[#D9658B] flex items-center justify-center mx-auto text-2xl">
            🔒
          </div>
          <h3 className="text-lg font-serif font-bold text-[#3D1E28]">
            Authorize Google Workspace
          </h3>
          <p className="text-xs text-[#7E5265] leading-relaxed">
            Sign in with your Google account to send confidential doctor consultation inquiries via Gmail, coordinate cycle care on Google Chat, and generate symptom intake surveys via Google Forms.
          </p>
          <button
            onClick={() => { void signInWithGoogle(); }}
            disabled={isSigningIn}
            className="px-6 py-3 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-2xl text-xs font-bold shadow-md shadow-[#D9658B]/20 transition-all disabled:opacity-60 flex items-center gap-2 mx-auto"
          >
            {isSigningIn && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{isSigningIn ? 'Opening Sign In...' : 'Authorize Gmail, Chat & Forms'}</span>
          </button>
        </div>
      ) : (
        <>
          {/* 1. GMAIL INTEGRATION */}
          {activeTab === 'gmail' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compose & Send Doctor Inquiry */}
              <div className="glass-card p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#D9658B]" />
                  <h3 className="text-base font-serif font-bold text-[#3D1E28]">
                    Send Doctor Inquiry / Cycle Report
                  </h3>
                </div>

                <form onSubmit={handleSendEmail} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
                      Doctor or Clinic Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g., clinic@fortishealthcare.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#D9658B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#D9658B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
                      Message Content
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full p-3 text-xs rounded-xl border border-[#F4D5DC] bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#D9658B]"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[11px] text-[#7E5265]">
                      🔒 Requires confirmation dialog before send
                    </span>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send with Gmail</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Recent Health Consultation Emails */}
              <div className="glass-card p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#D9658B]" />
                    <h3 className="text-base font-serif font-bold text-[#3D1E28]">
                      Recent Clinic & Health Emails
                    </h3>
                  </div>
                  <button
                    onClick={fetchRecentEmails}
                    className="p-1 text-[#7E5265] hover:text-[#3D1E28]"
                    title="Refresh Gmail"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {emails.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#7E5265]">
                    No recent clinic/wellness emails found matching your filter.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {emails.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-3.5 rounded-2xl bg-white/80 border border-[#F4D5DC] space-y-1 hover:border-[#D9658B]/50 transition-colors"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#3D1E28]">{msg.from}</span>
                          <span className="text-[#7E5265]">{msg.date}</span>
                        </div>
                        <div className="text-xs font-semibold text-[#3D1E28]">
                          {msg.subject}
                        </div>
                        <p className="text-[11px] text-[#7E5265] line-clamp-2">
                          {msg.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. GOOGLE CHAT INTEGRATION */}
          {activeTab === 'chat' && (
            <div className="glass-card p-6 rounded-3xl space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#58B988]" />
                <h3 className="text-base font-serif font-bold text-[#3D1E28]">
                  Post Cycle Care Updates to Google Chat
                </h3>
              </div>
              <p className="text-xs text-[#7E5265]">
                Send encouraging cycle phase reminders or care guidelines into a Google Chat space shared with your supportive inner circle.
              </p>

              <form onSubmit={handleSendChatMessage} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
                    Select Target Google Chat Space
                  </label>
                  {chatSpaces.length > 0 ? (
                    <select
                      value={selectedSpace}
                      onChange={(e) => setSelectedSpace(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-white/90"
                    >
                      {chatSpaces.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.displayName || s.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-[#FFF8F8] rounded-xl border border-[#F4D5DC] text-xs text-[#7E5265]">
                      No Google Chat spaces found. You can post to your primary Chat feed.
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
                    Supportive Message Text
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={chatMessageText}
                    onChange={(e) => setChatMessageText(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-[#F4D5DC] bg-white/90"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#58B988] hover:bg-[#469A70] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Google Chat</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 3. GOOGLE FORMS INTEGRATION */}
          {activeTab === 'forms' && (
            <div className="glass-card p-6 rounded-3xl space-y-5 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#A663CE]" />
                  <h3 className="text-base font-serif font-bold text-[#3D1E28]">
                    Google Forms Health Intake & Surveys
                  </h3>
                </div>
                <button
                  onClick={handleCreateGoogleForm}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#A663CE] hover:bg-[#914CBB] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Form</span>
                </button>
              </div>

              <p className="text-xs text-[#7E5265]">
                Generate structured Google Forms directly in your Google Drive to log detailed weekly hormonal symptoms or clinical onboarding notes.
              </p>

              <div className="space-y-3">
                {createdForms.map((f, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-white/90 border border-[#F4D5DC] flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#3D1E28]">{f.info?.title || f.title}</div>
                      <div className="text-[11px] text-[#7E5265]">
                        Document ID: {f.formId || 'drive-synced'}
                      </div>
                    </div>
                    <a
                      href={f.responderUri || `https://docs.google.com/forms/d/${f.formId}/edit`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-[#D9658B] font-semibold hover:underline"
                    >
                      <span>Open Form</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
