/**
 * Plan Detail Screen - View/Edit Practice Plan
 * Route: /(main)/plan/[id].tsx
 *
 * Redesigned to match legacy PlanDetailMobile.tsx UI patterns
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, ScrollView, Text, Pressable, TouchableOpacity, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppStore } from '@ppa/store';
import {
  X,
  Calendar as CalendarIcon,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Plus,
  Trash2,
  Edit2,
  FileText,
  Repeat,
} from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { Plan, Activity, Tag } from '@ppa/interfaces';
import {
  TPCard,
  TPFooterButtons,
  TPAlert,
  TPTag,
  TPActionSheet,
} from '@/components/tp';

// Utility functions
function formatDateShort(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
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

function formatTimeRangeWithDuration(
  startTime: number,
  endTime: number,
  duration: number
): string {
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

// Sub-components
interface ActivityCardProps {
  activity: Activity;
  index: number;
  totalCount: number;
  planStartTime: number;
  activities: Activity[];
  isEditMode: boolean;
  onPress?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  onViewNotes?: () => void;
}

function ActivityCard({
  activity,
  index,
  totalCount,
  planStartTime,
  activities,
  isEditMode,
  onPress,
  onMoveUp,
  onMoveDown,
  onDelete,
  onViewNotes,
}: ActivityCardProps) {
  const tags = activity.tags as Tag[] | string[];
  const { start, end } = getActivityTimes(activities, index, planStartTime);
  const canMoveUp = index > 0;
  const canMoveDown = index < totalCount - 1;
  const hasNotes = activity.notes && activity.notes.trim().length > 0;

  return (
    <TPCard onPress={onPress}>
      <View className="flex-row items-start gap-2">
        {/* Drag Handle / Reorder Controls (Edit Mode Only) */}
        {isEditMode && (
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
        )}

        {/* Activity Content */}
        <View className="flex-1">
          {/* Activity Header - Name with Notes Icon and Delete */}
          <View className="flex-row items-start justify-between mb-2">
            <Text className="text-base font-bold text-gray-900 flex-1 mr-2">
              {activity.name}
            </Text>

            <View className="flex-row items-center gap-2">
              {/* Notes Icon Button */}
              {hasNotes && onViewNotes && (
                <Pressable
                  onPress={onViewNotes}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <FileText size={18} color="#666666" />
                </Pressable>
              )}

              {isEditMode && onDelete && (
                <Pressable onPress={onDelete}>
                  <Trash2 size={18} color="#ef4444" />
                </Pressable>
              )}
            </View>
          </View>

          {/* Time and Duration Row */}
          <View className="flex-row items-center gap-3 mb-2">
            <Text className="text-xs text-gray-600">
              {formatTime(start)} - {formatTime(end)}
            </Text>
            <Text className="text-xs font-semibold text-primary-500">
              {formatDuration(activity.duration)}
            </Text>
          </View>

          {/* Tags - at bottom of card */}
          {tags && tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2">
              {tags.map((tag, tagIndex) => {
                const tagLabel = typeof tag === 'string' ? tag : tag.name;
                const tagKey = typeof tag === 'string' ? `${tagIndex}` : tag.id;
                return <TPTag key={tagKey} label={tagLabel} />;
              })}
            </View>
          )}
        </View>
      </View>
    </TPCard>
  );
}

interface EmptyStateProps {
  isEditMode: boolean;
  onAddPeriods: () => void;
  onUseTemplate: () => void;
}

function EmptyState({ isEditMode, onAddPeriods, onUseTemplate }: EmptyStateProps) {
  return (
    <View className="px-5 pt-8 pb-24">
      <View className="bg-white rounded-xl p-8 items-center">
        <View className="bg-primary-50 rounded-full p-4 mb-4">
          <CalendarIcon size={32} color="#356793" />
        </View>

        <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
          {isEditMode ? 'Build Your Practice Plan' : 'No Activities'}
        </Text>
        <Text className="text-sm text-gray-600 text-center mb-6">
          {isEditMode
            ? 'Add periods from your library or use a template'
            : 'This practice plan has no activities yet'}
        </Text>

        {isEditMode && (
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
        )}
      </View>
    </View>
  );
}

