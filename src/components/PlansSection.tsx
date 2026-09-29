import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  Crown,
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Shield,
  Smartphone,
  Lock,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

interface PlansSectionProps {
  onClose?: () => void;
}

type PaymentStatus = 'idle' | 'creating_order' | 'checkout_open' | 'verifying' | 'success' | 'failed' | 'cancelled';

interface PaymentState {
  status: PaymentStatus;
  message?: string;
  orderId?: string;
  paymentId?: string;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const PlansSection: React.FC<PlansSectionProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { isPremiumMember, membershipPlan, activateMembership } = useApp();

  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'annual'>('annual');
  const [paymentState, setPaymentState] = useState<PaymentState>({ status: 'idle' });
  const [razorpayConfig, setRazorpayConfig] = useState<{ configured: boolean; keyId: string; testMode: boolean } | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  const amountDisplay = selectedBilling === 'annual' ? '₹1,788' : '₹199';

  // Load Razorpay public config from backend
  useEffect(() => {
    fetch('/api/razorpay/config')
      .then((res) => res.json())
      .then((data) => {
        setRazorpayConfig(data);
      })
      .catch((err) => {
        console.warn('Failed to load Razorpay config:', err);
      });
  }, []);

  // Dynamically load Razorpay checkout script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.Razorpay) {
      setSdkLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setSdkLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay checkout SDK');
      setPaymentState({
        status: 'failed',
        message: 'Could not load Razorpay checkout script. Please check your internet connection.',
      });
    };
    document.body.appendChild(script);

    return () => {
      // Keep script attached to prevent re-downloads
    };
  }, []);

  // Handler: Start Razorpay Checkout
  const handleInitiateRazorpayCheckout = async () => {
    if (!user) {
      setPaymentState({
        status: 'failed',
        message: 'Please sign in to Sakhi Cycle first. Subscriptions must be linked to your authenticated user account so your premium features are permanently saved.',
      });
      return;
    }

    if (!sdkLoaded || !window.Razorpay) {
      setPaymentState({
        status: 'failed',
        message: 'Razorpay Checkout SDK is still loading. Please try again in a moment.',
      });
      return;
    }

    setPaymentState({ status: 'creating_order', message: 'Creating payment order with trusted server pricing...' });

    try {
      // 1. Create order on server using trusted plan price
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedBilling,
          userId: user.uid || user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create payment order on server.');
      }

      const orderData = await response.json();

      setPaymentState({ status: 'checkout_open', orderId: orderData.orderId });

      // 2. Open official Razorpay Checkout popup
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Sakhi Cycle',
        description: orderData.planName || `Sakhi Premium (${selectedBilling})`,
        image: 'https://img.icons8.com/color/96/lotus.png',
        order_id: orderData.orderId,
        prefill: {
          name: user.displayName || 'Sakhi User',
          email: user.email || 'aditisri9b9603@gmail.com',
          contact: '9876543210',
        },
        notes: {
          planId: selectedBilling,
          userId: user.uid || user.id,
        },
        theme: {
          color: '#D9658B',
        },
        handler: async function (checkoutResponse: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          // 3. Cryptographically verify signature on server before granting access
          setPaymentState({
            status: 'verifying',
            message: 'Verifying payment signature with Razorpay servers...',
            orderId: checkoutResponse.razorpay_order_id,
            paymentId: checkoutResponse.razorpay_payment_id,
          });

          try {
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId: checkoutResponse.razorpay_order_id,
                paymentId: checkoutResponse.razorpay_payment_id,
                signature: checkoutResponse.razorpay_signature,
                planId: selectedBilling,
                userId: user.uid || user.id,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.verified) {
              // 4. Save confirmed membership to authenticated user's database
              await activateMembership(selectedBilling, {
                orderId: checkoutResponse.razorpay_order_id,
                paymentId: checkoutResponse.razorpay_payment_id,
                amount: orderData.amount,
              });

              setPaymentState({
                status: 'success',
                message: `Payment verified! You are now a Sakhi Premium member (${selectedBilling} plan).`,
                orderId: checkoutResponse.razorpay_order_id,
                paymentId: checkoutResponse.razorpay_payment_id,
              });
            } else {
              setPaymentState({
                status: 'failed',
                message: verifyData.error || 'Payment signature verification failed. Your plan was not activated.',
              });
            }
          } catch (err: any) {
            console.error('Signature verification error:', err);
            setPaymentState({
              status: 'failed',
              message: 'Could not contact server to verify payment signature. Please contact support with your Payment ID: ' + checkoutResponse.razorpay_payment_id,
            });
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentState((current) => {
              if (current.status === 'success' || current.status === 'verifying') {
                return current;
              }
              return {
                status: 'cancelled',
                message: 'Payment cancelled. Your checkout was not completed and you were not charged.',
              };
            });
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', function (failureResponse: any) {
        console.warn('Razorpay payment failed:', failureResponse);
        setPaymentState({
          status: 'failed',
          message: failureResponse.error?.description || 'Payment was declined or failed. Please try again with a valid test method.',
        });
      });

      razorpayInstance.open();
    } catch (error: any) {
      console.error('Razorpay initialization error:', error);
      setPaymentState({
        status: 'failed',
        message: error.message || 'Failed to start Razorpay payment. Please try again.',
      });
    }
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

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
              <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
              <span>Razorpay Test Mode</span>
            </span>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-[#7E5265] hover:text-[#3D1E28] rounded-full hover:bg-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3D1E28]">
          Transparent, Compassionate Wellness Plans
        </h2>
        <p className="text-xs sm:text-sm text-[#7E5265] max-w-2xl leading-relaxed">
          Sakhi Cycle provides 100% free cycle tracking, daily symptom logging, and period rhythm predictions for every woman forever. Premium tiers unlock unlimited Sakhi AI conversations, longitudinal endocrinology analytics, exportable doctor reports, and priority telemedicine consults.
        </p>

        {/* Billing Switcher */}
        <div className="pt-2 flex items-center justify-center">
          <div className="bg-[#FFF0F3] p-1 rounded-2xl border border-[#F4D5DC] flex items-center gap-1">
            <button
              onClick={() => {
                setSelectedBilling('monthly');
                setPaymentState({ status: 'idle' });
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedBilling === 'monthly'
                  ? 'bg-white text-[#D9658B] shadow-xs'
                  : 'text-[#7E5265] hover:text-[#3D1E28]'
              }`}
            >
              Monthly Billing (₹199/mo)
            </button>
            <button
              onClick={() => {
                setSelectedBilling('annual');
                setPaymentState({ status: 'idle' });
              }}
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

      {/* Payment State Notification Alerts */}
      {paymentState.status === 'creating_order' && (
        <div className="p-4 rounded-2xl bg-[#FFF8F0] border border-[#FEE2C7] text-[#B45309] text-xs flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#B45309] shrink-0" />
          <span>{paymentState.message}</span>
        </div>
      )}

      {paymentState.status === 'verifying' && (
        <div className="p-4 rounded-2xl bg-[#F0F7FF] border border-[#BAE6FD] text-[#0369A1] text-xs flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#0369A1] shrink-0" />
          <span>{paymentState.message}</span>
        </div>
      )}

      {paymentState.status === 'success' && (
        <div className="p-5 rounded-3xl bg-[#F3FAF5] border border-[#BFE7D0] text-[#226947] space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-[#58B988]" />
            <span>Sakhi Premium Activated!</span>
          </div>
          <p className="text-xs text-[#226947]/90 leading-relaxed">
            {paymentState.message}
          </p>
          {paymentState.paymentId && (
            <div className="pt-1 text-[11px] text-[#226947]/80 flex flex-wrap gap-4 font-mono">
              <span>Payment ID: {paymentState.paymentId}</span>
              {paymentState.orderId && <span>Order ID: {paymentState.orderId}</span>}
            </div>
          )}
        </div>
      )}

      {paymentState.status === 'failed' && (
        <div className="p-4 rounded-2xl bg-[#FFF0F3] border border-[#F4D5DC] text-[#A8385D] text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#D9658B] shrink-0" />
            <span>{paymentState.message}</span>
          </div>
          <button
            onClick={() => setPaymentState({ status: 'idle' })}
            className="text-[11px] font-bold text-[#D9658B] hover:underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {paymentState.status === 'cancelled' && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-[#7E5265] text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{paymentState.message}</span>
          </div>
          <button
            onClick={() => setPaymentState({ status: 'idle' })}
            className="text-[11px] font-bold text-[#7E5265] hover:underline shrink-0"
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
              {!isPremiumMember && (
                <span className="text-xs font-semibold text-[#58B988]">Active Plan</span>
              )}
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
                'Full 4-phase cycle calendar & rhythm predictions',
                'Comprehensive daily symptom, mood & discharge logging',
                'Device and encrypted Cloud database persistence',
                'Flo-inspired empathetic Partner Care view & privacy controls',
                'Standard YouTube menstrual tutorials & Spotify playlists',
                'Anonymous community forum discussions',
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
              {!isPremiumMember ? 'Your Active Plan' : 'Free Baseline Included'}
            </div>
          </div>
        </div>

        {/* Tier 2: Sakhi Premium */}
        <div className="glass-card p-6 sm:p-7 rounded-3xl space-y-5 border-2 border-[#D9658B] relative overflow-hidden flex flex-col justify-between shadow-lg bg-gradient-to-b from-white via-white to-[#FFF0F3]/40">
          <div className="absolute top-0 right-0 bg-[#D9658B] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs">
            {isPremiumMember ? 'Subscribed' : 'Most Popular'}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D9658B] bg-[#FFF0F3] px-3 py-1 rounded-full border border-[#F4D5DC]">
                Sakhi Premium
              </span>
              {isPremiumMember && (
                <span className="text-xs font-bold text-[#226947] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full border border-[#C8E6C9]">
                  Active ({membershipPlan})
                </span>
              )}
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-serif font-bold text-[#3D1E28]">
                  {selectedBilling === 'annual' ? '₹149' : '₹199'}
                </span>
                <span className="text-xs text-[#7E5265]">
                  / month {selectedBilling === 'annual' ? '(₹1,788 billed annually)' : ''}
                </span>
              </div>
              <p className="text-xs text-[#7E5265] mt-1">
                Unlimited Sakhi AI companion queries, hormonal analytics, and doctor teleconsult access.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-[#3D1E28] pt-2">
              {[
                'Everything in Free Forever tier',
                'Unlimited conversations with Sakhi AI (Gemini 2.5 Flash)',
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

          <div className="pt-4 border-t border-[#FCECEF] space-y-3">
            <div className="text-[11px] font-bold text-[#3D1E28] flex items-center justify-between">
              <span>Payable via Razorpay (UPI / Card / Netbanking):</span>
              <span className="text-[#D9658B] font-extrabold text-sm">{amountDisplay}</span>
            </div>

            <button
              onClick={handleInitiateRazorpayCheckout}
              disabled={paymentState.status === 'creating_order' || paymentState.status === 'verifying'}
              className="w-full py-3.5 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-2xl text-xs font-bold shadow-md shadow-[#D9658B]/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60"
            >
              {paymentState.status === 'creating_order' || paymentState.status === 'verifying' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>{isPremiumMember ? 'Renew / Upgrade with Razorpay' : 'Pay with Razorpay (Test Mode)'}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-3 text-[10px] text-[#7E5265]">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#58B988]" />
                <span>HMAC Signature Verified</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#D9658B]" />
                <span>Razorpay Test Credentials Active</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
