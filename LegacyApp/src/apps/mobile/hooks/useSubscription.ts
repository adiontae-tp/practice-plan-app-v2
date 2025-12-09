import { useCallback } from 'react';
import { Linking, Platform, Alert } from 'react-native';
import { useAppStore } from '@ppa/store';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  useFeatureFlags,
  useHasFeature,
  useCanPerformAction,
  hasFeature,
  type FeatureFlags,
} from '@ppa/subscription';
import { stripeService, type StripeProduct } from '@/services/stripe';

/**
 * Main subscription hook for mobile
 *
 * Architecture:
 * - RevenueCat: Used for READING subscription status (supports legacy iOS + Stripe purchases)
 * - Stripe: Used for ALL NEW purchases (redirects to Stripe checkout in browser)
 * - Manage Subscription: Smart routing based on subscription source
 *   - Legacy iOS purchases → Apple subscription settings
 *   - Stripe purchases → Stripe customer portal
 */
export function useSubscription() {
  const context = useSubscriptionContext();
  // Use AuthContext for user info on mobile (not store's authUser)
  const { user: authUser } = useAuth();
  const {
    subscription,
    subscriptionLoading,
    subscriptionError,
    offerings,
    offeringsLoading,
    subscriptionShowPaywall,
    subscriptionPaywallFeature,
    showPaywall,
    hidePaywall,
  } = useAppStore();

  // Get feature flags for current tier
  const features = useFeatureFlags(subscription.tier);

  /**
   * Check if a feature is available and show paywall if not
   * Returns true if feature is available, false if blocked
   */
  const checkFeature = useCallback(
    (feature: keyof FeatureFlags): boolean => {
      const value = hasFeature(subscription.tier, feature);
      const allowed = typeof value === 'boolean' ? value : true;

      if (!allowed) {
        showPaywall(feature);
        return false;
      }

      return true;
    },
    [subscription.tier, showPaywall]
  );

  /**
   * Purchase via Stripe (opens in browser)
   * This is the NEW default for all purchases
   */
  const purchaseViaStripe = useCallback(
    async (tier: 'coach' | 'organization') => {
      const userEmail = authUser?.email;
      const userId = authUser?.uid;

      if (!userEmail) {
        return { success: false, error: 'No user email available' };
      }

      try {
        const result = await stripeService.checkout({
          tier,
          userEmail,
          userId,
        });

        if (result.success) {
          // User was redirected to Stripe checkout
          // They'll return via deep link when done
          return { success: true };
        } else {
          return { success: false, error: result.error };
        }
      } catch (err: any) {
        console.error('[useSubscription] Stripe purchase failed:', err);
        return { success: false, error: err.message || 'Purchase failed' };
      }
    },
    [authUser?.email, authUser?.uid]
  );

  /**
   * Purchase the Coach subscription via Stripe
   */
  const purchaseCoach = useCallback(async () => {
    return purchaseViaStripe('coach');
  }, [purchaseViaStripe]);

  /**
   * Purchase the Organization subscription via Stripe
   */
  const purchaseOrganization = useCallback(async () => {
    return purchaseViaStripe('organization');
  }, [purchaseViaStripe]);

  /**
   * Open the appropriate subscription management
   * - Legacy iOS purchases → Apple subscription settings
   * - Stripe purchases → Stripe customer portal
   */
  const openManagementPortal = useCallback(async () => {
    const store = subscription.store;
    const userEmail = authUser?.email;

    // For App Store purchases, direct users to iOS settings
    if (store === 'app_store') {
      if (Platform.OS === 'ios') {
        Linking.openURL('https://apps.apple.com/account/subscriptions');
      } else {
        // If they're on Android but have an App Store subscription, show message
        Alert.alert(
          'App Store Subscription',
          'Your subscription was purchased on iOS. Please manage it from an iOS device or at https://apps.apple.com/account/subscriptions'
        );
      }
      return true;
    }

    // For Play Store purchases, direct users to Play Store settings
    if (store === 'play_store') {
      if (Platform.OS === 'android') {
        Linking.openURL('https://play.google.com/store/account/subscriptions');
      } else {
        Alert.alert(
          'Play Store Subscription',
          'Your subscription was purchased on Android. Please manage it from an Android device or at https://play.google.com/store/account/subscriptions'
        );
      }
      return true;
    }

    // For Stripe purchases (or unknown), use Stripe portal
    if (!userEmail) {
      Alert.alert('Error', 'No user email available');
      return false;
    }

    try {
      const result = await stripeService.openPortal({ userEmail });
      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to open subscription management');
        return false;
      }
      return true;
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to open subscription management');
      return false;
    }
  }, [subscription.store, authUser?.email]);

  /**
   * Get the management info for display purposes
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

  /**
   * Get Stripe products for display (pricing, etc.)
   */
  const getStripeProducts = useCallback(async (): Promise<StripeProduct[]> => {
    try {
      return await stripeService.getProducts();
    } catch (err) {
      console.error('[useSubscription] Failed to get Stripe products:', err);
      return [];
    }
  }, []);

  return {
    // Current subscription state
    tier: subscription.tier,
    entitlement: subscription.entitlement,
    isActive: subscription.isActive,
    expiresAt: subscription.expiresAt,
    willRenew: subscription.willRenew,
    source: subscription.source,
    store: subscription.store,

    // Feature flags for current tier
    features,

    // Loading states
    isLoading: context.isLoading || subscriptionLoading,
    isInitialized: context.isInitialized,
    initializationFailed: context.initializationFailed,
    error: context.error || subscriptionError,

    // Error handling
    retryInitialization: context.retryInitialization,
    clearError: context.clearError,

    // RevenueCat offerings (for reference, but prefer Stripe products for pricing)
    offerings,
    offeringsLoading,
    getOfferings: context.getOfferings,

    // Stripe products for pricing display
    getStripeProducts,

    // Purchase actions (all go through Stripe now)
    purchase: purchaseViaStripe,
    purchaseCoach,
    purchaseOrganization,

    // Legacy RevenueCat purchase (only for restore)
    purchaseLegacy: context.purchase,

    // Restore purchases (RevenueCat - for legacy iOS purchases)
    restore: context.restore,
    refreshCustomerInfo: context.refreshCustomerInfo,

    // Management
    openManagementPortal,
    getManagementInfo,

    // Feature gating
    checkFeature,

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
  const { subscription } = useAppStore();
  return useHasFeature(subscription.tier, feature);
}

/**
 * Hook that returns feature access with upgrade info
 */
export function useFeatureAccess<K extends keyof FeatureFlags>(feature: K) {
  const { subscription } = useAppStore();
  return useCanPerformAction(subscription.tier, feature);
}

// Re-export for convenience
export { useSubscriptionContext } from '@/contexts/SubscriptionContext';
