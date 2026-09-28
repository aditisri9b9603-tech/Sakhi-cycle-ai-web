import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  calculateCycleStatus,
  formatDateToISO,
  parseDateString,
  PHASE_COLORS,
} from '../utils/cycleCalculations';
import { getTranslation } from '../utils/translations';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Calendar as CalendarIcon,
  Heart,
  Droplet,
  Sparkles,
  Info,
} from 'lucide-react';

export const CycleCalendar: React.FC<{ onDateSelect?: (dateStr: string) => void }> = ({
  onDateSelect,
}) => {
  const {
    cycleSettings,
    updateCycleSettings,
    dailyLogs,
    language,
    selectedCalendarDate,
    setSelectedCalendarDate,
    setActiveSection,
    setActiveSubSection,
  } = useApp();

  const t = (key: string, params?: Record<string, string | number>) =>
    getTranslation(language, key, params);

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date());
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Settings form local state
  const [formSettings, setFormSettings] = useState({ ...cycleSettings });

  const status = calculateCycleStatus(cycleSettings);

  const prevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  // Month grid calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateCycleSettings(formSettings);
    setShowSettingsModal(false);
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedCalendarDate(dateStr);
    if (onDateSelect) {
      onDateSelect(dateStr);
    } else {
      setActiveSection('track');
      setActiveSubSection('log');
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Calendar Header with navigation and settings toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white/90 backdrop-blur-md rounded-3xl border border-[#F4D5DC] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-serif font-bold text-[#3D1E28]">
              {monthName}
            </span>
            <span className="text-xs bg-[#FCECEF] text-[#D9658B] px-2.5 py-0.5 rounded-full font-semibold">
              {cycleSettings.cycleLength}-Day Rhythm
            </span>
          </div>
          <p className="text-xs text-[#7E5265] mt-1">
            Tap any date to record or inspect symptoms and journal notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl border border-[#F4D5DC] text-[#7E5265] hover:text-[#3D1E28] hover:bg-[#FFF0F3] transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentMonthDate(new Date())}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#F4D5DC] text-[#7E5265] hover:text-[#3D1E28] hover:bg-[#FFF0F3] transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl border border-[#F4D5DC] text-[#7E5265] hover:text-[#3D1E28] hover:bg-[#FFF0F3] transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setFormSettings({ ...cycleSettings });
              setShowSettingsModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FCECEF] text-[#D9658B] text-xs font-semibold hover:bg-[#F8DBE2] transition-colors ml-1"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Cycle Settings</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid Card */}
      <div className="p-5 bg-white/95 backdrop-blur-md rounded-3xl border border-[#F4D5DC] shadow-sm">
        {/* Day-of-week header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {dayNames.map((name) => (
            <div key={name} className="py-1 text-xs font-semibold text-[#7E5265]/80">
              {name}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Empty cells before month starts */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[58px] sm:min-h-[72px] rounded-xl bg-[#FFF8F8]/40" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const thisDate = new Date(year, month, dayNum);
            const dateStr = formatDateToISO(thisDate);
            const isToday = dateStr === formatDateToISO(new Date());
            const isSelected = dateStr === selectedCalendarDate;
            const logEntry = dailyLogs[dateStr];

            // Estimate phase for this calendar date
            const dayStatus = calculateCycleStatus(cycleSettings, thisDate);
            const phaseInfo = PHASE_COLORS[dayStatus.currentPhase];
            const isPeriodEstimated = dayStatus.currentPhase === 'menstrual';
            const isOvulationEstimated = dayStatus.currentPhase === 'ovulation';

            return (
              <button
                key={dateStr}
                onClick={() => handleDayClick(dateStr)}
                className={`relative min-h-[60px] sm:min-h-[74px] p-1.5 rounded-2xl flex flex-col justify-between text-left transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9658B] ${
                  isSelected
                    ? 'ring-2 ring-[#D9658B] shadow-sm bg-white'
                    : 'hover:bg-[#FFF0F3]/60'
                }`}
                style={{
                  backgroundColor: isSelected ? '#FFFFFF' : phaseInfo.bg + '66',
                  borderColor: phaseInfo.border,
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-semibold tabular-nums w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-[#D9658B] text-white shadow-xs'
                        : 'text-[#3D1E28]'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {/* Micro indicator badge */}
                  {isPeriodEstimated && (
                    <span className="w-2 h-2 rounded-full bg-[#E25574]" title="Estimated Menstrual" />
                  )}
                  {isOvulationEstimated && (
                    <span className="w-2 h-2 rounded-full bg-[#E8A735]" title="Estimated Ovulation" />
                  )}
                </div>

                {/* Logged item indicators */}
                <div className="flex items-center gap-1 mt-1">
                  {logEntry?.flow && logEntry.flow !== 'none' && (
                    <Droplet className="w-3 h-3 text-[#E25574]" />
                  )}
                  {logEntry?.mood && (
                    <span className="text-[10px]" title={`Mood: ${logEntry.mood}`}>
                      🌸
                    </span>
                  )}
                  {logEntry?.symptoms && logEntry.symptoms.length > 0 && (
                    <span className="text-[9px] font-bold text-[#7E5265] bg-white/80 px-1 rounded-sm">
                      +{logEntry.symptoms.length}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Phase Legend */}
        <div className="mt-6 pt-4 border-t border-[#FCECEF] flex flex-wrap items-center justify-between gap-3 text-xs text-[#7E5265]">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#E25574]" />
              <span>Menstrual ({cycleSettings.periodDuration}d)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#58B988]" />
              <span>Follicular</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#E8A735]" />
              <span>Fertile / Ovulation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#A663CE]" />
              <span>Luteal</span>
            </div>
          </div>
          <div className="text-[11px] text-[#7E5265]/80 flex items-center gap-1">
            <Info className="w-3 h-3 text-[#D9658B]" />
            <span>Predictions adapt as you record future cycles.</span>
          </div>
        </div>
      </div>

      {/* Cycle Rhythm Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white/90 rounded-2xl border border-[#F4D5DC] shadow-xs">
          <div className="text-xs text-[#7E5265] font-medium">Estimated Next Period</div>
          <div className="text-lg font-serif font-bold text-[#E25574] mt-0.5">
            {status.nextPeriodDate.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="text-xs text-[#7E5265] mt-1">
            ~{status.daysUntilNextPeriod} days remaining
          </div>
        </div>

        <div className="p-4 bg-white/90 rounded-2xl border border-[#F4D5DC] shadow-xs">
          <div className="text-xs text-[#7E5265] font-medium">Estimated Fertile Window</div>
          <div className="text-lg font-serif font-bold text-[#E8A735] mt-0.5">
            {status.fertileWindowStart.toLocaleDateString('default', { month: 'short', day: 'numeric' })} – {status.fertileWindowEnd.toLocaleDateString('default', { month: 'short', day: 'numeric' })}
          </div>
          <div className="text-xs text-[#7E5265] mt-1">
            Est. Ovulation: {status.ovulationDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        <div className="p-4 bg-white/90 rounded-2xl border border-[#F4D5DC] shadow-xs">
          <div className="text-xs text-[#7E5265] font-medium">Cycle Configuration</div>
          <div className="text-lg font-serif font-bold text-[#3D1E28] mt-0.5">
            {cycleSettings.cycleLength}d Cycle · {cycleSettings.periodDuration}d Period
          </div>
          <div className="text-xs text-[#7E5265] mt-1">
            Last period started: {cycleSettings.lastPeriodDate}
          </div>
        </div>
      </div>

      {/* Cycle Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#F4D5DC] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#FCECEF]">
              <h3 className="text-lg font-serif font-bold text-[#3D1E28]">
                Cycle Rhythm Settings
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-[#7E5265] hover:text-[#3D1E28] p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
                  Start Date of Last Period
                </label>
                <input
                  type="date"
                  value={formSettings.lastPeriodDate}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, lastPeriodDate: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:ring-2 focus:ring-[#D9658B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
                    Cycle Length (days)
                  </label>
                  <input
                    type="number"
                    min="21"
                    max="45"
                    value={formSettings.cycleLength}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, cycleLength: parseInt(e.target.value, 10) || 28 })
                    }
                    required
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:ring-2 focus:ring-[#D9658B] focus:outline-none"
                  />
                  <span className="text-[11px] text-[#7E5265]">Typical: 28 days</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3D1E28] mb-1">
                    Period Duration (days)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={formSettings.periodDuration}
                    onChange={(e) =>
                      setFormSettings({ ...formSettings, periodDuration: parseInt(e.target.value, 10) || 5 })
                    }
                    required
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:ring-2 focus:ring-[#D9658B] focus:outline-none"
                  />
                  <span className="text-[11px] text-[#7E5265]">Typical: 4-6 days</span>
                </div>
              </div>

              <div className="p-3 bg-[#FFF0F3] rounded-xl text-xs text-[#7E5265]">
                🔒 <strong>Privacy note:</strong> Cycle dates are stored in private browser storage and never sold or shared with advertisers.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#7E5265] hover:text-[#3D1E28]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#D9658B] hover:bg-[#C54E74] rounded-xl shadow-xs transition-all"
                >
                  Save Rhythm Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
