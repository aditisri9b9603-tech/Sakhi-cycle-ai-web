import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { IMAGES } from '../assets/images';
import {
  Music,
  Smile,
  Wind,
  Sparkles,
  ExternalLink,
  Play,
  Pause,
  RotateCw,
  Heart,
  Volume2,
} from 'lucide-react';

const PLAYLISTS_DATA = [
  {
    id: 'bollywood-soothing',
    title: 'Bollywood Acoustic & Sufi Calm',
    description: 'Gentle acoustic Hindi melodies, Arijit Singh quiet renditions, Prateek Kuhad, and soothing evening warmth.',
    spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUfTFmNBRM?utm_source=generator',
    spotifyDirectUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUfTFmNBRM',
    tag: 'Bollywood Calm',
  },
  {
    id: 'lofi-chai',
    title: 'Monsoon Balcony & Lofi Chai Beats',
    description: 'Slow rain drops, soft sitar fusion, warm instrumental beats for quiet journaling and deep relaxation.',
    spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX9RwfGbeGQwP?utm_source=generator',
    spotifyDirectUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX9RwfGbeGQwP',
    tag: 'Lofi Chilling',
  },
  {
    id: 'sacred-ambient',
    title: '528Hz Pelvic Healing & Nature Ambient',
    description: 'Deep meditative soundscapes tuned for cellular ease, lower abdomen warmth, and peaceful sleep.',
    spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZqd5JICZI0u?utm_source=generator',
    spotifyDirectUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u',
    tag: 'Somatic Healing',
  },
];

const AFFIRMATIONS_DECK = [
  {
    quote: 'My body is wise, rhythmic, and deserving of unconditional gentleness today.',
    phase: 'All Phases',
    author: 'Sakhi Wisdom',
  },
  {
    quote: 'I release all pressure to produce. Resting is a vital part of my natural cycle.',
    phase: 'Menstrual Phase',
    author: 'Sacred Rest',
  },
  {
    quote: 'My energy expands like spring blossoms. I trust the timing of my ideas.',
    phase: 'Follicular Phase',
    author: 'Renewal',
  },
  {
    quote: 'I radiate warmth, clarity, and strength. I honor the power within my voice.',
    phase: 'Ovulatory Phase',
    author: 'Radiance',
  },
  {
    quote: 'It is safe for me to set loving boundaries and slow down to care for my spirit.',
    phase: 'Luteal Phase',
    author: 'Nurture',
  },
  {
    quote: 'I am not broken when I need to rest. Even the moon changes shape each night.',
    phase: 'All Phases',
    author: 'Cycle Harmony',
  },
];

const MOOD_MATCH_RECIPES: Record<
  string,
  { label: string; tea: string; stretch: string; song: string; affirmation: string }
> = {
  crampy: {
    label: 'Crampy & Tender Belly',
    tea: 'Fresh ginger root sliced with a stick of cinnamon & warm raw honey.',
    stretch: 'Reclined Butterfly (Supta Baddha Konasana) with a pillow under the knees.',
    song: 'Kabira (Encore) / Acoustic Hindi Melodies',
    affirmation: 'My body is doing profound cleansing work. I send warmth and comfort to my womb.',
  },
  overwhelmed: {
    label: 'Overwhelmed & Anxious',
    tea: 'Organic Chamomile and Tulsi (Holy Basil) steeped in fresh boiling water.',
    stretch: 'Child’s Pose (Balasana) with forehead resting softly on a folded blanket.',
    song: 'Rainy Monsoon Chai Lofi',
    affirmation: 'In this present breath, I am safe. I do not have to carry everything at once.',
  },
  lowEnergy: {
    label: 'Low Energy & Sluggish',
    tea: 'Warm water with roasted cumin (jeera), fennel seeds (saunf), and jaggery.',
    stretch: 'Legs-Up-The-Wall (Viparita Karani) for 10 restorative minutes.',
    song: 'Prateek Kuhad Chill Acoustic',
    affirmation: 'Low energy is not laziness—it is my body requesting sanctuary. I honor it.',
  },
  creative: {
    label: 'Radiant & Creative Sparks',
    tea: 'Hibiscus rose petals infused cold with mint and a squeeze of lime.',
    stretch: 'Flowing Sun Salutations (Surya Namaskar) or ecstatic joyful dancing.',
    song: 'Dil Diyan Gallan / Upbeat Bollywood Strings',
    affirmation: 'My vitality is soaring. I channel this energy into what brings my soul joy.',
  },
  nesting: {
    label: 'Nesting & Craving Quiet',
    tea: 'Warm Golden Turmeric Milk (Haldi Doodh) with a pinch of nutmeg and black pepper.',
    stretch: 'Seated gentle spinal twists with deep belly breaths.',
    song: '528Hz Solfeggio Harmonic Drone',
    affirmation: 'I create peace in my surrounding environment. I am grounded and protected.',
  },
};

