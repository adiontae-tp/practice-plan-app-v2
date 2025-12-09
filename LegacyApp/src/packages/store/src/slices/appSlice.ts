import { StateCreator } from 'zustand';
import {
  subscribeToAuthStateChanges,
  subscribeToUser,
  subscribeToTeam,
  subscribeToPlans,
  subscribeToTags,
  subscribeToPeriods,
  subscribeToTemplates,
  subscribeToCoaches,
  subscribeToFiles,
  subscribeToAnnouncements,
  createNewUserWithTeam,
  createDefaultTeam,
  type AuthUser,
} from '@ppa/firebase';
import type { User, Team, Coach, File, Announcement } from '@ppa/interfaces';

// Combined store type will be provided when integrating
type StoreState = {
  // User slice
  setUser: (user: User | null) => void;
  // Team slice
  setTeam: (team: Team | null) => void;
  // Plan slice
  setPlans: (plans: any[]) => void;
  // Tag slice
  setTags: (tags: any[]) => void;
  // Period slice
  setPeriods: (periods: any[]) => void;
  // Template slice
  setTemplates: (templates: any[]) => void;
  // Coach slice
  setCoaches: (coaches: Coach[]) => void;
  // File slice
  setFiles: (files: File[]) => void;
  // Announcement slice
  setAnnouncements: (announcements: Announcement[]) => void;
  // App slice
} & AppSlice;

export interface AppSlice {
  // State
  isAppInitialized: boolean;
  isAppLoading: boolean;
  isCriticalDataLoaded: boolean;
  isBackgroundDataLoading: boolean;
  isFilesSubscribed: boolean;
  isAnnouncementsSubscribed: boolean;
  appError: string | null;
  authUser: AuthUser | null;

  // Actions
  initializeApp: () => void;
  resetApp: () => void;
  setAppError: (error: string | null) => void;
  subscribeToFilesData: (teamId: string) => void;
  subscribeToAnnouncementsData: (teamId: string) => void;
  // Impersonation support for web
  switchToImpersonatedUser: (userId: string) => void;
  restoreOriginalUser: () => void;
}

// Store unsubscribe functions outside the slice for cleanup
let authUnsubscribe: (() => void) | null = null;
let userUnsubscribe: (() => void) | null = null;
let teamUnsubscribe: (() => void) | null = null;
let plansUnsubscribe: (() => void) | null = null;
let tagsUnsubscribe: (() => void) | null = null;
let periodsUnsubscribe: (() => void) | null = null;
let templatesUnsubscribe: (() => void) | null = null;
let coachesUnsubscribe: (() => void) | null = null;
let filesUnsubscribe: (() => void) | null = null;
let announcementsUnsubscribe: (() => void) | null = null;

// Track which data subscriptions have received their first data
// Critical data (Tier 1) - blocks initial UI render
let criticalLoadingState = {
  plans: false,
};

// Background data (Tier 2) - loads after UI is visible
let backgroundLoadingState = {
  tags: false,
  periods: false,
  templates: false,
  coaches: false,
};

// Helper to reset data loading state
const resetDataLoadingState = () => {
  criticalLoadingState = {
    plans: false,
  };
  backgroundLoadingState = {
    tags: false,
    periods: false,
    templates: false,
    coaches: false,
  };
};

// Helper to check if critical data has loaded (for UI unblocking)
const checkCriticalDataLoaded = () => {
  return criticalLoadingState.plans;
};

// Helper to check if background data has loaded
const checkBackgroundDataLoaded = () => {
  return Object.values(backgroundLoadingState).every((loaded) => loaded);
};

