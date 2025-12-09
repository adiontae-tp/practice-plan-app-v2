/**
 * Period Template Detail Modal
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Text, Pressable, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { X, Trash2 } from 'lucide-react-native';
import { useAppStore } from '@ppa/store';
import { TPFooterButtons, TPTag, TPRichTextEditor, TPRichTextDisplay, TPToast, useToast } from '@/components/tp';

export default function PeriodTemplateDetailScreen() {
  const router = useRouter();
  const { selectedTag: selected } = useAppStore() as any;

  // Get store data
  const tags = useAppStore((state) => state.tags);
  const tagsLoading = useAppStore((state) => state.tagsLoading);
  const team = useAppStore((state) => state.team);
  const deletePeriod = useAppStore((state) => state.deletePeriod);

  // Toast for feedback
  const { toast, success, error, hideToast } = useToast();

  const [name, setName] = useState('');
  const [duration, setDuration] = useState('15');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isModalEditMode, setIsModalEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEditable = isModalEditMode;
  const teamId = team?.id;

  useEffect(() => {
    if (selected) {
      setName(selected.name || '');
      setDuration(String(selected.duration || 15));
      setNotes(selected.notes || '');
      setSelectedTags(selected.tags || []);
    }
  }, [selected]);

  useEffect(() => {
    if (!selected) {
      setIsModalEditMode(true);
    }
  }, [selected]);

  const handleClose = useCallback(() => router.back(), [router]);

  const handleSave = useCallback(() => {
    if (!name.trim() || !duration) return;
    setIsSaving(true);
    setTimeout(() => {
      console.log('Saving period template:', { name, duration: Number(duration), notes, tags: selectedTags });
      setIsSaving(false);
      setIsModalEditMode(false);
      router.back();
    }, 500);
  }, [name, duration, notes, selectedTags, router]);

  const handleDelete = useCallback(() => {
    if (!isEditable || !selected) return;

    Alert.alert(
      'Delete Period?',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!selected || !teamId) {
              error('Unable to delete period. Please try again.');
              return;
            }

            try {
              await deletePeriod(teamId, selected.id);
              success('Period deleted successfully');
              router.back();
            } catch (err) {
              console.error('Failed to delete period:', err);
              error('Failed to delete period. Please try again.');
            }
          },
        },
      ]
    );
  }, [isEditable, selected, name, teamId, deletePeriod, router, success, error]);

  const toggleTag = useCallback((tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }, []);

  const handleDurationChange = useCallback((text: string) => {
    // Only allow numbers
    const numericValue = text.replace(/[^0-9]/g, '');
    setDuration(numericValue);
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-1 bg-[#e0e0e0]">
          <SafeAreaView edges={['top']} style={{ backgroundColor: '#356793' }}>
            <View className="px-5 py-4">
              <View className="flex-row items-center justify-between">
                <Pressable onPress={handleClose} className="p-2 -ml-2">
                  <X size={24} color="#ffffff" />
                </Pressable>
                <Text className="text-xl font-semibold text-white">
                  {selected ? (isEditable ? 'Edit' : 'View') : 'Create'} Period
                </Text>
                {isEditable && selected && (
                  <Pressable onPress={handleDelete} className="p-2 -mr-2">
                    <Trash2 size={22} color="#ffffff" />
                  </Pressable>
                )}
                {!isEditable && <View style={{ width: 28 }} />}
              </View>
            </View>
          </SafeAreaView>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View className="p-5">
              {/* Period Name */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-900 mb-2">
                  Period Name <Text className="text-red-500">*</Text>
                </Text>
                <View className={`bg-white rounded-xl ${!isEditable ? 'opacity-60' : ''}`}>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g., Warm Up, Drills, Scrimmage..."
                    placeholderTextColor="#9ca3af"
                    className="px-4 py-3.5 text-base text-gray-900"
                    editable={isEditable}
                  />
                </View>
              </View>

              {/* Duration */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-900 mb-2">
                  Duration (minutes) <Text className="text-red-500">*</Text>
                </Text>
                <View className={`bg-white rounded-xl ${!isEditable ? 'opacity-60' : ''}`}>
                  <TextInput
                    value={duration}
                    onChangeText={handleDurationChange}
                    placeholder="15"
                    placeholderTextColor="#9ca3af"
                    className="px-4 py-3.5 text-base text-gray-900"
                    editable={isEditable}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
              </View>

              {/* Tags */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-900 mb-2">Tags</Text>
                {tagsLoading ? (
                  <Text className="text-sm text-gray-400">Loading tags...</Text>
                ) : isEditable ? (
                  <View className="flex-row flex-wrap gap-2">
                    {tags.map((tag) => (
                      <TPTag
                        key={tag.id}
                        label={tag.name}
                        selected={selectedTags.includes(tag.id)}
                        onPress={() => toggleTag(tag.id)}
                      />
                    ))}
                  </View>
                ) : (
                  <View className="flex-row flex-wrap gap-2">
                    {selectedTags.length > 0 ? (
                      selectedTags.map((tagId) => {
                        const tag = tags.find((t) => t.id === tagId);
                        return tag ? (
                          <TPTag key={tag.id} label={tag.name} selected />
                        ) : null;
                      })
                    ) : (
                      <Text className="text-sm text-gray-400">No tags selected</Text>
                    )}
                  </View>
                )}
              </View>

              {/* Notes */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-900 mb-2">Notes</Text>
                {isEditable ? (
                  <TPRichTextEditor
                    value={notes}
                    onChange={setNotes}
                    placeholder="Add setup instructions, coaching points, or variations..."
                    disabled={!isEditable}
                    minHeight={150}
                  />
                ) : notes ? (
                  <View className="bg-white rounded-xl p-4">
                    <TPRichTextDisplay html={notes} />
                  </View>
                ) : (
                  <View className="bg-white rounded-xl p-4 opacity-60">
                    <Text className="text-sm text-gray-400">No notes</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {isEditable ? (
            <TPFooterButtons
              mode="edit"
              onCancel={handleClose}
              onSave={handleSave}
              cancelLabel="Cancel"
              saveLabel={selected ? 'Save' : 'Create'}
              saveDisabled={!name.trim() || !duration || Number(duration) < 1}
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

      {/* Toast for feedback */}
      <TPToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={hideToast}
      />
    </>
  );
}
