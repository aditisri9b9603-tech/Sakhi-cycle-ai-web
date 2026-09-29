import React, { useState, useEffect } from 'react';
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
    signInAsGuest,
    authNotice,
    authError,
    clearAuthError,
    clearAuthNotice,
  } = useAuth();

  const { setActiveSection } = useApp();

  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localFeedback, setLocalFeedback] = useState<string | null>(null);

  // If user is already authenticated or signs in successfully, redirect to the dashboard
  useEffect(() => {
    if (user && !user.isAnonymous) {
      if (onSuccess) {
        onSuccess();
      }
      setActiveSection(redirectTo);
    }
  }, [user, onSuccess, redirectTo, setActiveSection]);

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
    const ok = await signInWithGoogle();
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
            ? 'Sign in to access your synced cycle predictions, daily health logs, and doctor care.'
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

      {/* 1. Primary Google Sign-In Action */}
      <div className="space-y-3">
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
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-[#FCECEF] w-full" />
          <span className="bg-white px-3 text-[11px] font-medium text-[#7E5265] uppercase tracking-wider whitespace-nowrap">
            or with email
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
                <span>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
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

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
        <div className="w-full max-w-md">{content}</div>
      </div>
    );
  }

  return content;
};
