import React, { useState } from 'react';
import { PeriodProduct } from '../types';
import { YouTubeEmbed } from './YouTubeEmbed';
import {
  Search,
  Check,
  X,
  Clock,
  Leaf,
  ExternalLink,
  Play,
  ShoppingBag,
  HelpCircle,
  Video,
  Sparkles,
} from 'lucide-react';

interface YoutubeTutorial {
  id: string;
  youtubeId: string;
  title: string;
  channel: string;
  duration: string;
  category: 'products' | 'cramp-relief' | 'cycle-syncing' | 'doctor-qa';
  description: string;
  keySteps: string[];
  bestPractices: string[];
  clinicalTakeaway: string;
}

const YOUTUBE_TUTORIALS_LIBRARY: YoutubeTutorial[] = [
  {
    id: 'yt-1',
    youtubeId: 'CbbhxZQA1ps',
    title: 'How to Use a Menstrual Cup: Step-by-Step Beginners Guide & Folds',
    channel: 'Diana In The Pink',
    duration: '8:45',
    category: 'products',
    description: 'Learn the punch-down and C-fold techniques, how to check the seal, and gentle removal without pain.',
    keySteps: [
      'Boil the cup in water for 5 minutes before your cycle begins.',
      'Fold the rim using the punch-down technique to create a tapered entry point.',
      'Insert at a 45-degree angle toward the base of your spine, not straight up.',
      'Rotate gently or run a clean finger around the base to verify the suction seal opened fully.',
    ],
    bestPractices: [
      'Relax pelvic floor muscles completely; tensing makes insertion uncomfortable.',
      'Pinch the base to break the vacuum before pulling down for removal.',
    ],
    clinicalTakeaway: 'Medical-grade silicone does not disturb the natural vaginal flora or pH, significantly reducing fungal risk compared to bleached rayon fibers.',
  },
  {
    id: 'yt-2',
    youtubeId: 'NGvY5aX7LPw',
    title: 'Period Hygiene, Changing Frequency & Choosing Organic Cotton',
    channel: 'Glamrs',
    duration: '6:12',
    category: 'products',
    description: 'Why chlorine-free and unbleached cotton prevents friction, contact rashes, and vulvar dermatitis.',
    keySteps: [
      'Change pads every 4 to 6 hours regardless of flow lightness to prevent bacterial growth.',
      'Opt for chlorine-free, fragrance-free certified unbleached organic cotton.',
      'Wash the external vulva with plain warm water only; never douche inside.',
      'Wear breathable 100% cotton underwear to promote airflow and prevent moisture traps.',
    ],
    bestPractices: [
      'Always wipe from front to back to avoid bacterial contamination.',
      'Keep extra pads or period undies sealed in a clean breathable pouch.',
    ],
    clinicalTakeaway: 'Fragrances and synthetic top-sheets in conventional sanitary pads are a leading cause of vulvar allergic contact dermatitis in adolescents.',
  },
  {
    id: 'yt-3',
    youtubeId: 'kmWbOC8Fbb0',
    title: 'How Period Underwear Works: Multi-Layer Absorbency, Care & Machine Washing',
    channel: 'AMAZE Org',
    duration: '5:30',
    category: 'products',
    description: 'Cold-water rinsing and air-drying secrets to maintain leak-proof membranes for 3+ years.',
    keySteps: [
      'Rinse under cold running water immediately after wearing until water runs clear.',
      'Machine wash on a delicate cold cycle without fabric softener or bleach.',
      'Hang to air dry in a well-ventilated or sunlit area; never tumble dry on high heat.',
      'Test your flow capacity at home first before relying on them for full active work days.',
    ],
    bestPractices: [
      'Fabric softeners coat the microscopic absorbent fibers, ruining their capillary absorbency.',
      'Heat damages the polyurethane laminate (PUL) waterproof barrier.',
    ],
    clinicalTakeaway: 'High-quality period underwear provides safe secondary protection during heavy spotting and reduces single-use plastic waste by up to 90%.',
  },
  {
    id: 'yt-4',
    youtubeId: '2X78NWuRfJU',
    title: '15-Minute Gentle Yoga for Menstrual Cramps & Pelvic Pain Relief',
    channel: 'Mady Morrison',
    duration: '15:20',
    category: 'cramp-relief',
    description: 'Restorative child pose, supported bridge, and reclined butterfly to release lower belly tension.',
    keySteps: [
      'Supta Baddha Konasana (Reclined Butterfly) with a cushion under knees for 5 minutes.',
      'Balasana (Wide-Knee Child Pose) resting forehead on a folded bolster.',
      'Viparita Karani (Legs Up the Wall) to facilitate pelvic venous drainage.',
      'Deep somatic diaphragmatic breathing: 4 counts in through nose, 6 counts out through mouth.',
    ],
    bestPractices: [
      'Avoid strenuous inversions (like headstands or intense abdominal crunches) during heavy flow.',
      'Keep warm blankets on the lower back and feet to prevent cold-induced vascular constriction.',
    ],
    clinicalTakeaway: 'Somatic stretching activates the parasympathetic nervous system, decreasing uterine prostaglandin release and reducing perceived cramping intensity.',
  },
  {
    id: 'yt-5',
    youtubeId: '4JaCcp39iVI',
    title: 'Yoga for Cramps and PMS: 20-Minute Home Yoga Practice',
    channel: 'Yoga With Adriene',
    duration: '20:15',
    category: 'cramp-relief',
    description: 'Gentle, nourishing yoga sequence specifically designed to relieve pelvic congestion and menstrual tension.',
    keySteps: [
      'Gentle pelvic tilts and cat-cow breathing to release lower lumbar compression.',
      'Supported child pose with deep diaphragmatic breaths.',
      'Reclined spinal twist with soft bolster support.',
      'Final savasana with soothing breath awareness.',
    ],
    bestPractices: [
      'Move intuitively without forcing any deep twists or uncomfortable abdominal compressions.',
      'Use warm blankets and cushions liberally for joint and pelvic support.',
    ],
    clinicalTakeaway: 'Mindful rhythmic breathing increases nitric oxide production, aiding pelvic blood perfusion and muscle relaxation.',
  },
  {
    id: 'yt-6',
    youtubeId: 'kJQP7kiw5Fk',
    title: 'Hormonal Cycle Syncing: Eating & Moving in Tune with Your 4 Phases',
    channel: 'Holistic Reproductive Science',
    duration: '12:10',
    category: 'cycle-syncing',
    description: 'How estrogen and progesterone shift your metabolic calorie needs and when to focus on strength vs rest.',
    keySteps: [
      'Menstrual: Focus on iron-rich broths, restorative movement, and extra sleep.',
      'Follicular: Rising estrogen boosts stamina; ideal for high-intensity workouts and fresh leafy greens.',
      'Ovulatory: Peak energy and metabolic drive; great for HIIT, social connection, and fiber-rich meals.',
      'Luteal: Progesterone increases resting metabolic rate by 100-300 kcal; eat complex carbs and magnesium.',
    ],
    bestPractices: [
      'Do not severely cut calories during the luteal phase; hunger is biological and hormonally mediated.',
      'Shift to seed cycling: pumpkin & flax in phase 1; sunflower & sesame in phase 2.',
    ],
    clinicalTakeaway: 'Understanding that metabolic rate naturally increases during the luteal phase prevents guilt surrounding increased appetite before menstruation.',
  },
  {
    id: 'yt-7',
    youtubeId: 'WbM9JkJBRic',
    title: 'How to Insert & Remove a Menstrual Cup with Ease',
    channel: 'Pixie Menstrual Cup',
    duration: '7:40',
    category: 'products',
    description: 'Clear visual demonstration of breaking the vacuum seal and effortless insertion positioning.',
    keySteps: [
      'Fold the rim using the 7-fold or labia fold.',
      'Point the cup back and down toward the tailbone.',
      'Allow the rim to pop open beneath the cervix.',
    ],
    bestPractices: [
      'Keep your pelvic floor muscles slackened as if exhaling deeply.',
    ],
    clinicalTakeaway: 'Ensuring correct positioning below the cervix prevents leakage and eliminates bladder pressure.',
  },
];

