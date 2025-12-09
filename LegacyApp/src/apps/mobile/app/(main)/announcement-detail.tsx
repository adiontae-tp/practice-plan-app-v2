import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { X, Trash2, Bell, Mail } from 'lucide-react-native';
import { useAppStore } from '@ppa/store';
import { AnnouncementPriority, NotificationOptions } from '@ppa/interfaces';
import { sendAnnouncementNotifications } from '@ppa/firebase';
import { TPFooterButtons, TPAlert, TPSwitch } from '@/components/tp';

const priorityOptions: { value: AnnouncementPriority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

function getPriorityButtonStyle(
  priority: AnnouncementPriority,
  isSelected: boolean,
  isEditable: boolean
): string {
  if (!isEditable) {
    return isSelected ? 'bg-gray-300 opacity-60' : 'bg-gray-100 opacity-60';
  }
  if (isSelected) {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
    }
  }
  return 'bg-gray-100';
}

function getPriorityTextStyle(isSelected: boolean, isEditable: boolean): string {
  if (!isEditable) {
    return isSelected ? 'text-white' : 'text-gray-500';
  }
  return isSelected ? 'text-white' : 'text-gray-700';
}

export default function AnnouncementDetailScreen() {
  const router = useRouter();

  const team = useAppStore((state) => state.team);
  const user = useAppStore((state) => state.user);
  const selected = useAppStore((state) => state.announcementsSelectedAnnouncement);
  const createAnnouncement = useAppStore((state) => state.createAnnouncement);
  const updateAnnouncement = useAppStore((state) => state.updateAnnouncement);
  const deleteAnnouncement = useAppStore((state) => state.deleteAnnouncement);
  const markAnnouncementAsRead = useAppStore((state) => state.markAnnouncementAsRead);
  const setAnnouncementsSelectedAnnouncement = useAppStore(
    (state) => state.setAnnouncementsSelectedAnnouncement
  );

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('medium');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [sendPush, setSendPush] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [resendNotifications, setResendNotifications] = useState(false);

  const isCreateMode = !selected;
  const isEditable = isCreateMode || isEditMode;

  useEffect(() => {
    if (selected) {
      setTitle(selected.title);
      setMessage(selected.message);
      setPriority(selected.priority || 'medium');
      setIsEditMode(false);
      setResendNotifications(false);
      setSendPush(true);
      setSendEmail(false);

      if (team?.id && user?.uid && !selected.readBy?.includes(user.uid)) {
        markAnnouncementAsRead(team.id, selected.id, user.uid).catch(console.error);
      }
    } else {
      setTitle('');
      setMessage('');
      setPriority('medium');
      setIsEditMode(true);
      setSendPush(true);
      setSendEmail(false);
    }
  }, [selected, team?.id, user?.uid, markAnnouncementAsRead]);

  const handleClose = useCallback(() => {
    setAnnouncementsSelectedAnnouncement(null);
    router.back();
  }, [router, setAnnouncementsSelectedAnnouncement]);

  const handleSave = useCallback(async () => {
    if (!title.trim() || !message.trim() || !team?.id) return;

    setIsSaving(true);
    try {
      const notificationOptions: NotificationOptions = { sendPush, sendEmail };

      if (isCreateMode) {
        const createdByName = user?.fname && user?.lname
          ? `${user.fname} ${user.lname}`
          : user?.email || 'Unknown';

        const announcement = await createAnnouncement(team.id, {
          title: title.trim(),
          message: message.trim(),
          priority,
          createdBy: createdByName,
          createdAt: Date.now(),
          readBy: [],
          notificationOptions,
        });

        if (sendPush || sendEmail) {
          try {
            await sendAnnouncementNotifications(
              team.id,
              announcement.id,
              title.trim(),
              message.trim(),
              notificationOptions
            );
          } catch (notifError) {
            console.error('Failed to send notifications:', notifError);
          }
        }
      } else if (selected) {
        await updateAnnouncement(team.id, selected.id, {
          title: title.trim(),
          message: message.trim(),
          priority,
        });

        if (resendNotifications && (sendPush || sendEmail)) {
          try {
            await sendAnnouncementNotifications(
              team.id,
              selected.id,
              title.trim(),
              message.trim(),
              notificationOptions
            );
          } catch (notifError) {
            console.error('Failed to send notifications:', notifError);
          }
        }
      }
      setAnnouncementsSelectedAnnouncement(null);
      router.back();
    } catch (error) {
      console.error('Failed to save announcement:', error);
    } finally {
      setIsSaving(false);
    }
  }, [
    title,
    message,
    priority,
    team?.id,
    user,
    isCreateMode,
    selected,
    sendPush,
    sendEmail,
    resendNotifications,
    createAnnouncement,
    updateAnnouncement,
    setAnnouncementsSelectedAnnouncement,
    router,
  ]);

  const handleDelete = useCallback(() => {
    setShowDeleteAlert(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!team?.id || !selected) return;

    setIsSaving(true);
    try {
      await deleteAnnouncement(team.id, selected.id);
      setShowDeleteAlert(false);
      setAnnouncementsSelectedAnnouncement(null);
      router.back();
    } catch (error) {
      console.error('Failed to delete announcement:', error);
    } finally {
      setIsSaving(false);
    }
  }, [team?.id, selected, deleteAnnouncement, setAnnouncementsSelectedAnnouncement, router]);

  const handleCancelEdit = useCallback(() => {
    if (isCreateMode) {
      handleClose();
    } else if (selected) {
      setTitle(selected.title);
      setMessage(selected.message);
      setPriority(selected.priority || 'medium');
      setIsEditMode(false);
      setResendNotifications(false);
    }
  }, [isCreateMode, selected, handleClose]);

  const getHeaderTitle = () => {
    if (isCreateMode) return 'Create Announcement';
    if (isEditMode) return 'Edit Announcement';
    return 'Announcement';
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 bg-[#e0e0e0]">
          <SafeAreaView edges={['top']} style={{ backgroundColor: '#356793' }}>
            <View className="px-5 py-4">
              <View className="flex-row items-center justify-between">
                <Pressable onPress={handleClose} className="p-2 -ml-2">
                  <X size={24} color="#ffffff" />
                </Pressable>
                <Text className="text-xl font-semibold text-white">{getHeaderTitle()}</Text>
                {isEditable && !isCreateMode ? (
                  <Pressable onPress={handleDelete} className="p-2 -mr-2">
                    <Trash2 size={22} color="#ffffff" />
                  </Pressable>
                ) : (
                  <View style={{ width: 28 }} />
                )}
              </View>
            </View>
          </SafeAreaView>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="p-5">
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-900 mb-2">Title</Text>
                <View className={`bg-white rounded-xl ${!isEditable ? 'opacity-60' : ''}`}>
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Announcement title"
                    placeholderTextColor="#9ca3af"
                    className="px-4 py-3.5 text-base text-gray-900"
                    editable={isEditable}
                  />
                </View>
              </View>

              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-900 mb-2">Message</Text>
                <View className={`bg-white rounded-xl ${!isEditable ? 'opacity-60' : ''}`}>
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Announcement message"
                    placeholderTextColor="#9ca3af"
                    className="px-4 py-3.5 text-base text-gray-900"
                    editable={isEditable}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    style={{ minHeight: 120 }}
                  />
                </View>
              </View>

              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-900 mb-2">Priority</Text>
                <View className="flex-row gap-2">
                  {priorityOptions.map((option) => {
                    const isSelected = priority === option.value;
                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => isEditable && setPriority(option.value)}
                        className={`flex-1 py-3 rounded-xl items-center ${getPriorityButtonStyle(
                          option.value,
                          isSelected,
                          isEditable
                        )}`}
                        disabled={!isEditable}
                      >
                        <Text
                          className={`text-sm font-medium ${getPriorityTextStyle(
                            isSelected,
                            isEditable
                          )}`}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {isEditable && (
                <View className="mb-5 bg-white rounded-xl p-4">
                  {isCreateMode ? (
                    <>
                      <Text className="text-sm font-semibold text-gray-900 mb-3">
                        Notify Team Members
                      </Text>
                      <View className="gap-3">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-2">
                            <Bell size={16} color="#6b7280" />
                            <Text className="text-sm text-gray-700">Push Notification</Text>
                          </View>
                          <TPSwitch value={sendPush} onChange={setSendPush} />
                        </View>
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-2">
                            <Mail size={16} color="#6b7280" />
                            <Text className="text-sm text-gray-700">Email</Text>
                          </View>
                          <TPSwitch value={sendEmail} onChange={setSendEmail} />
                        </View>
                      </View>
                    </>
                  ) : (
                    <>
                      <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-sm font-semibold text-gray-900">
                          Resend Notifications
                        </Text>
                        <TPSwitch
                          value={resendNotifications}
                          onChange={setResendNotifications}
                        />
                      </View>
                      {resendNotifications && (
                        <View className="gap-3 pl-4 border-l-2 border-gray-200">
                          <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-2">
                              <Bell size={16} color="#6b7280" />
                              <Text className="text-sm text-gray-700">Push Notification</Text>
                            </View>
                            <TPSwitch value={sendPush} onChange={setSendPush} />
                          </View>
                          <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-2">
                              <Mail size={16} color="#6b7280" />
                              <Text className="text-sm text-gray-700">Email</Text>
                            </View>
                            <TPSwitch value={sendEmail} onChange={setSendEmail} />
                          </View>
                        </View>
                      )}
                    </>
                  )}
                </View>
              )}

              {!isCreateMode && selected && (
                <View className="mt-2">
                  <Text className="text-xs text-gray-500">
                    Created by {selected.createdBy} on{' '}
                    {new Date(selected.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {isEditable ? (
            <TPFooterButtons
              mode="edit"
              onCancel={handleCancelEdit}
              onSave={handleSave}
              cancelLabel="Cancel"
              saveLabel={isCreateMode ? 'Send' : 'Save'}
              saveDisabled={!title.trim() || !message.trim()}
              loading={isSaving}
            />
          ) : (
            <TPFooterButtons
              mode="view"
              onCancel={handleClose}
              onEdit={() => setIsEditMode(true)}
              cancelLabel="Close"
              editLabel="Edit"
              canEdit={true}
            />
          )}
        </View>
      </KeyboardAvoidingView>

      <TPAlert
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        title="Delete Announcement?"
        message={`Are you sure you want to delete "${title}"?`}
        description="This action cannot be undone."
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        isLoading={isSaving}
        type="destructive"
      />
    </>
  );
}
