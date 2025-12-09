import { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity, ActionSheetIOS, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Calendar as CalendarIcon,
  Plus,
  MoreVertical,
  FileText,
  Share2,
  Trash2,
} from 'lucide-react-native';
import { useAppStore } from '@ppa/store';
import { Plan } from '@ppa/interfaces';
import {
  TPFab,
  TPCard,
  TPAlert,
  TPEmpty,
  TPButton,
  TPSubscriptionBanner,
  TPSegmentedControl,
} from '@/components/tp';
import { COLORS } from '@ppa/ui/branding';
import MonthGrid from './MonthGrid';
import { useCalendarExport } from '@/hooks/useCalendarExport';

// Constants
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Utility functions
function getSunday(date: Date): number {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function getWeekDays(weekStart: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  return days;
}

function formatWeekRange(weekStart: Date): string {
  const start = new Date(weekStart);
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const startDay = DAYS_SHORT[start.getDay()];
  const endDay = DAYS_SHORT[end.getDay()];
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });

  if (start.getMonth() === end.getMonth()) {
    return `${startDay} ${start.getDate()} - ${endDay} ${end.getDate()} ${startMonth}`;
  }
  return `${startDay} ${start.getDate()} ${startMonth} - ${endDay} ${end.getDate()} ${endMonth}`;
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function isSameWeek(date: Date, weekStart: Date): boolean {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return (
    date.getTime() >= weekStart.getTime() &&
    date.getTime() <= weekEnd.getTime()
  );
}

function getPlansForWeek(plans: Plan[], weekStart: Date): Plan[] {
  return plans
    .filter((plan) => isSameWeek(new Date(plan.startTime), weekStart))
    .sort((a, b) => a.startTime - b.startTime);
}

const VIEW_MODE_OPTIONS = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
];

