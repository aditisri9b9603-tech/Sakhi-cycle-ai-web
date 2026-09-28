import React from 'react';
import { useApp } from '../context/AppContext';
import { calculateCycleStatus, PHASE_COLORS } from '../utils/cycleCalculations';
import { getTranslation } from '../utils/translations';
import { Sparkles, Calendar, Heart, ShieldAlert } from 'lucide-react';

interface CycleRingProps {
  onLogClick?: () => void;
  onCalendarClick?: () => void;
}

export const CycleRing: React.FC<CycleRingProps> = ({ onLogClick, onCalendarClick }) => {
  const { cycleSettings, language } = useApp();
  const t = (key: string, params?: Record<string, string | number>) =>
    getTranslation(language, key, params);

  const status = calculateCycleStatus(cycleSettings);
  const phaseTheme = PHASE_COLORS[status.currentPhase];

  // SVG circular calculations
  const size = 280;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (status.cycleProgressPercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white/80 backdrop-blur-md rounded-3xl border border-[#F4D5DC]/70 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
      {/* Subtle background glow */}
      <div
        className="absolute w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none -top-10 -right-10"
        style={{ backgroundColor: phaseTheme.ring }}
      />

      {/* Cycle Progress Ring */}
      <div className="relative w-[280px] h-[280px] flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#FCECEF"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active progress stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={phaseTheme.ring}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <span
            className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-1 transition-colors"
            style={{ backgroundColor: phaseTheme.bg, color: phaseTheme.text }}
          >
            {status.phaseTitle}
          </span>
          <div className="text-4xl font-serif font-bold text-[#3D1E28] tracking-tight tabular-nums my-0.5">
            Day {status.currentDay}
          </div>
          <div className="text-xs text-[#7E5265] font-medium">
            of {status.totalDays} day cycle
          </div>
          <div className="mt-2 text-xs text-[#3D1E28]/90 font-medium bg-[#FFF0F3] px-3 py-1 rounded-lg border border-[#F4D5DC]/60">
            {t('daysUntilPeriod', { days: status.daysUntilNextPeriod })}
          </div>
        </div>
      </div>

      {/* Phase Description */}
      <p className="mt-4 text-xs sm:text-sm text-center text-[#7E5265] max-w-sm leading-relaxed">
        {status.phaseDescription}
      </p>

      {/* Action Buttons */}
      <div className="mt-5 flex items-center gap-3 w-full max-w-xs">
        {onLogClick && (
          <button
            onClick={onLogClick}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
          >
            <Heart className="w-4 h-4 fill-white/20" />
            <span>{t('logTodayCTA')}</span>
          </button>
        )}
        {onCalendarClick && (
          <button
            onClick={onCalendarClick}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-white border border-[#F4D5DC] hover:border-[#D9658B] text-[#7E5265] hover:text-[#3D1E28] rounded-xl text-xs font-medium transition-all"
          >
            <Calendar className="w-4 h-4 text-[#D9658B]" />
            <span>Calendar</span>
          </button>
        )}
      </div>

      {/* Honest estimate disclaimer */}
      <div className="mt-4 flex items-center gap-1.5 text-[11px] text-[#7E5265]/80">
        <ShieldAlert className="w-3.5 h-3.5 text-[#D9658B]/80 shrink-0" />
        <span>{t('disclaimerEstimate')}</span>
      </div>
    </div>
  );
};
