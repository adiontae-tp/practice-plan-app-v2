/**
 * Tag Detail Modal
 * Route: /(main)/tag-detail.tsx
 *
 * Modal for viewing/editing a tag with view/edit toggle.
 * Uses real Firebase data via Zustand store.
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
import { TPFooterButtons, TPAlert } from '@/components/tp';

export default function TagDetailScreen() {
  const router = useRouter();
  const {
    selectedTag,
    team,
    createTag,
    updateTag,
    deleteTag,
    tagCreating,
    tagUpdating,
    tagDeleting,
  } = useAppStore();

  const [name, setName] = useState('');
  const [isModalEditMode, setIsModalEditMode] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // Determine if editable
  const isEditable = isModalEditMode;
  const isSaving = tagCreating || tagUpdating || tagDeleting;
  const teamId = team?.id;

  // Initialize with selected tag
  useEffect(() => {
    if (selectedTag) {
      setName(selectedTag.name);
    }
  }, [selectedTag]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleSave = useCallback(async () => {
    if (!name.trim() || !teamId) return;

    try {
      if (selectedTag) {
        // Update existing tag
        await updateTag(teamId, selectedTag.id, { name: name.trim() });
      } else {
        // Create new tag
        await createTag(teamId, { name: name.trim(), col: 'tags' });
      }
      setIsModalEditMode(false);
      router.back();
    } catch (error) {
      console.error('Failed to save tag:', error);
      // Error is already set in the store
    }
  }, [selectedTag, name, teamId, createTag, updateTag, router]);

  const handleDelete = useCallback(() => {
    if (!isEditable) return;
    setShowDeleteAlert(true);
  }, [isEditable]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedTag || !teamId) return;

    try {
      await deleteTag(teamId, selectedTag.id);
      setShowDeleteAlert(false);
      router.back();
    } catch (error) {
      console.error('Failed to delete tag:', error);
      // Error is already set in the store
    }
  }, [selectedTag, teamId, deleteTag, router]);

  // Start in edit mode for new tags
  useEffect(() => {
    if (!selectedTag) {
      setIsModalEditMode(true);
    }
  }, [selectedTag]);

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
                  {selectedTag ? (isEditable ? 'Edit Tag' : 'View Tag') : 'Create Tag'}
                </Text>
                {/* Delete Button - Only show when editing existing tag */}
                {isEditable && selectedTag && (
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
              {/* Name Input */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-900 mb-2">
                  Tag Name
                </Text>
                <View className={`bg-white rounded-xl ${!isEditable ? 'opacity-60' : ''}`}>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Tag name"
                    placeholderTextColor="#9ca3af"
                    className="px-4 py-3.5 text-base text-gray-900"
                    editable={isEditable}
                  />
                </View>
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
              saveDisabled={!name.trim()}
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
        title="Delete Tag?"
        message={`Are you sure you want to delete "${selectedTag?.name}"?`}
        description="This will remove the tag from all activities and periods."
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        isLoading={isSaving}
        type="destructive"
      />
    </>
  );
}
