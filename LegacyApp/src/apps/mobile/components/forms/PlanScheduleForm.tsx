/**
 * PlanScheduleForm - Schedule Practice form for creating single or recurring practices
 *
 * Features:
 * - Single vs Multiple practice selection
 * - Repeat pattern (Daily/Weekly) for recurring practices
 * - Date range selection
 * - Day of week selection for weekly recurring
 * - Start time selection
 * - Dynamic feedback on number of practices to be created
 */
import React, { useState, useMemo } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '@ppa/ui/branding';
import {
  TPFooterButtons,
  TPSegmentedControl,
  TPDatePicker,
  TPTimePicker,
} from '@/components/tp';

export interface PlanScheduleFormData {
  scheduleType: 'single' | 'multiple';
  repeatPattern?: 'daily' | 'weekly';
  startDate: Date;
  endDate?: Date;
  startTime: Date;
  practiceDays?: string[];
}

interface PlanScheduleFormProps {
  initialData?: PlanScheduleFormData;
  onSave: (data: PlanScheduleFormData) => void | Promise<void>;
  onClose: () => void;
  loading?: boolean;
  showHeader?: boolean;
}

const DAYS_OF_WEEK = [
  { value: 'Sunday', label: 'Sun' },
  { value: 'Monday', label: 'Mon' },
  { value: 'Tuesday', label: 'Tue' },
  { value: 'Wednesday', label: 'Wed' },
  { value: 'Thursday', label: 'Thu' },
  { value: 'Friday', label: 'Fri' },
  { value: 'Saturday', label: 'Sat' },
];

/**
 * Calculate the number of practices between two dates based on the schedule
 */
