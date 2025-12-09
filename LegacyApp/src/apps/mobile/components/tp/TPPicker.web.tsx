import React from 'react';

export interface TPPickerItem {
  label: string;
  value: string;
}

export interface TPPickerProps {
  label?: string;
  required?: boolean;
  value: string;
  onValueChange: (value: string) => void;
  items: TPPickerItem[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export function TPPicker({
  label,
  required,
  value,
  onValueChange,
  items,
  placeholder = 'Select an option',
  error,
  disabled = false,
}: TPPickerProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full h-[50px] px-3 rounded-lg border
          ${error ? 'border-red-300' : 'border-gray-300'}
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          text-gray-900 bg-white
        `}
      >
        <option value="">{placeholder}</option>
        {items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
