import { StateCreator } from 'zustand';
import type { User } from '@ppa/interfaces';
import type { OldProjectUser, ReMigrationProgress } from '@ppa/firebase';
import type { QueryDocumentSnapshot } from 'firebase/firestore';

export interface UserWithTeam extends User {
  teamName?: string;
  teamSport?: string;
}

export interface AdminSlice {
  // Impersonation state
  adminIsImpersonating: boolean;
  adminImpersonatedUser: UserWithTeam | null;
  adminOriginalUser: User | null;

  // User list state
  adminAvailableUsers: UserWithTeam[];
  adminUsersLoading: boolean;
  adminUsersError: string | null;
  adminUserSearch: string;

  // Migration state
  adminMigrationLoading: boolean;
  adminMigrationError: string | null;
  adminUnmigratedUsers: string[];

  // UI state
  adminShowUserList: boolean;
  adminShowMigrationPanel: boolean;
  adminSelectedUserForMigration: string | null;

  // Old project users state
  adminOldProjectUsers: OldProjectUser[];
  adminOldProjectUsersLoading: boolean;
  adminOldProjectUsersError: string | null;
  adminOldProjectUsersHasMore: boolean;
  adminOldProjectUsersLastDoc: QueryDocumentSnapshot | null;
  adminOldProjectUsersSearchQuery: string;
  adminSelectedTab: 'current' | 'old';

  // Re-migration state
  adminReMigrationUserId: string | null;
  adminReMigrationIsOpen: boolean;
  adminReMigrationLoading: boolean;
  adminReMigrationProgress: ReMigrationProgress | null;
  adminReMigrationError: string | null;

  // Actions
  setAdminIsImpersonating: (isImpersonating: boolean) => void;
  setAdminImpersonatedUser: (user: UserWithTeam | null) => void;
  setAdminOriginalUser: (user: User | null) => void;
  setAdminAvailableUsers: (users: UserWithTeam[]) => void;
  setAdminUsersLoading: (loading: boolean) => void;
  setAdminUsersError: (error: string | null) => void;
  setAdminUserSearch: (search: string) => void;
  setAdminMigrationLoading: (loading: boolean) => void;
  setAdminMigrationError: (error: string | null) => void;
  setAdminUnmigratedUsers: (emails: string[]) => void;
  setAdminShowUserList: (show: boolean) => void;
  setAdminShowMigrationPanel: (show: boolean) => void;
  setAdminSelectedUserForMigration: (email: string | null) => void;
  setAdminOldProjectUsers: (users: OldProjectUser[]) => void;
  appendAdminOldProjectUsers: (users: OldProjectUser[]) => void;
  setAdminOldProjectUsersLoading: (loading: boolean) => void;
  setAdminOldProjectUsersError: (error: string | null) => void;
  setAdminOldProjectUsersHasMore: (hasMore: boolean) => void;
  setAdminOldProjectUsersLastDoc: (lastDoc: QueryDocumentSnapshot | null) => void;
  setAdminOldProjectUsersSearchQuery: (query: string) => void;
  setAdminSelectedTab: (tab: 'current' | 'old') => void;
  setAdminReMigrationUserId: (userId: string | null) => void;
  setAdminReMigrationIsOpen: (isOpen: boolean) => void;
  setAdminReMigrationLoading: (loading: boolean) => void;
  setAdminReMigrationProgress: (progress: ReMigrationProgress | null) => void;
  setAdminReMigrationError: (error: string | null) => void;
  openReMigrationDialog: (userId: string) => void;
  closeReMigrationDialog: () => void;

  // Complex actions
  startImpersonation: (targetUser: UserWithTeam, originalUser: User) => void;
  stopImpersonation: () => void;
  resetAdminState: () => void;
}

