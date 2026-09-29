import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  Globe,
  Database,
  Download,
  Trash2,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  User,
  Bell,
  Plus,
  Clock,
  Heart,
  Save,
  Loader2,
  RefreshCw,
  FileJson,
  Copy,
  Check,
  Eye,
  EyeOff,
  FileText,
} from 'lucide-react';

export const SettingsSection: React.FC = () => {
  const {
    language,
    setLanguage,
    cycleSettings,
    updateCycleSettings,
    dailyLogs,
    partnerPermissions,
    userProfile,
    updateUserProfile,
    reminders,
    saveReminder,
    deleteReminder,
    syncStatus,
    lastSyncedTime,
    retryFailedSync,
  } = useApp();

  const { user, activeProvider } = useAuth();

  const [formSettings, setFormSettings] = useState({ ...cycleSettings });
  const [profileForm, setProfileForm] = useState({
    displayName: userProfile?.displayName || user?.displayName || '',
    birthDate: userProfile?.birthDate || '',
    healthGoals: userProfile?.healthGoals || 'Track cycle rhythm, balance energy & soothe cramps',
  });
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // New Reminder form state
  const [newReminderType, setNewReminderType] = useState('Period Approaching (2 Days Notice)');
  const [newReminderDate, setNewReminderDate] = useState('2026-10-15T09:00');
  const [isAddingReminder, setIsAddingReminder] = useState(false);

  // Sync profile form when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        displayName: userProfile.displayName || user?.displayName || '',
        birthDate: userProfile.birthDate || '',
        healthGoals: userProfile.healthGoals || 'Track cycle rhythm, balance energy & soothe cramps',
      });
    }
  }, [userProfile, user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCycleSettings(formSettings);
    setSaveNotice('Cycle parameters updated and synced!');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    const success = await updateUserProfile(profileForm);
    setIsSavingProfile(false);
    if (success) {
      setSaveNotice('User health profile saved to cloud!');
    } else {
      setSaveNotice('Saved locally to device.');
    }
    setTimeout(() => setSaveNotice(null), 3500);
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingReminder(true);
    await saveReminder({
      userId: user?.uid || user?.id || 'guest',
      reminderType: newReminderType,
      reminderDate: new Date(newReminderDate).toISOString(),
      isEnabled: true,
    });
    setIsAddingReminder(false);
    setSaveNotice('Reminder saved!');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleToggleReminder = async (remId: string, currentVal: boolean | undefined) => {
    const target = reminders.find((r) => r.id === remId);
    if (!target) return;
    await saveReminder({ ...target, isEnabled: !currentVal }, remId);
  };

  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [showJSONPreview, setShowJSONPreview] = useState(false);

  // Build structured cycle health history export payload
  const generateStructuredExportData = () => {
    const sortedLogDates = Object.keys(dailyLogs).sort();
    const sortedLogs = sortedLogDates.map((date) => ({
      ...dailyLogs[date],
    }));

    // Calculate health history summary metrics
    const allSymptoms = sortedLogs.flatMap((l) => l.symptoms || []);
    const symptomFrequency: Record<string, number> = {};
    allSymptoms.forEach((s) => {
      symptomFrequency[s] = (symptomFrequency[s] || 0) + 1;
    });

    const flowCounts: Record<string, number> = {};
    const moodCounts: Record<string, number> = {};
    let totalSleep = 0;
    let totalWater = 0;

    sortedLogs.forEach((l) => {
      if (l.flow) flowCounts[l.flow] = (flowCounts[l.flow] || 0) + 1;
      if (l.mood) moodCounts[l.mood] = (moodCounts[l.mood] || 0) + 1;
      totalSleep += l.sleepHours || 0;
      totalWater += l.waterGlasses || 0;
    });

    const totalDaysLogged = sortedLogs.length;

    return {
      schemaVersion: '1.2.0',
      appName: 'Sakhi Cycle',
      exportCategory: 'Personal Menstrual & Wellness Health History',
      exportedAt: new Date().toISOString(),
      user: {
        userId: user?.uid || user?.id || 'guest_local',
        displayName: userProfile?.displayName || user?.displayName || 'Sakhi User',
        email: user?.email || undefined,
        birthDate: userProfile?.birthDate || undefined,
        healthGoals: userProfile?.healthGoals || undefined,
      },
      cycleConfiguration: {
        lastPeriodStartDate: cycleSettings.lastPeriodDate,
        averageCycleLengthDays: cycleSettings.cycleLength,
        typicalPeriodDurationDays: cycleSettings.periodDuration,
        lutealPhaseLengthDays: cycleSettings.lutealLength,
      },
      healthHistorySummary: {
        totalDaysLogged,
        firstRecordedEntryDate: sortedLogDates[0] || null,
        latestRecordedEntryDate: sortedLogDates[sortedLogDates.length - 1] || null,
        averageSleepHours: totalDaysLogged > 0 ? Number((totalSleep / totalDaysLogged).toFixed(1)) : 0,
        averageDailyWaterGlasses: totalDaysLogged > 0 ? Number((totalWater / totalDaysLogged).toFixed(1)) : 0,
        loggedSymptomFrequency: symptomFrequency,
        recordedFlowDistribution: flowCounts,
        recordedMoodDistribution: moodCounts,
      },
      loggedCycleEntries: sortedLogs,
      activeReminders: reminders.map((r) => ({
        reminderType: r.reminderType,
        scheduledDate: r.reminderDate,
        isEnabled: Boolean(r.isEnabled),
      })),
      privacyNotice: 'This exported file contains sensitive personal health information generated by Sakhi Cycle and is intended strictly for your personal records or sharing with authorized healthcare professionals.',
    };
  };

  const handleExportData = () => {
    const structuredData = generateStructuredExportData();
    const jsonString = JSON.stringify(structuredData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `sakhi_cycle_health_history_${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportNotice('Your structured cycle data has been downloaded to your device!');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleCopyJSON = async () => {
    const structuredData = generateStructuredExportData();
    const jsonString = JSON.stringify(structuredData, null, 2);
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopiedJSON(true);
      setTimeout(() => setCopiedJSON(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#D9658B]" />
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3D1E28]">
            Settings & Data Sovereignty
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#7E5265]">
          Manage your health profile, cycle calculation parameters, reminders, cloud database sync, and private data portability.
        </p>
      </div>

      {saveNotice && (
        <div className="p-3.5 bg-[#F3FAF5] border border-[#BFE7D0] text-[#226947] rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-[#58B988] shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* User Health Profile (Schema: User @table) */}
      <form
        onSubmit={handleSaveProfile}
        className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between border-b border-[#FCECEF] pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#3D1E28]">
            <User className="w-4 h-4 text-[#D9658B]" />
            <span>Personal Health Profile</span>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FFF0F3] text-[#D9658B] font-medium border border-[#F4D5DC]">
            {user ? (user.email ? user.email : 'Authenticated Member') : 'Guest Mode (Local)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={profileForm.displayName}
              onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
              placeholder="e.g. Aditi Sharma"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:ring-2 focus:ring-[#D9658B] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
              Birth Date (For Hormonal & Age-Specific Calibration)
            </label>
            <input
              type="date"
              value={profileForm.birthDate}
              onChange={(e) => setProfileForm({ ...profileForm, birthDate: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:ring-2 focus:ring-[#D9658B] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
            Personal Health Goals
          </label>
          <textarea
            rows={2}
            value={profileForm.healthGoals}
            onChange={(e) => setProfileForm({ ...profileForm, healthGoals: e.target.value })}
            placeholder="e.g. Understand irregular cycles, gentle fertility awareness, soothing PMS migraine and cramps"
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:ring-2 focus:ring-[#D9658B] focus:outline-none leading-relaxed"
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSavingProfile}
            className="px-5 py-2.5 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            {isSavingProfile ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Update Health Profile</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Cycle Reminders & Notifications (Schema: Reminder @table) */}
      <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#FCECEF] pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#3D1E28]">
            <Bell className="w-4 h-4 text-[#D9658B]" />
            <span>Cycle Reminders & Gentle Alerts</span>
          </div>
          <span className="text-xs text-[#7E5265]">
            {reminders.length} scheduled alert{reminders.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="space-y-2.5">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className="p-3 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] flex items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#3D1E28] flex items-center gap-2">
                  <span>{rem.reminderType}</span>
                  <span
                    className={`text-[10px] px-2 py-0.2 rounded-full font-medium ${
                      rem.isEnabled
                        ? 'bg-[#EBF7EE] text-[#226947] border border-[#BFE7D0]'
                        : 'bg-black/5 text-[#7E5265]'
                    }`}
                  >
                    {rem.isEnabled ? 'Active' : 'Muted'}
                  </span>
                </div>
                <div className="text-[11px] text-[#7E5265] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#D9658B]" />
                  <span>
                    Scheduled: {new Date(rem.reminderDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(rem.reminderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleReminder(rem.id!, rem.isEnabled)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${
                    rem.isEnabled
                      ? 'bg-white border border-[#F4D5DC] text-[#7E5265] hover:bg-[#FFF0F3]'
                      : 'bg-[#D9658B] text-white hover:bg-[#C54E74]'
                  }`}
                >
                  {rem.isEnabled ? 'Mute' : 'Enable'}
                </button>
                <button
                  type="button"
                  onClick={() => deleteReminder(rem.id!)}
                  className="p-1.5 text-[#7E5265] hover:text-[#C54E74] transition-colors rounded-lg"
                  title="Delete reminder"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Reminder Form */}
        <form onSubmit={handleCreateReminder} className="pt-2 border-t border-[#FCECEF] grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-6">
            <label className="block text-[11px] font-semibold text-[#3D1E28] mb-1">
              Add New Reminder Type
            </label>
            <select
              value={newReminderType}
              onChange={(e) => setNewReminderType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:ring-2 focus:ring-[#D9658B] focus:outline-none"
            >
              <option value="Period Approaching (2 Days Notice)">Period Approaching (2 Days Notice)</option>
              <option value="Ovulation & High Energy Peak">Ovulation & High Energy Peak</option>
              <option value="Daily Seed Cycling & Hydration">Daily Seed Cycling & Hydration</option>
              <option value="Luteal Gentle Evening Wind-Down">Luteal Gentle Evening Wind-Down</option>
              <option value="Log Daily Symptoms & Flow">Log Daily Symptoms & Flow</option>
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[11px] font-semibold text-[#3D1E28] mb-1">
              Date & Preferred Time
            </label>
            <input
              type="datetime-local"
              value={newReminderDate}
              onChange={(e) => setNewReminderDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:ring-2 focus:ring-[#D9658B] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isAddingReminder}
              className="w-full py-2 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </form>
      </div>

      {/* Language Preference */}
      <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#3D1E28]">
          <Globe className="w-4 h-4 text-[#D9658B]" />
          <span>Language / भाषा</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 py-3 rounded-2xl border text-xs font-bold transition-all ${
              language === 'en'
                ? 'bg-[#FCECEF] text-[#D9658B] border-[#D9658B] shadow-xs'
                : 'bg-[#FFF8F8] border-[#F4D5DC] text-[#7E5265] hover:bg-[#FFF0F3]'
            }`}
          >
            English (Natural & Compassionate)
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`flex-1 py-3 rounded-2xl border text-xs font-bold transition-all ${
              language === 'hi'
                ? 'bg-[#FCECEF] text-[#D9658B] border-[#D9658B] shadow-xs'
                : 'bg-[#FFF8F8] border-[#F4D5DC] text-[#7E5265] hover:bg-[#FFF0F3]'
            }`}
          >
            हिन्दी (सरल व आत्मीय)
          </button>
        </div>
      </div>

      {/* Cycle Formulas */}
      <form onSubmit={handleSaveSettings} className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-4">
        <div className="text-sm font-bold text-[#3D1E28]">
          Cycle Calculation Parameters (Schema: Cycle @table)
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
            Start Date of Most Recent Period
          </label>
          <input
            type="date"
            value={formSettings.lastPeriodDate}
            onChange={(e) =>
              setFormSettings({ ...formSettings, lastPeriodDate: e.target.value })
            }
            required
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:ring-2 focus:ring-[#D9658B] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
              Average Cycle Length (Days)
            </label>
            <input
              type="number"
              min="21"
              max="45"
              value={formSettings.cycleLength}
              onChange={(e) =>
                setFormSettings({ ...formSettings, cycleLength: parseInt(e.target.value, 10) || 28 })
              }
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:ring-2 focus:ring-[#D9658B] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
              Typical Period Flow Duration (Days)
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={formSettings.periodDuration}
              onChange={(e) =>
                setFormSettings({ ...formSettings, periodDuration: parseInt(e.target.value, 10) || 5 })
              }
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:ring-2 focus:ring-[#D9658B] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            Save Parameters
          </button>
        </div>
      </form>

      {/* Cloud & Database Architecture Status */}
      <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[#3D1E28]">
            <Database className="w-4 h-4 text-[#D9658B]" />
            <span>Active Cloud Database & Auth Architecture</span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                syncStatus === 'synced'
                  ? 'bg-[#EBF7EE] text-[#226947] border border-[#BFE7D0]'
                  : syncStatus === 'syncing'
                  ? 'bg-[#FFF0F3] text-[#D9658B] border border-[#F4D5DC]'
                  : 'bg-black/5 text-[#7E5265]'
              }`}
            >
              {syncStatus === 'synced' ? '☁️ Synced to Cloud' : syncStatus === 'syncing' ? 'Syncing...' : 'Local Device Cache'}
            </span>

            <button
              onClick={retryFailedSync}
              className="p-1 rounded-lg text-[#7E5265] hover:text-[#D9658B] hover:bg-[#FFF0F3] transition-colors"
              title="Refresh cloud synchronization"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {activeProvider === 'firebase' ? (
          <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-[#F4D5DC] flex items-center justify-center text-sm shrink-0">
              🔥
            </div>
            <div className="space-y-1.5 text-xs text-[#7E5265]">
              <div className="font-bold text-[#3D1E28] flex items-center gap-2">
                <span>Google Firebase Firestore & Firebase Auth</span>
                <span className="text-[10px] bg-[#EBF7EE] text-[#226947] px-2 py-0.2 rounded-full font-semibold border border-[#BFE7D0]">
                  Active Engine
                </span>
              </div>
              <p className="leading-relaxed">
                Persistent storage configured with project <code className="bg-white px-1.5 py-0.5 rounded text-[11px] text-[#D9658B] font-mono">river-mediator-m7krv</code> and dedicated database <code className="bg-white px-1.5 py-0.5 rounded text-[11px] text-[#D9658B] font-mono">ai-studio-sakhicycleaiweb-e444fa5a-f998-4c79-a963-f7d8b7624415</code>.
              </p>
              <div className="text-[11px] text-[#7E5265] pt-1">
                Last cloud sync: <strong className="text-[#3D1E28]">{lastSyncedTime || 'Real-time automatic'}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-[#F4D5DC] flex items-center justify-center text-sm shrink-0">
              ⚡
            </div>
            <div className="space-y-1.5 text-xs text-[#7E5265]">
              <div className="font-bold text-[#3D1E28]">
                {activeProvider === 'supabase' ? 'Supabase PostgreSQL' : 'Local Offline Resilient Mode'}
              </div>
              <p className="leading-relaxed">
                {activeProvider === 'supabase'
                  ? 'Client-side Supabase authentication and PostgreSQL database storage.'
                  : 'All cycles and logs are safely cached in localStorage on this device.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Data Export & Backup */}
      <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#FCECEF] pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#3D1E28]">
            <FileJson className="w-4 h-4 text-[#D9658B]" />
            <span>Cycle Data Export & Health Sovereignty</span>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#EBF7EE] text-[#226947] font-semibold border border-[#BFE7D0]">
            100% User Owned
          </span>
        </div>

        <p className="text-xs text-[#7E5265] leading-relaxed">
          You have full ownership of your intimate health records. Export your complete logged menstrual history, symptoms, flow intensity, mood trends, and cycle configurations as a standardized, structured JSON document to your local device. Share it with your healthcare provider or keep it in your personal offline medical archive.
        </p>

        {/* Quick Data Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] space-y-0.5">
            <div className="text-[11px] text-[#7E5265]">Logged Days</div>
            <div className="text-base font-bold text-[#3D1E28]">
              {Object.keys(dailyLogs).length} day{Object.keys(dailyLogs).length === 1 ? '' : 's'}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] space-y-0.5">
            <div className="text-[11px] text-[#7E5265]">Avg Cycle</div>
            <div className="text-base font-bold text-[#3D1E28]">
              {cycleSettings.cycleLength || 28} days
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] space-y-0.5">
            <div className="text-[11px] text-[#7E5265]">Active Alerts</div>
            <div className="text-base font-bold text-[#3D1E28]">
              {reminders.filter((r) => r.isEnabled).length} active
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] space-y-0.5">
            <div className="text-[11px] text-[#7E5265]">Format</div>
            <div className="text-base font-bold text-[#D9658B] flex items-center gap-1">
              <span>JSON</span>
              <span className="text-[10px] font-normal text-[#7E5265]">(UTF-8)</span>
            </div>
          </div>
        </div>

        {exportNotice && (
          <div className="p-3 bg-[#F3FAF5] border border-[#BFE7D0] text-[#226947] rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-[#58B988] shrink-0" />
            <span>{exportNotice}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Download Health History (.json)</span>
          </button>

          <button
            type="button"
            onClick={handleCopyJSON}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#F4D5DC] bg-white text-[#7E5265] hover:text-[#3D1E28] hover:bg-[#FFF0F3] text-xs font-semibold transition-colors"
          >
            {copiedJSON ? (
              <>
                <Check className="w-4 h-4 text-[#226947]" />
                <span className="text-[#226947]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#D9658B]" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowJSONPreview(!showJSONPreview)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#F4D5DC] bg-white text-[#7E5265] hover:text-[#3D1E28] hover:bg-[#FFF0F3] text-xs font-semibold transition-colors ml-auto"
          >
            {showJSONPreview ? (
              <>
                <EyeOff className="w-4 h-4 text-[#D9658B]" />
                <span>Hide Preview</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-[#D9658B]" />
                <span>Preview Structured Data</span>
              </>
            )}
          </button>
        </div>

        {/* Structured JSON Collapsible Preview Box */}
        {showJSONPreview && (
          <div className="pt-2 animate-fadeIn">
            <div className="flex items-center justify-between text-[11px] text-[#7E5265] pb-1.5 px-1 font-mono">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#D9658B]" />
                Structured Schema Payload Preview
              </span>
              <span>
                ~{(JSON.stringify(generateStructuredExportData()).length / 1024).toFixed(1)} KB
              </span>
            </div>
            <pre className="p-4 bg-[#2D161F] text-[#FCECEF] rounded-2xl text-[11px] font-mono overflow-x-auto max-h-72 leading-relaxed border border-[#3D1E28]/40 shadow-inner">
              {JSON.stringify(generateStructuredExportData(), null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Medical Privacy Rights */}
      <div className="p-6 bg-[#FCECEF]/60 rounded-3xl border border-[#F4D5DC] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#D9658B] shrink-0 mt-0.5" />
        <div className="text-xs text-[#7E5265] space-y-1">
          <strong className="text-[#3D1E28]">Sakhi Privacy Declaration:</strong>
          <p className="leading-relaxed">
            Menstrual and cycle health data is sensitive medical information. Sakhi Cycle never monetizes health entries, embeds third-party commercial ad trackers, or sells user telemetry.
          </p>
        </div>
      </div>
    </div>
  );
};
