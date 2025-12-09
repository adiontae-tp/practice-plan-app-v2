import { View, Text, ScrollView, TouchableOpacity, TextInput, Pressable } from 'react-native';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  FileText,
  Image,
  File as FileIcon,
  Folder as FolderIcon,
  Search,
  X,
  Edit2,
  Move,
  Trash2 as TrashIcon,
  Lock,
  ChevronRight,
  Home,
  Star,
  FolderPlus,
  Clock,
  Share2,
} from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import {
  TPCard,
  TPEmpty,
  TPAlert,
  TPToast,
  useToast,
  TPFooterButtons,
  TPActionSheet,
  TPUpgradeBanner,
} from '@/components/tp';
import { useAppStore, useLazyFiles, useLazyFolders } from '@ppa/store';
import { useSubscription } from '@/hooks/useSubscription';
import type { File, Folder, FileType, FileCategory } from '@ppa/interfaces';
import { NewFolderSheet } from './NewFolderSheet';
import { FileVersionsSheet } from './FileVersionsSheet';
import { FileShareSheet } from './FileShareSheet';
import { StorageUsageBanner } from './StorageUsageBanner';
import { FavoritesSection } from './FavoritesSection';
import { RecentSection } from './RecentSection';

const FILE_CATEGORIES: { value: FileCategory; label: string }[] = [
  { value: 'playbook', label: 'Playbook' },
  { value: 'roster', label: 'Roster' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'media', label: 'Media' },
  { value: 'other', label: 'Other' },
];

function getFileIcon(type: FileType, locked?: boolean) {
  const iconProps = { size: 24 };
  if (locked) {
    return <Lock {...iconProps} color={COLORS.textMuted} />;
  }
  switch (type) {
    case 'pdf':
      return <FileText {...iconProps} color="#dc2626" />;
    case 'image':
      return <Image {...iconProps} color="#16a34a" />;
    case 'video':
      return <FileText {...iconProps} color="#9333ea" />;
    case 'document':
      return <FileIcon {...iconProps} color={COLORS.primary} />;
    default:
      return <FileIcon {...iconProps} color={COLORS.textMuted} />;
  }
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
  });
}

