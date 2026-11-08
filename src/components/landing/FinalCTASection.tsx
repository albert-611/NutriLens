import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronUp, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { BlurText } from '../animations/BlurText';
import { CursorGrid } from '../animations/CursorGrid';
import { BorderGlow } from '../animations/BorderGlow';

export const FinalCTASection: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <BorderGlow
            edgeSensitivity={30}
            glowColor="158 84 60"
            borderColor="rgba(16, 185, 129, 0.35)"
            backgroundColor="#0c1813"
            borderRadius={24}
            glowRadius={36}
            glowIntensity={0.85}
            coneSpread={25}
            animated={false}
            colors={['#10B981', '#34D399', '#6EE7B7']}
            fillOpacity={0.25}
            className="w-full text-white shadow-2xl text-center bg-gradient-to-br from-forest-root via-forest-card to-emerald-950"
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
              clickPulse
              className="rounded-[inherit]"
            >
              <div className="p-8 sm:p-14 space-y-8 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold tracking-wider uppercase border border-emerald-500/30 mx-auto">
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
            </CursorGrid>
          </BorderGlow>
        </div>
      </div>
    </section>
  );
};
