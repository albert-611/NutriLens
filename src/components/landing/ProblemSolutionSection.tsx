import React from 'react';
import { HelpCircle, Globe2, Wallet, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BlurText } from '../animations/BlurText';
import { CursorGrid } from '../animations/CursorGrid';

const PROBLEMS = [
  {
    icon: HelpCircle,
    title: 'Nutrition is difficult to interpret',
    desc: 'People recognize the food they eat, but rarely know its exact nutritional composition or how portion size and cooking methods change the actual numbers.',
    tag: 'Complexity Barrier',
  },
  {
    icon: Globe2,
    title: 'Generic guidance misses local context',
    desc: 'Western food apps fail in Bangladesh. They lack familiar regional dishes, local Bangla names, cooking states, and staple dietary habits.',
    tag: 'Context Void',
  },
  {
    icon: Wallet,
    title: 'Nutrition and affordability are disconnected',
    desc: 'Advice is useless if it ignores household budgets, wet market price fluctuations, and the ingredients families actually have in their pantry.',
    tag: 'Budget Gap',
  },
];

const SOLUTION_PILLARS = [
  'Visual food understanding with candidate detection',
  'User-confirmed food and portion details',
  'Nutrition estimates based on reviewed food records (FAO FCTB 2013)',
  'Local market observations from Savar and Ashulia wet markets',
  'Budget- and preference-aware meal alternatives',
  'Consolidated shopping basket rounded to local trade units',
];

export const ProblemSolutionSection: React.FC = () => {
  return (
    <section id="problem-solution" className="py-20 sm:py-28 bg-slate-50/70 dark:bg-forest-card/30 border-y border-slate-200/70 dark:border-forest-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            <BlurText
              text="Making better food decisions shouldn't be complicated."
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
            People make food choices every day, but understanding nutrition, local food options and affordability often requires information from disconnected places.
          </p>
        </div>

        {/* 3 Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {PROBLEMS.map((prob, idx) => {
            const Icon = prob.icon;
            return (
              <div
                key={idx}
                className="relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-forest-card text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-forest-border">
                      {prob.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {prob.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {prob.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Solution Bridge Banner */}
        <div className="relative rounded-3xl bg-gradient-to-br from-emerald-900 to-forest-root text-white border border-emerald-700/40 shadow-xl overflow-hidden">
          <CursorGrid
            cellSize={60}
            color="#ffffff"
            highlight="area"
            gridStyle="lines"
            radius={140}
            holdTime={400}
            fadeDuration={800}
            fillOpacity={0.06}
            gridOpacity={0.08}
            spotlight={0.6}
            clickPulse
          >
            <div className="relative z-10 p-8 sm:p-10 space-y-6">
              <div className="max-w-3xl space-y-2">
                <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
                  The Connected Solution
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  NutriLens connects the plate to the next practical food decision.
                </h3>
                <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
                  Instead of treating nutrition in isolation, NutriLens bridges computer vision, verified compositional tables, and local wet market prices into a closed loop:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {SOLUTION_PILLARS.map((pillar, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-emerald-50"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{pillar}</span>
                  </div>
                ))}
              </div>
            </div>
          </CursorGrid>
        </div>

      </div>
    </section>
  );
};
