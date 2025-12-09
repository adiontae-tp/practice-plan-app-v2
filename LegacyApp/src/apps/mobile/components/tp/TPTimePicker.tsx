import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Clock } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetBackdrop,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';

export interface TPTimePickerProps {
  /** Optional label displayed above the picker */
  label?: string;
  /** The currently selected time (as Date object) */
  value: Date;
  /** Callback when time changes */
  onChange: (date: Date) => void;
  /** Error message to display */
  error?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
}

/**
 * TPTimePicker - Custom time picker component
 * Opens a bottom sheet with hour/minute selection
 */
export const TPTimePicker = ({
  label,
  value,
  onChange,
  error,
  disabled = false,
}: TPTimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempTime, setTempTime] = useState(value);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleOpen = () => {
    if (!disabled) {
      setTempTime(value);
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleConfirm = () => {
    onChange(tempTime);
    handleClose();
  };

  const adjustTime = (field: 'hour' | 'minute', delta: number) => {
    const newTime = new Date(tempTime);
    if (field === 'hour') {
      newTime.setHours(newTime.getHours() + delta);
    } else if (field === 'minute') {
      newTime.setMinutes(newTime.getMinutes() + delta);
    }
    setTempTime(newTime);
  };

  const toggleAMPM = () => {
    const newTime = new Date(tempTime);
    const hours = newTime.getHours();
    if (hours >= 12) {
      newTime.setHours(hours - 12);
    } else {
      newTime.setHours(hours + 12);
    }
    setTempTime(newTime);
  };

  const getDisplayHour = () => {
    let hours = tempTime.getHours();
    if (hours === 0) return 12;
    if (hours > 12) return hours - 12;
    return hours;
  };

  const getAMPM = () => {
    return tempTime.getHours() >= 12 ? 'PM' : 'AM';
  };

  const padZero = (num: number) => num.toString().padStart(2, '0');

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
          {formatTime(value)}
        </Text>
        <Clock size={20} color={COLORS.primary} />
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
              Select Time
            </Text>

            {/* Time selectors */}
            <View className="flex-row justify-center items-center gap-2 mb-6">
              {/* Hour */}
              <View className="items-center">
                <Pressable
                  onPress={() => adjustTime('hour', 1)}
                  className="p-2"
                >
                  <Text className="text-xl text-typography-500">▲</Text>
                </Pressable>
                <View className="bg-background-100 rounded-lg px-4 py-2 min-w-[60px] items-center">
                  <Text className="text-2xl font-medium text-typography-900">
                    {getDisplayHour()}
                  </Text>
                </View>
                <Pressable
                  onPress={() => adjustTime('hour', -1)}
                  className="p-2"
                >
                  <Text className="text-xl text-typography-500">▼</Text>
                </Pressable>
              </View>

              <Text className="text-2xl font-medium text-typography-900">:</Text>

              {/* Minute */}
              <View className="items-center">
                <Pressable
                  onPress={() => adjustTime('minute', 1)}
                  className="p-2"
                >
                  <Text className="text-xl text-typography-500">▲</Text>
                </Pressable>
                <View className="bg-background-100 rounded-lg px-4 py-2 min-w-[60px] items-center">
                  <Text className="text-2xl font-medium text-typography-900">
                    {padZero(tempTime.getMinutes())}
                  </Text>
                </View>
                <Pressable
                  onPress={() => adjustTime('minute', -1)}
                  className="p-2"
                >
                  <Text className="text-xl text-typography-500">▼</Text>
                </Pressable>
              </View>

              {/* AM/PM */}
              <View className="items-center ml-2">
                <Pressable
                  onPress={toggleAMPM}
                  className="p-2"
                >
                  <Text className="text-xl text-typography-500">▲</Text>
                </Pressable>
                <View className="bg-background-100 rounded-lg px-4 py-2 min-w-[60px] items-center">
                  <Text className="text-xl font-medium text-typography-900">
                    {getAMPM()}
                  </Text>
                </View>
                <Pressable
                  onPress={toggleAMPM}
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
