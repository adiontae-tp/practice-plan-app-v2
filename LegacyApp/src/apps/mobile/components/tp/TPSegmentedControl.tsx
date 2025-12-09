import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { COLORS } from '@ppa/ui/branding';

export interface TPSegmentedControlOption {
  label: string;
  value: string;
}

export interface TPSegmentedControlProps {
  /** Optional label displayed above the control */
  label?: string;
  /** Array of options to display */
  options: TPSegmentedControlOption[];
  /** The currently selected value */
  value: string;
  /** Callback when selection changes */
  onChange: (value: string) => void;
  /** Error message to display */
  error?: string;
  /** Whether the control is disabled */
  disabled?: boolean;
}

export const TPSegmentedControl = ({
  label,
  options,
  value,
  onChange,
  error,
  disabled = false,
}: TPSegmentedControlProps) => {
  const handleSelect = (optionValue: string) => {
    if (!disabled) {
      onChange(optionValue);
    }
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-typography-900 mb-2">
          {label}
        </Text>
      )}
      <View
        className={`flex-row bg-background-100 rounded-lg p-1 ${disabled ? 'opacity-50' : ''}`}
      >
        {options.map((option, index) => {
          const isSelected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => handleSelect(option.value)}
              disabled={disabled}
              className={`flex-1 py-2 px-3 rounded-md items-center justify-center ${
                isSelected ? 'bg-white shadow-sm' : ''
              }`}
              style={isSelected ? { backgroundColor: '#FFFFFF' } : {}}
            >
              <Text
                className={`text-sm font-medium ${
                  isSelected ? 'text-typography-900' : 'text-typography-500'
                }`}
                style={isSelected ? { color: COLORS.primary } : {}}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error && (
        <Text className="text-xs text-error-500 mt-1">{error}</Text>
      )}
    </View>
  );
};