const initialState = {
  adminIsImpersonating: false,
  adminImpersonatedUser: null,
  adminOriginalUser: null,
  adminAvailableUsers: [],
  adminUsersLoading: false,
  adminUsersError: null,
  adminUserSearch: '',
  adminMigrationLoading: false,
  adminMigrationError: null,
  adminUnmigratedUsers: [],
  adminShowUserList: false,
  adminShowMigrationPanel: false,
  adminSelectedUserForMigration: null,
  adminOldProjectUsers: [],
  adminOldProjectUsersLoading: false,
  adminOldProjectUsersError: null,
  adminOldProjectUsersHasMore: false,
  adminOldProjectUsersLastDoc: null,
  adminOldProjectUsersSearchQuery: '',
  adminSelectedTab: 'current' as 'current' | 'old',
  adminReMigrationUserId: null,
  adminReMigrationIsOpen: false,
  adminReMigrationLoading: false,
  adminReMigrationProgress: null,
  adminReMigrationError: null,
};

export const createAdminSlice: StateCreator<AdminSlice> = (set) => ({
  ...initialState,

  // Simple setters
  setAdminIsImpersonating: (isImpersonating) => set({ adminIsImpersonating: isImpersonating }),
  setAdminImpersonatedUser: (user) => set({ adminImpersonatedUser: user }),
  setAdminOriginalUser: (user) => set({ adminOriginalUser: user }),
  setAdminAvailableUsers: (users) => set({ adminAvailableUsers: users }),
  setAdminUsersLoading: (loading) => set({ adminUsersLoading: loading }),
  setAdminUsersError: (error) => set({ adminUsersError: error }),
  setAdminUserSearch: (search) => set({ adminUserSearch: search }),
  setAdminMigrationLoading: (loading) => set({ adminMigrationLoading: loading }),
  setAdminMigrationError: (error) => set({ adminMigrationError: error }),
  setAdminUnmigratedUsers: (emails) => set({ adminUnmigratedUsers: emails }),
  setAdminShowUserList: (show) => set({ adminShowUserList: show }),
  setAdminShowMigrationPanel: (show) => set({ adminShowMigrationPanel: show }),
  setAdminSelectedUserForMigration: (email) => set({ adminSelectedUserForMigration: email }),
  setAdminOldProjectUsers: (users) => set({ adminOldProjectUsers: users }),
  appendAdminOldProjectUsers: (users) =>
    set((state) => ({ adminOldProjectUsers: [...state.adminOldProjectUsers, ...users] })),
  setAdminOldProjectUsersLoading: (loading) => set({ adminOldProjectUsersLoading: loading }),
  setAdminOldProjectUsersError: (error) => set({ adminOldProjectUsersError: error }),
  setAdminOldProjectUsersHasMore: (hasMore) => set({ adminOldProjectUsersHasMore: hasMore }),
  setAdminOldProjectUsersLastDoc: (lastDoc) => set({ adminOldProjectUsersLastDoc: lastDoc }),
  setAdminOldProjectUsersSearchQuery: (query) => set({ adminOldProjectUsersSearchQuery: query }),
  setAdminSelectedTab: (tab) => set({ adminSelectedTab: tab }),
  setAdminReMigrationUserId: (userId) => set({ adminReMigrationUserId: userId }),
  setAdminReMigrationIsOpen: (isOpen) => set({ adminReMigrationIsOpen: isOpen }),
  setAdminReMigrationLoading: (loading) => set({ adminReMigrationLoading: loading }),
  setAdminReMigrationProgress: (progress) => set({ adminReMigrationProgress: progress }),
  setAdminReMigrationError: (error) => set({ adminReMigrationError: error }),
  openReMigrationDialog: (userId) =>
    set({
      adminReMigrationUserId: userId,
      adminReMigrationIsOpen: true,
      adminReMigrationError: null,
      adminReMigrationProgress: null,
    }),
  closeReMigrationDialog: () =>
    set({
      adminReMigrationUserId: null,
      adminReMigrationIsOpen: false,
      adminReMigrationLoading: false,
      adminReMigrationProgress: null,
      adminReMigrationError: null,
    }),

  // Complex actions
  startImpersonation: (targetUser, originalUser) =>
    set({
      adminIsImpersonating: true,
      adminImpersonatedUser: targetUser,
      adminOriginalUser: originalUser,
    }),

  stopImpersonation: () =>
    set({
      adminIsImpersonating: false,
      adminImpersonatedUser: null,
      // Keep originalUser so we can restore properly
    }),

  resetAdminState: () => set(initialState),
});
