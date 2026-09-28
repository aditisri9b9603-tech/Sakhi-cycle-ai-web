import { CyclePhase, CycleSettings } from '../types';

export interface CycleStatus {
  currentDay: number;
  totalDays: number;
  currentPhase: CyclePhase;
  phaseProgressPercent: number;
  cycleProgressPercent: number;
  daysUntilNextPeriod: number;
  nextPeriodDate: Date;
  ovulationDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  phaseTitle: string;
  phaseDescription: string;
}

export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function calculateCycleStatus(settings: CycleSettings, targetDate: Date = new Date()): CycleStatus {
  const start = parseDateString(settings.lastPeriodDate);
  const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  
  const diffTime = target.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const cycleLen = Math.max(20, Math.min(45, settings.cycleLength || 28));
  const periodDur = Math.max(2, Math.min(10, settings.periodDuration || 5));
  const lutealLen = Math.max(10, Math.min(16, settings.lutealLength || 14));
  
  // Normalized day within current cycle (1-indexed)
  const currentDay = ((diffDays % cycleLen) + cycleLen) % cycleLen + 1;
  const cycleCount = Math.floor(diffDays / cycleLen);
  
  // Cycle landmarks
  const ovulationDay = Math.max(periodDur + 2, cycleLen - lutealLen);
  const fertileStartDay = Math.max(periodDur + 1, ovulationDay - 5);
  const fertileEndDay = ovulationDay + 1;

  // Next period date
  const cyclesToAdd = diffDays >= 0 ? cycleCount + 1 : cycleCount;
  const nextPeriodDate = new Date(start);
  nextPeriodDate.setDate(start.getDate() + cyclesToAdd * cycleLen);
  
  const daysUntilNextPeriod = Math.max(0, Math.ceil((nextPeriodDate.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)));

  // Current cycle start date
  const currentCycleStart = new Date(start);
  currentCycleStart.setDate(start.getDate() + (diffDays >= 0 ? cycleCount * cycleLen : (cycleCount - 1) * cycleLen));

  const ovulationDate = new Date(currentCycleStart);
  ovulationDate.setDate(currentCycleStart.getDate() + ovulationDay - 1);

  const fertileWindowStart = new Date(currentCycleStart);
  fertileWindowStart.setDate(currentCycleStart.getDate() + fertileStartDay - 1);

  const fertileWindowEnd = new Date(currentCycleStart);
  fertileWindowEnd.setDate(currentCycleStart.getDate() + fertileEndDay - 1);

  let currentPhase: CyclePhase = 'follicular';
  let phaseTitle = 'Follicular Phase';
  let phaseDescription = 'Estrogen rises, renewal and creative energy bloom.';
  let phaseProgressPercent = 50;

  if (currentDay <= periodDur) {
    currentPhase = 'menstrual';
    phaseTitle = 'Menstrual Phase';
    phaseDescription = 'Shedding and natural rest. Time for gentleness and warmth.';
    phaseProgressPercent = Math.round((currentDay / periodDur) * 100);
  } else if (currentDay >= fertileStartDay && currentDay <= fertileEndDay) {
    currentPhase = 'ovulation';
    phaseTitle = 'Ovulatory Window';
    phaseDescription = 'Peak energy, confidence, and fertile hormone crest.';
    const span = Math.max(1, fertileEndDay - fertileStartDay + 1);
    phaseProgressPercent = Math.round(((currentDay - fertileStartDay + 1) / span) * 100);
  } else if (currentDay > fertileEndDay) {
    currentPhase = 'luteal';
    phaseTitle = 'Luteal Phase';
    phaseDescription = 'Progesterone peak, nesting, inward reflection, and restorative care.';
    const lutealSpan = Math.max(1, cycleLen - fertileEndDay);
    phaseProgressPercent = Math.round(((currentDay - fertileEndDay) / lutealSpan) * 100);
  } else {
    currentPhase = 'follicular';
    phaseTitle = 'Follicular Phase';
    phaseDescription = 'Fresh beginnings, rising vitality, and emotional clarity.';
    const follSpan = Math.max(1, fertileStartDay - periodDur);
    phaseProgressPercent = Math.round(((currentDay - periodDur) / follSpan) * 100);
  }

  const cycleProgressPercent = Math.min(100, Math.round((currentDay / cycleLen) * 100));

  return {
    currentDay,
    totalDays: cycleLen,
    currentPhase,
    phaseProgressPercent,
    cycleProgressPercent,
    daysUntilNextPeriod,
    nextPeriodDate,
    ovulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    phaseTitle,
    phaseDescription,
  };
}

export function getPhaseForDay(dayNumber: number, settings: CycleSettings): CyclePhase {
  const cycleLen = settings.cycleLength || 28;
  const periodDur = settings.periodDuration || 5;
  const lutealLen = settings.lutealLength || 14;
  const ovulationDay = Math.max(periodDur + 2, cycleLen - lutealLen);
  const fertileStartDay = Math.max(periodDur + 1, ovulationDay - 5);
  const fertileEndDay = ovulationDay + 1;

  if (dayNumber <= periodDur) return 'menstrual';
  if (dayNumber >= fertileStartDay && dayNumber <= fertileEndDay) return 'ovulation';
  if (dayNumber > fertileEndDay) return 'luteal';
  return 'follicular';
}

export const PHASE_COLORS: Record<CyclePhase, { bg: string; text: string; ring: string; border: string; label: string }> = {
  menstrual: {
    bg: '#FDF2F4',
    text: '#9E2A4B',
    ring: '#E25574',
    border: '#F8B4C4',
    label: 'Menstrual',
  },
  follicular: {
    bg: '#F3FAF5',
    text: '#226947',
    ring: '#58B988',
    border: '#BFE7D0',
    label: 'Follicular',
  },
  ovulation: {
    bg: '#FFF9ED',
    text: '#94580D',
    ring: '#E8A735',
    border: '#FDE1A9',
    label: 'Ovulation',
  },
  luteal: {
    bg: '#FBF5FD',
    text: '#693687',
    ring: '#A663CE',
    border: '#E3C8F7',
    label: 'Luteal',
  },
};
