import React, { useState, useRef } from 'react';
import { Store, TrendingDown, ShoppingBag, Calendar, Info, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { Button } from '../common/Button';
import { BlurText } from '../animations/BlurText';
import { GlowCard } from '../ui/spotlight-card';

interface MarketComparison {
  food: string;
  foodBn: string;
  unit: string;
  savarPrice: string;
  ashuliaPrice: string;
  trend: string;
}

const PRICE_SAMPLES: MarketComparison[] = [
  { food: 'Farm Chicken Eggs', foodBn: 'ফার্মের মুরগির ডিম', unit: 'hali (4 pcs)', savarPrice: '৳ 48.00', ashuliaPrice: '৳ 50.00', trend: '-4%' },
  { food: 'Red Lentils (Masoor Dal)', foodBn: 'মসুর ডাল', unit: 'kg', savarPrice: '৳ 140.00', ashuliaPrice: '৳ 142.00', trend: '-1%' },
  { food: 'Rohu Fish (Medium)', foodBn: 'রুই মাছ', unit: 'kg', savarPrice: '৳ 320.00', ashuliaPrice: '৳ 340.00', trend: '-6%' },
  { food: 'Spinach (Palong Shak)', foodBn: 'পালং শাক', unit: 'ati (bundle)', savarPrice: '৳ 15.00', ashuliaPrice: '৳ 16.00', trend: '-6%' },
  { food: 'Parboiled Rice (Miniket)', foodBn: 'মিনিকেট চাল', unit: 'kg', savarPrice: '৳ 68.00', ashuliaPrice: '৳ 70.00', trend: '-3%' },
];

export const BazarToPlateSection: React.FC = () => {
  const [selectedMarket, setSelectedMarket] = useState<'savar' | 'ashulia'>('savar');
  const tableRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(tableRef, { once: true, amount: 0.25 });

  return (
    <section id="local-bazar" className="py-20 sm:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            Market Affordability Engine
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            <BlurText
              text="Good food decisions should make sense for your budget."
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
            NutriLens connects meal choices with local food price observations, helping users explore familiar alternatives that fit their preferences and budget.
          </p>
        </div>

        {/* Market Pricing Stage */}
        <GlowCard
          glowColor="green"
          customSize
          radius={24}
          className="max-w-4xl mx-auto rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border p-6 sm:p-8 shadow-sm space-y-6"
        >
          {/* Market Selection Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-forest-border/60">
            <div>
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Local Wet Market Price Observations
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Targeting Savar and Ashulia consumer catchment zones
              </p>
            </div>

            {/* Toggle Market with Smooth Animated Indicator */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-forest-card border border-slate-200 dark:border-forest-border text-xs font-medium relative">
              <button
                onClick={() => setSelectedMarket('savar')}
                className={`relative px-3.5 py-1.5 rounded-lg transition-colors z-10 ${
                  selectedMarket === 'savar'
                    ? 'text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {selectedMarket === 'savar' && (
                  <motion.div
                    layoutId="activeBazarTab"
                    className="absolute inset-0 rounded-lg bg-white dark:bg-forest-cardHover shadow-sm border border-slate-200/60 dark:border-forest-border -z-10"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
                <span>Savar Bazar</span>
              </button>
              <button
                onClick={() => setSelectedMarket('ashulia')}
                className={`relative px-3.5 py-1.5 rounded-lg transition-colors z-10 ${
                  selectedMarket === 'ashulia'
                    ? 'text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {selectedMarket === 'ashulia' && (
                  <motion.div
                    layoutId="activeBazarTab"
                    className="absolute inset-0 rounded-lg bg-white dark:bg-forest-cardHover shadow-sm border border-slate-200/60 dark:border-forest-border -z-10"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
                <span>Ashulia Bazar</span>
              </button>
            </div>
          </div>

          {/* Pricing Table with Staggered Row Animation on Reveal and Tab Change */}
          <div ref={tableRef} className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-forest-border/60 text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase text-[11px] font-sans">
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3">Trade Unit</th>
                  <th className="py-2.5 px-3">Observed Price</th>
                  <th className="py-2.5 px-3">Variance</th>
                </tr>
              </thead>
              <AnimatePresence mode="wait">
                <motion.tbody
                  key={selectedMarket}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  exit="exit"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.06,
                        delayChildren: 0.03,
                      },
                    },
                    exit: {
                      opacity: 0,
                      y: -6,
                      transition: { duration: 0.14 },
                    },
                  }}
                  className="divide-y divide-slate-100 dark:divide-forest-border/40"
                >
                  {PRICE_SAMPLES.map((row) => {
                    const currentPrice = selectedMarket === 'savar' ? row.savarPrice : row.ashuliaPrice;
                    return (
                      <motion.tr
                        key={row.food}
                        variants={{
                          hidden: { opacity: 0, y: 14, filter: 'blur(3px)' },
                          visible: {
                            opacity: 1,
                            y: 0,
                            filter: 'blur(0px)',
                            transition: {
                              duration: 0.34,
                              ease: [0.25, 1, 0.5, 1],
                            },
                          },
                        }}
                        className="hover:bg-slate-50/50 dark:hover:bg-forest-card/50 transition-colors"
                      >
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {row.food}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {row.foodBn}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-600 dark:text-slate-300 font-sans">
                          {row.unit}
                        </td>
                        <td className="py-3 px-3 font-bold tabular-nums text-emerald-600 dark:text-emerald-400 font-sans">
                          <motion.span
                            key={currentPrice}
                            initial={{ scale: 1.15, opacity: 0.7 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="inline-block"
                          >
                            {currentPrice}
                          </motion.span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 font-bold tabular-nums text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-sans">
                            <TrendingDown className="w-3 h-3" />
                            {row.trend}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </motion.tbody>
              </AnimatePresence>
            </table>
          </div>

          {/* VERIFIED WFP RETAIL DATA DISCLOSURE FOOTER */}
          <div className="pt-4 border-t border-slate-100 dark:border-forest-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Observation date: 2026-11-08 •{' '}
                {selectedMarket === 'savar' ? 'Savar Municipality Market Cluster' : 'Ashulia Wet Market Belt'}
              </span>
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] tracking-wider border border-emerald-500/25 font-sans">
              <span>WFP 2026 RETAIL PRICES</span>
            </div>
          </div>
        </GlowCard>

        {/* CTA to Bazar View in App */}
        <div className="text-center pt-2">
          <Link to="/app/bazar">
            <Button variant="outline" size="md" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
              Explore Full Bazar Price Intelligence
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
};