export const VibesSection: React.FC = () => {
  const { activeSubSection, setActiveSubSection } = useApp();

  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [selectedMoodKey, setSelectedMoodKey] = useState<string>('crampy');

  // Breathing Guide State (4-7-8 protocol)
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathCounter, setBreathCounter] = useState(4);

  // 4-7-8 Breath cycle timer
  useEffect(() => {
    if (!isBreathingActive) return;

    const interval = setInterval(() => {
      setBreathCounter((prev) => {
        if (prev > 1) return prev - 1;

        if (breathPhase === 'Inhale') {
          setBreathPhase('Hold');
          return 7;
        } else if (breathPhase === 'Hold') {
          setBreathPhase('Exhale');
          return 8;
        } else {
          setBreathPhase('Inhale');
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingActive, breathPhase]);

  const drawNextAffirmation = () => {
    setAffirmationIndex((prev) => (prev + 1) % AFFIRMATIONS_DECK.length);
  };

  const currentAffirmation = AFFIRMATIONS_DECK[affirmationIndex];
  const activeMoodRecipe = MOOD_MATCH_RECIPES[selectedMoodKey];

  return (
    <div className="space-y-6">
      {/* Visual Header */}
      <div className="relative rounded-3xl overflow-hidden border border-[#F4D5DC] shadow-sm bg-white">
        <div className="relative h-48 sm:h-56 w-full overflow-hidden">
          <img
            src={IMAGES.vibesBreathe}
            alt="Zen meditation stones and calming ripples"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3D1E28]/85 via-[#3D1E28]/45 to-transparent flex flex-col justify-end p-6 sm:p-8">
            <span className="text-xs uppercase tracking-widest text-[#FCECEF] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#F4A6B8]" />
              <span>Vibes & Emotional Sanctuary</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              Music, Breath & Heartfelt Comfort
            </h2>
            <p className="text-xs sm:text-sm text-[#FCECEF]/90 mt-1 max-w-xl">
              Nourish your emotional wellbeing with curated Bollywood playlists, guided rhythmic breathing, and daily affirmations.
            </p>
          </div>
        </div>

        {/* Subsection Switcher Tabs */}
        <div className="p-4 bg-white/95 border-t border-[#FCECEF] flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'playlists', label: 'Playlists', icon: Music },
            { id: 'affirmations', label: 'Affirmations Deck', icon: Smile },
            { id: 'breathe', label: 'Guided Breath', icon: Wind },
            { id: 'moodmatch', label: 'Mood Matcher', icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeSubSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubSection(item.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#D9658B] text-white shadow-xs'
                    : 'bg-[#FFF8F8] text-[#7E5265] hover:bg-[#FFF0F3] border border-[#F4D5DC]/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. PLAYLISTS SECTION */}
      {activeSubSection === 'playlists' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLAYLISTS_DATA.map((pl) => (
              <div
                key={pl.id}
                className="p-5 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#D9658B] bg-[#FFF0F3] px-2.5 py-0.5 rounded-full">
                      {pl.tag}
                    </span>
                    <a
                      href={pl.spotifyDirectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#1DB954] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Spotify</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <h3 className="text-base font-serif font-bold text-[#3D1E28] mt-2">
                    {pl.title}
                  </h3>
                  <p className="text-xs text-[#7E5265] mt-1 leading-relaxed">
                    {pl.description}
                  </p>
                </div>

                {/* Spotify Embed Player */}
                <div className="rounded-2xl overflow-hidden border border-[#F4D5DC]/80 bg-black/5">
                  <iframe
                    src={pl.spotifyEmbedUrl}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title={pl.title}
                    className="rounded-2xl"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white rounded-2xl border border-[#F4D5DC] text-xs text-[#7E5265] flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#D9658B]" />
              <span>Embedding protected by Spotify web integration. Click "Spotify" on any card to launch directly in your Spotify player.</span>
            </span>
          </div>
        </div>
      )}

      {/* 2. AFFIRMATIONS DECK SECTION */}
      {activeSubSection === 'affirmations' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="p-8 sm:p-12 bg-gradient-to-b from-white via-[#FFF0F3]/60 to-white rounded-3xl border border-[#F4D5DC] shadow-sm text-center relative overflow-hidden space-y-6">
            <span className="text-xs uppercase tracking-widest text-[#D9658B] font-bold bg-[#FCECEF] px-3 py-1 rounded-full">
              {currentAffirmation.phase}
            </span>

            <blockquote className="text-xl sm:text-2xl font-serif font-medium text-[#3D1E28] leading-relaxed italic px-4">
              "{currentAffirmation.quote}"
            </blockquote>

            <div className="text-xs text-[#7E5265] font-semibold tracking-wide">
              — {currentAffirmation.author}
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={drawNextAffirmation}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#D9658B] hover:bg-[#C54E74] text-white rounded-2xl text-xs font-bold shadow-xs transition-all active:scale-[0.98]"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Draw Another Gentle Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. BREATHE SECTION (4-7-8 RHYTHM) */}
      {activeSubSection === 'breathe' && (
        <div className="max-w-md mx-auto space-y-6">
          <div className="p-8 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs flex flex-col items-center justify-center text-center space-y-6">
            <div>
              <h3 className="text-xl font-serif font-bold text-[#3D1E28]">
                4-7-8 Calming Breath
              </h3>
              <p className="text-xs text-[#7E5265] mt-1">
                Inhale gently through nose for 4s, hold for 7s, exhale smoothly through mouth for 8s.
              </p>
            </div>

            {/* Breathing Animation Sphere */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-tr from-[#F4A6B8]/40 to-[#E25574]/20 transition-all duration-1000 ${
                  isBreathingActive && breathPhase === 'Inhale'
                    ? 'scale-110 opacity-80'
                    : isBreathingActive && breathPhase === 'Exhale'
                    ? 'scale-75 opacity-30'
                    : 'scale-90 opacity-50'
                }`}
              />

              {/* Center Core */}
              <div className="relative z-10 w-44 h-44 rounded-full bg-gradient-to-tr from-[#E25574] via-[#F4A6B8] to-[#FFF0F3] shadow-md flex flex-col items-center justify-center text-white">
                <span className="text-xs uppercase font-semibold tracking-wider text-[#FFF0F3]">
                  {isBreathingActive ? breathPhase : 'Ready'}
                </span>
                <div className="text-4xl font-serif font-bold tabular-nums my-1">
                  {isBreathingActive ? breathCounter : '🌸'}
                </div>
                <span className="text-[10px] text-[#FFF0F3]/90">
                  {isBreathingActive ? 'Follow the circle' : 'Tap start below'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <button
              onClick={() => {
                setIsBreathingActive(!isBreathingActive);
                setBreathPhase('Inhale');
                setBreathCounter(4);
              }}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-bold transition-all shadow-xs text-white bg-[#D9658B] hover:bg-[#C54E74] active:scale-[0.98]"
            >
              {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isBreathingActive ? 'Pause Breath' : 'Start 4-7-8 Breathing'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. MOOD MATCH SECTION */}
      {activeSubSection === 'moodmatch' && (
        <div className="space-y-6">
          <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-4">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#3D1E28]">
                How is your body and spirit feeling right now?
              </h3>
              <p className="text-xs text-[#7E5265] mt-0.5">
                Select your current sensation to reveal an immediate soothing recipe.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.entries(MOOD_MATCH_RECIPES).map(([key, data]) => {
                const isSelected = selectedMoodKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedMoodKey(key)}
                    className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-[#D9658B] text-white border-[#D9658B] shadow-xs'
                        : 'bg-[#FFF8F8] text-[#7E5265] border-[#F4D5DC] hover:bg-[#FFF0F3]'
                    }`}
                  >
                    {data.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prescribed Comfort Recipe */}
          <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-5">
            <div className="border-b border-[#FCECEF] pb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#D9658B] bg-[#FFF0F3] px-2.5 py-0.5 rounded-full">
                Instant Comfort Match
              </span>
              <h4 className="text-xl font-serif font-bold text-[#3D1E28] mt-1.5">
                {activeMoodRecipe.label} Care Kit
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] space-y-1">
                <div className="text-xs font-bold text-[#3D1E28] flex items-center gap-1.5">
                  <span>🍵</span>
                  <span>Recommended Herbal Tea</span>
                </div>
                <p className="text-xs text-[#7E5265] leading-relaxed">
                  {activeMoodRecipe.tea}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] space-y-1">
                <div className="text-xs font-bold text-[#3D1E28] flex items-center gap-1.5">
                  <span>🧘‍♀️</span>
                  <span>Restorative Somatic Stretch</span>
                </div>
                <p className="text-xs text-[#7E5265] leading-relaxed">
                  {activeMoodRecipe.stretch}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] space-y-1">
                <div className="text-xs font-bold text-[#3D1E28] flex items-center gap-1.5">
                  <span>🎵</span>
                  <span>Harmonizing Audio Track</span>
                </div>
                <p className="text-xs text-[#7E5265] leading-relaxed">
                  {activeMoodRecipe.song}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] space-y-1">
                <div className="text-xs font-bold text-[#3D1E28] flex items-center gap-1.5">
                  <span>🕊️</span>
                  <span>Heart Affirmation</span>
                </div>
                <p className="text-xs text-[#7E5265] leading-relaxed italic">
                  "{activeMoodRecipe.affirmation}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
