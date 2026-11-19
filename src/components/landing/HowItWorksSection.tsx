import React from 'react';
import { Camera, CheckSquare, BarChart3, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { BlurText } from '../animations/BlurText';
import { MotionCard } from '../animations/MotionCard';
import { GlowCard } from '../ui/spotlight-card';

const STEPS = [
  {
    step: '01',
    icon: Camera,
    title: 'Capture your food',
    desc: 'Upload a meal or ingredient photo. NutriLens uses image understanding to suggest foods it can recognize. AI recognition provides candidate suggestions; it does not establish final food identity.',
    badge: 'Multimodal Vision',
    footnote: 'Proposes initial bounding boxes and candidate dishes',
  },
  {
    step: '02',
    icon: CheckSquare,
    title: 'Confirm your meal',
    desc: 'Review the suggested foods, correct anything that looks wrong, choose preparation details (boiled, fried, raw) and confirm portion weights in grams.',
    badge: 'Human Verification',
    footnote: 'Guarantees accuracy and user control over assumptions',
  },
  {
    step: '03',
    icon: BarChart3,
    title: 'Understand your nutrition',
    desc: 'See a nutrition estimate calculated from confirmed portions and reviewed food records (FAO FCTB 2013), with sources and assumptions made visible. Unknown values remain preserved as unknown.',
    badge: 'Deterministic Math',
    footnote: 'Edible portion basis per 100g • No invented zeros',
  },
  {
    step: '04',
    icon: ShoppingBag,
    title: 'Discover your next meal',
    desc: 'Explore familiar alternatives that consider your preferences, budget and the selected local market context (Savar & Ashulia), with an automated shopping basket rounded to trade units.',
    badge: 'Market Affordability',
    footnote: 'Official WFP 2026 Bangladesh retail market pricing',
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            Vision-to-Market Workflow
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            <BlurText
              text="From what's on your plate to what comes next."
              effect="blur"
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
            NutriLens turns a food image into a confirmed nutrition estimate and helps connect that insight to practical, locally relevant meal choices.
          </p>
        </div>

        {/* 4 Steps Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <MotionCard
                key={idx}
                hoverLift={-8}
                hoverScale={1.02}
                className="h-full rounded-3xl"
              >
                <GlowCard
                  glowColor="green"
                  customSize
                  radius={24}
                  className="h-full relative p-6 sm:p-7 pt-8 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm flex flex-col justify-between hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-colors duration-200 group"
                >
                  {/* Solid Circle Step Number Crossing 50% of the Upper Border */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md border-2 border-white dark:border-forest-card z-10 font-sans tracking-tight">
                    {s.step}
                  </div>

                  {/* Card Content */}
                  <div className="space-y-4">
                    {/* Category Pill Badge at the Middle of the Top */}
                    <motion.div layout="position" className="flex justify-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-sans">
                        {s.badge}
                      </span>
                    </motion.div>

                    {/* Icon and Heading Side by Side */}
                    <motion.div layout="position" className="flex items-center gap-3 pt-1">
                      <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-forest-card/80 border border-slate-200 dark:border-forest-border flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-200 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                        {s.title}
                      </h3>
                    </motion.div>

                    {/* Description */}
                    <motion.p layout="position" className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {s.desc}
                    </motion.p>
                  </div>

                  {/* Footnote */}
                  <motion.div
                    layout="position"
                    className="pt-4 mt-6 border-t border-slate-100 dark:border-forest-border/60 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"
                  >
                    {s.footnote}
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
