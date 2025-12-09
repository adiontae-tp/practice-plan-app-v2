'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { useAppStore } from '@ppa/store';
import {
  useFeatureFlags,
  useHasFeature,
  useCanPerformAction,
  hasFeature,
  type FeatureFlags,
  type SubscriptionTier,
} from '@ppa/subscription';
import { stripeService, type StripeProduct } from '@/services/stripe';
import { revenueCatService } from '@/services/revenueCat';

const TEST_USER_EMAIL = 'adiontae.gerron@gmail.com';

/**
 * Main subscription hook for web
 * - Uses RevenueCat for reading subscription status (supports legacy iOS + Stripe purchases)
 * - Uses Stripe directly for new purchases
 * - Smart manage subscription routing based on subscription source
 */
export function useSubscription() {
  const {
    subscription,
    subscriptionLoading,
    subscriptionError,
    subscriptionFromCache,
    tierOverride,
    subscriptionShowPaywall,
    subscriptionPaywallFeature,
    showPaywall,
    hidePaywall,
    setSubscription,
    setSubscriptionFromCustomerInfo,
    setSubscriptionLoading,
    setSubscriptionError,
    setTierOverride,
    cacheSubscription,
    loadCachedSubscription,
    clearSubscriptionCache,
    authUser,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializingRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  const isTestUser = authUser?.email === TEST_USER_EMAIL;
  const effectiveTier = tierOverride ?? subscription.tier;

  // Initialize RevenueCat and fetch subscription status when user is authenticated
  useEffect(() => {
    const initAndFetchSubscription = async () => {
      const userId = authUser?.uid;
      const userEmail = authUser?.email;

      if (!userId || !userEmail) {
        lastUserIdRef.current = null;
        setIsInitialized(false);
        clearSubscriptionCache();
        return;
      }

      // Skip if already initializing or already initialized for same user
      if (initializingRef.current || lastUserIdRef.current === userId) {
        return;
      }

      initializingRef.current = true;
      setSubscriptionLoading(true);

      // Try to load from cache first for instant UI
      const hasCachedSubscription = loadCachedSubscription(userId);
      if (hasCachedSubscription) {
        console.log('[useSubscription] Using cached subscription while fetching fresh data');
      }

      try {
        // Initialize RevenueCat with user ID
        await revenueCatService.initialize(undefined, userId);

        // Get customer info from RevenueCat (includes both legacy iOS and Stripe purchases)
        const customerInfo = await revenueCatService.getCustomerInfo();
        setSubscriptionFromCustomerInfo(customerInfo);

        // Cache the fresh subscription data
        cacheSubscription(userId);

        lastUserIdRef.current = userId;
        setIsInitialized(true);
        console.log('[useSubscription] RevenueCat initialized and subscription fetched');
      } catch (err) {
        console.error('[useSubscription] Failed to initialize RevenueCat:', err);

        // If we have cached data, don't show error
        if (hasCachedSubscription) {
          console.warn('[useSubscription] Using cached subscription due to fetch failure');
          lastUserIdRef.current = userId;
          setIsInitialized(true);
        } else {
          // Fallback to Stripe-only check
          try {
            const subscriptionInfo = await stripeService.getSubscription(userEmail);
            setSubscription({
              tier: subscriptionInfo.tier,
              isActive: subscriptionInfo.isActive,
              source: subscriptionInfo.isActive ? 'stripe' : 'none',
              store: subscriptionInfo.isActive ? 'stripe' as const : undefined,
              expiresAt: subscriptionInfo.subscription?.currentPeriodEnd
                ? subscriptionInfo.subscription.currentPeriodEnd * 1000
                : null,
              willRenew: subscriptionInfo.subscription
                ? !subscriptionInfo.subscription.cancelAtPeriodEnd
                : false,
            });
            cacheSubscription(userId);
            lastUserIdRef.current = userId;
            setIsInitialized(true);
          } catch (stripeErr) {
            console.error('[useSubscription] Stripe fallback also failed:', stripeErr);
            setSubscriptionError('Failed to fetch subscription status');
          }
        }
      } finally {
        initializingRef.current = false;
        setSubscriptionLoading(false);
      }
    };

    initAndFetchSubscription();
  }, [authUser?.uid, authUser?.email, setSubscription, setSubscriptionFromCustomerInfo, setSubscriptionLoading, setSubscriptionError, cacheSubscription, loadCachedSubscription, clearSubscriptionCache]);

  // Get feature flags for effective tier (override or actual)
  const features = useFeatureFlags(effectiveTier);

  /**
   * Check if a feature is available and show paywall if not
   * Returns true if feature is available, false if blocked
   */
  const checkFeature = useCallback(
    (feature: keyof FeatureFlags): boolean => {
      const value = hasFeature(effectiveTier, feature);
      const allowed = typeof value === 'boolean' ? value : true;

      if (!allowed) {
        showPaywall(feature);
        return false;
      }

      return true;
    },
    [effectiveTier, showPaywall]
  );

  /**
   * Get available products from Stripe
   */
  const getProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const fetchedProducts = await stripeService.getProducts();
      setProducts(fetchedProducts);
      return fetchedProducts;
    } catch (err: any) {
      console.error('[useSubscription] Failed to get products:', err);
      return [];
    } finally {
      setProductsLoading(false);
    }
  }, []);

  /**
   * Purchase a subscription tier via Stripe
   */
  const purchase = useCallback(
    async (tier: 'coach' | 'organization') => {
      const userEmail = authUser?.email;

      setIsLoading(true);
      setError(null);

      try {
        const result = await stripeService.checkout({
          tier,
          userEmail: userEmail || undefined,
          userId: authUser?.uid,
        });

        if (!result.success) {
          setError(result.error || 'Purchase failed');
        }

        return result;
      } catch (err: any) {
        setError(err.message || 'Purchase failed');
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [authUser?.email, authUser?.uid]
  );

  // Get REST API fetch action from store
  const fetchSubscriptionViaApi = useAppStore((state) => state.fetchSubscriptionViaApi);

  /**
   * Refresh subscription status from RevenueCat
   * Tries SDK first, falls back to REST API
   */
  const refreshSubscription = useCallback(async () => {
    const userId = authUser?.uid;
    if (!userId) return;

    setIsLoading(true);
    try {
      if (isInitialized) {
        // Try SDK first
        await revenueCatService.forceReinitialize(userId);
        const customerInfo = await revenueCatService.getCustomerInfo();
        setSubscriptionFromCustomerInfo(customerInfo);
        cacheSubscription(userId);
      } else {
        // SDK not initialized, use REST API directly
        await fetchSubscriptionViaApi(userId);
      }
    } catch (err: any) {
      console.error('[useSubscription] SDK refresh failed, trying REST API:', err);
      // Fallback to REST API
      try {
        await fetchSubscriptionViaApi(userId);
      } catch (apiErr: any) {
        console.error('[useSubscription] REST API refresh also failed:', apiErr);
        setError(apiErr.message || 'Failed to refresh subscription');
      }
    } finally {
      setIsLoading(false);
    }
  }, [authUser?.uid, isInitialized, setSubscriptionFromCustomerInfo, cacheSubscription, fetchSubscriptionViaApi]);

  /**
   * Open the appropriate subscription management portal
   * - Stripe purchases → Stripe Customer Portal
   * - App Store purchases → Link to iOS subscription settings
   */
  const openManagementPortal = useCallback(async () => {
    const userEmail = authUser?.email;
    const store = subscription.store;

    // For App Store purchases, direct users to iOS settings
    if (store === 'app_store') {
      window.open('https://apps.apple.com/account/subscriptions', '_blank');
      return true;
    }

    // For Play Store purchases, direct users to Play Store settings
    if (store === 'play_store') {
      window.open('https://play.google.com/store/account/subscriptions', '_blank');
      return true;
    }

    // For Stripe purchases (or unknown), use Stripe portal
    if (!userEmail) {
      setError('No user email available');
      return false;
    }

    try {
      const result = await stripeService.openPortal({ userEmail });
      if (!result.success) {
        setError(result.error || 'Failed to open portal');
        return false;
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to open portal');
      return false;
    }
  }, [authUser?.email, subscription.store]);

  /**
   * Get the management URL for display purposes
   */
  const getManagementInfo = useCallback(() => {
    const store = subscription.store;

    if (store === 'app_store') {
      return {
        label: 'Manage in App Store',
        description: 'Your subscription was purchased on iOS. Manage it in your Apple ID settings.',
      };
    }

    if (store === 'play_store') {
      return {
        label: 'Manage in Play Store',
        description: 'Your subscription was purchased on Android. Manage it in Google Play.',
      };
    }

    return {
      label: 'Manage Subscription',
      description: 'Cancel, update payment method, or view billing history',
    };
  }, [subscription.store]);

  return {
    // Current subscription state (effective tier considering override)
    tier: effectiveTier,
    actualTier: subscription.tier,
    entitlement: subscription.entitlement,
    isActive: subscription.isActive,
    expiresAt: subscription.expiresAt,
    willRenew: subscription.willRenew,
    source: subscription.source,
    store: subscription.store,

    // Feature flags for effective tier
    features,

    // Loading states
    isLoading: isLoading || subscriptionLoading,
    isInitialized,
    isFromCache: subscriptionFromCache,
    error: error || subscriptionError,

    // Products
    products,
    productsLoading,
    getProducts,

    // Actions
    purchase,
    refreshSubscription,
    openManagementPortal,
    getManagementInfo,

    // Feature gating
    checkFeature,

    // Tier override (test user only)
    isTestUser,
    tierOverride,
    setTierOverride: isTestUser ? setTierOverride : undefined,

    // Paywall UI state
    showPaywall,
    hidePaywall,
    paywallVisible: subscriptionShowPaywall,
    paywallFeature: subscriptionPaywallFeature,
  };
}

/**
 * Hook to check a specific feature
 */
export function useFeature<K extends keyof FeatureFlags>(feature: K): FeatureFlags[K] {
  const { subscription, tierOverride } = useAppStore();
  const effectiveTier = tierOverride ?? subscription.tier;
  return useHasFeature(effectiveTier, feature);
}

/**
 * Hook that returns feature access with upgrade info
 */
export function useFeatureAccess<K extends keyof FeatureFlags>(feature: K) {
  const { subscription, tierOverride } = useAppStore();
  const effectiveTier = tierOverride ?? subscription.tier;
  return useCanPerformAction(effectiveTier, feature);
}