// Helper to cleanup all data subscriptions
const cleanupDataSubscriptions = () => {
  if (plansUnsubscribe) {
    plansUnsubscribe();
    plansUnsubscribe = null;
  }
  if (tagsUnsubscribe) {
    tagsUnsubscribe();
    tagsUnsubscribe = null;
  }
  if (periodsUnsubscribe) {
    periodsUnsubscribe();
    periodsUnsubscribe = null;
  }
  if (templatesUnsubscribe) {
    templatesUnsubscribe();
    templatesUnsubscribe = null;
  }
  if (coachesUnsubscribe) {
    coachesUnsubscribe();
    coachesUnsubscribe = null;
  }
  if (filesUnsubscribe) {
    filesUnsubscribe();
    filesUnsubscribe = null;
  }
  if (announcementsUnsubscribe) {
    announcementsUnsubscribe();
    announcementsUnsubscribe = null;
  }
  resetDataLoadingState();
};

// Helper to cleanup team subscription
const cleanupTeamSubscription = () => {
  cleanupDataSubscriptions();
  if (teamUnsubscribe) {
    teamUnsubscribe();
    teamUnsubscribe = null;
  }
};

// Helper to cleanup user subscription
const cleanupUserSubscription = () => {
  cleanupTeamSubscription();
  if (userUnsubscribe) {
    userUnsubscribe();
    userUnsubscribe = null;
  }
};

