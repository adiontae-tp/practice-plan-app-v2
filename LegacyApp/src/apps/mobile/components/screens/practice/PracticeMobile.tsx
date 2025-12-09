import { View, Text, ScrollView, TouchableOpacity, ActionSheetIOS, Platform, Alert } from 'react-native';
import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity } from '@ppa/interfaces';
import { useAppStore } from '@ppa/store';
import { TPEmpty, TPFab, TPButton, TPAlert, TPSubscriptionBanner } from '@/components/tp';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MoreVertical,
  FileText,
} from 'lucide-react-native';
import { usePracticeSession, formatTimer, formatDurationShort } from '@/hooks/usePracticeSession';
import { useSubscription } from '@/hooks/useSubscription';
import { COLORS } from '@ppa/ui/branding';

// Helper function to format time from timestamp
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function PracticeMobile() {
  const router = useRouter();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { plans, setEditingActivity, setViewingNotes, deletePlan, user } = useAppStore();
  const team = useAppStore((state) => state.team);
  const canEdit = user?.isAdmin === 'true' || user?.isAdmin === true;

  // Check subscription for PDF and Share features
  const { checkFeature } = useSubscription();

  // Get today or nearest future plan from real data
  const todayOrFuturePlan = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      plans
        .filter((plan) => {
          const planDate = new Date(plan.startTime);
          planDate.setHours(0, 0, 0, 0);
          return planDate >= today;
        })
        .sort((a, b) => a.startTime - b.startTime)[0] || null
    );
  }, [plans]);

  // Get practice session state with live timer
  const session = usePracticeSession(todayOrFuturePlan);

  // Check if the plan is in the future (not today)
  const isPlanInFuture = useMemo(() => {
    if (!todayOrFuturePlan) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const planDate = new Date(todayOrFuturePlan.startTime);
    planDate.setHours(0, 0, 0, 0);
    return planDate > today;
  }, [todayOrFuturePlan]);

  const handleCreatePractice = useCallback(() => {
    router.push('/plan/new' as never);
  }, [router]);

  const handlePracticeTap = useCallback(() => {
    if (todayOrFuturePlan) {
      router.push(`/plan/${todayOrFuturePlan.id}` as never);
    }
  }, [router, todayOrFuturePlan]);

  const handleViewPdf = useCallback(() => {
    if (!todayOrFuturePlan) return;
    // Check subscription - shows paywall if not allowed
    if (!checkFeature('canExportPDF')) return;
    router.push(`/plan/${todayOrFuturePlan.id}/pdf` as never);
  }, [router, todayOrFuturePlan, checkFeature]);

  const handleShare = useCallback(() => {
    if (!todayOrFuturePlan) return;
    // Check subscription - shows paywall if not allowed
    if (!checkFeature('canShareFiles')) return;
    router.push(`/plan/${todayOrFuturePlan.id}/share` as never);
  }, [router, todayOrFuturePlan, checkFeature]);

  const handleDeletePractice = useCallback(() => {
    setShowDeleteAlert(true);
  }, []);

  // Open activity edit modal via Expo Router
  const handleOpenActivityModal = useCallback((activity: Activity, index: number) => {
    setEditingActivity({ activity, index, planEditMode: false });
    router.push('/activity-edit' as never);
  }, [setEditingActivity, router]);

  // Open notes view modal
  const handleViewNotes = useCallback((activity: Activity) => {
    if (activity.notes) {
      setViewingNotes({
        activityName: activity.name,
        notes: activity.notes,
      });
      router.push('/notes-view' as never);
    }
  }, [setViewingNotes, router]);

  const handleConfirmDelete = useCallback(async () => {
    if (!todayOrFuturePlan || !team?.id) return;
    setIsDeleting(true);
    try {
      await deletePlan(team.id, todayOrFuturePlan.id);
      setShowDeleteAlert(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete practice');
    } finally {
      setIsDeleting(false);
    }
  }, [todayOrFuturePlan, team?.id, deletePlan]);

  const handleMoreOptions = useCallback(() => {
    if (!todayOrFuturePlan) return;

    if (Platform.OS === 'ios') {
      // Show different options based on edit permissions
      const options = canEdit
        ? ['Cancel', 'Edit Plan', 'View PDF', 'Share Plan', 'Delete']
        : ['Cancel', 'View Plan', 'View PDF', 'Share Plan'];
      const destructiveIndex = canEdit ? 4 : undefined;

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex: destructiveIndex,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (canEdit) {
            switch (buttonIndex) {
              case 1:
                handlePracticeTap();
                break;
              case 2:
                handleViewPdf();
                break;
              case 3:
                handleShare();
                break;
              case 4:
                handleDeletePractice();
                break;
            }
          } else {
            switch (buttonIndex) {
              case 1:
                handlePracticeTap();
                break;
              case 2:
                handleViewPdf();
                break;
              case 3:
                handleShare();
                break;
            }
          }
        }
      );
    } else {
      // Android fallback - show different options based on edit permissions
      const options = canEdit
        ? [
            { text: 'Edit Plan', onPress: handlePracticeTap },
            { text: 'View PDF', onPress: handleViewPdf },
            { text: 'Share Plan', onPress: handleShare },
            { text: 'Delete', onPress: handleDeletePractice, style: 'destructive' as const },
            { text: 'Cancel', style: 'cancel' as const },
          ]
        : [
            { text: 'View Plan', onPress: handlePracticeTap },
            { text: 'View PDF', onPress: handleViewPdf },
            { text: 'Share Plan', onPress: handleShare },
            { text: 'Cancel', style: 'cancel' as const },
          ];

      Alert.alert('Practice Options', 'Choose an action', options);
    }
  }, [todayOrFuturePlan, canEdit, handlePracticeTap, handleViewPdf, handleShare, handleDeletePractice]);

  return (
    <View className="flex-1 bg-[#e0e0e0]">
      {/* Subscription Banner for free users */}
      <TPSubscriptionBanner />

      {todayOrFuturePlan && (
        <>
          {/* Time Display Banner - under header like plan screen */}
          <View className="bg-white px-5 py-3 border-b border-gray-200">
            <TouchableOpacity onPress={handlePracticeTap} activeOpacity={0.7}>
              <Text className="text-sm text-gray-600 text-center">
                {formatTime(todayOrFuturePlan.startTime)} -{' '}
                {formatTime(todayOrFuturePlan.endTime)}
                <Text className="text-gray-500">
                  {' '}
                  ({formatDurationShort(todayOrFuturePlan.duration)})
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {todayOrFuturePlan ? (
          <View className="px-5 pt-5 pb-24">
            {/* Future Practice Banner */}
            {isPlanInFuture && (
              <View className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 mb-3">
                <Text className="text-blue-700 text-xs text-center font-medium">
                  Upcoming practice on{' '}
                  {new Date(todayOrFuturePlan.startTime).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            )}

            {/* Active Practice Banner */}
            {session.isActive && (
              <View className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-3">
                <View className="flex-row items-center justify-center">
                  <View className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                  <Text className="text-green-700 text-sm font-semibold">
                    Practice In Progress
                  </Text>
                </View>
                <Text className="text-green-600 text-xs text-center mt-1">
                  {formatTimer(session.totalElapsed)} elapsed
                </Text>
              </View>
            )}

            {/* Practice Content */}
            <View className="bg-white rounded-xl p-4 shadow-card">
              {todayOrFuturePlan.activities.map((activity, index) => {
                const isCurrentActivity = session.isActive && session.currentActivityIndex === index;
                const isPastActivity =
                  session.isActive &&
                  session.currentActivityIndex !== null &&
                  index < session.currentActivityIndex;
                const hasNotes = activity.notes && activity.notes.trim().length > 0;

                return (
                  <TouchableOpacity
                    key={activity.id}
                    onPress={() => handleOpenActivityModal(activity, index)}
                    activeOpacity={0.7}
                    className={`pb-3 ${index < todayOrFuturePlan.activities.length - 1
                      ? 'border-b border-gray-100 mb-3'
                      : ''
                      }`}
                  >
                    {/* Activity Header with Active Indicator */}
                    <View className="flex-row items-start">
                      {/* Active Indicator Bar */}
                      <View className="mr-2 mt-1">
                        {isCurrentActivity ? (
                          <View className="w-1 h-4 rounded-full bg-primary-500" />
                        ) : isPastActivity ? (
                          <View className="w-1 h-4 rounded-full bg-green-400" />
                        ) : (
                          <View className="w-1 h-4 rounded-full bg-gray-200" />
                        )}
                      </View>

                      {/* Activity Info */}
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-1">
                          <View className="flex-row items-center flex-1">
                            <Text
                              className={`text-sm font-semibold ${isCurrentActivity
                                ? 'text-primary-600'
                                : isPastActivity
                                  ? 'text-gray-400'
                                  : 'text-gray-900'
                                }`}
                            >
                              {activity.name}
                            </Text>

                            {/* Notes Icon - opens notes modal */}
                            {hasNotes && !isPastActivity && (
                              <TouchableOpacity
                                onPress={(e) => {
                                  e.stopPropagation();
                                  handleViewNotes(activity);
                                }}
                                className="ml-2 p-1"
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              >
                                <FileText size={14} color={COLORS.textMuted} />
                              </TouchableOpacity>
                            )}
                          </View>

                          {/* Live Timer for Active Activity */}
                          {isCurrentActivity && session.timeRemaining > 0 && (
                            <View className="flex-row items-center bg-primary-50 px-2 py-0.5 rounded">
                              <Clock size={10} color={COLORS.primary} style={{ marginRight: 4 }} />
                              <Text className="text-xs font-medium text-primary-600">
                                {formatTimer(session.timeRemaining)}
                              </Text>
                            </View>
                          )}

                          {/* Completed checkmark for past activities */}
                          {isPastActivity && (
                            <View className="bg-green-100 px-2 py-0.5 rounded">
                              <Text className="text-xs text-green-600 font-medium">Done</Text>
                            </View>
                          )}
                        </View>

                        {/* Time and Duration Row */}
                        <View className="flex-row items-center justify-between">
                          <Text
                            className={`text-xs ${isPastActivity ? 'text-gray-400' : 'text-gray-600'
                              }`}
                          >
                            {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                          </Text>

                          {/* Duration display */}
                          <Text className="text-xs text-gray-500">
                            {formatDurationShort(activity.duration)}
                          </Text>
                        </View>

                        {/* Progress Bar for Active Activity */}
                        {isCurrentActivity && (
                          <View className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <View
                              className="h-full bg-primary-500 rounded-full"
                              style={{ width: `${session.progress * 100}%` }}
                            />
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Tap to Edit Hint */}
            <Text className="text-center text-xs text-gray-500 mt-4">
              Tap a period to edit this instance
            </Text>
          </View>
        ) : (
          <View className="py-16 px-5">
            <TPEmpty
              icon={CalendarIcon}
              title="No Practice Scheduled"
              message="Create a plan to start practicing"
            />
            {canEdit && (
              <View className="items-center mt-6">
                <TPButton action="primary" onPress={handleCreatePractice} label="CREATE PLAN" />
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB - Show options when plan exists (for all users), Plus for creating new plan (editors only) */}
      {todayOrFuturePlan ? (
        <TPFab
          icon={MoreVertical}
          onPress={handleMoreOptions}
        />
      ) : canEdit ? (
        <TPFab
          icon={Plus}
          onPress={handleCreatePractice}
        />
      ) : null}

      {/* Delete Confirmation Alert */}
      <TPAlert
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        title="Delete Practice?"
        message="Are you sure you want to delete this practice?"
        description="This action cannot be undone."
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        type="destructive"
      />
    </View>
  );
}
