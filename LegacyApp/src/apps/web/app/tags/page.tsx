'use client';

import { useEffect, useCallback, useMemo, useState } from 'react';
import { Tag } from '@ppa/interfaces';
import { useAppStore } from '@ppa/store';
import { CheckCircle, X } from 'lucide-react';
import {
  TagsDesktopTable,
  TagsMobileView,
  TagCreateModal,
  TagEditModal,
  TagDeleteDialog,
  TagsPageSkeleton,
} from '@/components/tp/tags';
import { MWViewSwitch } from '@ppa/mobile-web';

export default function TagsPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const team = useAppStore((state) => state.team);
  const createTag = useAppStore((state) => state.createTag);
  const updateTag = useAppStore((state) => state.updateTag);
  const deleteTag = useAppStore((state) => state.deleteTag);

  const {
    tagsSearchQuery,
    tagsShowCreateModal,
    tagsShowEditModal,
    tagsShowDeleteAlert,
    tagsSelectedTag,
    tagsIsLoading,
    setTagsSearchQuery,
    setTagsShowCreateModal,
    setTagsShowEditModal,
    setTagsShowDeleteAlert,
    setTagsSelectedTag,
    setTagsIsLoading,
    setBackDestination,
    clearBackNavigation,
  } = useAppStore();

  // Get tags from store
  const tags = useAppStore((state) => state.tags);

  // Auto-dismiss success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Simulate initial loading
  useEffect(() => {
    setTagsIsLoading(true);
    const timer = setTimeout(() => {
      setTagsIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [setTagsIsLoading]);

  // Configure mobile back button to always go to menu
  useEffect(() => {
    setBackDestination('/menu');
    return () => clearBackNavigation();
  }, [setBackDestination, clearBackNavigation]);

  // Filter and sort tags
  const filteredTags = useMemo(() => {
    const query = tagsSearchQuery.toLowerCase();
    return tags
      .filter((tag) => tag.name.toLowerCase().includes(query))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tagsSearchQuery, tags]);

  // Handlers
  const handleCreateClick = useCallback(() => {
    setTagsShowCreateModal(true);
  }, [setTagsShowCreateModal]);

  const handleRowClick = useCallback((tag: Tag) => {
    setTagsSelectedTag(tag);
    setTagsShowEditModal(true);
  }, [setTagsSelectedTag, setTagsShowEditModal]);

  const handleDeleteClick = useCallback((tag: Tag) => {
    setTagsSelectedTag(tag);
    setTagsShowDeleteAlert(true);
  }, [setTagsSelectedTag, setTagsShowDeleteAlert]);

  const handleCreateTag = useCallback(async (name: string) => {
    if (!team?.id) return;

    try {
      await createTag(team.id, {
        name,
        col: `teams/${team.id}/tags`,
      });
      setTagsShowCreateModal(false);
      setSuccessMessage(`Tag "${name}" created successfully`);
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  }, [team?.id, createTag, setTagsShowCreateModal]);

  const handleSaveTag = useCallback(async (tag: Tag, newName: string) => {
    if (!team?.id) return;

    try {
      await updateTag(team.id, tag.id, {
        name: newName,
      });
      setTagsShowEditModal(false);
      setTagsSelectedTag(null);
      setSuccessMessage(`Tag "${newName}" updated successfully`);
    } catch (error) {
      console.error('Failed to update tag:', error);
    }
  }, [team?.id, updateTag, setTagsShowEditModal, setTagsSelectedTag]);

  const handleConfirmDelete = useCallback(async () => {
    if (!team?.id || !tagsSelectedTag) return;

    const tagName = tagsSelectedTag.name;
    try {
      await deleteTag(team.id, tagsSelectedTag.id);
      setTagsShowDeleteAlert(false);
      setTagsSelectedTag(null);
      setSuccessMessage(`Tag "${tagName}" deleted successfully`);
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  }, [team?.id, tagsSelectedTag, deleteTag, setTagsShowDeleteAlert, setTagsSelectedTag]);

  const handleCloseCreateModal = useCallback(() => {
    setTagsShowCreateModal(false);
  }, [setTagsShowCreateModal]);

  const handleCloseEditModal = useCallback(() => {
    setTagsShowEditModal(false);
    setTagsSelectedTag(null);
  }, [setTagsShowEditModal, setTagsSelectedTag]);

  const handleCancelDelete = useCallback(() => {
    setTagsShowDeleteAlert(false);
    setTagsSelectedTag(null);
  }, [setTagsShowDeleteAlert, setTagsSelectedTag]);

  if (tagsIsLoading) {
    return <TagsPageSkeleton />;
  }

  return (
    <>
      {/* Success Toast */}
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
          <TagsMobileView
            tags={filteredTags}
            totalCount={tags.length}
            searchQuery={tagsSearchQuery}
            onSearchChange={setTagsSearchQuery}
            onRowClick={handleRowClick}
            onAdd={handleCreateClick}
            loading={tagsIsLoading}
          />
        }
        desktop={
          <TagsDesktopTable
            tags={filteredTags}
            totalCount={tags.length}
            searchQuery={tagsSearchQuery}
            onSearchChange={setTagsSearchQuery}
            onRowClick={handleRowClick}
            onDelete={handleDeleteClick}
            onAdd={handleCreateClick}
          />
        }
      />

      {/* Modals */}
      <TagCreateModal
        open={tagsShowCreateModal}
        onClose={handleCloseCreateModal}
        onCreate={handleCreateTag}
      />

      <TagEditModal
        open={tagsShowEditModal}
        tag={tagsSelectedTag}
        onClose={handleCloseEditModal}
        onSave={handleSaveTag}
      />

      <TagDeleteDialog
        open={tagsShowDeleteAlert}
        tag={tagsSelectedTag}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
