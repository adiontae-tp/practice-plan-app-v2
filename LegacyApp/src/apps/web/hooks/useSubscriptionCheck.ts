'use client';

import { useEffect } from 'react';
import { useAppStore } from '@ppa/store';

/**
 * Cheap subscription check hook for every page
 *
 * Uses stale-while-revalidate pattern:
 * - Shows cached subscription immediately (no loading state)
 * - Refreshes in background if cache is older than maxAge
 * - Non-blocking - page loads instantly
 *
 * Usage: Add to your root layout or any page that needs fresh subscription data
 *
 * @example
 * // In layout.tsx or page.tsx
 * useSubscriptionCheck();
 *
 * @example
 * // With custom max age (10 minutes)
 * useSubscriptionCheck({ maxAgeMs: 10 * 60 * 1000 });
 */
export function useSubscriptionCheck(options?: {
  /** Max cache age in ms before refresh (default: 5 minutes) */
  maxAgeMs?: number;
  /** Whether to skip the check (useful for public pages) */
  skip?: boolean;
}) {
  const { maxAgeMs = 5 * 60 * 1000, skip = false } = options ?? {};

  const authUser = useAppStore((state) => state.authUser);
  const refreshSubscriptionIfStale = useAppStore(
    (state) => state.refreshSubscriptionIfStale
  );

  useEffect(() => {
    if (skip || !authUser?.uid) return;

    // This is non-blocking - fires and forgets if stale
    const wasRefreshed = refreshSubscriptionIfStale(authUser.uid, maxAgeMs);

    if (wasRefreshed) {
      console.log('[useSubscriptionCheck] Triggered background refresh');
    }
  }, [authUser?.uid, maxAgeMs, skip, refreshSubscriptionIfStale]);
}

/**
 * Hook to get subscription status with automatic stale check
 * Combines subscription state with automatic background refresh
 */
export function useSubscriptionStatus(options?: {
  maxAgeMs?: number;
  skip?: boolean;
}) {
  // Trigger the stale check
  useSubscriptionCheck(options);

  // Return the current subscription state
  const subscription = useAppStore((state) => state.subscription);
  const subscriptionLoading = useAppStore((state) => state.subscriptionLoading);
  const subscriptionFromCache = useAppStore((state) => state.subscriptionFromCache);
  const tierOverride = useAppStore((state) => state.tierOverride);

  return {
    ...subscription,
    // Effective tier (override takes precedence)
    effectiveTier: tierOverride ?? subscription.tier,
    isLoading: subscriptionLoading,
    isFromCache: subscriptionFromCache,
  };
}
