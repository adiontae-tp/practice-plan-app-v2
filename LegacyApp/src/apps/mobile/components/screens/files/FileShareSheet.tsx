import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Switch, TextInput, Share } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Share2, Link, Trash2, Eye, Download, Lock, Clock } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { TPActionSheet, TPAlert, useToast, TPToast } from '@/components/tp';
import { useAppStore } from '@ppa/store';
import type { File, FileShare, SharePermission } from '@ppa/interfaces';

interface FileShareSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function FileShareSheet({
  isOpen,
  onOpenChange,
  file,
}: FileShareSheetProps) {
  const { toast, success, error: showError, hideToast } = useToast();
  const team = useAppStore((state) => state.team);
  const loadShares = useAppStore((state) => state.loadShares);
  const createShare = useAppStore((state) => state.createShare);
  const deleteShare = useAppStore((state) => state.deleteShare);
  const shares = useAppStore((state) => state.shares);
  const sharesLoading = useAppStore((state) => state.sharesLoading);

  const [permission, setPermission] = useState<SharePermission>('view');
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDays, setExpiryDays] = useState('7');
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [shareToDelete, setShareToDelete] = useState<FileShare | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && file && team?.id) {
      loadShares(team.id, file.id);
    }
  }, [isOpen, file, team?.id, loadShares]);

  const handleCreateShare = useCallback(async () => {
    if (!team?.id || !file) return;

    setIsCreating(true);
    try {
      const expiresAt = hasExpiry
        ? Date.now() + parseInt(expiryDays) * 24 * 60 * 60 * 1000
        : undefined;

      await createShare(team.id, file.id, {
        type: 'link',
        permission,
        expiresAt,
        password: hasPassword ? password : undefined,
      });
      
      setPermission('view');
      setHasExpiry(false);
      setExpiryDays('7');
      setHasPassword(false);
      setPassword('');
      success('Share link created');
    } catch (err) {
      showError('Failed to create share link');
    } finally {
      setIsCreating(false);
    }
  }, [team?.id, file, permission, hasExpiry, expiryDays, hasPassword, password, createShare, success, showError]);

  const handleCopyLink = useCallback(async (share: FileShare) => {
    const shareUrl = `${process.env.EXPO_PUBLIC_WEB_URL || 'https://app.practiceplan.app'}/share/file/${file?.id}?s=${share.id}`;
    try {
      await Share.share({
        message: shareUrl,
        title: `Share: ${file?.name}`,
      });
    } catch (err) {
      showError('Failed to share link');
    }
  }, [file, showError]);

  const handleDeletePress = useCallback((share: FileShare) => {
    setShareToDelete(share);
    setShowDeleteAlert(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!shareToDelete || !team?.id || !file) return;

    setIsDeleting(true);
    try {
      await deleteShare(team.id, file.id, shareToDelete.id);
      setShowDeleteAlert(false);
      setShareToDelete(null);
      success('Share link deleted');
    } catch (err) {
      showError('Failed to delete share link');
    } finally {
      setIsDeleting(false);
    }
  }, [shareToDelete, team?.id, file, deleteShare, success, showError]);

  const isExpired = (share: FileShare) => {
    return share.expiresAt && share.expiresAt < Date.now();
  };

  return (
    <>
      <TPActionSheet isOpen={isOpen} onOpenChange={onOpenChange} detents={['large']}>
        <ScrollView className="py-4" showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 rounded-lg bg-primary-50 items-center justify-center mr-3">
              <Share2 size={24} color={COLORS.primary} />
            </View>
            <View>
              <Text className="text-xl font-semibold text-gray-900">Share File</Text>
              {file && (
                <Text className="text-sm text-gray-500" numberOfLines={1}>
                  {file.name}
                </Text>
              )}
            </View>
          </View>

          <View className="bg-gray-50 rounded-xl p-4 mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-3">Create Share Link</Text>

            <Text className="text-xs font-medium text-gray-500 mb-2">Permission</Text>
            <View className="flex-row gap-2 mb-4">
              <TouchableOpacity
                onPress={() => setPermission('view')}
                className={`flex-1 py-2.5 rounded-lg flex-row items-center justify-center ${
                  permission === 'view' ? 'bg-primary-500' : 'bg-white border border-gray-200'
                }`}
              >
                <Eye size={16} color={permission === 'view' ? 'white' : COLORS.textMuted} />
                <Text className={`text-sm font-medium ml-1.5 ${permission === 'view' ? 'text-white' : 'text-gray-700'}`}>
                  View Only
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPermission('download')}
                className={`flex-1 py-2.5 rounded-lg flex-row items-center justify-center ${
                  permission === 'download' ? 'bg-primary-500' : 'bg-white border border-gray-200'
                }`}
              >
                <Download size={16} color={permission === 'download' ? 'white' : COLORS.textMuted} />
                <Text className={`text-sm font-medium ml-1.5 ${permission === 'download' ? 'text-white' : 'text-gray-700'}`}>
                  Download
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Clock size={16} color={COLORS.textMuted} />
                <Text className="text-sm font-medium text-gray-700 ml-2">Set Expiration</Text>
              </View>
              <Switch
                value={hasExpiry}
                onValueChange={setHasExpiry}
                trackColor={{ false: '#d1d5db', true: COLORS.primary }}
              />
            </View>
            {hasExpiry && (
              <View className="flex-row items-center bg-white rounded-lg px-3 py-2 mb-3">
                <TextInput
                  value={expiryDays}
                  onChangeText={setExpiryDays}
                  keyboardType="number-pad"
                  className="text-base text-gray-900 w-12"
                  maxLength={3}
                />
                <Text className="text-sm text-gray-500">days</Text>
              </View>
            )}

            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Lock size={16} color={COLORS.textMuted} />
                <Text className="text-sm font-medium text-gray-700 ml-2">Password Protect</Text>
              </View>
              <Switch
                value={hasPassword}
                onValueChange={setHasPassword}
                trackColor={{ false: '#d1d5db', true: COLORS.primary }}
              />
            </View>
            {hasPassword && (
              <View className="bg-white rounded-lg px-3 py-2 mb-3">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  className="text-base text-gray-900"
                />
              </View>
            )}

            <TouchableOpacity
              onPress={handleCreateShare}
              disabled={isCreating}
              className={`py-3 rounded-xl items-center mt-2 ${isCreating ? 'bg-primary-300' : 'bg-primary-500'}`}
            >
              {isCreating ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <View className="flex-row items-center">
                  <Link size={18} color="white" />
                  <Text className="text-base font-medium text-white ml-2">Create Link</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Text className="text-sm font-semibold text-gray-700 mb-3">Active Links</Text>
          {sharesLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : shares.length === 0 ? (
            <View className="py-8 items-center bg-gray-50 rounded-xl">
              <Link size={32} color={COLORS.textMuted} />
              <Text className="text-gray-500 mt-2">No active share links</Text>
            </View>
          ) : (
            <View className="gap-2">
              {shares.map((share) => {
                const expired = isExpired(share);
                return (
                  <View
                    key={share.id}
                    className={`p-4 rounded-xl ${expired ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          {share.permission === 'view' ? (
                            <Eye size={16} color={expired ? COLORS.error : COLORS.primary} />
                          ) : (
                            <Download size={16} color={expired ? COLORS.error : COLORS.primary} />
                          )}
                          <Text className={`text-sm font-medium ml-1.5 ${expired ? 'text-red-600' : 'text-gray-900'}`}>
                            {share.permission === 'view' ? 'View Only' : 'Download'}
                          </Text>
                          {share.password && (
                            <Lock size={14} color={COLORS.textMuted} className="ml-2" />
                          )}
                          {expired && (
                            <Text className="text-xs text-red-500 ml-2">Expired</Text>
                          )}
                        </View>
                        <Text className="text-xs text-gray-500 mt-1">
                          Created {formatDate(share.createdAt)}
                        </Text>
                        {share.expiresAt && !expired && (
                          <Text className="text-xs text-gray-500">
                            Expires {formatDate(share.expiresAt)}
                          </Text>
                        )}
                        <Text className="text-xs text-gray-400 mt-0.5">
                          {share.accessCount} {share.accessCount === 1 ? 'view' : 'views'}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row gap-2 mt-3">
                      <TouchableOpacity
                        onPress={() => handleCopyLink(share)}
                        className="flex-row items-center px-3 py-2 rounded-lg bg-white border border-gray-200"
                      >
                        <Share2 size={16} color={COLORS.primary} />
                        <Text className="text-sm font-medium text-primary-600 ml-1.5">Share</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeletePress(share)}
                        className="flex-row items-center px-3 py-2 rounded-lg bg-white border border-red-200"
                      >
                        <Trash2 size={16} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </TPActionSheet>

      <TPAlert
        isOpen={showDeleteAlert}
        onClose={() => {
          setShowDeleteAlert(false);
          setShareToDelete(null);
        }}
        title="Delete Share Link?"
        message="Anyone with this link will no longer be able to access the file."
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        type="destructive"
      />

      <TPToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={hideToast}
      />
    </>
  );
}
