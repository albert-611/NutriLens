import React from 'react';
import { UniversalDropdown } from '../common/UniversalDropdown';

export interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
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
  disabled = false,
  error,
  className = '',
}) => {
  return (
    <UniversalDropdown
      label={label}
      options={options}
      value={selectedValues}
      onChange={onChange}
      multiple={true}
      otherValue={otherValue}
      onOtherChange={onOtherChange}
      placeholder={placeholder}
      helperText={helperText}
      required={required}
      disabled={disabled}
      error={error}
      className={className}
    />
  );
};
