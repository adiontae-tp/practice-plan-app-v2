import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Clock, Download, RotateCcw, Trash2, Check } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { TPActionSheet, TPAlert } from '@/components/tp';
import { useAppStore } from '@ppa/store';
import type { File, FileVersion } from '@ppa/interfaces';
import * as Linking from 'expo-linking';

interface FileVersionsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
}

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
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function FileVersionsSheet({
  isOpen,
  onOpenChange,
  file,
}: FileVersionsSheetProps) {
  const team = useAppStore((state) => state.team);
  const loadVersions = useAppStore((state) => state.loadVersions);
  const restoreVersion = useAppStore((state) => state.restoreVersion);
  const deleteVersion = useAppStore((state) => state.deleteVersion);
  const versions = useAppStore((state) => state.versions);
  const versionsLoading = useAppStore((state) => state.versionsLoading);

  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [versionToDelete, setVersionToDelete] = useState<FileVersion | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && file && team?.id) {
      loadVersions(team.id, file.id);
    }
  }, [isOpen, file, team?.id, loadVersions]);

  const handleDownload = useCallback((version: FileVersion) => {
    Linking.openURL(version.url);
  }, []);

  const handleRestore = useCallback(async (version: FileVersion) => {
    if (!team?.id || !file) return;
    
    setRestoringId(version.id);
    try {
      await restoreVersion(team.id, file.id, version.id);
    } finally {
      setRestoringId(null);
    }
  }, [team?.id, file, restoreVersion]);

  const handleDeletePress = useCallback((version: FileVersion) => {
    setVersionToDelete(version);
    setShowDeleteAlert(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!versionToDelete || !team?.id || !file) return;

    setIsDeleting(true);
    try {
      await deleteVersion(team.id, file.id, versionToDelete.id);
      setShowDeleteAlert(false);
      setVersionToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }, [versionToDelete, team?.id, file, deleteVersion]);

  return (
    <>
      <TPActionSheet isOpen={isOpen} onOpenChange={onOpenChange} detents={['large']}>
        <View className="py-4">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 rounded-lg bg-primary-50 items-center justify-center mr-3">
              <Clock size={24} color={COLORS.primary} />
            </View>
            <View>
              <Text className="text-xl font-semibold text-gray-900">Version History</Text>
              {file && (
                <Text className="text-sm text-gray-500" numberOfLines={1}>
                  {file.name}
                </Text>
              )}
            </View>
          </View>

          {versionsLoading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text className="text-gray-500 mt-3">Loading versions...</Text>
            </View>
          ) : versions.length === 0 ? (
            <View className="py-12 items-center">
              <Clock size={48} color={COLORS.textMuted} />
              <Text className="text-gray-500 mt-3">No version history available</Text>
            </View>
          ) : (
            <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
              {versions.map((version) => {
                const isCurrent = file?.currentVersionId === version.id;
                return (
                  <View
                    key={version.id}
                    className={`p-4 rounded-xl mb-2 ${isCurrent ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'}`}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text className="text-base font-semibold text-gray-900">
                            Version {version.versionNumber}
                          </Text>
                          {isCurrent && (
                            <View className="ml-2 px-2 py-0.5 rounded-full bg-primary-500">
                              <Text className="text-xs font-medium text-white">Current</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-sm text-gray-500 mt-1">
                          {formatDate(version.uploadedAt)}
                        </Text>
                        <Text className="text-xs text-gray-400 mt-0.5">
                          {formatFileSize(version.size)}
                        </Text>
                        {version.note && (
                          <Text className="text-sm text-gray-600 mt-2">
                            {version.note}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View className="flex-row gap-2 mt-3">
                      <TouchableOpacity
                        onPress={() => handleDownload(version)}
                        className="flex-row items-center px-3 py-2 rounded-lg bg-white border border-gray-200"
                      >
                        <Download size={16} color={COLORS.primary} />
                        <Text className="text-sm font-medium text-primary-600 ml-1.5">Download</Text>
                      </TouchableOpacity>

                      {!isCurrent && (
                        <>
                          <TouchableOpacity
                            onPress={() => handleRestore(version)}
                            disabled={restoringId !== null}
                            className="flex-row items-center px-3 py-2 rounded-lg bg-white border border-gray-200"
                          >
                            {restoringId === version.id ? (
                              <ActivityIndicator size="small" color={COLORS.primary} />
                            ) : (
                              <>
                                <RotateCcw size={16} color={COLORS.primary} />
                                <Text className="text-sm font-medium text-primary-600 ml-1.5">Restore</Text>
                              </>
                            )}
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleDeletePress(version)}
                            className="flex-row items-center px-3 py-2 rounded-lg bg-white border border-red-200"
                          >
                            <Trash2 size={16} color={COLORS.error} />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </TPActionSheet>

      <TPAlert
        isOpen={showDeleteAlert}
        onClose={() => {
          setShowDeleteAlert(false);
          setVersionToDelete(null);
        }}
        title="Delete Version?"
        message={`Delete version ${versionToDelete?.versionNumber}?`}
        description="This action cannot be undone."
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        type="destructive"
      />
    </>
  );
}
