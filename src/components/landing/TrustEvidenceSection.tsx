import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  FileCheck2,
  Database,
  Eye,
  Receipt,
  CheckCircle2,
  RotateCw,
  RotateCcw,
} from 'lucide-react';
import { BlurText } from '../animations/BlurText';
import { MotionCard } from '../animations/MotionCard';
import { BorderGlow } from '../animations/BorderGlow';
import { CursorGrid } from '../animations/CursorGrid';
import { GlowCard } from '../ui/spotlight-card';

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
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const toggleFlip = (index: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

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

        {/* 4 Trust Principles with 3D Flip Card Effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRINCIPLES.map((p, idx) => {
            const Icon = p.icon;
            const isFlipped = Boolean(flippedCards[idx]);

            return (
              <MotionCard
                key={idx}
                hoverLift={-6}
                hoverScale={1.02}
                className="h-full rounded-3xl"
              >
                <GlowCard
                  glowColor="green"
                  customSize
                  radius={24}
                  className="relative w-full h-[330px] sm:h-[350px] cursor-pointer group select-none rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-colors duration-200"
                  onClick={() => toggleFlip(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleFlip(idx);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Flip card for ${p.title}`}
                >
                  <div
                    className="w-full h-full"
                    style={{ perspective: 1000 }}
                  >
                    <motion.div
                      className="relative w-full h-full"
                      style={{
                        transformStyle: 'preserve-3d',
                        WebkitTransformStyle: 'preserve-3d',
                      }}
                      initial={false}
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {/* FRONT FACE */}
                      <div
                        className="absolute inset-0 w-full h-full p-6 sm:p-7 rounded-3xl bg-white dark:bg-forest-card flex flex-col justify-between transition-colors duration-200"
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          zIndex: isFlipped ? 0 : 1,
                          pointerEvents: isFlipped ? 'none' : 'auto',
                        }}
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-105 transition-all duration-200">
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-sans">
                              {p.tag}
                            </span>
                          </div>

                          <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                            {p.title}
                          </h3>

                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {p.desc}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-forest-border/60 flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          <span className="flex items-center gap-1.5 font-sans">
                            <RotateCw className="w-3.5 h-3.5 text-emerald-500" />
                            Click to Flip
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Answer →
                          </span>
                        </div>
                      </div>

                      {/* BACK FACE */}
                      <div
                        className="absolute inset-0 w-full h-full p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-950 via-[#072418] to-forest-root border-2 border-emerald-500/60 shadow-xl flex flex-col justify-between text-white"
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                          WebkitTransform: 'rotateY(180deg)',
                          zIndex: isFlipped ? 1 : 0,
                          pointerEvents: isFlipped ? 'auto' : 'none',
                        }}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                              <Icon className="w-5 h-5 text-emerald-400" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-sans">
                              Evidence Answer
                            </span>
                          </div>

                          <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">
                            {p.title}
                          </h3>

                          <p className="text-xs sm:text-[13px] text-emerald-100/90 leading-relaxed">
                            {p.expanded}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs font-semibold text-emerald-300">
                          <span className="flex items-center gap-1.5 font-sans">
                            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                            Click to Flip Back
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                            Return ←
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </GlowCard>
              </MotionCard>
            );
          })}
        </div>

        {/* Evidence Receipt Breakdown Box (Green Box with Interactive Cursor Grid) */}
        <div className="max-w-5xl mx-auto relative rounded-[24px] overflow-hidden">
          <BorderGlow
            edgeSensitivity={30}
            glowColor="158 84 60"
            borderColor="rgba(16, 185, 129, 0.35)"
            backgroundColor="#071d14"
            borderRadius={24}
            glowRadius={36}
            glowIntensity={0.85}
            coneSpread={25}
            animated={false}
            colors={['#10B981', '#34D399', '#6EE7B7']}
            fillOpacity={0.25}
            className="w-full text-white shadow-2xl bg-gradient-to-br from-emerald-950 via-[#071d14] to-forest-root rounded-[24px] overflow-hidden"
          >
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
              clickPulse={false}
              hoverDrops={false}
              className="rounded-[24px] overflow-hidden"
            >
              <div className="p-6 sm:p-9 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                      <Receipt className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block">
                        Audit Trail & Data Lineage
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                        Sample Evidence Receipt Breakdown
                      </h3>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Standard
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.08] transition-all duration-200 space-y-1">
                    <span className="text-[10px] text-emerald-300/70 block uppercase font-bold tracking-wider">Primary Source</span>
                    <span className="font-bold text-sm sm:text-base text-white block">FAO FCTB (2013)</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.08] transition-all duration-200 space-y-1">
                    <span className="text-[10px] text-emerald-300/70 block uppercase font-bold tracking-wider">Formula Engine</span>
                    <span className="font-bold text-sm sm:text-base text-white block">v1.0 Deterministic</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.08] transition-all duration-200 space-y-1">
                    <span className="text-[10px] text-amber-300/70 block uppercase font-bold tracking-wider">Data Mode</span>
                    <span className="font-bold text-sm sm:text-base text-amber-300 block">Synthetic Demo</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.08] transition-all duration-200 space-y-1">
                    <span className="text-[10px] text-emerald-300/70 block uppercase font-bold tracking-wider">Missing Nutrients</span>
                    <span className="font-bold text-sm sm:text-base text-emerald-400 block">Preserved as NULL</span>
                  </div>
                </div>
              </div>
            </CursorGrid>
          </BorderGlow>
        </div>

      </div>
    </section>
  );
};
