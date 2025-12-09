import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react';
import { useAppStore } from '@ppa/store';
import { revenueCatService } from '@/services/revenueCat';
import type { CustomerInfo, PackageOffering, PurchaseResult } from '@ppa/subscription/src/service';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';

interface SubscriptionContextType {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  /** True if initialization failed and subscriptions are unavailable */
  initializationFailed: boolean;

  // Actions
  purchase: (packageId: string) => Promise<PurchaseResult>;
  restore: () => Promise<void>;
  refreshCustomerInfo: () => Promise<void>;
  getOfferings: () => Promise<PackageOffering[]>;
  presentPaywall: (offering?: string) => Promise<PurchaseResult>;
  presentPaywallIfNeeded: (entitlementId?: string) => Promise<PurchaseResult>;
  /** Retry initialization after a failure */
  retryInitialization: () => Promise<void>;
  /** Clear the error state */
  clearError: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  return context;
}

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { user } = useAuth();
  const { isCriticalDataLoaded } = useData();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializationFailed, setInitializationFailed] = useState(false);
  const initAttemptedRef = useRef(false);

  // Store actions
  const {
    setSubscriptionFromCustomerInfo,
    setSubscriptionLoading,
    setSubscriptionError,
    setOfferings,
    setOfferingsLoading,
    resetSubscription,
    cacheSubscription,
    loadCachedSubscription,
    clearSubscriptionCache,
  } = useAppStore();

  // Initialize RevenueCat
  const initRevenueCat = useCallback(async () => {
    try {
      setIsLoading(true);
      setSubscriptionLoading(true);
      setInitializationFailed(false);

      const apiKey = __DEV__
        ? process.env.EXPO_PUBLIC_REVENUECAT_TEST_STORE_KEY
        : process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;

      if (!apiKey) {
        console.warn('[Subscription] No RevenueCat API key found');
        setIsInitialized(true);
        setIsLoading(false);
        setSubscriptionLoading(false);
        return;
      }

      await revenueCatService.initialize(apiKey);
      setIsInitialized(true);
      setError(null);
      setInitializationFailed(false);

      console.log('[Subscription] RevenueCat initialized successfully');
    } catch (err: any) {
      console.error('[Subscription] Failed to initialize RevenueCat:', err);
      const errorMessage = err.message || 'Failed to initialize subscriptions';
      setError(errorMessage);
      setSubscriptionError(errorMessage);
      setInitializationFailed(true);
    } finally {
      setIsLoading(false);
      setSubscriptionLoading(false);
    }
  }, [setSubscriptionLoading, setSubscriptionError]);

  // Initialize RevenueCat after critical data is loaded (deferred initialization)
  useEffect(() => {
    if (!isCriticalDataLoaded || initAttemptedRef.current) return;
    initAttemptedRef.current = true;
    initRevenueCat();
  }, [isCriticalDataLoaded, initRevenueCat]);

  // Retry initialization after a failure
  const retryInitialization = useCallback(async () => {
    initAttemptedRef.current = false;
    setError(null);
    setInitializationFailed(false);
    await initRevenueCat();
  }, [initRevenueCat]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Track the last user ID we processed to avoid duplicate calls
  const lastProcessedUserIdRef = useRef<string | null>(null);

  // Handle user auth state changes
  useEffect(() => {
    if (!isInitialized) return;

    const currentUserId = user?.uid || null;

    // Skip if we already processed this user (prevents duplicate calls)
    if (currentUserId === lastProcessedUserIdRef.current) {
      return;
    }

    const handleAuthChange = async () => {
      try {
        setIsLoading(true);
        setSubscriptionLoading(true);

        if (currentUserId) {
          // User logged in - first try to load from cache for instant UI
          const hasCachedSubscription = loadCachedSubscription(currentUserId);
          if (hasCachedSubscription) {
            console.log('[Subscription] Using cached subscription while fetching fresh data');
          }

          // Then fetch fresh data from RevenueCat
          console.log('[Subscription] User logged in, identifying with RevenueCat:', currentUserId);
          try {
            const customerInfo = await revenueCatService.login(currentUserId);
            setSubscriptionFromCustomerInfo(customerInfo);
            // Cache the fresh subscription data
            cacheSubscription(currentUserId);
            console.log('[Subscription] Customer info updated and cached');
          } catch (fetchErr: any) {
            // If fetch fails but we have cache, continue with cached data
            if (hasCachedSubscription) {
              console.warn('[Subscription] Failed to fetch fresh data, using cached subscription');
              setError(null); // Don't show error if cache is available
            } else {
              throw fetchErr;
            }
          }
        } else {
          // User logged out - reset subscription state and clear cache
          console.log('[Subscription] User logged out, resetting subscription state');
          await revenueCatService.logout();
          resetSubscription();
          clearSubscriptionCache();
        }

        // Mark this user as processed
        lastProcessedUserIdRef.current = currentUserId;
        setError(null);
      } catch (err: any) {
        console.error('[Subscription] Auth change handling failed:', err);
        setError(err.message || 'Failed to sync subscription');
        setSubscriptionError(err.message || 'Failed to sync subscription');
      } finally {
        setIsLoading(false);
        setSubscriptionLoading(false);
      }
    };

    handleAuthChange();
  }, [user?.uid, isInitialized, loadCachedSubscription, cacheSubscription, clearSubscriptionCache]);

  // Set up customer info listener
  useEffect(() => {
    if (!isInitialized) return;

    const unsubscribe = revenueCatService.addCustomerInfoListener((customerInfo) => {
      console.log('[Subscription] Customer info updated via listener');
      setSubscriptionFromCustomerInfo(customerInfo);
    });

    return unsubscribe;
  }, [isInitialized]);

  // Purchase a package
  const purchase = useCallback(async (packageId: string): Promise<PurchaseResult> => {
    if (!isInitialized) {
      return { success: false, error: 'Subscriptions not initialized' };
    }

    try {
      setIsLoading(true);
      setSubscriptionLoading(true);

      const result = await revenueCatService.purchasePackage(packageId);

      if (result.success && result.customerInfo) {
        setSubscriptionFromCustomerInfo(result.customerInfo);
      }

      return result;
    } catch (err: any) {
      console.error('[Subscription] Purchase failed:', err);
      return { success: false, error: err.message || 'Purchase failed' };
    } finally {
      setIsLoading(false);
      setSubscriptionLoading(false);
    }
  }, [isInitialized]);

  // Restore purchases
  const restore = useCallback(async (): Promise<void> => {
    if (!isInitialized) {
      throw new Error('Subscriptions not initialized');
    }

    try {
      setIsLoading(true);
      setSubscriptionLoading(true);

      const customerInfo = await revenueCatService.restorePurchases();
      setSubscriptionFromCustomerInfo(customerInfo);
    } catch (err: any) {
      console.error('[Subscription] Restore failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
      setSubscriptionLoading(false);
    }
  }, [isInitialized]);

  // Refresh customer info
  const refreshCustomerInfo = useCallback(async (): Promise<void> => {
    if (!isInitialized) return;

    try {
      setIsLoading(true);

      const customerInfo = await revenueCatService.getCustomerInfo();
      setSubscriptionFromCustomerInfo(customerInfo);
    } catch (err: any) {
      console.error('[Subscription] Refresh failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Get available offerings
  const getOfferings = useCallback(async (): Promise<PackageOffering[]> => {
    if (!isInitialized) {
      return [];
    }

    try {
      setOfferingsLoading(true);

      const offerings = await revenueCatService.getOfferings();
      setOfferings(offerings);
      return offerings;
    } catch (err: any) {
      console.error('[Subscription] Get offerings failed:', err);
      return [];
    } finally {
      setOfferingsLoading(false);
    }
  }, [isInitialized]);

  // Present RevenueCat hosted paywall
  const presentPaywall = useCallback(async (offering?: string): Promise<PurchaseResult> => {
    if (!isInitialized) {
      return { success: false, error: 'Subscriptions not initialized' };
    }

    try {
      setIsLoading(true);
      setSubscriptionLoading(true);

      const result = await revenueCatService.presentPaywall(offering);

      if (result.success && result.customerInfo) {
        setSubscriptionFromCustomerInfo(result.customerInfo);
      }

      return result;
    } catch (err: any) {
      console.error('[Subscription] Present paywall failed:', err);
      return { success: false, error: err.message || 'Paywall failed' };
    } finally {
      setIsLoading(false);
      setSubscriptionLoading(false);
    }
  }, [isInitialized]);

  // Present paywall only if user doesn't have the required entitlement
  const presentPaywallIfNeeded = useCallback(async (entitlementId?: string): Promise<PurchaseResult> => {
    if (!isInitialized) {
      return { success: false, error: 'Subscriptions not initialized' };
    }

    try {
      setIsLoading(true);
      setSubscriptionLoading(true);

      const result = await revenueCatService.presentPaywallIfNeeded(entitlementId);

      if (result.success && result.customerInfo) {
        setSubscriptionFromCustomerInfo(result.customerInfo);
      }

      return result;
    } catch (err: any) {
      console.error('[Subscription] Present paywall if needed failed:', err);
      return { success: false, error: err.message || 'Paywall failed' };
    } finally {
      setIsLoading(false);
      setSubscriptionLoading(false);
    }
  }, [isInitialized]);

  const value: SubscriptionContextType = {
    isInitialized,
    isLoading,
    error,
    initializationFailed,
    purchase,
    restore,
    refreshCustomerInfo,
    getOfferings,
    presentPaywall,
    presentPaywallIfNeeded,
    retryInitialization,
    clearError,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
