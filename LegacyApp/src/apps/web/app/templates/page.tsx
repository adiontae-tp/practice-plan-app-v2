'use client';

import { useEffect, useCallback, useMemo, useState } from 'react';
import { Template } from '@ppa/interfaces';
import { useAppStore } from '@ppa/store';
import { CheckCircle, X } from 'lucide-react';
import { MWViewSwitch } from '@ppa/mobile-web';
import {
  TemplatesDesktopTable,
  TemplatesMobileView,
  TemplateDetailModal,
  TemplateCreateModal,
  TemplateEditModal,
  TemplateDeleteDialog,
  TemplatesPageSkeleton,
} from '@/components/tp/templates';

export default function TemplatesPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const team = useAppStore((state) => state.team);
  const createTemplate = useAppStore((state) => state.createTemplate);
  const updateTemplate = useAppStore((state) => state.updateTemplate);
  const deleteTemplate = useAppStore((state) => state.deleteTemplate);

  const {
    templatesSearchQuery,
    templatesShowCreateModal,
    templatesShowDetailModal,
    templatesShowEditModal,
    templatesShowDeleteAlert,
    templatesSelectedTemplate,
    // templatesIsLoading handles by store
    setTemplatesSearchQuery,
    setTemplatesShowCreateModal,
    setTemplatesShowDetailModal,
    setTemplatesShowEditModal,
    setTemplatesShowDeleteAlert,
    setTemplatesSelectedTemplate,
    setBackDestination,
    clearBackNavigation,
  } = useAppStore();

  // Get templates from store
  const templates = useAppStore((state) => state.templates);
  const isAppLoading = useAppStore((state) => state.isAppLoading);

  // Auto-dismiss success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Configure mobile back button to always go to menu
  useEffect(() => {
    setBackDestination('/menu');
    return () => clearBackNavigation();
  }, [setBackDestination, clearBackNavigation]);

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    const query = templatesSearchQuery.toLowerCase();
    return templates
      .filter((template) => template.name.toLowerCase().includes(query))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [templatesSearchQuery, templates]);

  // Handlers
  const handleCreateClick = useCallback(() => {
    setTemplatesShowCreateModal(true);
  }, [setTemplatesShowCreateModal]);

  const handleRowClick = useCallback((template: Template) => {
    setTemplatesSelectedTemplate(template);
    setTemplatesShowDetailModal(true);
  }, [setTemplatesSelectedTemplate, setTemplatesShowDetailModal]);

  const handleDeleteClick = useCallback((template: Template) => {
    setTemplatesSelectedTemplate(template);
    setTemplatesShowDeleteAlert(true);
  }, [setTemplatesSelectedTemplate, setTemplatesShowDeleteAlert]);

  const handleCreateTemplate = useCallback(async (name: string) => {
    if (!team?.id) return;

    try {
      await createTemplate(team.id, {
        name,
        activities: [],
        duration: 0 as any,
        tags: [],
        col: `teams/${team.id}/templates`,
      });
      
      setTemplatesShowCreateModal(false);
      setSuccessMessage(`Template "${name}" created successfully`);
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  }, [team?.id, createTemplate, setTemplatesShowCreateModal]);

  const handleEditFromDetail = useCallback((template: Template) => {
    setTemplatesShowDetailModal(false);
    setTemplatesShowEditModal(true);
  }, [setTemplatesShowDetailModal, setTemplatesShowEditModal]);

  const handleDuplicateTemplate = useCallback(async (template: Template) => {
    if (!team?.id) return;
    
    try {
      await createTemplate(team.id, {
        name: `${template.name} (Copy)`,
        activities: template.activities || [],
        duration: template.duration,
        tags: Array.isArray(template.tags) ? template.tags as any : [],
        col: `teams/${team.id}/templates`,
      });
      
      setTemplatesShowDetailModal(false);
      setSuccessMessage(`Template "${template.name}" duplicated successfully`);
    } catch (error) {
      console.error('Failed to duplicate template:', error);
    }
  }, [team?.id, createTemplate, setTemplatesShowDetailModal]);

  const handleDeleteFromDetail = useCallback((template: Template) => {
    setTemplatesShowDetailModal(false);
    setTemplatesShowDeleteAlert(true);
  }, [setTemplatesShowDetailModal, setTemplatesShowDeleteAlert]);

  const handleSaveTemplate = useCallback(async (template: Template, newName: string) => {
    if (!team?.id) return;

    try {
      await updateTemplate(team.id, template.id, {
        name: newName,
      });

      setTemplatesShowEditModal(false);
      setTemplatesSelectedTemplate(null);
      setSuccessMessage(`Template "${newName}" updated successfully`);
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  }, [team?.id, updateTemplate, setTemplatesShowEditModal, setTemplatesSelectedTemplate]);

  const handleConfirmDelete = useCallback(async () => {
    if (!team?.id || !templatesSelectedTemplate) return;
    
    const templateName = templatesSelectedTemplate.name;
    try {
      await deleteTemplate(team.id, templatesSelectedTemplate.id);
      
      setTemplatesShowDeleteAlert(false);
      setTemplatesSelectedTemplate(null);
      setSuccessMessage(`Template "${templateName}" deleted successfully`);
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  }, [team?.id, templatesSelectedTemplate, deleteTemplate, setTemplatesShowDeleteAlert, setTemplatesSelectedTemplate]);

  const handleCloseCreateModal = useCallback(() => {
    setTemplatesShowCreateModal(false);
  }, [setTemplatesShowCreateModal]);

  const handleCloseDetailModal = useCallback(() => {
    setTemplatesShowDetailModal(false);
    setTemplatesSelectedTemplate(null);
  }, [setTemplatesShowDetailModal, setTemplatesSelectedTemplate]);

  const handleCloseEditModal = useCallback(() => {
    setTemplatesShowEditModal(false);
    setTemplatesSelectedTemplate(null);
  }, [setTemplatesShowEditModal, setTemplatesSelectedTemplate]);

  const handleCancelDelete = useCallback(() => {
    setTemplatesShowDeleteAlert(false);
    setTemplatesSelectedTemplate(null);
  }, [setTemplatesShowDeleteAlert, setTemplatesSelectedTemplate]);

  if (isAppLoading && templates.length === 0) {
    return <TemplatesPageSkeleton />;
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
          <TemplatesMobileView
            templates={filteredTemplates}
            totalCount={templates.length}
            searchQuery={templatesSearchQuery}
            onSearchChange={setTemplatesSearchQuery}
            onRowClick={handleRowClick}
            onDelete={handleDeleteClick}
            onAdd={handleCreateClick}
          />
        }
        desktop={
          <TemplatesDesktopTable
            templates={filteredTemplates}
            totalCount={templates.length}
            searchQuery={templatesSearchQuery}
            onSearchChange={setTemplatesSearchQuery}
            onRowClick={handleRowClick}
            onDelete={handleDeleteClick}
            onAdd={handleCreateClick}
          />
        }
      />

      {/* Modals */}
      <TemplateDetailModal
        open={templatesShowDetailModal}
        template={templatesSelectedTemplate}
        onClose={handleCloseDetailModal}
        onEdit={handleEditFromDetail}
        onDuplicate={handleDuplicateTemplate}
        onDelete={handleDeleteFromDetail}
      />

      <TemplateCreateModal
        open={templatesShowCreateModal}
        onClose={handleCloseCreateModal}
        onCreate={handleCreateTemplate}
      />

      <TemplateEditModal
        open={templatesShowEditModal}
        template={templatesSelectedTemplate}
        onClose={handleCloseEditModal}
        onSave={handleSaveTemplate}
      />

      <TemplateDeleteDialog
        open={templatesShowDeleteAlert}
        template={templatesSelectedTemplate}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
