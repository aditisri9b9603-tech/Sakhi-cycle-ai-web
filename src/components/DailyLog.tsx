import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DailyLogEntry, MoodType, FlowType } from '../types';
import { getTranslation } from '../utils/translations';
import { formatDateToISO } from '../utils/cycleCalculations';
import {
  Calendar,
  Smile,
  Zap,
  Droplet,
  Moon,
  Coffee,
  FileText,
  Save,
  Trash2,
  CheckCircle,
  Plus,
  Minus,
} from 'lucide-react';

export const DailyLog: React.FC = () => {
  const {
    dailyLogs,
    saveDailyLog,
    deleteDailyLog,
    language,
    selectedCalendarDate,
    setSelectedCalendarDate,
  } = useApp();

  const t = (key: string, params?: Record<string, string | number>) =>
    getTranslation(language, key, params);

  const [date, setDate] = useState<string>(selectedCalendarDate || formatDateToISO(new Date()));
  const [mood, setMood] = useState<MoodType | undefined>('calm');
  const [energy, setEnergy] = useState<number>(3);
  const [flow, setFlow] = useState<FlowType>('none');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [sleepHours, setSleepHours] = useState<number>(8);
  const [waterGlasses, setWaterGlasses] = useState<number>(8);
  const [notes, setNotes] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Sync state when selected date changes or existing log loads
  useEffect(() => {
    const existing = dailyLogs[date];
    if (existing) {
      setMood(existing.mood || 'calm');
      setEnergy(existing.energy || 3);
      setFlow(existing.flow || 'none');
      setSymptoms(existing.symptoms || []);
      setSleepHours(existing.sleepHours || 8);
      setWaterGlasses(existing.waterGlasses || 8);
      setNotes(existing.notes || '');
    } else {
      setMood('calm');
      setEnergy(3);
      setFlow('none');
      setSymptoms([]);
      setSleepHours(8);
      setWaterGlasses(8);
      setNotes('');
    }
  }, [date, dailyLogs]);

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    setSelectedCalendarDate(newDate);
  };

  const toggleSymptom = (symp: string) => {
    setSymptoms((prev) =>
      prev.includes(symp) ? prev.filter((s) => s !== symp) : [...prev, symp]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: DailyLogEntry = {
      date,
      mood,
      energy,
      flow,
      symptoms,
      sleepHours,
      waterGlasses,
      notes,
    };
    saveDailyLog(entry);
    setFeedbackMsg(t('entrySaved'));
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleDelete = () => {
    if (window.confirm('Delete log for this day?')) {
      deleteDailyLog(date);
      setFeedbackMsg(t('entryDeleted'));
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const moodsList: { id: MoodType; emoji: string; labelKey: string }[] = [
    { id: 'calm', emoji: '🌸', labelKey: 'moodCalm' },
    { id: 'happy', emoji: '✨', labelKey: 'moodHappy' },
    { id: 'energetic', emoji: '☀️', labelKey: 'moodEnergetic' },
    { id: 'sensitive', emoji: '🕊️', labelKey: 'moodSensitive' },
    { id: 'irritable', emoji: '🌧️', labelKey: 'moodIrritable' },
    { id: 'anxious', emoji: '🌪️', labelKey: 'moodAnxious' },
    { id: 'low', emoji: '🌙', labelKey: 'moodLow' },
  ];

  const flowsList: { id: FlowType; labelKey: string; color: string }[] = [
    { id: 'none', labelKey: 'flowNone', color: '#FCECEF' },
    { id: 'spotting', labelKey: 'flowSpotting', color: '#F8B4C4' },
    { id: 'light', labelKey: 'flowLight', color: '#F48BA3' },
    { id: 'medium', labelKey: 'flowMedium', color: '#E25574' },
    { id: 'heavy', labelKey: 'flowHeavy', color: '#B92348' },
  ];

  const commonSymptoms = [
    { id: 'Abdominal Cramps', key: 'sympCramps' },
    { id: 'Headache', key: 'sympHeadache' },
    { id: 'Bloating', key: 'sympBloating' },
    { id: 'Tender Breasts', key: 'sympTenderBreasts' },
    { id: 'Lower Backache', key: 'sympBackache' },
    { id: 'Skin Breakouts', key: 'sympAcne' },
    { id: 'Sweet / Salty Cravings', key: 'sympCravings' },
    { id: 'Body Fatigue', key: 'sympFatigue' },
    { id: 'Mild Nausea', key: 'sympNausea' },
    { id: 'Trouble Sleeping', key: 'sympInsomnia' },
  ];

  const hasExistingEntry = Boolean(dailyLogs[date]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title Card */}
      <div className="p-6 bg-white/95 backdrop-blur-md rounded-3xl border border-[#F4D5DC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#3D1E28]">
            {t('logTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-[#7E5265] mt-0.5">
            {t('logSubtitle')}
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-[#FFF8F8] px-3 py-1.5 rounded-2xl border border-[#F4D5DC]">
          <Calendar className="w-4 h-4 text-[#D9658B]" />
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="text-xs font-semibold text-[#3D1E28] bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-[#F3FAF5] border border-[#BFE7D0] text-[#226947] rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all">
          <CheckCircle className="w-4 h-4 text-[#58B988]" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Mood Section */}
        <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#3D1E28]">
            <Smile className="w-4 h-4 text-[#D9658B]" />
            <span>{t('howAreYouFeeling')}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {moodsList.map((m) => {
              const isSelected = mood === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all focus-visible:outline-none ${
                    isSelected
                      ? 'bg-[#FCECEF] border-[#D9658B] ring-1 ring-[#D9658B] shadow-xs'
                      : 'bg-[#FFF8F8]/60 border-[#F4D5DC]/60 hover:bg-[#FFF8F8] text-[#7E5265]'
                  }`}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <span className={`text-xs ${isSelected ? 'font-bold text-[#3D1E28]' : 'font-medium'}`}>
                    {t(m.labelKey)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Energy & Menstrual Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Energy */}
          <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-3">
            <div className="flex items-center justify-between text-sm font-bold text-[#3D1E28]">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#E8A735]" />
                <span>{t('energyLevel')}</span>
              </span>
              <span className="text-xs text-[#D9658B] font-semibold">{energy} / 5</span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setEnergy(level)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    energy === level
                      ? 'bg-[#E8A735] text-white border-[#E8A735] shadow-xs'
                      : 'bg-[#FFF8F8] border-[#F4D5DC] text-[#7E5265] hover:bg-[#FFF0F3]'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[11px] text-[#7E5265]">
              <span>Gentle / Resting</span>
              <span>Vibrant / Blooming</span>
            </div>
          </div>

          {/* Menstrual Flow */}
          <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#3D1E28]">
              <Droplet className="w-4 h-4 text-[#E25574]" />
              <span>{t('menstrualFlow')}</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {flowsList.map((f) => {
                const isSelected = flow === f.id;
                return (
                  <button
                    type="button"
                    key={f.id}
                    onClick={() => setFlow(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-[#E25574] text-white border-[#E25574] shadow-xs'
                        : 'bg-[#FFF8F8] border-[#F4D5DC] text-[#7E5265] hover:bg-[#FFF0F3]'
                    }`}
                  >
                    {t(f.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Symptoms Grid */}
        <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#3D1E28]">
              {t('symptomsTitle')}
            </span>
            <span className="text-xs text-[#7E5265]">{symptoms.length} selected</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {commonSymptoms.map((s) => {
              const isSelected = symptoms.includes(s.id);
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => toggleSymptom(s.id)}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                    isSelected
                      ? 'bg-[#FCECEF] text-[#D9658B] border-[#D9658B] font-bold shadow-2xs'
                      : 'bg-[#FFF8F8]/70 border-[#F4D5DC]/60 text-[#7E5265] hover:bg-[#FFF0F3]'
                  }`}
                >
                  {t(s.key)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sleep and Hydration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sleep */}
          <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-bold text-[#3D1E28]">
                <Moon className="w-4 h-4 text-[#A663CE]" />
                <span>{t('sleepTitle')}</span>
              </span>
              <span className="text-xs font-bold text-[#A663CE] tabular-nums">
                {sleepHours} hrs
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSleepHours((prev) => Math.max(0, prev - 0.5))}
                className="w-9 h-9 rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] flex items-center justify-center text-[#7E5265] hover:bg-[#FFF0F3]"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="3"
                max="14"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="flex-1 accent-[#A663CE]"
              />
              <button
                type="button"
                onClick={() => setSleepHours((prev) => Math.min(16, prev + 0.5))}
                className="w-9 h-9 rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] flex items-center justify-center text-[#7E5265] hover:bg-[#FFF0F3]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Water */}
          <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-bold text-[#3D1E28]">
                <Coffee className="w-4 h-4 text-[#58B988]" />
                <span>{t('hydrationTitle')}</span>
              </span>
              <span className="text-xs font-bold text-[#58B988] tabular-nums">
                {waterGlasses} glasses ({waterGlasses * 250} ml)
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setWaterGlasses((prev) => Math.max(0, prev - 1))}
                className="w-9 h-9 rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] flex items-center justify-center text-[#7E5265] hover:bg-[#FFF0F3]"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex-1 flex justify-center gap-1 overflow-x-auto py-1">
                {Array.from({ length: Math.min(12, waterGlasses) }).map((_, i) => (
                  <span key={i} className="text-sm">💧</span>
                ))}
                {waterGlasses === 0 && (
                  <span className="text-xs text-[#7E5265]">Tap + to log water</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setWaterGlasses((prev) => prev + 1)}
                className="w-9 h-9 rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] flex items-center justify-center text-[#7E5265] hover:bg-[#FFF0F3]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Private Journal Notes */}
        <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#3D1E28]">
            <FileText className="w-4 h-4 text-[#D9658B]" />
            <span>{t('notesTitle')}</span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={t('notesPlaceholder')}
            className="w-full p-3 rounded-2xl border border-[#F4D5DC] bg-[#FFF8F8] text-xs sm:text-sm text-[#3D1E28] focus:ring-2 focus:ring-[#D9658B] focus:outline-none"
          />
        </div>

        {/* Bottom CTA actions */}
        <div className="flex items-center justify-between gap-4 pt-2">
          {hasExistingEntry ? (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Check-in</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-8 py-3 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-2xl text-sm font-bold shadow-md shadow-[#D9658B]/20 transition-all active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>{t('saveEntry')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
