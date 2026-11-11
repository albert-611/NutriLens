import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface UniversalDropdownProps {
  label?: string;
  options: (string | DropdownOption)[];
  value?: string | string[];
  onChange: (value: any) => void;
  multiple?: boolean;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  searchable?: boolean;
  allowOther?: boolean;
  otherValue?: string;
  onOtherChange?: (val: string) => void;
  otherPlaceholder?: string;
  className?: string;
}

export const UniversalDropdown: React.FC<UniversalDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  multiple = false,
  placeholder = 'Select option...',
  helperText,
  required = false,
  disabled = false,
  error,
  searchable = false,
  allowOther = true,
  otherValue = '',
  onOtherChange,
  otherPlaceholder = 'Please specify details...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownId = useId();

  // Normalize options to object format
  const normalizedOptions: DropdownOption[] = React.useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  // Current selection normalized
  const selectedList = React.useMemo<string[]>(() => {
    if (multiple) {
      return Array.isArray(value) ? value : [];
    }
    return typeof value === 'string' && value ? [value] : [];
  }, [value, multiple]);

  // Filtered options if searchable
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const query = searchQuery.toLowerCase();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        (opt.description && opt.description.toLowerCase().includes(query))
    );
  }, [normalizedOptions, searchQuery]);

  // Check if "Other" is currently selected
  const isOtherSelected = React.useMemo(() => {
    return selectedList.some((v) => v.toLowerCase().includes('other'));
  }, [selectedList]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        setFocusedIndex(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
      } else if (e.key === 'Enter' && focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
        e.preventDefault();
        const opt = filteredOptions[focusedIndex];
        if (!opt.disabled) {
          handleSelectOption(opt.value);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, filteredOptions]);

  // Focus search input when opened if searchable
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelectOption = (optVal: string) => {
    if (multiple) {
      let updated: string[];

      if (optVal === 'None' || optVal === 'Prefer not to say') {
        // Mutually exclusive
        if (selectedList.includes(optVal)) {
          updated = [];
        } else {
          updated = [optVal];
          if (onOtherChange) onOtherChange('');
        }
      } else {
        // Normal option removes 'None' and 'Prefer not to say'
        updated = selectedList.filter((v) => v !== 'None' && v !== 'Prefer not to say');
        if (updated.includes(optVal)) {
          updated = updated.filter((v) => v !== optVal);
          if (optVal.toLowerCase().includes('other') && onOtherChange) {
            onOtherChange('');
          }
        } else {
          updated.push(optVal);
        }
      }
      onChange(updated);
    } else {
      // Single select
      onChange(optVal);
      if (!optVal.toLowerCase().includes('other') && onOtherChange) {
        onOtherChange('');
      }
      setIsOpen(false);
      setSearchQuery('');
      setFocusedIndex(-1);
    }
  };

  const handleRemoveTag = (e: React.MouseEvent, optVal: string) => {
    e.stopPropagation();
    if (multiple) {
      const updated = selectedList.filter((v) => v !== optVal);
      onChange(updated);
      if (optVal.toLowerCase().includes('other') && onOtherChange) {
        onOtherChange('');
      }
    }
  };

  // Find label for single selected option
  const singleSelectedOption = React.useMemo(() => {
    if (multiple) return null;
    return normalizedOptions.find((o) => o.value === value);
  }, [multiple, normalizedOptions, value]);

  return (
    <div className={`space-y-1.5 ${className}`} ref={containerRef}>
      {/* Label and Selected Counter */}
      {(label || (multiple && selectedList.length > 0)) && (
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={dropdownId}
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 select-none"
            >
              {label} {required && <span className="text-rose-500">*</span>}
            </label>
          )}
          {multiple && selectedList.length > 0 && (
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {selectedList.length} selected
            </span>
          )}
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
      )}

      {/* Dropdown Trigger Box */}
      <div className="relative">
        <button
          id={dropdownId}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`w-full min-h-[42px] px-3.5 py-2.5 rounded-xl border text-left text-xs flex items-center justify-between gap-2 transition-all duration-150 select-none ${
            disabled
              ? 'bg-slate-100 dark:bg-forest-card/50 border-slate-200 dark:border-forest-border text-slate-400 cursor-not-allowed'
              : error
              ? 'border-rose-400 dark:border-rose-600 bg-white dark:bg-forest-root text-slate-900 dark:text-white ring-1 ring-rose-400'
              : isOpen
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white dark:bg-forest-root text-slate-900 dark:text-white'
              : 'border-slate-300 dark:border-forest-border bg-white dark:bg-forest-root text-slate-900 dark:text-white hover:border-slate-400 dark:hover:border-forest-border/80'
          }`}
        >
          {/* Selected value or tags display */}
          <div className="flex flex-wrap items-center gap-1.5 flex-1 pr-2">
            {multiple ? (
              selectedList.length === 0 ? (
                <span className="text-slate-400 dark:text-slate-500 font-normal">{placeholder}</span>
              ) : (
                selectedList.map((val) => {
                  const opt = normalizedOptions.find((o) => o.value === val);
                  const displayLabel = opt ? opt.label : val;
                  const isNeutral = val === 'None' || val === 'Prefer not to say';

                  return (
                    <span
                      key={val}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                        isNeutral
                          ? 'bg-slate-200 dark:bg-forest-card text-slate-700 dark:text-slate-300'
                          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      <span>{displayLabel}</span>
                      <span
                        onClick={(e) => handleRemoveTag(e, val)}
                        className="hover:opacity-75 cursor-pointer ml-0.5 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
                        role="button"
                        aria-label={`Remove ${displayLabel}`}
                      >
                        <X className="w-3 h-3" />
                      </span>
                    </span>
                  );
                })
              )
            ) : singleSelectedOption ? (
              <span className="font-semibold text-slate-900 dark:text-white">
                {singleSelectedOption.label}
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 font-normal">{placeholder}</span>
            )}
          </div>

          {/* Chevron Indicator */}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
            }`}
          />
        </button>

        {/* Universal Dropdown Floating Menu */}
        {isOpen && (
          <div
            ref={listboxRef}
            role="listbox"
            aria-multiselectable={multiple}
            className="absolute z-50 left-0 right-0 mt-1.5 max-h-64 overflow-y-auto rounded-2xl bg-white dark:bg-forest-card border border-slate-200 dark:border-forest-border shadow-xl shadow-slate-900/10 dark:shadow-black/60 p-1.5 space-y-0.5 animate-fadeIn"
          >
            {/* Search Box if Searchable */}
            {searchable && (
              <div className="p-1.5 border-b border-slate-100 dark:border-forest-border/50 mb-1 sticky top-0 bg-white dark:bg-forest-card z-10">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search options..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-forest-root border border-slate-200 dark:border-forest-border text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = selectedList.includes(opt.value);
                const isFocused = focusedIndex === idx;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    onClick={() => !opt.disabled && handleSelectOption(opt.value)}
                    onMouseEnter={() => setFocusedIndex(idx)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors duration-100 ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                        : isFocused
                        ? 'bg-slate-100 dark:bg-forest-cardHover text-slate-900 dark:text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-forest-cardHover'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span>{opt.label}</span>
                      {opt.description && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          {opt.description}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">{error}</p>
      )}

      {/* Conditional Other Text Input */}
      {allowOther && isOtherSelected && onOtherChange && (
        <div className="pt-1.5 animate-fadeIn">
          <input
            type="text"
            required
            value={otherValue}
            onChange={(e) => onOtherChange(e.target.value)}
            placeholder={otherPlaceholder}
            className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-forest-root text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
      )}
    </div>
  );
};

