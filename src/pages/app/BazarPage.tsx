import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Store,
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency, formatTimestamp } from '../../lib/formatters';

interface BazarItem {
  id: string;
  name: string;
  nameBn: string;
  category: string;
  seller: string;
  market: 'savar' | 'ashulia';
  packSize: string;
  price: number;
  stockState: 'in_stock' | 'out_of_stock' | 'unknown';
  observedAt: string;
}

const DEMO_BAZAR_DATA: BazarItem[] = [
  {
    id: 'b1',
    name: 'Farm Fresh Chicken Eggs',
    nameBn: 'ফার্মের মুরগির ডিম',
    category: 'eggs',
    seller: 'Savar Bazar Farm Fresh Egg Stall',
    market: 'savar',
    packSize: '4 pieces (hali)',
    price: 48.00,
    stockState: 'in_stock',
    observedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'b2',
    name: 'Farm Fresh Chicken Eggs',
    nameBn: 'ফার্মের মুরগির ডিম',
    category: 'eggs',
    seller: 'Ashulia Kacha Bazar Egg Corner',
    market: 'ashulia',
    packSize: '4 pieces (hali)',
    price: 50.00,
    stockState: 'in_stock',
    observedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
  {
    id: 'b3',
    name: 'Red Lentils (Masoor Dal 1kg)',
    nameBn: 'দেশি মসুর ডাল',
    category: 'pulses',
    seller: 'Bismillah Grocery Savar',
    market: 'savar',
    packSize: '1 kg pack',
    price: 120.00,
    stockState: 'in_stock',
    observedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: 'b4',
    name: 'Red Lentils (Masoor Dal 1kg)',
    nameBn: 'মসুর ডাল',
    category: 'pulses',
    seller: 'Ashulia Central Grocery',
    market: 'ashulia',
    packSize: '1 kg pack',
    price: 125.00,
    stockState: 'in_stock',
    observedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'b5',
    name: 'Broiler Chicken (Dressed)',
    nameBn: 'ব্রয়লার মুরগির মাংস',
    category: 'meat',
    seller: 'Savar Poultry Syndicate',
    market: 'savar',
    packSize: '1 kg dressed',
    price: 190.00,
    stockState: 'in_stock',
    observedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'b6',
    name: 'Broiler Chicken (Half Portion)',
    nameBn: 'ব্রয়লার মুরগির মাংস (হাফ প্যাক)',
    category: 'meat',
    seller: 'Ashulia Meat & Chicken Shop',
    market: 'ashulia',
    packSize: '500 g half pack',
    price: 100.00,
    stockState: 'in_stock',
    observedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'b7',
    name: 'Rohu Fish (Medium Pond)',
    nameBn: 'রুই মাছ',
    category: 'fish',
    seller: 'Savar Fish Market',
    market: 'savar',
    packSize: '1 kg fresh',
    price: 320.00,
    stockState: 'in_stock',
    observedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
  {
    id: 'b8',
    name: 'Live Pond Tilapia',
    nameBn: 'তেলাপিয়া মাছ',
    category: 'fish',
    seller: 'Ashulia Macher Dokan',
    market: 'ashulia',
    packSize: '1 kg live',
    price: 175.00,
    stockState: 'in_stock',
    observedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'b9',
    name: 'Winter Spinach (Palong Shak)',
    nameBn: 'পালং শাক',
    category: 'vegetables',
    seller: 'Savar Sabzi Arat',
    market: 'savar',
    packSize: '1 bunch (~300g)',
    price: 20.00,
    stockState: 'in_stock',
    observedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'b10',
    name: 'Mustard Oil (Radhuni 1L)',
    nameBn: 'সরিষার তেল ১ লিটার',
    category: 'oils',
    seller: 'Ashulia Central Grocery',
    market: 'ashulia',
    packSize: '1 litre bottle',
    price: 270.00,
    stockState: 'out_of_stock',
    observedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
];

export const BazarPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedMarket, setSelectedMarket] = useState<'all' | 'savar' | 'ashulia'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = DEMO_BAZAR_DATA.filter((item) => {
    const matchesMarket = selectedMarket === 'all' || item.market === selectedMarket;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameBn.includes(searchQuery);
    return matchesMarket && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Title & Warning Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            SIMULATED DEMO DATA
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Field Test Model • Savar / Ashulia Hub
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('bazar.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {t('bazar.subtitle')}
        </p>
      </div>

      {/* Synthetic Warning Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">
            Simulated Demo Market Notice:
          </p>
          <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 mt-0.5 leading-relaxed">
            All prices and stock values displayed here are benchmark test fixtures calibrated to typical suburban Dhaka wet market levels. They are not live retail feeds.
          </p>
        </div>
      </div>

      {/* Controls: Market Toggle & Search */}
      <div className="p-6 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Market Segment Toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-forest-root rounded-2xl border border-slate-200 dark:border-forest-border/60">
            <button
              onClick={() => setSelectedMarket('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedMarket === 'all'
                  ? 'bg-white dark:bg-forest-card text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Bazars
            </button>
            <button
              onClick={() => setSelectedMarket('savar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedMarket === 'savar'
                  ? 'bg-white dark:bg-forest-card text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Savar Demo Market
            </button>
            <button
              onClick={() => setSelectedMarket('ashulia')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedMarket === 'ashulia'
                  ? 'bg-white dark:bg-forest-card text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Ashulia Demo Market
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search egg, fish, dal..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-forest-border/50 text-xs">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mr-1">
            Category:
          </span>
          {['all', 'eggs', 'pulses', 'fish', 'meat', 'vegetables', 'oils'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-forest-root text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-forest-cardHover'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Observation Table */}
      <div className="rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-forest-border/60 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-forest-root/30">
                <th className="px-6 py-3.5 font-semibold">Commodity Item</th>
                <th className="px-6 py-3.5 font-semibold">Market & Seller</th>
                <th className="px-6 py-3.5 font-semibold">Pack Purchase Size</th>
                <th className="px-6 py-3.5 font-semibold">Stock State</th>
                <th className="px-6 py-3.5 font-semibold">Price (BDT)</th>
                <th className="px-6 py-3.5 font-semibold text-right">Observation Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-forest-border/40">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-forest-root/40 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.nameBn}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{item.seller}</p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 capitalize">
                      {item.market} Demo Market
                    </p>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                    {item.packSize}
                  </td>
                  <td className="px-6 py-4">
                    {item.stockState === 'in_stock' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        In Stock
                      </span>
                    ) : item.stockState === 'out_of_stock' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold text-[10px]">
                        <XCircle className="w-3 h-3 text-rose-500" />
                        Out of Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px]">
                        <HelpCircle className="w-3 h-3" />
                        Unknown
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white text-sm">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-sans text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded tracking-wider">
                      synthetic_demo
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(item.observedAt)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
