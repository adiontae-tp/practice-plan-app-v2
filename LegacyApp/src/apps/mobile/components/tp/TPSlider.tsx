import React from 'react';
import { View, Text } from 'react-native';
import { Slider, SliderTrack, SliderFilledTrack, SliderThumb } from '@/components/ui/slider';

export interface TPSliderProps {
  /** Optional label displayed above the slider */
  label?: string;
  /** The current value */
  value: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment (0 = continuous) */
  steps?: number;
  /** Error message to display */
  error?: string;
  /** Whether the slider is disabled */
  disabled?: boolean;
  /** Whether to show the current value */
  showValue?: boolean;
}

export const TPSlider = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  steps = 0,
  error,
  disabled = false,
  showValue = false,
}: TPSliderProps) => {
  const handleValueChange = (newValue: number) => {
    if (!disabled) {
      onChange(newValue);
    }
  };

  return (
    <View className="mb-4">
      {(label || showValue) && (
        <View className="flex-row justify-between items-center mb-2">
          {label && (
            <Text className="text-sm font-medium text-typography-900">
              {label}
            </Text>
          )}
          {showValue && (
            <Text className="text-sm text-typography-600">
              {Math.round(value)}
            </Text>
          )}
        </View>
      )}
      <View className={disabled ? 'opacity-50' : ''}>
        <Slider
          value={value}
          minValue={min}
          maxValue={max}
          step={steps > 0 ? steps : 1}
          onChange={handleValueChange}
          isDisabled={disabled}
          size="md"
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </View>
      {error && (
        <Text className="text-xs text-error-500 mt-1">{error}</Text>
      )}
    </View>
  );
};
