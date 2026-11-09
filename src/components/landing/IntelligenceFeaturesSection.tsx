import React from 'react';
import {
  Sparkles,
  Store,
  Target,
  UtensilsCrossed,
  Repeat,
  ShoppingBag,
  Receipt,
  MessageSquare,
} from 'lucide-react';
import { motion } from 'motion/react';
import { BlurText } from '../animations/BlurText';
import { MotionCard } from '../animations/MotionCard';
import { GlowCard } from '../ui/spotlight-card';

interface Feature {
  id: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  tag: string;
}

const FEATURES: Feature[] = [
  {
    id: 'bangla-plate',
    icon: Sparkles,
    title: 'Bangla Plate Intelligence',
    desc: 'Recognizes supported familiar Bangladesh meals (parboiled rice, lentil curries, freshwater fish, leafy greens), supports dual Bangla/English aliases, and maps to reviewed food records.',
    tag: 'Multimodal Vision',
  },
  {
    id: 'bazar-to-plate',
    icon: Store,
    title: 'Bazar-to-Plate AI',
    desc: 'Connects household food preferences and daily budget with localized wet market observations in Savar and Ashulia to compare practical meal costs.',
    tag: 'Price Intelligence',
  },
  {
    id: 'gap-optimizer',
    icon: Target,
    title: 'Nutrient Gap Optimizer',
    desc: 'Highlights meal-level improvements against declared personal goals (e.g. protein target or iron boost) without generating clinical diagnoses.',
    tag: 'Target Optimization',
  },
  {
    id: 'meal-rescue',
    icon: UtensilsCrossed,
    title: 'Constraint-Aware Meal Rescue',
    desc: 'Helps compare feasible meal alternatives using maximum budget, culinary preference, ingredient exclusions, preparation time, and available pantry items.',
    tag: 'Constraint Engine',
  },
  {
    id: 'substitution',
    icon: Repeat,
    title: 'Cuisine-Preserving Substitution',
    desc: 'Suggests culturally authentic ingredient swaps (such as farm eggs or lentils for expensive beef) rather than suggesting alien Western recipes.',
    tag: 'Cultural Preservation',
  },
  {
    id: 'shopping-basket',
    icon: ShoppingBag,
    title: 'Smart Shopping Basket',
    desc: 'Consolidates recipe ingredients into purchase quantities, offsets declared pantry staples, and rounds into local wet market trade units (e.g., hali, powa, kg).',
    tag: 'Local Trade Units',
  },
  {
    id: 'evidence-receipt',
    icon: Receipt,
    title: 'Evidence Receipt',
    desc: 'Every calculation is fully inspectable: see the exact FAO FCTB 2013 food code, portion weight, preparation state, formula version, and market observation timestamp.',
    tag: 'Audit Provenance',
  },
  {
    id: 'rag-assistant',
    icon: MessageSquare,
    title: 'RAG Nutrition Assistant',
    desc: 'Answers user questions grounded strictly in reviewed Bangladeshi nutritional literature and recipe documents, complete with source-cited chunk references.',
    tag: 'Grounded RAG',
  },
];

export const IntelligenceFeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-20 sm:py-28 bg-slate-50/50 dark:bg-forest-card/20 border-t border-slate-200/70 dark:border-forest-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            Comprehensive Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            <BlurText
              text="One connected intelligence system."
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
              className="inline justify-center"
            />
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            NutriLens brings food understanding, nutrition evidence and practical meal decisions into one connected experience.
          </p>
        </div>

        {/* 8 Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 pt-8">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;

            return (
              <MotionCard
                key={feat.id}
                hoverLift={-6}
                hoverScale={1.02}
                className="h-full rounded-3xl"
              >
                <GlowCard
                  glowColor="green"
                  customSize
                  radius={24}
                  className="h-full relative p-6 pt-9 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm flex flex-col justify-between hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-colors duration-200 group"
                >
                  {/* Icon crossing 50% in the middle of the top */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-[#0c2419] border-2 border-white dark:border-forest-card flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md group-hover:bg-emerald-500 group-hover:text-white transition-all duration-200 z-10">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-3 pt-2">
                    <motion.h3 layout="position" className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {feat.title}
                    </motion.h3>

                    <motion.p layout="position" className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {feat.desc}
                    </motion.p>
                  </div>

                  <motion.div layout="position" className="pt-4 mt-5 border-t border-slate-100 dark:border-forest-border/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-sans tracking-wide">
                    {feat.tag}
                  </motion.div>
                </GlowCard>
              </MotionCard>
            );
          })}
        </div>

      </div>
    </section>
  );
};
