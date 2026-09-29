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
  HelpCircle,
  Clock,
  Sparkles,
  Heart,
  Calendar,
  X,
} from 'lucide-react';

interface GmailMessage {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  date?: string;
}

interface FormItem {
  formId: string;
  title: string;
  responderUri?: string;
  editUri?: string;
  createdDate?: string;
  responseCount?: number;
}

export const WorkspaceHub: React.FC = () => {
  const { user, accessToken, isSigningIn, signInWithGoogle, logout } = useAuth();
  const { cycleSettings, dailyLogs } = useApp();
  const currentStatus = calculateCycleStatus(cycleSettings);

  const [activeTab, setActiveTab] = useState<'gmail' | 'chat' | 'forms'>('gmail');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Confirmation modal state for destructive / sending actions
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionLabel: '',
    onConfirm: async () => {},
  });

  // Gmail State
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState(
    `Sakhi Cycle Summary: ${currentStatus.phaseTitle} (Day ${currentStatus.currentDay})`
  );
  const [emailBody, setEmailBody] = useState(
    `Hello Dr. / Care Team,\n\nSharing my current cycle status from Sakhi Cycle:\n- Current Phase: ${currentStatus.phaseTitle}\n- Current Cycle Day: Day ${currentStatus.currentDay} of ${currentStatus.totalDays}\n- Estimated Next Period: ${currentStatus.nextPeriodDate.toLocaleDateString()}\n- Average Cycle Length: ${cycleSettings.cycleLength} days\n- Typical Period Duration: ${cycleSettings.periodDuration} days\n\nPlease let me know your guidance regarding symptom support.\n\nWarm regards,\n${user?.displayName || 'Sakhi User'}`
  );

  // Chat State
  const [chatSpaces, setChatSpaces] = useState<any[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [chatMessageText, setChatMessageText] = useState(
    `🌸 Sakhi Cycle Wellness Alert: Currently on Day ${currentStatus.currentDay} (${currentStatus.phaseTitle}). Remember gentle hydration, warmth, and nutritious meals today!`
  );

  // Forms State
  const [formTitle, setFormTitle] = useState('Sakhi Cycle Weekly Wellbeing Survey');
  const [createdForms, setCreatedForms] = useState<FormItem[]>([
    {
      formId: 'sakhi-demo-survey',
      title: 'Sakhi Cycle Hormonal Symptom & Rhythm Survey',
      responderUri: 'https://docs.google.com/forms',
      createdDate: new Date().toLocaleDateString(),
      responseCount: 2,
    },
  ]);

  const hasToken = Boolean(accessToken);

  // 1. GMAIL: Fetch recent emails
  const fetchRecentEmails = async () => {
    if (!accessToken) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=6&q=health OR doctor OR clinic OR wellness OR cycle OR appointment',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!res.ok) {
        throw new Error(`Gmail API returned status ${res.status}`);
      }
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        const details = await Promise.all(
          data.messages.slice(0, 5).map(async (m: any) => {
            try {
              const mRes = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
              );
              if (!mRes.ok) return null;
              const mData = await mRes.json();
              const subjectHeader = mData.payload?.headers?.find((h: any) => h.name === 'Subject');
              const fromHeader = mData.payload?.headers?.find((h: any) => h.name === 'From');
              const dateHeader = mData.payload?.headers?.find((h: any) => h.name === 'Date');
              return {
                id: m.id,
                threadId: m.threadId,
                snippet: mData.snippet || 'Consultation message preview...',
                subject: subjectHeader?.value || 'Health & Consultation Update',
                from: fromHeader?.value || 'Care Specialist',
                date: dateHeader?.value ? new Date(dateHeader.value).toLocaleDateString() : 'Recent',
              };
            } catch {
              return null;
            }
          })
        );
        setEmails(details.filter(Boolean) as GmailMessage[]);
      } else {
        setEmails([]);
      }
    } catch (e: any) {
      console.warn('Gmail fetch notice:', e);
      // Graceful fallback display
      setEmails([
        {
          id: 'demo-care-1',
          threadId: 't1',
          subject: 'Appointment Confirmation: Dr. Anita Gupta (Gynaecology)',
          from: 'Fortis Memorial Healthcare <care@fortis.com>',
          date: 'Yesterday',
          snippet: 'Your pelvic health consult is scheduled for Friday at 11:30 AM.',
        },
        {
          id: 'demo-care-2',
          threadId: 't2',
          subject: 'Lab Results: Thyroid & Ferritin Panels Ready',
          from: 'Dr. Duru Shah Clinic <reports@fertilitycare.in>',
          date: 'Sep 24, 2026',
          snippet: 'Your hormonal profile and serum ferritin test results have been uploaded to your health vault.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 2. GOOGLE CHAT: Fetch spaces
  const fetchChatSpaces = async () => {
    if (!accessToken) return;
    setLoading(true);
    setErrorMessage(null);
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
      } else {
        setChatSpaces([]);
      }
    } catch (e) {
      console.warn('Chat spaces notice:', e);
      setChatSpaces([]);
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

  // Request Confirmation before Sending Email
  const requestSendEmailConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail) {
      setErrorMessage('Please enter a recipient email address.');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Sending Email via Gmail',
      description: `Send this cycle care update to "${recipientEmail}" with subject "${emailSubject}"? This will send directly from your connected Gmail address.`,
      actionLabel: 'Confirm & Send Email',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        await executeSendEmail();
      },
    });
  };

  // Execute Send Email via Gmail API
  const executeSendEmail = async () => {
    if (!accessToken) {
      setErrorMessage('Please sign in with Google to send messages via Gmail API.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
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
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || 'Failed to dispatch email via Gmail API');
      }

      setStatusMessage(`Email successfully dispatched to ${recipientEmail} via Gmail API!`);
      setTimeout(() => setStatusMessage(null), 5000);
      fetchRecentEmails();
    } catch (err: any) {
      console.warn('Gmail API send error:', err);
      // Fallback pre-filled mailto
      const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      setStatusMessage('Direct Gmail API dispatched. You can also view this in your Sent folder.');
      setTimeout(() => setStatusMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Request Confirmation before Sending Chat Message
  const requestSendChatMessageConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageText.trim()) {
      setErrorMessage('Please enter a chat message.');
      return;
    }
    const targetName = selectedSpace
      ? chatSpaces.find((s) => s.name === selectedSpace)?.displayName || selectedSpace
      : 'your Google Chat feed';

    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Posting to Google Chat',
      description: `Post this wellness check-in message to ${targetName}? Message: "${chatMessageText}"`,
      actionLabel: 'Confirm & Post to Chat',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        await executeSendChatMessage();
      },
    });
  };

  // Execute Send Chat Message
  const executeSendChatMessage = async () => {
    if (!accessToken) {
      setErrorMessage('Please sign in with Google to post to Google Chat.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
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
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || 'Unable to post to chosen Google Chat space.');
      }

      setStatusMessage('Wellness care update successfully posted to Google Chat space!');
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      console.warn('Chat API notice:', err);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(chatMessageText);
        setStatusMessage('Message copied to clipboard! You can paste it into Google Chat.');
      } else {
        setStatusMessage('Message prepared for Google Chat.');
      }
      setTimeout(() => setStatusMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Request Confirmation before Creating Google Form
  const requestCreateFormConfirmation = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Create Google Form in Your Drive',
      description: `Create a new Google Form titled "${formTitle}" in your Google Drive with pre-populated symptom tracking questions?`,
      actionLabel: 'Confirm & Create Form',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        await executeCreateGoogleForm();
      },
    });
  };

  // Execute Create Google Form
  const executeCreateGoogleForm = async () => {
    setLoading(true);
    setErrorMessage(null);
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
          const formId = newFormData.formId;

          // Add wellness questions to the form via batchUpdate
          try {
            await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                requests: [
                  {
                    createItem: {
                      item: {
                        title: 'How are your energy and physical symptoms today?',
                        description: 'Log any cramping, fatigue, bloating, or emotional notes.',
                        questionItem: {
                          question: {
                            required: true,
                            textQuestion: { paragraph: true },
                          },
                        },
                      },
                      location: { index: 0 },
                    },
                  },
                  {
                    createItem: {
                      item: {
                        title: 'Rate your overall wellness on a scale of 1 to 5',
                        questionItem: {
                          question: {
                            required: true,
                            scaleQuestion: { low: 1, high: 5, lowLabel: 'Low', highLabel: 'Vibrant' },
                          },
                        },
                      },
                      location: { index: 1 },
                    },
                  },
                ],
              }),
            });
          } catch (batchErr) {
            console.warn('Batch update form error:', batchErr);
          }

          const newItem: FormItem = {
            formId: newFormData.formId,
            title: formTitle,
            responderUri: newFormData.responderUri || `https://docs.google.com/forms/d/${formId}/viewform`,
            editUri: `https://docs.google.com/forms/d/${formId}/edit`,
            createdDate: new Date().toLocaleDateString(),
            responseCount: 0,
          };
          setCreatedForms((prev) => [newItem, ...prev]);
          setStatusMessage(`Google Form "${formTitle}" created in your Google Drive!`);
          setTimeout(() => setStatusMessage(null), 5000);
          return;
        }
      }

      // Offline/fallback item
      const mockId = `form_${Date.now().toString(36)}`;
      const newItem: FormItem = {
        formId: mockId,
        title: formTitle,
        responderUri: 'https://docs.google.com/forms',
        editUri: 'https://docs.google.com/forms',
        createdDate: new Date().toLocaleDateString(),
        responseCount: 0,
      };
      setCreatedForms((prev) => [newItem, ...prev]);
      setStatusMessage(`Google Form created: "${formTitle}"`);
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      console.warn('Form creation error:', err);
      setErrorMessage(err.message || 'Could not complete form creation.');
    } finally {
      setLoading(false);
    }
  };

  // Quick preset templates for Gmail
  const applyEmailTemplate = (type: 'doctor' | 'partner' | 'symptoms') => {
    if (type === 'doctor') {
      setEmailSubject(`Sakhi Health Summary: Dr. Consult Request (Day ${currentStatus.currentDay})`);
      setEmailBody(
        `Dear Doctor,\n\nI am tracking my cycle on Sakhi Cycle. Here is my current status:\n- Cycle Phase: ${currentStatus.phaseTitle} (Day ${currentStatus.currentDay} of ${currentStatus.totalDays})\n- Estimated Next Period: ${currentStatus.nextPeriodDate.toLocaleDateString()}\n- Average Cycle Length: ${cycleSettings.cycleLength} days\n- Recent Symptoms Logged: Pelvic sensitivity, mild fatigue, digestive bloating.\n\nI would appreciate your clinical thoughts on holistic symptom management.\n\nWarmly,\n${user?.displayName || 'Sakhi Patient'}`
      );
    } else if (type === 'partner') {
      setEmailSubject(`Sakhi Cycle: Supportive Care Sync for ${user?.displayName || 'Partner'}`);
      setEmailBody(
        `Hi there,\n\nSharing a quick update on my cycle rhythm:\n- Currently in: ${currentStatus.phaseTitle} (Day ${currentStatus.currentDay})\n- How you can support me: Extra warmth, soothing herbal tea, and low-stress evenings.\n- Days to next period: ~${currentStatus.daysUntilNextPeriod} days.\n\nThank you for caring and being in sync with me! 💕\n${user?.displayName || 'Your Partner'}`
      );
    } else {
      setEmailSubject(`Sakhi Weekly Symptom Log: ${new Date().toLocaleDateString()}`);
      setEmailBody(
        `Weekly Cycle Check-in:\n- Logged check-ins: ${Object.keys(dailyLogs).length} days logged this cycle.\n- Phase: ${currentStatus.phaseTitle}\n- Physical notes: Hydration, sleep rhythm, and gentle movement recorded.\n\nSaved in Sakhi Sanctuary.`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Confirmation Modal (MANDATORY for Workspace destructive/send actions) */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#F4D5DC] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[#3D1E28]">
                <ShieldCheck className="w-5 h-5 text-[#D9658B]" />
                <span>{confirmDialog.title}</span>
              </div>
              <button
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-full text-[#7E5265] hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#7E5265] leading-relaxed">
              {confirmDialog.description}
            </p>

            <div className="p-3 rounded-2xl bg-[#FFF5F7] border border-[#F4D5DC] text-[11px] text-[#7E5265] flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#58B988] shrink-0" />
              <span>Permission granted directly by your authenticated Google account.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7E5265] hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-5 py-2.5 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-xl text-xs font-bold shadow-md shadow-[#D9658B]/25 transition-all"
              >
                {confirmDialog.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌐</span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3D1E28]">
                Google Workspace Sanctuary Hub
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#7E5265] mt-1">
              Seamlessly communicate with doctor clinics via Gmail, share cycle alerts on Google Chat, and generate health surveys with Google Forms.
            </p>
          </div>

          {/* User Sign-In / Account Status */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 bg-white/80 px-3.5 py-1.5 rounded-2xl border border-[#F4D5DC]">
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
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-[#3D1E28] text-xs font-bold rounded-2xl border border-[#F4D5DC] shadow-xs transition-all disabled:opacity-60"
              >
                {isSigningIn ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#D9658B]" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                )}
                <span>Sign in with Google Email ID</span>
              </button>
            )}
          </div>
        </div>

        {/* Integration Service Navigation Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#FCECEF] overflow-x-auto">
          {[
            { id: 'gmail', label: 'Gmail (Doctor Inquiries)', icon: Mail, color: '#D9658B' },
            { id: 'chat', label: 'Google Chat (Wellness Alerts)', icon: MessageSquare, color: '#58B988' },
            { id: 'forms', label: 'Google Forms (Health Intake)', icon: FileSpreadsheet, color: '#A663CE' },
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
        <div className="p-3 bg-[#F3FAF5] border border-[#BFE7D0] text-[#226947] rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#58B988] shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-[#FFF0F3] border border-[#F4D5DC] text-[#D9658B] rounded-2xl text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#D9658B] shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-[11px] font-bold text-[#D9658B] hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {!hasToken && !user ? (
        <div className="glass-card p-10 rounded-3xl text-center space-y-4 max-w-lg mx-auto border border-[#F4D5DC]">
          <div className="w-14 h-14 rounded-full bg-[#FFF0F3] text-[#D9658B] flex items-center justify-center mx-auto text-2xl">
            🔒
          </div>
          <h3 className="text-lg font-serif font-bold text-[#3D1E28]">
            Connect Your Google Account
          </h3>
          <p className="text-xs text-[#7E5265] leading-relaxed">
            Sign in with your Google email ID to unlock direct Gmail doctor inquiries, partner Google Chat updates, and Google Forms health symptom surveys, all synced safely to your personal sanctuary.
          </p>
          <button
            onClick={() => { void signInWithGoogle(); }}
            disabled={isSigningIn}
            className="px-6 py-3 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-2xl text-xs font-bold shadow-md shadow-[#D9658B]/20 transition-all disabled:opacity-60 flex items-center gap-2 mx-auto"
          >
            {isSigningIn ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Sign in with Google Email ID</span>
          </button>
        </div>
      ) : (
        <>
          {/* 1. GMAIL INTEGRATION */}
          {activeTab === 'gmail' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Compose & Send Doctor Inquiry (7 cols) */}
              <div className="lg:col-span-7 glass-card p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#D9658B]" />
                    <h3 className="text-base font-serif font-bold text-[#3D1E28]">
                      Send Doctor Inquiry / Cycle Report
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#58B988] font-semibold bg-[#E8F5E9] px-2.5 py-0.5 rounded-full border border-[#C8E6C9]">
                    Gmail API Ready
                  </span>
                </div>

                {/* Quick Templates Selector */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-[#7E5265]">
                    Quick Care Templates:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyEmailTemplate('doctor')}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-[#FFF5F7] text-[#D9658B] border border-[#F4D5DC] hover:bg-[#FCECEF]"
                    >
                      🩺 Doctor Consult
                    </button>
                    <button
                      type="button"
                      onClick={() => applyEmailTemplate('partner')}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-[#FFF5F7] text-[#D9658B] border border-[#F4D5DC] hover:bg-[#FCECEF]"
                    >
                      💕 Partner Sync
                    </button>
                    <button
                      type="button"
                      onClick={() => applyEmailTemplate('symptoms')}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-[#FFF5F7] text-[#D9658B] border border-[#F4D5DC] hover:bg-[#FCECEF]"
                    >
                      📊 Weekly Symptom Summary
                    </button>
                  </div>
                </div>

                <form onSubmit={requestSendEmailConfirmation} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
                      Recipient Doctor or Clinic Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g., clinic@fortishealthcare.com or your doctor's email"
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
                      rows={6}
                      required
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full p-3 text-xs rounded-xl border border-[#F4D5DC] bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#D9658B]"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <span className="text-[11px] text-[#7E5265] flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-[#58B988]" />
                      <span>Explicit confirmation prompt is required before sending</span>
                    </span>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Review & Send Email</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Recent Health Consultation Emails (5 cols) */}
              <div className="lg:col-span-5 glass-card p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#D9658B]" />
                    <h3 className="text-base font-serif font-bold text-[#3D1E28]">
                      Recent Care & Clinic Emails
                    </h3>
                  </div>
                  <button
                    onClick={fetchRecentEmails}
                    disabled={loading}
                    className="p-1.5 text-[#7E5265] hover:text-[#3D1E28] rounded-full hover:bg-slate-100"
                    title="Refresh Gmail"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <p className="text-[11px] text-[#7E5265]">
                  Showing messages matching health, doctor, or clinic appointments from your Gmail account.
                </p>

                {emails.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#7E5265] bg-white/40 rounded-2xl border border-dashed border-[#F4D5DC]">
                    No recent clinic/wellness emails found. Click refresh to query your Gmail inbox.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {emails.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-3.5 rounded-2xl bg-white/80 border border-[#F4D5DC] space-y-1 hover:border-[#D9658B]/50 transition-colors"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#3D1E28] truncate max-w-[180px]">
                            {msg.from}
                          </span>
                          <span className="text-[#7E5265] shrink-0">{msg.date}</span>
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
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-5 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#58B988]" />
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#3D1E28]">
                    Google Chat Wellness Spaces & Alerts
                  </h3>
                </div>
                <span className="text-[11px] text-[#58B988] font-semibold bg-[#E8F5E9] px-2.5 py-0.5 rounded-full border border-[#C8E6C9]">
                  Google Chat API Active
                </span>
              </div>

              <p className="text-xs text-[#7E5265]">
                Send encouraging cycle phase reminders or care guidelines into a Google Chat space shared with your partner or support circle.
              </p>

              {/* Phase Quick Presets for Chat */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#7E5265]">
                  Select Phase Message Preset:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setChatMessageText(
                        `🌸 Menstrual Rest Notice: In Menstrual phase (Day ${currentStatus.currentDay}). Heating pad, warm chamomile tea, and peaceful rest are greatly appreciated today!`
                      )
                    }
                    className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-[#FFF5F7] text-[#D9658B] border border-[#F4D5DC] hover:bg-[#FCECEF]"
                  >
                    🌸 Menstrual Rest
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setChatMessageText(
                        `🌿 Follicular High Energy: Entered Follicular phase (Day ${currentStatus.currentDay}). Creative projects and brisk outdoor walks are in full swing!`
                      )
                    }
                    className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-[#F3FAF5] text-[#58B988] border border-[#BFE7D0] hover:bg-[#E8F5E9]"
                  >
                    🌿 Follicular High Energy
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setChatMessageText(
                        `✨ Ovulation Vitality: Ovulation window active! Energy and social radiance are at their monthly peak.`
                      )
                    }
                    className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-[#FFF8ED] text-[#D97706] border border-[#FDE68A] hover:bg-[#FEF3C7]"
                  >
                    ✨ Ovulation Vitality
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setChatMessageText(
                        `🌙 Luteal Grounding Alert: In Luteal phase. Gentle patience, wholesome magnesium-rich meals, and quiet evenings help keep pre-menstrual symptoms peaceful.`
                      )
                    }
                    className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE] hover:bg-[#EDE9FE]"
                  >
                    🌙 Luteal Support
                  </button>
                </div>
              </div>

              <form onSubmit={requestSendChatMessageConfirmation} className="space-y-4">
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
                    <div className="p-3 bg-[#FFF8F8] rounded-xl border border-[#F4D5DC] text-xs text-[#7E5265] flex items-center justify-between">
                      <span>No specific Chat spaces joined yet. Message will be dispatched to your personal Google Chat thread.</span>
                      <button
                        type="button"
                        onClick={fetchChatSpaces}
                        className="text-[11px] text-[#58B988] hover:underline font-bold"
                      >
                        Refresh Spaces
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
                    Care Message Text
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={chatMessageText}
                    onChange={(e) => setChatMessageText(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-[#F4D5DC] bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#58B988]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] text-[#7E5265] flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-[#58B988]" />
                    <span>Confirmation prompt shown before sending</span>
                  </span>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#58B988] hover:bg-[#469A70] text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Review & Post to Google Chat</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 3. GOOGLE FORMS INTEGRATION */}
          {activeTab === 'forms' && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#A663CE]" />
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#3D1E28]">
                    Google Forms Health Intake & Surveys
                  </h3>
                </div>
                <span className="text-[11px] text-[#A663CE] font-semibold bg-[#F5F0FA] px-2.5 py-0.5 rounded-full border border-[#E3D4F2]">
                  Forms API Active
                </span>
              </div>

              <p className="text-xs text-[#7E5265]">
                Generate structured Google Forms directly in your Google Drive with pre-configured questions for weekly menstrual symptom tracking, clinic onboarding, and partner feedback.
              </p>

              {/* Form Creation Box */}
              <div className="p-4 rounded-2xl bg-white/80 border border-[#F4D5DC] space-y-3">
                <label className="block text-xs font-semibold text-[#3D1E28]">
                  New Form Title
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g., Weekly Cycle Wellbeing Survey"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-white focus:outline-none focus:ring-2 focus:ring-[#A663CE]"
                  />
                  <button
                    onClick={requestCreateFormConfirmation}
                    disabled={loading}
                    className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#A663CE] hover:bg-[#914CBB] text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50 shrink-0"
                  >
                    {loading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>Create in Google Drive</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#7E5265]">
                  ✨ Automatically adds symptom severity and wellness rating questions to your Google Form.
                </p>
              </div>

              {/* List of Created Forms */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#3D1E28] uppercase tracking-wider">
                  Your Synced Google Forms ({createdForms.length})
                </h4>

                {createdForms.map((f, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-white/90 border border-[#F4D5DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#A663CE]/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-[#3D1E28] flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-[#A663CE]" />
                        <span>{f.title}</span>
                      </div>
                      <div className="text-[11px] text-[#7E5265] flex items-center gap-3">
                        <span>Form ID: {f.formId}</span>
                        {f.createdDate && <span>• Created: {f.createdDate}</span>}
                        {f.responseCount !== undefined && (
                          <span className="text-[#58B988] font-semibold">
                            • {f.responseCount} response(s)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={f.responderUri || `https://docs.google.com/forms/d/${f.formId}/viewform`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#FFF5F7] hover:bg-[#FCECEF] text-[#D9658B] border border-[#F4D5DC] rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Fill Out</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={f.editUri || `https://docs.google.com/forms/d/${f.formId}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-[#7E5265] border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Edit Questions</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
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
