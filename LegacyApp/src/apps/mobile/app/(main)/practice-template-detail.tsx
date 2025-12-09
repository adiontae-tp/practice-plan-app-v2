/**
 * Practice Template Detail Modal
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Text, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { X, Trash2 } from 'lucide-react-native';
import { useAppStore } from '@ppa/store';
import { TPFooterButtons, TPAlert } from '@/components/tp';

export default function PracticeTemplateDetailScreen() {
  const router = useRouter();
  const { selectedTag: selected } = useAppStore() as any;

  const [name, setName] = useState('');
  const [isModalEditMode, setIsModalEditMode] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEditable = isModalEditMode;

  useEffect(() => {
    if (selected) {
      setName(selected.name);
    }
  }, [selected]);

  useEffect(() => {
    if (!selected) {
      setIsModalEditMode(true);
    }
  }, [selected]);

  const handleClose = useCallback(() => router.back(), [router]);

  const handleSave = useCallback(() => {
    if (!name.trim()) return;
    setIsSaving(true);
    setTimeout(() => {
      console.log('Saving practice template:', name);
      setIsSaving(false);
      setIsModalEditMode(false);
      router.back();
    }, 500);
  }, [name, router]);

  const handleDelete = useCallback(() => {
    if (!isEditable) return;
    setShowDeleteAlert(true);
  }, [isEditable]);

  const handleConfirmDelete = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => {
      console.log('Deleting practice template');
      setIsSaving(false);
      setShowDeleteAlert(false);
      router.back();
    }, 500);
  }, [router]);

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
                  {selected ? (isEditable ? 'Edit' : 'View') : 'Create'} Practice Template
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
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-900 mb-2">Name</Text>
                <View className={`bg-white rounded-xl ${!isEditable ? 'opacity-60' : ''}`}>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Template name"
                    placeholderTextColor="#9ca3af"
                    className="px-4 py-3.5 text-base text-gray-900"
                    editable={isEditable}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

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

      <TPAlert
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        title="Delete Template?"
        message={`Are you sure you want to delete "${name}"?`}
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
