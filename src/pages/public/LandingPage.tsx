import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Store,
  Receipt,
  Scale,
  ChefHat,
  Search,
  Layers,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { PlateScannerGraphic } from '../../components/landing/PlateScannerGraphic';
import { Button } from '../../components/common/Button';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/gsap';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'dashboard' | 'confirm' | 'report' | 'bazar'>('dashboard');

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // 1. Hero Entrance Animation
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-badge', { y: -15, opacity: 0, duration: 0.6 })
        .from('.hero-title', { y: 25, opacity: 0, duration: 0.8 }, '-=0.3')
        .from('.hero-desc', { y: 20, opacity: 0, duration: 0.7 }, '-=0.4')
        .from('.hero-cta', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
        .from('.hero-visual', { scale: 0.94, opacity: 0, duration: 1 }, '-=0.6');

      // 2. ScrollTrigger Section Reveals
      gsap.utils.toArray<HTMLElement>('.reveal-section').forEach((sec) => {
        gsap.from(sec, {
          scrollTrigger: {
            trigger: sec,
            start: 'top 85%',
          },
          y: 35,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
        });
      });

      // 3. Staggered feature cards
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: '#features',
          start: 'top 80%',
        },
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power2.out',
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      title: 'Bangla Plate Intelligence',
      titleBn: 'বাংলা প্লেট বুদ্ধিমত্তা',
      desc: 'Accurately recognizes local dishes—parboiled rice, lentil curries, freshwater fish, and leafy shak—distinguishing cooked from raw states.',
      icon: ChefHat,
    },
    {
      title: 'Bazar-to-Plate AI',
      titleBn: 'বাজার-টু-প্লেট এআই',
      desc: 'Connects dietary recommendations directly to local Savar and Ashulia commodity prices and stock availability.',
      icon: Store,
    },
    {
      title: 'Nutrient Gap Optimizer',
      titleBn: 'পুষ্টি ব্যবধান অপ্টিমাইজার',
      desc: 'Highlights food-group opportunities against personal goals without making clinical diagnosis or medical deficiency claims.',
      icon: Scale,
    },
    {
      title: 'Constraint-Aware Meal Rescue',
      titleBn: 'সীমাবদ্ধতা-সচেতন মিল রেসকিউ',
      desc: 'Rebalances meals to meet tight daily budgets, available cooking time, and declared allergens while preserving local taste.',
      icon: Sparkles,
    },
    {
      title: 'Cuisine-Preserving Substitution',
      titleBn: 'ঐতিহ্যবাহী খাবার প্রতিস্থাপন',
      desc: 'Swaps expensive proteins for affordable local alternatives—like replacing beef with eggs or lentils—without breaking culinary habits.',
      icon: Layers,
    },
    {
      title: 'Smart Shopping Basket',
      titleBn: 'স্মার্ট বাজার তালিকা',
      desc: 'Merges recipe ingredients, deducts pantry stock, and rounds to local market packaging (hali, kg, bunch) for accurate checkout costs.',
      icon: ShoppingBag,
    },
    {
      title: 'Evidence Receipt',
      titleBn: 'প্রমাণিত পুষ্টি রশিদ',
      desc: 'Every calorie and nutrient value is mathematically proven against FAO FCTB (2013) records. Unknown values are never coerced to zero.',
      icon: Receipt,
    },
    {
      title: 'Basic RAG Assistant',
      titleBn: 'তথ্যসূত্রসহ পুষ্টি সহকারী',
      desc: 'Provides grounded answers derived strictly from official DGHS and FAO guidelines with verifiable citation links.',
      icon: Search,
    },
  ];

  return (
    <div ref={rootRef} className="min-h-screen flex flex-col bg-surface-lightRoot dark:bg-forest-root selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      
      {/* 1. Public Top Navigation */}
      <PublicNavbar />

      <main className="flex-1">
        
        {/* 2. Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Hero Copy */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                
                {/* Badge */}
                <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{t('landing.badge')}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-500/20">
                    Savar & Ashulia
                  </span>
                </div>

                {/* Main Headline */}
                <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans leading-[1.15]">
                  {t('landing.hero_title')}{' '}
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {t('landing.hero_title_highlight')}
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="hero-desc text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  {t('landing.hero_subtitle')}
                </p>

                {/* CTAs */}
                <div className="hero-cta flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link to="/app" className="w-full sm:w-auto">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-lg shadow-emerald-600/20" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                      {t('landing.cta_explore')}
                    </Button>
                  </Link>

                  <a href="#how-it-works" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      {t('landing.cta_how_it_works')}
                    </Button>
                  </a>
                </div>

                {/* Quick Trust Highlights */}
                <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    FAO FCTB (2013) Provenance
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    $NULL \ne 0$ Integrity
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Simulated Savar Demo Bazar
                  </span>
                </div>
              </div>

              {/* Hero Visual: Interactive Plate Scanner */}
              <div className="hero-visual lg:col-span-5 flex justify-center">
                <PlateScannerGraphic />
              </div>
            </div>
          </div>
        </section>

        {/* 3. The Problem Section */}
        <section className="reveal-section py-20 bg-slate-50 dark:bg-forest-card/40 border-y border-slate-200/80 dark:border-forest-border/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
              {t('landing.problem_tag')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {t('landing.problem_title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left pt-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-2">
                <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Blind to Local Preparation States
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('landing.problem_p1')}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-2">
                <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Disconnected from Bazar Realities
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('landing.problem_p2')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. How NutriLens Works (4-Step Closed Loop) */}
        <section id="how-it-works" className="reveal-section py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                {t('landing.steps_tag')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                {t('landing.steps_title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm relative group hover:border-emerald-500/50 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center mb-4">
                  01
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                  {t('landing.step1_title')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('landing.step1_desc')}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm relative group hover:border-emerald-500/50 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center mb-4">
                  02
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                  {t('landing.step2_title')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('landing.step2_desc')}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm relative group hover:border-emerald-500/50 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center mb-4">
                  03
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                  {t('landing.step3_title')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('landing.step3_desc')}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm relative group hover:border-emerald-500/50 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center mb-4">
                  04
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                  {t('landing.step4_title')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('landing.step4_desc')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Core Intelligence Features Grid */}
        <section id="features" className="reveal-section py-20 bg-slate-50 dark:bg-forest-card/30 border-y border-slate-200/80 dark:border-forest-border/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-16">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                Capabilities
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Engineered for Local Nutrition Realities
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feat) => (
                <div
                  key={feat.title}
                  className="feature-card p-6 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border hover:border-emerald-500/50 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <feat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {feat.title}
                      </h3>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {feat.titleBn}
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Savar / Ashulia Local Demonstration Benchmark */}
        <section id="local-bazar" className="reveal-section py-20 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  <Store className="w-3.5 h-3.5" />
                  <span>Demonstration Markets</span>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  Savar & Ashulia Local Bazar Intelligence
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  NutriLens anchors meal recommendations to real-world purchase units. Instead of abstract grams, the smart shopping engine rounds to local trade units (e.g., 4-piece egg hali, 1 kg coarse lentil sacks, 500 ml mustard oil bottles).
                </p>
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-forest-card border border-slate-200 dark:border-forest-border text-xs space-y-1">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Data Integrity Notice:
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    All prices and stock values shown are SIMULATED DEMO DATA for prototype testing. Never treated as live market guarantees.
                  </p>
                </div>
              </div>

              {/* Sample Bazar Table Card */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-forest-border/70 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        Savar Demo Market Benchmark
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Observed November 2026 • Simulated Data
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      BDT Currency
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-forest-border/50 text-xs">
                    <div className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-forest-cardHover/50">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">Chicken Eggs (Farm Fresh)</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Savar Farm Stall • In Stock</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 dark:text-white">৳ 48.00</span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">4 pieces (hali)</p>
                      </div>
                    </div>

                    <div className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-forest-cardHover/50">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">Red Lentils (Masoor Dal)</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Bismillah Grocery • In Stock</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 dark:text-white">৳ 120.00</span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">1 kg pack</p>
                      </div>
                    </div>

                    <div className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-forest-cardHover/50">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">Rohu Fish (Medium Pond)</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Savar Fish Market • In Stock</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 dark:text-white">৳ 320.00</span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">1 kg fresh</p>
                      </div>
                    </div>

                    <div className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-forest-cardHover/50">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">Winter Spinach (Palong Shak)</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Savar Sabzi Arat • In Stock</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 dark:text-white">৳ 20.00</span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">1 bunch (~300g)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Product Preview Tabs Section */}
        <section id="preview" className="reveal-section py-20 bg-slate-50 dark:bg-forest-card/40 border-t border-slate-200/80 dark:border-forest-border/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                Interface Preview
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Designed for Calm, Focused Utility
              </h2>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
              {(['dashboard', 'confirm', 'report', 'bazar'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActivePreviewTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all duration-150 ${
                    activePreviewTab === tab
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-forest-card text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-forest-border hover:bg-slate-100 dark:hover:bg-forest-cardHover'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Preview Frame */}
            <div className="rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-2xl p-6 sm:p-8">
              {activePreviewTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-forest-border/60 gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">Good morning, Tariqul</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Savar Student Mess • Budget Focus</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        Daily Budget: ৳150
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Calories Tracked</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">1,480 kcal</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">Sourced from 3 logged meals</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Protein Intake</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">54.2 g</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">Lentils, Eggs, Fish</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Est. Daily Bazar Spend</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">৳ 95.70</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">Within ৳150 daily budget</p>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'confirm' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-forest-border/60">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Candidate Review</h4>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">User Confirmation Required</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">Cooked White Rice (Parboiled)</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">State: Boiled • FAO FCTB-01-001</p>
                      </div>
                      <span className="font-bold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        200 g
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">Red Lentils Soup (Masoor Dal)</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">State: Boiled/Tempered • FAO FCTB-02-001</p>
                      </div>
                      <span className="font-bold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        150 g
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'report' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-forest-border/60">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Evidence Receipt: Lunch</h4>
                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">v1.0.0-fao_bangladesh</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/50">
                      <p className="text-slate-500 dark:text-slate-400">Total Energy</p>
                      <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">407 kcal</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/50">
                      <p className="text-slate-500 dark:text-slate-400">Protein</p>
                      <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">17.1 g</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/50">
                      <p className="text-slate-500 dark:text-slate-400">Carbohydrates</p>
                      <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">79.2 g</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/50">
                      <p className="text-slate-500 dark:text-slate-400">Dietary Fibre</p>
                      <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">5.9 g</p>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'bazar' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-forest-border/60">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Ashulia Bazar Observations</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">SIMULATED DEMO DATA</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60 flex items-center justify-between">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Broiler Chicken (500 g half pack)</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">৳ 100.00</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60 flex items-center justify-between">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Red Amaranth (Lal Shak bunch)</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">৳ 20.00</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 8. Final CTA Section */}
        <section className="reveal-section py-20 bg-emerald-600 dark:bg-forest-card text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Make Every Meal a Smarter Decision.
            </h2>
            <p className="text-base text-emerald-100 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Explore the closed Vision-to-Market nutrition loop designed specifically for Bangladeshi food habits and local market realities.
            </p>
            <div className="pt-2">
              <Link to="/app">
                <Button variant="secondary" size="lg" className="bg-white text-emerald-800 hover:bg-emerald-50 dark:bg-white dark:text-slate-900 font-bold shadow-lg" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                  Start Exploring NutriLens
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* 9. Public Footer */}
      <PublicFooter />
    </div>
  );
};
