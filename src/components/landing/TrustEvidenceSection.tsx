import React from 'react';
import {
  ShieldCheck,
  FileCheck2,
  Database,
  Eye,
  AlertTriangle,
  Receipt,
  CheckCircle2,
} from 'lucide-react';
import { BlurText } from '../animations/BlurText';

const PRINCIPLES = [
  {
    icon: CheckCircle2,
    title: 'User-Confirmed Food',
    desc: 'AI provides candidate detections. Users review dish names and edit portion weights before any nutrition calculation executes.',
  },
  {
    icon: Database,
    title: 'Traceable Nutrition Data',
    desc: 'Anchored directly in peer-reviewed food composition records (FAO FCTB 2013). Unknown micronutrient values remain preserved as unknown, never converted to zero.',
  },
  {
    icon: Eye,
    title: 'Visible Assumptions',
    desc: 'Clear disclosure of edible portion multipliers, standard moisture losses, preparation states, and recipe composition models.',
  },
  {
    icon: FileCheck2,
    title: 'Honest Market Information',
    desc: 'Simulated pricing data is always clearly marked with explicit labels. We never present synthetic market records as live retailer inventory.',
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
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Evidence Receipt Breakdown Box */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-forest-border/60">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Sample Evidence Receipt Breakdown
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-card/40">
              <span className="text-[10px] text-slate-400 block uppercase">Primary Source</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">FAO FCTB (2013)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-card/40">
              <span className="text-[10px] text-slate-400 block uppercase">Formula Engine</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">v1.0 Deterministic</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-card/40">
              <span className="text-[10px] text-slate-400 block uppercase">Data Mode</span>
              <span className="font-bold text-amber-600">Synthetic Demo</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-card/40">
              <span className="text-[10px] text-slate-400 block uppercase">Missing Nutrients</span>
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
