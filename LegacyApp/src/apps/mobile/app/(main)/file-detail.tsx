/**
 * File Detail Modal
 * Route: /(main)/file-detail.tsx
 *
 * Modal for viewing/uploading files with view/edit toggle.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { X, Trash2, Download, ExternalLink, Upload, Lock } from 'lucide-react-native';
import { useAppStore } from '@ppa/store';
import { COLORS } from '@ppa/ui/branding';
import { TPFooterButtons, TPAlert, TPSelect, TPUpgradeBanner } from '@/components/tp';
import { Input, InputField } from '@/components/ui/input';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { useSubscription } from '@/hooks/useSubscription';
import { File as FileType } from '@ppa/interfaces';

// File interface
interface FileItem {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'document' | 'video' | 'other';
  size: number;
  uploadedAt: number;
  url: string;
  description?: string;
  category?: string;
  tags?: string[];
}

// Categories
const FILE_CATEGORIES = [
  { value: 'playbook', label: 'Playbook' },
  { value: 'roster', label: 'Roster' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'media', label: 'Media' },
  { value: 'other', label: 'Other' },
];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function FileDetailScreen() {
  const router = useRouter();
  const { selectedTag, updateFile, deleteFile, team } = useAppStore();

  // Subscription check
  const { checkFeature, features, showPaywall } = useSubscription();
  const canUploadFiles = features.canUploadFiles;

  const file = selectedTag as FileType | null;

  const [isModalEditMode, setIsModalEditMode] = useState(!file); // Edit mode for new uploads
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for edit/upload
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
  });

  // Initialize with file data if viewing
  useEffect(() => {
    if (file) {
      setFormData({
        name: file.name,
        description: file.description || '',
        category: file.category || '',
      });
    }
  }, [file]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleSave = useCallback(async () => {
    // Check subscription before allowing file upload
    if (!file && !checkFeature('canUploadFiles')) {
      return; // Paywall will be shown automatically
    }

    if (!formData.name.trim() || !team?.id) return;

    setIsSaving(true);
    try {
      if (file) {
        await updateFile(team.id, file.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          category: formData.category || undefined,
        });
      }
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [formData, router, file, checkFeature, team?.id, updateFile]);

  const handleDelete = useCallback(() => {
    setShowDeleteAlert(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!file || !team?.id) return;

    setIsSaving(true);
    try {
      await deleteFile(team.id, file.id, file.url);
      setShowDeleteAlert(false);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete file. Please try again.');
      setIsSaving(false);
    }
  }, [file, team?.id, deleteFile, router]);

  const handleDownload = useCallback(async () => {
    if (file) {
      try {
        await Linking.openURL(file.url);
      } catch (err) {
        console.error('Failed to download file');
      }
    }
  }, [file]);

  const handleOpen = useCallback(async () => {
    if (file) {
      try {
        await Linking.openURL(file.url);
      } catch (err) {
        console.error('Failed to open file');
      }
    }
  }, [file]);

  return (
    <>
      <Stack.Screen
        options={{
          title: isModalEditMode ? (file ? 'Edit File' : 'Upload File') : 'File Details',
          presentation: 'modal',
        }}
      />
      {/* Upgrade Banner - shown when uploading and feature is locked */}
      {!file && !canUploadFiles && (
        <TPUpgradeBanner
          feature="canUploadFiles"
          message="Upgrade to upload and store files"
        />
      )}

      <SafeAreaView className="flex-1 bg-background-200">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="p-6">
              {/* View Mode - File Details */}
              {!isModalEditMode && file && (
                <View>
                  {/* File Icon and Name */}
                  <View className="mb-6">
                    <Text className="text-2xl font-semibold text-typography-900 mb-2">
                      {file.name}
                    </Text>
                    {file.description && (
                      <Text className="text-sm text-typography-600">
                        {file.description}
                      </Text>
                    )}
                  </View>

                  {/* File Info Card */}
                  <View className="bg-white rounded-xl p-4 mb-6">
                    <View className="flex-row justify-between py-3 border-b border-gray-200">
                      <Text className="text-sm text-typography-500">Size</Text>
                      <Text className="text-sm font-medium text-typography-900">
                        {formatFileSize(file.size)}
                      </Text>
                    </View>
                    <View className="flex-row justify-between py-3 border-b border-gray-200">
                      <Text className="text-sm text-typography-500">Uploaded</Text>
                      <Text className="text-sm font-medium text-typography-900">
                        {formatDate(file.uploadedAt)}
                      </Text>
                    </View>
                    {file.category && (
                      <View className="flex-row justify-between py-3">
                        <Text className="text-sm text-typography-500">Category</Text>
                        <Text className="text-sm font-medium text-typography-900">
                          {file.category}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row gap-3 mb-4">
                    <Pressable
                      onPress={handleDownload}
                      className="flex-1 bg-white rounded-xl p-4 flex-row items-center justify-center"
                    >
                      <Download size={18} color={COLORS.primary} />
                      <Text className="text-sm font-semibold text-primary-500 ml-2">
                        Download
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={handleOpen}
                      className="flex-1 bg-primary-500 rounded-xl p-4 flex-row items-center justify-center"
                    >
                      <ExternalLink size={18} color={COLORS.white} />
                      <Text className="text-sm font-semibold text-white ml-2">
                        Open
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Edit/Upload Mode - Form */}
              {isModalEditMode && (
                <View>
                  {/* Upload Area - greyed out with lock when not available */}
                  {!file && (
                    <TouchableOpacity
                      className={`border-2 border-dashed rounded-xl p-8 items-center mb-6 ${
                        canUploadFiles ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                      }`}
                      activeOpacity={0.7}
                      onPress={canUploadFiles ? undefined : () => showPaywall('canUploadFiles')}
                    >
                      {canUploadFiles ? (
                        <Upload size={40} color={COLORS.textMuted} />
                      ) : (
                        <Lock size={40} color={COLORS.textMuted} />
                      )}
                      <Text className={`text-base font-medium mt-3 ${
                        canUploadFiles ? 'text-typography-700' : 'text-gray-400'
                      }`}>
                        {canUploadFiles ? 'Tap to select file' : 'File uploads locked'}
                      </Text>
                      <Text className={`text-sm mt-1 ${
                        canUploadFiles ? 'text-typography-500' : 'text-gray-300'
                      }`}>
                        {canUploadFiles ? 'PDF, Image, Document, or Video' : 'Tap banner above to upgrade'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* File Name */}
                  <Text className="text-sm font-medium text-typography-700 mb-2">
                    File Name
                  </Text>
                  <Input className="mb-4">
                    <InputField
                      value={formData.name}
                      onChangeText={(name) =>
                        setFormData((prev) => ({ ...prev, name }))
                      }
                      placeholder="Enter file name"
                    />
                  </Input>

                  {/* Description */}
                  <Text className="text-sm font-medium text-typography-700 mb-2">
                    Description (optional)
                  </Text>
                  <Textarea className="mb-4">
                    <TextareaInput
                      value={formData.description}
                      onChangeText={(description) =>
                        setFormData((prev) => ({ ...prev, description }))
                      }
                      placeholder="Add a description"
                      numberOfLines={3}
                    />
                  </Textarea>

                  {/* Category */}
                  <Text className="text-sm font-medium text-typography-700 mb-2">
                    Category (optional)
                  </Text>
                  <TPSelect
                    options={FILE_CATEGORIES}
                    value={formData.category}
                    onValueChange={(category) =>
                      setFormData((prev) => ({ ...prev, category }))
                    }
                    placeholder="Select category"
                    className="mb-4"
                  />
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <TPFooterButtons
            mode={isModalEditMode ? 'edit' : 'view'}
            onCancel={handleClose}
            onEdit={() => setIsModalEditMode(true)}
            onSave={handleSave}
            cancelLabel="Close"
            editLabel="Edit"
            saveLabel={file ? 'Save' : 'Upload'}
            loading={isSaving}
            saveDisabled={!formData.name.trim() || (!file && !canUploadFiles)}
            canEdit={true}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Delete Alert */}
      {file && (
        <TPAlert
          isOpen={showDeleteAlert}
          onClose={() => setShowDeleteAlert(false)}
          title="Delete File?"
          message={`Are you sure you want to delete "${file.name}"?`}
          description="This action cannot be undone."
          cancelLabel="Cancel"
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          isLoading={isSaving}
          type="destructive"
        />
      )}
    </>
  );
}
