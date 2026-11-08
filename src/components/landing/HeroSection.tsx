import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { PlateScannerGraphic } from './PlateScannerGraphic';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-2 pb-16 sm:pt-3 sm:pb-20 lg:pt-4 lg:pb-24 overflow-hidden">
      {/* Background radial ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Copy and CTAs */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left z-10">
            
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Personalized, Localized Nutrition Intelligence</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              Your Food. <br className="hidden sm:inline" />
              Your Nutrition. <br className="hidden sm:inline" />
              <span className="text-emerald-600 dark:text-emerald-400">
                Your Intelligence.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Understand what's on your plate, explore its nutritional value, and discover more affordable ways to eat well with food guidance shaped around local ingredients and your preferences.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <Link to="/app" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                  className="w-full sm:w-auto shadow-lg shadow-emerald-900/20"
                >
                  Explore NutriLens
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  icon={<ChevronDown className="w-4 h-4" />}
                  iconPosition="right"
                  className="w-full sm:w-auto"
                >
                  See How It Works
                </Button>
              </a>
            </div>

            {/* Trust Context Footnote */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Built around familiar foods, local context and transparent nutrition data.</span>
            </div>
          </div>

          {/* Right Column: High-Quality Plate Scanner Visual with Real Photo */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end z-10">
            <PlateScannerGraphic />
          </div>

        </div>
      </div>
    </section>
  );
};
