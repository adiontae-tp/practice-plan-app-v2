import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { FolderPlus } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { TPActionSheet } from '@/components/tp';
import { useAppStore } from '@ppa/store';

interface NewFolderSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  parentFolderId: string | null;
  onSuccess?: () => void;
}

export function NewFolderSheet({
  isOpen,
  onOpenChange,
  parentFolderId,
  onSuccess,
}: NewFolderSheetProps) {
  const team = useAppStore((state) => state.team);
  const user = useAppStore((state) => state.user);
  const createFolder = useAppStore((state) => state.createFolder);

  const [folderName, setFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    if (!folderName.trim()) {
      setError('Folder name is required');
      return;
    }
    if (!team?.id || !user?.uid) {
      setError('Team not found');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await createFolder(team.id, {
        name: folderName.trim(),
        parentId: parentFolderId,
        teamId: team.id,
        createdBy: user.uid,
        createdAt: Date.now(),
      });
      setFolderName('');
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError('Failed to create folder');
    } finally {
      setIsCreating(false);
    }
  }, [folderName, team, user, parentFolderId, createFolder, onOpenChange, onSuccess]);

  const handleClose = useCallback(() => {
    setFolderName('');
    setError(null);
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <TPActionSheet isOpen={isOpen} onOpenChange={handleClose} detents={['medium']}>
      <View className="py-4">
        <View className="flex-row items-center mb-6">
          <View className="w-10 h-10 rounded-lg bg-primary-50 items-center justify-center mr-3">
            <FolderPlus size={24} color={COLORS.primary} />
          </View>
          <Text className="text-xl font-semibold text-gray-900">New Folder</Text>
        </View>

        <Text className="text-sm font-medium text-gray-700 mb-2">Folder Name</Text>
        <View className="bg-gray-100 rounded-xl px-4 py-3 mb-4">
          <TextInput
            value={folderName}
            onChangeText={(text) => {
              setFolderName(text);
              setError(null);
            }}
            placeholder="Enter folder name"
            placeholderTextColor="#9ca3af"
            className="text-base text-gray-900"
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />
        </View>

        {error && (
          <Text className="text-sm text-red-500 mb-4">{error}</Text>
        )}

        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            onPress={handleClose}
            disabled={isCreating}
            className="flex-1 py-3 rounded-xl border border-gray-300 items-center"
          >
            <Text className="text-base font-medium text-gray-700">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCreate}
            disabled={isCreating || !folderName.trim()}
            className={`flex-1 py-3 rounded-xl items-center ${
              isCreating || !folderName.trim() ? 'bg-primary-300' : 'bg-primary-500'
            }`}
          >
            {isCreating ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-base font-medium text-white">Create</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TPActionSheet>
  );
}
