/**
 * Coach Detail Modal
 * Route: /(main)/coach-detail.tsx
 *
 * Modal for viewing/editing/adding a coach with view/edit toggle.
 * When adding a new coach, they are added directly with 'active' status.
 */
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
import { X, Trash2 } from 'lucide-react-native';
import { useAppStore } from '@ppa/store';
import { TPFooterButtons, TPAlert, TPSegmentedControl } from '@/components/tp';
import type { Coach } from '@ppa/interfaces';

const permissionOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Edit', value: 'edit' },
  { label: 'View', value: 'view' },
];

export default function CoachDetailScreen() {
  const router = useRouter();

  // Get store state and actions
  const team = useAppStore((state) => state.team);
  const createCoach = useAppStore((state) => state.createCoach);
  const updateCoach = useAppStore((state) => state.updateCoach);
  const deleteCoach = useAppStore((state) => state.deleteCoach);
  const coachesSelectedCoach = useAppStore((state) => state.coachesSelectedCoach);
  const setCoachesSelectedCoach = useAppStore((state) => state.setCoachesSelectedCoach);

  // Use the selected coach from the coaches UI slice
  const selectedCoach = coachesSelectedCoach as Coach | null;

  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'admin' | 'edit' | 'view'>('edit');
  const [isModalEditMode, setIsModalEditMode] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEditable = isModalEditMode;

  // Initialize with selected coach
  useEffect(() => {
    if (selectedCoach) {
      setEmail(selectedCoach.email);
      setPermission(selectedCoach.permission || 'view');
    }
  }, [selectedCoach]);

  const handleClose = useCallback(() => {
    setCoachesSelectedCoach(null);
    router.back();
  }, [router, setCoachesSelectedCoach]);

  const handleSave = useCallback(async () => {
    if (!email.trim() || !team?.id) return;

    setIsSaving(true);
    try {
      if (selectedCoach) {
        // Update existing coach
        await updateCoach(team.id, selectedCoach.id, {
          permission,
        });
      } else {
        // Add new coach with active status
        await createCoach(team.id, {
          email: email.trim().toLowerCase(),
          permission,
          status: 'active',
          col: `teams/${team.id}/coaches`,
          joinedAt: Date.now(),
        });
      }
      setCoachesSelectedCoach(null);
      setIsModalEditMode(false);
      router.back();
    } catch (error) {
      console.error('Failed to save coach:', error);
    } finally {
      setIsSaving(false);
    }
  }, [email, permission, team?.id, selectedCoach, createCoach, updateCoach, setCoachesSelectedCoach, router]);

  const handleDelete = useCallback(() => {
    if (!isEditable) return;
    setShowDeleteAlert(true);
  }, [isEditable]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedCoach || !team?.id) return;

    setIsSaving(true);
    try {
      await deleteCoach(team.id, selectedCoach.id);
      setCoachesSelectedCoach(null);
      setShowDeleteAlert(false);
      router.back();
    } catch (error) {
      console.error('Failed to delete coach:', error);
    } finally {
      setIsSaving(false);
    }
  }, [selectedCoach, team?.id, deleteCoach, setCoachesSelectedCoach, router]);

  // Start in edit mode for new coaches
  useEffect(() => {
    if (!selectedCoach) {
      setIsModalEditMode(true);
    }
  }, [selectedCoach]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 bg-[#e0e0e0]">
          {/* Header with Safe Area */}
          <SafeAreaView edges={['top']} style={{ backgroundColor: '#356793' }}>
            <View className="px-5 py-4">
              <View className="flex-row items-center justify-between">
                <Pressable onPress={handleClose} className="p-2 -ml-2">
                  <X size={24} color="#ffffff" />
                </Pressable>
                <Text className="text-xl font-semibold text-white">
                  {selectedCoach ? (isEditable ? 'Edit Coach' : 'View Coach') : 'Add Coach'}
                </Text>
                {isEditable && selectedCoach && (
                  <Pressable
                    onPress={handleDelete}
                    className="p-2 -mr-2"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Trash2 size={22} color="#ffffff" />
                  </Pressable>
                )}
                {!isEditable && <View style={{ width: 28 }} />}
              </View>
            </View>
          </SafeAreaView>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="p-5">
              {/* Email Input */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-900 mb-2">
                  Email
                </Text>
                <View className={`bg-white rounded-xl ${!isEditable ? 'opacity-60' : ''}`}>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="coach@example.com"
                    placeholderTextColor="#9ca3af"
                    className="px-4 py-3.5 text-base text-gray-900"
                    editable={isEditable}
                    keyboardType="email-address"
                  />
                </View>
              </View>

              {/* Permission */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-900 mb-2">
                  Permission
                </Text>
                {isEditable ? (
                  <TPSegmentedControl
                    options={permissionOptions}
                    selectedValue={permission}
                    onValueChange={(value) => setPermission(value as any)}
                  />
                ) : (
                  <View className="bg-white rounded-xl px-4 py-3.5 opacity-60">
                    <Text className="text-base text-gray-900">
                      {permissionOptions.find((o) => o.value === permission)?.label}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          {isEditable ? (
            <TPFooterButtons
              mode="edit"
              onCancel={handleClose}
              onSave={handleSave}
              cancelLabel="Cancel"
              saveLabel="Save"
              saveDisabled={!email.trim()}
              loading={isSaving}
            />
          ) : (
            <TPFooterButtons
              mode="view"
              onCancel={handleClose}
              onEdit={() => setIsModalEditMode(true)}
              cancelLabel="Close"
              editLabel="Edit"
              canEdit={true}
            />
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Delete Confirmation Alert */}
      <TPAlert
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        title="Remove Coach?"
        message={`Are you sure you want to remove ${selectedCoach?.email}?`}
        description="This coach will no longer have access to this team."
        cancelLabel="Cancel"
        confirmLabel="Remove"
        onConfirm={handleConfirmDelete}
        isLoading={isSaving}
        type="destructive"
      />
    </>
  );
}
