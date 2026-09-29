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
  QrCode,
  Smartphone,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PlansSectionProps {
  onClose?: () => void;
}

export const PlansSection: React.FC<PlansSectionProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'annual'>('annual');
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiMethod, setUpiMethod] = useState<'gpay' | 'phonepe' | 'paytm' | 'qr'>('gpay');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const amount = selectedBilling === 'annual' ? 1788 : 199;
  const merchantVpa = 'sakhiwellness@okaxis';

  const handleStartPayment = (method: 'gpay' | 'phonepe' | 'paytm' | 'qr') => {
    setUpiMethod(method);
    setShowUpiModal(true);
  };

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(merchantVpa);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 3000);
  };

  const handleConfirmUpiPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 1500);
  };

  // Launch native GPay / UPI intent link on mobile devices
  const launchNativeUpiIntent = () => {
    const upiUrl = `upi://pay?pa=${encodeURIComponent(merchantVpa)}&pn=SakhiCycle&am=${amount}&cu=INR&tn=SakhiPremium_${selectedBilling}`;
    window.location.href = upiUrl;
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
          Sakhi Cycle provides 100% free, private cycle tracking, symptom logging, and basic insights for every woman forever. Premium tiers unlock deep hormone analytics, unlimited Sakhi AI companion queries, GPay/UPI instant access, and priority doctor consultations.
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
              Monthly Billing (₹199/mo)
            </button>
            <button
              onClick={() => setSelectedBilling('annual')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedBilling === 'annual'
                  ? 'bg-white text-[#D9658B] shadow-xs'
                  : 'text-[#7E5265] hover:text-[#3D1E28]'
              }`}
            >
              <span>Annual Billing (₹149/mo)</span>
              <span className="text-[10px] bg-[#58B988] text-white px-1.5 py-0.5 rounded-full font-bold">
                Save 25%
              </span>
            </button>
          </div>
        </div>
      </div>

      {paymentSuccess && (
        <div className="p-5 rounded-3xl bg-[#F3FAF5] border border-[#BFE7D0] text-[#226947] space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-[#58B988]" />
            <span>Sakhi Premium Activated!</span>
          </div>
          <p className="text-xs text-[#226947]/90 leading-relaxed">
            Your UPI payment of ₹{amount} was received successfully. Unlimited Sakhi AI queries, longitudinal symptom reports, and doctor consult access are now unlocked for your account.
          </p>
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

          <div className="pt-4 border-t border-[#FCECEF] space-y-2">
            <div className="text-[11px] font-bold text-[#3D1E28] flex items-center justify-between">
              <span>Instant Pay with UPI / GPay:</span>
              <span className="text-[#D9658B] font-extrabold">₹{amount}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleStartPayment('gpay')}
                className="py-2.5 px-3 bg-white hover:bg-slate-50 text-[#3D1E28] border border-slate-300 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#4285F4]" />
                <span>Google Pay</span>
              </button>

              <button
                onClick={() => handleStartPayment('phonepe')}
                className="py-2.5 px-3 bg-white hover:bg-slate-50 text-[#3D1E28] border border-slate-300 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#5f259f]" />
                <span>PhonePe / Paytm</span>
              </button>
            </div>

            <button
              onClick={() => handleStartPayment('qr')}
              className="w-full py-3 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-xl text-xs font-bold shadow-md shadow-[#D9658B]/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Pay with Any UPI QR / VPA</span>
            </button>
          </div>
        </div>
      </div>

      {/* UPI / GPay Interactive Payment Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#F4D5DC] shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#FCECEF]">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌸</span>
                <div>
                  <h4 className="text-base font-serif font-bold text-[#3D1E28]">
                    Sakhi Premium UPI Checkout
                  </h4>
                  <p className="text-[11px] text-[#7E5265]">
                    Amount Payable: <strong className="text-[#D9658B]">₹{amount}</strong> ({selectedBilling})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUpiModal(false)}
                className="text-[#7E5265] hover:text-[#3D1E28] p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Fast Direct Intent */}
            <div className="space-y-3">
              <button
                onClick={launchNativeUpiIntent}
                className="w-full py-3 bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>Open GPay / PhonePe App Directly</span>
              </button>

              <div className="flex items-center gap-2 text-center text-[10px] text-[#7E5265] uppercase tracking-wider before:flex-1 before:border-t before:border-[#F4D5DC] after:flex-1 after:border-t after:border-[#F4D5DC]">
                or scan QR code
              </div>

              {/* Dynamic QR Code Box */}
              <div className="p-4 bg-[#FFF8F8] rounded-2xl border border-[#F4D5DC] flex flex-col items-center justify-center space-y-3">
                <div className="w-40 h-40 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center relative">
                  {/* SVG UPI QR Representation */}
                  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                    <rect width="100" height="100" fill="white" />
                    <rect x="5" y="5" width="30" height="30" fill="#3D1E28" rx="4" />
                    <rect x="10" y="10" width="20" height="20" fill="white" rx="2" />
                    <rect x="14" y="14" width="12" height="12" fill="#D9658B" rx="1" />
                    <rect x="65" y="5" width="30" height="30" fill="#3D1E28" rx="4" />
                    <rect x="70" y="10" width="20" height="20" fill="white" rx="2" />
                    <rect x="74" y="14" width="12" height="12" fill="#D9658B" rx="1" />
                    <rect x="5" y="65" width="30" height="30" fill="#3D1E28" rx="4" />
                    <rect x="10" y="70" width="20" height="20" fill="white" rx="2" />
                    <rect x="14" y="74" width="12" height="12" fill="#D9658B" rx="1" />
                    {/* Data Pixels */}
                    <circle cx="45" cy="15" r="3" fill="#3D1E28" />
                    <circle cx="55" cy="25" r="3" fill="#D9658B" />
                    <circle cx="45" cy="35" r="3" fill="#3D1E28" />
                    <circle cx="50" cy="50" r="5" fill="#D9658B" />
                    <circle cx="65" cy="50" r="3" fill="#3D1E28" />
                    <circle cx="75" cy="65" r="4" fill="#3D1E28" />
                    <circle cx="85" cy="80" r="4" fill="#D9658B" />
                    <circle cx="50" cy="75" r="3" fill="#3D1E28" />
                    <circle cx="40" cy="85" r="3" fill="#D9658B" />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-[#3D1E28]">
                    Scan with any UPI App (GPay, PhonePe, Paytm)
                  </div>
                  <div className="text-[11px] text-[#7E5265] flex items-center justify-center gap-1.5 mt-1">
                    <span>UPI ID: <code className="font-mono font-bold text-[#D9658B]">{merchantVpa}</code></span>
                    <button
                      onClick={handleCopyVpa}
                      className="p-1 hover:bg-white rounded-md text-[#7E5265] hover:text-[#D9658B]"
                      title="Copy UPI ID"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {copiedUpi && <span className="text-[10px] text-[#58B988] font-bold">Copied!</span>}
                  </div>
                </div>
              </div>

              {/* UPI ID Input & Confirmation */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-[#7E5265]">
                  Or Enter Your VPA / UPI ID (e.g., yourname@okhdfcbank)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="mobile@upi"
                    value={upiIdInput}
                    onChange={(e) => setUpiIdInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D9658B]"
                  />
                  <button
                    onClick={handleConfirmUpiPayment}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-[#D9658B] hover:bg-[#C54E74] text-white text-xs font-bold rounded-xl disabled:opacity-50 flex items-center gap-1"
                  >
                    {isProcessing ? 'Verifying...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#FFF5F7] rounded-xl text-[10px] text-[#7E5265] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D9658B] shrink-0" />
              <span>100% Secure NPCI UPI Protocol. Immediate activation upon transfer confirmation.</span>
            </div>
          </div>
        </div>
      )}

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
