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
  Calendar,
  Layers,
} from 'lucide-react';
import {
  WFP_2026_MARKET_OBSERVATIONS,
  WFP_DIVISIONS,
  WFP_DIVISION_NAMES_BN,
  WFP_DIVISION_MARKETS,
  WFPPriceObservation,
} from '../../lib/wfpMarketPrices';

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

const YEARS = [
  { id: 'all', label: '2024–2026' },
  { id: '2026', label: '2026' },
  { id: '2025', label: '2025' },
  { id: '2024', label: '2024' },
];

export const BazarPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedMarket, setSelectedMarket] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'commodity' | 'price' | 'date'>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Markets available for the currently selected division
  const availableMarkets = useMemo(() => {
    if (selectedDivision === 'all') {
      const allMarkets: string[] = [];
      Object.values(WFP_DIVISION_MARKETS).forEach((mList) => {
        allMarkets.push(...mList);
      });
      return Array.from(new Set(allMarkets)).sort();
    }
    return WFP_DIVISION_MARKETS[selectedDivision] || [];
  }, [selectedDivision]);

  // Handle division switch: automatically reset market selection to 'all' so results display immediately
  const handleSelectDivision = (div: string) => {
    setSelectedDivision(div);
    setSelectedMarket('all');
  };

  // Filter observations based on search, division, market, year, and category
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return WFP_2026_MARKET_OBSERVATIONS.filter((item) => {
      // 1. Division filter
      const matchesDivision =
        selectedDivision === 'all' || item.division.toLowerCase() === selectedDivision.toLowerCase();

      // 2. Market filter
      const matchesMarket =
        selectedMarket === 'all' || item.market.toLowerCase() === selectedMarket.toLowerCase();

      // 3. Year filter
      const matchesYear =
        selectedYear === 'all' || item.year === selectedYear || item.observedAt.startsWith(selectedYear);

      // 4. Category filter
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      // 5. Search query
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.nameBn && item.nameBn.includes(q)) ||
        item.market.toLowerCase().includes(q) ||
        item.division.toLowerCase().includes(q) ||
        (item.district && item.district.toLowerCase().includes(q));

      return matchesDivision && matchesMarket && matchesYear && matchesCategory && matchesSearch;
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
  }, [selectedDivision, selectedMarket, selectedYear, selectedCategory, searchQuery, sortField, sortAsc]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title & Verified WFP Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs uppercase font-extrabold tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Official WFP Bangladesh Dataset (2024–2026)
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            United Nations World Food Programme • 8 Divisions • 118 Physical Markets
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Bazar Intelligence & Live Market Prices
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Real retail commodity prices monitored across Bangladesh divisions from 2024 to 2026 to power realistic meal cost and dietary budget planning.
        </p>
      </div>

      {/* Official Dataset Notification Banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-900 dark:text-white">
            Comprehensive Real-World Data across All 8 Divisions & 118 Markets (2024–2026)
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
            Choose any <strong>Division</strong> below to browse all regional wet markets and wholesale centers (e.g. Kawran Bazar, Mirpur 1, Savar, Chittagong, Sylhet Sadar). All prices are official monitoring observations from the World Food Programme.
          </p>
        </div>
      </div>

      {/* Control Panel: Division, Market, Year, Search, & Categories */}
      <div className="p-6 rounded-3xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-sm space-y-5">
        
        {/* 1. Division Selector (Primary Location Hierarchy) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              1. Select Administrative Division:
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              {selectedDivision === 'all'
                ? 'All 8 Divisions'
                : `${selectedDivision} (${WFP_DIVISION_NAMES_BN[selectedDivision] || selectedDivision})`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleSelectDivision('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDivision === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30'
                  : 'bg-slate-100 dark:bg-forest-root text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-forest-cardHover'
              }`}
            >
              All Divisions (118 Markets)
            </button>
            {WFP_DIVISIONS.map((div) => {
              const count = WFP_DIVISION_MARKETS[div]?.length || 0;
              const isSelected = selectedDivision === div;
              return (
                <button
                  key={div}
                  onClick={() => handleSelectDivision(div)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30'
                      : 'bg-slate-100 dark:bg-forest-root text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-forest-cardHover'
                  }`}
                >
                  <span>{div}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-forest-border text-slate-500 dark:text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Market Location Selector & Search & Year Controls */}
        <div className="pt-3 border-t border-slate-100 dark:border-forest-border/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Specific Market Location in Selected Division */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-slate-400" />
              2. Market Location:
            </span>

            {/* Quick All Markets in Division Button */}
            <button
              onClick={() => setSelectedMarket('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedMarket === 'all'
                  ? 'bg-slate-800 text-white dark:bg-emerald-600 shadow-sm'
                  : 'bg-slate-100 dark:bg-forest-root text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All in {selectedDivision === 'all' ? 'Bangladesh' : selectedDivision} ({availableMarkets.length})
            </button>

            {/* Cascading Market Dropdown */}
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm max-w-xs"
            >
              <option value="all">
                Choose specific market ({availableMarkets.length} in {selectedDivision === 'all' ? 'All' : selectedDivision})...
              </option>
              {availableMarkets.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Right Controls: Year Filter & Search Bar */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* Year Selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-forest-root rounded-xl border border-slate-200 dark:border-forest-border/60 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              {YEARS.map((y) => (
                <button
                  key={y.id}
                  onClick={() => setSelectedYear(y.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedYear === y.id
                      ? 'bg-white dark:bg-forest-card text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {y.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food item, rice, egg..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* 3. Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-slate-100 dark:border-forest-border/50 text-xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mr-1">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium text-xs ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
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
        <div className="px-6 py-4 border-b border-slate-100 dark:border-forest-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Showing <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">{filteredItems.length}</span> Verified Price Observations
            {selectedDivision !== 'all' && (
              <span className="text-slate-500 dark:text-slate-400 font-normal"> in {selectedDivision} Division</span>
            )}
            {selectedMarket !== 'all' && (
              <span className="text-slate-500 dark:text-slate-400 font-normal"> • {selectedMarket}</span>
            )}
            {selectedYear !== 'all' && (
              <span className="text-slate-500 dark:text-slate-400 font-normal"> ({selectedYear})</span>
            )}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">Sort:</span>
            <button
              onClick={() => {
                if (sortField === 'date') setSortAsc(!sortAsc);
                else { setSortField('date'); setSortAsc(false); }
              }}
              className={`px-2 py-0.5 rounded font-semibold text-[11px] ${sortField === 'date' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'text-slate-500'}`}
            >
              Date {sortField === 'date' ? (sortAsc ? '↑' : '↓') : ''}
            </button>
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
                <th className="px-6 py-3.5 font-semibold">Division & Market</th>
                <th className="px-6 py-3.5 font-semibold">Purchase Unit</th>
                <th className="px-6 py-3.5 font-semibold">Price (BDT)</th>
                <th className="px-6 py-3.5 font-semibold">Trend</th>
                <th className="px-6 py-3.5 font-semibold text-right">Observation Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-forest-border/40">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No commodity records found for the selected division, market, and filters.
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
                        {item.division} Division {item.district && item.district !== item.market ? `(${item.district})` : ''}
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
                        WFP {item.year}
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
