/**
 * Activity Edit Modal
 * Route: /(main)/activity-edit.tsx
 *
 * Modal for editing an activity's name, duration, and notes.
 * Notes support basic HTML formatting via toolbar.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { X, Trash2, Bold, Italic, List } from 'lucide-react-native';
import { useAppStore } from '@ppa/store';
import { TPFooterButtons, TPAlert, TPKeyboardAvoidingView } from '@/components/tp';

// Simple rich text toolbar component
interface RichTextToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onBullet: () => void;
}

function RichTextToolbar({ onBold, onItalic, onBullet }: RichTextToolbarProps) {
  return (
    <View className="flex-row items-center gap-1 px-3 py-2 border-b border-gray-200">
      <Pressable
        onPress={onBold}
        className="p-2 rounded-lg active:bg-gray-100"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Bold size={18} color="#374151" />
      </Pressable>
      <Pressable
        onPress={onItalic}
        className="p-2 rounded-lg active:bg-gray-100"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Italic size={18} color="#374151" />
      </Pressable>
      <Pressable
        onPress={onBullet}
        className="p-2 rounded-lg active:bg-gray-100"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <List size={18} color="#374151" />
      </Pressable>
    </View>
  );
}

export default function ActivityEditScreen() {
  const router = useRouter();
  const notesInputRef = useRef<TextInput>(null);

  // Get editing activity from store
  const editingActivity = useAppStore((state) => state.editingActivity);
  const clearEditingActivity = useAppStore((state) => state.clearEditingActivity);
  const setUpdatedActivity = useAppStore((state) => state.setUpdatedActivity);
  const setDeletedActivityIndex = useAppStore((state) => state.setDeletedActivityIndex);

  // Form state
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('15');
  const [notes, setNotes] = useState('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isModalEditMode, setIsModalEditMode] = useState(false);

  // Determine if we're in read-only mode (from the plan)
  const planIsReadOnly = !editingActivity?.planEditMode;
  // Modal is editable if either: plan is in edit mode, OR user tapped Edit
  const isEditable = !planIsReadOnly || isModalEditMode;

  // Initialize form with editing activity data
  useEffect(() => {
    if (editingActivity) {
      setName(editingActivity.activity.name || '');
      setDuration(String(editingActivity.activity.duration || 15));
      setNotes(editingActivity.activity.notes || '');
    }
  }, [editingActivity]);

  // Handlers
  const handleClose = useCallback(() => {
    clearEditingActivity();
    router.back();
  }, [router, clearEditingActivity]);

  const handleSave = useCallback(() => {
    if (!editingActivity) return;

    const durationNum = parseInt(duration, 10) || 15;

    // Create updated activity
    const updatedActivity = {
      ...editingActivity.activity,
      name: name.trim() || editingActivity.activity.name,
      duration: Math.max(1, Math.min(180, durationNum)),
      notes: notes.trim(),
    };

    // Pass back via store
    setUpdatedActivity({
      activity: updatedActivity,
      index: editingActivity.index,
    });

    clearEditingActivity();
    router.back();
  }, [editingActivity, name, duration, notes, setUpdatedActivity, clearEditingActivity, router]);

  const handleDelete = useCallback(() => {
    if (!isEditable) return;
    setShowDeleteAlert(true);
  }, [isEditable]);

  const handleConfirmDelete = useCallback(() => {
    if (!editingActivity) return;

    // Signal deletion via store
    setDeletedActivityIndex(editingActivity.index);
    clearEditingActivity();
    setShowDeleteAlert(false);
    router.back();
  }, [editingActivity, setDeletedActivityIndex, clearEditingActivity, router]);

  // Duration input handler - only allow numbers
  const handleDurationChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setDuration(numericText);
  };

  // Rich text toolbar handlers
  const insertTag = (openTag: string, closeTag: string) => {
    // Simple insertion at cursor or wrap selection
    // For basic implementation, append to end
    setNotes((prev) => `${prev}${openTag}${closeTag}`);
    notesInputRef.current?.focus();
  };

  const handleBold = () => insertTag('<b>', '</b>');
  const handleItalic = () => insertTag('<i>', '</i>');
  const handleBullet = () => {
    setNotes((prev) => `${prev}\n<li></li>`);
    notesInputRef.current?.focus();
  };

  // If no activity to edit, show nothing and go back
  if (!editingActivity) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 bg-[#e0e0e0] items-center justify-center">
          <Text className="text-gray-600">No activity to edit</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-[#e0e0e0]">
        {/* Header with Safe Area */}
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#356793' }}>
          <View className="px-5 py-4">
            <View className="flex-row items-center justify-between">
              <Pressable onPress={handleClose} className="p-2 -ml-2">
                <X size={24} color="#ffffff" />
              </Pressable>
              <Text className="text-xl font-semibold text-white">
                {isEditable ? 'Edit Period' : 'View Period'}
              </Text>
              {/* Delete Button - Only show when editable */}
              {isEditable && (
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

        <TPKeyboardAvoidingView>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View className="p-5">
              {/* Name Input */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-900 mb-2">
                  Name
                </Text>
                <View className={`bg-white rounded-xl ${!isEditable ? 'opacity-60' : ''}`}>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Period name"
                    placeholderTextColor="#9ca3af"
                    className="px-4 py-3.5 text-base text-gray-900"
                    editable={isEditable}
                  />
                </View>
              </View>

              {/* Duration - Number Input */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-900 mb-2">
                  Duration (minutes)
                </Text>
                <View className={`bg-white rounded-xl ${!isEditable ? 'opacity-60' : ''}`}>
                  <TextInput
                    value={duration}
                    onChangeText={handleDurationChange}
                    placeholder="15"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    className="px-4 py-3.5 text-base text-gray-900"
                    editable={isEditable}
                  />
                </View>
                <Text className="text-xs text-gray-500 mt-1 ml-1">
                  Enter duration in minutes (1-180)
                </Text>
              </View>

              {/* Notes with Rich Text Toolbar */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-900 mb-2">
                  Notes
                </Text>
                <View className={`bg-white rounded-xl overflow-hidden ${!isEditable ? 'opacity-60' : ''}`}>
                  {isEditable && (
                    <RichTextToolbar
                      onBold={handleBold}
                      onItalic={handleItalic}
                      onBullet={handleBullet}
                    />
                  )}
                  <TextInput
                    ref={notesInputRef}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Add notes with formatting..."
                    placeholderTextColor="#9ca3af"
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    className="px-4 py-3.5 text-base text-gray-900 min-h-[150px]"
                    editable={isEditable}
                  />
                </View>
                <Text className="text-xs text-gray-500 mt-1 ml-1">
                  {isEditable ? 'Use toolbar for formatting. HTML tags supported.' : 'Read-only view'}
                </Text>
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
        </TPKeyboardAvoidingView>
      </View>

      {/* Delete Confirmation Alert */}
      <TPAlert
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        title="Remove Period?"
        message={`Are you sure you want to remove "${name}" from this plan?`}
        description="This only removes it from this practice, not the template."
        cancelLabel="Cancel"
        confirmLabel="Remove"
        onConfirm={handleConfirmDelete}
        type="destructive"
      />
    </>
  );
}
