import { StateCreator } from 'zustand';
import { Tag } from '@ppa/interfaces';
import {
  createTag as createTagService,
  updateTag as updateTagService,
  deleteTag as deleteTagService,
} from '@ppa/firebase';

export type CreateTagInput = Omit<Tag, 'id' | 'ref' | 'path'>;
export type UpdateTagInput = Partial<Omit<Tag, 'id' | 'ref' | 'path'>>;

export interface TagSlice {
  // Data state
  tags: Tag[];
  tag: Tag | null;

  // Loading/error states
  tagsLoading: boolean;
  tagCreating: boolean;
  tagUpdating: boolean;
  tagDeleting: boolean;
  tagsError: string | null;

  // Basic setters
  setTags: (tags: Tag[]) => void;
  setTag: (tag: Tag | null) => void;

  // Error handling
  setTagsError: (error: string | null) => void;
  clearTagsError: () => void;

  // Async CRUD actions
  createTag: (teamId: string, data: CreateTagInput) => Promise<Tag>;
  updateTag: (teamId: string, tagId: string, updates: UpdateTagInput) => Promise<void>;
  deleteTag: (teamId: string, tagId: string) => Promise<void>;
}

export const createTagSlice: StateCreator<TagSlice> = (set) => ({
  // Initial data state
  tags: [],
  tag: null,

  // Initial loading/error states
  tagsLoading: false,
  tagCreating: false,
  tagUpdating: false,
  tagDeleting: false,
  tagsError: null,

  // Basic setters (deduplicate by ID to prevent duplicates from optimistic updates + listeners)
  setTags: (tags) => {
    const seen = new Set<string>();
    const deduplicated = tags.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
    set({ tags: deduplicated });
  },
  setTag: (tag) => set({ tag }),

  // Error handling
  setTagsError: (error) => set({ tagsError: error }),
  clearTagsError: () => set({ tagsError: null }),

  // Async CRUD actions
  createTag: async (teamId: string, data: CreateTagInput) => {
    set({ tagCreating: true, tagsError: null });
    try {
      const newTag = await createTagService(teamId, data);
      // Note: With real-time subscriptions, the tags array will auto-update
      // Deduplicate to prevent doubles from optimistic update + listener
      set((state) => {
        const exists = state.tags.some((t) => t.id === newTag.id);
        return {
          tags: exists
            ? state.tags
            : [...state.tags, newTag].sort((a, b) => a.name.localeCompare(b.name)),
          tagCreating: false,
        };
      });
      return newTag;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create tag';
      set({ tagsError: message, tagCreating: false });
      throw error;
    }
  },

  updateTag: async (teamId: string, tagId: string, updates: UpdateTagInput) => {
    set({ tagUpdating: true, tagsError: null });
    try {
      await updateTagService(teamId, tagId, updates);
      // Note: With real-time subscriptions, the tags array will auto-update
      set((state) => ({
        tags: state.tags
          .map((t) => (t.id === tagId ? { ...t, ...updates } : t))
          .sort((a, b) => a.name.localeCompare(b.name)),
        tag: state.tag?.id === tagId ? { ...state.tag, ...updates } : state.tag,
        tagUpdating: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update tag';
      set({ tagsError: message, tagUpdating: false });
      throw error;
    }
  },

  deleteTag: async (teamId: string, tagId: string) => {
    set({ tagDeleting: true, tagsError: null });
    try {
      await deleteTagService(teamId, tagId);
      // Note: With real-time subscriptions, the tags array will auto-update
      set((state) => ({
        tags: state.tags.filter((t) => t.id !== tagId),
        tag: state.tag?.id === tagId ? null : state.tag,
        tagDeleting: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete tag';
      set({ tagsError: message, tagDeleting: false });
      throw error;
    }
  },
});
