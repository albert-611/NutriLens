import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag,
  Store,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Share2,
  Archive,
  Info,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../lib/formatters';

interface BasketLine {
  id: string;
  name: string;
  nameBn: string;
  recipeNeeded: string;
  inPantry: boolean;
  packUnit: string;
  packCount: number;
  cashPrice: number;
  consumedCost: number;
  seller: string;
}

export const ShoppingPage: React.FC = () => {
  const { t } = useTranslation();

  const [basket, setBasket] = useState<BasketLine[]>([
    {
      id: 's1',
      name: 'Farm Fresh Chicken Eggs',
      nameBn: 'মুরগির ডিম',
      recipeNeeded: '2 pieces',
      inPantry: false,
      packUnit: '4 pieces (hali)',
      packCount: 1,
      cashPrice: 48.00,
      consumedCost: 24.00,
      seller: 'Savar Farm Fresh Egg Stall',
    },
    {
      id: 's2',
      name: 'Red Lentils (Masoor Dal)',
      nameBn: 'মসুর ডাল',
      recipeNeeded: '150 g',
      inPantry: false,
      packUnit: '500 g small bag',
      packCount: 1,
      cashPrice: 65.00,
      consumedCost: 19.50,
      seller: 'Mayer Doa Store Savar',
    },
    {
      id: 's3',
      name: 'Miniket Parboiled Rice',
      nameBn: 'মিনিকেট চাল',
      recipeNeeded: '200 g',
      inPantry: true, // In Pantry!
      packUnit: '1 kg loose',
      packCount: 0,
      cashPrice: 0.00,
      consumedCost: 13.60,
      seller: 'In Pantry (No purchase needed)',
    },
    {
      id: 's4',
      name: 'Fresh Winter Spinach (Palong Shak)',
      nameBn: 'পালং শাক',
      recipeNeeded: '1 bunch (~300g)',
      inPantry: false,
      packUnit: '1 bunch',
      packCount: 1,
      cashPrice: 20.00,
      consumedCost: 20.00,
      seller: 'Savar Sabzi Arat',
    },
    {
      id: 's5',
      name: 'Desi Onion (Peyaj)',
      nameBn: 'দেশি পেঁয়াজ',
      recipeNeeded: '50 g',
      inPantry: true, // In Pantry
      packUnit: '1 kg',
      packCount: 0,
      cashPrice: 0.00,
      consumedCost: 5.50,
      seller: 'In Pantry (Deducted)',
    },
  ]);

  const togglePantry = (id: string) => {
    setBasket((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextInPantry = !item.inPantry;
          return {
            ...item,
            inPantry: nextInPantry,
            packCount: nextInPantry ? 0 : 1,
            cashPrice: nextInPantry ? 0.00 : item.id === 's1' ? 48.00 : item.id === 's2' ? 65.00 : 20.00,
          };
        }
        return item;
      })
    );
  };

  const totalCashCheckout = basket.reduce((acc, item) => acc + item.cashPrice, 0);
  const totalIngredientValue = basket.reduce((acc, item) => acc + item.consumedCost, 0);

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Smart Basket Optimizer
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Savar Market Pack Rounding
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('shopping.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {t('shopping.subtitle')}
        </p>
      </div>

      {/* Cash Checkout vs Consumed Cost Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Actual Cash Checkout */}
        <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-forest-card border border-emerald-200 dark:border-forest-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <span>Estimated Cash at Checkout</span>
            <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-900 dark:text-white">
            {formatCurrency(totalCashCheckout)}
          </p>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
            Rounded to real bazar pack sizes (eggs in halis, lentils in 500g sacks).
          </p>
        </div>

        {/* Consumed Ingredient Value */}
        <div className="p-6 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Meal-Portion Ingredient Value</span>
            <Archive className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {formatCurrency(totalIngredientValue)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Value of ingredients eaten in this meal. Remaining pack stays in pantry!
          </p>
        </div>
      </div>

      {/* Basket Table Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-forest-border/60">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-500" />
            Purchasing Items ({basket.filter((b) => !b.inPantry).length} to buy, {basket.filter((b) => b.inPantry).length} in pantry)
          </h2>
          <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
            SIMULATED DEMO DATA
          </span>
        </div>

        <div className="space-y-3">
          {basket.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                item.inPantry
                  ? 'bg-slate-50/60 dark:bg-forest-root/40 border-slate-200/60 dark:border-forest-border/40 opacity-70'
                  : 'bg-white dark:bg-forest-root border-slate-200 dark:border-forest-border/80 shadow-sm'
              }`}
            >
              {/* Item Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className={`font-bold text-sm ${item.inPantry ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                    {item.name}
                  </p>
                  <span className="text-xs text-slate-400">({item.nameBn})</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Recipe needs: <strong className="text-slate-700 dark:text-slate-300">{item.recipeNeeded}</strong> • Market Unit: {item.packUnit}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  Seller: {item.seller}
                </p>
              </div>

              {/* Pantry Toggle & Cost */}
              <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
                {/* Pantry Checkbox */}
                <button
                  type="button"
                  onClick={() => togglePantry(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    item.inPantry
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-100 dark:bg-forest-card text-slate-600 dark:text-slate-400 border-slate-200 dark:border-forest-border'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${item.inPantry ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span>{item.inPantry ? 'In Pantry' : 'Need to Buy'}</span>
                </button>

                {/* Cash Cost */}
                <div className="text-right min-w-[70px]">
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {item.inPantry ? '৳ 0.00' : formatCurrency(item.cashPrice)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {item.inPantry ? 'Deducted' : `${item.packCount} pack`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Explainer */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border/60 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            Formula: For items not in pantry, <code className="bg-slate-200 dark:bg-forest-card px-1 py-0.5 rounded font-mono">pack_count = ceil(needed_qty / pack_qty)</code> and <code className="bg-slate-200 dark:bg-forest-card px-1 py-0.5 rounded font-mono">cash_cost = pack_count * pack_price</code>.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-forest-border/60">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-500"
          >
            <Printer className="w-3.5 h-3.5" />
            Print List
          </button>

          <Button
            onClick={() => alert('Shopping basket saved to active session!')}
            variant="primary"
            size="md"
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Save Shopping Basket
          </Button>
        </div>
      </div>
    </div>
  );
};
