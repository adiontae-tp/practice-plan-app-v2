import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { formatWeekRange, isSameWeek } from '@/utils/calendar.utils';

interface WeekNavigationProps {
  weekStart: Date;
  onPrevious: () => void;
  onNext: () => void;
  onCurrentWeek: () => void;
}

export const WeekNavigation = React.memo(
  ({ weekStart, onPrevious, onNext, onCurrentWeek }: WeekNavigationProps) => {
    const weekRange = useMemo(() => formatWeekRange(weekStart), [weekStart]);
    const isCurrentWeek = useMemo(() => isSameWeek(new Date(), weekStart), [weekStart]);

    return (
      <View className="px-4 mt-3">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={onPrevious}
            className="w-10 h-10 items-center justify-center rounded-lg active:bg-gray-100"
          >
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </Pressable>

          <View className="flex-1 items-center">
            <Text className="text-base font-semibold" style={{ color: COLORS.textPrimary }}>
              {weekRange}
            </Text>
            {!isCurrentWeek && (
              <Pressable onPress={onCurrentWeek} className="mt-1">
                <Text className="text-sm font-medium" style={{ color: COLORS.primary }}>
                  This Week
                </Text>
              </Pressable>
            )}
          </View>

          <Pressable
            onPress={onNext}
            className="w-10 h-10 items-center justify-center rounded-lg active:bg-gray-100"
          >
            <ChevronRight size={24} color={COLORS.textPrimary} />
          </Pressable>
        </View>
      </View>
    );
  }
);

WeekNavigation.displayName = 'WeekNavigation';
