import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronUp } from 'lucide-react';
import { Button } from '../common/Button';
import { BlurText } from '../animations/BlurText';
import { CursorGrid } from '../animations/CursorGrid';
import { BorderGlow } from '../animations/BorderGlow';
import { SpecularButton } from '../animations/SpecularButton';

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
              clickPulse={false}
              hoverDrops={false}
              className="rounded-[inherit]"
            >
              <div className="p-8 sm:p-14 space-y-8 max-w-3xl mx-auto">
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
                    <SpecularButton
                      size="lg"
                      radius={16}
                      tint="#10b981"
                      tintOpacity={1}
                      textColor="#ffffff"
                      lineColor="#6ee7b7"
                      baseColor="#059669"
                      intensity={1.2}
                      idleIntensity={0.45}
                      shineSize={12}
                      shineFade={36}
                      thickness={1.3}
                      glow={1.5}
                      followMouse
                      proximity={250}
                      className="w-full sm:w-auto font-bold shadow-lg shadow-emerald-500/30"
                    >
                      <span>Explore NutriLens</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </SpecularButton>
                  </Link>
                  <a href="#how-it-works" className="w-full sm:w-auto">
                    <SpecularButton
                      size="lg"
                      radius={16}
                      tint="rgba(16, 185, 129, 0.08)"
                      tintOpacity={1}
                      textColor="#ffffff"
                      lineColor="#6ee7b7"
                      baseColor="#059669"
                      intensity={1.2}
                      idleIntensity={0.45}
                      shineSize={12}
                      shineFade={36}
                      thickness={1.3}
                      glow={1.5}
                      followMouse
                      proximity={250}
                      className="w-full sm:w-auto border border-emerald-500/50 hover:border-emerald-400 text-emerald-100 font-bold shadow-lg shadow-emerald-500/10"
                    >
                      <span>Review How It Works</span>
                    </SpecularButton>
                  </a>
                </div>

                <p className="text-xs text-emerald-300/70 pt-4">
                  NutriLens includes secure user account registration with Savar and Ashulia local market observations.
                </p>
              </div>
            </CursorGrid>
          </BorderGlow>
        </div>
      </div>
    </section>
  );
};
