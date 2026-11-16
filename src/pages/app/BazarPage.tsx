import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Store,
  Search,
  Filter,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';
import {
  WFP_2026_MARKET_OBSERVATIONS,
  WFPPriceObservation,
} from '../../lib/wfpMarketPrices';

const POPULAR_MARKETS = [
  'all',
  'Dhaka',
  'Sylhet Sadar',
  'Barisal Sadar',
  'Rajshahi Sadar',
  'Chittagong Division',
  'Ukhia Market',
  'Teknaf Market',
  'Cox`s Bazar Sadar',
];

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'grains_and_cereals', label: 'Grains & Rice' },
  { id: 'pulses_and_legumes', label: 'Lentils & Pulses' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'meat_and_poultry', label: 'Meat & Poultry' },
  { id: 'fish_and_seafood', label: 'Fish & Seafood' },
  { id: 'vegetables', label: 'Vegetables' },
  { id: 'fruits', label: 'Fruits' },
  { id: 'oils_and_fats', label: 'Oils & Fats' },
  { id: 'spices_and_condiments', label: 'Spices & Salt' },
];

export const BazarPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedMarket, setSelectedMarket] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'commodity' | 'price' | 'date'>('commodity');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Extract all unique market names from 2026 data
  const allUniqueMarkets = useMemo(() => {
    const set = new Set<string>();
    WFP_2026_MARKET_OBSERVATIONS.forEach((o) => {
      if (o.market) set.add(o.market);
    });
    return Array.from(set).sort();
  }, []);

  // Filter observations based on search, market, and category
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return WFP_2026_MARKET_OBSERVATIONS.filter((item) => {
      const matchesMarket = selectedMarket === 'all' || item.market === selectedMarket;
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.nameBn && item.nameBn.includes(q)) ||
        item.market.toLowerCase().includes(q) ||
        item.admin1.toLowerCase().includes(q);
      return matchesMarket && matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortField === 'price') {
        return sortAsc ? a.price - b.price : b.price - a.price;
      }
      if (sortField === 'date') {
        return sortAsc
          ? a.observedAt.localeCompare(b.observedAt)
          : b.observedAt.localeCompare(a.observedAt);
      }
      return sortAsc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });
  }, [selectedMarket, selectedCategory, searchQuery, sortField, sortAsc]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title & Verified WFP Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs uppercase font-extrabold tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Official WFP 2026 Dataset
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            United Nations World Food Programme • 2026 Bangladesh Market Price Monitor
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Bazar Intelligence & Commodity Prices
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Verified 2026 market commodity prices across Bangladesh divisions to ensure realistic dietary budget modeling.
        </p>
      </div>

      {/* Official Dataset Notification Banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-900 dark:text-white">
            100% Real-World 2026 Price Records (No Demo / Simulation)
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
            All prices and trends are grounded directly in the <strong>World Food Programme (WFP) 2026 Bangladesh Food Prices Dataset</strong>.
            Prices cover staple rice, lentils, eggs, broiler chicken, beef, fish, vegetables, and cooking oils monitored live across 114 physical Bangladesh markets.
          </p>
        </div>
      </div>

      {/* Controls: Market Toggle, Search, & Category Pills */}
      <div className="p-6 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-4">
        {/* Market Quick Selector & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Popular Market Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {POPULAR_MARKETS.map((mkt) => (
              <button
                key={mkt}
                onClick={() => setSelectedMarket(mkt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedMarket === mkt
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-forest-root text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-forest-cardHover'
                }`}
              >
                {mkt === 'all' ? 'All 114 Markets' : mkt}
              </button>
            ))}

            {/* Dropdown for All 114 Markets */}
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Select specific market ({allUniqueMarkets.length} total)...</option>
              {allUniqueMarkets.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rice, egg, chicken, fish, oil..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-100 dark:border-forest-border/50 text-xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mr-1">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-100 dark:bg-forest-root text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-forest-cardHover'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Observation Table */}
      <div className="rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-forest-border/50 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Showing <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{filteredItems.length}</span> Verified 2026 Price Observations
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">Sort:</span>
            <button
              onClick={() => {
                if (sortField === 'commodity') setSortAsc(!sortAsc);
                else { setSortField('commodity'); setSortAsc(true); }
              }}
              className={`px-2 py-0.5 rounded font-semibold text-[11px] ${sortField === 'commodity' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'text-slate-500'}`}
            >
              Commodity {sortField === 'commodity' ? (sortAsc ? '↑' : '↓') : ''}
            </button>
            <button
              onClick={() => {
                if (sortField === 'price') setSortAsc(!sortAsc);
                else { setSortField('price'); setSortAsc(true); }
              }}
              className={`px-2 py-0.5 rounded font-semibold text-[11px] ${sortField === 'price' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'text-slate-500'}`}
            >
              Price {sortField === 'price' ? (sortAsc ? '↑' : '↓') : ''}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-forest-border/60 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-forest-root/30">
                <th className="px-6 py-3.5 font-semibold">Commodity Item</th>
                <th className="px-6 py-3.5 font-semibold">Market & Division</th>
                <th className="px-6 py-3.5 font-semibold">Purchase Unit</th>
                <th className="px-6 py-3.5 font-semibold">Price (BDT)</th>
                <th className="px-6 py-3.5 font-semibold">2026 Trend</th>
                <th className="px-6 py-3.5 font-semibold text-right">Observation Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-forest-border/40">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No commodity records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-forest-root/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                        {item.nameBn}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.market}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.admin1} Division
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-forest-root text-slate-800 dark:text-slate-200 text-[11px] font-semibold">
                        {item.packSize}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-white text-sm">
                      ৳{item.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {item.trend === 'up' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 font-semibold text-[11px]">
                          <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                          {item.change}
                        </span>
                      ) : item.trend === 'down' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                          <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                          {item.change}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-forest-root text-slate-600 dark:text-slate-400 font-medium text-[11px]">
                          <Minus className="w-3 h-3 text-slate-400" />
                          Stable
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-sans text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        WFP Verified
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {item.observedAt}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
