import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import {
  subscribeToUser,
  subscribeToTeam,
  subscribeToPlans,
  subscribeToTags,
  subscribeToCoaches,
  subscribeToPeriods,
  subscribeToTemplates,
  checkNeedsMigration,
  checkAndMigrateOnAppLoad,
  isAdmin,
  getUserWithTeam,
} from '@ppa/firebase';
import type { User, Team, Plan, Tag, Coach, Period, Template } from '@ppa/interfaces';
import { useAuth } from './AuthContext';
import { useAppStore } from '@ppa/store';
import type { UserWithTeam } from '@ppa/store';
import MigrationLoadingScreen from '@/components/screens/MigrationLoadingScreen';

interface DataContextType {
  // Data
  user: User | null;
  team: Team | null;
  plans: Plan[];
  tags: Tag[];
  coaches: Coach[];
  periods: Period[];
  templates: Template[];

  // Loading states
  isLoading: boolean;
  isCriticalDataLoaded: boolean;
  isBackgroundDataLoading: boolean;
  isUserLoading: boolean;
  isTeamLoading: boolean;
  isPlansLoading: boolean;
  isTagsLoading: boolean;
  isCoachesLoading: boolean;
  isPeriodsLoading: boolean;
  isTemplatesLoading: boolean;

  // Migration state
  isMigrating: boolean;

  // Admin/Impersonation state
  isAdmin: boolean;
  isImpersonating: boolean;
  impersonatedUser: UserWithTeam | null;

  // Error state
  error: string | null;

  // Actions
  refreshData: () => void;
  subscribeTags: () => void;
  subscribeCoaches: () => void;
  subscribePeriods: () => void;
  subscribeTemplates: () => void;

  // Admin actions
  startImpersonation: (targetUser: UserWithTeam) => Promise<void>;
  stopImpersonation: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const { user: authUser } = useAuth();

  // Get store setters to sync Firebase data to Zustand store
  const {
    setUser: setStoreUser,
    setTeam: setStoreTeam,
    setPlans: setStorePlans,
    setTags: setStoreTags,
    setCoaches: setStoreCoaches,
    setPeriods: setStorePeriods,
    setTemplates: setStoreTemplates,
    // Admin state
    adminIsImpersonating,
    adminImpersonatedUser,
    adminOriginalUser,
    startImpersonation: storeStartImpersonation,
    stopImpersonation: storeStopImpersonation,
    setAdminOriginalUser,
  } = useAppStore();

  // Check if current user is admin
  const currentUserIsAdmin = isAdmin(authUser?.email);

