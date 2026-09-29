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

  const handleExportData = () => {
    const backupData = {
      app: 'Sakhi Cycle',
      exportedAt: new Date().toISOString(),
      user: {
        email: user?.email,
        displayName: user?.displayName,
        profile: userProfile,
      },
      cycleSettings,
      dailyLogs,
      partnerPermissions,
      reminders,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sakhi_cycle_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
      <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-3">
        <div className="text-sm font-bold text-[#3D1E28]">
          Export & Data Portability
        </div>
        <p className="text-xs text-[#7E5265]">
          You own 100% of your data. Download a complete machine-readable JSON backup anytime to share with your gynecologist or store safely offline.
        </p>

        <button
          onClick={handleExportData}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#F4D5DC] text-[#7E5265] hover:text-[#3D1E28] hover:bg-[#FFF0F3] text-xs font-semibold transition-colors"
        >
          <Download className="w-4 h-4 text-[#D9658B]" />
          <span>Export All Saved Cycle & Health Data (.json)</span>
        </button>
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
