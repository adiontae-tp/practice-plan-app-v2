/**
 * New Practice Plan Screen
 * Route: /(main)/plan/new.tsx
 *
 * Two-phase flow:
 * 1. Schedule selection (PlanScheduleForm)
 * 2. Activity builder (reusing plan detail patterns)
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, ScrollView, Text, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useAppStore } from '@ppa/store';
import {
  X,
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Plus,
  Trash2,
  Edit2,
  FileText,
} from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { Activity, Tag } from '@ppa/interfaces';
import {
  TPCard,
  TPFooterButtons,
  TPAlert,
  TPTag,
  TPToast,
  useToast,
} from '@/components/tp';
import PlanScheduleForm, {
  PlanScheduleFormData,
} from '@/components/forms/PlanScheduleForm';

// Utility functions
function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
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

function formatTimeRangeWithDuration(
  startTime: Date,
  duration: number
): string {
  const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
  return `${formatTime(startTime)} - ${formatTime(endTime)} (${formatDuration(duration)})`;
}

// Calculate activity start/end times based on plan start and cumulative durations
function getActivityTimes(
  activities: Activity[],
  index: number,
  planStartTime: number
): { start: number; end: number } {
  const minutesBefore = activities
    .slice(0, index)
    .reduce((sum, a) => sum + a.duration, 0);
  const start = planStartTime + minutesBefore * 60 * 1000;
  const end = start + activities[index].duration * 60 * 1000;
  return { start, end };
}

// Activity Card Component
interface ActivityCardProps {
  activity: Activity;
  index: number;
  totalCount: number;
  planStartTime: number;
  activities: Activity[];
  onPress?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
}

function ActivityCard({
  activity,
  index,
  totalCount,
  planStartTime,
  activities,
  onPress,
  onMoveUp,
  onMoveDown,
  onDelete,
}: ActivityCardProps) {
  const tags = activity.tags as Tag[] | string[];
  const { start, end } = getActivityTimes(activities, index, planStartTime);
  const canMoveUp = index > 0;
  const canMoveDown = index < totalCount - 1;

  return (
    <TPCard onPress={onPress}>
      <View className="flex-row items-start gap-2">
        {/* Drag Handle / Reorder Controls */}
        <View className="flex-col items-center justify-center gap-1 pt-1">
          {canMoveUp && (
            <Pressable
              onPress={onMoveUp}
              hitSlop={{ top: 8, bottom: 4, left: 8, right: 8 }}
            >
              <ChevronUp size={16} color="#666666" />
            </Pressable>
          )}
          <GripVertical size={16} color="#999999" />
          {canMoveDown && (
            <Pressable
              onPress={onMoveDown}
              hitSlop={{ top: 4, bottom: 8, left: 8, right: 8 }}
            >
              <ChevronDown size={16} color="#666666" />
            </Pressable>
          )}
        </View>

        {/* Activity Content */}
        <View className="flex-1">
          {/* Activity Details */}
          <View className="flex-row items-start justify-between mb-2">
            <Text className="text-base font-bold text-gray-900 flex-1 mr-2">
              {activity.name}
            </Text>

            {onDelete && (
              <Pressable onPress={onDelete}>
                <Trash2 size={18} color="#ef4444" />
              </Pressable>
            )}
          </View>

          <View className="flex-row items-center gap-3 mb-2">
            <Text className="text-xs text-gray-600">
              {formatTime(new Date(start))} - {formatTime(new Date(end))}
            </Text>
            <Text className="text-xs font-semibold text-primary-500">
              {formatDuration(activity.duration)}
            </Text>
          </View>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-2">
              {tags.map((tag, tagIndex) => {
                const tagLabel = typeof tag === 'string' ? tag : tag.name;
                const tagKey = typeof tag === 'string' ? `${tagIndex}` : tag.id;
                return <TPTag key={tagKey} label={tagLabel} />;
              })}
            </View>
          )}

          {/* Notes */}
          {activity.notes && (
            <View className="bg-gray-50 rounded-lg p-3 mt-2">
              <Text className="text-sm text-gray-700">
                {activity.notes.replace(/<[^>]*>/g, '')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TPCard>
  );
}

// Empty State Component
interface EmptyStateProps {
  onAddPeriods: () => void;
  onUseTemplate: () => void;
}

function EmptyState({ onAddPeriods, onUseTemplate }: EmptyStateProps) {
  return (
    <View className="px-5 pt-8 pb-24">
      <View className="bg-white rounded-xl p-8 items-center">
        <View className="bg-primary-50 rounded-full p-4 mb-4">
          <CalendarIcon size={32} color="#356793" />
        </View>

        <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
          Build Your Practice Plan
        </Text>
        <Text className="text-sm text-gray-600 text-center mb-6">
          Add periods from your library or use a template
        </Text>

        <View className="w-full gap-3">
          <TouchableOpacity
            onPress={onAddPeriods}
            className="bg-primary-500 rounded-lg py-3.5 px-4 flex-row items-center justify-center gap-2"
            activeOpacity={0.8}
          >
            <Plus size={20} color="#ffffff" />
            <Text className="text-base font-semibold text-white">Add Periods</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onUseTemplate}
            className="bg-white rounded-lg py-3.5 px-4 flex-row items-center justify-center gap-2 border-2 border-primary-500"
            activeOpacity={0.8}
          >
            <FileText size={20} color="#356793" />
            <Text className="text-base font-semibold text-primary-500">
              Use Template
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Main Component
export default function NewPlanScreen() {
  const router = useRouter();
  const { toast, success, hideToast } = useToast();

  // Phase state: 'schedule' or 'builder'
  const [phase, setPhase] = useState<'schedule' | 'builder'>('schedule');

  // Schedule data from phase 1
  const [scheduleData, setScheduleData] = useState<PlanScheduleFormData | null>(null);

  // Plan state for phase 2 (activity builder)
  const [activities, setActivities] = useState<Activity[]>([]);

  // UI state
  const [isCreating, setIsCreating] = useState(false);
  const [discardAlertOpen, setDiscardAlertOpen] = useState(false);

  // Get selected periods from store (from period selector modal)
  const selectedPeriodActivities = useAppStore(
    (state) => state.selectedPeriodActivities
  );
  const clearSelectedPeriodActivities = useAppStore(
    (state) => state.clearSelectedPeriodActivities
  );

  // Add selected periods to the plan when they come back from the modal
  useEffect(() => {
    if (selectedPeriodActivities && selectedPeriodActivities.length > 0) {
      setActivities((prev) => [...prev, ...selectedPeriodActivities]);
      clearSelectedPeriodActivities();
    }
  }, [selectedPeriodActivities, clearSelectedPeriodActivities]);

  // Get updated activity from store (from activity edit modal)
  const updatedActivity = useAppStore((state) => state.updatedActivity);
  const clearUpdatedActivity = useAppStore((state) => state.clearUpdatedActivity);

  // Update activity when it comes back from the edit modal
  useEffect(() => {
    if (updatedActivity) {
      setActivities((prev) => {
        const newActivities = [...prev];
        newActivities[updatedActivity.index] = updatedActivity.activity;
        return newActivities;
      });
      clearUpdatedActivity();
    }
  }, [updatedActivity, clearUpdatedActivity]);

  // Computed values
  const totalDuration = useMemo(() => {
    return activities.reduce((sum, a) => sum + a.duration, 0);
  }, [activities]);

  const hasChanges = useMemo(() => {
    return activities.length > 0;
  }, [activities]);

  // Plan start time from schedule data
  const planStartTime = useMemo(() => {
    if (!scheduleData) return Date.now();
    const date = scheduleData.startDate;
    const time = scheduleData.startTime;
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes(),
      0,
      0
    ).getTime();
  }, [scheduleData]);

  // Handlers
  const handleClose = useCallback(() => {
    if (phase === 'builder' && hasChanges) {
      setDiscardAlertOpen(true);
    } else if (phase === 'builder') {
      // Go back to schedule phase
      setPhase('schedule');
    } else {
      router.back();
    }
  }, [router, phase, hasChanges]);

  const handleDiscard = useCallback(() => {
    setDiscardAlertOpen(false);
    router.back();
  }, [router]);

  const { createPlan, user } = useAppStore();

  const handleScheduleSave = useCallback(async (data: PlanScheduleFormData) => {
    setScheduleData(data);

    if (data.scheduleType === 'single') {
      setPhase('builder');
    } else {
      if (!user?.teamRef?.id) return;

      setIsCreating(true);
      try {
        const selectedDays = data.days || [];
        const endDate = data.endDate || new Date(data.startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const currentDate = new Date(data.startDate);
        const createdPlans: Promise<void>[] = [];

        // Generate a shared seriesId for all recurring plans
        const seriesId = `series_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        while (currentDate <= endDate) {
          const dayOfWeek = currentDate.getDay();
          const dayMap: Record<number, string> = {
            0: 'sunday',
            1: 'monday',
            2: 'tuesday',
            3: 'wednesday',
            4: 'thursday',
            5: 'friday',
            6: 'saturday',
          };
          const dayName = dayMap[dayOfWeek];

          if (selectedDays.includes(dayName)) {
            const startTime = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate(),
              data.startTime.getHours(),
              data.startTime.getMinutes()
            ).getTime();

            createdPlans.push(
              createPlan(user.teamRef.id, {
                uid: user.uid,
                startTime,
                endTime: startTime + 60 * 60 * 1000,
                duration: 60,
                activities: [],
                tags: [],
                readonly: false,
                col: 'blue',
                seriesId, // Link all recurring plans together
              })
            );
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }

        await Promise.all(createdPlans);
        const count = createdPlans.length;
        success(`${count} practice${count !== 1 ? 's' : ''} created!`);
        setTimeout(() => router.back(), 1500);
      } catch (error) {
        console.error('Failed to create plans:', error);
      } finally {
        setIsCreating(false);
      }
    }
  }, [router, success, createPlan, user]);

  const handleCreate = useCallback(async () => {
    if (!scheduleData || !user?.teamRef?.id) return;

    setIsCreating(true);
    try {
      await createPlan(user.teamRef.id, {
        uid: user.uid,
        startTime: planStartTime,
        endTime: planStartTime + totalDuration * 60 * 1000,
        duration: totalDuration,
        activities,
        tags: [],
        readonly: false,
        col: 'blue',
      });

      success('Practice created successfully!');
      setTimeout(() => router.back(), 1500);
    } catch (error) {
      console.error('Failed to create plan:', error);
      // toast.error('Failed to create plan');
    } finally {
      setIsCreating(false);
    }
  }, [router, scheduleData, activities, totalDuration, success, createPlan, user, planStartTime]);

  const handleCancel = useCallback(() => {
    if (hasChanges) {
      setDiscardAlertOpen(true);
    } else {
      setPhase('schedule');
    }
  }, [hasChanges]);

  const handleAddPeriods = useCallback(() => {
    router.push('/period-selector' as never);
  }, [router]);

  const handleUseTemplate = useCallback(() => {
    router.push('/template-selector' as never);
  }, [router]);

  const handleMoveActivity = useCallback((fromIndex: number, toIndex: number) => {
    setActivities((prev) => {
      const newActivities = [...prev];
      const [removed] = newActivities.splice(fromIndex, 1);
      newActivities.splice(toIndex, 0, removed);
      return newActivities;
    });
  }, []);

  // Instant delete - no confirmation needed
  const handleDeleteActivity = useCallback((index: number) => {
    setActivities((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Store the activity being edited for the modal
  const setEditingActivity = useAppStore((state) => state.setEditingActivity);

  const handleActivityTap = useCallback(
    (index: number) => {
      const activity = activities[index];
      if (activity) {
        // Store the activity and index for editing
        setEditingActivity({ activity, index });
        router.push('/activity-edit' as never);
      }
    },
    [activities, setEditingActivity, router]
  );

  // Phase 1: Schedule Form
  if (phase === 'schedule') {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 bg-[#e0e0e0]">
          {/* Header with Safe Area */}
          <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }}>
            <View className="px-5 py-4 flex-row items-center justify-between border-b border-gray-200">
              <Pressable onPress={() => router.back()}>
                <ArrowLeft size={24} color="#356793" />
              </Pressable>
              <Text className="text-xl font-semibold text-gray-900">
                Schedule Practice
              </Text>
              <View style={{ width: 24 }} />
            </View>
          </SafeAreaView>

          <PlanScheduleForm
            onSave={handleScheduleSave}
            onClose={() => router.back()}
            loading={isCreating}
            showHeader={false}
          />

          {/* Toast */}
          <TPToast
            visible={toast.visible}
            message={toast.message}
            type={toast.type}
            onDismiss={hideToast}
          />
        </View>
      </>
    );
  }

  // Phase 2: Activity Builder
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-[#e0e0e0]">
        {/* Custom Blue Header with Safe Area */}
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#356793' }}>
          <View className="px-5 py-4">
            <View className="flex-row items-center justify-between">
              {/* Close button on left */}
              <Pressable onPress={handleClose} className="p-2 -ml-2">
                <X size={24} color="#ffffff" />
              </Pressable>

              {/* Title in center */}
              <View className="flex-row items-center gap-2">
                <Edit2 size={16} color="#ffffff" />
                <Text className="text-xl font-semibold text-white">
                  {scheduleData ? formatDateShort(scheduleData.startDate) : 'New Practice'}
                </Text>
              </View>

              {/* Empty space on right for balance */}
              <View style={{ width: 28 }} />
            </View>
          </View>
        </SafeAreaView>

        {/* Time Display Bar */}
        <View className="bg-white px-5 py-3 border-b border-gray-200">
          <View className="flex-row items-center justify-center gap-2">
            <Edit2 size={14} color="#666666" />
            <Text className="text-sm text-gray-600 text-center">
              {scheduleData
                ? formatTimeRangeWithDuration(scheduleData.startTime, totalDuration || 60)
                : 'Set time'}
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Empty State */}
          {activities.length === 0 ? (
            <EmptyState
              onAddPeriods={handleAddPeriods}
              onUseTemplate={handleUseTemplate}
            />
          ) : (
            <View className="px-5 pt-5 pb-24">
              {/* Activities List */}
              <View className="gap-0.5">
                {activities.map((activity, index) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    index={index}
                    totalCount={activities.length}
                    planStartTime={planStartTime}
                    activities={activities}
                    onPress={() => handleActivityTap(index)}
                    onMoveUp={() => handleMoveActivity(index, index - 1)}
                    onMoveDown={() => handleMoveActivity(index, index + 1)}
                    onDelete={() => handleDeleteActivity(index)}
                  />
                ))}
              </View>

              {/* Add Period Button at Bottom */}
              <TouchableOpacity
                onPress={handleAddPeriods}
                className="mt-4 rounded-lg py-3 px-4 flex-row items-center justify-center gap-2 border-2 border-gray-300 bg-white"
                activeOpacity={0.8}
              >
                <Plus size={18} color="#666666" />
                <Text className="text-sm font-semibold text-gray-600">Add Period</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Footer Buttons */}
        <TPFooterButtons
          onCancel={handleCancel}
          onSave={handleCreate}
          saveLabel="Create"
          cancelLabel="Cancel"
          loading={isCreating}
          saveDisabled={isCreating || activities.length === 0}
        />

        {/* Discard Changes Confirmation */}
        <TPAlert
          isOpen={discardAlertOpen}
          onClose={() => setDiscardAlertOpen(false)}
          title="Discard Changes?"
          message="You have unsaved changes."
          description="Are you sure you want to leave?"
          cancelLabel="Keep Editing"
          confirmLabel="Discard"
          onConfirm={handleDiscard}
          type="destructive"
        />

        {/* Toast */}
        <TPToast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onDismiss={hideToast}
        />
      </View>
    </>
  );
}
