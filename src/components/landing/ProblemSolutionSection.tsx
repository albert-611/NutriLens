import React from 'react';
import { HelpCircle, Globe2, Wallet, CheckCircle2 } from 'lucide-react';
import { BlurText } from '../animations/BlurText';
import { BorderGlow } from '../animations/BorderGlow';
import { CursorGrid } from '../animations/CursorGrid';
import { FlipCard } from '../ui/flip-card';

const PROBLEMS = [
  {
    icon: HelpCircle,
    title: 'Nutrition is difficult to interpret',
    desc: 'People recognize the food they eat, but rarely know its exact nutritional composition or how portion size and cooking methods change the actual numbers.',
    tag: 'Complexity Barrier',
    expanded: 'Cooking methods drastically shift nutrient values (e.g., deep-fried vs. steamed lentils). Without gram-weight verification, visual estimations miss actual caloric density by 40–60%. NutriLens grounds your plate in verified compositional records (FAO FCTB 2013).',
    backTag: 'FAO FCTB Evidence',
    backTitle: 'Ground Truth Composition',
    backImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    backImageAlt: 'Nutritional plate breakdown with verified composition',
  },
  {
    icon: Globe2,
    title: 'Generic guidance misses local context',
    desc: 'Western food apps fail in Bangladesh. They lack familiar regional dishes, local Bangla names, cooking states, and staple dietary habits.',
    tag: 'Context Void',
    expanded: 'International apps recommend unfamiliar foods like kale salads or protein isolate smoothies. NutriLens natively recognizes authentic dishes like Rui macher jhol, Shorshe Ilish, and diverse bhortas with dual Bangla/English names.',
    backTag: 'Local Cultural Lineage',
    backTitle: 'Bangla Dish & Alias Grounding',
    backImage: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    backImageAlt: 'Authentic Bangladeshi meal with parboiled rice and curry',
  },
  {
    icon: Wallet,
    title: 'Nutrition and affordability are disconnected',
    desc: 'Advice is useless if it ignores household budgets, wet market price fluctuations, and the ingredients families actually have in their pantry.',
    tag: 'Budget Gap',
    expanded: 'Nutrition advice cannot be acted upon if it ignores grocery budgets. NutriLens pairs nutritional analysis with observed daily bazar prices in Savar and Ashulia to propose affordable, accessible alternatives within your actual pantry budget.',
    backTag: 'Daily Wet Market Grounding',
    backTitle: 'Your Local Market Price Lineage',
    backImage: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=600&q=80',
    backImageAlt: 'Local wet market fresh produce and ingredients',
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
    <section id="problem-solution" className="py-20 sm:py-28 relative overflow-hidden">
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

        {/* 3 Problem Cards with 3D FlipCard and Mouse-Tracking Tilt */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {PROBLEMS.map((prob, idx) => {
            const Icon = prob.icon;
            return (
              <div key={idx} className="w-full flex justify-center">
                <FlipCard
                  cardNumber={idx + 1}
                  frontTag={prob.tag}
                  frontTitle={prob.title}
                  frontDescription={prob.desc}
                  frontIcon={<Icon className="w-6 h-6" />}
                  backTag={prob.backTag}
                  backTitle={prob.backTitle}
                  backContent={prob.expanded}
                  backImage={prob.backImage}
                  backImageAlt={prob.backImageAlt}
                  className="w-full h-[400px] sm:h-[420px] max-w-none mx-0 my-0"
                />
              </div>
            );
          })}
        </div>

        {/* Solution Bridge Banner */}
        <div className="relative">
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
              clickPulse
              className="rounded-[24px] overflow-hidden"
            >
              <div className="p-6 sm:p-10 space-y-6">
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
          </BorderGlow>
        </div>

      </div>
    </section>
  );
};