export default function CalendarMobile() {
  const router = useRouter();
  // Plans are auto-synced from DataContext to the store
  const { plans, deletePlan, team } = useAppStore();

  // Calendar UI state from store
  const calendarViewMode = useAppStore((state) => state.calendarViewMode);
  const setCalendarViewMode = useAppStore((state) => state.setCalendarViewMode);
  const calendarCurrentMonth = useAppStore((state) => state.calendarCurrentMonth);
  const setCalendarCurrentMonth = useAppStore((state) => state.setCalendarCurrentMonth);
  const calendarSelectedDate = useAppStore((state) => state.calendarSelectedDate);
  const setCalendarSelectedDate = useAppStore((state) => state.setCalendarSelectedDate);
  const calendarNavigateMonth = useAppStore((state) => state.calendarNavigateMonth);

  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    getSunday(new Date())
  );
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const canEdit = true;

  // Calendar export hook
  const { exportToCalendar } = useCalendarExport();

  // Memoized values
  const weekStartDate = useMemo(
    () => new Date(currentWeekStart),
    [currentWeekStart]
  );
  const weekDays = useMemo(() => getWeekDays(weekStartDate), [weekStartDate]);
  const plansForWeek = useMemo(
    () => getPlansForWeek(plans, weekStartDate),
    [plans, weekStartDate]
  );
  const weekRange = useMemo(
    () => formatWeekRange(weekStartDate),
    [weekStartDate]
  );
  const isCurrentWeek = useMemo(
    () => isSameWeek(new Date(), weekStartDate),
    [weekStartDate]
  );

  // Group plans by date
  const practicesByDate = useMemo(() => {
    const grouped: Record<string, Plan[]> = {};
    plansForWeek.forEach((plan) => {
      const date = new Date(plan.startTime);
      const dateKey = date.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(plan);
    });
    return grouped;
  }, [plansForWeek]);

  // Handlers
  const handlePreviousWeek = useCallback(() => {
    setCurrentWeekStart((prev) => prev - WEEK_IN_MS);
  }, []);

  const handleNextWeek = useCallback(() => {
    setCurrentWeekStart((prev) => prev + WEEK_IN_MS);
  }, []);

  const handleCurrentWeek = useCallback(() => {
    setCurrentWeekStart(getSunday(new Date()));
  }, []);

  const handlePracticePress = useCallback(
    (planId: string) => {
      router.push(`/plan/${planId}` as never);
    },
    [router]
  );

  const handleAddToCalendar = useCallback(
    async (planId: string) => {
      const plan = plans.find((p) => p.id === planId);
      if (plan) {
        await exportToCalendar(plan);
      }
    },
    [plans, exportToCalendar]
  );

  const handleMenuPress = useCallback(
    (planId: string) => {
      setSelectedPlanId(planId);

      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Cancel', 'Add to Calendar', 'View PDF', 'Share', 'Delete'],
            destructiveButtonIndex: 4,
            cancelButtonIndex: 0,
          },
          (buttonIndex) => {
            switch (buttonIndex) {
              case 1:
                handleAddToCalendar(planId);
                break;
              case 2:
                router.push(`/plan/${planId}/pdf` as never);
                break;
              case 3:
                router.push(`/plan/${planId}/share` as never);
                break;
              case 4:
                setPlanToDelete(planId);
                setDeleteAlertOpen(true);
                break;
            }
          }
        );
      } else {
        // Android fallback
        Alert.alert('Plan Options', 'Choose an action', [
          { text: 'Add to Calendar', onPress: () => handleAddToCalendar(planId) },
          { text: 'View PDF', onPress: () => router.push(`/plan/${planId}/pdf` as never) },
          { text: 'Share', onPress: () => router.push(`/plan/${planId}/share` as never) },
          {
            text: 'Delete', onPress: () => {
              setPlanToDelete(planId);
              setDeleteAlertOpen(true);
            }, style: 'destructive'
          },
          { text: 'Cancel', style: 'cancel' },
        ]);
      }
    },
    [router, handleAddToCalendar]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!planToDelete || !team?.id) return;

    setIsDeleting(true);
    try {
      await deletePlan(team.id, planToDelete);
      setDeleteAlertOpen(false);
      setPlanToDelete(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete practice');
    } finally {
      setIsDeleting(false);
    }
  }, [planToDelete, team?.id, deletePlan]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteAlertOpen(false);
    setPlanToDelete(null);
  }, []);

  const handleFabPress = useCallback(() => {
    router.push('/plan/new' as never);
  }, [router]);

  // Month view handlers
  const handleMonthDateSelect = useCallback((date: Date) => {
    setCalendarSelectedDate(date);
    // Switch to week view when a date is selected to show practices
    setCurrentWeekStart(getSunday(date));
  }, [setCalendarSelectedDate]);

  const handleGoToToday = useCallback(() => {
    const today = new Date();
    setCalendarSelectedDate(today);
    setCalendarCurrentMonth(today);
    setCurrentWeekStart(getSunday(today));
  }, [setCalendarSelectedDate, setCalendarCurrentMonth]);

  return (
    <View className="flex-1 bg-[#e0e0e0]">
      {/* Subscription Banner for free users */}
      <TPSubscriptionBanner />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* View Mode Toggle */}
        <View className="px-5 pt-5 pb-2">
          <TPSegmentedControl
            options={VIEW_MODE_OPTIONS}
            value={calendarViewMode}
            onChange={(value) => setCalendarViewMode(value as 'week' | 'month')}
          />
        </View>

        {/* Month View */}
        {calendarViewMode === 'month' && (
          <MonthGrid
            currentMonth={calendarCurrentMonth}
            selectedDate={calendarSelectedDate}
            plans={plans}
            onDateSelect={handleMonthDateSelect}
            onPreviousMonth={() => calendarNavigateMonth('prev')}
            onNextMonth={() => calendarNavigateMonth('next')}
            onGoToToday={handleGoToToday}
          />
        )}

        {/* Week View - only show when in week mode */}
        {calendarViewMode === 'week' && (
          <>
            {/* Week Days Row */}
            <View className="bg-white rounded-xl p-3 mx-5 mt-3 shadow-card">
          <View className="flex-row">
            {weekDays.map((date, index) => {
              const practicesOnThisDay = practicesByDate[date.toDateString()] || [];
              const isTodayDate = isToday(date);

              return (
                <View
                  key={index}
                  className={`flex-1 items-center py-2 rounded-lg ${isTodayDate ? 'bg-blue-50' : ''
                    }`}
                >
                  <Text
                    className={`text-xs font-semibold mb-1 ${isTodayDate ? 'text-primary-500' : 'text-gray-600'
                      }`}
                  >
                    {DAYS_SHORT[date.getDay()]}
                  </Text>
                  <Text
                    className={`text-lg font-bold ${isTodayDate ? 'text-primary-500' : 'text-gray-900'
                      }`}
                  >
                    {date.getDate()}
                  </Text>
                  {practicesOnThisDay.length > 0 && (
                    <View className="bg-secondary-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5 mt-1">
                      <Text className="text-white text-xs font-semibold">
                        {practicesOnThisDay.length}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Week Navigation */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-5">
          <TouchableOpacity
            onPress={handlePreviousWeek}
            className="bg-white rounded-full w-10 h-10 items-center justify-center shadow-card"
            activeOpacity={0.7}
          >
            <Text className="text-2xl font-semibold text-primary-500">‹</Text>
          </TouchableOpacity>

          <View className="flex-1 items-center px-4">
            <Text className="text-base font-semibold text-gray-900">
              {weekRange}
            </Text>
            {!isCurrentWeek && (
              <TouchableOpacity
                onPress={handleCurrentWeek}
                className="mt-1"
                activeOpacity={0.7}
              >
                <Text className="text-xs font-medium text-primary-500">
                  This Week
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={handleNextWeek}
            className="bg-white rounded-full w-10 h-10 items-center justify-center shadow-card"
            activeOpacity={0.7}
          >
            <Text className="text-2xl font-semibold text-primary-500">›</Text>
          </TouchableOpacity>
        </View>

        {/* Practices List */}
        {plansForWeek.length === 0 ? (
          <View className="py-16 px-5">
            <TPEmpty
              icon={CalendarIcon}
              title="No practices this week"
              message="Tap the + button to create a practice"
            />
          </View>
        ) : (
          <View className="px-5 pb-24">
            {plansForWeek.map((plan) => {
              const startDate = new Date(plan.startTime);
              const dayName = DAYS_SHORT[startDate.getDay()];
              const day = startDate.getDate();

              return (
                <TPCard
                  key={plan.id}
                  onPress={() => handlePracticePress(plan.id)}
                  onLongPress={() => handleMenuPress(plan.id)}
                >
                  <View className="flex-row items-center">
                    {/* Calendar Avatar */}
                    <View className="w-14 h-14 bg-primary-500 rounded-lg items-center justify-center mr-3">
                      <Text className="text-white text-xs font-semibold">
                        {dayName}
                      </Text>
                      <Text className="text-white text-xl font-bold">
                        {day}
                      </Text>
                    </View>

                    {/* Practice Info */}
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900 mb-1">
                        {formatFullDate(startDate)}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {formatTime(plan.startTime)} - {formatTime(plan.endTime)} ({formatDuration(plan.duration)})
                      </Text>
                    </View>

                    {/* Three-dot menu */}
                    <TouchableOpacity
                      onPress={() => handleMenuPress(plan.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      activeOpacity={0.7}
                    >
                      <MoreVertical size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                </TPCard>
              );
            })}
          </View>
        )}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      {canEdit && <TPFab icon={Plus} onPress={handleFabPress} />}

      {/* Delete Confirmation Alert */}
      <TPAlert
        isOpen={deleteAlertOpen}
        onClose={handleDeleteCancel}
        title="Delete Practice"
        message="Are you sure you want to delete this practice?"
        description="This action cannot be undone."
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        type="destructive"
      />
    </View>
  );
}
