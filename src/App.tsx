import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { CycleRing } from './components/CycleRing';
import { CycleCalendar } from './components/CycleCalendar';
import { DailyLog } from './components/DailyLog';
import { InsightsDashboard } from './components/InsightsDashboard';
import { LifestyleSection } from './components/LifestyleSection';
import { ProductsSection } from './components/ProductsSection';
import { DoctorsSection } from './components/DoctorsSection';
import { ForumSection } from './components/ForumSection';
import { BuddySection } from './components/BuddySection';
import { PartnerSection } from './components/PartnerSection';
import { VibesSection } from './components/VibesSection';
import { SettingsSection } from './components/SettingsSection';
import { SakhiAIChat } from './components/SakhiAIChat';
import { calculateCycleStatus, PHASE_COLORS } from './utils/cycleCalculations';
import { getTranslation } from './utils/translations';
import { IMAGES } from './assets/images';
import {
  Sparkles,
  Heart,
  Calendar,
  ShieldCheck,
  Music,
  ArrowRight,
  MessageCircle,
  X,
  Compass,
  Smile,
  BookOpen,
  Coffee,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeSection,
    setActiveSection,
    activeSubSection,
    setActiveSubSection,
    cycleSettings,
    language,
    partnerModeActive,
  } = useApp();

  const [isAIChatModalOpen, setIsAIChatModalOpen] = useState(false);

  const t = (key: string, params?: Record<string, string | number>) =>
    getTranslation(language, key, params);

  const status = calculateCycleStatus(cycleSettings);
  const phaseTheme = PHASE_COLORS[status.currentPhase];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F8] text-[#3D1E28] pb-20 md:pb-12">
      {/* Sticky Top Navigation */}
      <Navigation />

      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* If Partner View Mode is active, render PartnerSection directly */}
        {partnerModeActive ? (
          <PartnerSection />
        ) : (
          <>
            {/* 1. HOME SCREEN */}
            {activeSection === 'home' && (
              <div className="space-y-8 sm:space-y-12">
                {/* Cinematic Hero Section with Translucent Glass Panel */}
                <div className="relative rounded-3xl overflow-hidden border border-[#F4D5DC] shadow-sm bg-white">
                  <div className="relative h-[380px] sm:h-[460px] w-full overflow-hidden">
                    <img
                      src={IMAGES.heroWellness}
                      alt="Gentle pink dawn light and floating petals"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000"
                    />
                    
                    {/* Gradient Overlay Scrim */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3D1E28]/85 via-[#3D1E28]/60 to-[#3D1E28]/25" />

                    {/* Translucent Glass-Style Content Panel */}
                    <div className="absolute inset-0 flex items-center p-6 sm:p-12">
                      <div className="max-w-xl backdrop-blur-md bg-white/20 p-6 sm:p-8 rounded-3xl border border-white/30 shadow-lg text-white space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/25 text-xs font-semibold tracking-wide backdrop-blur-xs">
                          <span>🌸</span>
                          <span>{t('todayGreeting')}</span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight leading-tight text-white drop-shadow-xs">
                          Attuned to Your Body’s Sacred Seasons
                        </h1>

                        <p className="text-xs sm:text-sm text-[#FCECEF] leading-relaxed max-w-lg">
                          A private wellness sanctuary designed for intelligent cycle awareness, consensual partner care, soothing herbal wisdom, and emotional harmony.
                        </p>

                        <div className="pt-2 flex flex-wrap items-center gap-3">
                          <button
                            onClick={() => {
                              setActiveSection('track');
                              setActiveSubSection('log');
                            }}
                            className="px-6 py-3 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-[#D9658B]/30 transition-all active:scale-[0.98] flex items-center gap-2"
                          >
                            <Heart className="w-4 h-4 fill-white/20" />
                            <span>{t('logTodayCTA')}</span>
                          </button>

                          <button
                            onClick={() => setIsAIChatModalOpen(true)}
                            className="px-5 py-3 bg-white/25 hover:bg-white/35 backdrop-blur-md text-white border border-white/40 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
                          >
                            <Sparkles className="w-4 h-4 text-[#F4A6B8]" />
                            <span>Ask Sakhi AI</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Today's Status & Interactive Cycle Ring Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left: Cycle Ring (5 cols) */}
                  <div className="lg:col-span-5">
                    <CycleRing
                      onLogClick={() => {
                        setActiveSection('track');
                        setActiveSubSection('log');
                      }}
                      onCalendarClick={() => {
                        setActiveSection('track');
                        setActiveSubSection('calendar');
                      }}
                    />
                  </div>

                  {/* Right: Today's Phase Care Card & Fast Actions (7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Current Phase Snapshot Card */}
                    <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                          style={{ backgroundColor: phaseTheme.bg, color: phaseTheme.text }}
                        >
                          {status.phaseTitle} · Day {status.currentDay}
                        </span>
                        <span className="text-xs text-[#7E5265]">
                          ~{status.daysUntilNextPeriod} days to next cycle
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#3D1E28]">
                        {status.phaseDescription}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3.5 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] space-y-1">
                          <div className="text-xs font-bold text-[#3D1E28] flex items-center gap-1.5">
                            <Coffee className="w-3.5 h-3.5 text-[#D9658B]" />
                            <span>Today’s Nourishment</span>
                          </div>
                          <p className="text-xs text-[#7E5265]">
                            Hydrating warm teas, mineral-rich broths, and roasted pumpkin seeds.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] space-y-1">
                          <div className="text-xs font-bold text-[#3D1E28] flex items-center gap-1.5">
                            <Smile className="w-3.5 h-3.5 text-[#58B988]" />
                            <span>Recommended Movement</span>
                          </div>
                          <p className="text-xs text-[#7E5265]">
                            Gentle somatic stretching, restorative yoga, or an easy scenic walk.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#FCECEF] flex items-center justify-between">
                        <button
                          onClick={() => {
                            setActiveSection('learn');
                            setActiveSubSection('lifestyle');
                          }}
                          className="text-xs font-bold text-[#D9658B] hover:text-[#C54E74] flex items-center gap-1"
                        >
                          <span>Explore Full Phase Guide</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setActiveSection('track');
                            setActiveSubSection('calendar');
                          }}
                          className="text-xs text-[#7E5265] hover:text-[#3D1E28] flex items-center gap-1"
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#D9658B]" />
                          <span>View Rhythm Calendar</span>
                        </button>
                      </div>
                    </div>

                    {/* Flo-Inspired Partner Support Feature Spotlight */}
                    <div className="p-6 bg-gradient-to-r from-white via-[#FFF0F3] to-white rounded-3xl border border-[#F4D5DC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#D9658B]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Flo-Inspired Partner Care</span>
                        </div>
                        <h4 className="text-base font-serif font-bold text-[#3D1E28]">
                          Bring Your Partner Into the Loop Safely
                        </h4>
                        <p className="text-xs text-[#7E5265] max-w-md">
                          Share your energetic phase and PMS comfort tips without revealing your private journal notes or symptoms.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setActiveSection('community');
                          setActiveSubSection('partner');
                        }}
                        className="px-5 py-2.5 bg-white border border-[#D9658B] text-[#D9658B] hover:bg-[#FCECEF] rounded-2xl text-xs font-bold shadow-xs whitespace-nowrap transition-colors"
                      >
                        Configure Sharing
                      </button>
                    </div>

                    {/* Quick Access Grid: Vibes & Community */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          setActiveSection('vibes');
                          setActiveSubSection('breathe');
                        }}
                        className="p-5 bg-white rounded-3xl border border-[#F4D5DC] shadow-xs text-left hover:border-[#D9658B]/50 transition-all group"
                      >
                        <span className="text-2xl">🌬️</span>
                        <h5 className="text-sm font-serif font-bold text-[#3D1E28] mt-2 group-hover:text-[#D9658B] transition-colors">
                          4-7-8 Guided Breathwork
                        </h5>
                        <p className="text-xs text-[#7E5265] mt-0.5">
                          Soothe your nervous system and release abdominal tension.
                        </p>
                      </button>

                      <button
                        onClick={() => {
                          setActiveSection('vibes');
                          setActiveSubSection('playlists');
                        }}
                        className="p-5 bg-white rounded-3xl border border-[#F4D5DC] shadow-xs text-left hover:border-[#D9658B]/50 transition-all group"
                      >
                        <span className="text-2xl">🎵</span>
                        <h5 className="text-sm font-serif font-bold text-[#3D1E28] mt-2 group-hover:text-[#D9658B] transition-colors">
                          Bollywood Sufi & Lofi Chai
                        </h5>
                        <p className="text-xs text-[#7E5265] mt-0.5">
                          Immerse in gentle acoustic melodies with Spotify integration.
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TRACK SECTION */}
            {activeSection === 'track' && (
              <div className="space-y-6">
                {activeSubSection === 'calendar' && <CycleCalendar />}
                {activeSubSection === 'log' && <DailyLog />}
                {activeSubSection === 'insights' && <InsightsDashboard />}
              </div>
            )}

            {/* 3. LEARN SECTION */}
            {activeSection === 'learn' && (
              <div className="space-y-6">
                {activeSubSection === 'lifestyle' && <LifestyleSection />}
                {activeSubSection === 'products' && <ProductsSection />}
                {activeSubSection === 'doctors' && <DoctorsSection />}
              </div>
            )}

            {/* 4. COMMUNITY SECTION */}
            {activeSection === 'community' && (
              <div className="space-y-6">
                {activeSubSection === 'forum' && <ForumSection />}
                {activeSubSection === 'buddy' && <BuddySection />}
                {activeSubSection === 'partner' && <PartnerSection />}
              </div>
            )}

            {/* 5. VIBES SECTION */}
            {activeSection === 'vibes' && <VibesSection />}

            {/* 6. SETTINGS SECTION */}
            {activeSection === 'settings' && <SettingsSection />}
          </>
        )}
      </main>

      {/* Floating Sakhi AI Assistant Button (Bottom Right) */}
      <button
        onClick={() => setIsAIChatModalOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-5 z-40 flex items-center gap-2.5 px-4 py-3 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-full shadow-lg shadow-[#D9658B]/30 transition-all hover:scale-105 active:scale-95 border border-white/20 focus-visible:outline-none"
        title="Open Sakhi AI Wellness Companion"
      >
        <span className="text-lg">🌸</span>
        <span className="text-xs font-bold tracking-wide pr-1">Ask Sakhi AI</span>
      </button>

      {/* Sakhi AI Modal */}
      {isAIChatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#F4D5DC]">
            <button
              onClick={() => setIsAIChatModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 text-[#7E5265] hover:text-[#3D1E28] rounded-full hover:bg-[#FFF0F3] transition-colors"
              aria-label="Close Sakhi AI"
            >
              <X className="w-5 h-5" />
            </button>
            <SakhiAIChat />
          </div>
        </div>
      )}

      {/* Loving Footer */}
      <footer className="mt-16 pt-8 pb-4 border-t border-[#F4D5DC]/60 text-center text-xs text-[#7E5265] space-y-2">
        <div className="flex items-center justify-center gap-2 text-sm font-serif font-bold text-[#3D1E28]">
          <span>🌸</span>
          <span>Sakhi Cycle</span>
        </div>
        <p className="max-w-md mx-auto text-[11px] leading-relaxed">
          Dedicated to every woman’s comfort, autonomy, and body wisdom. Created with loving care, scientific respect, and strict privacy principles.
        </p>
        <div className="pt-2 text-[10px] text-[#7E5265]/70">
          Not intended as a substitute for professional medical advice, diagnosis, or clinical treatment.
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
