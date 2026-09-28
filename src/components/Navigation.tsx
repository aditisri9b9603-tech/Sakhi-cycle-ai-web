import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../utils/translations';
import {
  Calendar,
  Heart,
  BookOpen,
  Users,
  Sparkles,
  Settings,
  Menu,
  X,
  ChevronRight,
  Globe,
  Music,
  Smile,
  Wind,
  ShieldCheck,
  UserCheck,
  MessageCircle,
  ShoppingBag,
  Award,
  Compass,
  Mail,
  User as UserIcon,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { IMAGES } from '../assets/images';

export const Navigation: React.FC = () => {
  const {
    language,
    setLanguage,
    activeSection,
    setActiveSection,
    activeSubSection,
    setActiveSubSection,
    partnerModeActive,
    setPartnerModeActive,
  } = useApp();

  const {
    user,
    isSigningIn,
    authNotice,
    clearAuthNotice,
    signInWithGoogle,
    signInAsGuest,
    logout,
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const t = (key: string, params?: Record<string, string | number>) =>
    getTranslation(language, key, params);

  const topNavLinks = [
    { id: 'home', label: t('navHome'), icon: Heart },
    { id: 'track', label: t('navTrack'), icon: Calendar, defaultSub: 'calendar' },
    { id: 'learn', label: t('navLearn'), icon: BookOpen, defaultSub: 'lifestyle' },
    { id: 'community', label: t('navCommunity'), icon: Users, defaultSub: 'forum' },
    { id: 'vibes', label: t('navVibes'), icon: Sparkles, defaultSub: 'playlists' },
    { id: 'workspace', label: 'Workspace', icon: Mail, defaultSub: 'gmail' },
  ];

  const subSections: Record<string, { id: string; label: string; icon: any }[]> = {
    track: [
      { id: 'calendar', label: t('navCalendar'), icon: Calendar },
      { id: 'log', label: t('navDailyLog'), icon: Heart },
      { id: 'insights', label: t('navInsights'), icon: Compass },
    ],
    learn: [
      { id: 'lifestyle', label: t('navLifestyle'), icon: BookOpen },
      { id: 'products', label: t('navProducts'), icon: ShoppingBag },
      { id: 'doctors', label: 'Verified Doctors (Sweep)', icon: Award },
    ],
    community: [
      { id: 'forum', label: t('navForum'), icon: MessageCircle },
      { id: 'buddy', label: t('navBuddy'), icon: UserCheck },
      { id: 'partner', label: t('navPartner'), icon: ShieldCheck },
    ],
    vibes: [
      { id: 'playlists', label: t('navPlaylists'), icon: Music },
      { id: 'affirmations', label: t('navAffirmations'), icon: Smile },
      { id: 'breathe', label: t('navBreathe'), icon: Wind },
      { id: 'moodmatch', label: t('navMoodMatch'), icon: Sparkles },
    ],
  };

  const handleNavClick = (sectionId: string, defaultSub?: string) => {
    setActiveSection(sectionId);
    if (defaultSub) {
      setActiveSubSection(defaultSub);
    }
    setMobileMenuOpen(false);
  };

  const handleSubNavClick = (subId: string) => {
    setActiveSubSection(subId);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const handleGoogleClick = async () => {
    const success = await signInWithGoogle();
    if (success) {
      setAuthModalOpen(false);
    }
  };

  const handleGuestClick = async () => {
    const success = await signInAsGuest();
    if (success) {
      setAuthModalOpen(false);
    }
  };

  return (
    <>
      {/* Top Bar Header with Glassy Cloudy Aesthetic */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/60 shadow-[0_4px_20px_rgba(217,101,139,0.06)] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          
          {/* Zone 1: Official Sakhi Cycle Logo & Wordmark */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9658B] rounded-xl py-1"
          >
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-xs border border-white/80 group-hover:scale-105 transition-transform bg-[#FFF0F3]">
              <img
                src={IMAGES.sakhiLogo}
                alt="Sakhi Cycle Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#3D1E28] leading-none">
                Sakhi Cycle
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#D9658B] mt-0.5">
                Understand • Track • Thrive
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 text-sm font-medium">
            {topNavLinks.map((link) => {
              const isActive = activeSection === link.id && !partnerModeActive;
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id, link.defaultSub)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs xl:text-sm tracking-wide transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FCECEF] to-[#FFF0F3] text-[#D9658B] font-bold shadow-xs border border-[#F4D5DC]'
                      : 'text-[#7E5265] hover:text-[#3D1E28] hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D9658B]' : 'text-[#7E5265]'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Google / Guest User Profile or Sign-In button */}
            {user ? (
              <div className="flex items-center gap-2 bg-white/95 px-2.5 py-1 rounded-full border border-[#F4D5DC] shadow-xs">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full border border-[#D9658B]"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#FCECEF] text-[#D9658B] flex items-center justify-center text-[11px] font-bold">
                    {user.isAnonymous ? '🌸' : (user.email?.[0]?.toUpperCase() || 'U')}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-semibold text-[#3D1E28] max-w-[80px] truncate">
                  {user.isAnonymous ? 'Guest' : (user.displayName?.split(' ')[0] || 'User')}
                </span>
                <button
                  onClick={logout}
                  className="text-[10px] text-[#7E5265] hover:text-[#D9658B] ml-1 p-0.5"
                  title="Sign Out"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                disabled={isSigningIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 text-xs font-bold text-[#3D1E28] border border-slate-200 shadow-2xs transition-all active:scale-95 disabled:opacity-70"
              >
                {isSigningIn ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D9658B]" />
                ) : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                )}
                <span>Sign In</span>
              </button>
            )}

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-[#F4D5DC] bg-white/80 text-xs font-medium text-[#7E5265] hover:text-[#3D1E28] hover:border-[#D9658B] transition-colors shadow-2xs"
              title="Switch English / Hindi"
            >
              <Globe className="w-3.5 h-3.5 text-[#D9658B]" />
              <span className="font-semibold">{language === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>

            {/* Flo Partner Portal Quick Toggle */}
            <button
              onClick={() => {
                setPartnerModeActive(!partnerModeActive);
                if (!partnerModeActive) {
                  setActiveSection('community');
                  setActiveSubSection('partner');
                }
              }}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                partnerModeActive
                  ? 'bg-[#3D1E28] text-white border-[#3D1E28]'
                  : 'bg-white/80 text-[#7E5265] border-[#F4D5DC] hover:border-[#D9658B] hover:text-[#D9658B]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#D9658B]" />
              <span>{partnerModeActive ? 'Exit Partner' : 'Partner Portal'}</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => handleNavClick('settings')}
              className={`p-2 rounded-full transition-colors ${
                activeSection === 'settings'
                  ? 'bg-[#FCECEF] text-[#D9658B]'
                  : 'text-[#7E5265] hover:text-[#3D1E28] hover:bg-white/60'
              }`}
              title={t('navSettings')}
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#7E5265] hover:text-[#3D1E28] hover:bg-white/80"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Sub-navigation bar when active section has subsections */}
        {subSections[activeSection] && !partnerModeActive && (
          <div className="bg-gradient-to-r from-[#FFF0F3]/80 via-white/80 to-[#FFF0F3]/80 border-t border-white/60 px-4 sm:px-6 py-2">
            <div className="max-w-6xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-none gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {subSections[activeSection].map((sub) => {
                  const isSubActive = activeSubSection === sub.id;
                  const SubIcon = sub.icon;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSubNavClick(sub.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1 text-xs rounded-full whitespace-nowrap transition-all ${
                        isSubActive
                          ? 'bg-[#D9658B] text-white shadow-xs font-semibold'
                          : 'bg-white/90 text-[#7E5265] hover:text-[#3D1E28] hover:bg-white border border-[#F4D5DC]/70'
                      }`}
                    >
                      <SubIcon className="w-3.5 h-3.5" />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Breadcrumbs */}
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#7E5265]/70 shrink-0">
                <span className="capitalize">{activeSection}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="font-semibold text-[#D9658B] capitalize">{activeSubSection}</span>
              </div>
            </div>
          </div>
        )}

        {/* Subtle Floating Auth Notice Pill Banner */}
        {authNotice && (
          <div className="bg-[#FFF0F3] border-t border-[#F4D5DC] px-4 py-2 text-xs text-[#7E5265] flex items-center justify-between">
            <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-[#D9658B] shrink-0" />
                <span>{authNotice}</span>
              </div>
              <button
                onClick={clearAuthNotice}
                className="text-xs text-[#D9658B] hover:underline font-semibold shrink-0"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Sign In Options Modal */}
      {authModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setAuthModalOpen(false)}
        >
          <div
            className="glass-card bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-white/80 shadow-2xl space-y-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FFF0F3] to-[#FCECEF] border border-[#F4D5DC] flex items-center justify-center mx-auto text-2xl shadow-xs">
                🌸
              </div>
              <button
                onClick={() => setAuthModalOpen(false)}
                className="absolute top-0 right-0 p-1.5 text-[#7E5265] hover:text-[#3D1E28] rounded-full hover:bg-[#FFF0F3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-serif font-bold text-[#3D1E28]">
                Sign In to Sakhi Cycle
              </h3>
              <p className="text-xs text-[#7E5265]">
                Sync your daily logs, symptom trends, and doctor inquiries safely to the cloud.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleGoogleClick}
                disabled={isSigningIn}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 text-[#3D1E28] border border-slate-300 rounded-2xl text-xs font-bold shadow-xs transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isSigningIn ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#D9658B]" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <button
                onClick={handleGuestClick}
                disabled={isSigningIn}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#FFF5F7] hover:bg-[#FCECEF] text-[#D9658B] border border-[#F4D5DC] rounded-2xl text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-70"
              >
                <UserIcon className="w-4 h-4" />
                <span>Instant Guest Mode (Cloud Sync)</span>
              </button>
            </div>

            <p className="text-[11px] text-[#7E5265]/80 pt-1">
              Protected by Firebase Cloud Storage with strict private security rules.
            </p>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="fixed top-18 right-0 bottom-0 w-72 bg-white/95 backdrop-blur-xl border-l border-[#F4D5DC] shadow-2xl p-5 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#7E5265]/70 px-2">
                Navigation
              </div>
              <div className="space-y-1">
                {topNavLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = activeSection === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => handleNavClick(link.id, link.defaultSub)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#FCECEF] text-[#D9658B] font-semibold'
                          : 'text-[#3D1E28] hover:bg-[#FFF0F3]'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#D9658B]" />
                      <span>{link.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-[#FCECEF] space-y-1">
                <button
                  onClick={() => {
                    setPartnerModeActive(!partnerModeActive);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-[#3D1E28] hover:bg-[#FFF0F3]"
                >
                  <span className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-[#D9658B]" />
                    <span>Partner Portal</span>
                  </span>
                  <span className="text-xs bg-[#FCECEF] text-[#D9658B] px-2 py-0.5 rounded-full font-medium">
                    Flo Care
                  </span>
                </button>

                <button
                  onClick={() => handleNavClick('settings')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#3D1E28] hover:bg-[#FFF0F3]"
                >
                  <Settings className="w-4 h-4 text-[#D9658B]" />
                  <span>{t('navSettings')}</span>
                </button>

                {!user && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 mt-2 px-3 py-2.5 rounded-xl bg-[#D9658B] text-white text-xs font-bold"
                  >
                    <span>Sign In or Guest Mode</span>
                  </button>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#FCECEF] text-xs text-[#7E5265] text-center">
              Sakhi Cycle · Pure Private Sanctuary
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Thumb Zone) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-[#F4D5DC] h-16 grid grid-cols-6 items-center px-1 pb-safe shadow-lg">
        {topNavLinks.map((link) => {
          const Icon = link.icon;
          const isActive = activeSection === link.id && !partnerModeActive;
          return (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id, link.defaultSub)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                isActive ? 'text-[#D9658B]' : 'text-[#7E5265]'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[9px] mt-1 tracking-tight truncate max-w-[50px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {link.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