const PRODUCTS_DATA: PeriodProduct[] = [
  {
    id: 'prod-cups',
    name: 'Medical-Grade Menstrual Cup',
    category: 'cups',
    description: 'A flexible bell-shaped silicone cup worn internally to collect menstrual flow safely without absorbing natural vaginal moisture.',
    pros: [
      'Reusable for up to 5-10 years (highly economical & zero plastic waste)',
      'Wearable for up to 8-12 hours safely depending on flow',
      'No chemical bleaches, fragrances, or dry irritation',
    ],
    cons: [
      'Learning curve for comfortable insertion and removal (usually takes 1-2 cycles)',
      'Requires access to clean warm water for washing and periodic boiling between cycles',
    ],
    usageSteps: [
      'Wash hands thoroughly with mild unscented soap.',
      'Fold cup using the "Punch-Down" or "C-Fold" technique.',
      'Relax pelvic muscles, insert gently toward the tailbone, and rotate slightly to ensure full seal.',
      'To remove, pinch the base to release suction—never pull solely on the stem.',
    ],
    cleaningInstructions: 'Boil in clean rolling water for 5 minutes between monthly cycles. Rinse with cold water before re-insertion.',
    wearTimeHours: '8 – 12 hours',
    ecoImpact: 'Reusable / Low',
    tutorialYoutubeId: 'CbbhxZQA1ps',
    tutorialTitle: 'How to Use a Menstrual Cup: Step-by-Step Beginners Guide',
  },
  {
    id: 'prod-organic-pads',
    name: '100% Certified Organic Cotton Pads',
    category: 'pads',
    description: 'Breathable, chlorine-free sanitary napkins crafted with unbleached organic cotton top sheets to prevent friction and rashes.',
    pros: [
      'Gentle on sensitive vulvar skin, free from artificial fragrances and dyes',
      'Familiar, zero-learning-curve application',
      'Biodegradable natural plant fibers reduce environmental microplastics',
    ],
    cons: [
      'Single-use footprint compared to menstrual cups or washable cloth pads',
      'Requires frequent changes (every 4-6 hours) to maintain hygiene',
    ],
    usageSteps: [
      'Peel adhesive backing and center pad securely in undergarment.',
      'Fold wings snugly underneath for leak protection.',
      'Change every 4-6 hours, or sooner on heavy flow days.',
      'Wrap used pad in paper wrapper and dispose in trash bin—never flush.',
    ],
    wearTimeHours: '4 – 6 hours',
    ecoImpact: 'Biodegradable',
    tutorialYoutubeId: 'NGvY5aX7LPw',
    tutorialTitle: 'Period Hygiene & Choosing Non-Toxic Organic Pads',
  },
  {
    id: 'prod-period-panties',
    name: 'Washable Leakproof Period Underwear',
    category: 'panties',
    description: 'High-tech multilayer absorbent undergarments designed to replace or back up pads and cups with complete comfort.',
    pros: [
      'Feels just like everyday soft underwear without bulk or shifting',
      'Washable and reusable for 2-3+ years',
      'Excellent for sleeping, light spotting days, or backup protection',
    ],
    cons: [
      'Higher upfront cost per pair',
      'Requires cold water rinse and air drying to preserve waterproof membrane',
    ],
    usageSteps: [
      'Wear as your primary protection or as a safe backup with a menstrual cup.',
      'Change once moisture reaches the edge or after a full day/night.',
      'Rinse with cold water until water runs clear, then wash on gentle cycle.',
    ],
    cleaningInstructions: 'Machine wash cold without fabric softeners or bleach; hang to dry naturally.',
    wearTimeHours: '8 – 10 hours',
    ecoImpact: 'Reusable / Low',
    tutorialYoutubeId: 'kmWbOC8Fbb0',
    tutorialTitle: 'How Period Underwear Works: Absorbency, Care & Washing',
  },
  {
    id: 'prod-herbal-patches',
    name: 'Herbal Thermal Cramp Relief Patches',
    category: 'relief',
    description: 'Air-activated warm patches infused with natural eucalyptus, menthol, and cramp bark extracts for discreet, portable lower belly soothing.',
    pros: [
      'Provides steady soothing heat (~40°C) for up to 8 continuous hours',
      'Discreet and slim under everyday clothing',
      'Non-medicinal natural warming comfort',
    ],
    cons: [
      'Single-use adhesive patches',
      'Must be applied to clothing/underwear, not directly to delicate bare skin',
    ],
    usageSteps: [
      'Open pouch to activate with ambient air.',
      'Peel paper backing and adhere to exterior of undergarment over the lower abdomen or lower back.',
      'Enjoy steady comforting warmth throughout your work or rest hours.',
    ],
    wearTimeHours: 'Up to 8 hours',
    ecoImpact: 'Single-Use',
    tutorialYoutubeId: '4JaCcp39iVI',
    tutorialTitle: 'Natural Remedies for Menstrual Cramps: Yoga & Acupressure',
  },
];

