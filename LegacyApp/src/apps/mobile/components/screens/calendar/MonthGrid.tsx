import { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Plan } from '@ppa/interfaces';
import { COLORS } from '@ppa/ui/branding';

const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL_SIZE = (SCREEN_WIDTH - 40) / 7; // 40 = horizontal padding

interface MonthGridProps {
  currentMonth: Date;
  selectedDate: Date;
  plans: Plan[];
  onDateSelect: (date: Date) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onGoToToday?: () => void;
}

function isSameMonth(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function getMonthDays(date: Date): (Date | null)[] {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const days: (Date | null)[] = [];

  // Add empty cells for days before the first of the month
  const startDay = firstDayOfMonth.getDay();
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  return days;
}

function getPlansForDay(plans: Plan[], date: Date): Plan[] {
  return plans.filter((plan) => {
    const planDate = new Date(plan.startTime);
    return isSameDay(planDate, date);
  }).sort((a, b) => a.startTime - b.startTime);
}

export default function MonthGrid({
  currentMonth,
  selectedDate,
  plans,
  onDateSelect,
  onPreviousMonth,
  onNextMonth,
  onGoToToday,
}: MonthGridProps) {
  const monthDays = useMemo(() => getMonthDays(currentMonth), [currentMonth]);

  const monthLabel = useMemo(() =>
    currentMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    }),
    [currentMonth]
  );

  const today = new Date();
  const isViewingCurrentMonth = isSameMonth(currentMonth, today);

  // Group days into weeks
  const weeks = useMemo(() => {
    const result: (Date | null)[][] = [];
    for (let i = 0; i < monthDays.length; i += 7) {
      result.push(monthDays.slice(i, i + 7));
    }
    // Ensure last week has 7 days
    if (result.length > 0) {
      const lastWeek = result[result.length - 1];
      while (lastWeek.length < 7) {
        lastWeek.push(null);
      }
    }
    return result;
  }, [monthDays]);

  const handleDatePress = useCallback((day: Date) => {
    onDateSelect(day);
  }, [onDateSelect]);

  return (
    <View className="bg-white rounded-xl mx-5 mt-5 shadow-card overflow-hidden">
      {/* Month Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity
          onPress={onPreviousMonth}
          className="w-10 h-10 items-center justify-center rounded-full"
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={COLORS.primary[500]} />
        </TouchableOpacity>

        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-semibold text-gray-900">{monthLabel}</Text>
          {!isViewingCurrentMonth && onGoToToday && (
            <TouchableOpacity
              onPress={onGoToToday}
              className="px-3 py-1 bg-gray-100 rounded-full"
              activeOpacity={0.7}
            >
              <Text className="text-xs font-medium text-gray-600">Today</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={onNextMonth}
          className="w-10 h-10 items-center justify-center rounded-full"
          activeOpacity={0.7}
        >
          <ChevronRight size={24} color={COLORS.primary[500]} />
        </TouchableOpacity>
      </View>

      {/* Weekday Headers */}
      <View className="flex-row border-b border-gray-200 bg-gray-50">
        {WEEKDAY_HEADERS.map((day) => (
          <View key={day} className="flex-1 py-2 items-center">
            <Text className="text-xs font-medium text-gray-500">{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} className="flex-row">
            {week.map((day, dayIndex) => {
              if (!day) {
                return (
                  <View
                    key={`empty-${weekIndex}-${dayIndex}`}
                    className="flex-1 bg-gray-50/50 border-b border-r border-gray-100"
                    style={{ height: CELL_SIZE }}
                  />
                );
              }

              const dayPlans = getPlansForDay(plans, day);
              const isTodayDate = isToday(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

              return (
                <TouchableOpacity
                  key={day.toISOString()}
                  onPress={() => handleDatePress(day)}
                  activeOpacity={0.7}
                  className={`flex-1 border-b border-r border-gray-100 p-1 ${
                    isTodayDate ? 'bg-blue-50' : ''
                  } ${isSelected ? 'bg-primary-50' : ''} ${
                    !isCurrentMonth ? 'opacity-40' : ''
                  }`}
                  style={{ height: CELL_SIZE }}
                >
                  {/* Day number */}
                  <View
                    className={`w-6 h-6 items-center justify-center rounded-full ${
                      isTodayDate ? 'bg-primary-500' : ''
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        isTodayDate
                          ? 'text-white'
                          : isSelected
                          ? 'text-primary-500'
                          : 'text-gray-700'
                      }`}
                    >
                      {day.getDate()}
                    </Text>
                  </View>

                  {/* Practice count badge */}
                  {dayPlans.length > 0 && (
                    <View className="flex-1 items-center justify-center">
                      <View className="bg-secondary-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
                        <Text className="text-white text-[10px] font-semibold">
                          {dayPlans.length}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