function calculatePracticeCount(
  startDate: Date,
  endDate: Date,
  repeatPattern: 'daily' | 'weekly',
  practiceDays: string[]
): number {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  if (repeatPattern === 'daily') {
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  } else {
    // Weekly - count specific days between dates
    let count = 0;
    const current = new Date(start);
    const dayNames = DAYS_OF_WEEK.map((d) => d.value);
    const selectedIndices = practiceDays.map((day) => dayNames.indexOf(day));

    while (current <= end) {
      const dayIndex = current.getDay();
      if (selectedIndices.includes(dayIndex)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }
}

export default function PlanScheduleForm({
  initialData,
  onSave,
  onClose,
  loading = false,
  showHeader = true,
}: PlanScheduleFormProps) {
  // Form state
  const [scheduleType, setScheduleType] = useState<'single' | 'multiple'>(
    initialData?.scheduleType || 'single'
  );
  const [repeatPattern, setRepeatPattern] = useState<'daily' | 'weekly'>(
    initialData?.repeatPattern || 'weekly'
  );
  const [startDate, setStartDate] = useState<Date>(initialData?.startDate || new Date());
  const [endDate, setEndDate] = useState<Date>(
    initialData?.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
  );
  const [startTime, setStartTime] = useState<Date>(() => {
    if (initialData?.startTime) return initialData.startTime;
    const time = new Date();
    time.setHours(15, 0, 0, 0); // Default 3:00 PM
    return time;
  });
  const [practiceDays, setPracticeDays] = useState<string[]>(
    initialData?.practiceDays || ['Monday', 'Wednesday', 'Friday']
  );

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate practice count for recurring schedules
  const practiceCount = useMemo(() => {
    if (scheduleType === 'single') return 1;
    return calculatePracticeCount(startDate, endDate, repeatPattern, practiceDays);
  }, [scheduleType, startDate, endDate, repeatPattern, practiceDays]);

  // Helper text for the info box
  const getHelperText = (): string => {
    if (scheduleType === 'single') {
      return 'Duration and end time will be automatically calculated when you add activities to your practice plan.';
    }

    const daysList = practiceDays.join(', ');

    if (repeatPattern === 'daily') {
      return `This will create ${practiceCount} daily practice sessions between the selected dates. You can customize each practice individually after creation.`;
    } else {
      return `This will create ${practiceCount} practice sessions on ${daysList} between the selected dates. You can customize each practice individually after creation.`;
    }
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (scheduleType === 'multiple') {
      if (startDate > endDate) {
        newErrors.endDate = 'End date must be after start date';
      }

      if (repeatPattern === 'weekly' && practiceDays.length === 0) {
        newErrors.practiceDays = 'Select at least one practice day';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Toggle a day in the practice days array
  const togglePracticeDay = (day: string) => {
    setPracticeDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
    // Clear error when user selects a day
    if (errors.practiceDays) {
      setErrors((prev) => {
        const { practiceDays: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!validate()) return;

    const formData: PlanScheduleFormData = {
      scheduleType,
      startDate,
      startTime,
      ...(scheduleType === 'multiple' && {
        repeatPattern,
        endDate,
        ...(repeatPattern === 'weekly' && { practiceDays }),
      }),
    };

    await onSave(formData);
  };

  const isValid =
    scheduleType === 'single' ||
    (scheduleType === 'multiple' && practiceCount > 0);

  return (
    <View className="flex-1 bg-[#e0e0e0]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-5">
          {showHeader && (
            <View className="mb-6">
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                Schedule Practice
              </Text>
              <Text className="text-sm text-gray-600">
                Create one or multiple practice sessions
              </Text>
            </View>
          )}

          {/* Practice Schedule Type */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              Practice Schedule
            </Text>
            <TPSegmentedControl
              options={[
                { value: 'single', label: 'Single Practice' },
                { value: 'multiple', label: 'Multiple Practices' },
              ]}
              value={scheduleType}
              onChange={(val) => setScheduleType(val as 'single' | 'multiple')}
            />
          </View>

          {/* Single Practice Options */}
          {scheduleType === 'single' && (
            <>
              <View className="mb-5">
                <TPDatePicker
                  label="Date"
                  value={startDate}
                  onChange={setStartDate}
                  minimumDate={new Date()}
                />
              </View>

              <View className="mb-5">
                <TPTimePicker
                  label="Start Time"
                  value={startTime}
                  onChange={setStartTime}
                />
              </View>
            </>
          )}

          {/* Multiple Practice Options */}
          {scheduleType === 'multiple' && (
            <>
              {/* Repeat Pattern */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-900 mb-2">
                  Repeat Pattern
                </Text>
                <TPSegmentedControl
                  options={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                  ]}
                  value={repeatPattern}
                  onChange={(val) => setRepeatPattern(val as 'daily' | 'weekly')}
                />
              </View>

              {/* Practice Days (Weekly only) */}
              {repeatPattern === 'weekly' && (
                <View className="mb-5">
                  <Text className="text-sm font-semibold text-gray-900 mb-2">
                    Practice Days
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <TouchableOpacity
                        key={day.value}
                        onPress={() => togglePracticeDay(day.value)}
                        className={`px-4 py-2 rounded-lg ${
                          practiceDays.includes(day.value)
                            ? 'bg-primary-500'
                            : 'bg-gray-100'
                        }`}
                        activeOpacity={0.8}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            practiceDays.includes(day.value)
                              ? 'text-white'
                              : 'text-gray-700'
                          }`}
                        >
                          {day.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {errors.practiceDays && (
                    <Text className="text-sm text-red-600 mt-2">
                      {errors.practiceDays}
                    </Text>
                  )}
                </View>
              )}

              {/* Date Range */}
              <View className="mb-5">
                <TPDatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  minimumDate={new Date()}
                />
              </View>

              <View className="mb-5">
                <TPDatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  minimumDate={startDate}
                  error={errors.endDate}
                />
              </View>

              {/* Start Time */}
              <View className="mb-5">
                <TPTimePicker
                  label="Practice Start Time"
                  value={startTime}
                  onChange={setStartTime}
                />
                <Text className="text-xs text-gray-500 mt-2">
                  All practices will start at this time. You can adjust individual
                  practices after creation.
                </Text>
              </View>
            </>
          )}

          {/* Helper Text */}
          <View className="bg-gray-100 rounded-lg p-3">
            <Text className="text-xs text-gray-600 leading-5">{getHelperText()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <TPFooterButtons
        onCancel={onClose}
        onSave={handleSave}
        saveLabel={
          scheduleType === 'multiple'
            ? `Create ${practiceCount} Practice${practiceCount !== 1 ? 's' : ''}`
            : 'Create Practice'
        }
        loading={loading}
        saveDisabled={!isValid || loading}
      />
    </View>
  );
}
