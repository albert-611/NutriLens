import React, { useState } from 'react';
import {
  LayoutDashboard,
  Camera,
  CheckSquare,
  FileText,
  Store,
  Sparkles,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BlurText } from '../animations/BlurText';
import { GlowCard } from '../ui/spotlight-card';

interface PreviewTab {
  id: string;
  name: string;
  icon: React.ElementType;
  route: string;
  title: string;
  desc: string;
  badge: string;
  previewContent: React.ReactNode;
}

export const ProductPreviewSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('scanner');

  const TABS: PreviewTab[] = [
    {
      id: 'scanner',
      name: 'Plate Scanner',
      icon: Camera,
      route: '/app/analyze',
      title: 'Multimodal Food Recognition',
      desc: 'Point your camera at any meal plate. NutriLens segments visible components, infers cooking state, and estimates initial portions in grams.',
      badge: 'Step 1 of 4',
      previewContent: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-forest-card border border-slate-200 dark:border-forest-border">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-sans tracking-wide">
              INPUT: plate_photo_01.png
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-sans tracking-wider">
              GEMINI FLASH VISION
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-card/40 border border-slate-200 dark:border-forest-border">
              <span className="font-bold text-slate-800 dark:text-slate-200">Parboiled Rice</span>
              <p className="text-[11px] text-slate-500">200g (boiled) • 98.4% conf</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-card/40 border border-slate-200 dark:border-forest-border">
              <span className="font-bold text-slate-800 dark:text-slate-200">Rui Macher Jhol</span>
              <p className="text-[11px] text-slate-500">180g (gravy) • 94.2% conf</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'confirm',
      name: 'User Confirmation',
      icon: CheckSquare,
      route: '/app/confirm',
      title: 'Human-in-the-Loop Verification',
      desc: 'AI proposes candidate foods; you verify and correct weights, cooking methods, and missing items before nutrition calculations run.',
      badge: 'Step 2 of 4',
      previewContent: (
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
            ✓ 4 Food Candidates verified against FAO Food Composition Table
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-100 dark:bg-forest-card">
              <span className="font-medium">Red Lentil Soup (Masoor Dal)</span>
              <span className="font-bold text-emerald-600 tabular-nums font-sans">150 g</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-100 dark:bg-forest-card">
              <span className="font-medium">Spinach Bhaji (Palong Shak)</span>
              <span className="font-bold text-emerald-600 tabular-nums font-sans">80 g</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'report',
      name: 'Evidence Report',
      icon: FileText,
      route: '/app/report',
      title: 'Deterministic Macro Calculation',
      desc: 'Authoritative calories, protein, carbs, and fat derived directly from confirmed portions and official compositional data.',
      badge: 'Step 3 of 4',
      previewContent: (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-forest-card">
              <span className="text-[10px] text-slate-500 block uppercase">Energy</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">709 kcal</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-forest-card">
              <span className="text-[10px] text-slate-500 block uppercase">Protein</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">44.4 g</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-forest-card">
              <span className="text-[10px] text-slate-500 block uppercase">Carbs</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">84.5 g</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-forest-card">
              <span className="text-[10px] text-slate-500 block uppercase">Fat</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">21.1 g</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-sans text-center">
            Source: FAO Food Composition Table for Bangladesh (2013)
          </p>
        </div>
      ),
    },
    {
      id: 'rescue',
      name: 'Meal Alternatives',
      icon: Sparkles,
      route: '/app/meal-rescue',
      title: 'Constraint-Aware Substitution',
      desc: 'Pivot to an affordable, familiar next meal that satisfies budget limits while meeting target macronutrient goals.',
      badge: 'Step 4 of 4',
      previewContent: (
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border flex justify-between items-center">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Egg & Lentil Curry Pivot</span>
              <span className="text-[11px] text-slate-500">Replaces beef • Saves ৳ 180.00</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full tabular-nums font-sans">
              ৳ 65.00 / meal
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-forest-card text-[11px] text-slate-600 dark:text-slate-300">
            ✓ 28g protein retained • Uses common kitchen spices
          </div>
        </div>
      ),
    },
  ];

  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <section id="preview" className="py-20 sm:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            Prototype Preview
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            <BlurText
              text="See NutriLens in action."
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
            Experience the working interface across each milestone of the Vision-to-Market loop.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Preview Display */}
        <GlowCard
          glowColor="green"
          customSize
          radius={24}
          className="max-w-3xl mx-auto rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border p-6 sm:p-10 shadow-lg space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100 dark:border-forest-border/60">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1 font-sans">
                {currentTab.badge}
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {currentTab.title}
              </h3>
            </div>
            <Link
              to={currentTab.route}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Open in App <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {currentTab.desc}
          </p>

          {/* Interactive Mock Canvas */}
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border">
            {currentTab.previewContent}
          </div>
        </GlowCard>

      </div>
    </section>
  );
};
