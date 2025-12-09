import React from 'react';
import { View, Text } from 'react-native';
import { Progress, ProgressFilledTrack } from '@/components/ui/progress';

export interface TPProgressProps {
  /** Optional label displayed above the progress bar */
  label?: string;
  /** Progress value between 0 and 1 (null for indeterminate) */
  value: number | null;
  /** Error message to display */
  error?: string;
  /** Whether to show the percentage value */
  showPercentage?: boolean;
}

export const TPProgress = ({
  label,
  value,
  error,
  showPercentage = false,
}: TPProgressProps) => {
  const percentage = value !== null ? Math.round(value * 100) : null;
  // GlueStack Progress expects value 0-100
  const progressValue = value !== null ? value * 100 : 0;

  return (
    <View className="mb-4">
      {(label || showPercentage) && (
        <View className="flex-row justify-between items-center mb-2">
          {label && (
            <Text className="text-sm font-medium text-typography-900">
              {label}
            </Text>
          )}
          {showPercentage && percentage !== null && (
            <Text className="text-sm text-typography-600">
              {percentage}%
            </Text>
          )}
        </View>
      )}
      <Progress value={progressValue} size="md">
        <ProgressFilledTrack />
      </Progress>
      {error && (
        <Text className="text-xs text-error-500 mt-1">{error}</Text>
      )}
    </View>
  );
};
