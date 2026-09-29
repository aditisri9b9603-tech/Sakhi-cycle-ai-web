import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
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
  RefreshCw,
  Database,
  Crown,
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
    signInWithGoogleAccount,
    signInWithEmail,
    registerWithEmail,
    signInAsGuest,
    logout,
    authNotice,
    authError,
    clearAuthError,
    clearAuthNotice,
  } = useAuth();

  const { setActiveSection, isPremiumMember, membershipPlan } = useApp();

  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localFeedback, setLocalFeedback] = useState<string | null>(null);

  const [customGoogleEmail, setCustomGoogleEmail] = useState('aditisri991177@gmail.com');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

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
    const ok = await signInWithGoogle(customGoogleEmail || 'aditisri991177@gmail.com');
    if (ok) {
      handlePostAuthSuccess();
    }
  };

  const handleDirectGoogleSignIn = async (emailToUse: string = 'aditisri991177@gmail.com') => {
    clearAuthError();
    clearAuthNotice();
    setLocalFeedback(null);
    const ok = await signInWithGoogleAccount(emailToUse, emailToUse.includes('aditi') ? 'Aditi' : undefined);
    if (ok) {
      handlePostAuthSuccess();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    clearAuthNotice();
    setLocalFeedback(null);

    if (authMode === 'signin') {
      const ok = await signInWithEmail(email, password);
      if (ok) {
        handlePostAuthSuccess();
      }
    } else {
      if (!displayName.trim()) {
        setLocalFeedback('Please enter your name.');
        return;
      }
      const ok = await registerWithEmail(email, password, displayName);
      if (ok) {
        handlePostAuthSuccess();
      }
    }
  };

  const handleGuestMode = async () => {
    clearAuthError();
    clearAuthNotice();
    setLocalFeedback(null);
    const ok = await signInAsGuest();
    if (ok) {
      handlePostAuthSuccess();
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
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#58B988] border-2 border-white" />
        </div>

        <div>
          <h2 className="text-xl font-serif font-bold text-[#3D1E28]">
            {user?.displayName || 'Sakhi Cycle Member'}
          </h2>
          <p className="text-xs text-[#7E5265] mt-0.5">{user?.email}</p>
        </div>
      </div>

      {/* Account Highlights */}
      <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] space-y-2.5 text-left text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#7E5265]">Authentication:</span>
          <span className="font-bold text-[#226947] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#58B988]" />
            <span>Google & Firebase Auth</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#7E5265]">Cloud Data Sync:</span>
          <span className="font-bold text-[#226947] flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-[#58B988]" />
            <span>Past Records Preserved</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#7E5265]">Membership Tier:</span>
          <span className="font-bold text-[#D9658B] flex items-center gap-1">
            <Crown className="w-3.5 h-3.5" />
            <span>{isPremiumMember ? `Premium (${membershipPlan})` : 'Free Sanctuary Member'}</span>
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
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-[#3D1E28] border border-[#F4D5DC] rounded-2xl text-xs font-semibold shadow-2xs transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#D9658B]" />
          <span>Switch Account / Sign in with Another Google Email</span>
        </button>

        <button
          type="button"
          onClick={logout}
          className="w-full py-2 px-4 text-[#7E5265] hover:text-[#D9658B] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  // If user is NOT authenticated (or is guest), show the full Sign-In / Register form
  const content = (
    <div className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-3xl border border-[#F4D5DC] shadow-xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
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
          {authMode === 'signin' ? 'Welcome Back to Sakhi' : 'Create Your Sanctuary'}
        </h2>
        <p className="text-xs text-[#7E5265] max-w-xs mx-auto">
          {authMode === 'signin'
            ? 'Sign in with your Google email ID to access synced cycle history, past health logs, and doctor care.'
            : 'Join Sakhi Cycle for private, cloud-synced menstrual wellness and personalized insights.'}
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
        <div className="p-3 bg-[#FFF3F5] border border-[#F4D5DC] text-[#C54E74] rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-[#D9658B] shrink-0" />
          <span>{localFeedback}</span>
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

      {/* 1. Primary Google Sign-In Actions */}
      <div className="space-y-3">
        {/* Quick One-Click Sign In for Aditi */}
        <button
          type="button"
          onClick={() => handleDirectGoogleSignIn('aditisri991177@gmail.com')}
          disabled={isSigningIn}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#FFF0F3] to-[#FCECEF] border border-[#F4D5DC] hover:border-[#D9658B] text-left transition-all hover:shadow-xs group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#D9658B] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              A
            </div>
            <div>
              <div className="text-xs font-bold text-[#3D1E28] group-hover:text-[#D9658B] transition-colors flex items-center gap-1.5">
                <span>Sign in as Aditi</span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#EBF7EE] text-[#226947] font-semibold border border-[#BFE7D0]">
                  One-Click
                </span>
              </div>
              <div className="text-[11px] text-[#7E5265]">aditisri991177@gmail.com</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#D9658B] group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 text-[#3D1E28] border border-[#F4D5DC] hover:border-[#D9658B] rounded-2xl text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-70 group"
        >
          {isSigningIn ? (
            <Loader2 className="w-4 h-4 text-[#D9658B] animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <span>Sign in with Google Popup</span>
        </button>

        {/* Custom Google Email input toggle (ideal for Vercel if popup domain is unlisted) */}
        {!showCustomGoogleInput ? (
          <div className="text-center pt-0.5">
            <button
              type="button"
              onClick={() => setShowCustomGoogleInput(true)}
              className="text-[11px] text-[#7E5265] hover:text-[#D9658B] hover:underline"
            >
              Sign in with another Google Email directly →
            </button>
          </div>
        ) : (
          <div className="p-3 bg-[#FFF8F8] border border-[#F4D5DC] rounded-2xl space-y-2 animate-fadeIn text-left">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#3D1E28]">
              <span>Direct Google Account ID</span>
              <button
                type="button"
                onClick={() => setShowCustomGoogleInput(false)}
                className="text-[#7E5265] hover:text-[#3D1E28]"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={customGoogleEmail}
                onChange={(e) => setCustomGoogleEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-white focus:outline-none focus:ring-1 focus:ring-[#D9658B]"
              />
              <button
                type="button"
                onClick={() => handleDirectGoogleSignIn(customGoogleEmail)}
                disabled={isSigningIn || !customGoogleEmail}
                className="px-3 py-2 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-60"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-[#FCECEF] w-full" />
          <span className="bg-white px-3 text-[11px] font-medium text-[#7E5265] uppercase tracking-wider whitespace-nowrap">
            or standard email & password
          </span>
          <div className="border-t border-[#FCECEF] w-full" />
        </div>

        {/* 2. Email / Password Form */}
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
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Aditi Sharma"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:outline-none focus:ring-2 focus:ring-[#D9658B] transition-all"
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:outline-none focus:ring-2 focus:ring-[#D9658B] transition-all"
              />
              <Mail className="w-3.5 h-3.5 text-[#7E5265] absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-[#3D1E28]">
                Password
              </label>
              {authMode === 'signin' && (
                <span className="text-[10px] text-[#7E5265]">
                  6+ characters
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:outline-none focus:ring-2 focus:ring-[#D9658B] transition-all"
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

          <button
            type="submit"
            disabled={isSigningIn}
            className="w-full py-2.5 px-4 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#D9658B]/20 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{authMode === 'signin' ? 'Sign In with Email' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Toggle between Sign In and Register */}
        <div className="pt-2 text-center">
          {authMode === 'signin' ? (
            <p className="text-xs text-[#7E5265]">
              Don’t have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  clearAuthError();
                  clearAuthNotice();
                  setLocalFeedback(null);
                }}
                className="text-[#D9658B] hover:underline font-bold"
              >
                Create Account
              </button>
            </p>
          ) : (
            <p className="text-xs text-[#7E5265]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  clearAuthError();
                  clearAuthNotice();
                  setLocalFeedback(null);
                }}
                className="text-[#D9658B] hover:underline font-bold"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

        {/* 3. Instant Guest Mode fallback */}
        <div className="pt-3 border-t border-[#FCECEF] flex items-center justify-between">
          <button
            type="button"
            onClick={handleGuestMode}
            disabled={isSigningIn}
            className="text-[11px] text-[#7E5265] hover:text-[#D9658B] flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-[#D9658B]" />
            <span>Try without account (Instant Guest)</span>
          </button>

          <span className="text-[10px] text-[#7E5265] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#58B988]" />
            <span>Private & Encrypted</span>
          </span>
        </div>
      </div>
    </div>
  );

  const viewToRender = user && !user.isAnonymous ? renderAuthenticatedView() : content;

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
        <div className="w-full max-w-md">{viewToRender}</div>
      </div>
    );
  }

  return viewToRender;
};
