import React, { useState } from 'react';
import { Database, Store, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FoodItem {
  id: string;
  name: string;
  nameBn: string;
  label: string;
  confidence: number;
  weight: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  cost: string;
  // Bounding box in SVG coordinate space (viewBox: 40 380 1776 1776)
  box: { x: number; y: number; width: number; height: number };
}

const DETECTED_ITEMS: FoodItem[] = [
  {
    id: 'fish',
    name: 'Rohu Fish Curry (Rui Macher Jhol)',
    nameBn: 'রুই মাছের ঝোল',
    label: 'Rui Mach Curry',
    confidence: 0.942,
    weight: '180 g',
    calories: '243 kcal',
    protein: '24.8 g',
    carbs: '2.1 g',
    fat: '14.2 g',
    cost: '৳ 57.60',
    box: { x: 940, y: 630, width: 700, height: 690 },
  },
  {
    id: 'dal',
    name: 'Red Lentil Soup (Masoor Dal)',
    nameBn: 'মসুর ডাল ঝোল',
    label: 'Masoor Dal',
    confidence: 0.965,
    weight: '150 g',
    calories: '147 kcal',
    protein: '11.7 g',
    carbs: '21.4 g',
    fat: '2.2 g',
    cost: '৳ 18.00',
    box: { x: 120, y: 580, width: 630, height: 590 },
  },
  {
    id: 'shak',
    name: 'Spinach Bhaji (Palong Shak)',
    nameBn: 'পালং শাক ভাজি',
    label: 'Palong Shak',
    confidence: 0.918,
    weight: '80 g',
    calories: '59 kcal',
    protein: '2.5 g',
    carbs: '3.8 g',
    fat: '4.1 g',
    cost: '৳ 6.50',
    box: { x: 690, y: 490, width: 440, height: 420 },
  },
  {
    id: 'rice',
    name: 'Steamed Parboiled Rice (Sada Bhat)',
    nameBn: 'সিদ্ধ সাদা ভাত',
    label: 'Parboiled Rice',
    confidence: 0.984,
    weight: '200 g',
    calories: '260 kcal',
    protein: '5.4 g',
    carbs: '57.2 g',
    fat: '0.6 g',
    cost: '৳ 13.60',
    box: { x: 280, y: 1190, width: 1260, height: 790 },
  },
];

export const PlateScannerGraphic: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('fish');
  const [showHud, setShowHud] = useState<boolean>(true);

  const activeItem = DETECTED_ITEMS.find((item) => item.id === activeId) || DETECTED_ITEMS[0];

  return (
    <div className="relative w-full max-w-lg mx-auto rounded-3xl bg-surface-lightRoot dark:bg-forest-card/90 border border-slate-200/90 dark:border-forest-border p-4 sm:p-5 backdrop-blur-xl shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300">
      
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-emerald-950/20 pointer-events-none" />

      {/* Top Scanner HUD Header */}
      <div className="flex items-center justify-end text-xs font-medium z-10 mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHud(showHud === false)}
            className="flex items-center gap-1 text-[11px] font-sans font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-forest-card border border-slate-200 dark:border-forest-border text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors"
            title="Toggle AI Bounding Box HUD"
          >
            <Eye className="w-3 h-3" />
            <span>{showHud ? 'HUD ON' : 'HUD OFF'}</span>
          </button>
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Savar Wet Market
          </span>
        </div>
      </div>

      {/* Plate Stage with Real User Photo */}
      <div className="relative w-full aspect-square my-2 p-1 sm:p-2 flex items-center justify-center">
        <div className="relative w-full h-full rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border-2 border-slate-200 dark:border-forest-border bg-slate-900/5 dark:bg-[#06140e] flex items-center justify-center">
          
          {/* Responsive SVG Container locked to image coordinate system */}
          <svg
            viewBox="-145 220 2100 2100"
            className="w-full h-full select-none"
          >
            <defs>
              {/* Laser Scan Gradient */}
              <linearGradient id="laser-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>

              {/* Selection Box Glow Filter */}
              <filter id="hud-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="15" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Real Photographic Bangladeshi Plate Image (Fits uncropped in container) */}
            <image
              href="/images/demo-plate.png"
              x="0"
              y="0"
              width="1856"
              height="2304"
            />

            {/* Computer Vision HUD Overlays */}
            {showHud && (
              <g id="hud-layer">
                {/* Continuous Animated Laser Radar Sweep */}
                <rect
                  x="-145"
                  y="220"
                  width="2100"
                  height="18"
                  fill="url(#laser-grad)"
                  className="animate-[scan_3.5s_ease-in-out_infinite]"
                />

                {/* Detected Food Bounding Boxes */}
                {DETECTED_ITEMS.map((item) => {
                  const isActive = item.id === activeId;
                  const { x, y, width, height } = item.box;
                  const corner = 36; // bracket size

                  return (
                    <g
                      key={item.id}
                      className="cursor-pointer transition-all duration-200"
                      onClick={() => setActiveId(item.id)}
                    >
                      {/* Translucent Detection Fill */}
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        rx="16"
                        fill={isActive ? '#10b981' : '#059669'}
                        fillOpacity={isActive ? 0.22 : 0.08}
                        stroke={isActive ? '#10b981' : '#10b981'}
                        strokeWidth={isActive ? '6' : '3'}
                        strokeDasharray={isActive ? 'none' : '16,12'}
                        filter={isActive ? 'url(#hud-glow)' : 'none'}
                      />

                      {/* Corner Reticle Brackets (YOLO / SAM Style) */}
                      {/* Top-Left */}
                      <path
                        d={`M ${x} ${y + corner} L ${x} ${y} L ${x + corner} ${y}`}
                        stroke="#34d399"
                        strokeWidth="10"
                        strokeLinecap="round"
                        fill="none"
                      />
                      {/* Top-Right */}
                      <path
                        d={`M ${x + width - corner} ${y} L ${x + width} ${y} L ${x + width} ${y + corner}`}
                        stroke="#34d399"
                        strokeWidth="10"
                        strokeLinecap="round"
                        fill="none"
                      />
                      {/* Bottom-Left */}
                      <path
                        d={`M ${x} ${y + height - corner} L ${x} ${y + height} L ${x + corner} ${y + height}`}
                        stroke="#34d399"
                        strokeWidth="10"
                        strokeLinecap="round"
                        fill="none"
                      />
                      {/* Bottom-Right Reticle */}
                      <path
                        d={`M ${x + width - corner} ${y + height} L ${x + width} ${y + height} L ${x + width} ${y + height - corner}`}
                        stroke="#34d399"
                        strokeWidth="10"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </g>
                  );
                })}
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Floating Active Item Nutrition & Bazar Card with Fluid Smooth Transitions */}
      <div className="z-10 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border p-3.5 shadow-lg transition-all duration-200 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0, y: 7, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -7, filter: 'blur(3px)' }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex items-start justify-between"
          >
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                  {activeItem.name}
                </p>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-[10px] font-bold font-sans tracking-wide">
                  {activeItem.label} {(activeItem.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium ml-3.5">
                {activeItem.nameBn}
              </p>

              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1 ml-3.5 flex items-center gap-2">
                <span>Portion: {activeItem.weight}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-sans font-bold tabular-nums">
                  <Store className="w-3 h-3 text-emerald-600" />
                  Est. Bazar: {activeItem.cost}
                </span>
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white block font-sans">
                {activeItem.calories}
              </span>
              <div className="text-[10px] font-sans font-semibold text-slate-500 dark:text-slate-400 mt-0.5 space-x-1 tabular-nums">
                <span>P: {activeItem.protein}</span>
                <span>•</span>
                <span>C: {activeItem.carbs}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Provenance Footer */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-forest-border/50 flex items-center justify-between text-[10px]">
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Database className="w-3 h-3 text-emerald-500" />
            FAO FCTB (2013) Standard Recipe
          </span>
        </div>
      </div>

      {/* Inline styles for laser scan animation */}
      <style>{`
        @keyframes scan {
          0% { y: 230px; opacity: 0; }
          15% { opacity: 0.85; }
          85% { opacity: 0.85; }
          100% { y: 2300px; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
