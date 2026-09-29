import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { calculateCycleStatus } from '../utils/cycleCalculations';
import { firestore } from '../lib/firebaseClient';
import { doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import {
  Sparkles,
  Heart,
  RefreshCw,
  Volume2,
  VolumeX,
  Share2,
  Check,
  Wind,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Smile,
  Flower2,
  Sun,
  Moon,
  Feather,
} from 'lucide-react';

export interface AffirmationItem {
  id: string;
  phase: 'all' | 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  quote: string;
  source: string;
  theme: string;
  reflection: string;
}

const AFFIRMATION_COLLECTION: AffirmationItem[] = [
  // All Phases / Daily Foundation
  {
    id: 'aff-all-1',
    phase: 'all',
    quote: 'My body is not a problem to be solved; it is a sacred home to be cherished and listened to.',
    source: 'Sakhi Body Wisdom',
    theme: 'Body Acceptance',
    reflection: 'Take a soft breath and release any pressure to feel different than you do right now.',
  },
  {
    id: 'aff-all-2',
    phase: 'all',
    quote: 'I honor the cyclical nature of my energy. Like the moon, I am whole in all my phases.',
    source: 'Rhythm & Grace',
    theme: 'Cyclical Wholeness',
    reflection: 'Each phase brings its own gifts—some days are for blooming, some are for resting.',
  },
  {
    id: 'aff-all-3',
    phase: 'all',
    quote: 'My worth is constant, regardless of how much I produce or how restful my day is.',
    source: 'Gentle Living',
    theme: 'Self-Worth',
    reflection: 'Your existence is enough. Give yourself permission to pause without guilt.',
  },
  {
    id: 'aff-all-4',
    phase: 'all',
    quote: 'I choose gentle patience with myself. Healing and balance unfold in their own natural time.',
    source: 'Sakhi Sanctuary',
    theme: 'Patience & Compassion',
    reflection: 'Notice where you are holding tension right now. Soften your shoulders and jaw.',
  },

  // Menstrual Phase (Rest, Release, Intuition)
  {
    id: 'aff-menstrual-1',
    phase: 'menstrual',
    quote: 'Rest is not a reward for doing everything; it is a vital rhythm of renewal that I deeply deserve.',
    source: 'Menstrual Wisdom',
    theme: 'Deep Rest & Release',
    reflection: 'As your body cleanses and resets, wrap yourself in warmth, gentle tea, and quiet ease.',
  },
  {
    id: 'aff-menstrual-2',
    phase: 'menstrual',
    quote: 'I release what no longer serves me with grace, making space for fresh energy to arrive.',
    source: 'Sacred Flow',
    theme: 'Letting Go',
    reflection: 'Inhale peace, exhale old expectations. Trust your body’s miraculous reset button.',
  },
  {
    id: 'aff-menstrual-3',
    phase: 'menstrual',
    quote: 'My sensitivity right now is a superpower of intuition and deep self-awareness.',
    source: 'Inner Compass',
    theme: 'Intuitive Stillness',
    reflection: 'Quiet your surroundings. What gentle whisper is your heart asking for today?',
  },

  // Follicular Phase (Renewal, Curiosity, Rising Energy)
  {
    id: 'aff-follicular-1',
    phase: 'follicular',
    quote: 'New beginnings are stirring within me. I greet this cycle with curiosity, hope, and vibrant strength.',
    source: 'Spring Renewal',
    theme: 'Fresh Vitality',
    reflection: 'Your estrogen is gently climbing. Say yes to a creative spark or a pleasant morning walk.',
  },
  {
    id: 'aff-follicular-2',
    phase: 'follicular',
    quote: 'My mind is clear, my heart is open, and I have all the creative power I need to plant new seeds.',
    source: 'Creative Bloom',
    theme: 'Creative Awakening',
    reflection: 'What intention or joyful project would you love to nurture over the coming weeks?',
  },
  {
    id: 'aff-follicular-3',
    phase: 'follicular',
    quote: 'I trust the upward spiral of my vitality. I am allowed to step forward with joyful confidence.',
    source: 'Sakhi Vitality',
    theme: 'Joyful Momentum',
    reflection: 'Celebrate your body’s lightness today with colorful nourishment and playful movement.',
  },

  // Ovulatory Phase (Radiance, Expression, Magnetic Connection)
  {
    id: 'aff-ovulatory-1',
    phase: 'ovulatory',
    quote: 'I stand in the fullness of my radiance. My voice matters, my presence is a blessing, and I shine with ease.',
    source: 'Summer Radiance',
    theme: 'Magnetic Radiance',
    reflection: 'Your communication and social magnetism are at their peak. Share your truth and love freely.',
  },
  {
    id: 'aff-ovulatory-2',
    phase: 'ovulatory',
    quote: 'I celebrate the abundance of my body and the loving connections that nurture my spirit.',
    source: 'Empowered Soul',
    theme: 'Abundant Vitality',
    reflection: 'Channel your radiant energy into meaningful connection, inspiring conversations, or heartfelt acts.',
  },
  {
    id: 'aff-ovulatory-3',
    phase: 'ovulatory',
    quote: 'I am magnetic, compassionate, and fully present in this luminous chapter of my rhythm.',
    source: 'Ovulatory Bloom',
    theme: 'Confidence & Heart',
    reflection: 'Take pride in how much wisdom and emotional warmth you bring to those around you.',
  },

  // Luteal Phase (Grounding, Boundaries, Intuitive Discernment)
  {
    id: 'aff-luteal-1',
    phase: 'luteal',
    quote: 'My boundaries are an act of deep self-love. I protect my peace without apology or hesitation.',
    source: 'Autumn Grounding',
    theme: 'Sacred Boundaries',
    reflection: 'If something drains your peace, it is okay to decline. Prioritize your sanctuary right now.',
  },
  {
    id: 'aff-luteal-2',
    phase: 'luteal',
    quote: 'I welcome the slow down. In slowing down, I hear my deepest wisdom and nourish my roots.',
    source: 'Inner Wisdom',
    theme: 'Grounding & Nourishment',
    reflection: 'Stock up on nourishing root vegetables, magnesium, warm herbal infusions, and cozy evenings.',
  },
  {
    id: 'aff-luteal-3',
    phase: 'luteal',
    quote: 'Any feelings that arise are messengers asking for care, not flaws requiring judgment.',
    source: 'Gentle Discernment',
    theme: 'Emotional Validation',
    reflection: 'Treat yourself with the kindness you would offer a dearest friend who is feeling vulnerable.',
  },
];

export const DailyWellnessAffirmation: React.FC = () => {
  const { cycleSettings, language } = useApp();
  const { user } = useAuth();
  const currentStatus = calculateCycleStatus(cycleSettings);

  // Normalize phase name
  const currentPhaseName = currentStatus.currentPhase.toLowerCase() as
    | 'menstrual'
    | 'follicular'
    | 'ovulatory'
    | 'luteal';

  // Filter mode: 'attuned' (tuned to current phase) or 'all' (all affirmations)
  const [filterMode, setFilterMode] = useState<'attuned' | 'all'>('attuned');

  // Daily seed for rotation (changes automatically every single day of the year)
  const dailySeed = useMemo(() => {
    const today = new Date();
    return today.getDate() + (today.getMonth() + 1) * 31;
  }, []);

  // Filtered pool
  const pool = useMemo(() => {
    if (filterMode === 'attuned') {
      const attuned = AFFIRMATION_COLLECTION.filter(
        (a) => a.phase === currentPhaseName || a.phase === 'all'
      );
      return attuned.length > 0 ? attuned : AFFIRMATION_COLLECTION;
    }
    return AFFIRMATION_COLLECTION;
  }, [filterMode, currentPhaseName]);

  // Index within the pool
  const [currentIndex, setCurrentIndex] = useState(() => dailySeed % pool.length);

  // Synchronize index if pool changes
  useEffect(() => {
    setCurrentIndex((prev) => (prev >= pool.length ? 0 : prev));
  }, [pool.length]);

  const currentAffirmation = pool[currentIndex % pool.length] || pool[0];

  // Bookmarks / Favorites saved to localStorage and synced to Firestore
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('sakhi_favorite_affirmations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load cloud favorites from Firestore for authenticated users
  useEffect(() => {
    if (!user || user.isAnonymous || !firestore) return;

    let isMounted = true;
    async function loadCloudFavorites() {
      if (!user) return;
      try {
        const currentUserId = user.uid || user.id;
        const colRef = collection(firestore!, 'users', currentUserId, 'affirmations');
        const snap = await getDocs(colRef);
        if (!snap.empty && isMounted) {
          const cloudFavs: string[] = [];
          snap.forEach((d) => cloudFavs.push(d.id));
          setFavorites((prev) => {
            const merged = Array.from(new Set([...prev, ...cloudFavs]));
            try {
              localStorage.setItem('sakhi_favorite_affirmations', JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      } catch (err) {
        console.warn('Failed to load favorites from Firestore:', err);
      }
    }

    loadCloudFavorites();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const isFavorited = favorites.includes(currentAffirmation.id);

  const toggleFavorite = () => {
    const isAdding = !favorites.includes(currentAffirmation.id);
    const updated = isAdding
      ? [...favorites, currentAffirmation.id]
      : favorites.filter((id) => id !== currentAffirmation.id);

    setFavorites(updated);
    try {
      localStorage.setItem('sakhi_favorite_affirmations', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save favorite affirmation:', e);
    }

    // Persist to Cloud Firestore if user is authenticated
    if (user && !user.isAnonymous && firestore) {
      const currentUserId = user.uid || user.id;
      const docRef = doc(firestore, 'users', currentUserId, 'affirmations', currentAffirmation.id);
      if (isAdding) {
        setDoc(docRef, {
          id: currentAffirmation.id,
          quote: currentAffirmation.quote,
          source: currentAffirmation.source,
          theme: currentAffirmation.theme,
          savedAt: new Date().toISOString(),
        }, { merge: true }).catch(() => {});
      } else {
        deleteDoc(docRef).catch(() => {});
      }
    }
  };

  // Next / Rotate Affirmation
  const handleRotateNext = () => {
    setCurrentIndex((prev) => (prev + 1) % pool.length);
    setCopied(false);
  };

  // Copy to clipboard
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    const textToCopy = `🌸 "${currentAffirmation.quote}" — ${currentAffirmation.source} (via Sakhi Cycle)`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Voice Read-Aloud
  const [isSpeaking, setIsSpeaking] = useState(false);
  const handleSpeak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // cancel any active utterance
    const utterance = new SpeechSynthesisUtterance(
      `${currentAffirmation.quote}. Reflection: ${currentAffirmation.reflection}`
    );
    utterance.rate = 0.88; // gentle, comforting pace
    utterance.pitch = 1.05;

    // Try to find a soft English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        (v.name.includes('Samantha') ||
          v.name.includes('Karen') ||
          v.name.includes('Natural') ||
          v.name.includes('Female')) &&
        v.lang.startsWith('en')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Soothing Breath Micro-Pacer (12-second cycle)
  const [showBreather, setShowBreather] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);

  useEffect(() => {
    if (!showBreather) return;

    const interval = setInterval(() => {
      setBreathSeconds((prev) => {
        if (prev > 1) return prev - 1;

        // Transition phases
        setBreathPhase((current) => {
          if (current === 'Inhale') return 'Hold';
          if (current === 'Hold') return 'Exhale';
          return 'Inhale';
        });
        return 4; // Reset to 4 seconds
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showBreather]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF5F7] via-white to-[#FDF0F3] border border-[#F4D5DC] shadow-md shadow-[#D9658B]/5 p-5 sm:p-7 transition-all duration-300">
      {/* Subtle decorative glowing background blur circles */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-[#FCECEF] rounded-full blur-2xl pointer-events-none -z-0 opacity-60" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-[#FFF0F3] rounded-full blur-2xl pointer-events-none -z-0 opacity-60" />

      {/* Top Header Row */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#FCECEF]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-[#D9658B] to-[#F4A6B8] flex items-center justify-center text-white shadow-xs">
            <Flower2 className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#D9658B]">
                Daily Soul Affirmation
              </span>
              <span className="text-[10px] text-[#7E5265] bg-white/80 px-2 py-0.5 rounded-full border border-[#F4D5DC]">
                Rotating Daily
              </span>
            </div>
            <p className="text-[11px] text-[#7E5265]">
              Attuned to your {currentStatus.phaseTitle} · Day {currentStatus.currentDay} of {currentStatus.totalDays}
            </p>
          </div>
        </div>

        {/* Phase Attunement Toggle & Navigation */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => setFilterMode(filterMode === 'attuned' ? 'all' : 'attuned')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all border ${
              filterMode === 'attuned'
                ? 'bg-[#FFF0F3] text-[#D9658B] border-[#F4D5DC]'
                : 'bg-white text-[#7E5265] border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle between affirmations matching your current phase vs all daily affirmations"
          >
            {filterMode === 'attuned' ? '🌸 Current Phase Only' : '✨ All Affirmations'}
          </button>

          <button
            onClick={handleRotateNext}
            className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-[#FFF5F7] text-[#3D1E28] hover:text-[#D9658B] border border-[#F4D5DC] rounded-xl text-[11px] font-bold shadow-2xs transition-all active:scale-95"
            title="Discover next affirmation"
          >
            <RefreshCw className="w-3 h-3 text-[#D9658B]" />
            <span>Next</span>
          </button>
        </div>
      </div>

      {/* Main Quote & Reflection Body */}
      <div className="relative z-10 py-5 space-y-3.5">
        <div className="flex items-start gap-3">
          <span className="text-3xl sm:text-4xl text-[#D9658B]/30 font-serif leading-none select-none">
            “
          </span>
          <div className="space-y-2 flex-1">
            <blockquote className="text-base sm:text-lg font-serif italic text-[#3D1E28] leading-relaxed">
              {currentAffirmation.quote}
            </blockquote>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="font-semibold text-[#D9658B]">
                — {currentAffirmation.source}
              </span>
              <span className="text-[#7E5265]">·</span>
              <span className="px-2 py-0.5 rounded-md bg-[#FFF5F7] text-[#7E5265] text-[11px] border border-[#F4D5DC]/60 font-medium">
                {currentAffirmation.theme}
              </span>
            </div>
          </div>
        </div>

        {/* Gentle Reflection Whisper */}
        <div className="ml-6 sm:ml-9 p-3 rounded-2xl bg-white/70 backdrop-blur-xs border border-[#F4D5DC]/70 text-xs text-[#7E5265] flex items-start gap-2.5">
          <Feather className="w-3.5 h-3.5 text-[#D9658B] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#3D1E28] font-semibold">Gentle Reflection:</strong>{' '}
            {currentAffirmation.reflection}
          </p>
        </div>
      </div>

      {/* Interactive Mindful Action Bar */}
      <div className="relative z-10 pt-3 border-t border-[#FCECEF] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {/* Bookmark / Favorite */}
          <button
            onClick={toggleFavorite}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              isFavorited
                ? 'bg-[#FFF0F3] text-[#D9658B] border-[#F4D5DC] font-bold shadow-2xs'
                : 'bg-white hover:bg-slate-50 text-[#7E5265] border-slate-200'
            }`}
            title="Save to your favorite affirmations"
          >
            {isFavorited ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-[#D9658B]" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
            <span>{isFavorited ? 'Saved to Favorites' : 'Save'}</span>
          </button>

          {/* Voice Audio Listen */}
          <button
            onClick={handleSpeak}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              isSpeaking
                ? 'bg-[#E8F5E9] text-[#226947] border-[#C8E6C9] font-bold'
                : 'bg-white hover:bg-slate-50 text-[#7E5265] border-slate-200'
            }`}
            title="Listen to gentle spoken affirmation"
          >
            {isSpeaking ? (
              <VolumeX className="w-3.5 h-3.5 text-[#226947] animate-pulse" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
            <span>{isSpeaking ? 'Pause Audio' : 'Listen'}</span>
          </button>

          {/* Copy Affirmation */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#7E5265] hover:text-[#3D1E28] border border-slate-200 transition-all active:scale-95"
            title="Copy quote to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#58B988]" />
                <span className="text-[#226947] font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>

        {/* Micro-Mindfulness / Soothing Breath Pacer Toggle */}
        <button
          onClick={() => setShowBreather(!showBreather)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
            showBreather
              ? 'bg-[#D9658B] text-white shadow-xs'
              : 'bg-white hover:bg-[#FFF5F7] text-[#D9658B] border border-[#F4D5DC]'
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>{showBreather ? 'Close Breather' : '1-Min Calming Breath'}</span>
        </button>
      </div>

      {/* Embedded Soothing Breath Interactive Pacer */}
      {showBreather && (
        <div className="relative z-10 mt-4 p-4 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-1000 ${
                breathPhase === 'Inhale'
                  ? 'scale-115 bg-[#FFF0F3] border-[#D9658B] text-[#D9658B]'
                  : breathPhase === 'Hold'
                  ? 'scale-105 bg-[#FFF9E6] border-[#D97706] text-[#D97706]'
                  : 'scale-95 bg-[#F3FAF5] border-[#58B988] text-[#226947]'
              }`}
            >
              {breathSeconds}s
            </div>
            <div>
              <div className="text-xs font-bold text-[#3D1E28] flex items-center gap-1.5">
                <span>Phase:</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                    breathPhase === 'Inhale'
                      ? 'bg-[#FFF0F3] text-[#D9658B]'
                      : breathPhase === 'Hold'
                      ? 'bg-[#FFF9E6] text-[#D97706]'
                      : 'bg-[#F3FAF5] text-[#226947]'
                  }`}
                >
                  {breathPhase}
                </span>
              </div>
              <p className="text-[11px] text-[#7E5265] mt-0.5">
                {breathPhase === 'Inhale' && 'Breathe in gentle light through your nose...'}
                {breathPhase === 'Hold' && 'Hold gently and feel stillness in your belly...'}
                {breathPhase === 'Exhale' && 'Slowly release all tension through your lips...'}
              </p>
            </div>
          </div>

          <div className="text-[11px] text-[#7E5265] text-right">
            <span>Somatic cycle calmness · 4-4-4 rhythm</span>
          </div>
        </div>
      )}
    </div>
  );
};
