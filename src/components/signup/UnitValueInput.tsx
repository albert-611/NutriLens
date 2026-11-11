import React from 'react';

interface UnitValueInputProps {
  label: string;
  value: number | null | undefined;
  onChangeValue: (val: number | null) => void;
  unit: string;
  onChangeUnit: (unit: string) => void;
  units: { label: string; value: string }[];
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  min?: number;
  max?: number;
}

export const UnitValueInput: React.FC<UnitValueInputProps> = ({
  label,
  value,
  onChangeValue,
  unit,
  onChangeUnit,
  units,
  placeholder,
  helperText,
  required = false,
  min,
  max,
}) => {
  // Convert value automatically when switching units
  const handleUnitToggle = (newUnit: string) => {
    if (newUnit === unit) return;

    if (value !== null && value !== undefined && !isNaN(value) && value > 0) {
      if (unit === 'cm' && (newUnit === 'ft' || newUnit === 'ft_in')) {
        // cm -> ft (1 ft = 30.48 cm, 1 inch = 2.54 cm)
        const ft = Math.round((value / 30.48) * 10) / 10;
        onChangeValue(ft);
      } else if ((unit === 'ft' || unit === 'ft_in') && newUnit === 'cm') {
        // ft -> cm
        const cm = Math.round(value * 30.48);
        onChangeValue(cm);
      } else if (unit === 'kg' && newUnit === 'lbs') {
        // kg -> lbs (1 kg = 2.20462 lbs)
        const lbs = Math.round(value * 2.20462 * 10) / 10;
        onChangeValue(lbs);
      } else if (unit === 'lbs' && newUnit === 'kg') {
        // lbs -> kg (1 lb = 0.453592 kg)
        const kg = Math.round(value * 0.453592 * 10) / 10;
        onChangeValue(kg);
      }
    }

    onChangeUnit(newUnit);
  };

  // Determine dynamic placeholder based on current unit
  const dynamicPlaceholder = React.useMemo(() => {
    if (placeholder) return placeholder;
    if (unit === 'cm') return 'e.g. 175';
    if (unit === 'ft' || unit === 'ft_in') return 'e.g. 5.9';
    if (unit === 'kg') return 'e.g. 65';
    if (unit === 'lbs') return 'e.g. 143';
    return '0';
  }, [placeholder, unit]);

  // Determine display label for the inline unit badge
  const displayUnitBadge = React.useMemo(() => {
    if (unit === 'ft_in' || unit === 'ft') return 'ft / in';
    return unit;
  }, [unit]);

  // Dynamic step, min, and max depending on unit
  const dynamicStep = unit === 'ft_in' || unit === 'ft' ? '0.1' : unit === 'cm' ? '1' : '0.5';
  const dynamicMin = min !== undefined ? min : unit === 'ft_in' || unit === 'ft' ? 1.5 : unit === 'lbs' ? 44 : 20;
  const dynamicMax = max !== undefined ? max : unit === 'ft_in' || unit === 'ft' ? 9.0 : unit === 'lbs' ? 770 : 350;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {/* Unit Selector Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-forest-root border border-slate-200 dark:border-forest-border p-0.5 rounded-lg">
          {units.map((u) => {
            const isSelected = unit === u.value;
            return (
              <button
                key={u.value}
                type="button"
                onClick={() => handleUnitToggle(u.value)}
                className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold transition-all duration-150 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {u.label}
              </button>
            );
          })}
        </div>
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
      )}

      {/* Input container with adequate right padding (pr-20) to completely prevent overlap */}
      <div className="relative flex items-center">
        <input
          type="number"
          min={dynamicMin}
          max={dynamicMax}
          step={dynamicStep}
          value={value !== null && value !== undefined ? value : ''}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            onChangeValue(isNaN(v) ? null : v);
          }}
          placeholder={dynamicPlaceholder}
          className="w-full pl-3.5 pr-20 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold transition-all"
        />
        {/* Unit Badge securely pinned to right with non-overlapping background */}
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-forest-card border border-slate-200 dark:border-forest-border px-2 py-0.5 rounded-md pointer-events-none select-none">
          {displayUnitBadge}
        </span>
      </div>
    </div>
  );
};