// Main Component
export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // State
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [discardAlertOpen, setDiscardAlertOpen] = useState(false);

  // Series action state
  const [seriesActionSheetOpen, setSeriesActionSheetOpen] = useState(false);
  const [seriesActionType, setSeriesActionType] = useState<'edit' | 'delete' | null>(null);
  const [deleteSeriesMode, setDeleteSeriesMode] = useState<'single' | 'all'>('single');

  // Get plans from store
  const plans = useAppStore((state) => state.plans);
  const plansLoading = useAppStore((state) => state.plansLoading);

  // Find the plan from store data
  const plan = useMemo(() => {
    return plans.find((p) => p.id === id) || null;
  }, [plans, id]);

  // Editable state (copy of plan for editing)
  const [editedActivities, setEditedActivities] = useState<Activity[]>(
    plan?.activities || []
  );
  const [editedStartTime, setEditedStartTime] = useState<number>(
    plan?.startTime || Date.now()
  );
  
  // Date/Time Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Get user from store to check admin permissions
  const user = useAppStore((state) => state.user);
  const canEdit = plan ? !plan.readonly : false;
  const isAdmin = Boolean(user?.isAdmin && (user.isAdmin === 'true' || user.isAdmin === true || user.isAdmin === '1'));

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
      setEditedActivities((prev) => [...prev, ...selectedPeriodActivities]);
      clearSelectedPeriodActivities();
    }
  }, [selectedPeriodActivities, clearSelectedPeriodActivities]);

  // Get updated activity from store (from activity edit modal)
  const updatedActivity = useAppStore((state) => state.updatedActivity);
  const clearUpdatedActivity = useAppStore((state) => state.clearUpdatedActivity);

  // Update activity when it comes back from the edit modal
  useEffect(() => {
    if (updatedActivity) {
      setEditedActivities((prev) => {
        const newActivities = [...prev];
        newActivities[updatedActivity.index] = updatedActivity.activity;
        return newActivities;
      });
      clearUpdatedActivity();
    }
  }, [updatedActivity, clearUpdatedActivity]);

  // Handle deleted activity from the edit modal
  const deletedActivityIndex = useAppStore((state) => state.deletedActivityIndex);
  const clearDeletedActivityIndex = useAppStore((state) => state.clearDeletedActivityIndex);

  useEffect(() => {
    if (deletedActivityIndex !== null) {
      setEditedActivities((prev) => prev.filter((_, i) => i !== deletedActivityIndex));
      clearDeletedActivityIndex();
    }
  }, [deletedActivityIndex, clearDeletedActivityIndex]);

  const hasChanges = useMemo(() => {
    if (!plan) return false;
    const activitiesChanged = JSON.stringify(editedActivities) !== JSON.stringify(plan.activities);
    const startTimeChanged = editedStartTime !== plan.startTime;
    return activitiesChanged || startTimeChanged;
  }, [plan, editedActivities, editedStartTime]);

  // Calculate total duration from edited activities
  const totalDuration = useMemo(() => {
    return editedActivities.reduce((sum, a) => sum + a.duration, 0);
  }, [editedActivities]);

  // Calculate end time based on start time and total duration
  const calculatedEndTime = useMemo(() => {
    return editedStartTime + totalDuration * 60 * 1000;
  }, [editedStartTime, totalDuration]);

  // Handlers
  const handleClose = useCallback(() => {
    if (isEditMode && hasChanges) {
      setDiscardAlertOpen(true);
    } else {
      router.back();
    }
  }, [router, isEditMode, hasChanges]);

  const handleEdit = useCallback(() => {
    if (!plan) return;

    // Check if this is part of a series
    if (plan.seriesId) {
      const seriesPlans = getPlansInSeries(plan.seriesId);
      if (seriesPlans.length > 1) {
        // Show series action sheet
        setSeriesActionType('edit');
        setSeriesActionSheetOpen(true);
        return;
      }
    }

    // Single plan or only one in series - edit directly
    setEditedActivities([...plan.activities]);
    setEditedStartTime(plan.startTime);
    setIsEditMode(true);
  }, [plan, getPlansInSeries]);

  const handleCancelEdit = useCallback(() => {
    if (hasChanges) {
      setDiscardAlertOpen(true);
    } else {
      setIsEditMode(false);
    }
  }, [hasChanges]);

  // Date/Time Change Handlers
  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      const current = new Date(editedStartTime);
      current.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setEditedStartTime(current.getTime());
    }
  };

  const onChangeTime = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (selectedDate) {
      const current = new Date(editedStartTime);
      current.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setEditedStartTime(current.getTime());
    }
  };

  // Get store methods for CRUD operations
  const { updatePlan, deletePlan, getPlansInSeries, deletePlanSeries } = useAppStore();

  const handleSave = useCallback(async () => {
    if (!user?.teamRef?.id || !plan) return;

    setIsSaving(true);
    try {
      const totalDur = editedActivities.reduce((sum, a) => sum + a.duration, 0);
      await updatePlan(user.teamRef.id, plan.id, {
        activities: editedActivities,
        duration: totalDur,
        startTime: editedStartTime,
        endTime: editedStartTime + totalDur * 60 * 1000,
      });
      setIsEditMode(false);
    } catch (error) {
      console.error('Failed to save plan:', error);
    } finally {
      setIsSaving(false);
    }
  }, [user, plan, editedActivities, editedStartTime, updatePlan]);

  const handleDiscard = useCallback(() => {
    setDiscardAlertOpen(false);
    if (plan) {
      setEditedActivities([...plan.activities]);
      setEditedStartTime(plan.startTime);
    }
    setIsEditMode(false);
  }, [plan]);

  const handleDiscardAndClose = useCallback(() => {
    setDiscardAlertOpen(false);
    router.back();
  }, [router]);

  const handleDeletePlanPress = useCallback(() => {
    if (!plan) return;

    // Check if this is part of a series
    if (plan.seriesId) {
      const seriesPlans = getPlansInSeries(plan.seriesId);
      if (seriesPlans.length > 1) {
        // Show series action sheet
        setSeriesActionType('delete');
        setSeriesActionSheetOpen(true);
        return;
      }
    }

    // Single plan or only one in series - delete directly
    setDeleteSeriesMode('single');
    setDeleteAlertOpen(true);
  }, [plan, getPlansInSeries]);

  const handleDeletePlanConfirm = useCallback(async () => {
    if (!user?.teamRef?.id || !id || !plan) return;

    setIsDeleting(true);
    try {
      if (deleteSeriesMode === 'all' && plan.seriesId) {
        await deletePlanSeries(user.teamRef.id, plan.seriesId);
      } else {
        await deletePlan(user.teamRef.id, id);
      }
      setDeleteAlertOpen(false);
      router.back();
    } catch (error) {
      console.error('Failed to delete plan:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [user, id, plan, deleteSeriesMode, deletePlan, deletePlanSeries, router]);

  // Series action sheet handlers
  const handleSeriesEditThis = useCallback(() => {
    setSeriesActionSheetOpen(false);
    if (plan) {
      setEditedActivities([...plan.activities]);
      setEditedStartTime(plan.startTime);
      setIsEditMode(true);
    }
  }, [plan]);

  const handleSeriesEditAll = useCallback(() => {
    setSeriesActionSheetOpen(false);
    // For now, just edit this one - full series editing would need more UI work
    // This placeholder shows intent; actual series editing would update all plans
    if (plan) {
      setEditedActivities([...plan.activities]);
      setEditedStartTime(plan.startTime);
      setIsEditMode(true);
    }
  }, [plan]);

  const handleSeriesDeleteThis = useCallback(() => {
    setSeriesActionSheetOpen(false);
    setDeleteSeriesMode('single');
    setDeleteAlertOpen(true);
  }, []);

  const handleSeriesDeleteAll = useCallback(() => {
    setSeriesActionSheetOpen(false);
    setDeleteSeriesMode('all');
    setDeleteAlertOpen(true);
  }, []);

  const handleSeriesActionClose = useCallback(() => {
    setSeriesActionSheetOpen(false);
    setSeriesActionType(null);
  }, []);

  // Get series count for display
  const seriesCount = useMemo(() => {
    if (!plan?.seriesId) return 0;
    return getPlansInSeries(plan.seriesId).length;
  }, [plan?.seriesId, getPlansInSeries]);

  const handleAddPeriods = useCallback(() => {
    router.push('/period-selector' as never);
  }, [router]);

  const handleUseTemplate = useCallback(() => {
    router.push('/template-selector' as never);
  }, [router]);

  const handleMoveActivity = useCallback((fromIndex: number, toIndex: number) => {
    setEditedActivities((prev) => {
      const newActivities = [...prev];
      const [removed] = newActivities.splice(fromIndex, 1);
      newActivities.splice(toIndex, 0, removed);
      return newActivities;
    });
  }, []);

  // Instant delete - no confirmation needed
  const handleDeleteActivity = useCallback((index: number) => {
    setEditedActivities((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Store the activity being edited for the modal
  const setEditingActivity = useAppStore((state) => state.setEditingActivity);
  const setViewingNotes = useAppStore((state) => state.setViewingNotes);

  const handleActivityTap = useCallback(
    (index: number) => {
      const activity = editedActivities[index];
      if (activity) {
        // Store the activity and index for editing, with plan's edit mode
        setEditingActivity({ activity, index, planEditMode: isEditMode });
        router.push('/activity-edit' as never);
      }
    },
    [editedActivities, setEditingActivity, router, isEditMode]
  );

  const handleViewNotes = useCallback(
    (index: number) => {
      const activity = editedActivities[index];
      if (activity && activity.notes) {
        setViewingNotes({
          activityName: activity.name,
          notes: activity.notes,
        });
        router.push('/notes-view' as never);
      }
    },
    [editedActivities, setViewingNotes, router]
  );

  // Loading state
  if (plansLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 bg-[#e0e0e0]">
          <SafeAreaView edges={['top']} style={{ backgroundColor: '#356793' }}>
            <View className="px-5 py-4">
              <View className="flex-row items-center justify-center">
                <Text className="text-xl font-semibold text-white">Loading...</Text>
              </View>
            </View>
          </SafeAreaView>
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-600">Loading practice plan...</Text>
          </View>
        </View>
      </>
    );
  }

  // Not found state
  if (!plan) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 bg-[#e0e0e0]">
          <SafeAreaView edges={['top']} style={{ backgroundColor: '#ffffff' }}>
            <View className="px-5 py-4 flex-row items-center justify-between border-b border-gray-200">
              <Text className="text-xl font-semibold text-gray-900">Practice Plan</Text>
              <Pressable onPress={() => router.back()}>
                <X size={24} color="#666666" />
              </Pressable>
            </View>
          </SafeAreaView>
          <View className="flex-1 items-center justify-center px-6">
            <View className="bg-primary-50 rounded-full p-4 mb-4">
              <CalendarIcon size={32} color="#356793" />
            </View>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Plan not found
            </Text>
            <Text className="text-sm text-gray-600 text-center">
              This practice plan could not be found.
            </Text>
          </View>
        </View>
      </>
    );
  }

  const activities = isEditMode ? editedActivities : plan.activities;
  const displayDuration = isEditMode ? totalDuration : plan.duration;
  const displayEndTime = isEditMode ? calculatedEndTime : plan.endTime;

  return (
    <>
      {/* Hide the default Stack header */}
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

              {/* Date in center (clickable in edit mode) */}
              <Pressable
                onPress={() => {
                  if (isEditMode) {
                    setShowDatePicker(true);
                  }
                }}
                disabled={!isEditMode}
              >
                <View className="flex-row items-center gap-2">
                  {isEditMode && <Edit2 size={16} color="#ffffff" />}
                  <Text className="text-xl font-semibold text-white">
                    {formatDateShort(isEditMode ? editedStartTime : plan.startTime)}
                  </Text>
                </View>
              </Pressable>

              {/* Delete button on right (only in view mode when user can edit) */}
              {!isEditMode && (canEdit || isAdmin) ? (
                <Pressable
                  onPress={handleDeletePlanPress}
                  className="p-2 -mr-2"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Trash2 size={22} color="#ffffff" />
                </Pressable>
              ) : (
                <View style={{ width: 28 }} />
              )}
            </View>
          </View>
        </SafeAreaView>

        {/* Time Display Bar */}
        <Pressable
          onPress={() => {
            if (isEditMode) {
              setShowTimePicker(true);
            }
          }}
          disabled={!isEditMode}
        >
          <View className="bg-white px-5 py-3 border-b border-gray-200">
            <View className="flex-row items-center justify-center gap-2">
              {isEditMode && <Edit2 size={14} color="#666666" />}
              <Text className="text-sm text-gray-600 text-center">
                {formatTimeRangeWithDuration(
                  isEditMode ? editedStartTime : plan.startTime,
                  displayEndTime,
                  displayDuration
                )}
              </Text>
            </View>
          </View>
        </Pressable>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Empty State */}
          {activities.length === 0 ? (
            <EmptyState
              isEditMode={isEditMode}
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
                    planStartTime={isEditMode ? editedStartTime : plan.startTime}
                    activities={activities}
                    isEditMode={isEditMode}
                    onPress={() => handleActivityTap(index)}
                    onMoveUp={() => handleMoveActivity(index, index - 1)}
                    onMoveDown={() => handleMoveActivity(index, index + 1)}
                    onDelete={() => handleDeleteActivity(index)}
                    onViewNotes={() => handleViewNotes(index)}
                  />
                ))}
              </View>

              {/* Add Period Button at Bottom (Edit Mode Only) */}
              {isEditMode && (
                <TouchableOpacity
                  onPress={handleAddPeriods}
                  className="mt-4 rounded-lg py-3 px-4 flex-row items-center justify-center gap-2 border-2 border-gray-300 bg-white"
                  activeOpacity={0.8}
                >
                  <Plus size={18} color="#666666" />
                  <Text className="text-sm font-semibold text-gray-600">Add Period</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>

        {/* Footer Buttons */}
        {isEditMode ? (
          <TPFooterButtons
            onCancel={handleCancelEdit}
            onSave={handleSave}
            saveLabel="Save"
            cancelLabel="Cancel"
            loading={isSaving}
            saveDisabled={isSaving || activities.length === 0}
          />
        ) : (
          <TPFooterButtons
            mode="view"
            onCancel={handleClose}
            onEdit={handleEdit}
            cancelLabel="Close"
            editLabel="Edit"
            canEdit={canEdit || isAdmin}
          />
        )}

        {/* Delete Plan Confirmation */}
        <TPAlert
          isOpen={deleteAlertOpen}
          onClose={() => setDeleteAlertOpen(false)}
          title={deleteSeriesMode === 'all' ? 'Delete All in Series' : 'Delete Plan'}
          message={
            deleteSeriesMode === 'all'
              ? `Are you sure you want to delete all ${seriesCount} practices in this series?`
              : 'Are you sure you want to delete this practice plan?'
          }
          description="This action cannot be undone."
          cancelLabel="Cancel"
          confirmLabel={deleteSeriesMode === 'all' ? 'Delete All' : 'Delete'}
          onConfirm={handleDeletePlanConfirm}
          isLoading={isDeleting}
          type="destructive"
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
          onConfirm={isEditMode && !hasChanges ? handleDiscard : handleDiscardAndClose}
          type="destructive"
        />

        {/* Date Picker */}
        {showDatePicker && (
          Platform.OS === 'ios' ? (
            <Modal
              transparent
              animationType="fade"
              visible={showDatePicker}
              onRequestClose={() => setShowDatePicker(false)}
            >
              <Pressable 
                className="flex-1 bg-black/50 justify-end"
                onPress={() => setShowDatePicker(false)}
              >
                <View className="bg-white pb-8">
                  <View className="flex-row justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                    <Text className="text-lg font-semibold text-gray-700">Select Date</Text>
                    <TouchableOpacity 
                      onPress={() => setShowDatePicker(false)}
                      className="bg-primary-500 px-4 py-2 rounded-lg"
                    >
                      <Text className="text-white font-semibold">Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={new Date(editedStartTime)}
                    mode="date"
                    display="spinner"
                    onChange={onChangeDate}
                    textColor="black"
                  />
                </View>
              </Pressable>
            </Modal>
          ) : (
            <DateTimePicker
              value={new Date(editedStartTime)}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )
        )}

        {/* Time Picker */}
        {showTimePicker && (
          Platform.OS === 'ios' ? (
            <Modal
              transparent
              animationType="fade"
              visible={showTimePicker}
              onRequestClose={() => setShowTimePicker(false)}
            >
              <Pressable 
                className="flex-1 bg-black/50 justify-end"
                onPress={() => setShowTimePicker(false)}
              >
                <View className="bg-white pb-8">
                  <View className="flex-row justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                    <Text className="text-lg font-semibold text-gray-700">Select Time</Text>
                    <TouchableOpacity 
                      onPress={() => setShowTimePicker(false)}
                      className="bg-primary-500 px-4 py-2 rounded-lg"
                    >
                      <Text className="text-white font-semibold">Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={new Date(editedStartTime)}
                    mode="time"
                    display="spinner"
                    onChange={onChangeTime}
                    textColor="black"
                  />
                </View>
              </Pressable>
            </Modal>
          ) : (
            <DateTimePicker
              value={new Date(editedStartTime)}
              mode="time"
              display="default"
              onChange={onChangeTime}
            />
          )
        )}

        {/* Series Action Sheet */}
        <TPActionSheet
          isOpen={seriesActionSheetOpen}
          onOpenChange={handleSeriesActionClose}
          detents={[0.35]}
        >
          <View className="pt-2">
            {/* Header */}
            <View className="flex-row items-center gap-3 mb-4">
              <View className="bg-primary-50 rounded-full p-2">
                <Repeat size={20} color="#356793" />
              </View>
              <View>
                <Text className="text-lg font-semibold text-gray-900">
                  {seriesActionType === 'edit' ? 'Edit Recurring Practice' : 'Delete Recurring Practice'}
                </Text>
                <Text className="text-sm text-gray-500">
                  This is part of a series of {seriesCount} practices
                </Text>
              </View>
            </View>

            {/* Options */}
            <View className="gap-2">
              {seriesActionType === 'edit' ? (
                <>
                  <TouchableOpacity
                    onPress={handleSeriesEditThis}
                    className="bg-white border border-gray-200 rounded-lg py-3.5 px-4"
                    activeOpacity={0.7}
                  >
                    <Text className="text-base font-medium text-gray-900">Edit this practice only</Text>
                    <Text className="text-sm text-gray-500 mt-0.5">Changes will only apply to this date</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSeriesEditAll}
                    className="bg-white border border-gray-200 rounded-lg py-3.5 px-4"
                    activeOpacity={0.7}
                  >
                    <Text className="text-base font-medium text-gray-900">Edit all in series</Text>
                    <Text className="text-sm text-gray-500 mt-0.5">Changes will apply to all {seriesCount} practices</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={handleSeriesDeleteThis}
                    className="bg-white border border-gray-200 rounded-lg py-3.5 px-4"
                    activeOpacity={0.7}
                  >
                    <Text className="text-base font-medium text-gray-900">Delete this practice only</Text>
                    <Text className="text-sm text-gray-500 mt-0.5">Other practices in the series will remain</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSeriesDeleteAll}
                    className="bg-white border border-red-200 rounded-lg py-3.5 px-4"
                    activeOpacity={0.7}
                  >
                    <Text className="text-base font-medium text-red-600">Delete all in series</Text>
                    <Text className="text-sm text-gray-500 mt-0.5">Remove all {seriesCount} practices</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Cancel */}
              <TouchableOpacity
                onPress={handleSeriesActionClose}
                className="mt-2 py-3"
                activeOpacity={0.7}
              >
                <Text className="text-base font-medium text-gray-500 text-center">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TPActionSheet>
      </View>
    </>
  );
}