  // Data state
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  // Loading states
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [isTeamLoading, setIsTeamLoading] = useState(false);
  const [isPlansLoading, setIsPlansLoading] = useState(false);
  const [isTagsLoading, setIsTagsLoading] = useState(false);
  const [isCoachesLoading, setIsCoachesLoading] = useState(false);
  const [isPeriodsLoading, setIsPeriodsLoading] = useState(false);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);

  // Progressive loading states
  const [isCriticalDataLoaded, setIsCriticalDataLoaded] = useState(false);
  const [isBackgroundDataLoading, setIsBackgroundDataLoading] = useState(false);

  // Lazy subscription flags
  const [isTagsSubscribed, setIsTagsSubscribed] = useState(false);
  const [isCoachesSubscribed, setIsCoachesSubscribed] = useState(false);
  const [isPeriodsSubscribed, setIsPeriodsSubscribed] = useState(false);
  const [isTemplatesSubscribed, setIsTemplatesSubscribed] = useState(false);

  // Migration state
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationChecked, setMigrationChecked] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Store unsubscribe functions using ref to avoid dependency issues
  const unsubscribersRef = useRef<Array<() => void>>([]);
  const teamSubscriptionsRef = useRef<Array<() => void>>([]);
  const currentTeamIdRef = useRef<string | null>(null);

  // Track subscription state with refs to avoid dependency issues
  const tagsSubscribedRef = useRef(false);
  const coachesSubscribedRef = useRef(false);
  const periodsSubscribedRef = useRef(false);
  const templatesSubscribedRef = useRef(false);

  // Cleanup function - clears both local state and store
  const cleanup = useCallback(() => {
    // Unsubscribe from all subscriptions
    unsubscribersRef.current.forEach((unsub) => {
      try {
        unsub();
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    });
    teamSubscriptionsRef.current.forEach((unsub) => {
      try {
        unsub();
      } catch (error) {
        console.error('Error unsubscribing from team subscriptions:', error);
      }
    });
    unsubscribersRef.current = [];
    teamSubscriptionsRef.current = [];
    currentTeamIdRef.current = null;
    
    // Clear local state
    setUser(null);
    setTeam(null);
    setPlans([]);
    setTags([]);
    setCoaches([]);
    setPeriods([]);
    setTemplates([]);
    
    // Reset loading states
    setIsUserLoading(false);
    setIsTeamLoading(false);
    setIsPlansLoading(false);
    setIsTagsLoading(false);
    setIsCoachesLoading(false);
    setIsPeriodsLoading(false);
    setIsTemplatesLoading(false);
    setIsCriticalDataLoaded(false);
    setIsBackgroundDataLoading(false);

    // Reset subscription flags (both state and refs)
    setIsTagsSubscribed(false);
    setIsCoachesSubscribed(false);
    setIsPeriodsSubscribed(false);
    setIsTemplatesSubscribed(false);
    tagsSubscribedRef.current = false;
    coachesSubscribedRef.current = false;
    periodsSubscribedRef.current = false;
    templatesSubscribedRef.current = false;
    
    // Clear store state
    setStoreUser(null);
    setStoreTeam(null);
    setStorePlans([]);
    setStoreTags([]);
    setStoreCoaches([]);
    setStorePeriods([]);
    setStoreTemplates([]);
  }, [setStoreUser, setStoreTeam, setStorePlans, setStoreTags, setStoreCoaches, setStorePeriods, setStoreTemplates]);

  // Check for pending data migration on app load - only for legacy users who haven't been migrated
  useEffect(() => {
    if (!authUser?.uid || !authUser?.email || migrationChecked) {
      return;
    }

    const checkMigration = async () => {
      // Check if this is a legacy user (created before migration cutoff)
      // New users don't need migration check
      const userCreatedAt = (authUser as any).metadata?.creationTime;
      const migrationCutoffDate = new Date('2024-01-01').getTime();
      const isLegacyUser = !userCreatedAt || new Date(userCreatedAt).getTime() < migrationCutoffDate;

      if (!isLegacyUser) {
        setMigrationChecked(true);
        return;
      }

      // First check if migration is actually needed (user might already be migrated)
      // This prevents showing the migration loading screen for already-migrated users
      try {
        const migrationStatus = await checkNeedsMigration(authUser.uid, authUser.email || '');
        if (!migrationStatus.needsMigration) {
          // User is already migrated, skip showing migration screen
          setMigrationChecked(true);
          return;
        }
      } catch (error) {
        // If check fails, continue with migration attempt
        console.warn('Migration status check failed, proceeding with migration:', error);
      }

      // Only show migration loading screen if migration is actually needed
      setIsMigrating(true);
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Migration check timeout')), 3000);
        });

        const result = await Promise.race([
          checkAndMigrateOnAppLoad(authUser.uid, authUser.email || ''),
          timeoutPromise,
        ]) as any;

        if (result?.success) {
          console.log('Data migration completed on app load:', result);
        }
      } catch (error) {
        console.error('Migration check failed:', error);
      } finally {
        setIsMigrating(false);
        setMigrationChecked(true);
      }
    };

    checkMigration();
  }, [authUser?.uid, authUser?.email, migrationChecked]);

  // Lazy subscription functions for Tier 2 data
  const subscribeTagsData = useCallback(() => {
    if (tagsSubscribedRef.current || !currentTeamIdRef.current) return;
    tagsSubscribedRef.current = true;
    setIsTagsSubscribed(true);
    setIsTagsLoading(true);
    try {
      const unsub = subscribeToTags(currentTeamIdRef.current, (tagsData) => {
        setTags(tagsData);
        setStoreTags(tagsData);
        setIsTagsLoading(false);
      });
      teamSubscriptionsRef.current.push(unsub);
    } catch (error) {
      console.error('Error subscribing to tags:', error);
      setIsTagsLoading(false);
    }
  }, [setStoreTags]);

  const subscribeCoachesData = useCallback(() => {
    if (coachesSubscribedRef.current || !currentTeamIdRef.current) return;
    coachesSubscribedRef.current = true;
    setIsCoachesSubscribed(true);
    setIsCoachesLoading(true);
    try {
      const unsub = subscribeToCoaches(currentTeamIdRef.current, (coachesData) => {
        setCoaches(coachesData);
        setStoreCoaches(coachesData);
        setIsCoachesLoading(false);
      });
      teamSubscriptionsRef.current.push(unsub);
    } catch (error) {
      console.error('Error subscribing to coaches:', error);
      setIsCoachesLoading(false);
    }
  }, [setStoreCoaches]);

  const subscribePeriodsData = useCallback(() => {
    if (periodsSubscribedRef.current || !currentTeamIdRef.current) return;
    periodsSubscribedRef.current = true;
    setIsPeriodsSubscribed(true);
    setIsPeriodsLoading(true);
    try {
      const unsub = subscribeToPeriods(currentTeamIdRef.current, (periodsData) => {
        setPeriods(periodsData);
        setStorePeriods(periodsData);
        setIsPeriodsLoading(false);
      });
      teamSubscriptionsRef.current.push(unsub);
    } catch (error) {
      console.error('Error subscribing to periods:', error);
      setIsPeriodsLoading(false);
    }
  }, [setStorePeriods]);

  const subscribeTemplatesData = useCallback(() => {
    if (templatesSubscribedRef.current || !currentTeamIdRef.current) return;
    templatesSubscribedRef.current = true;
    setIsTemplatesSubscribed(true);
    setIsTemplatesLoading(true);
    try {
      const unsub = subscribeToTemplates(currentTeamIdRef.current, (templatesData) => {
        setTemplates(templatesData);
        setStoreTemplates(templatesData);
        setIsTemplatesLoading(false);
      });
      teamSubscriptionsRef.current.push(unsub);
    } catch (error) {
      console.error('Error subscribing to templates:', error);
      setIsTemplatesLoading(false);
    }
  }, [setStoreTemplates]);

  // Track the last auth user ID we processed
  const lastAuthUserIdRef = useRef<string | null>(null);

  // Subscribe to user data when auth user changes or impersonation changes
  useEffect(() => {
    const currentAuthUserId = authUser?.uid || null;

    // Determine which user ID to load data for
    // If impersonating, use the impersonated user's UID
    const effectiveUserId = adminIsImpersonating && adminImpersonatedUser?.uid
      ? adminImpersonatedUser.uid
      : currentAuthUserId;

    if (!effectiveUserId) {
      if (lastAuthUserIdRef.current !== null) {
        // User just logged out
        cleanup();
        setMigrationChecked(false);
        lastAuthUserIdRef.current = null;
      }
      return;
    }

    // Skip migration check when impersonating
    if (!adminIsImpersonating && !migrationChecked) {
      const timeout = setTimeout(() => {
        if (!migrationChecked) {
          console.warn('Migration check timeout, proceeding with data loading');
          setMigrationChecked(true);
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }

    // Skip if we already set up subscriptions for this user (unless impersonation changed)
    if (lastAuthUserIdRef.current === effectiveUserId) {
      return;
    }

    // Cleanup previous subscriptions before setting up new ones
    cleanup();
    lastAuthUserIdRef.current = effectiveUserId;

    const newUnsubscribers: Array<() => void> = [];
    
    setIsUserLoading(true);
    setError(null);

    const handleSubscriptionError = (error: any, subscriptionName: string) => {
      console.error(`Error in ${subscriptionName} subscription:`, error);
      const errorMessage = error?.message || `Failed to load ${subscriptionName}`;
      setError(errorMessage);
    };

    try {
      const unsubUser = subscribeToUser(effectiveUserId, (userData) => {
        setUser(userData);
        setStoreUser(userData);
        setIsUserLoading(false);
        setError(null);

        teamSubscriptionsRef.current.forEach((unsub) => {
          try { unsub(); } catch (e) { console.error('Error cleaning up team subscriptions:', e); }
        });
        teamSubscriptionsRef.current = [];
        currentTeamIdRef.current = null;

        if (userData?.teamRef) {
          setIsTeamLoading(true);

          try {
            const unsubTeam = subscribeToTeam(userData.teamRef, (teamData) => {
              setTeam(teamData);
              setStoreTeam(teamData);
              setIsTeamLoading(false);
              setError(null);

              if (teamData?.id) {
                const teamId = teamData.id;
                currentTeamIdRef.current = teamId;

                // TIER 1: Critical data - Plans with date filter
                setIsPlansLoading(true);
                try {
                  const now = Date.now();
                  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
                  const thirtyDaysFromNow = now + (30 * 24 * 60 * 60 * 1000);
                  
                  const unsubPlans = subscribeToPlans(teamId, (plansData) => {
                    setPlans(plansData);
                    setStorePlans(plansData);
                    setIsPlansLoading(false);
                    setIsCriticalDataLoaded(true);
                  }, sevenDaysAgo, thirtyDaysFromNow);
                  teamSubscriptionsRef.current.push(unsubPlans);
                } catch (error) {
                  handleSubscriptionError(error, 'plans');
                  setIsPlansLoading(false);
                  setIsCriticalDataLoaded(true);
                }

                // TIER 2: Background data - start loading but don't block UI
                setIsBackgroundDataLoading(true);
                
                // Subscribe to all Tier 2 data immediately but in background
                subscribeTagsData();
                subscribeCoachesData();
                subscribePeriodsData();
                subscribeTemplatesData();

              } else {
                setIsPlansLoading(false);
                setIsCriticalDataLoaded(true);
                setPlans([]);
                setTags([]);
                setCoaches([]);
                setPeriods([]);
                setTemplates([]);
              }
            });
            newUnsubscribers.push(unsubTeam);
          } catch (error) {
            handleSubscriptionError(error, 'team');
            setIsTeamLoading(false);
            setIsCriticalDataLoaded(true);
          }
        } else {
          setIsTeamLoading(false);
          setIsCriticalDataLoaded(true);
          setTeam(null);
          setStoreTeam(null);
        }
      });
      newUnsubscribers.push(unsubUser);
    } catch (error) {
      handleSubscriptionError(error, 'user');
      setIsUserLoading(false);
    }

    unsubscribersRef.current = newUnsubscribers;

    return () => {
      newUnsubscribers.forEach((unsub) => {
        try { unsub(); } catch (e) { console.error('Error unsubscribing:', e); }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.uid, migrationChecked, adminIsImpersonating, adminImpersonatedUser?.uid]);

  // Track when background data finishes loading
  useEffect(() => {
    if (isBackgroundDataLoading && !isTagsLoading && !isCoachesLoading && !isPeriodsLoading && !isTemplatesLoading) {
      setIsBackgroundDataLoading(false);
    }
  }, [isBackgroundDataLoading, isTagsLoading, isCoachesLoading, isPeriodsLoading, isTemplatesLoading]);

  // Computed loading state - only critical data for initial load
  const isLoading = isMigrating || isUserLoading || isTeamLoading || isPlansLoading;

  // Refresh function (re-triggers subscriptions)
  const refreshData = useCallback(() => {
    // Subscriptions are real-time, so this just clears errors
    setError(null);
  }, []);

  // Start impersonation - switch to viewing as another user
  const startImpersonation = useCallback(async (targetUser: UserWithTeam) => {
    if (!currentUserIsAdmin) {
      console.error('Only admins can impersonate users');
      return;
    }

    // Store the original user before switching
    if (user && !adminOriginalUser) {
      setAdminOriginalUser(user);
    }

    // Clean up current subscriptions
    cleanup();

    // Set up impersonation in store
    storeStartImpersonation(targetUser, user!);

    // Re-trigger data loading with impersonated user's UID
    // The useEffect below will handle resubscribing with the new UID
    lastAuthUserIdRef.current = null; // Force re-subscription
  }, [currentUserIsAdmin, user, adminOriginalUser, setAdminOriginalUser, storeStartImpersonation, cleanup]);

  // Stop impersonation - return to original user
  const stopImpersonation = useCallback(() => {
    if (!adminIsImpersonating) return;

    // Clean up impersonated user subscriptions
    cleanup();

    // Clear impersonation state in store
    storeStopImpersonation();

    // Re-trigger data loading with original user's UID
    lastAuthUserIdRef.current = null; // Force re-subscription
  }, [adminIsImpersonating, storeStopImpersonation, cleanup]);

  const value: DataContextType = {
    user,
    team,
    plans,
    tags,
    coaches,
    periods,
    templates,
    isLoading,
    isCriticalDataLoaded,
    isBackgroundDataLoading,
    isUserLoading,
    isTeamLoading,
    isPlansLoading,
    isTagsLoading,
    isCoachesLoading,
    isPeriodsLoading,
    isTemplatesLoading,
    isMigrating,
    // Admin/Impersonation
    isAdmin: currentUserIsAdmin,
    isImpersonating: adminIsImpersonating,
    impersonatedUser: adminImpersonatedUser,
    error,
    refreshData,
    subscribeTags: subscribeTagsData,
    subscribeCoaches: subscribeCoachesData,
    subscribePeriods: subscribePeriodsData,
    subscribeTemplates: subscribeTemplatesData,
    // Admin actions
    startImpersonation,
    stopImpersonation,
  };

  // Show migration loading screen while migrating data
  if (isMigrating) {
    return (
      <DataContext.Provider value={value}>
        <MigrationLoadingScreen />
      </DataContext.Provider>
    );
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
