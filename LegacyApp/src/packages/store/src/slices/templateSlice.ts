import { StateCreator } from 'zustand';
import { Template } from '@ppa/interfaces';
import {
  createTemplate as createTemplateService,
  updateTemplate as updateTemplateService,
  deleteTemplate as deleteTemplateService,
} from '@ppa/firebase';

export type CreateTemplateInput = Omit<Template, 'id' | 'ref'>;
export type UpdateTemplateInput = Partial<Omit<Template, 'id' | 'ref'>>;

export interface TemplateSlice {
  // Data state
  templates: Template[];
  template: Template | null;

  // Loading/error states
  templatesLoading: boolean;
  templateCreating: boolean;
  templateUpdating: boolean;
  templateDeleting: boolean;
  templatesError: string | null;

  // Basic setters
  setTemplates: (templates: Template[]) => void;
  setTemplate: (template: Template | null) => void;

  // Error handling
  setTemplatesError: (error: string | null) => void;
  clearTemplatesError: () => void;

  // Async CRUD actions
  createTemplate: (teamId: string, data: CreateTemplateInput) => Promise<Template>;
  updateTemplate: (teamId: string, templateId: string, updates: UpdateTemplateInput) => Promise<void>;
  deleteTemplate: (teamId: string, templateId: string) => Promise<void>;
}

export const createTemplateSlice: StateCreator<TemplateSlice> = (set) => ({
  // Initial data state
  templates: [],
  template: null,

  // Initial loading/error states
  templatesLoading: false,
  templateCreating: false,
  templateUpdating: false,
  templateDeleting: false,
  templatesError: null,

  // Basic setters (deduplicate by ID to prevent duplicates from optimistic updates + listeners)
  setTemplates: (templates) => {
    const seen = new Set<string>();
    const deduplicated = templates.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
    set({ templates: deduplicated });
  },
  setTemplate: (template) => set({ template }),

  // Error handling
  setTemplatesError: (error) => set({ templatesError: error }),
  clearTemplatesError: () => set({ templatesError: null }),

  // Async CRUD actions
  createTemplate: async (teamId: string, data: CreateTemplateInput) => {
    set({ templateCreating: true, templatesError: null });
    try {
      const newTemplate = await createTemplateService(teamId, data);
      // Note: With real-time subscriptions, the templates array will auto-update
      // Deduplicate to prevent doubles from optimistic update + listener
      set((state) => {
        const exists = state.templates.some((t) => t.id === newTemplate.id);
        return {
          templates: exists
            ? state.templates
            : [...state.templates, newTemplate].sort((a, b) => a.name.localeCompare(b.name)),
          templateCreating: false,
        };
      });
      return newTemplate;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create template';
      set({ templatesError: message, templateCreating: false });
      throw error;
    }
  },

  updateTemplate: async (teamId: string, templateId: string, updates: UpdateTemplateInput) => {
    set({ templateUpdating: true, templatesError: null });
    try {
      await updateTemplateService(teamId, templateId, updates);
      // Note: With real-time subscriptions, the templates array will auto-update
      set((state) => ({
        templates: state.templates
          .map((t) => (t.id === templateId ? { ...t, ...updates } : t))
          .sort((a, b) => a.name.localeCompare(b.name)),
        template: state.template?.id === templateId ? { ...state.template, ...updates } : state.template,
        templateUpdating: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update template';
      set({ templatesError: message, templateUpdating: false });
      throw error;
    }
  },

  deleteTemplate: async (teamId: string, templateId: string) => {
    set({ templateDeleting: true, templatesError: null });
    try {
      await deleteTemplateService(teamId, templateId);
      // Note: With real-time subscriptions, the templates array will auto-update
      set((state) => ({
        templates: state.templates.filter((t) => t.id !== templateId),
        template: state.template?.id === templateId ? null : state.template,
        templateDeleting: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete template';
      set({ templatesError: message, templateDeleting: false });
      throw error;
    }
  },
});
