import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  ShieldCheck,
  Heart,
  Crown,
  Lock,
  ArrowRight,
  HelpCircle,
  X,
  CreditCard,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PlansSectionProps {
  onClose?: () => void;
}

export const PlansSection: React.FC<PlansSectionProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'annual'>('annual');
  const [simulatedPaymentNotice, setSimulatedPaymentNotice] = useState<string | null>(null);

  const handleSimulateCheckout = (planName: string) => {
    setSimulatedPaymentNotice(
      `🔒 Secure Checkout Protocol: Stripe / Payment Gateway is currently in Sandbox/Preview mode for "${planName}". No live charge will be made until production Stripe keys and webhook signatures are activated in the server secrets.`
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0F3] text-xs font-bold text-[#D9658B] border border-[#F4D5DC]">
            <Crown className="w-3.5 h-3.5" />
            <span>Sakhi Membership Tiers</span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-[#7E5265] hover:text-[#3D1E28] rounded-full hover:bg-white/80"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3D1E28]">
          Transparent, Compassionate Wellness Plans
        </h2>
        <p className="text-xs sm:text-sm text-[#7E5265] max-w-2xl leading-relaxed">
          Sakhi Cycle provides 100% free, private cycle tracking, symptom logging, and basic insights for every woman forever. Premium tiers unlock deep hormone analytics, unlimited Sakhi AI companion queries, and priority doctor consultations.
        </p>

        {/* Billing Switcher */}
        <div className="pt-2 flex items-center justify-center">
          <div className="bg-[#FFF0F3] p-1 rounded-2xl border border-[#F4D5DC] flex items-center gap-1">
            <button
              onClick={() => setSelectedBilling('monthly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedBilling === 'monthly'
                  ? 'bg-white text-[#D9658B] shadow-xs'
                  : 'text-[#7E5265] hover:text-[#3D1E28]'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setSelectedBilling('annual')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedBilling === 'annual'
                  ? 'bg-white text-[#D9658B] shadow-xs'
                  : 'text-[#7E5265] hover:text-[#3D1E28]'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-[#58B988] text-white px-1.5 py-0.5 rounded-full font-bold">
                Save 25%
              </span>
            </button>
          </div>
        </div>
      </div>

      {simulatedPaymentNotice && (
        <div className="p-4 rounded-2xl bg-[#FFF5F7] border border-[#F4D5DC] text-xs text-[#7E5265] flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D9658B] shrink-0 mt-0.5" />
            <p className="leading-relaxed">{simulatedPaymentNotice}</p>
          </div>
          <button
            onClick={() => setSimulatedPaymentNotice(null)}
            className="text-xs font-bold text-[#D9658B] hover:underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tier 1: Free Forever */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl space-y-5 border border-[#F4D5DC] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7E5265] bg-slate-100 px-3 py-1 rounded-full">
                Free Forever
              </span>
              <span className="text-xs font-semibold text-[#58B988]">Active by Default</span>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-serif font-bold text-[#3D1E28]">₹0</span>
                <span className="text-xs text-[#7E5265]">/ always</span>
              </div>
              <p className="text-xs text-[#7E5265] mt-1">
                Essential cycle tracking, period predictions, and daily wellness logs.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-[#3D1E28] pt-2">
              {[
                'Full 4-phase cycle calendar & prediction calculations',
                'Comprehensive daily symptom, mood & discharge logging',
                'Device and encrypted Cloud database synchronization',
                'Flo-inspired empathetic Partner Care view & privacy controls',
                'Curated YouTube menstrual tutorials & Spotify playlists',
                'Community anonymous discussion forum & buddy matching',
                'Basic Sakhi AI daily wellness questions',
              ].map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#58B988] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-[#FCECEF]">
            <div className="w-full py-2.5 rounded-xl bg-slate-100 text-[#7E5265] text-xs font-bold text-center">
              Your Current Plan
            </div>
          </div>
        </div>

        {/* Tier 2: Sakhi Plus / Premium */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl space-y-5 border-2 border-[#D9658B] relative overflow-hidden flex flex-col justify-between shadow-lg bg-gradient-to-b from-white via-white to-[#FFF0F3]/40">
          <div className="absolute top-0 right-0 bg-[#D9658B] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs">
            Most Popular
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D9658B] bg-[#FFF0F3] px-3 py-1 rounded-full border border-[#F4D5DC]">
                Sakhi Premium
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-serif font-bold text-[#3D1E28]">
                  {selectedBilling === 'annual' ? '₹149' : '₹199'}
                </span>
                <span className="text-xs text-[#7E5265]">
                  / month {selectedBilling === 'annual' ? '(billed ₹1,788/yr)' : ''}
                </span>
              </div>
              <p className="text-xs text-[#7E5265] mt-1">
                Advanced endocrinology insights, unlimited AI queries, and telehealth perks.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-[#3D1E28] pt-2">
              {[
                'Everything in Free Forever tier',
                'Unlimited contextual conversations with Sakhi AI (Gemini 2.5 Flash)',
                'Longitudinal symptom pattern discovery & multi-cycle trends',
                'Exportable Clinical Gynaecologist PDF Summary Reports',
                'Priority verified clinic booking with participating specialists',
                'Custom luteal phase notifications & pre-menstrual meal plans',
                'Audio-guided binaural frequency sessions for somatic relief',
              ].map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 font-medium">
                  <Check className="w-4 h-4 text-[#D9658B] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-[#FCECEF]">
            <button
              onClick={() => handleSimulateCheckout('Sakhi Premium')}
              className="w-full py-3 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-xl text-xs font-bold shadow-md shadow-[#D9658B]/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Upgrade to Sakhi Premium</span>
            </button>
            <p className="text-[10px] text-[#7E5265] text-center mt-2">
              Cancel anytime. Stripe & Razorpay secure billing ready.
            </p>
          </div>
        </div>
      </div>

      {/* Trust & Guarantee Card */}
      <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF0F3] border border-[#F4D5DC] flex items-center justify-center text-lg shrink-0">
            🌸
          </div>
          <div>
            <div className="text-xs font-bold text-[#3D1E28]">
              Data Privacy & Medical Sovereignty Promise
            </div>
            <p className="text-[11px] text-[#7E5265]">
              We never sell your sensitive health entries, symptoms, or cycle timing to advertising brokers.
            </p>
          </div>
        </div>

        <div className="text-xs text-[#7E5265] flex items-center gap-1 shrink-0 font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#58B988]" />
          <span>Encrypted Cloud Storage</span>
        </div>
      </div>
    </div>
  );
};
