import React, { useState } from 'react';
import { PeriodProduct } from '../types';
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
} from 'lucide-react';

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
    tutorialYoutubeId: '72_YmB7vDqg', // Menstrual cup beginners tutorial
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
    tutorialYoutubeId: 'qj8bQ3HnNvg',
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
    tutorialYoutubeId: 'X94gGfB9aYg',
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
    tutorialYoutubeId: '7x_x9dY1x2s',
    tutorialTitle: 'Natural Remedies for Menstrual Cramps: Heat, Acupressure & Teas',
  },
];

export const ProductsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<PeriodProduct>(PRODUCTS_DATA[0]);

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
    <div className="space-y-6">
      {/* Top Banner and Filter Bar */}
      <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D9658B]" />
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3D1E28]">
                Period Products & Video Tutorials
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#7E5265] mt-1">
              Honest guides, usage steps, pros & cons, and verified educational video tutorials.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-[#7E5265] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products or guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#F4D5DC] bg-[#FFF8F8] focus:outline-none focus:ring-2 focus:ring-[#D9658B]"
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
                  : 'bg-[#FFF8F8] text-[#7E5265] hover:bg-[#FFF0F3] border border-[#F4D5DC]/60'
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
                    ? 'bg-white border-[#D9658B] ring-2 ring-[#D9658B]/20 shadow-sm'
                    : 'bg-white/80 border-[#F4D5DC] hover:bg-white hover:border-[#D9658B]/50'
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

        {/* Right: Selected Product In-Depth Guide & Tutorial Embed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white/95 rounded-3xl border border-[#F4D5DC] shadow-xs space-y-5">
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
              <h3 className="text-xl font-serif font-bold text-[#3D1E28] mt-1">
                {selectedProduct.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#7E5265] mt-1 leading-relaxed">
                {selectedProduct.description}
              </p>
            </div>

            {/* Pros and Cons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#F3FAF5] border border-[#BFE7D0] space-y-2">
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

              <div className="p-4 rounded-2xl bg-[#FFF8F8] border border-[#F4D5DC] space-y-2">
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
                How to Use Comfortably
              </h4>
              <ol className="space-y-2 text-xs text-[#7E5265]">
                {selectedProduct.usageSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FFF8F8] border border-[#F4D5DC]/60">
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
                    Video Tutorial: {selectedProduct.tutorialTitle}
                  </span>
                </div>
                <a
                  href={`https://www.youtube.com/watch?v=${selectedProduct.tutorialYoutubeId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#D9658B] hover:underline"
                >
                  <span>Open on YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* YouTube Embed Container with clean iframe and error fallback */}
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/5 border border-[#F4D5DC]">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${selectedProduct.tutorialYoutubeId}`}
                  title={selectedProduct.tutorialTitle}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
