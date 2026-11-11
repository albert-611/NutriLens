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
  placeholder = '0',
  helperText,
  required = false,
  min = 1,
  max = 500,
}) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {/* Unit Selector Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-forest-root border border-slate-200 dark:border-forest-border p-0.5 rounded-lg">
          {units.map((u) => (
            <button
              key={u.value}
              type="button"
              onClick={() => onChangeUnit(u.value)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                unit === u.value
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
      )}

      <div className="relative">
        <input
          type="number"
          min={min}
          max={max}
          step="0.1"
          value={value !== null && value !== undefined ? value : ''}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            onChangeValue(isNaN(v) ? null : v);
          }}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
        />
        <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">
          {unit === 'ft_in' ? 'ft' : unit}
        </span>
      </div>
    </div>
  );
};
