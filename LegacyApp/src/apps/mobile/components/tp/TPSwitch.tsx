import React from 'react';
import { View, Text } from 'react-native';
import { Switch } from '@/components/ui/switch';
import { COLORS } from '@ppa/ui/branding';

export interface TPSwitchProps {
  /** Label displayed next to the switch */
  label?: string;
  /** Whether the switch is on */
  value: boolean;
  /** Callback when value changes */
  onChange: (value: boolean) => void;
  /** Error message to display */
  error?: string;
  /** Whether the switch is disabled */
  disabled?: boolean;
}

export const TPSwitch = ({
  label,
  value,
  onChange,
  error,
  disabled = false,
}: TPSwitchProps) => {
  const handleValueChange = (newValue: boolean) => {
    if (!disabled) {
      onChange(newValue);
    }
  };

  return (
    <View className="mb-4">
      <View className={`flex-row items-center justify-between ${disabled ? 'opacity-50' : ''}`}>
        {label && (
          <Text className="text-sm font-medium text-typography-900 flex-1 mr-3">
            {label}
          </Text>
        )}
        <Switch
          value={value}
          onValueChange={handleValueChange}
          disabled={disabled}
          trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
          thumbColor="#FFFFFF"
        />
      </View>
      {error && (
        <Text className="text-xs text-error-500 mt-1">{error}</Text>
      )}
    </View>
  );
};
