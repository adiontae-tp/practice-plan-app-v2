import { StateCreator } from 'zustand';
import {
  type SubscriptionTier,
  type EntitlementLevel,
  type SubscriptionSource,
  type SubscriptionState,
  type CustomerInfo,
  type PackageOffering,
  type CachedSubscriptionState,
  entitlementToTier,
  ENTITLEMENT_IDS,
  getSubscriptionSource,
  SUBSCRIPTION_CACHE_KEY,
  isCacheValid,
  fetchCustomerInfo,
  RevenueCatApiError,
} from '@ppa/subscription';

export interface SubscriptionSlice {
  // Subscription state
  subscription: SubscriptionState;
  subscriptionLoading: boolean;
  subscriptionError: string | null;
  /** Whether the current subscription state was loaded from cache */
  subscriptionFromCache: boolean;

  // Tier override for testing (only for specific test users)
  tierOverride: SubscriptionTier | null;

  // Offerings (available packages for purchase)
  offerings: PackageOffering[];
  offeringsLoading: boolean;

  // UI state
  subscriptionShowPaywall: boolean;
  subscriptionPaywallFeature: string | null;

  // Actions
  setSubscription: (state: Partial<SubscriptionState>) => void;
  setSubscriptionFromCustomerInfo: (customerInfo: CustomerInfo) => void;
  setSubscriptionLoading: (loading: boolean) => void;
  setSubscriptionError: (error: string | null) => void;
  setTierOverride: (tier: SubscriptionTier | null) => void;
  setOfferings: (offerings: PackageOffering[]) => void;
  setOfferingsLoading: (loading: boolean) => void;
  showPaywall: (feature?: string) => void;
  hidePaywall: () => void;
  resetSubscription: () => void;

  // Cache actions
  /** Save subscription state to cache for offline use */
  cacheSubscription: (userId: string) => void;
  /** Load subscription state from cache (returns true if cache was used) */
  loadCachedSubscription: (userId: string) => boolean;
  /** Clear the subscription cache */
  clearSubscriptionCache: () => void;

  // REST API actions (fallback when SDK isn't available)
  /** Fetch subscription status via RevenueCat REST API */
  fetchSubscriptionViaApi: (userId: string) => Promise<void>;

  /**
   * Refresh subscription if stale (cheap check for every page)
   * Uses stale-while-revalidate pattern:
   * - Returns immediately with cached data
   * - Refreshes in background if cache is older than maxAge
   * @param userId - User ID to check
   * @param maxAgeMs - Max cache age in ms before refresh (default: 5 minutes)
   * @returns true if refresh was triggered, false if cache is fresh
   */
  refreshSubscriptionIfStale: (userId: string, maxAgeMs?: number) => boolean;
}

const defaultSubscriptionState: SubscriptionState = {
  tier: 'free',
  entitlement: 0,
  source: 'none',
  isActive: false,
  expiresAt: null,
  willRenew: false,
  lastVerified: 0,
};

const initialState = {
  subscription: defaultSubscriptionState,
  subscriptionLoading: false,
  subscriptionError: null,
  subscriptionFromCache: false,
  tierOverride: null as SubscriptionTier | null,
  offerings: [],
  offeringsLoading: false,
  subscriptionShowPaywall: false,
  subscriptionPaywallFeature: null,
};

/**
 * Get storage implementation (works in both web and React Native)
 */
function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

/**
 * Save subscription cache to storage
 */
function saveCache(cache: CachedSubscriptionState): void {
  try {
    const storage = getStorage();
    if (storage) {
      storage.setItem(SUBSCRIPTION_CACHE_KEY, JSON.stringify(cache));
    }
  } catch (error) {
    console.warn('[SubscriptionSlice] Failed to save cache:', error);
  }
}

/**
 * Load subscription cache from storage
 */
