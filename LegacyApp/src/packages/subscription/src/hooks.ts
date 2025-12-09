import { useMemo, useCallback } from 'react';
import type { SubscriptionTier } from './types';
import {
  type FeatureFlags,
  FEATURE_GATES,
  hasFeature,
  canAddAssistantCoach,
  canCreateTeam,
  getUpgradeTierForFeature,
  TIER_NAMES,
} from './featureGates';

/**
 * Hook to get all feature flags for a subscription tier
 *
 * Usage:
 * ```tsx
 * const { subscription } = useAppStore();
 * const features = useFeatureFlags(subscription.tier);
 * if (features.canExportPDF) { ... }
 * ```
 */
export function useFeatureFlags(tier: SubscriptionTier): FeatureFlags {
  return useMemo(() => FEATURE_GATES[tier], [tier]);
}

/**
 * Hook to check if a specific feature is available
 *
 * Usage:
 * ```tsx
 * const { subscription } = useAppStore();
 * const canExport = useHasFeature(subscription.tier, 'canExportPDF');
 * ```
 */
export function useHasFeature<K extends keyof FeatureFlags>(
  tier: SubscriptionTier,
  feature: K
): FeatureFlags[K] {
  return useMemo(() => hasFeature(tier, feature), [tier, feature]);
}

/**
 * Hook to check if user can perform a gated action
 * Returns { allowed, upgradeTier, upgradeMessage }
 *
 * Usage:
 * ```tsx
 * const { subscription } = useAppStore();
 * const { allowed, upgradeTier, upgradeMessage } = useCanPerformAction(
 *   subscription.tier,
 *   'canExportPDF'
 * );
 *
 * if (!allowed) {
 *   showPaywall(upgradeMessage);
 * }
 * ```
 */
export function useCanPerformAction<K extends keyof FeatureFlags>(
  tier: SubscriptionTier,
  feature: K
): {
  allowed: boolean;
  upgradeTier: SubscriptionTier | null;
  upgradeMessage: string | null;
} {
  return useMemo(() => {
    const value = hasFeature(tier, feature);
    const allowed = typeof value === 'boolean' ? value : true;

    if (allowed) {
      return { allowed: true, upgradeTier: null, upgradeMessage: null };
    }

    const upgradeTier = getUpgradeTierForFeature(tier, feature);
    const upgradeMessage = upgradeTier
      ? `Upgrade to ${TIER_NAMES[upgradeTier]} to unlock this feature`
      : null;

    return { allowed: false, upgradeTier, upgradeMessage };
  }, [tier, feature]);
}

/**
 * Hook to check if user can add more assistant coaches
 *
 * Usage:
 * ```tsx
 * const { subscription } = useAppStore();
 * const { canAdd, remaining, max } = useCanAddCoach(subscription.tier, currentCoachCount);
 * ```
 */
export function useCanAddCoach(
  tier: SubscriptionTier,
  currentCount: number
): {
  canAdd: boolean;
  remaining: number;
  max: number;
} {
  return useMemo(() => {
    const max = FEATURE_GATES[tier].maxAssistantCoaches;
    const canAdd = canAddAssistantCoach(tier, currentCount);
    const remaining = Math.max(0, max - currentCount);

    return { canAdd, remaining, max };
  }, [tier, currentCount]);
}

/**
 * Hook to check if user can create more teams
 *
 * Usage:
 * ```tsx
 * const { subscription } = useAppStore();
 * const { canCreate, remaining, max } = useCanCreateTeam(subscription.tier, currentTeamCount);
 * ```
 */
export function useCanCreateTeam(
  tier: SubscriptionTier,
  currentCount: number
): {
  canCreate: boolean;
  remaining: number;
  max: number;
} {
  return useMemo(() => {
    const max = FEATURE_GATES[tier].maxTeams;
    const canCreate = canCreateTeam(tier, currentCount);
    const remaining = max === Infinity ? Infinity : Math.max(0, max - currentCount);

    return { canCreate, remaining, max };
  }, [tier, currentCount]);
}

/**
 * Hook that returns a function to check feature access and show paywall if needed
 *
 * Usage:
 * ```tsx
 * const { subscription, showPaywall } = useAppStore();
 * const checkFeature = useFeatureGate(subscription.tier, showPaywall);
 *
 * const handleExportPDF = () => {
 *   if (!checkFeature('canExportPDF')) return;
 *   // proceed with export...
 * };
 * ```
 */
export function useFeatureGate(
  tier: SubscriptionTier,
  onPaywall: (feature: string) => void
): (feature: keyof FeatureFlags) => boolean {
  return useCallback(
    (feature: keyof FeatureFlags) => {
      const value = hasFeature(tier, feature);
      const allowed = typeof value === 'boolean' ? value : true;

      if (!allowed) {
        onPaywall(feature);
        return false;
      }

      return true;
    },
    [tier, onPaywall]
  );
}

/**
 * Feature names for display in paywall
 */
export const FEATURE_DISPLAY_NAMES: Record<keyof FeatureFlags, string> = {
  maxTeams: 'Multiple Teams',
  maxAssistantCoaches: 'Assistant Coaches',
  canExportPDF: 'PDF Export',
  canViewAnalytics: 'Analytics & Reports',
  canUploadFiles: 'File Uploads',
  canCreateTemplates: 'Custom Templates',
  canCreatePeriods: 'Custom Periods',
  canCreateAnnouncements: 'Announcements',
  canCreateTags: 'Tags',
  canCreateFolders: 'Folder Organization',
  canShareFiles: 'File Sharing',
  canAccessVersionHistory: 'Version History',
  maxFileVersions: 'File Versions',
  maxFileStorageBytes: 'File Storage',
  canAccessOrgDashboard: 'Organization Dashboard',
  canShareTemplatesAcrossTeams: 'Shared Template Library',
  canCustomizeBranding: 'Team Branding',
  hasPrioritySupport: 'Priority Support',
};
