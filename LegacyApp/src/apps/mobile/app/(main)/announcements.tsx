import React, { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Bell, Pin } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { useAppStore, useLazyAnnouncements } from '@ppa/store';
import { Announcement, AnnouncementPriority } from '@ppa/interfaces';
import { TPFooterButtons } from '@/components/tp';

function formatDate(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getPriorityColor(priority: AnnouncementPriority): string {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700';
    case 'low':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

interface AnnouncementCardProps {
  announcement: Announcement;
  isRead: boolean;
  onPress: () => void;
}

function AnnouncementCard({ announcement, isRead, onPress }: AnnouncementCardProps) {
  const priorityClasses = getPriorityColor(announcement.priority);

  return (
    <TouchableOpacity
      className={`rounded-xl p-4 mb-3 ${isRead ? 'bg-white' : 'bg-blue-50 border border-blue-200'}`}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-center gap-2">
          {announcement.isPinned && (
            <Pin size={14} color="#D97706" fill="#D97706" />
          )}
          <View className={`px-2 py-0.5 rounded ${priorityClasses}`}>
            <Text className={`text-xs font-medium capitalize`}>
              {announcement.priority}
            </Text>
          </View>
          {!isRead && (
            <View className="w-2 h-2 rounded-full bg-primary-500" />
          )}
        </View>
        <Text className="text-xs text-typography-500">
          {formatDate(announcement.createdAt)}
        </Text>
      </View>
      <Text 
        className={`text-base text-typography-900 mb-1 ${isRead ? 'font-medium' : 'font-bold'}`} 
        numberOfLines={1}
      >
        {announcement.title}
      </Text>
      <Text className="text-sm text-typography-600 mb-2" numberOfLines={2}>
        {announcement.message}
      </Text>
      <Text className="text-xs text-typography-500">
        By {announcement.createdBy}
      </Text>
    </TouchableOpacity>
  );
}

export default function AnnouncementsScreen() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const setAnnouncementsSelectedAnnouncement = useAppStore(
    (state) => state.setAnnouncementsSelectedAnnouncement
  );

  const { announcements, isLoading } = useLazyAnnouncements();

  const sortedAnnouncements = useMemo(() => {
    const now = Date.now();
    return [...announcements]
      .filter((a) => !a.scheduledAt || a.scheduledAt <= now)
      .sort((a, b) => {
        // Pinned items first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        // Then by date (most recent first)
        return b.createdAt - a.createdAt;
      });
  }, [announcements]);

  const isAnnouncementRead = useCallback(
    (announcement: Announcement) => {
      return announcement.readBy?.includes(user?.uid || '') ?? false;
    },
    [user?.uid]
  );

  const handleAddAnnouncement = useCallback(() => {
    setAnnouncementsSelectedAnnouncement(null);
    router.push('/announcement-detail' as never);
  }, [router, setAnnouncementsSelectedAnnouncement]);

  const handleAnnouncementTap = useCallback(
    (announcement: Announcement) => {
      setAnnouncementsSelectedAnnouncement(announcement);
      router.push('/announcement-detail' as never);
    },
    [router, setAnnouncementsSelectedAnnouncement]
  );

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Announcements' }} />
        <View className="flex-1 bg-background-200 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Announcements' }} />
      <View className="flex-1 bg-background-200">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4">
            {sortedAnnouncements.length === 0 ? (
              <View className="items-center justify-center py-20">
                <Bell size={48} color={COLORS.textMuted} />
                <Text className="text-lg font-semibold text-typography-700 mt-4">
                  No Announcements
                </Text>
                <Text className="text-sm text-typography-500 mt-1">
                  Team updates will appear here
                </Text>
              </View>
            ) : (
              <>
                <Text className="text-xs font-semibold text-typography-500 uppercase mb-3 ml-1">
                  Recent
                </Text>
                {sortedAnnouncements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    isRead={isAnnouncementRead(announcement)}
                    onPress={() => handleAnnouncementTap(announcement)}
                  />
                ))}
              </>
            )}
          </View>
        </ScrollView>

        <TPFooterButtons
          mode="view"
          onCancel={() => router.back()}
          onEdit={handleAddAnnouncement}
          cancelLabel="Close"
          editLabel="Add Announcement"
          canEdit={true}
        />
      </View>
    </>
  );
}