export const createAppSlice: StateCreator<StoreState, [], [], AppSlice> = (set, get) => ({
  // Initial state
  isAppInitialized: false,
  isAppLoading: true,
  isCriticalDataLoaded: false,
  isBackgroundDataLoading: false,
  isFilesSubscribed: false,
  isAnnouncementsSubscribed: false,
  appError: null,
  authUser: null,

  subscribeToFilesData: (teamId: string) => {
    if (filesUnsubscribe) return;
    set({ isFilesSubscribed: true });
    filesUnsubscribe = subscribeToFiles(teamId, (files) => {
      get().setFiles(files);
    });
  },

  subscribeToAnnouncementsData: (teamId: string) => {
    if (announcementsUnsubscribe) return;
    set({ isAnnouncementsSubscribed: true });
    announcementsUnsubscribe = subscribeToAnnouncements(teamId, (announcements) => {
      get().setAnnouncements(announcements);
    });
  },

  initializeApp: () => {
    // Prevent multiple initializations
    if (authUnsubscribe) {
      return;
    }

    set({ isAppLoading: true, appError: null, isCriticalDataLoaded: false });

    // Set up auth state listener
    authUnsubscribe = subscribeToAuthStateChanges((authUser) => {
      set({ authUser });

      if (!authUser) {
        // User logged out - cleanup everything
        cleanupUserSubscription();
        get().setUser(null);
        get().setTeam(null);
        get().setPlans([]);
        get().setTags([]);
        get().setPeriods([]);
        get().setTemplates([]);
        get().setCoaches([]);
        get().setFiles([]);
        get().setAnnouncements([]);
        set({ 
          isAppInitialized: true, 
          isAppLoading: false, 
          isCriticalDataLoaded: false,
          isBackgroundDataLoading: false,
          isFilesSubscribed: false,
          isAnnouncementsSubscribed: false,
        });
        return;
      }

      // User logged in - subscribe to user document
      cleanupUserSubscription(); // Clean up any existing subscriptions first

      userUnsubscribe = subscribeToUser(authUser.uid, async (user) => {
        // Handle case where auth user exists but no Firestore user document
        if (!user && authUser) {
          console.log('Auth user exists but no Firestore user document, creating...');
          try {
            const nameParts = (authUser.displayName || 'New User').trim().split(' ');
            const fname = nameParts[0] || 'New';
            const lname = nameParts.slice(1).join(' ') || 'User';
            
            const result = await createNewUserWithTeam(
              authUser.uid,
              authUser.email || '',
              fname,
              lname,
              'My Team',
              ''
            );
            
            if (!result.success) {
              console.error('Failed to create user document:', result.error);
              set({ 
                isAppInitialized: true, 
                isAppLoading: false,
                isCriticalDataLoaded: true,
                appError: 'Failed to set up your account. Please try again.',
              });
            }
            // The user subscription will re-trigger with the new user doc
            return;
          } catch (error) {
            console.error('Error creating user document:', error);
            set({ 
              isAppInitialized: true, 
              isAppLoading: false,
              isCriticalDataLoaded: true,
              appError: 'Failed to set up your account. Please try again.',
            });
            return;
          }
        }

        get().setUser(user);

        // Handle case where user exists but no teamRef
        if (user && !user.teamRef && authUser) {
          console.log('User exists but no teamRef, creating default team...');
          try {
            const result = await createDefaultTeam(authUser.uid, authUser.email || '');
            if (!result.success) {
              console.error('Failed to create default team:', result.error);
            }
            // The user subscription will re-trigger with the updated teamRef
            return;
          } catch (error) {
            console.error('Error creating default team:', error);
          }
        }

        if (!user || !user.teamRef) {
          // No user doc or no team - cleanup team subscriptions
          cleanupTeamSubscription();
          get().setTeam(null);
          get().setPlans([]);
          get().setTags([]);
          get().setPeriods([]);
          get().setTemplates([]);
          get().setCoaches([]);
          get().setFiles([]);
          get().setAnnouncements([]);
          set({ 
            isAppInitialized: true, 
            isAppLoading: false,
            isCriticalDataLoaded: true,
            isBackgroundDataLoading: false,
          });
          return;
        }

        // User has a team - subscribe to team document
        // Only subscribe if not already subscribed to this team
        if (!teamUnsubscribe) {
          teamUnsubscribe = subscribeToTeam(user.teamRef, (team) => {
            get().setTeam(team);

            if (!team || !team.id) {
              // No team data - cleanup data subscriptions
              cleanupDataSubscriptions();
              get().setPlans([]);
              get().setTags([]);
              get().setPeriods([]);
              get().setTemplates([]);
              get().setCoaches([]);
              get().setFiles([]);
              get().setAnnouncements([]);
              set({ 
                isAppInitialized: true, 
                isAppLoading: false,
                isCriticalDataLoaded: true,
                isBackgroundDataLoading: false,
              });
              return;
            }

            // Team loaded - subscribe to team-scoped data
            const teamId = team.id;

            // Reset data loading state when subscribing to new team
            resetDataLoadingState();
            set({ isBackgroundDataLoading: true });

            // TIER 1: Critical data (blocks UI) - Plans with date filter
            if (!plansUnsubscribe) {
              const now = Date.now();
              const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
              const thirtyDaysFromNow = now + (30 * 24 * 60 * 60 * 1000);
              
              plansUnsubscribe = subscribeToPlans(teamId, (plans) => {
                get().setPlans(plans);
                criticalLoadingState.plans = true;
                if (checkCriticalDataLoaded()) {
                  set({ isCriticalDataLoaded: true, isAppLoading: false, isAppInitialized: true });
                }
              }, sevenDaysAgo, thirtyDaysFromNow);
            }

            // TIER 2: Background data (loads after UI is visible)
            if (!tagsUnsubscribe) {
              tagsUnsubscribe = subscribeToTags(teamId, (tags) => {
                get().setTags(tags);
                backgroundLoadingState.tags = true;
                if (checkBackgroundDataLoaded()) {
                  set({ isBackgroundDataLoading: false });
                }
              });
            }

            if (!periodsUnsubscribe) {
              periodsUnsubscribe = subscribeToPeriods(teamId, (periods) => {
                get().setPeriods(periods);
                backgroundLoadingState.periods = true;
                if (checkBackgroundDataLoaded()) {
                  set({ isBackgroundDataLoading: false });
                }
              });
            }

            if (!templatesUnsubscribe) {
              templatesUnsubscribe = subscribeToTemplates(teamId, (templates) => {
                get().setTemplates(templates);
                backgroundLoadingState.templates = true;
                if (checkBackgroundDataLoaded()) {
                  set({ isBackgroundDataLoading: false });
                }
              });
            }

            if (!coachesUnsubscribe) {
              coachesUnsubscribe = subscribeToCoaches(teamId, (coaches) => {
                get().setCoaches(coaches);
                backgroundLoadingState.coaches = true;
                if (checkBackgroundDataLoaded()) {
                  set({ isBackgroundDataLoading: false });
                }
              });
            }

            // TIER 3: Lazy data (files, announcements) - NOT subscribed here
            // These are subscribed on-demand via subscribeToFilesData/subscribeToAnnouncementsData
          });
        }
      });
    });
  },

  resetApp: () => {
    // Cleanup all subscriptions
    cleanupUserSubscription();
    if (authUnsubscribe) {
      authUnsubscribe();
      authUnsubscribe = null;
    }

    // Reset all data
    get().setUser(null);
    get().setTeam(null);
    get().setPlans([]);
    get().setTags([]);
    get().setPeriods([]);
    get().setTemplates([]);
    get().setCoaches([]);
    get().setFiles([]);
    get().setAnnouncements([]);

    // Reset app state
    set({
      isAppInitialized: false,
      isAppLoading: false,
      isCriticalDataLoaded: false,
      isBackgroundDataLoading: false,
      isFilesSubscribed: false,
      isAnnouncementsSubscribed: false,
      appError: null,
      authUser: null,
    });
  },

  setAppError: (error) => set({ appError: error }),

  // Switch to viewing as an impersonated user (web only)
  // This cleans up current subscriptions and subscribes to the impersonated user's data
  switchToImpersonatedUser: (userId: string) => {
    // Cleanup current user/team/data subscriptions (but keep auth subscription)
    cleanupUserSubscription();

    // Clear current data
    get().setUser(null);
    get().setTeam(null);
    get().setPlans([]);
    get().setTags([]);
    get().setPeriods([]);
    get().setTemplates([]);
    get().setCoaches([]);
    get().setFiles([]);
    get().setAnnouncements([]);

    set({
      isAppLoading: true,
      isCriticalDataLoaded: false,
      isBackgroundDataLoading: false,
      isFilesSubscribed: false,
      isAnnouncementsSubscribed: false,
    });

    // Subscribe to impersonated user's data
    userUnsubscribe = subscribeToUser(userId, (user) => {
      get().setUser(user);

      if (!user || !user.teamRef) {
        cleanupTeamSubscription();
        get().setTeam(null);
        set({
          isAppLoading: false,
          isCriticalDataLoaded: true,
        });
        return;
      }

      // Subscribe to impersonated user's team
      if (!teamUnsubscribe) {
        teamUnsubscribe = subscribeToTeam(user.teamRef, (team) => {
          get().setTeam(team);

          if (!team || !team.id) {
            cleanupDataSubscriptions();
            set({
              isAppLoading: false,
              isCriticalDataLoaded: true,
            });
            return;
          }

          const teamId = team.id;
          resetDataLoadingState();
          set({ isBackgroundDataLoading: true });

          // Subscribe to team data
          if (!plansUnsubscribe) {
            const now = Date.now();
            const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
            const thirtyDaysFromNow = now + (30 * 24 * 60 * 60 * 1000);

            plansUnsubscribe = subscribeToPlans(teamId, (plans) => {
              get().setPlans(plans);
              criticalLoadingState.plans = true;
              if (checkCriticalDataLoaded()) {
                set({ isCriticalDataLoaded: true, isAppLoading: false });
              }
            }, sevenDaysAgo, thirtyDaysFromNow);
          }

          if (!tagsUnsubscribe) {
            tagsUnsubscribe = subscribeToTags(teamId, (tags) => {
              get().setTags(tags);
              backgroundLoadingState.tags = true;
              if (checkBackgroundDataLoaded()) {
                set({ isBackgroundDataLoading: false });
              }
            });
          }

          if (!periodsUnsubscribe) {
            periodsUnsubscribe = subscribeToPeriods(teamId, (periods) => {
              get().setPeriods(periods);
              backgroundLoadingState.periods = true;
              if (checkBackgroundDataLoaded()) {
                set({ isBackgroundDataLoading: false });
              }
            });
          }

          if (!templatesUnsubscribe) {
            templatesUnsubscribe = subscribeToTemplates(teamId, (templates) => {
              get().setTemplates(templates);
              backgroundLoadingState.templates = true;
              if (checkBackgroundDataLoaded()) {
                set({ isBackgroundDataLoading: false });
              }
            });
          }

          if (!coachesUnsubscribe) {
            coachesUnsubscribe = subscribeToCoaches(teamId, (coaches) => {
              get().setCoaches(coaches);
              backgroundLoadingState.coaches = true;
              if (checkBackgroundDataLoaded()) {
                set({ isBackgroundDataLoading: false });
              }
            });
          }
        });
      }
    });
  },

  // Restore original user subscriptions after stopping impersonation (web only)
  restoreOriginalUser: () => {
    const { authUser } = get();
    if (!authUser) return;

    // Cleanup impersonated user subscriptions
    cleanupUserSubscription();

    // Clear current data
    get().setUser(null);
    get().setTeam(null);
    get().setPlans([]);
    get().setTags([]);
    get().setPeriods([]);
    get().setTemplates([]);
    get().setCoaches([]);
    get().setFiles([]);
    get().setAnnouncements([]);

    set({
      isAppLoading: true,
      isCriticalDataLoaded: false,
      isBackgroundDataLoading: false,
      isFilesSubscribed: false,
      isAnnouncementsSubscribed: false,
    });

    // Re-subscribe to original user's data
    userUnsubscribe = subscribeToUser(authUser.uid, (user) => {
      get().setUser(user);

      if (!user || !user.teamRef) {
        cleanupTeamSubscription();
        get().setTeam(null);
        set({
          isAppLoading: false,
          isCriticalDataLoaded: true,
        });
        return;
      }

      if (!teamUnsubscribe) {
        teamUnsubscribe = subscribeToTeam(user.teamRef, (team) => {
          get().setTeam(team);

          if (!team || !team.id) {
            cleanupDataSubscriptions();
            set({
              isAppLoading: false,
              isCriticalDataLoaded: true,
            });
            return;
          }

          const teamId = team.id;
          resetDataLoadingState();
          set({ isBackgroundDataLoading: true });

          if (!plansUnsubscribe) {
            const now = Date.now();
            const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
            const thirtyDaysFromNow = now + (30 * 24 * 60 * 60 * 1000);

            plansUnsubscribe = subscribeToPlans(teamId, (plans) => {
              get().setPlans(plans);
              criticalLoadingState.plans = true;
              if (checkCriticalDataLoaded()) {
                set({ isCriticalDataLoaded: true, isAppLoading: false });
              }
            }, sevenDaysAgo, thirtyDaysFromNow);
          }

          if (!tagsUnsubscribe) {
            tagsUnsubscribe = subscribeToTags(teamId, (tags) => {
              get().setTags(tags);
              backgroundLoadingState.tags = true;
              if (checkBackgroundDataLoaded()) {
                set({ isBackgroundDataLoading: false });
              }
            });
          }

          if (!periodsUnsubscribe) {
            periodsUnsubscribe = subscribeToPeriods(teamId, (periods) => {
              get().setPeriods(periods);
              backgroundLoadingState.periods = true;
              if (checkBackgroundDataLoaded()) {
                set({ isBackgroundDataLoading: false });
              }
            });
          }

          if (!templatesUnsubscribe) {
            templatesUnsubscribe = subscribeToTemplates(teamId, (templates) => {
              get().setTemplates(templates);
              backgroundLoadingState.templates = true;
              if (checkBackgroundDataLoaded()) {
                set({ isBackgroundDataLoading: false });
              }
            });
          }

          if (!coachesUnsubscribe) {
            coachesUnsubscribe = subscribeToCoaches(teamId, (coaches) => {
              get().setCoaches(coaches);
              backgroundLoadingState.coaches = true;
              if (checkBackgroundDataLoaded()) {
                set({ isBackgroundDataLoading: false });
              }
            });
          }
        });
      }
    });
  },
});
