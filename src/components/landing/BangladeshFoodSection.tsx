import React from 'react';
import { Check } from 'lucide-react';
import { BlurText } from '../animations/BlurText';
import { GlowCard } from '../ui/spotlight-card';

const HIGHLIGHTS = [
  {
    title: '135+ Bangla & English Food Aliases',
    desc: 'Matches phonetic, localized Bangla script and common English variations (e.g. Masoor Dal, রুই মাছ, পালং শাক, সিদ্ধ চাল).',
  },
  {
    title: 'Preparation-Aware Nutritional Records',
    desc: 'Differentiates cooked boiled parboiled rice from dry raw rice, and braised fish curry from raw fish cutlets to preserve correct macro density.',
  },
  {
    title: 'Local Trade Units & Currency',
    desc: 'Displays native unit pricing: Hali (4-pack) for farm eggs, Powa (250g) for spices, Ati (bundle) for leafy greens, and Kg for grains and fish in Bangladeshi Taka (৳).',
  },
  {
    title: 'FAO Food Composition Table (2013)',
    desc: 'Anchored on verified laboratory food composition research published specifically for Bangladesh by the Food and Agriculture Organization and INFS Dhaka University.',
  },
];

export const BangladeshFoodSection: React.FC = () => {
  return (
    <section id="bangladesh-first" className="py-20 sm:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            Culturally Grounded
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            <BlurText
              text="Nutrition intelligence that understands your food."
              effect="focus"
              animateBy="words"
              direction="top"
              staggerFrom="start"
              trigger="view"
              delay={80}
              stepDuration={0.35}
              blur={6}
              distance={20}
              loop={false}
              as="span"
              className="inline-flex flex-wrap justify-center"
            />
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Food guidance becomes more useful when it understands familiar ingredients, local names, preparation methods and everyday meals. NutriLens begins with Bangladesh-focused food knowledge and a localized market demonstration.
          </p>
        </div>

        {/* Content Split: Real Meal Photo & Feature Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left: Authentic Plate Photo Presentation */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-forest-border shadow-xl bg-slate-900/5 dark:bg-[#06140e] group">
              <img
                src="/images/bhaat-gorur-mangsho.jpg"
                alt="Bhaat with Gorur Mangsho (ভাত ও গরুর মাংস)"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase font-sans">
                  Bangla Thali Scan
                </span>
                <p className="font-bold text-sm sm:text-base">
                  Bhaat with Gorur Mangsho (ভাত ও গরুর মাংস)
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Edible portion analysis via FAO FCTB 2013 standard recipes
                </p>
              </div>
            </div>
          </div>

          {/* Right: Key Pillars Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {HIGHLIGHTS.map((item, idx) => (
              <GlowCard
                key={idx}
                glowColor="green"
                customSize
                radius={16}
                className="p-6 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-2 hover:border-emerald-500/40 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </GlowCard>
            ))}
          </div>

        </div>



      </div>
    </section>
  );
};
