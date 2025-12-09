import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Plan } from '@ppa/interfaces';
import { Badge, BadgeText } from '@/components/ui/badge';
import { COLORS } from '@ppa/ui/branding';
import {
  getWeekDays,
  formatDayAbbreviation,
  formatDateNumber,
  isToday,
  getPracticeCountForDay,
} from '@/utils/calendar.utils';

interface WeekDaysRowProps {
  weekStart: Date;
  plans: Plan[];
  onDayPress: (date: Date) => void;
}

export const WeekDaysRow = React.memo(({ weekStart, plans, onDayPress }: WeekDaysRowProps) => {
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  return (
    <View className="bg-white rounded-lg p-3 mx-4 mt-4">
      <View className="flex-row justify-between">
        {weekDays.map((day, index) => {
          const dayAbbr = formatDayAbbreviation(day);
          const dateNum = formatDateNumber(day);
          const count = getPracticeCountForDay(plans, day);
          const isTodayDate = isToday(day);

          return (
            <Pressable
              key={index}
              onPress={() => onDayPress(day)}
              className="flex-1 items-center py-2"
            >
              <View
                className={`items-center justify-center rounded-lg px-3 py-2 ${
                  isTodayDate ? 'bg-primary-500' : ''
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    isTodayDate ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {dayAbbr}
                </Text>
                <Text
                  className={`text-lg font-semibold mt-1 ${
                    isTodayDate ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {dateNum}
                </Text>
                {count > 0 && (
                  <Badge
                    size="sm"
                    className={`mt-1 ${
                      isTodayDate ? 'bg-white' : 'bg-primary-500'
                    }`}
                  >
                    <BadgeText
                      className={`text-xs ${
                        isTodayDate ? 'text-primary-500' : 'text-white'
                      }`}
                    >
                      {count}
                    </BadgeText>
                  </Badge>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

WeekDaysRow.displayName = 'WeekDaysRow';
