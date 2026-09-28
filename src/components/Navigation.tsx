import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  Smile,
  ShieldCheck,
  Music,
  Wind,
  Compass,
  MessageCircle,
  UserCheck,
  Award,
  ShoppingBag,
} from 'lucide-react';

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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = (key: string, params?: Record<string, string | number>) =>
    getTranslation(language, key, params);

  const topNavLinks = [
    { id: 'home', label: t('navHome'), icon: Heart },
    { id: 'track', label: t('navTrack'), icon: Calendar, defaultSub: 'calendar' },
    { id: 'learn', label: t('navLearn'), icon: BookOpen, defaultSub: 'lifestyle' },
    { id: 'community', label: t('navCommunity'), icon: Users, defaultSub: 'forum' },
    { id: 'vibes', label: t('navVibes'), icon: Sparkles, defaultSub: 'playlists' },
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
      { id: 'doctors', label: t('navDoctors'), icon: Award },
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

  return (
    <>
      {/* Top Bar Header */}
      <header className="sticky top-0 z-50 bg-[#FFF8F8]/90 backdrop-blur-md border-b border-[#F4D5DC]/60 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Zone 1: Brand Wordmark & Emblem */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9658B] rounded-lg"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E25574] via-[#F4A6B8] to-[#FFF0F3] flex items-center justify-center shadow-xs text-white text-lg font-serif font-bold group-hover:scale-105 transition-transform">
              🌸
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#3D1E28]">
                {t('brand')}
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-3 text-sm font-medium">
            {topNavLinks.map((link) => {
              const isActive = activeSection === link.id && !partnerModeActive;
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id, link.defaultSub)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs lg:text-sm tracking-wide transition-all ${
                    isActive
                      ? 'bg-[#FCECEF] text-[#D9658B] font-semibold shadow-xs'
                      : 'text-[#7E5265] hover:text-[#3D1E28] hover:bg-[#FFF0F3]'
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
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#F4D5DC] bg-white text-xs font-medium text-[#7E5265] hover:text-[#3D1E28] hover:border-[#D9658B] transition-colors shadow-xs"
              title="Switch English / Hindi"
            >
              <Globe className="w-3.5 h-3.5 text-[#D9658B]" />
              <span className="font-semibold">{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Flo-style Partner Care Mode Quick Toggle */}
            <button
              onClick={() => {
                setPartnerModeActive(!partnerModeActive);
                if (!partnerModeActive) {
                  setActiveSection('community');
                  setActiveSubSection('partner');
                }
              }}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                partnerModeActive
                  ? 'bg-[#3D1E28] text-white border-[#3D1E28]'
                  : 'bg-white text-[#7E5265] border-[#F4D5DC] hover:border-[#D9658B] hover:text-[#D9658B]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#D9658B]" />
              <span>{partnerModeActive ? 'Exit Partner View' : 'Partner Portal'}</span>
            </button>

            {/* Profile & Settings Button */}
            <button
              onClick={() => handleNavClick('settings')}
              className={`p-2 rounded-full transition-colors ${
                activeSection === 'settings'
                  ? 'bg-[#FCECEF] text-[#D9658B]'
                  : 'text-[#7E5265] hover:text-[#3D1E28] hover:bg-[#FFF0F3]'
              }`}
              title={t('navSettings')}
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#7E5265] hover:text-[#3D1E28] hover:bg-[#FFF0F3]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Sub-navigation bar when section has subsections */}
        {subSections[activeSection] && !partnerModeActive && (
          <div className="bg-[#FFF0F3]/80 border-t border-[#FCECEF] px-4 sm:px-6 py-2">
            <div className="max-w-6xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-none gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {subSections[activeSection].map((sub) => {
                  const isSubActive = activeSubSection === sub.id;
                  const SubIcon = sub.icon;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSubNavClick(sub.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-full whitespace-nowrap transition-all ${
                        isSubActive
                          ? 'bg-[#D9658B] text-white shadow-xs font-medium'
                          : 'bg-white/80 text-[#7E5265] hover:text-[#3D1E28] hover:bg-white border border-[#F4D5DC]/60'
                      }`}
                    >
                      <SubIcon className="w-3.5 h-3.5" />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Breadcrumb text */}
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#7E5265]/70 shrink-0">
                <span className="capitalize">{activeSection}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="font-semibold text-[#D9658B] capitalize">{activeSubSection}</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="fixed top-16 right-0 bottom-0 w-72 bg-[#FFF8F8] border-l border-[#F4D5DC] shadow-xl p-5 flex flex-col justify-between overflow-y-auto"
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
              </div>
            </div>

            <div className="pt-4 border-t border-[#FCECEF] text-xs text-[#7E5265] text-center">
              Sakhi Cycle · Pure Private Sanctuary
            </div>
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation Bar (Thumb Zone) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#F4D5DC] h-16 grid grid-cols-5 items-center px-1 pb-safe shadow-lg">
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
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {link.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
