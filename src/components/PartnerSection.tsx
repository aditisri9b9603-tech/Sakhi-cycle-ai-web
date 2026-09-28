import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateCycleStatus, PHASE_COLORS } from '../utils/cycleCalculations';
import { getTranslation } from '../utils/translations';
import { IMAGES } from '../assets/images';
import {
  ShieldCheck,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Eye,
  Lock,
  Heart,
  HelpCircle,
  Sparkles,
  UserX,
  BookOpen,
} from 'lucide-react';

export const PartnerSection: React.FC = () => {
  const {
    partnerPermissions,
    updatePartnerPermissions,
    disconnectPartner,
    cycleSettings,
    language,
    partnerModeActive,
    setPartnerModeActive,
  } = useApp();

  const t = (key: string, params?: Record<string, string | number>) =>
    getTranslation(language, key, params);

  const [copied, setCopied] = useState(false);
  const [partnerQuizAnswer, setPartnerQuizAnswer] = useState<number | null>(null);
  const [partnerQuizFeedback, setPartnerQuizFeedback] = useState<string | null>(null);

  const currentStatus = calculateCycleStatus(cycleSettings);
  const phaseTheme = PHASE_COLORS[currentStatus.currentPhase];

  const inviteUrl = `${window.location.origin}/#partner-invite=${partnerPermissions.inviteCode}`;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // WhatsApp consent-based click-to-chat
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hello! I've invited you to join my Sakhi Cycle Partner Care space so we can stay attuned to my wellness rhythms: ${inviteUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleQuizChoice = (idx: number) => {
    setPartnerQuizAnswer(idx);
    if (idx === 1) {
      setPartnerQuizFeedback(
        '✨ Correct! Bringing a warm tea, offering a gentle heating pad, or handling dinner without being asked are deeply comforting during the luteal/menstrual phase.'
      );
    } else {
      setPartnerQuizFeedback(
        '🌸 A thoughtful guess, but proactive, quiet nurturing—like warm food, heating compresses, and patience—often feels most supportive.'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Visual Card */}
      <div className="relative rounded-3xl overflow-hidden border border-[#F4D5DC] shadow-sm bg-white">
        <div className="relative h-56 sm:h-64 w-full overflow-hidden">
          <img
            src={IMAGES.partnerCare}
            alt="Warm empathetic partner companionship"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3D1E28]/85 via-[#3D1E28]/45 to-transparent flex flex-col justify-end p-6 sm:p-8">
            <span className="text-xs uppercase tracking-widest text-[#FCECEF] font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#F4A6B8]" />
              <span>Flo-Inspired Partner Care Space</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              Empathetic Solidarity, Total Privacy
            </h2>
            <p className="text-xs sm:text-sm text-[#FCECEF]/90 mt-1 max-w-xl">
              Enable your partner to understand your energetic seasons and support you thoughtfully, while keeping your private journals and logs completely protected.
            </p>
          </div>
        </div>

        {/* Mode Switcher Banner */}
        <div className="p-4 bg-white/95 border-t border-[#FCECEF] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#3D1E28]">Active View:</span>
            <span className={`text-xs px-3 py-1 rounded-full font-bold ${partnerModeActive ? 'bg-[#3D1E28] text-white' : 'bg-[#FCECEF] text-[#D9658B]'}`}>
              {partnerModeActive ? 'Partner Portal Simulation' : 'Account Owner Controls'}
            </span>
          </div>

          <button
            onClick={() => setPartnerModeActive(!partnerModeActive)}
            className="px-4 py-1.5 rounded-xl border border-[#F4D5DC] text-xs font-semibold text-[#7E5265] hover:text-[#3D1E28] hover:bg-[#FFF0F3] transition-colors"
          >
            {partnerModeActive ? 'Switch to Owner Controls' : 'Preview What Partner Sees'}
          </button>
        </div>
      </div>

      {!partnerModeActive ? (
        /* OWNER CONTROLS VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pairing Code Card */}
          <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#D9658B]" />
              <h3 className="text-base font-serif font-bold text-[#3D1E28]">
                Partner Pairing
              </h3>
            </div>

            <p className="text-xs text-[#7E5265] leading-relaxed">
              Share this secure single-link invitation with your partner. Sharing remains completely disabled until they accept and you grant permissions.
            </p>

            <div className="p-3 bg-[#FFF8F8] rounded-2xl border border-[#F4D5DC] space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#7E5265]">
                Pairing Invite Code
              </div>
              <div className="text-lg font-mono font-bold text-[#D9658B] tracking-wider">
                {partnerPermissions.inviteCode}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCopyInvite}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#FCECEF] hover:bg-[#F8DBE2] text-[#D9658B] rounded-xl text-xs font-semibold transition-all"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Link Copied!' : 'Copy Partner Invite Link'}</span>
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] rounded-xl text-xs font-semibold transition-all border border-[#25D366]/30"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Share via WhatsApp (Direct)</span>
              </button>
            </div>

            {partnerPermissions.isLinked && (
              <div className="pt-3 border-t border-[#FCECEF] space-y-2">
                <div className="text-xs text-[#7E5265] flex items-center justify-between">
                  <span>Connected Partner:</span>
                  <strong className="text-[#3D1E28]">{partnerPermissions.partnerName || 'Partner'}</strong>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Disconnect partner? They will immediately lose access.')) {
                      disconnectPartner();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Disconnect Partner</span>
                </button>
              </div>
            )}
          </div>

          {/* Granular Permission Toggles */}
          <div className="lg:col-span-2 p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-serif font-bold text-[#3D1E28]">
                Granular Sharing Controls
              </h3>
              <p className="text-xs text-[#7E5265] mt-0.5">
                Select exactly what high-level context your partner can view.
              </p>
            </div>

            <div className="space-y-3">
              {/* Share Phase */}
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-[#F4D5DC] bg-[#FFF8F8] cursor-pointer hover:bg-white transition-colors">
                <div className="pr-4">
                  <div className="text-xs font-bold text-[#3D1E28]">
                    Current Cycle Phase & Energy Guidance
                  </div>
                  <div className="text-[11px] text-[#7E5265]">
                    e.g., "Follicular Phase: High energy & creativity" or "Luteal Phase: Nesting & comfort"
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={partnerPermissions.sharePhase}
                  onChange={(e) => updatePartnerPermissions({ sharePhase: e.target.checked })}
                  className="w-5 h-5 accent-[#D9658B] rounded-sm cursor-pointer"
                />
              </label>

              {/* Share Next Period Window */}
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-[#F4D5DC] bg-[#FFF8F8] cursor-pointer hover:bg-white transition-colors">
                <div className="pr-4">
                  <div className="text-xs font-bold text-[#3D1E28]">
                    Approximate Period Window
                  </div>
                  <div className="text-[11px] text-[#7E5265]">
                    Share estimated arrival days so your partner can arrange heating pads, comfort snacks, or gentle weekend plans.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={partnerPermissions.shareNextPeriod}
                  onChange={(e) => updatePartnerPermissions({ shareNextPeriod: e.target.checked })}
                  className="w-5 h-5 accent-[#D9658B] rounded-sm cursor-pointer"
                />
              </label>

              {/* Share PMS Reminders */}
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-[#F4D5DC] bg-[#FFF8F8] cursor-pointer hover:bg-white transition-colors">
                <div className="pr-4">
                  <div className="text-xs font-bold text-[#3D1E28]">
                    Supportive Gentle Reminders
                  </div>
                  <div className="text-[11px] text-[#7E5265]">
                    Sends supportive tips like "She might need extra hydration and gentle patience today."
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={partnerPermissions.sharePMSMood}
                  onChange={(e) => updatePartnerPermissions({ sharePMSMood: e.target.checked })}
                  className="w-5 h-5 accent-[#D9658B] rounded-sm cursor-pointer"
                />
              </label>
            </div>

            {/* Strict Zero-Sharing Notice */}
            <div className="p-4 bg-[#FCECEF]/60 rounded-2xl border border-[#F4D5DC] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#3D1E28]">
                <Lock className="w-4 h-4 text-[#D9658B]" />
                <span>Strict Non-Negotiable Privacy Shield</span>
              </div>
              <p className="text-[11px] text-[#7E5265] leading-relaxed">
                By architectural design, your detailed daily symptoms, flow volume, intimacy logs, private diary notes, email, and phone number are <strong>never</strong> transmitted to partner view.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* PARTNER VIEW SIMULATION */
        <div className="space-y-6">
          <div className="p-6 bg-[#3D1E28] text-white rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#F4A6B8] font-semibold">
                Partner Companion Portal
              </span>
              <span className="text-xs bg-white/10 px-3 py-1 rounded-full">
                Limited Partner Access
              </span>
            </div>

            <h3 className="text-2xl font-serif font-bold text-white">
              Her Current Phase: {partnerPermissions.sharePhase ? currentStatus.phaseTitle : 'Private'}
            </h3>

            {partnerPermissions.sharePhase ? (
              <p className="text-xs sm:text-sm text-[#FCECEF]/90 max-w-2xl leading-relaxed">
                {currentStatus.phaseDescription}
              </p>
            ) : (
              <p className="text-xs text-[#FCECEF]/70">
                Phase details are kept private by account owner settings.
              </p>
            )}

            {partnerPermissions.shareNextPeriod && (
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#F4A6B8] font-semibold">Approximate Period Window</div>
                  <div className="text-sm font-serif font-bold text-white mt-0.5">
                    Estimated in ~{currentStatus.daysUntilNextPeriod} days
                  </div>
                </div>
                <Heart className="w-5 h-5 text-[#F4A6B8]" />
              </div>
            )}
          </div>

          {/* Supportive Action Suggestions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-[#F4D5DC] shadow-xs space-y-2">
              <span className="text-2xl">🍵</span>
              <h4 className="text-sm font-serif font-bold text-[#3D1E28]">
                Brew a Soothing Tea
              </h4>
              <p className="text-xs text-[#7E5265]">
                Warm chamomile, fresh peppermint, or ginger honey tea naturally eases pelvic tension and signals loving care.
              </p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-[#F4D5DC] shadow-xs space-y-2">
              <span className="text-2xl">🛋️</span>
              <h4 className="text-sm font-serif font-bold text-[#3D1E28]">
                Offer Comforting Space
              </h4>
              <p className="text-xs text-[#7E5265]">
                During the luteal and menstrual phase, energy turns inward. Listening without attempting to "fix" everything brings immense relief.
              </p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-[#F4D5DC] shadow-xs space-y-2">
              <span className="text-2xl">🍲</span>
              <h4 className="text-sm font-serif font-bold text-[#3D1E28]">
                Wholesome Warm Meal
              </h4>
              <p className="text-xs text-[#7E5265]">
                Preparing a nourishing warm soup, roasted vegetables, or whole grain dish without asking her to plan dinner is the ultimate gift.
              </p>
            </div>
          </div>

          {/* Educational Partner Quiz */}
          <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#D9658B]" />
              <h4 className="text-base font-serif font-bold text-[#3D1E28]">
                Cycle Knowledge Quiz for Partners
              </h4>
            </div>

            <p className="text-xs text-[#7E5265]">
              Question: When progesterone peaks during the Luteal phase (about a week before her period), what typically happens to her natural energy?
            </p>

            <div className="space-y-2">
              {[
                'She experiences boundless social energy and wants to host big parties.',
                'Her body temperature rises slightly, sleep needs increase, and energy naturally shifts inward for nesting.',
                'She needs high-intensity sprinting and minimal sleep.',
              ].map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuizChoice(idx)}
                  className={`w-full text-left p-3 rounded-2xl border text-xs transition-all ${
                    partnerQuizAnswer === idx
                      ? 'bg-[#FCECEF] border-[#D9658B] text-[#3D1E28] font-bold'
                      : 'bg-[#FFF8F8] border-[#F4D5DC] text-[#7E5265] hover:bg-[#FFF0F3]'
                  }`}
                >
                  <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span>
                  <span>{choice}</span>
                </button>
              ))}
            </div>

            {partnerQuizFeedback && (
              <div className="p-3.5 bg-[#FFF0F3] rounded-2xl border border-[#F4D5DC] text-xs text-[#3D1E28]">
                {partnerQuizFeedback}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
