import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CheckSquare,
  Plus,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Info,
  Scale,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

interface EditableItem {
  id: string;
  foodId: string;
  name: string;
  nameBn: string;
  grams: number;
  preparationState: string;
  category: string;
}

export const ConfirmPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState<EditableItem[]>([
    {
      id: 'item-1',
      foodId: '33333333-3333-3333-3333-333333333301',
      name: 'Cooked White Rice (Parboiled)',
      nameBn: 'সিদ্ধ সাদা ভাত',
      grams: 200,
      preparationState: 'boiled',
      category: 'grains_and_cereals',
    },
    {
      id: 'item-2',
      foodId: '33333333-3333-3333-3333-333333333308',
      name: 'Cooked Red Lentils (Masoor Dal Jhol)',
      nameBn: 'মসুর ডাল ঝোল',
      grams: 150,
      preparationState: 'boiled',
      category: 'pulses_and_legumes',
    },
    {
      id: 'item-3',
      foodId: '33333333-3333-3333-3333-333333333320',
      name: 'Rohu Fish Curry (Rui Macher Jhol)',
      nameBn: 'রুই মাছের ঝোল',
      grams: 180,
      preparationState: 'cooked_gravy',
      category: 'fish_and_seafood',
    },
    {
      id: 'item-4',
      foodId: '33333333-3333-3333-3333-333333333329',
      name: 'Spinach Bhaji (Palong Shak)',
      nameBn: 'পালং শাক ভাজি',
      grams: 80,
      preparationState: 'fried',
      category: 'vegetables',
    },
  ]);

  const updateGrams = (id: string, val: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, grams: Math.max(10, val) } : item))
    );
  };

  const updatePrepState = (id: string, prep: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, preparationState: prep } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddItem = () => {
    const newItem: EditableItem = {
      id: `item-${Date.now()}`,
      foodId: '33333333-3333-3333-3333-333333333329',
      name: 'Spinach Bhaji (Palong Shak)',
      nameBn: 'পালং শাক ভাজি',
      grams: 80,
      preparationState: 'fried',
      category: 'vegetables',
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleConfirm = () => {
    navigate('/app/report', {
      state: { confirmedItems: items },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Step 2 of 4
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            AI Proposes • User Confirms
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('confirm.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {t('confirm.subtitle')}
        </p>
      </div>

      {/* Plate Scan Source Image Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 dark:bg-forest-card/60 border border-slate-200 dark:border-forest-border flex flex-col sm:flex-row items-center gap-5">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-md flex-shrink-0 bg-black/10">
          <img
            src="/images/demo-plate.png"
            alt="Uploaded meal scan"
            className="w-full h-full object-cover object-[center_60%]"
          />
          <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/70 text-emerald-400 border border-emerald-500/30">
            SCAN CAPTURED
          </span>
        </div>
        <div className="space-y-1.5 flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Gemini Vision Multimodal Detection</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
            Bangla Plate Vision: 4 Components Detected
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Please review the recognized items, adjust portion weights if needed, and confirm to calculate your nutrition breakdown against the FAO Food Composition Table for Bangladesh (2013).
          </p>
        </div>
      </div>

      {/* Confirmation Items List */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-forest-border/60">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-500" />
            Detected Food Components ({items.length})
          </h2>
          <Button
            onClick={handleAddItem}
            variant="outline"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            {t('confirm.add_item')}
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <p className="text-sm font-semibold">No food items on plate</p>
            <Button onClick={handleAddItem} variant="primary" size="sm">
              Add Item
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Food Identity Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.name}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 pl-7">
                    {item.nameBn} • Category: <span className="capitalize">{item.category.replace(/_/g, ' ')}</span>
                  </p>
                </div>

                {/* Editable Inputs: Grams & Preparation */}
                <div className="flex items-center gap-3 pl-7 sm:pl-0">
                  {/* Preparation Selector */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-400">
                      Prep State
                    </label>
                    <select
                      value={item.preparationState}
                      onChange={(e) => updatePrepState(item.id, e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-card text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="boiled">Boiled</option>
                      <option value="fried">Fried</option>
                      <option value="curried">Curried</option>
                      <option value="steamed">Steamed</option>
                      <option value="raw">Raw</option>
                    </select>
                  </div>

                  {/* Grams Input */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-400">
                      Weight (Grams)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="10"
                        step="5"
                        value={item.grams}
                        onChange={(e) => updateGrams(item.id, parseFloat(e.target.value) || 0)}
                        className="w-24 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-card text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-right pr-7"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-normal">
                        g
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <div className="pt-4">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calculation Guard Notice */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            Authoritative nutrition calculation executes on the server only after confirmation. Edible portion formula: <code className="bg-emerald-500/20 px-1 py-0.5 rounded font-mono font-bold">Total = (Grams / 100) × FAO_Value_100g</code>.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <Button
            onClick={handleConfirm}
            variant="primary"
            size="lg"
            className="w-full sm:w-auto shadow-lg shadow-emerald-600/20"
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            {t('confirm.calculate_btn')}
          </Button>
        </div>
      </div>
    </div>
  );
};

