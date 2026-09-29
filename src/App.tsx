import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import { WorkspaceHub } from './components/WorkspaceHub';
import { PlansSection } from './components/PlansSection';
import { SakhiAIChat } from './components/SakhiAIChat';
import { SplashLoader } from './components/SplashLoader';
import { Login } from './components/Login';
import { DailyWellnessAffirmation } from './components/DailyWellnessAffirmation';
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
  Award,
  Mail,
  Video,
  Database,
  Cloud,
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

  const { user } = useAuth();
  const [isAIChatModalOpen, setIsAIChatModalOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const t = (key: string, params?: Record<string, string | number>) =>
    getTranslation(language, key, params);

  const status = calculateCycleStatus(cycleSettings);
  const phaseTheme = PHASE_COLORS[status.currentPhase];

  return (
    <div className="min-h-screen flex flex-col text-[#3D1E28] pb-20 md:pb-12 relative overflow-hidden">
      {/* Animated Cloudy Glowy Loading Page */}
      {showSplash && <SplashLoader onComplete={() => setShowSplash(false)} />}
      {/* Ambient Dreamy Floating Cloud Orbs in Background */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full cloud-glow-1 pointer-events-none -z-10 blur-3xl opacity-60 animate-pulse" />
      <div className="fixed top-1/3 -right-40 w-[500px] h-[500px] rounded-full cloud-glow-2 pointer-events-none -z-10 blur-3xl opacity-50" />
      <div className="fixed -bottom-40 left-1/4 w-[600px] h-[600px] rounded-full cloud-glow-1 pointer-events-none -z-10 blur-3xl opacity-40" />

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
                <div className="relative rounded-3xl overflow-hidden border border-white/60 shadow-lg bg-white/40 backdrop-blur-md">
                  <div className="relative h-[400px] sm:h-[480px] w-full overflow-hidden">
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
                      <div className="max-w-xl backdrop-blur-xl bg-white/20 p-6 sm:p-8 rounded-3xl border border-white/40 shadow-2xl text-white space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/25 text-xs font-semibold tracking-wide backdrop-blur-xs border border-white/30">
                          <img
                            src={IMAGES.sakhiLogo}
                            alt="Logo"
                            className="w-4 h-4 rounded-full"
                          />
                          <span>{t('todayGreeting')}</span>
                          {user && (
                            <span className="text-[#FCECEF] font-bold">
                              · {user.displayName?.split(' ')[0]}
                            </span>
                          )}
                        </div>

                        <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight leading-tight text-white drop-shadow-sm">
                          Understand • Track • Thrive
                        </h1>

                        <p className="text-xs sm:text-sm text-[#FCECEF] leading-relaxed max-w-lg">
                          Your holistic menstrual sanctuary. Powered by real-time Firebase syncing, sweeping doctor care cards, Flo-inspired partner solidarity, and Google Workspace integrations.
                        </p>

                        <div className="pt-2 flex flex-wrap items-center gap-3">
                          <button
                            onClick={() => {
                              setActiveSection('track');
                              setActiveSubSection('log');
                            }}
                            className="px-6 py-3 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-[#D9658B]/30 transition-all active:scale-[0.98] flex items-center gap-2"
                          >
                            <Heart className="w-4 h-4 fill-white/20" />
                            <span>{t('logTodayCTA')}</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveSection('learn');
                              setActiveSubSection('doctors');
                            }}
                            className="px-5 py-3 bg-white/25 hover:bg-white/35 backdrop-blur-md text-white border border-white/40 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
                          >
                            <Award className="w-4 h-4 text-[#F4A6B8]" />
                            <span>Sweep Doctors</span>
                          </button>

                          <button
                            onClick={() => setIsAIChatModalOpen(true)}
                            className="px-4 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/30 rounded-2xl text-xs font-semibold transition-all flex items-center gap-1.5"
                          >
                            <Sparkles className="w-4 h-4 text-[#F4A6B8]" />
                            <span>Sakhi AI</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rotating Daily Wellness Affirmation Card */}
                <DailyWellnessAffirmation />

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
                    <div className="glass-card p-6 rounded-3xl space-y-4">
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
                        <div className="p-3.5 rounded-2xl bg-white/70 border border-[#F4D5DC] space-y-1">
                          <div className="text-xs font-bold text-[#3D1E28] flex items-center gap-1.5">
                            <Coffee className="w-3.5 h-3.5 text-[#D9658B]" />
                            <span>Today’s Nourishment</span>
                          </div>
                          <p className="text-xs text-[#7E5265]">
                            Hydrating warm teas, mineral-rich broths, and roasted pumpkin seeds.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white/70 border border-[#F4D5DC] space-y-1">
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

                    {/* Sweeping Real-Life Doctors Spotlight */}
                    <div className="glass-card p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#D9658B]">
                          <Award className="w-3.5 h-3.5" />
                          <span>Sweeping Card Directory</span>
                        </div>
                        <h4 className="text-base font-serif font-bold text-[#3D1E28]">
                          Certified Real-Life Gynaecologists
                        </h4>
                        <p className="text-xs text-[#7E5265] max-w-md">
                          Swipe through verified specialists, hospital portals, and direct medical consultation inquiries.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setActiveSection('learn');
                          setActiveSubSection('doctors');
                        }}
                        className="px-5 py-2.5 bg-[#D9658B] text-white hover:bg-[#C54E74] rounded-2xl text-xs font-bold shadow-xs whitespace-nowrap transition-colors"
                      >
                        Sweep Doctors Stack
                      </button>
                    </div>

                    {/* Google Workspace & Cloud Sync Spotlight */}
                    <div className="glass-card p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#58B988]">
                          <Mail className="w-3.5 h-3.5" />
                          <span>Google Workspace & Cloud Sync</span>
                        </div>
                        <h4 className="text-base font-serif font-bold text-[#3D1E28]">
                          Gmail Inquiries, Google Chat & Forms
                        </h4>
                        <p className="text-xs text-[#7E5265] max-w-md">
                          Send clinic consultation emails, post wellness alerts to Chat spaces, and survey symptoms with Google Forms.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setActiveSection('workspace');
                        }}
                        className="px-5 py-2.5 bg-white border border-[#58B988] text-[#226947] hover:bg-[#F3FAF5] rounded-2xl text-xs font-bold shadow-xs whitespace-nowrap transition-colors"
                      >
                        Open Workspace
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TRACK SECTION */}
            {activeSection === 'track' && (
              <div className="space-y-6">
                <div className="relative rounded-3xl overflow-hidden border border-white/60 shadow-lg bg-white/40">
                  <div className="relative h-44 sm:h-52 w-full overflow-hidden">
                    <img
                      src={IMAGES.bgCloudTrack}
                      alt="Track rhythm cloud sanctuary"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3D1E28]/85 via-[#3D1E28]/50 to-transparent flex items-center p-6 sm:p-8">
                      <div className="text-white max-w-lg space-y-1.5">
                        <span className="text-xs uppercase tracking-wider font-bold text-[#F4A6B8] bg-white/20 px-3 py-0.5 rounded-full backdrop-blur-xs">
                          Rhythm & Daily Log Sanctuary
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                          Track Your Natural Flow
                        </h2>
                        <p className="text-xs sm:text-sm text-[#FCECEF]">
                          Log your symptoms, flow, and moods daily with cloud-synced precision and hormonal phase prediction.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {activeSubSection === 'calendar' && <CycleCalendar />}
                {activeSubSection === 'log' && <DailyLog />}
                {activeSubSection === 'insights' && <InsightsDashboard />}
              </div>
            )}

            {/* 3. LEARN SECTION */}
            {activeSection === 'learn' && (
              <div className="space-y-6">
                <div className="relative rounded-3xl overflow-hidden border border-white/60 shadow-lg bg-white/40">
                  <div className="relative h-44 sm:h-52 w-full overflow-hidden">
                    <img
                      src={IMAGES.bgCloudLearn}
                      alt="Learn & Wellness cloud sanctuary"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3D1E28]/85 via-[#3D1E28]/50 to-transparent flex items-center p-6 sm:p-8">
                      <div className="text-white max-w-lg space-y-1.5">
                        <span className="text-xs uppercase tracking-wider font-bold text-[#F4A6B8] bg-white/20 px-3 py-0.5 rounded-full backdrop-blur-xs">
                          Empowerment & Education
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                          Learn, Sync & Consult
                        </h2>
                        <p className="text-xs sm:text-sm text-[#FCECEF]">
                          Phase-based nutrition, verified gynecologist sweep cards, and video masterclass tutorials.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {activeSubSection === 'lifestyle' && <LifestyleSection />}
                {activeSubSection === 'products' && <ProductsSection />}
                {activeSubSection === 'doctors' && <DoctorsSection />}
              </div>
            )}

            {/* 4. COMMUNITY SECTION */}
            {activeSection === 'community' && (
              <div className="space-y-6">
                <div className="relative rounded-3xl overflow-hidden border border-white/60 shadow-lg bg-white/40">
                  <div className="relative h-44 sm:h-52 w-full overflow-hidden">
                    <img
                      src={IMAGES.bgCloudCommunity}
                      alt="Community support cloud sanctuary"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3D1E28]/85 via-[#3D1E28]/50 to-transparent flex items-center p-6 sm:p-8">
                      <div className="text-white max-w-lg space-y-1.5">
                        <span className="text-xs uppercase tracking-wider font-bold text-[#F4A6B8] bg-white/20 px-3 py-0.5 rounded-full backdrop-blur-xs">
                          Companionship & Care
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                          Safe Circles & Flo Partner Support
                        </h2>
                        <p className="text-xs sm:text-sm text-[#FCECEF]">
                          Pseudonymous community circles, anonymous cycle buddies, and empathetic partner sharing.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {activeSubSection === 'forum' && <ForumSection />}
                {activeSubSection === 'buddy' && <BuddySection />}
                {activeSubSection === 'partner' && <PartnerSection />}
              </div>
            )}

            {/* 5. VIBES SECTION */}
            {activeSection === 'vibes' && (
              <div className="space-y-6">
                <div className="relative rounded-3xl overflow-hidden border border-white/60 shadow-lg bg-white/40">
                  <div className="relative h-44 sm:h-52 w-full overflow-hidden">
                    <img
                      src={IMAGES.vibesBreathe}
                      alt="Vibes and tranquility sanctuary"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3D1E28]/85 via-[#3D1E28]/50 to-transparent flex items-center p-6 sm:p-8">
                      <div className="text-white max-w-lg space-y-1.5">
                        <span className="text-xs uppercase tracking-wider font-bold text-[#F4A6B8] bg-white/20 px-3 py-0.5 rounded-full backdrop-blur-xs">
                          Inner Peace & Sonic Sanctuary
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                          Calm, Breathe & Restore
                        </h2>
                        <p className="text-xs sm:text-sm text-[#FCECEF]">
                          4-7-8 guided somatic breathing, binaural cycle playlists, and daily uplifting affirmations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <VibesSection />
              </div>
            )}

            {/* 6. WORKSPACE INTEGRATION SECTION (Gmail, Chat, Forms) */}
            {activeSection === 'workspace' && <WorkspaceHub />}

            {/* 7. PLANS & SUBSCRIPTIONS SECTION */}
            {activeSection === 'plans' && <PlansSection />}

            {/* 8. SETTINGS SECTION */}
            {activeSection === 'settings' && <SettingsSection />}

            {/* 9. LOGIN SECTION */}
            {activeSection === 'login' && (
              <div className="py-6 flex items-center justify-center">
                <Login redirectTo="home" />
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Sakhi AI Assistant Button (Bottom Right) */}
      <button
        onClick={() => setIsAIChatModalOpen(true)}
        className="fixed bottom-20 lg:bottom-8 right-5 z-40 flex items-center gap-2.5 px-4 py-3 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-full shadow-xl shadow-[#D9658B]/30 transition-all hover:scale-105 active:scale-95 border border-white/40 focus-visible:outline-none"
        title="Open Sakhi AI Wellness Companion"
      >
        <span className="text-lg">🌸</span>
        <span className="text-xs font-bold tracking-wide pr-1">Ask Sakhi AI</span>
      </button>

      {/* Sakhi AI Modal */}
      {isAIChatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl glass-card bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/60">
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
      <footer className="mt-16 pt-8 pb-4 border-t border-white/60 text-center text-xs text-[#7E5265] space-y-2">
        <div className="flex items-center justify-center gap-2.5 text-sm font-serif font-bold text-[#3D1E28]">
          <img src={IMAGES.sakhiLogo} alt="Logo" className="w-5 h-5 rounded-full" />
          <span>Sakhi Cycle</span>
        </div>
        <p className="max-w-md mx-auto text-[11px] leading-relaxed">
          Understand • Track • Thrive. Protected by persistent cloud sync, Google OAuth, and compassionate medical privacy standards.
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
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}
