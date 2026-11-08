import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  FileCheck2,
  Database,
  Eye,
  AlertTriangle,
  Receipt,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { BlurText } from '../animations/BlurText';
import { MotionCard } from '../animations/MotionCard';

const PRINCIPLES = [
  {
    icon: CheckCircle2,
    tag: 'Human Verification',
    title: 'User-Confirmed Food',
    desc: 'AI provides candidate detections. Users review dish names and edit portion weights before any nutrition calculation executes.',
    expanded: 'Nutrition calculations are never triggered blindly on raw machine vision. By allowing manual gram adjustments and recipe toggles, NutriLens guarantees that actual portion realities match the mathematical models.',
  },
  {
    icon: Database,
    tag: 'Zero Fabrication',
    title: 'Traceable Nutrition Data',
    desc: 'Anchored directly in peer-reviewed food composition records (FAO FCTB 2013). Unknown micronutrient values remain preserved as unknown, never converted to zero.',
    expanded: 'Missing values in nutrient composition tables are explicitly tagged as NULL rather than 0. This prevents false health claims and ensures clinical-grade integrity for micronutrient analysis.',
  },
  {
    icon: Eye,
    tag: 'Transparent Science',
    title: 'Visible Assumptions',
    desc: 'Clear disclosure of edible portion multipliers, standard moisture losses, preparation states, and recipe composition models.',
    expanded: 'Every calculation reveals its provenance: from raw-to-cooked yield factors to oil absorption coefficients in regional curries, all computational formulas remain completely transparent.',
  },
  {
    icon: FileCheck2,
    tag: 'Market Integrity',
    title: 'Honest Market Information',
    desc: 'Simulated pricing data is always clearly marked with explicit labels. We never present synthetic market records as live retailer inventory.',
    expanded: 'Bazar observations from Savar and Ashulia clusters carry explicit metadata timestamps and synthetic tags during prototype stages, preventing misleading retail price expectations.',
  },
];

export const TrustEvidenceSection: React.FC = () => {
  return (
    <section id="trust" className="py-20 sm:py-28 bg-slate-50/70 dark:bg-forest-card/30 border-y border-slate-200/70 dark:border-forest-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            Scientific Rigor & Ethics
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            <BlurText
              text="Clear insights. Visible evidence. Honest limitations."
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
            Nutrition decisions deserve more than a confident-looking number. NutriLens is designed to show the data, assumptions and market context behind its recommendations.
          </p>
        </div>

        {/* 4 Trust Principles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRINCIPLES.map((p, idx) => {
            const Icon = p.icon;
            return (
              <MotionCard
                key={idx}
                hoverLift={-8}
                hoverScale={1.02}
                className="relative p-6 sm:p-7 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm flex flex-col justify-between hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-colors duration-200 group cursor-pointer"
              >
                {({ isOpen }) => (
                  <>
                    <div className="space-y-4">
                      <motion.div layout="position" className="flex items-center justify-between">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-105 transition-all duration-200">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-sans">
                          {p.tag}
                        </span>
                      </motion.div>

                      <motion.h3
                        layout="position"
                        className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                      >
                        {p.title}
                      </motion.h3>

                      <motion.p
                        layout="position"
                        className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
                      >
                        {p.desc}
                      </motion.p>

                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className="pt-3 mt-3 border-t border-slate-100 dark:border-forest-border/80"
                        >
                          <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/40">
                            {p.expanded}
                          </p>
                        </motion.div>
                      )}
                    </div>

                    <motion.div
                      layout="position"
                      className="pt-4 mt-4 border-t border-slate-100 dark:border-forest-border/60 flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                    >
                      <span>{isOpen ? 'Show Less' : 'Click to Expand'}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-emerald-500' : ''
                        }`}
                      />
                    </motion.div>
                  </>
                )}
              </MotionCard>
            );
          })}
        </div>

        {/* Evidence Receipt Breakdown Box */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border p-6 sm:p-8 shadow-sm space-y-6 hover:border-emerald-500/40 transition-colors duration-200">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-forest-border/60">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Sample Evidence Receipt Breakdown
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-forest-card/50 border border-slate-200/60 dark:border-forest-border/60 hover:border-emerald-500/30 hover:scale-[1.02] transition-all duration-200">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Primary Source</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">FAO FCTB (2013)</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-forest-card/50 border border-slate-200/60 dark:border-forest-border/60 hover:border-emerald-500/30 hover:scale-[1.02] transition-all duration-200">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Formula Engine</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">v1.0 Deterministic</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-forest-card/50 border border-slate-200/60 dark:border-forest-border/60 hover:border-emerald-500/30 hover:scale-[1.02] transition-all duration-200">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Data Mode</span>
              <span className="font-bold text-amber-600">Synthetic Demo</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-forest-card/50 border border-slate-200/60 dark:border-forest-border/60 hover:border-emerald-500/30 hover:scale-[1.02] transition-all duration-200">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Missing Nutrients</span>
              <span className="font-bold text-emerald-600">Preserved as NULL</span>
            </div>
          </div>
        </div>

        {/* Health Disclaimer Notice */}
        <div className="max-w-4xl mx-auto p-5 rounded-2xl bg-slate-100 dark:bg-forest-card/60 border border-slate-200 dark:border-forest-border text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-white">Health Disclaimer:</span> NutriLens provides general food and nutrition information. It is not a medical diagnostic service and does not replace individualized advice from a qualified healthcare professional.
          </p>
        </div>

      </div>
    </section>
  );
};
