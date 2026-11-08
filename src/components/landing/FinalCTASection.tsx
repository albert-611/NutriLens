import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronUp, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { BlurText } from '../animations/BlurText';

export const FinalCTASection: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative p-10 sm:p-16 rounded-3xl bg-gradient-to-br from-forest-root via-forest-card to-emerald-950 text-white border border-emerald-800/40 shadow-2xl text-center space-y-8 overflow-hidden">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold tracking-wider uppercase border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ready for Exploration</span>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.15]">
              <BlurText
                text="Make Every Meal a Smarter Decision."
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
                className="inline-flex flex-wrap justify-center text-white"
              />
            </h2>
            <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed">
              Explore how food understanding, nutrition evidence and local market context can work together to make everyday food choices more practical.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/app" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/25"
              >
                Explore NutriLens
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-emerald-700/60 text-emerald-100 hover:bg-emerald-800/40"
              >
                Review How It Works
              </Button>
            </a>
          </div>

          <p className="text-xs text-emerald-300/70 pt-4">
            Prototype demo includes pre-configured personas with Savar and Ashulia local market observations.
          </p>

        </div>
      </div>
    </section>
  );
};
