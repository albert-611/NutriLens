import React, { useState } from 'react';
import { Sparkles, Check, Database, Store } from 'lucide-react';

interface FoodPin {
  id: string;
  name: string;
  nameBn: string;
  weight: string;
  calories: string;
  protein: string;
  cost: string;
  x: number; // percentage
  y: number; // percentage
}

const PINS: FoodPin[] = [
  {
    id: 'rice',
    name: 'Steamed Parboiled Rice',
    nameBn: 'সিদ্ধ সাদা ভাত',
    weight: '200 g',
    calories: '260 kcal',
    protein: '5.4 g',
    cost: '৳ 13.60',
    x: 48,
    y: 65,
  },
  {
    id: 'dal',
    name: 'Red Lentil Soup (Masoor Dal)',
    nameBn: 'মসুর ডাল ঝোল',
    weight: '150 g',
    calories: '147 kcal',
    protein: '11.7 g',
    cost: '৳ 18.00',
    x: 25,
    y: 35,
  },
  {
    id: 'fish',
    name: 'Rohu Fish Curry (Rui Mach)',
    nameBn: 'রুই মাছের ঝোল',
    weight: '180 g',
    calories: '243 kcal',
    protein: '24.8 g',
    cost: '৳ 57.60',
    x: 72,
    y: 38,
  },
  {
    id: 'shak',
    name: 'Spinach Bhaji (Palong Shak)',
    nameBn: 'পালং শাক ভাজি',
    weight: '80 g',
    calories: '59 kcal',
    protein: '2.5 g',
    cost: '৳ 6.50',
    x: 48,
    y: 22,
  },
];

export const PlateScannerGraphic: React.FC = () => {
  const [activePin, setActivePin] = useState<FoodPin>(PINS[2]); // Default fish curry active

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square rounded-3xl bg-forest-card/50 dark:bg-forest-card/70 border border-slate-200/80 dark:border-forest-border p-5 backdrop-blur-xl shadow-2xl flex flex-col justify-between overflow-hidden">
      
      {/* Scanner Visual Overlay Lines */}
      <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse opacity-75" />

      {/* Top Scanner Header */}
      <div className="flex items-center justify-between text-xs font-medium z-10">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Multimodal Scan Confirmed</span>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Savar Demo Bazar
        </span>
      </div>

      {/* Plate Simulation Graphic */}
      <div className="relative w-full flex-1 flex items-center justify-center my-4">
        {/* Plate Boundary */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-slate-300 dark:border-forest-border bg-slate-100 dark:bg-[#071912] shadow-inner flex items-center justify-center overflow-hidden">
          
          {/* Visual Food Regions */}
          <div className="absolute inset-0 opacity-80">
            {/* Rice Bottom Half */}
            <div className="absolute bottom-0 inset-x-0 h-1/2 bg-amber-50/70 dark:bg-amber-100/10 border-t border-amber-200/30 flex items-center justify-center">
              <span className="text-[10px] text-amber-700/60 dark:text-amber-200/40 font-bold uppercase tracking-widest">
                Parboiled Rice Area
              </span>
            </div>
            {/* Dal Left Corner */}
            <div className="absolute top-4 left-4 w-28 h-28 rounded-full bg-orange-400/20 dark:bg-orange-500/20 border border-orange-400/30" />
            {/* Fish Right Corner */}
            <div className="absolute top-4 right-4 w-28 h-28 rounded-full bg-amber-600/20 dark:bg-amber-600/30 border border-amber-500/30" />
            {/* Green Shak Top Middle */}
            <div className="absolute top-2 inset-x-16 h-14 rounded-full bg-emerald-500/25 dark:bg-emerald-600/30 border border-emerald-400/30" />
          </div>

          {/* Interactive Scan Pins */}
          {PINS.map((pin) => {
            const isSelected = activePin.id === pin.id;
            return (
              <button
                key={pin.id}
                onClick={() => setActivePin(pin)}
                style={{ top: `${pin.y}%`, left: `${pin.x}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none"
              >
                <span className="relative flex h-6 w-6 items-center justify-center">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isSelected ? 'bg-emerald-400' : 'bg-slate-400 dark:bg-emerald-600'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-4 w-4 items-center justify-center text-[9px] font-bold shadow-md transition-transform duration-200 ${
                      isSelected
                        ? 'bg-emerald-500 text-white scale-125 ring-2 ring-white dark:ring-forest-card'
                        : 'bg-white dark:bg-forest-card text-emerald-600 dark:text-emerald-400 border border-emerald-500/50 hover:scale-110'
                    }`}
                  >
                    <Check className="w-2.5 h-2.5" />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Active Item Nutrition Card */}
      <div className="z-10 rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border p-3.5 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-xs text-slate-900 dark:text-slate-100">
                {activePin.name}
              </p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                ({activePin.nameBn})
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-2">
              <span>Portion: {activePin.weight}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Store className="w-3 h-3" />
                Est. Bazar Cost: {activePin.cost}
              </span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {activePin.calories}
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Protein: {activePin.protein}
            </p>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-forest-border/50 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-emerald-500" />
            Verified against FAO FCTB (2013)
          </span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400">
            SIMULATED DEMO DATA
          </span>
        </div>
      </div>
    </div>
  );
};
