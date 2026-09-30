import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getSignInError } from '../lib/auth';
import {
  Lock,
  Mail,
  User as UserIcon,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
  LogOut,
  Database,
  Crown,
  Send,
  Phone,
  KeyRound,
} from 'lucide-react';
import { IMAGES } from '../assets/images';

export interface LoginProps {
  /** Optional callback fired upon successful authentication */
  onSuccess?: () => void;
  /** Section to navigate to upon successful login (defaults to 'home' dashboard) */
  redirectTo?: string;
  /** Display format: standalone full card, modal dialog, or embedded banner */
  variant?: 'card' | 'modal' | 'inline';
  /** Optional close callback if displayed in modal mode */
  onClose?: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onSuccess,
  redirectTo = 'home',
  variant = 'card',
  onClose,
}) => {
  const {
    user,
    isSigningIn,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    sendPasswordReset,
    resendVerificationEmail,
    signInWithPhone,
    verifyPhoneOtp,
    phoneConfirmationPending,
    signInAsGuest,
    logout,
    authNotice,
    authError,
    clearAuthError,
    clearAuthNotice,
  } = useAuth();

  const { setActiveSection, isPremiumMember, membershipPlan } = useApp();

  const [authMode, setAuthMode] = useState<'signin' | 'register' | 'forgot' | 'phone'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localFeedback, setLocalFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [phoneSubmitting, setPhoneSubmitting] = useState(false);

  const handlePostAuthSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    setActiveSection(redirectTo);
  };

  const handleGoogleSignIn = async () => {
    clearAuthError();
    clearAuthNotice();
    setLocalFeedback(null);
    try {
      const ok = await signInWithGoogle();
      if (ok) {
        handlePostAuthSuccess();
      }
    } catch (err) {
      setLocalFeedback({ type: 'error', message: getSignInError(err) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    clearAuthNotice();
    setLocalFeedback(null);

    const trimmedEmail = email.trim().toLowerCase();

    // Client-side validation
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setLocalFeedback({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    // FORGOT PASSWORD MODE
    if (authMode === 'forgot') {
      try {
        const res = await sendPasswordReset(trimmedEmail);
        if (res.success) {
          setLocalFeedback({ type: 'success', message: res.message });
        } else {
          setLocalFeedback({ type: 'error', message: res.message });
        }
      } catch (err) {
        setLocalFeedback({ type: 'error', message: getSignInError(err) });
      }
      return;
    }

    // SIGN IN MODE
    if (authMode === 'signin') {
      if (!password) {
        setLocalFeedback({ type: 'error', message: 'Please enter your password.' });
        return;
      }
      try {
        const ok = await signInWithEmail(trimmedEmail, password);
        if (ok) {
          handlePostAuthSuccess();
        }
      } catch (err) {
        setLocalFeedback({ type: 'error', message: getSignInError(err) });
      }
      return;
    }

    // CREATE ACCOUNT MODE
    if (authMode === 'register') {
      if (!displayName.trim()) {
        setLocalFeedback({ type: 'error', message: 'Please enter your name.' });
        return;
      }
      if (!password || password.length < 6) {
        setLocalFeedback({ type: 'error', message: 'Password must be at least 6 characters long.' });
        return;
      }
      if (password !== confirmPassword) {
        setLocalFeedback({ type: 'error', message: 'Passwords do not match. Please re-enter.' });
        return;
      }

      try {
        const ok = await registerWithEmail(trimmedEmail, password, displayName.trim());
        if (ok) {
          handlePostAuthSuccess();
        }
      } catch (err) {
        setLocalFeedback({ type: 'error', message: getSignInError(err) });
      }
    }
  };

  const handleSendPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    clearAuthNotice();
    setLocalFeedback(null);

    const formatted = phoneNumber.trim();
    if (!formatted || formatted.length < 8) {
      setLocalFeedback({
        type: 'error',
        message: 'Please enter a valid phone number with country code (e.g., +91 9876543210).',
      });
      return;
    }

    setPhoneSubmitting(true);
    try {
      const ok = await signInWithPhone(formatted);
      if (ok) {
        setLocalFeedback({
          type: 'success',
          message: '6-digit SMS verification code sent. Please enter it below.',
        });
      }
    } catch (err) {
      setLocalFeedback({ type: 'error', message: getSignInError(err) });
    } finally {
      setPhoneSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    clearAuthNotice();
    setLocalFeedback(null);

    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setLocalFeedback({ type: 'error', message: 'Please enter the 6-digit verification code.' });
      return;
    }

    setPhoneSubmitting(true);
    try {
      const ok = await verifyPhoneOtp(otpCode.trim());
      if (ok) {
        handlePostAuthSuccess();
      }
    } catch (err) {
      setLocalFeedback({ type: 'error', message: getSignInError(err) });
    } finally {
      setPhoneSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingEmail(true);
    setLocalFeedback(null);
    try {
      const res = await resendVerificationEmail();
      if (res.success) {
        setLocalFeedback({ type: 'success', message: res.message });
      } else {
        setLocalFeedback({ type: 'error', message: res.message });
      }
    } catch (err) {
      setLocalFeedback({ type: 'error', message: getSignInError(err) });
    } finally {
      setResendingEmail(false);
    }
  };

  const handleGuestMode = async () => {
    clearAuthError();
    clearAuthNotice();
    setLocalFeedback(null);
    try {
      const ok = await signInAsGuest();
      if (ok) {
        handlePostAuthSuccess();
      }
    } catch (err) {
      setLocalFeedback({ type: 'error', message: getSignInError(err) });
    }
  };

  // If user is ALREADY authenticated with a real account, display their Account Dashboard card
  const renderAuthenticatedView = () => (
    <div className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-3xl border border-[#F4D5DC] shadow-xl p-6 sm:p-8 space-y-6 relative overflow-hidden text-center">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#7E5265] hover:text-[#3D1E28] hover:bg-[#FFF0F3] transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Ambient subtle glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FCECEF] rounded-full blur-2xl pointer-events-none -z-10 opacity-70" />

      {/* Avatar & Header */}
      <div className="space-y-3">
        <div className="relative inline-block mx-auto">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-16 h-16 rounded-full border-2 border-[#D9658B] shadow-md object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#D9658B] to-[#F4A6B8] text-white flex items-center justify-center text-xl font-bold shadow-md">
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'S'}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#58B988] border-2 border-white" />
        </div>

        <div>
          <h2 className="text-xl font-serif font-bold text-[#3D1E28]">
            {user?.displayName || 'Sakhi Cycle Member'}
          </h2>
          <p className="text-xs text-[#7E5265] mt-0.5 font-mono">{user?.email || user?.phoneNumber || 'Member'}</p>
        </div>
      </div>

      {/* Unverified Email Alert Banner if email is not verified */}
      {user?.email && user.emailVerified === false && (
        <div className="p-3.5 rounded-2xl bg-[#FFF8F0] border border-[#FEE2C7] text-left text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-[#B45309] font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Email Not Verified</span>
          </div>
          <p className="text-[11px] text-[#7E5265] leading-relaxed">
            Please check your email inbox for the verification link to secure your account.
          </p>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resendingEmail}
            className="px-3 py-1.5 bg-white border border-[#FEE2C7] text-[#B45309] hover:bg-[#FEF3C7] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {resendingEmail ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Resend Verification Email</span>
          </button>
        </div>
      )}

      {/* Local Feedback */}
      {localFeedback && (
        <div
          className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
            localFeedback.type === 'success'
              ? 'bg-[#F3FAF5] border border-[#BFE7D0] text-[#226947]'
              : 'bg-[#FFF0F3] border border-[#F4D5DC] text-[#C54E74]'
          }`}
        >
          {localFeedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-[#58B988] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#D9658B] shrink-0" />
          )}
          <span>{localFeedback.message}</span>
        </div>
      )}

      {/* Account Highlights */}
      <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] space-y-2.5 text-left text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#7E5265]">Authentication:</span>
          <span className="font-bold text-[#226947] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#58B988]" />
            <span>Authenticated ({user?.provider || 'Firebase'})</span>
          </span>
        </div>

        {user?.email && (
          <div className="flex items-center justify-between">
            <span className="text-[#7E5265]">Email Status:</span>
            <span className={`font-bold flex items-center gap-1 ${user?.emailVerified ? 'text-[#226947]' : 'text-[#B45309]'}`}>
              {user?.emailVerified ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-[#58B988]" />
                  <span>Verified</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>Unverified</span>
                </>
              )}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[#7E5265]">Cloud Data Sync:</span>
          <span className="font-bold text-[#226947] flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-[#58B988]" />
            <span>Synced to User Profile</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#7E5265]">Membership Tier:</span>
          <span className="font-bold text-[#D9658B] flex items-center gap-1">
            <Crown className="w-3.5 h-3.5" />
            <span>{isPremiumMember ? `Premium (${membershipPlan || 'Active'})` : 'Free Sanctuary Member'}</span>
          </span>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="space-y-2.5 pt-2">
        <button
          type="button"
          onClick={handlePostAuthSuccess}
          className="w-full py-3 px-4 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-[#D9658B]/20 transition-all flex items-center justify-center gap-2"
        >
          <span>Continue to Sanctuary Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={logout}
          disabled={isSigningIn}
          className="w-full py-2.5 px-4 bg-white hover:bg-[#FFF0F3] text-[#7E5265] hover:text-[#D9658B] border border-[#F4D5DC] rounded-2xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
        >
          {isSigningIn ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  // Sign-In / Register / Forgot Password / Phone form
  const content = (
    <div className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-3xl border border-[#F4D5DC] shadow-xl p-6 sm:p-8 space-y-5 relative overflow-hidden">
      {/* Decorative ambient subtle glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FCECEF] rounded-full blur-2xl pointer-events-none -z-10 opacity-70" />

      {/* Header with Sakhi branding */}
      <div className="text-center space-y-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#7E5265] hover:text-[#3D1E28] hover:bg-[#FFF0F3] transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D9658B] to-[#F4A6B8] shadow-md shadow-[#D9658B]/20 mb-1">
          <img
            src={IMAGES.sakhiLogo}
            alt="Sakhi Cycle"
            className="w-8 h-8 rounded-xl object-contain"
          />
        </div>

        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3D1E28]">
          {authMode === 'signin' && 'Sign In to Sakhi'}
          {authMode === 'register' && 'Create Your Account'}
          {authMode === 'forgot' && 'Reset Your Password'}
          {authMode === 'phone' && 'Sign In with Phone'}
        </h2>
        <p className="text-xs text-[#7E5265] max-w-xs mx-auto">
          {authMode === 'signin' &&
            'Sign in with your email and password to access your private cycle logs and doctor reports.'}
          {authMode === 'register' &&
            'Join Sakhi Cycle for private, encrypted menstrual wellness and personalized insights.'}
          {authMode === 'forgot' &&
            "Enter your account email and we'll send you a secure link to reset your password."}
          {authMode === 'phone' &&
            'Authenticate securely with your mobile number via Firebase SMS verification.'}
        </p>
      </div>

      {/* Global Alerts / Notices */}
      {authNotice && (
        <div className="p-3 bg-[#F3FAF5] border border-[#BFE7D0] text-[#226947] rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-[#58B988] shrink-0" />
          <span>{authNotice}</span>
        </div>
      )}

      {localFeedback && (
        <div
          className={`p-3 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn ${
            localFeedback.type === 'success'
              ? 'bg-[#F3FAF5] border border-[#BFE7D0] text-[#226947]'
              : 'bg-[#FFF0F3] border border-[#F4D5DC] text-[#C54E74]'
          }`}
        >
          {localFeedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-[#58B988] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#D9658B] shrink-0" />
          )}
          <span>{localFeedback.message}</span>
        </div>
      )}

      {authError && (
        <div className="p-3.5 bg-[#FFF0F3] border border-[#F4D5DC] text-[#3D1E28] rounded-2xl text-xs space-y-1.5 animate-fadeIn">
          <div className="flex items-center gap-2 font-bold text-[#C54E74]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError.title}</span>
          </div>
          <p className="text-[11px] text-[#7E5265] leading-relaxed">{authError.message}</p>
          {authError.actionableGuide && (
            <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-[#7E5265] pt-1">
              {authError.actionableGuide.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-3 bg-[#FFF0F3] p-1 rounded-2xl border border-[#F4D5DC]">
        <button
          type="button"
          onClick={() => {
            setAuthMode('signin');
            clearAuthError();
            clearAuthNotice();
            setLocalFeedback(null);
          }}
          className={`py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
            authMode === 'signin' ? 'bg-white text-[#D9658B] shadow-xs' : 'text-[#7E5265]'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode('register');
            clearAuthError();
            clearAuthNotice();
            setLocalFeedback(null);
          }}
          className={`py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
            authMode === 'register' ? 'bg-white text-[#D9658B] shadow-xs' : 'text-[#7E5265]'
          }`}
        >
          Register
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode('phone');
            clearAuthError();
            clearAuthNotice();
            setLocalFeedback(null);
          }}
          className={`py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
            authMode === 'phone' ? 'bg-white text-[#D9658B] shadow-xs' : 'text-[#7E5265]'
          }`}
        >
          Phone
        </button>
      </div>

      {/* PHONE AUTHENTICATION FORM */}
      {authMode === 'phone' ? (
        <div className="space-y-3.5 text-left">
          {!phoneConfirmationPending ? (
            <form onSubmit={handleSendPhoneCode} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#3D1E28] mb-1">
                  Mobile Number (with country code)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    disabled={isSigningIn || phoneSubmitting}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:outline-none focus:ring-2 focus:ring-[#D9658B] transition-all disabled:opacity-60"
                  />
                  <Phone className="w-3.5 h-3.5 text-[#7E5265] absolute left-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[10px] text-[#7E5265] mt-1">
                  Include international prefix (e.g., +91 for India, +1 for USA)
                </p>
              </div>

              <button
                type="submit"
                disabled={isSigningIn || phoneSubmitting}
                className="w-full py-3 px-4 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#D9658B]/20 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {phoneSubmitting || isSigningIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#3D1E28] mb-1">
                  Enter 6-Digit SMS Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    disabled={isSigningIn || phoneSubmitting}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-mono tracking-widest text-center rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:outline-none focus:ring-2 focus:ring-[#D9658B] transition-all disabled:opacity-60 text-lg"
                  />
                  <KeyRound className="w-3.5 h-3.5 text-[#7E5265] absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSigningIn || phoneSubmitting}
                className="w-full py-3 px-4 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#D9658B]/20 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {phoneSubmitting || isSigningIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtpCode('');
                  clearAuthError();
                  clearAuthNotice();
                }}
                className="w-full text-center text-xs text-[#7E5265] hover:text-[#D9658B] font-semibold pt-1"
              >
                Change Phone Number
              </button>
            </form>
          )}
        </div>
      ) : (
        /* EMAIL / PASSWORD FORM */
        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          {authMode === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold text-[#3D1E28] mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={isSigningIn}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Aditi Sharma"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:outline-none focus:ring-2 focus:ring-[#D9658B] transition-all disabled:opacity-60"
                />
                <UserIcon className="w-3.5 h-3.5 text-[#7E5265] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-[#3D1E28] mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                disabled={isSigningIn}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:outline-none focus:ring-2 focus:ring-[#D9658B] transition-all disabled:opacity-60"
              />
              <Mail className="w-3.5 h-3.5 text-[#7E5265] absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {authMode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-[#3D1E28]">
                  Password
                </label>
                {authMode === 'signin' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      clearAuthError();
                      clearAuthNotice();
                      setLocalFeedback(null);
                    }}
                    className="text-[10px] text-[#D9658B] hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                ) : (
                  <span className="text-[10px] text-[#7E5265]">6+ characters</span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  disabled={isSigningIn}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:outline-none focus:ring-2 focus:ring-[#D9658B] transition-all disabled:opacity-60"
                />
                <Lock className="w-3.5 h-3.5 text-[#7E5265] absolute left-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#7E5265] hover:text-[#3D1E28] transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {authMode === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold text-[#3D1E28] mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  disabled={isSigningIn}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:outline-none focus:ring-2 focus:ring-[#D9658B] transition-all disabled:opacity-60"
                />
                <Lock className="w-3.5 h-3.5 text-[#7E5265] absolute left-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-[#7E5265] hover:text-[#3D1E28] transition-colors"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSigningIn}
            className="w-full py-3 px-4 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#D9658B]/20 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>
                  {authMode === 'signin' && 'Sign In with Email'}
                  {authMode === 'register' && 'Create Free Account'}
                  {authMode === 'forgot' && 'Send Password Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {authMode === 'forgot' && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  clearAuthError();
                  clearAuthNotice();
                  setLocalFeedback(null);
                }}
                className="text-xs text-[#7E5265] hover:text-[#D9658B] font-semibold"
              >
                ← Back to Sign In
              </button>
            </div>
          )}
        </form>
      )}

      {/* Alternative Social Sign In */}
      <div className="space-y-3 pt-1">
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#FCECEF] w-full" />
          <span className="bg-white px-3 text-[10px] font-semibold text-[#7E5265] uppercase tracking-wider whitespace-nowrap">
            or continue with
          </span>
          <div className="border-t border-[#FCECEF] w-full" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white hover:bg-slate-50 text-[#3D1E28] border border-[#F4D5DC] rounded-xl text-xs font-semibold shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {isSigningIn ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#D9658B]" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>
      </div>

      {/* Guest Mode fallback */}
      <div className="pt-3 border-t border-[#FCECEF] flex items-center justify-between">
        <button
          type="button"
          onClick={handleGuestMode}
          disabled={isSigningIn}
          className="text-[11px] text-[#7E5265] hover:text-[#D9658B] flex items-center gap-1 transition-colors disabled:opacity-60"
        >
          <Sparkles className="w-3 h-3 text-[#D9658B]" />
          <span>Continue as Guest</span>
        </button>

        <span className="text-[10px] text-[#7E5265] flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#58B988]" />
          <span>Private & Encrypted</span>
        </span>
      </div>
    </div>
  );

  const viewToRender = user && !user.isAnonymous ? renderAuthenticatedView() : content;

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
        <div className="w-full max-w-md">{viewToRender}</div>
      </div>
    );
  }

  return viewToRender;
};
