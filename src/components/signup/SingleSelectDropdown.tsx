import React from 'react';

interface SingleSelectDropdownProps {
  label: string;
  options: string[];
  selectedValue: string;
  onChange: (value: string) => void;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
}

export const SingleSelectDropdown: React.FC<SingleSelectDropdownProps> = ({
  label,
  options,
  selectedValue,
  onChange,
  otherValue = '',
  onOtherChange,
  placeholder = 'Select an option...',
  helperText,
  required = false,
}) => {
  const isOther = selectedValue.toLowerCase().includes('other');

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      {helperText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
      )}

      <select
        value={selectedValue}
        onChange={(e) => {
          onChange(e.target.value);
          if (!e.target.value.toLowerCase().includes('other') && onOtherChange) {
            onOtherChange('');
          }
        }}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {isOther && onOtherChange && (
        <div className="pt-1 animate-fadeIn">
          <input
            type="text"
            required
            value={otherValue}
            onChange={(e) => onOtherChange(e.target.value)}
            placeholder="Please specify other details..."
            className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-forest-root text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      )}
    </div>
  );
};
