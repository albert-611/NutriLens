import React from 'react';
import { UniversalDropdown } from '../common/UniversalDropdown';

export interface SingleSelectDropdownProps {
  label: string;
  options: string[];
  selectedValue: string;
  onChange: (value: string) => void;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
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
  disabled = false,
  error,
  className = '',
}) => {
  return (
    <UniversalDropdown
      label={label}
      options={options}
      value={selectedValue}
      onChange={onChange}
      multiple={false}
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
