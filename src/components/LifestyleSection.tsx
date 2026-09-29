import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CyclePhase } from '../types';
import { calculateCycleStatus, PHASE_COLORS } from '../utils/cycleCalculations';
import { IMAGES } from '../assets/images';
import { YouTubeEmbed } from './YouTubeEmbed';
import {
  Utensils,
  Activity,
  Moon,
  Sparkles,
  Heart,
  ChevronRight,
  ShieldCheck,
  Video,
  Play,
  ExternalLink,
} from 'lucide-react';

interface PhaseGuide {
  title: string;
  subtitle: string;
  hormones: string;
  nourishment: string[];
  seedCycling: string;
  movement: string[];
  restAndMind: string[];
}

const PHASE_GUIDES: Record<CyclePhase, PhaseGuide> = {
  menstrual: {
    title: 'Menstrual Phase (Winter of the Cycle)',
    subtitle: 'A sacred pause for shedding, intuition, and deep renewal.',
    hormones: 'Estrogen and progesterone are at their baseline, signaling the body to reset.',
    nourishment: [
      'Warm broths, spiced dal, and iron-rich lentils to replenish natural minerals.',
      'Soothing ginger, cinnamon, and chamomile infusions for digestive comfort.',
      'Magnesium-dense dark chocolate, roasted almonds, and pumpkin seeds.',
      'Hydrating warm water with a touch of lemon and raw honey.',
    ],
    seedCycling: 'Days 1-14: 1 tbsp freshly ground flaxseeds + 1 tbsp pumpkin seeds daily for gentle estrogen support.',
    movement: [
      'Gentle restorative yoga (child pose, reclined butterfly, legs up the wall).',
      'Slow mindful stretching and slow breathwalks in fresh air.',
      'Complete rest on days when cramps or fatigue feel strong.',
    ],
    restAndMind: [
      'Warm water bottles or herbal heating compresses on the lower abdomen.',
      'Allowing space for quiet reflection, reading, and gentle early bedtime.',
      'Honoring emotional sensitivity as intuitive wisdom rather than weakness.',
    ],
  },
  follicular: {
    title: 'Follicular Phase (Spring of the Cycle)',
    subtitle: 'Rising vitality, fresh creativity, and expanding curiosity.',
    hormones: 'Follicle-stimulating hormone (FSH) and estrogen rise steadily, rebuilding the uterine lining.',
    nourishment: [
      'Fresh leafy greens (spinach, methi, moringa) and sprouted pulses.',
      'Probiotic fermented foods (chaas, yogurt, kefir) to support gut metabolism.',
      'Cruciferous vegetables (broccoli, cabbage) to assist natural hormone balance.',
      'Citrus fruits, berries, and antioxidant-rich pomegranate seeds.',
    ],
    seedCycling: 'Continue with 1 tbsp ground flaxseeds + 1 tbsp pumpkin seeds until ovulation.',
    movement: [
      'Vinyasa yoga, dance, cardio, and moderate strength training.',
      'Hiking, brisk morning walks, and exploring new physical activities.',
      'Embracing the natural boost in stamina and joint flexibility.',
    ],
    restAndMind: [
      'Ideal time for brainstorming new projects, learning, and planning.',
      'High mental clarity and eagerness to connect with supportive friends.',
    ],
  },
  ovulation: {
    title: 'Ovulatory Phase (Summer of the Cycle)',
    subtitle: 'The crest of confidence, radiance, and communicative energy.',
    hormones: 'Luteinizing hormone (LH) peaks, triggering the release of an egg; estrogen reaches its summit.',
    nourishment: [
      'Light, nutrient-dense meals with plenty of fresh seasonal vegetables.',
      'Berries, papaya, and antioxidant smoothies for cellular vitality.',
      'Lean proteins, chia seeds, and hydration with coconut water.',
      'Bitter greens (arugula, dandelion greens) to support liver detoxification.',
    ],
    seedCycling: 'Transition day: Prepare to switch seeds as the luteal phase approaches.',
    movement: [
      'Peak energy workouts: high-intensity intervals (HIIT), power yoga, resistance training.',
      'Group fitness classes, swimming, and expressive movement.',
    ],
    restAndMind: [
      'Communicate bold ideas, lead presentations, or have heartfelt conversations.',
      'Channel high social presence while still honoring mindful hydration.',
    ],
  },
  luteal: {
    title: 'Luteal Phase (Autumn of the Cycle)',
    subtitle: 'Inward focus, nesting, comforting warmth, and metabolic ramp-up.',
    hormones: 'Progesterone takes center stage to warm the body; if no pregnancy occurs, hormones decline prior to menstruation.',
    nourishment: [
      'Complex carbohydrates: roasted sweet potatoes, brown rice, whole oats to stabilize serotonin.',
      'Warm herbal teas: peppermint, holy basil (tulsi), and raspberry leaf.',
      'Healthy fats: avocados, ghee, walnuts, and sesame seeds.',
      'Minimizing excess refined sugars and excessive caffeine to prevent sudden PMS jitteriness.',
    ],
    seedCycling: 'Days 15-28: 1 tbsp ground sunflower seeds + 1 tbsp sesame seeds for supportive progesterone balance.',
    movement: [
      'Transitioning from intense training to grounding pilates, yin yoga, and steady walking.',
      'Listening attentively to fatigue cues without pushing beyond comfort.',
    ],
    restAndMind: [
      'Creating cozy domestic sanctuaries, organizing spaces, and setting gentle boundaries.',
      'Practicing grounding 4-7-8 breathing when anxiety or irritability surfaces.',
    ],
  },
};