export default function FilesMobile() {
  const router = useRouter();
  const { toast, success, error: showError, hideToast } = useToast();
  const { setSelectedTag } = useAppStore();
  
  const team = useAppStore((state) => state.team);
  const teamId = team?.id || '';

  const { files, isLoading: filesLoading } = useLazyFiles();
  const { folders, isLoading: foldersLoading } = useLazyFolders();
  
  const deleteFile = useAppStore((state) => state.deleteFile);
  const updateFile = useAppStore((state) => state.updateFile);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const moveFile = useAppStore((state) => state.moveFile);
  const fileDeleting = useAppStore((state) => state.fileDeleting);
  const fileUpdating = useAppStore((state) => state.fileUpdating);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FileCategory | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const { features, checkFeature } = useSubscription();
  const canUploadFiles = features.canUploadFiles;
  const canCreateFolders = features.canCreateFolders;

  const [mode, setMode] = useState<'read' | 'edit' | 'move'>('read');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<File | null>(null);

  const [showNewFolderSheet, setShowNewFolderSheet] = useState(false);
  const [showVersionsSheet, setShowVersionsSheet] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);

  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [moveToFolderId, setMoveToFolderId] = useState<string | null>(null);

  const currentFolders = useMemo(() => {
    return folders.filter((f) => f.parentId === currentFolderId);
  }, [folders, currentFolderId]);

  const currentFiles = useMemo(() => {
    return files.filter((f) => f.folderId === currentFolderId);
  }, [files, currentFolderId]);

  const filteredFiles = useMemo(() => {
    return currentFiles.filter((file) => {
      const matchesSearch =
        !searchQuery ||
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || file.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [currentFiles, searchQuery, selectedCategory]);

  const filteredFolders = useMemo(() => {
    if (!searchQuery) return currentFolders;
    return currentFolders.filter((folder) =>
      folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentFolders, searchQuery]);

  const folderBreadcrumbs = useMemo(() => {
    const crumbs: Folder[] = [];
    let folderId = currentFolderId;
    while (folderId) {
      const folder = folders.find((f) => f.id === folderId);
      if (folder) {
        crumbs.unshift(folder);
        folderId = folder.parentId;
      } else {
        break;
      }
    }
    return crumbs;
  }, [folders, currentFolderId]);

  const selectedFile = selectedFileId ? files.find((f) => f.id === selectedFileId) : null;

  useEffect(() => {
    if (selectedFile && mode === 'edit') {
      setEditName(selectedFile.name);
      setEditDescription(selectedFile.description || '');
    }
  }, [selectedFile, mode]);

  useEffect(() => {
    if (selectedFile && mode === 'move') {
      setMoveToFolderId(selectedFile.folderId ?? null);
    }
  }, [selectedFile, mode]);

  const handleNavigateToFolder = useCallback((folderId: string | null) => {
    setCurrentFolderId(folderId);
    setSelectedFileId(null);
    setMode('read');
  }, []);

  const handleOpenFile = useCallback((file: File) => {
    setSelectedFileId(file.id);
    setMode('read');
  }, []);

  const handleAddFile = useCallback(() => {
    if (!checkFeature('canUploadFiles')) {
      return;
    }
    setSelectedTag(null);
    router.push('/file-detail' as never);
  }, [router, setSelectedTag, checkFeature]);

  const handleEdit = useCallback(() => {
    setMode('edit');
    setShowActionMenu(false);
  }, []);

  const handleMove = useCallback(() => {
    setMode('move');
    setShowActionMenu(false);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!selectedFile || !teamId) return;
    
    try {
      await updateFile(teamId, selectedFile.id, {
        name: editName,
        description: editDescription,
      });
      setMode('read');
      success('File updated');
    } catch (err) {
      showError('Failed to update file');
    }
  }, [selectedFile, teamId, editName, editDescription, updateFile, success, showError]);

  const handleSaveMove = useCallback(async () => {
    if (!selectedFile || !teamId) return;
    
    try {
      await moveFile(teamId, selectedFile.id, moveToFolderId);
      setMode('read');
      success('File moved');
    } catch (err) {
      showError('Failed to move file');
    }
  }, [selectedFile, teamId, moveToFolderId, moveFile, success, showError]);

  const handleDeletePress = useCallback((file: File) => {
    setFileToDelete(file);
    setShowDeleteAlert(true);
    setShowActionMenu(false);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!fileToDelete || !teamId) return;

    try {
      await deleteFile(teamId, fileToDelete.id, fileToDelete.url);
      setShowDeleteAlert(false);
      setFileToDelete(null);
      setMode('read');
      setSelectedFileId(null);
      success(`"${fileToDelete.name}" deleted`);
    } catch (err) {
      showError('Failed to delete file');
    }
  }, [fileToDelete, teamId, deleteFile, success, showError]);

  const handleToggleFavorite = useCallback(async () => {
    if (!selectedFile || !teamId) return;
    try {
      await toggleFavorite(teamId, selectedFile.id);
      success(selectedFile.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (err) {
      showError('Failed to update favorite');
    }
    setShowActionMenu(false);
  }, [selectedFile, teamId, toggleFavorite, success, showError]);

  const handleVersions = useCallback(() => {
    setShowActionMenu(false);
    setShowVersionsSheet(true);
  }, []);

  const handleShare = useCallback(() => {
    setShowActionMenu(false);
    setShowShareSheet(true);
  }, []);

  const handleActionMenuSelect = useCallback((action: 'edit' | 'move' | 'delete' | 'favorite' | 'versions' | 'share') => {
    if (action === 'edit') {
      handleEdit();
    } else if (action === 'move') {
      handleMove();
    } else if (action === 'delete') {
      if (selectedFile) {
        handleDeletePress(selectedFile);
      }
    } else if (action === 'favorite') {
      handleToggleFavorite();
    } else if (action === 'versions') {
      handleVersions();
    } else if (action === 'share') {
      handleShare();
    }
  }, [selectedFile, handleEdit, handleMove, handleDeletePress, handleToggleFavorite, handleVersions, handleShare]);

  const isLoading = filesLoading || foldersLoading;

  return (
    <View className="flex-1 bg-[#e0e0e0]">
      {!canUploadFiles && (
        <TPUpgradeBanner
          feature="canUploadFiles"
          message="Upgrade to upload and manage files"
        />
      )}

      {canUploadFiles && <StorageUsageBanner />}

      <View className="px-5 pt-5">
        {currentFolderId && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3 -mx-5 px-5"
          >
            <TouchableOpacity
              onPress={() => handleNavigateToFolder(null)}
              className="flex-row items-center mr-2"
            >
              <Home size={16} color={COLORS.primary} />
            </TouchableOpacity>
            {folderBreadcrumbs.map((folder, index) => (
              <View key={folder.id} className="flex-row items-center">
                <ChevronRight size={14} color={COLORS.textMuted} />
                <TouchableOpacity
                  onPress={() => handleNavigateToFolder(folder.id)}
                  className="px-2"
                >
                  <Text
                    className={`text-sm font-medium ${
                      index === folderBreadcrumbs.length - 1
                        ? 'text-gray-900'
                        : 'text-primary-600'
                    }`}
                  >
                    {folder.name}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        <View className="bg-white rounded-xl px-4 py-3 flex-row items-center mb-4">
          <Search size={20} color={COLORS.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search files..."
            placeholderTextColor={COLORS.textMuted}
            className="flex-1 ml-3 text-base text-gray-900"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4 -mx-5 px-5"
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full mr-2 ${
              selectedCategory === null ? 'bg-primary-500' : 'bg-white'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                selectedCategory === null ? 'text-white' : 'text-gray-700'
              }`}
            >
              All
            </Text>
          </TouchableOpacity>
          {FILE_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              onPress={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-full mr-2 ${
                selectedCategory === cat.value ? 'bg-primary-500' : 'bg-white'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedCategory === cat.value ? 'text-white' : 'text-gray-700'
                }`}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedFile && mode !== 'read' ? (
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          <View className="pb-24">
            {mode === 'edit' && (
              <View>
                <Text className="text-sm font-semibold text-gray-900 mb-2 mt-4">File Name</Text>
                <View className="bg-white rounded-xl px-4 py-3 mb-4">
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="File name"
                    placeholderTextColor="#9ca3af"
                    className="text-base text-gray-900"
                    editable={true}
                  />
                </View>

                <Text className="text-sm font-semibold text-gray-900 mb-2">Description</Text>
                <View className="bg-white rounded-xl px-4 py-3 mb-4">
                  <TextInput
                    value={editDescription}
                    onChangeText={setEditDescription}
                    placeholder="File description"
                    placeholderTextColor="#9ca3af"
                    className="text-base text-gray-900"
                    multiline
                    editable={true}
                  />
                </View>
              </View>
            )}

            {mode === 'move' && (
              <View>
                <Text className="text-sm font-semibold text-gray-900 mb-3 mt-4">Select Folder</Text>
                <TouchableOpacity
                  onPress={() => setMoveToFolderId(null)}
                  className={`p-4 rounded-xl mb-2 border-2 flex-row items-center ${
                    moveToFolderId === null
                      ? 'bg-primary-50 border-primary-500'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Home size={20} color={moveToFolderId === null ? COLORS.primary : COLORS.textMuted} />
                  <Text
                    className={`text-base font-medium ml-3 ${
                      moveToFolderId === null ? 'text-primary-500' : 'text-gray-900'
                    }`}
                  >
                    Root (No folder)
                  </Text>
                </TouchableOpacity>
                {folders.map((folder) => (
                  <TouchableOpacity
                    key={folder.id}
                    onPress={() => setMoveToFolderId(folder.id)}
                    className={`p-4 rounded-xl mb-2 border-2 flex-row items-center ${
                      moveToFolderId === folder.id
                        ? 'bg-primary-50 border-primary-500'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <FolderIcon size={20} color={moveToFolderId === folder.id ? COLORS.primary : COLORS.textMuted} />
                    <Text
                      className={`text-base font-medium ml-3 ${
                        moveToFolderId === folder.id ? 'text-primary-500' : 'text-gray-900'
                      }`}
                    >
                      {folder.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {!currentFolderId && !searchQuery && !selectedCategory && (
            <>
              <FavoritesSection onFilePress={handleOpenFile} />
              <RecentSection onFilePress={handleOpenFile} />
            </>
          )}
          <View className="px-5">
            {isLoading ? (
              <View className="py-16 items-center">
                <Text className="text-gray-500">Loading...</Text>
              </View>
            ) : filteredFolders.length === 0 && filteredFiles.length === 0 ? (
              <View className="py-16">
                <TPEmpty
                  icon={FolderIcon}
                  title={searchQuery || selectedCategory ? 'No files found' : 'No files yet'}
                  message={
                    searchQuery || selectedCategory
                      ? 'Try a different search or filter'
                      : 'Upload documents and attachments'
                  }
                />
              </View>
            ) : (
              <View className="pb-24">
                {filteredFolders.length > 0 && (
                  <>
                  <Text className="text-xs font-semibold text-gray-500 uppercase mb-3 ml-1">
                    Folders
                  </Text>
                  {filteredFolders.map((folder) => (
                    <TPCard
                      key={folder.id}
                      onPress={() => handleNavigateToFolder(folder.id)}
                      className="mb-2"
                    >
                      <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-lg items-center justify-center bg-primary-50">
                          <FolderIcon size={24} color={COLORS.primary} />
                        </View>
                        <View className="flex-1 ml-3">
                          <Text className="text-base font-semibold text-gray-900">
                            {folder.name}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            {formatDate(folder.createdAt)}
                          </Text>
                        </View>
                        <ChevronRight size={20} color={COLORS.textMuted} />
                      </View>
                    </TPCard>
                  ))}
                </>
              )}

              {filteredFiles.length > 0 && (
                <>
                  <Text className="text-xs font-semibold text-gray-500 uppercase mb-3 ml-1 mt-4">
                    {filteredFiles.length} {filteredFiles.length === 1 ? 'File' : 'Files'}
                  </Text>
                  {filteredFiles.map((file) => (
                    <TPCard
                      key={file.id}
                      onPress={() => handleOpenFile(file)}
                      className={`${selectedFileId === file.id ? 'bg-primary-50' : ''} ${!canUploadFiles ? 'bg-gray-50' : ''}`}
                    >
                      <View className="flex-row items-start justify-between">
                        <View className="flex-row items-start flex-1">
                          <View className={`w-10 h-10 rounded-lg items-center justify-center ${canUploadFiles ? 'bg-gray-100' : 'bg-gray-50'}`}>
                            {getFileIcon(file.type, !canUploadFiles)}
                          </View>
                          <View className="flex-1 ml-3">
                            <View className="flex-row items-center">
                              <Text
                                className={`text-base font-semibold flex-1 ${canUploadFiles ? 'text-gray-900' : 'text-gray-400'}`}
                                numberOfLines={1}
                              >
                                {file.name}
                              </Text>
                              {file.isFavorite && (
                                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                              )}
                            </View>
                            {file.description && (
                              <Text className={`text-sm mt-0.5 ${canUploadFiles ? 'text-gray-600' : 'text-gray-300'}`} numberOfLines={1}>
                                {file.description}
                              </Text>
                            )}
                            <View className="flex-row items-center mt-1.5 gap-3">
                              <Text className={`text-xs ${canUploadFiles ? 'text-gray-500' : 'text-gray-300'}`}>
                                {canUploadFiles ? formatFileSize(file.size) : '—'}
                              </Text>
                              <Text className={`text-xs ${canUploadFiles ? 'text-gray-500' : 'text-gray-300'}`}>
                                {canUploadFiles ? formatDate(file.uploadedAt) : '—'}
                              </Text>
                              {file.category && (
                                <View className={`px-2 py-0.5 rounded ${canUploadFiles ? 'bg-primary-50' : 'bg-gray-100'}`}>
                                  <Text className={`text-xs font-medium ${canUploadFiles ? 'text-primary-600' : 'text-gray-400'}`}>
                                    {file.category}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                        {selectedFileId === file.id && canUploadFiles && (
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              handleDeletePress(file);
                            }}
                            className="p-2"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <X size={20} color={COLORS.error} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </TPCard>
                  ))}
                </>
              )}
            </View>
            )}
          </View>
        </ScrollView>
      )}

      {selectedFile ? (
        mode === 'read' ? (
          <View className="bg-white border-t border-gray-200 px-5 py-3 flex-row gap-3 items-center pb-safe">
            <TouchableOpacity
              onPress={() => {
                setSelectedFileId(null);
                setMode('read');
              }}
              className="flex-1 py-3 rounded-xl border border-gray-300 items-center"
            >
              <Text className="text-base font-medium text-gray-700">Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowActionMenu(true)}
              className="flex-1 py-3 rounded-xl bg-primary-500 items-center"
            >
              <Text className="text-base font-medium text-white">Actions</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TPFooterButtons
            mode="edit"
            onCancel={() => {
              setSelectedFileId(null);
              setMode('read');
            }}
            onSave={mode === 'edit' ? handleSaveEdit : mode === 'move' ? handleSaveMove : undefined}
            cancelLabel="Cancel"
            saveLabel={mode === 'edit' ? 'Save' : 'Move'}
          />
        )
      ) : (
        <View className="bg-white border-t border-gray-200 px-5 py-3 flex-row gap-3 items-center pb-safe">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 py-3 rounded-xl border border-gray-300 items-center"
          >
            <Text className="text-base font-medium text-gray-700">Close</Text>
          </TouchableOpacity>
          {canCreateFolders && (
            <TouchableOpacity
              onPress={() => setShowNewFolderSheet(true)}
              className="py-3 px-4 rounded-xl border border-primary-300 items-center"
            >
              <FolderPlus size={20} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleAddFile}
            className="flex-1 py-3 rounded-xl bg-primary-500 items-center"
          >
            <Text className="text-base font-medium text-white">Upload File</Text>
          </TouchableOpacity>
        </View>
      )}

      <TPActionSheet
        isOpen={showActionMenu}
        onOpenChange={setShowActionMenu}
        detents={['large']}
      >
        <View className="gap-2 py-2">
          <TouchableOpacity
            onPress={() => handleActionMenuSelect('favorite')}
            className="flex-row items-center py-3 px-4 rounded-lg active:bg-gray-50"
          >
            <Star
              size={20}
              color={selectedFile?.isFavorite ? '#f59e0b' : COLORS.primary}
              fill={selectedFile?.isFavorite ? '#f59e0b' : 'none'}
            />
            <Text className="text-base font-medium text-gray-900 ml-4">
              {selectedFile?.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleActionMenuSelect('edit')}
            className="flex-row items-center py-3 px-4 rounded-lg active:bg-gray-50"
          >
            <Edit2 size={20} color={COLORS.primary} />
            <Text className="text-base font-medium text-gray-900 ml-4">Edit File</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleActionMenuSelect('move')}
            className="flex-row items-center py-3 px-4 rounded-lg active:bg-gray-50"
          >
            <Move size={20} color={COLORS.primary} />
            <Text className="text-base font-medium text-gray-900 ml-4">Move to Folder</Text>
          </TouchableOpacity>

          {features.canAccessVersionHistory && (
            <TouchableOpacity
              onPress={() => handleActionMenuSelect('versions')}
              className="flex-row items-center py-3 px-4 rounded-lg active:bg-gray-50"
            >
              <Clock size={20} color={COLORS.primary} />
              <Text className="text-base font-medium text-gray-900 ml-4">Version History</Text>
            </TouchableOpacity>
          )}

          {features.canShareFiles && (
            <TouchableOpacity
              onPress={() => handleActionMenuSelect('share')}
              className="flex-row items-center py-3 px-4 rounded-lg active:bg-gray-50"
            >
              <Share2 size={20} color={COLORS.primary} />
              <Text className="text-base font-medium text-gray-900 ml-4">Share File</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => handleActionMenuSelect('delete')}
            className="flex-row items-center py-3 px-4 rounded-lg active:bg-red-50"
          >
            <TrashIcon size={20} color={COLORS.error} />
            <Text className="text-base font-medium text-red-600 ml-4">Delete</Text>
          </TouchableOpacity>
        </View>
      </TPActionSheet>

      <NewFolderSheet
        isOpen={showNewFolderSheet}
        onOpenChange={setShowNewFolderSheet}
        parentFolderId={currentFolderId}
        onSuccess={() => success('Folder created')}
      />

      <FileVersionsSheet
        isOpen={showVersionsSheet}
        onOpenChange={setShowVersionsSheet}
        file={selectedFile ?? null}
      />

      <FileShareSheet
        isOpen={showShareSheet}
        onOpenChange={setShowShareSheet}
        file={selectedFile ?? null}
      />

      <TPAlert
        isOpen={showDeleteAlert}
        onClose={() => {
          setShowDeleteAlert(false);
          setFileToDelete(null);
        }}
        title="Delete File?"
        message={`Are you sure you want to delete "${fileToDelete?.name}"?`}
        description="This action cannot be undone."
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        isLoading={fileDeleting}
        type="destructive"
      />

      <TPToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={hideToast}
      />
    </View>
  );
}
