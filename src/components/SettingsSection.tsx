import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Globe,
  Database,
  Download,
  Trash2,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const SettingsSection: React.FC = () => {
  const {
    language,
    setLanguage,
    cycleSettings,
    updateCycleSettings,
    dailyLogs,
    partnerPermissions,
  } = useApp();

  const [formSettings, setFormSettings] = useState({ ...cycleSettings });
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateCycleSettings(formSettings);
    setSaveNotice('Settings updated successfully!');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleExportData = () => {
    const backupData = {
      app: 'Sakhi Cycle',
      exportedAt: new Date().toISOString(),
      cycleSettings,
      dailyLogs,
      partnerPermissions,
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
          Manage your cycle formulas, language preference, cloud synchronizations, and private health data exports.
        </p>
      </div>

      {saveNotice && (
        <div className="p-3 bg-[#F3FAF5] border border-[#BFE7D0] text-[#226947] rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#58B988]" />
          <span>{saveNotice}</span>
        </div>
      )}

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
          Cycle Calculation Parameters
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

      {/* Cloud & Database Connectivity Status */}
      <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#3D1E28]">
          <Database className="w-4 h-4 text-[#D9658B]" />
          <span>Cloud & Database Architecture</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white border border-[#F4D5DC] flex items-center justify-center text-sm shrink-0">
            ☁️
          </div>
          <div className="space-y-1 text-xs text-[#7E5265]">
            <div className="font-bold text-[#3D1E28]">
              Firebase Cloud Firestore & Authentication
            </div>
            <p className="leading-relaxed">
              Your cycle history, symptom check-ins, and companion settings synchronize seamlessly with Firebase Cloud Firestore. When signed in, any updates on any device persist under your private user document (<code className="bg-white/80 px-1 py-0.5 rounded text-[10px] text-[#D9658B]">users/{'{userId}'}</code>) guarded by strict security rules.
            </p>
          </div>
        </div>
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
          <span>Export All Saved Cycle Data (.json)</span>
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
