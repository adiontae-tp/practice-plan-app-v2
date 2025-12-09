import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '@ppa/ui/branding';

export interface TPGaugeProps {
  /** Label displayed on the gauge */
  label?: string;
  /** Current value */
  value: number;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Gauge type (currently all render as circular) */
  type?: 'default' | 'circular' | 'circularCapacity' | 'linear' | 'linearCapacity';
  /** Error message to display */
  error?: string;
  /** Size of the gauge */
  size?: number;
}

/**
 * TPGauge - Circular progress gauge component
 * Renders a circular progress indicator with value display
 */
export const TPGauge = ({
  label,
  value,
  min = 0,
  max = 100,
  type = 'default',
  error,
  size = 120,
}: TPGaugeProps) => {
  // Calculate percentage
  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);

  // SVG circle properties
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage);

  // Linear type falls back to using TPProgress (show a simple view for now)
  if (type === 'linear' || type === 'linearCapacity') {
    return (
      <View className="mb-4">
        {label && (
          <Text className="text-sm font-medium text-typography-900 mb-2">
            {label}
          </Text>
        )}
        <View className="bg-background-100 rounded-lg p-4">
          <View className="h-2 bg-background-300 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${percentage * 100}%`,
                backgroundColor: COLORS.primary,
              }}
            />
          </View>
          <Text className="text-lg font-semibold text-typography-900 mt-2 text-center">
            {value} / {max}
          </Text>
        </View>
        {error && (
          <Text className="text-xs text-error-500 mt-1">{error}</Text>
        )}
      </View>
    );
  }

  return (
    <View className="mb-4 items-center">
      {label && (
        <Text className="text-sm font-medium text-typography-900 mb-2">
          {label}
        </Text>
      )}
      <View style={{ width: size, height: size }} className="items-center justify-center">
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={COLORS.primary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        {/* Center value */}
        <View className="absolute items-center justify-center">
          <Text className="text-2xl font-bold text-typography-900">
            {Math.round(value)}
          </Text>
          {type === 'circularCapacity' && (
            <Text className="text-xs text-typography-500">
              / {max}
            </Text>
          )}
        </View>
      </View>
      {error && (
        <Text className="text-xs text-error-500 mt-1">{error}</Text>
      )}
    </View>
  );
};
