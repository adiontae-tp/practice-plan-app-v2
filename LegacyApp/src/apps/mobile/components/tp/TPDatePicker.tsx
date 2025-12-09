import React, { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetBackdrop,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';

export interface TPDatePickerProps {
  /** Optional label displayed above the picker */
  label?: string;
  /** The currently selected date */
  value: Date;
  /** Callback when date changes */
  onChange: (date: Date) => void;
  /** Error message to display */
  error?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * TPDatePicker - Custom date picker component
 * Opens a bottom sheet with month/day/year selection
 */
export const TPDatePicker = ({
  label,
  value,
  onChange,
  error,
  disabled = false,
}: TPDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState(value);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleOpen = () => {
    if (!disabled) {
      setTempDate(value);
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleConfirm = () => {
    onChange(tempDate);
    handleClose();
  };

  const adjustDate = (field: 'month' | 'day' | 'year', delta: number) => {
    const newDate = new Date(tempDate);
    if (field === 'month') {
      newDate.setMonth(newDate.getMonth() + delta);
    } else if (field === 'day') {
      newDate.setDate(newDate.getDate() + delta);
    } else if (field === 'year') {
      newDate.setFullYear(newDate.getFullYear() + delta);
    }
    setTempDate(newDate);
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-typography-900 mb-2">
          {label}
        </Text>
      )}
      <Pressable
        onPress={handleOpen}
        disabled={disabled}
        className={`flex-row items-center justify-between bg-background-50 border border-outline-200 rounded-lg px-4 py-3 ${disabled ? 'opacity-50' : ''}`}
      >
        <Text className="text-base text-typography-900">
          {formatDate(value)}
        </Text>
        <Calendar size={20} color={COLORS.primary} />
      </Pressable>
      {error && (
        <Text className="text-xs text-error-500 mt-1">{error}</Text>
      )}

      <Actionsheet isOpen={isOpen} onClose={handleClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="max-h-[50%]">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <View className="w-full px-4 pb-6">
            <Text className="text-lg font-semibold text-typography-900 text-center mb-4">
              Select Date
            </Text>

            {/* Date selectors */}
            <View className="flex-row justify-center items-center gap-2 mb-6">
              {/* Month */}
              <View className="items-center">
                <Pressable
                  onPress={() => adjustDate('month', 1)}
                  className="p-2"
                >
                  <Text className="text-xl text-typography-500">▲</Text>
                </Pressable>
                <View className="bg-background-100 rounded-lg px-4 py-2 min-w-[100px] items-center">
                  <Text className="text-base font-medium text-typography-900">
                    {MONTHS[tempDate.getMonth()]}
                  </Text>
                </View>
                <Pressable
                  onPress={() => adjustDate('month', -1)}
                  className="p-2"
                >
                  <Text className="text-xl text-typography-500">▼</Text>
                </Pressable>
              </View>

              {/* Day */}
              <View className="items-center">
                <Pressable
                  onPress={() => adjustDate('day', 1)}
                  className="p-2"
                >
                  <Text className="text-xl text-typography-500">▲</Text>
                </Pressable>
                <View className="bg-background-100 rounded-lg px-4 py-2 min-w-[60px] items-center">
                  <Text className="text-base font-medium text-typography-900">
                    {tempDate.getDate()}
                  </Text>
                </View>
                <Pressable
                  onPress={() => adjustDate('day', -1)}
                  className="p-2"
                >
                  <Text className="text-xl text-typography-500">▼</Text>
                </Pressable>
              </View>

              {/* Year */}
              <View className="items-center">
                <Pressable
                  onPress={() => adjustDate('year', 1)}
                  className="p-2"
                >
                  <Text className="text-xl text-typography-500">▲</Text>
                </Pressable>
                <View className="bg-background-100 rounded-lg px-4 py-2 min-w-[70px] items-center">
                  <Text className="text-base font-medium text-typography-900">
                    {tempDate.getFullYear()}
                  </Text>
                </View>
                <Pressable
                  onPress={() => adjustDate('year', -1)}
                  className="p-2"
                >
                  <Text className="text-xl text-typography-500">▼</Text>
                </Pressable>
              </View>
            </View>

            {/* Confirm button */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={handleClose}
                className="flex-1 py-3 rounded-lg border border-outline-200"
              >
                <Text className="text-center text-typography-700 font-medium">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                className="flex-1 py-3 rounded-lg"
                style={{ backgroundColor: COLORS.primary }}
              >
                <Text className="text-center text-white font-medium">Confirm</Text>
              </Pressable>
            </View>
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </View>
  );
};
