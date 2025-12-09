'use client';

import { useEffect, useCallback, useMemo, useState } from 'react';
import { File as AppFile, FileType, FileCategory, Folder, FileVersion, FileShare, SharePermission } from '@ppa/interfaces';
import { useAppStore, useLazyFiles, useLazyFolders } from '@ppa/store';
import { CheckCircle, X } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { FEATURE_GATES } from '@ppa/subscription';
import { MWViewSwitch } from '@ppa/mobile-web';
import {
  FilesDesktopView,
  FilesMobileView,
  FileUploadModal,
  FileDetailModal,
  FileDeleteDialog,
  FilesPageSkeleton,
  NewFolderModal,
  FileSelectionBar,
  MoveFilesModal,
  FileVersionsModal,
  FileShareModal,
} from '@/components/tp/files';
import { TPPaywall } from '@/components/tp/TPPaywall';

export default function FilesPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FileCategory | null>(null);

  const team = useAppStore((state) => state.team);
  const user = useAppStore((state) => state.user);
  const uploadFile = useAppStore((state) => state.uploadFile);
  const deleteFile = useAppStore((state) => state.deleteFile);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const bulkDeleteFiles = useAppStore((state) => state.bulkDeleteFiles);
  const bulkMoveFiles = useAppStore((state) => state.bulkMoveFiles);
  const storageUsedBytes = useAppStore((state) => state.storageUsedBytes);
  const createFolder = useAppStore((state) => state.createFolder);

  const versions = useAppStore((state) => state.versions);
  const versionsLoading = useAppStore((state) => state.versionsLoading);
  const versionRestoring = useAppStore((state) => state.versionRestoring);
  const versionDeleting = useAppStore((state) => state.versionDeleting);
  const loadVersions = useAppStore((state) => state.loadVersions);
  const restoreVersion = useAppStore((state) => state.restoreVersion);
  const deleteVersion = useAppStore((state) => state.deleteVersion);

  const shares = useAppStore((state) => state.shares);
  const sharesLoading = useAppStore((state) => state.sharesLoading);
  const shareCreating = useAppStore((state) => state.shareCreating);
  const loadShares = useAppStore((state) => state.loadShares);
  const createShare = useAppStore((state) => state.createShare);
  const deleteShare = useAppStore((state) => state.deleteShare);

  const { files, isLoading: isFilesLoading } = useLazyFiles();
  const { folders, isLoading: isFoldersLoading } = useLazyFolders();

  const { tier, features, checkFeature } = useSubscription();

  const {
    filesSearchQuery,
    filesShowUploadSheet,
    filesShowDetailModal,
    filesShowDeleteAlert,
    filesShowVersionsModal,
    filesShowShareModal,
    filesShowMoveModal,
    filesShowNewFolderModal,
    filesSelectedFile,
    filesSelectedIds,
    filesIsLoading,
    filesSortBy,
    filesSortOrder,
    filesCurrentFolderId,
    setFilesSearchQuery,
    setFilesShowUploadSheet,
    setFilesShowDetailModal,
    setFilesShowDeleteAlert,
    setFilesShowVersionsModal,
    setFilesShowShareModal,
    setFilesShowMoveModal,
    setFilesShowNewFolderModal,
    setFilesSelectedFile,
    toggleFileSelection,
    selectAllFiles,
    clearFileSelection,
    setFilesSortBy,
    setFilesCurrentFolderId,
    setBackDestination,
    clearBackNavigation,
  } = useAppStore();

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (filesShowVersionsModal && filesSelectedFile && team?.id) {
      loadVersions(team.id, filesSelectedFile.id);
    }
  }, [filesShowVersionsModal, filesSelectedFile, team?.id, loadVersions]);

  useEffect(() => {
    if (filesShowShareModal && filesSelectedFile && team?.id) {
      loadShares(team.id, filesSelectedFile.id);
    }
  }, [filesShowShareModal, filesSelectedFile, team?.id, loadShares]);

  // Configure mobile back button to always go to menu
  useEffect(() => {
    setBackDestination('/menu');
    return () => clearBackNavigation();
  }, [setBackDestination, clearBackNavigation]);

  const currentFolders = useMemo(() => {
    return folders.filter((f) => f.parentId === filesCurrentFolderId);
  }, [folders, filesCurrentFolderId]);

  const currentFiles = useMemo(() => {
    return files.filter((f) => f.folderId === filesCurrentFolderId);
  }, [files, filesCurrentFolderId]);

  const filteredFiles = useMemo(() => {
    const query = filesSearchQuery.toLowerCase();
    return currentFiles.filter(
      (file) => {
        const matchesSearch =
          file.name.toLowerCase().includes(query) ||
          (file.category?.toLowerCase().includes(query) ?? false) ||
          (file.description?.toLowerCase().includes(query) ?? false);
        const matchesCategory = !selectedCategory || file.category === selectedCategory;
        return matchesSearch && matchesCategory;
      }
    );
  }, [filesSearchQuery, currentFiles, selectedCategory]);

  const filteredFolders = useMemo(() => {
    if (!filesSearchQuery) return currentFolders;
    return currentFolders.filter((f) =>
      f.name.toLowerCase().includes(filesSearchQuery.toLowerCase())
    );
  }, [currentFolders, filesSearchQuery]);

  const folderBreadcrumbs = useMemo(() => {
    const crumbs: Folder[] = [];
    let folderId = filesCurrentFolderId;
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
  }, [folders, filesCurrentFolderId]);

  const storageLimitBytes = FEATURE_GATES[tier]?.maxFileStorageBytes ?? 0;

  const handleUploadClick = useCallback(() => {
    if (!checkFeature('canUploadFiles')) return;
    setFilesShowUploadSheet(true);
  }, [checkFeature, setFilesShowUploadSheet]);

  const handleNewFolderClick = useCallback(() => {
    if (!checkFeature('canCreateFolders')) return;
    setFilesShowNewFolderModal(true);
  }, [checkFeature, setFilesShowNewFolderModal]);

  const handleFolderClick = useCallback((folder: Folder) => {
    setFilesCurrentFolderId(folder.id);
    clearFileSelection();
  }, [setFilesCurrentFolderId, clearFileSelection]);

  const handleBreadcrumbNavigate = useCallback((folderId: string | null) => {
    setFilesCurrentFolderId(folderId);
    clearFileSelection();
  }, [setFilesCurrentFolderId, clearFileSelection]);

  const handleRowClick = useCallback((file: AppFile) => {
    setFilesSelectedFile(file);
    setFilesShowDetailModal(true);
  }, [setFilesSelectedFile, setFilesShowDetailModal]);

  const handleDeleteClick = useCallback((file: AppFile) => {
    setFilesSelectedFile(file);
    setFilesShowDeleteAlert(true);
  }, [setFilesSelectedFile, setFilesShowDeleteAlert]);

  const handleToggleSelect = useCallback((id: string) => {
    toggleFileSelection(id);
  }, [toggleFileSelection]);

  const handleSelectAll = useCallback(() => {
    const allIds = [...filteredFiles.map(f => f.id), ...filteredFolders.map(f => `folder-${f.id}`)];
    selectAllFiles(allIds);
  }, [filteredFiles, filteredFolders, selectAllFiles]);

  const handleToggleFavorite = useCallback(async (file: AppFile) => {
    if (!team?.id) return;
    try {
      await toggleFavorite(team.id, file.id);
      setSuccessMessage(file.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch {
      console.error('Failed to toggle favorite');
    }
  }, [team?.id, toggleFavorite]);

  const handleSort = useCallback((field: 'name' | 'size' | 'uploadedAt' | 'category') => {
    setFilesSortBy(field);
  }, [setFilesSortBy]);

  const handleUploadFiles = useCallback(async (
    uploadFiles: File[],
    category: FileCategory,
    description?: string,
    folderId?: string,
    tags?: string[]
  ) => {
    if (!team?.id || !user?.uid) return;

    const mapFileType = (mime: string): FileType => {
      if (mime.includes('pdf')) return 'pdf';
      if (mime.includes('image')) return 'image';
      if (mime.includes('video')) return 'video';
      if (mime.includes('audio')) return 'audio';
      return 'other';
    };

    try {
      for (const file of uploadFiles) {
        await uploadFile(team.id, file, {
          name: file.name,
          size: file.size,
          type: mapFileType(file.type),
          category,
          description,
          uploadedBy: user.uid,
          uploadedAt: Date.now(),
          folderId: folderId ?? filesCurrentFolderId,
          tags: tags ?? [],
          isFavorite: false,
        });
      }
      setFilesShowUploadSheet(false);
      setSuccessMessage(`${uploadFiles.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  }, [team?.id, user?.uid, uploadFile, filesCurrentFolderId, setFilesShowUploadSheet]);

  const handleConfirmDelete = useCallback(async () => {
    if (!team?.id || !filesSelectedFile) return;

    const fileName = filesSelectedFile.name;
    try {
      await deleteFile(team.id, filesSelectedFile.id, filesSelectedFile.url);
      setFilesShowDeleteAlert(false);
      setFilesSelectedFile(null);
      setSuccessMessage(`"${fileName}" deleted successfully`);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  }, [team?.id, filesSelectedFile, deleteFile, setFilesShowDeleteAlert, setFilesSelectedFile]);

  const handleBulkDelete = useCallback(async () => {
    if (!team?.id || filesSelectedIds.length === 0) return;

    try {
      const fileIds = filesSelectedIds.filter(id => !id.startsWith('folder-'));
      await bulkDeleteFiles(team.id, fileIds);
      clearFileSelection();
      setSuccessMessage(`${fileIds.length} file(s) deleted`);
    } catch (error) {
      console.error('Failed to bulk delete:', error);
    }
  }, [team?.id, filesSelectedIds, bulkDeleteFiles, clearFileSelection]);

  const handleBulkMoveClick = useCallback(() => {
    setFilesShowMoveModal(true);
  }, [setFilesShowMoveModal]);

  const handleBulkMove = useCallback(async (targetFolderId: string | null) => {
    if (!team?.id || filesSelectedIds.length === 0) return;

    try {
      const fileIds = filesSelectedIds.filter(id => !id.startsWith('folder-'));
      await bulkMoveFiles(team.id, fileIds, targetFolderId);
      clearFileSelection();
      setFilesShowMoveModal(false);
      setSuccessMessage(`${fileIds.length} file(s) moved`);
    } catch (error) {
      console.error('Failed to bulk move:', error);
    }
  }, [team?.id, filesSelectedIds, bulkMoveFiles, clearFileSelection, setFilesShowMoveModal]);

  const handleCreateFolder = useCallback(async (name: string) => {
    if (!team?.id || !user?.uid) return;
    await createFolder(team.id, {
      name,
      parentId: filesCurrentFolderId,
      teamId: team.id,
      createdBy: user.uid,
      createdAt: Date.now(),
    });
    setFilesShowNewFolderModal(false);
    setSuccessMessage('Folder created');
  }, [team?.id, user?.uid, filesCurrentFolderId, createFolder, setFilesShowNewFolderModal]);

  const handleRestoreVersion = useCallback(async (versionId: string) => {
    if (!team?.id || !filesSelectedFile) return;
    await restoreVersion(team.id, filesSelectedFile.id, versionId);
    setSuccessMessage('Version restored');
  }, [team?.id, filesSelectedFile, restoreVersion]);

  const handleDeleteVersion = useCallback(async (versionId: string) => {
    if (!team?.id || !filesSelectedFile) return;
    await deleteVersion(team.id, filesSelectedFile.id, versionId);
    setSuccessMessage('Version deleted');
  }, [team?.id, filesSelectedFile, deleteVersion]);

  const handleDownloadVersion = useCallback((version: FileVersion) => {
    const link = document.createElement('a');
    link.href = version.url;
    link.download = `v${version.versionNumber}_${filesSelectedFile?.name ?? 'file'}`;
    link.click();
  }, [filesSelectedFile]);

  const handleCreateShareLink = useCallback(async (permission: SharePermission, expiresAt?: number, password?: string) => {
    if (!team?.id || !filesSelectedFile) throw new Error('No file selected');
    const share = await createShare(team.id, filesSelectedFile.id, {
      type: 'link',
      permission,
      expiresAt,
      password,
    });
    setSuccessMessage('Share link created');
    return share;
  }, [team?.id, filesSelectedFile, createShare]);

  const handleDeleteShareLink = useCallback(async (shareId: string) => {
    if (!team?.id || !filesSelectedFile) return;
    await deleteShare(team.id, filesSelectedFile.id, shareId);
    setSuccessMessage('Share link deleted');
  }, [team?.id, filesSelectedFile, deleteShare]);

  const handleCloseUploadModal = useCallback(() => {
    setFilesShowUploadSheet(false);
  }, [setFilesShowUploadSheet]);

  const handleCloseDetailModal = useCallback(() => {
    setFilesShowDetailModal(false);
    setFilesSelectedFile(null);
  }, [setFilesShowDetailModal, setFilesSelectedFile]);

  const handleCancelDelete = useCallback(() => {
    setFilesShowDeleteAlert(false);
    setFilesSelectedFile(null);
  }, [setFilesShowDeleteAlert, setFilesSelectedFile]);

  if (filesIsLoading || isFilesLoading || isFoldersLoading) {
    return <FilesPageSkeleton />;
  }

  if (!features.canUploadFiles) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <TPPaywall />
      </div>
    );
  }

  return (
    <>
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-2 text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <MWViewSwitch
        mobile={
          <FilesMobileView
            files={filteredFiles}
            folders={filteredFolders}
            currentFolderId={filesCurrentFolderId}
            searchQuery={filesSearchQuery}
            selectedCategory={selectedCategory}
            folderBreadcrumbs={folderBreadcrumbs}
            onSearchChange={setFilesSearchQuery}
            onCategoryChange={setSelectedCategory}
            onFolderClick={handleFolderClick}
            onFileClick={handleRowClick}
            onBreadcrumbNavigate={handleBreadcrumbNavigate}
            onUploadClick={handleUploadClick}
            onNewFolderClick={handleNewFolderClick}
            canUpload={features.canUploadFiles}
            canCreateFolders={features.canCreateFolders}
          />
        }
        desktop={
          <FilesDesktopView
            files={filteredFiles}
            folders={filteredFolders}
            selectedIds={filesSelectedIds}
            currentFolderId={filesCurrentFolderId}
            sortBy={filesSortBy as 'name' | 'size' | 'uploadedAt' | 'category' | undefined}
            sortOrder={filesSortOrder}
            totalCount={files.length}
            searchQuery={filesSearchQuery}
            folderBreadcrumbs={folderBreadcrumbs}
            storageUsedBytes={storageUsedBytes}
            storageLimitBytes={storageLimitBytes}
            canUpload={features.canUploadFiles}
            canCreateFolders={features.canCreateFolders}
            onSearchChange={setFilesSearchQuery}
            onRowClick={handleRowClick}
            onFolderClick={handleFolderClick}
            onDelete={handleDeleteClick}
            onAdd={handleUploadClick}
            onAddFolder={handleNewFolderClick}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onToggleFavorite={handleToggleFavorite}
            onSort={handleSort}
            onBreadcrumbNavigate={handleBreadcrumbNavigate}
          />
        }
      />

      {filesSelectedIds.length > 0 && (
        <FileSelectionBar
          selectedCount={filesSelectedIds.length}
          onClear={clearFileSelection}
          onMove={handleBulkMoveClick}
          onDelete={handleBulkDelete}
        />
      )}

      <FileUploadModal
        open={filesShowUploadSheet}
        onClose={handleCloseUploadModal}
        onUpload={handleUploadFiles}
      />

      <FileDetailModal
        open={filesShowDetailModal}
        file={filesSelectedFile}
        onClose={handleCloseDetailModal}
        onOpen={(file) => {
          window.open(file.url, '_blank');
          setSuccessMessage(`Opening "${file.name}"...`);
        }}
        onDownload={(file) => {
          const link = document.createElement('a');
          link.href = file.url;
          link.download = file.name;
          link.click();
          setSuccessMessage(`"${file.name}" download started`);
        }}
        onShare={(file) => {
          if (!checkFeature('canShareFiles')) return;
          setFilesShowShareModal(true);
        }}
        onDelete={handleDeleteClick}
      />

      <FileDeleteDialog
        open={filesShowDeleteAlert}
        file={filesSelectedFile}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <NewFolderModal
        open={filesShowNewFolderModal}
        onClose={() => setFilesShowNewFolderModal(false)}
        onCreate={handleCreateFolder}
        parentFolderName={
          filesCurrentFolderId
            ? folders.find(f => f.id === filesCurrentFolderId)?.name
            : undefined
        }
      />

      <MoveFilesModal
        open={filesShowMoveModal}
        onClose={() => setFilesShowMoveModal(false)}
        folders={folders}
        currentFolderId={filesCurrentFolderId}
        itemCount={filesSelectedIds.filter(id => !id.startsWith('folder-')).length}
        itemType="file"
        onMove={handleBulkMove}
      />

      <FileVersionsModal
        open={filesShowVersionsModal}
        onClose={() => setFilesShowVersionsModal(false)}
        versions={versions}
        currentVersionId={filesSelectedFile?.currentVersionId}
        onRestore={handleRestoreVersion}
        onDelete={handleDeleteVersion}
        onDownload={handleDownloadVersion}
        isLoading={versionsLoading}
        isRestoring={versionRestoring}
        isDeleting={versionDeleting}
      />

      <FileShareModal
        open={filesShowShareModal}
        onClose={() => setFilesShowShareModal(false)}
        shares={shares}
        onCreateLink={handleCreateShareLink}
        onDeleteShare={handleDeleteShareLink}
        isLoading={sharesLoading}
        isCreating={shareCreating}
        fileName={filesSelectedFile?.name}
      />
    </>
  );
}
