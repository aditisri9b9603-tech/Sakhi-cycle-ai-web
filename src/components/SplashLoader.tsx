import React, { useEffect, useState } from 'react';
import { IMAGES } from '../assets/images';
import { Sparkles, Heart } from 'lucide-react';

interface SplashLoaderProps {
  onComplete: () => void;
  minDuration?: number;
}

export const SplashLoader: React.FC<SplashLoaderProps> = ({ onComplete, minDuration = 2200 }) => {
  const [fadingOut, setFadingOut] = useState(false);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(55), 600);
    const timer2 = setTimeout(() => setProgress(90), 1400);
    const timer3 = setTimeout(() => {
      setProgress(100);
      setFadingOut(true);
    }, minDuration - 400);

    const timerComplete = setTimeout(() => {
      onComplete();
    }, minDuration);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timerComplete);
    };
  }, [minDuration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-700 select-none overflow-hidden ${
        fadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 40%, #FFF0F3 0%, #FCECEF 45%, #F7D1DB 100%)',
      }}
    >
      {/* Soft Cloudy Glow Backdrops */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#FFD1DC]/60 via-[#FCECEF]/80 to-white/70 blur-3xl animate-pulse pointer-events-none -top-20 -left-20" />
      <div className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-br from-[#F4A6B8]/40 via-[#FFF0F3]/70 to-white/90 blur-3xl pointer-events-none -bottom-20 -right-20" />
      <div className="absolute inset-0 bg-white/30 backdrop-blur-xs pointer-events-none" />

      {/* Main Animated Sanctuary Emblem */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm px-6">
        {/* Glowing Logo Frame */}
        <div className="relative">
          {/* Animated Glow Rings */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#D9658B]/30 via-[#F4A6B8]/40 to-transparent blur-xl animate-spin" style={{ animationDuration: '6s' }} />
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#D9658B]/40 to-[#F4A6B8]/50 blur-md" />

          {/* Logo Container */}
          <div className="relative w-24 h-24 rounded-3xl bg-white/90 p-2.5 shadow-2xl border border-white/80 backdrop-blur-md transform transition-transform hover:scale-105">
            <img
              src={IMAGES.sakhiLogo}
              alt="Sakhi Cycle Sanctuary Logo"
              className="w-full h-full object-contain rounded-2xl drop-shadow-sm animate-pulse"
            />
          </div>

          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#D9658B] text-white flex items-center justify-center text-xs shadow-md border-2 border-white">
            <Heart className="w-4 h-4 fill-white" />
          </div>
        </div>

        {/* Wordmark and Spiritual Subtitle */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#F4D5DC] shadow-xs text-[11px] font-bold text-[#D9658B]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to Your Sanctuary</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#3D1E28] tracking-tight">
            Sakhi Cycle
          </h1>
          <p className="text-xs sm:text-sm text-[#7E5265] max-w-xs font-medium leading-relaxed">
            Understand • Track • Thrive
          </p>
        </div>

        {/* Ambient Loading Bar */}
        <div className="w-56 space-y-2 pt-2">
          <div className="h-1.5 w-full bg-white/70 rounded-full overflow-hidden border border-[#F4D5DC] p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#F4A6B8] to-[#D9658B] rounded-full transition-all duration-500 ease-out shadow-xs"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-[10px] uppercase tracking-widest font-semibold text-[#7E5265]/80">
            Attuning Your Rhythms...
          </div>
        </div>
      </div>
    </div>
  );
};
