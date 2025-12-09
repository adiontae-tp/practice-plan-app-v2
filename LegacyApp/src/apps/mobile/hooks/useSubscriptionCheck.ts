import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAppStore } from '@ppa/store';

/**
 * Cheap subscription check hook for mobile
 *
 * Uses stale-while-revalidate pattern:
 * - Shows cached subscription immediately (no loading state)
 * - Refreshes in background if cache is older than maxAge
 * - Also refreshes when app comes to foreground
 * - Non-blocking - screens load instantly
 *
 * Usage: Add to your root layout or tab navigator
 *
 * @example
 * // In _layout.tsx
 * useSubscriptionCheck();
 *
 * @example
 * // With custom max age (10 minutes)
 * useSubscriptionCheck({ maxAgeMs: 10 * 60 * 1000 });
 */
export function useSubscriptionCheck(options?: {
  /** Max cache age in ms before refresh (default: 5 minutes) */
  maxAgeMs?: number;
  /** Whether to skip the check */
  skip?: boolean;
  /** Also refresh when app comes to foreground (default: true) */
  refreshOnForeground?: boolean;
}) {
  const {
    maxAgeMs = 5 * 60 * 1000,
    skip = false,
    refreshOnForeground = true,
  } = options ?? {};

  const user = useAppStore((state) => state.user);
  const refreshSubscriptionIfStale = useAppStore(
    (state) => state.refreshSubscriptionIfStale
  );

  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Check on mount and when user changes
  useEffect(() => {
    if (skip || !user?.uid) return;

    const wasRefreshed = refreshSubscriptionIfStale(user.uid, maxAgeMs);

    if (wasRefreshed) {
      console.log('[useSubscriptionCheck] Triggered background refresh');
    }
  }, [user?.uid, maxAgeMs, skip, refreshSubscriptionIfStale]);

  // Check when app comes to foreground
  useEffect(() => {
    if (!refreshOnForeground || skip || !user?.uid) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // App came to foreground
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('[useSubscriptionCheck] App foregrounded, checking subscription...');
        refreshSubscriptionIfStale(user.uid, maxAgeMs);
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [user?.uid, maxAgeMs, skip, refreshOnForeground, refreshSubscriptionIfStale]);
}

/**
 * Hook to get subscription status with automatic stale check
 */
export function useSubscriptionStatus(options?: {
  maxAgeMs?: number;
  skip?: boolean;
}) {
  useSubscriptionCheck(options);

  const subscription = useAppStore((state) => state.subscription);
  const subscriptionLoading = useAppStore((state) => state.subscriptionLoading);
  const subscriptionFromCache = useAppStore((state) => state.subscriptionFromCache);
  const tierOverride = useAppStore((state) => state.tierOverride);

  return {
    ...subscription,
    effectiveTier: tierOverride ?? subscription.tier,
    isLoading: subscriptionLoading,
    isFromCache: subscriptionFromCache,
  };
}
