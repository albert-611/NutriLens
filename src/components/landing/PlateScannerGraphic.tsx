import React, { useState } from 'react';
import { Sparkles, Check, Database, Store, Eye, Crosshair } from 'lucide-react';

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
  // Bounding box in percentage [top, left, width, height]
  box: { top: number; left: number; width: number; height: number };
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
    box: { top: 12, left: 52, width: 42, height: 38 },
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
    box: { top: 14, left: 6, width: 40, height: 38 },
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
    box: { top: 6, left: 34, width: 32, height: 26 },
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
    box: { top: 48, left: 10, width: 80, height: 46 },
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
      <div className="flex items-center justify-between text-xs font-medium z-10 mb-2">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold">Vision Model: 4 Items Confirmed</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHud(!showHud)}
            className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-forest-elevated border border-slate-200 dark:border-forest-border text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors"
            title="Toggle AI Bounding Box HUD"
          >
            <Eye className="w-3 h-3" />
            <span>{showHud ? 'HUD ON' : 'HUD OFF'}</span>
          </button>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Savar Wet Market
          </span>
        </div>
      </div>

      {/* Plate Stage */}
      <div className="relative w-full aspect-square my-2 flex items-center justify-center">
        {/* Realistic Thali Dish Plate */}
        <div className="relative w-[92%] h-[92%] rounded-full shadow-2xl overflow-hidden border-[6px] border-slate-300 dark:border-[#223d30] bg-[#e6e8e5] dark:bg-[#06140e] flex items-center justify-center">
          
          {/* Inner Thali Rim Metallic Shading */}
          <div className="absolute inset-0 rounded-full border-[10px] border-slate-200/60 dark:border-[#102a1e]/80 pointer-events-none z-10 shadow-inner" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/20 via-transparent to-white/20 pointer-events-none z-10" />

          {/* SVG Food Illustrations - Realistic Overhead Composition */}
          <svg
            viewBox="0 0 400 400"
            className="w-full h-full select-none"
            style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))' }}
          >
            <defs>
              {/* Rice Texture Pattern */}
              <pattern id="rice-grain" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
                <ellipse cx="4" cy="4" rx="3.5" ry="1.5" fill="#fdfcf8" stroke="#e8e2d2" strokeWidth="0.5" />
                <ellipse cx="11" cy="10" rx="3.5" ry="1.5" fill="#f8f4e6" stroke="#ded6c0" strokeWidth="0.5" />
              </pattern>

              {/* Dal Gradient */}
              <radialGradient id="dal-soup" cx="45%" cy="45%" r="50%">
                <stop offset="0%" stopColor="#f7b731" />
                <stop offset="60%" stopColor="#fa8231" />
                <stop offset="100%" stopColor="#eb3b5a" />
              </radialGradient>

              {/* Fish Curry Gravy Gradient */}
              <radialGradient id="curry-gravy" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#e17055" />
                <stop offset="65%" stopColor="#d63031" />
                <stop offset="100%" stopColor="#801010" />
              </radialGradient>

              {/* Spinach Texture */}
              <radialGradient id="shak-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2ed573" />
                <stop offset="50%" stopColor="#1e824c" />
                <stop offset="100%" stopColor="#114b27" />
              </radialGradient>
            </defs>

            {/* Base Plate Interior */}
            <circle cx="200" cy="200" r="190" fill="#f3f4f1" className="dark:fill-[#0c1f17]" />

            {/* 1. STEAMED PARBOILED RICE (Bottom Mound) */}
            <g id="rice-mound" className="cursor-pointer" onClick={() => setActiveId('rice')}>
              {/* Rice Base Shadow */}
              <path
                d="M 40,240 Q 200,160 360,240 A 185,185 0 0,1 40,240 Z"
                fill="#ded7c4"
                className="dark:fill-[#1b2b22]"
              />
              {/* Rice Mound Texture */}
              <path
                d="M 45,235 Q 200,165 355,235 A 180,180 0 0,1 45,235 Z"
                fill="url(#rice-grain)"
              />
              {/* Individual grain highlights for high realism */}
              <ellipse cx="180" cy="240" rx="4" ry="1.8" fill="#ffffff" transform="rotate(10 180 240)" />
              <ellipse cx="220" cy="250" rx="4.5" ry="1.8" fill="#ffffff" transform="rotate(-15 220 250)" />
              <ellipse cx="150" cy="280" rx="4" ry="1.8" fill="#ffffff" transform="rotate(35 150 280)" />
              <ellipse cx="250" cy="290" rx="4.2" ry="1.8" fill="#ffffff" transform="rotate(-25 250 290)" />
              <ellipse cx="200" cy="310" rx="4" ry="1.8" fill="#ffffff" transform="rotate(5 200 310)" />
              <ellipse cx="130" cy="320" rx="4.5" ry="1.8" fill="#ffffff" transform="rotate(-40 130 320)" />
              <ellipse cx="270" cy="320" rx="4" ry="1.8" fill="#ffffff" transform="rotate(45 270 320)" />
            </g>

            {/* 2. MASOOR DAL BOWL / KATORI (Upper Left) */}
            <g id="dal-dish" className="cursor-pointer" onClick={() => setActiveId('dal')}>
              {/* Steel Katori Rim */}
              <circle cx="100" cy="115" r="68" fill="#bcc3cb" className="dark:fill-[#2d3a33]" />
              <circle cx="100" cy="115" r="64" fill="#e9ecef" className="dark:fill-[#1b2520]" />
              {/* Dal Soup Liquid */}
              <circle cx="100" cy="115" r="60" fill="url(#dal-soup)" />
              {/* Fried Garlic / Cumin Baghar flecks */}
              <ellipse cx="90" cy="105" rx="5" ry="2.5" fill="#f1c40f" transform="rotate(20 90 105)" />
              <ellipse cx="115" cy="120" rx="4" ry="2" fill="#d35400" transform="rotate(-30 115 120)" />
              <ellipse cx="80" cy="130" rx="3.5" ry="1.5" fill="#7f8c8d" transform="rotate(15 80 130)" />
              {/* Fresh Coriander leaf garnishes */}
              <path d="M 105,95 Q 110,90 115,95 Q 110,100 105,95 Z" fill="#27ae60" />
              <path d="M 102,96 Q 105,90 108,96 Q 105,102 102,96 Z" fill="#2ecc71" />
              <circle cx="120" cy="100" r="1.5" fill="#27ae60" />
            </g>

            {/* 3. ROHU FISH CURRY (Upper Right) */}
            <g id="fish-curry" className="cursor-pointer" onClick={() => setActiveId('fish')}>
              {/* Curry Gravy pool */}
              <ellipse cx="290" cy="125" rx="72" ry="62" fill="url(#curry-gravy)" />
              
              {/* Rui Mach Steak (Peti/Gada Cut - distinctive crescent fish silhouette) */}
              <g transform="translate(255, 95) rotate(-15)">
                {/* Fish Flesh Outer Sear */}
                <path
                  d="M 10,25 C 15,5 55,5 65,25 C 60,45 20,45 10,25 Z"
                  fill="#c0392b"
                  stroke="#781e1e"
                  strokeWidth="2"
                />
                {/* Fish Steak Inner White Flakes */}
                <path
                  d="M 16,24 C 20,10 50,10 58,24 C 54,38 22,38 16,24 Z"
                  fill="#f9ebdc"
                />
                {/* Fish Bone Center Circle */}
                <circle cx="37" cy="24" r="5" fill="#795548" />
                <circle cx="37" cy="24" r="2.5" fill="#ffffff" />
                {/* Gravy Drizzle across fish steak */}
                <path d="M 22,22 Q 35,28 50,20" stroke="#d63031" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </g>

              {/* Sliced Green Chili on Top */}
              <path
                d="M 280,145 Q 295,155 310,140"
                stroke="#2ed573"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 285,147 Q 295,155 305,143"
                stroke="#7bed9f"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* 4. PALONG SHAK BHAJI (Top Center Mound) */}
            <g id="shak-dish" className="cursor-pointer" onClick={() => setActiveId('shak')}>
              {/* Sauteed Dark Leafy Cluster */}
              <ellipse cx="195" cy="80" rx="45" ry="32" fill="url(#shak-gradient)" />
              <ellipse cx="180" cy="75" rx="20" ry="15" fill="#1b5e20" />
              <ellipse cx="210" cy="82" rx="22" ry="16" fill="#2e7d32" />
              {/* Fried Crispy Red Chili (Shukno Morich) Garnish */}
              <path
                d="M 185,82 Q 195,78 205,86"
                stroke="#b71540"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Browned Garlic Slivers */}
              <rect x="175" y="82" width="5" height="2" rx="1" fill="#f5cd79" transform="rotate(30 175 82)" />
              <rect x="205" y="76" width="6" height="2.5" rx="1" fill="#f5cd79" transform="rotate(-20 205 76)" />
            </g>
          </svg>

          {/* COMPUTER VISION HUD OVERLAYS */}
          {showHud && (
            <div className="absolute inset-0 pointer-events-none z-20">
              {/* Continuous Laser Radar Sweep */}
              <div
                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] opacity-70 animate-[scan_3.2s_ease-in-out_infinite]"
              />

              {/* Bounding Boxes for each detected food */}
              {DETECTED_ITEMS.map((item) => {
                const isActive = item.id === activeId;
                const { top, left, width, height } = item.box;

                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveId(item.id)}
                    style={{
                      top: `${top}%`,
                      left: `${left}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                    }}
                    className={`absolute pointer-events-auto cursor-pointer transition-all duration-200 rounded-lg ${
                      isActive
                        ? 'border-2 border-emerald-500 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                        : 'border border-emerald-500/50 hover:border-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    {/* Corner Reticle Brackets (YOLO/SAM aesthetic) */}
                    <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-400" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-400" />
                    <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-400" />
                    <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-400" />

                    {/* AI Label & Confidence Pill */}
                    <div
                      className={`absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1 transition-transform shadow-md ${
                        isActive
                          ? 'bg-emerald-600 text-white scale-105'
                          : 'bg-slate-900/80 text-emerald-300 dark:bg-forest-root/90'
                      }`}
                    >
                      <Crosshair className="w-2.5 h-2.5" />
                      <span>{item.label}</span>
                      <span className="opacity-80">{(item.confidence * 100).toFixed(0)}%</span>
                    </div>

                    {/* Center Portion Tag */}
                    <div
                      className={`absolute bottom-1 right-1 px-1.5 py-0.2 rounded text-[8px] font-mono font-bold ${
                        isActive ? 'bg-emerald-600 text-white' : 'bg-black/60 text-emerald-200'
                      }`}
                    >
                      {item.weight}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Active Item Nutrition & Bazar Card */}
      <div className="z-10 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border p-3.5 shadow-lg transition-all duration-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                {activeItem.name}
              </p>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium ml-3.5">
              {activeItem.nameBn}
            </p>

            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1 ml-3.5 flex items-center gap-2">
              <span>Portion: {activeItem.weight}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono">
                <Store className="w-3 h-3 text-emerald-600" />
                Est. Bazar: {activeItem.cost}
              </span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              {activeItem.calories}
            </span>
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 space-x-1">
              <span>P: {activeItem.protein}</span>
              <span>•</span>
              <span>C: {activeItem.carbs}</span>
            </div>
          </div>
        </div>

        {/* Provenance & Demo Benchmark Footer */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-forest-border/50 flex items-center justify-between text-[10px]">
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Database className="w-3 h-3 text-emerald-500" />
            FAO FCTB (2013) Standard Recipe
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
            SIMULATED DEMO DATA
          </span>
        </div>
      </div>

      {/* Inline styles for laser scan animation */}
      <style>{`
        @keyframes scan {
          0% { top: 6%; opacity: 0; }
          15% { opacity: 0.8; }
          85% { opacity: 0.8; }
          100% { top: 92%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