export const LifestyleSection: React.FC = () => {
  const { cycleSettings } = useApp();
  const currentStatus = calculateCycleStatus(cycleSettings);
  const [selectedPhase, setSelectedPhase] = useState<CyclePhase>(currentStatus.currentPhase);

  const guide = PHASE_GUIDES[selectedPhase];
  const phaseTheme = PHASE_COLORS[selectedPhase];

  return (
    <div className="space-y-6">
      {/* Hero Visual Card */}
      <div className="relative rounded-3xl overflow-hidden border border-[#F4D5DC] shadow-sm bg-white">
        <div className="relative h-56 sm:h-64 w-full overflow-hidden">
          <img
            src={IMAGES.learnNutrition}
            alt="Mindful nutrition and herbal wellness"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3D1E28]/85 via-[#3D1E28]/40 to-transparent flex flex-col justify-end p-6 sm:p-8">
            <span className="text-xs uppercase tracking-widest text-[#FCECEF] font-semibold">
              Holistic Lifestyle & Cycle Syncing
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              Harmonize Your Routine with Your Hormones
            </h2>
            <p className="text-xs sm:text-sm text-[#FCECEF]/90 mt-1 max-w-xl">
              Nourishment, gentle movement, and restorative practices tailored to your body’s four rhythmic seasons.
            </p>
          </div>
        </div>

        {/* Phase Selector Tabs */}
        <div className="p-4 bg-white/90 border-t border-[#FCECEF] flex items-center justify-start gap-2 overflow-x-auto scrollbar-none">
          {(['menstrual', 'follicular', 'ovulation', 'luteal'] as CyclePhase[]).map((phase) => {
            const isSelected = selectedPhase === phase;
            const isCurrent = currentStatus.currentPhase === phase;
            const theme = PHASE_COLORS[phase];
            return (
              <button
                key={phase}
                onClick={() => setSelectedPhase(phase)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'shadow-sm text-white'
                    : 'text-[#7E5265] bg-[#FFF8F8] hover:bg-[#FFF0F3] border border-[#F4D5DC]/60'
                }`}
                style={{
                  backgroundColor: isSelected ? theme.ring : undefined,
                }}
              >
                <span>{theme.label}</span>
                {isCurrent && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/30 text-white' : 'bg-[#D9658B] text-white'}`}>
                    Current
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Phase Guide Breakdown */}
      <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-6">
        <div className="border-b border-[#FCECEF] pb-4">
          <span
            className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
            style={{ backgroundColor: phaseTheme.bg, color: phaseTheme.text }}
          >
            {guide.title}
          </span>
          <p className="text-sm font-medium text-[#3D1E28] mt-2">
            {guide.subtitle}
          </p>
          <div className="mt-2 text-xs text-[#7E5265] bg-[#FFF8F8] p-3 rounded-xl border border-[#F4D5DC]/70">
            🧬 <strong>Hormonal Rhythm:</strong> {guide.hormones}
          </div>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Nourishment */}
          <div className="p-5 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#3D1E28]">
              <Utensils className="w-4 h-4 text-[#D9658B]" />
              <span>Nourishment & Foods</span>
            </div>
            <ul className="space-y-2 text-xs text-[#7E5265] leading-relaxed">
              {guide.nourishment.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#D9658B] mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2 border-t border-[#FCECEF] text-[11px] text-[#3D1E28] bg-white p-2.5 rounded-xl border border-[#F4D5DC]/60">
              🌱 <strong>Seed Cycling:</strong> {guide.seedCycling}
            </div>
          </div>

          {/* Movement */}
          <div className="p-5 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#3D1E28]">
              <Activity className="w-4 h-4 text-[#58B988]" />
              <span>Gentle Movement</span>
            </div>
            <ul className="space-y-2 text-xs text-[#7E5265] leading-relaxed">
              {guide.movement.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#58B988] mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Rest & Mind */}
          <div className="p-5 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#3D1E28]">
              <Moon className="w-4 h-4 text-[#A663CE]" />
              <span>Rest & Mental Space</span>
            </div>
            <ul className="space-y-2 text-xs text-[#7E5265] leading-relaxed">
              {guide.restAndMind.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#A663CE] mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Gentle non-prescriptive medical caution */}
        <div className="p-4 bg-[#FFF9ED] border border-[#FDE1A9] rounded-2xl text-xs text-[#94580D] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#E8A735] shrink-0" />
          <span>
            These suggestions offer loving wellness inspiration grounded in lifestyle science. Always consult with your certified healthcare practitioner or registered dietitian for personalized dietary and medical recommendations.
          </span>
        </div>
      </div>

      {/* Curated Video Masterclasses with Verified YouTube Embed */}
      <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#FCECEF] pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#D9658B]">
              <Video className="w-3.5 h-3.5" />
              <span>Verified Video Masterclasses</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-[#3D1E28]">
              Expert Guidance: Physiology, Yoga & Cycle Health
            </h3>
            <p className="text-xs text-[#7E5265]">
              Validated educational videos loaded via privacy-enhanced players with safe YouTube fallbacks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video 1: Cycle Syncing & Nutrition */}
          <div className="bg-[#FFF8F8] rounded-2xl p-4 border border-[#F4D5DC] space-y-3">
            <YouTubeEmbed
              videoSource="2X78NWuRfJU"
              title="Cycle Syncing: Nutrition & Movement for Every Phase"
              channelName="Wellness Masterclasses"
              description="Learn how changing metabolic demands across follicular, ovulation, luteal, and menstrual phases influence nutrient absorption and daily vitality."
            />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#3D1E28]">
                Cycle Syncing: Nutrition & Movement for Every Phase
              </h4>
              <p className="text-xs text-[#7E5265]">
                How to align high-energy HIIT workouts during follicular surges and transition to magnesium-dense nourishing foods in the luteal window.
              </p>
            </div>
          </div>

          {/* Video 2: Gentle Yoga for Cramp Relief */}
          <div className="bg-[#FFF8F8] rounded-2xl p-4 border border-[#F4D5DC] space-y-3">
            <YouTubeEmbed
              videoSource="4JaCcp39iVI"
              title="Gentle Yoga for Menstrual Relief & Cramps"
              channelName="Mindful Movement"
              description="Somatic pelvic floor release, restorative stretches, and gentle diaphragmatic breathing for painful cramps and lower back fatigue."
            />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#3D1E28]">
                Gentle Yoga for Menstrual Relief & Cramps
              </h4>
              <p className="text-xs text-[#7E5265]">
                Soothing physical postures designed to increase uterine circulation and quiet sympathetic nervous system tension during menstruation.
              </p>
            </div>
          </div>

          {/* Video 3: Menstrual Cup Step-by-Step */}
          <div className="bg-[#FFF8F8] rounded-2xl p-4 border border-[#F4D5DC] space-y-3">
            <YouTubeEmbed
              videoSource="CbbhxZQA1ps"
              title="How to Use a Menstrual Cup: Step-by-Step Guide for Beginners"
              channelName="Diana In The Pink"
              description="Beginner fold techniques, insertion angle, checking the vacuum seal, and gentle removal without pinching."
            />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#3D1E28]">
                How to Use a Menstrual Cup: Step-by-Step Guide
              </h4>
              <p className="text-xs text-[#7E5265]">
                Everything you need to know about sterilizing, positioning, and comfortable wear with zero leaks or discomfort.
              </p>
            </div>
          </div>

          {/* Video 4: Period Hygiene & Healthy Habits */}
          <div className="bg-[#FFF8F8] rounded-2xl p-4 border border-[#F4D5DC] space-y-3">
            <YouTubeEmbed
              videoSource="NGvY5aX7LPw"
              title="Period Hygiene & Choosing Body-Safe Wellness Products"
              channelName="Glamrs"
              description="Dermatologist-approved guidance on changing intervals, avoiding harsh synthetic fragrances, and maintaining optimal intimate health."
            />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#3D1E28]">
                Period Hygiene & Body-Safe Products
              </h4>
              <p className="text-xs text-[#7E5265]">
                Best practices for preventing vulvar irritation, selecting organic cotton, and understanding vaginal pH balance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