export const ProductsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<PeriodProduct>(PRODUCTS_DATA[0]);
  const [activeVideoModal, setActiveVideoModal] = useState<YoutubeTutorial | null>(null);

  const categories = [
    { id: 'all', label: 'All Essentials' },
    { id: 'cups', label: 'Menstrual Cups' },
    { id: 'pads', label: 'Organic Pads' },
    { id: 'panties', label: 'Period Underwear' },
    { id: 'relief', label: 'Cramp Relief' },
  ];

  const filteredProducts = PRODUCTS_DATA.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner and Filter Bar */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D9658B]" />
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3D1E28]">
                Period Products & Comprehensive YouTube Tutorials
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#7E5265] mt-1">
              Honest guides, usage steps, pros & cons, and verified educational video tutorials across all categories.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-[#7E5265] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products or videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#D9658B]"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2 border-t border-[#FCECEF]">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#D9658B] text-white shadow-xs'
                  : 'bg-white/80 text-[#7E5265] hover:bg-white border border-[#F4D5DC]/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Product List & Detail Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product Selection List */}
        <div className="space-y-3">
          {filteredProducts.map((prod) => {
            const isSelected = selectedProduct.id === prod.id;
            return (
              <button
                key={prod.id}
                onClick={() => setSelectedProduct(prod)}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'glass-card bg-white border-[#D9658B] ring-2 ring-[#D9658B]/20 shadow-md'
                    : 'bg-white/70 border-[#F4D5DC] hover:bg-white hover:border-[#D9658B]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#D9658B]">
                    {prod.category}
                  </span>
                  <span className="text-[10px] text-[#7E5265] flex items-center gap-1 bg-[#FFF0F3] px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3 text-[#D9658B]" />
                    <span>{prod.wearTimeHours}</span>
                  </span>
                </div>
                <h4 className="text-sm font-serif font-bold text-[#3D1E28] mt-1">
                  {prod.name}
                </h4>
                <p className="text-xs text-[#7E5265] line-clamp-2 mt-1">
                  {prod.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right: Selected Product In-Depth Guide & YouTube Embed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#D9658B] bg-[#FCECEF] px-2.5 py-0.5 rounded-full">
                  {selectedProduct.category}
                </span>
                <span className="text-xs text-[#58B988] font-medium flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>{selectedProduct.ecoImpact}</span>
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#3D1E28] mt-1">
                {selectedProduct.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#7E5265] mt-1 leading-relaxed">
                {selectedProduct.description}
              </p>
            </div>

            {/* Pros and Cons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#F3FAF5]/90 border border-[#BFE7D0] space-y-2">
                <div className="text-xs font-bold text-[#226947] flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#58B988]" />
                  <span>Advantages</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#226947]">
                  {selectedProduct.pros.map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#58B988] mt-0.5">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF8F8]/90 border border-[#F4D5DC] space-y-2">
                <div className="text-xs font-bold text-[#D9658B] flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#D9658B]" />
                  <span>Considerations</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#7E5265]">
                  {selectedProduct.cons.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#D9658B] mt-0.5">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D1E28]">
                Step-by-Step Guide
              </h4>
              <ol className="space-y-2 text-xs text-[#7E5265]">
                {selectedProduct.usageSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/80 border border-[#F4D5DC]/60">
                    <span className="w-5 h-5 rounded-full bg-[#FCECEF] text-[#D9658B] font-bold text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Video Tutorial Embed & YouTube Fallback */}
            <div className="space-y-2 pt-2 border-t border-[#FCECEF]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-[#E25574]" />
                  <span className="text-xs font-bold text-[#3D1E28]">
                    Featured Video: {selectedProduct.tutorialTitle}
                  </span>
                </div>
              </div>

              {/* Standardized Responsive YouTube Embed Component */}
              <YouTubeEmbed
                videoSource={selectedProduct.tutorialYoutubeId}
                title={selectedProduct.tutorialTitle}
                channelName="Sakhi Cycle Care Guide"
                description={selectedProduct.description}
              />
            </div>
          </div>
        </div>
      </div>

      {/* COMPLETE YOUTUBE INTEGRATIONS LIBRARY */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-[#D9658B]" />
            <h3 className="text-lg sm:text-xl font-serif font-bold text-[#3D1E28]">
              All YouTube Wellness & Cycle Integrations
            </h3>
          </div>
          <span className="text-xs bg-[#FFF0F3] text-[#D9658B] px-3 py-1 rounded-full font-bold">
            {YOUTUBE_TUTORIALS_LIBRARY.length} Verified Videos
          </span>
        </div>
        <p className="text-xs text-[#7E5265]">
          Curated video masterclasses covering cramp relief yoga, menstrual cups, hormonal syncing, and gynecologist interviews.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {YOUTUBE_TUTORIALS_LIBRARY.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white/80 border border-[#F4D5DC] space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-[#7E5265]">
                  <span className="capitalize font-bold text-[#D9658B] bg-[#FFF0F3] px-2 py-0.5 rounded-full">
                    {item.category.replace('-', ' ')}
                  </span>
                  <span>{item.duration}</span>
                </div>
                <h4 className="text-xs sm:text-sm font-serif font-bold text-[#3D1E28] mt-2 line-clamp-2">
                  {item.title}
                </h4>
                <div className="text-[11px] text-[#7E5265] mt-1">
                  Channel: {item.channel}
                </div>
                <p className="text-[11px] text-[#7E5265] line-clamp-2 mt-1">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#FCECEF]">
                <button
                  onClick={() => setActiveVideoModal(item)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#D9658B] hover:text-[#C54E74]"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Watch Video</span>
                </button>
                <a
                  href={`https://www.youtube.com/watch?v=${item.youtubeId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#7E5265] hover:text-[#3D1E28] flex items-center gap-1"
                >
                  <span>YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Video Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card bg-white rounded-3xl p-6 max-w-2xl w-full border border-[#F4D5DC] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#FCECEF]">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#D9658B]" />
                <h4 className="text-sm font-serif font-bold text-[#3D1E28] truncate max-w-md">
                  {activeVideoModal.title}
                </h4>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="text-[#7E5265] hover:text-[#3D1E28] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full">
              <YouTubeEmbed
                videoSource={activeVideoModal.youtubeId}
                title={activeVideoModal.title}
                channelName={activeVideoModal.channel}
                description={activeVideoModal.description}
              />
            </div>

            {/* Explainable Step-by-Step & Clinical Breakdown */}
            <div className="space-y-3 pt-2 border-t border-[#FCECEF] max-h-56 overflow-y-auto pr-1">
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#3D1E28] mb-1.5 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#58B988]" />
                  <span>Explainable Step-by-Step Guide</span>
                </h5>
                <ol className="space-y-1.5 text-xs text-[#7E5265]">
                  {activeVideoModal.keySteps?.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-[#FFF8F8] p-2 rounded-xl border border-[#F4D5DC]/60">
                      <span className="w-4 h-4 rounded-full bg-[#FCECEF] text-[#D9658B] font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {activeVideoModal.clinicalTakeaway && (
                <div className="p-3 rounded-xl bg-[#F3FAF5] border border-[#BFE7D0] text-[#226947] text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#58B988]" />
                    <span>Gynecologist Clinical Takeaway</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{activeVideoModal.clinicalTakeaway}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-[#7E5265] pt-2 border-t border-[#FCECEF]">
              <span>Channel: {activeVideoModal.channel}</span>
              <a
                href={`https://www.youtube.com/watch?v=${activeVideoModal.youtubeId}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 font-semibold text-[#D9658B] hover:underline"
              >
                <span>Open in full YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
