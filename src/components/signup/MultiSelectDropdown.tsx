import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  otherValue = '',
  onOtherChange,
  placeholder = 'Select options...',
  helperText,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (option: string) => {
    if (option === 'None') {
      // 'None' is mutually exclusive with all other options
      if (selectedValues.includes('None')) {
        onChange([]);
      } else {
        onChange(['None']);
        if (onOtherChange) onOtherChange('');
      }
      return;
    }

    if (option === 'Prefer not to say') {
      // 'Prefer not to say' is mutually exclusive
      if (selectedValues.includes('Prefer not to say')) {
        onChange([]);
      } else {
        onChange(['Prefer not to say']);
        if (onOtherChange) onOtherChange('');
      }
      return;
    }

    // Selecting any normal option removes 'None' and 'Prefer not to say'
    let updated = selectedValues.filter((v) => v !== 'None' && v !== 'Prefer not to say');

    if (updated.includes(option)) {
      updated = updated.filter((v) => v !== option);
      if (option.includes('Other') && onOtherChange) {
        onOtherChange('');
      }
    } else {
      updated.push(option);
    }

    onChange(updated);
  };

  const isOtherSelected = selectedValues.some((v) => v.toLowerCase().includes('other'));

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {selectedValues.length > 0 && (
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            {selectedValues.length} selected
          </span>
        )}
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
      )}

      {/* Main Select Button / Display Box */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-left text-xs flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
        >
          <div className="flex flex-wrap items-center gap-1.5 flex-1 pr-2">
            {selectedValues.length === 0 ? (
              <span className="text-slate-400">{placeholder}</span>
            ) : (
              selectedValues.map((val) => (
                <span
                  key={val}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${
                    val === 'None' || val === 'Prefer not to say'
                      ? 'bg-slate-200 dark:bg-forest-card text-slate-700 dark:text-slate-300'
                      : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  <span>{val}</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleOption(val);
                    }}
                    className="hover:opacity-75 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </span>
                </span>
              ))
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-xl p-1.5 space-y-0.5 animate-fadeIn">
            {options.map((opt) => {
              const isSelected = selectedValues.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleToggleOption(opt)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-forest-cardHover'
                  }`}
                >
                  <span>{opt}</span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Conditional Other Text Input */}
      {isOtherSelected && onOtherChange && (
        <div className="pt-1.5 animate-fadeIn">
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