function loadCache(): CachedSubscriptionState | null {
  try {
    const storage = getStorage();
    if (storage) {
      const cached = storage.getItem(SUBSCRIPTION_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    }
  } catch (error) {
    console.warn('[SubscriptionSlice] Failed to load cache:', error);
  }
  return null;
}

/**
 * Clear subscription cache from storage
 */
function clearCache(): void {
  try {
    const storage = getStorage();
    if (storage) {
      storage.removeItem(SUBSCRIPTION_CACHE_KEY);
    }
  } catch (error) {
    console.warn('[SubscriptionSlice] Failed to clear cache:', error);
  }
}

/**
 * Parse CustomerInfo from RevenueCat and determine subscription tier
 * Also detects the subscription source (App Store vs Stripe) for manage subscription routing
 */
function parseCustomerInfo(customerInfo: CustomerInfo): Partial<SubscriptionState> {
  const { entitlements, activeSubscriptions } = customerInfo;
  const activeEntitlements = entitlements.active;

  // Determine the subscription source from active subscriptions
  const source = getSubscriptionSource(activeSubscriptions);

  // Determine the store for manage subscription routing
  let store: 'app_store' | 'play_store' | 'stripe' | undefined;
  if (source === 'app_store') {
    store = 'app_store';
  } else if (source === 'stripe') {
    store = 'stripe';
  }

  // Check for organization entitlement first (higher tier)
  const orgEntitlement = activeEntitlements[ENTITLEMENT_IDS.ORGANIZATION];
  if (orgEntitlement?.isActive) {
    return {
      tier: 'organization',
      entitlement: 2,
      source,
      store,
      isActive: true,
      expiresAt: orgEntitlement.expirationDate
        ? new Date(orgEntitlement.expirationDate).getTime()
        : null,
      willRenew: orgEntitlement.willRenew,
      lastVerified: Date.now(),
    };
  }

  // Check for coach entitlement
  const coachEntitlement = activeEntitlements[ENTITLEMENT_IDS.HEAD_COACH];
  if (coachEntitlement?.isActive) {
    return {
      tier: 'coach',
      entitlement: 1,
      source,
      store,
      isActive: true,
      expiresAt: coachEntitlement.expirationDate
        ? new Date(coachEntitlement.expirationDate).getTime()
        : null,
      willRenew: coachEntitlement.willRenew,
      lastVerified: Date.now(),
    };
  }

  // No active entitlements = free tier
  return {
    tier: 'free',
    entitlement: 0,
    source: 'none',
    store: undefined,
    isActive: false,
    expiresAt: null,
    willRenew: false,
    lastVerified: Date.now(),
  };
}

export const createSubscriptionSlice: StateCreator<SubscriptionSlice> = (set, get) => ({
  ...initialState,

  setSubscription: (state) =>
    set((prev) => ({
      subscription: { ...prev.subscription, ...state },
      subscriptionFromCache: false,
    })),

  setSubscriptionFromCustomerInfo: (customerInfo) => {
    const parsed = parseCustomerInfo(customerInfo);
    set((prev) => ({
      subscription: { ...prev.subscription, ...parsed },
      subscriptionError: null,
      subscriptionFromCache: false,
    }));
  },

  setSubscriptionLoading: (loading) =>
    set({ subscriptionLoading: loading }),

  setSubscriptionError: (error) =>
    set({ subscriptionError: error, subscriptionLoading: false }),

  setTierOverride: (tier) =>
    set({ tierOverride: tier }),

  setOfferings: (offerings) =>
    set({ offerings, offeringsLoading: false }),

  setOfferingsLoading: (loading) =>
    set({ offeringsLoading: loading }),

  showPaywall: (feature) =>
    set({
      subscriptionShowPaywall: true,
      subscriptionPaywallFeature: feature ?? null,
    }),

  hidePaywall: () =>
    set({
      subscriptionShowPaywall: false,
      subscriptionPaywallFeature: null,
    }),

  resetSubscription: () => set(initialState),

  cacheSubscription: (userId) => {
    const { subscription } = get();
    // Only cache if we have an active subscription or verified state
    if (subscription.lastVerified > 0) {
      saveCache({
        state: subscription,
        userId,
        cachedAt: Date.now(),
      });
      console.log('[SubscriptionSlice] Subscription cached for offline use');
    }
  },

  loadCachedSubscription: (userId) => {
    const cached = loadCache();
    if (isCacheValid(cached, userId)) {
      set({
        subscription: cached!.state,
        subscriptionFromCache: true,
      });
      console.log('[SubscriptionSlice] Loaded subscription from cache');
      return true;
    }
    return false;
  },

  clearSubscriptionCache: () => {
    clearCache();
    console.log('[SubscriptionSlice] Subscription cache cleared');
  },

  fetchSubscriptionViaApi: async (userId: string) => {
    if (!userId) {
      console.warn('[SubscriptionSlice] Cannot fetch subscription: no user ID');
      return;
    }

    set({ subscriptionLoading: true, subscriptionError: null });

    try {
      console.log('[SubscriptionSlice] Fetching subscription via REST API...');
      const customerInfo = await fetchCustomerInfo(userId);
      const parsed = parseCustomerInfo(customerInfo);

      set((prev) => ({
        subscription: { ...prev.subscription, ...parsed },
        subscriptionLoading: false,
        subscriptionError: null,
        subscriptionFromCache: false,
      }));

      // Cache the result for offline use
      get().cacheSubscription(userId);
      console.log('[SubscriptionSlice] Subscription fetched via REST API:', parsed.tier);
    } catch (error) {
      let errorMessage = 'Failed to fetch subscription';

      if (error instanceof RevenueCatApiError) {
        errorMessage = error.message;
        console.error('[SubscriptionSlice] REST API error:', error.statusCode, error.message);
      } else if (error instanceof Error) {
        errorMessage = error.message;
        console.error('[SubscriptionSlice] Error fetching subscription:', error);
      }

      set({
        subscriptionLoading: false,
        subscriptionError: errorMessage,
      });

      // Try to load from cache on error
      if (get().loadCachedSubscription(userId)) {
        console.log('[SubscriptionSlice] Loaded cached subscription after API error');
      }
    }
  },

  refreshSubscriptionIfStale: (userId: string, maxAgeMs: number = 5 * 60 * 1000) => {
    if (!userId) return false;

    const { subscription, subscriptionLoading } = get();

    // Don't refresh if already loading
    if (subscriptionLoading) {
      return false;
    }

    // Check if subscription was verified recently
    const timeSinceLastVerified = Date.now() - subscription.lastVerified;
    const isStale = timeSinceLastVerified > maxAgeMs;

    if (!isStale) {
      // Cache is fresh, no refresh needed
      return false;
    }

    // Stale - trigger background refresh (non-blocking)
    console.log('[SubscriptionSlice] Subscription stale, refreshing in background...');

    // Fire and forget - don't await
    get().fetchSubscriptionViaApi(userId).catch((err) => {
      console.warn('[SubscriptionSlice] Background refresh failed:', err);
    });

    return true;
  },
});
