import type { SubscriptionTier } from './types';

export interface FeatureFlags {
  maxTeams: number;
  maxAssistantCoaches: number;

  canExportPDF: boolean;
  canViewAnalytics: boolean;
  canUploadFiles: boolean;
  canCreateTemplates: boolean;
  canCreatePeriods: boolean;
  canCreateAnnouncements: boolean;
  canCreateTags: boolean;

  canCreateFolders: boolean;
  canShareFiles: boolean;
  canAccessVersionHistory: boolean;
  maxFileVersions: number;
  maxFileStorageBytes: number;

  canAccessOrgDashboard: boolean;
  canShareTemplatesAcrossTeams: boolean;
  canCustomizeBranding: boolean;
  hasPrioritySupport: boolean;
}

export const FEATURE_GATES: Record<SubscriptionTier, FeatureFlags> = {
  free: {
    maxTeams: 1,
    maxAssistantCoaches: 0,
    canExportPDF: false,
    canViewAnalytics: false,
    canUploadFiles: false,
    canCreateTemplates: false,
    canCreatePeriods: true,
    canCreateAnnouncements: false,
    canCreateTags: false,
    canCreateFolders: false,
    canShareFiles: false,
    canAccessVersionHistory: false,
    maxFileVersions: 0,
    maxFileStorageBytes: 0,
    canAccessOrgDashboard: false,
    canShareTemplatesAcrossTeams: false,
    canCustomizeBranding: false,
    hasPrioritySupport: false,
  },

  coach: {
    maxTeams: 1,
    maxAssistantCoaches: 5,
    canExportPDF: true,
    canViewAnalytics: true,
    canUploadFiles: true,
    canCreateTemplates: true,
    canCreatePeriods: true,
    canCreateAnnouncements: true,
    canCreateTags: true,
    canCreateFolders: true,
    canShareFiles: true,
    canAccessVersionHistory: true,
    maxFileVersions: 10,
    maxFileStorageBytes: 10 * 1024 * 1024 * 1024, // 10GB
    canAccessOrgDashboard: false,
    canShareTemplatesAcrossTeams: false,
    canCustomizeBranding: false,
    hasPrioritySupport: false,
  },

  organization: {
    maxTeams: Infinity,
    maxAssistantCoaches: Infinity,
    canExportPDF: true,
    canViewAnalytics: true,
    canUploadFiles: true,
    canCreateTemplates: true,
    canCreatePeriods: true,
    canCreateAnnouncements: true,
    canCreateTags: true,
    canCreateFolders: true,
    canShareFiles: true,
    canAccessVersionHistory: true,
    maxFileVersions: 50,
    maxFileStorageBytes: 50 * 1024 * 1024 * 1024, // 50GB
    canAccessOrgDashboard: true,
    canShareTemplatesAcrossTeams: true,
    canCustomizeBranding: true,
    hasPrioritySupport: true,
  },
};

export function getFeatureFlags(tier: SubscriptionTier): FeatureFlags {
  return FEATURE_GATES[tier];
}

export function hasFeature<K extends keyof FeatureFlags>(
  tier: SubscriptionTier,
  feature: K
): FeatureFlags[K] {
  return FEATURE_GATES[tier][feature];
}

export function canAddAssistantCoach(
  tier: SubscriptionTier,
  currentCount: number
): boolean {
  const max = FEATURE_GATES[tier].maxAssistantCoaches;
  return currentCount < max;
}

export function canCreateTeam(
  tier: SubscriptionTier,
  currentCount: number
): boolean {
  const max = FEATURE_GATES[tier].maxTeams;
  return currentCount < max;
}

export function canUploadFile(
  tier: SubscriptionTier,
  currentStorageBytes: number,
  fileSizeBytes: number
): { allowed: boolean; reason?: string } {
  const flags = FEATURE_GATES[tier];
  
  if (!flags.canUploadFiles) {
    return { allowed: false, reason: 'File uploads require a premium subscription' };
  }
  
  if (currentStorageBytes + fileSizeBytes > flags.maxFileStorageBytes) {
    return { allowed: false, reason: 'Storage quota exceeded' };
  }
  
  return { allowed: true };
}

export function getStoragePercentUsed(
  tier: SubscriptionTier,
  currentStorageBytes: number
): number {
  const max = FEATURE_GATES[tier].maxFileStorageBytes;
  if (max === 0) return 100;
  return Math.min(100, (currentStorageBytes / max) * 100);
}

export function getUpgradeTierForFeature<K extends keyof FeatureFlags>(
  currentTier: SubscriptionTier,
  feature: K
): SubscriptionTier | null {
  const currentFlags = FEATURE_GATES[currentTier];

  if (typeof currentFlags[feature] === 'boolean' && currentFlags[feature]) {
    return null;
  }

  const tiers: SubscriptionTier[] = ['free', 'coach', 'organization'];
  const currentIndex = tiers.indexOf(currentTier);

  for (let i = currentIndex + 1; i < tiers.length; i++) {
    const tier = tiers[i];
    const flags = FEATURE_GATES[tier];
    if (typeof flags[feature] === 'boolean' && flags[feature]) {
      return tier;
    }
  }

  return null;
}

export const PRICING = {
  free: {
    price: 0,
    priceString: 'Free',
    period: null,
  },
  coach: {
    price: 2.49,
    priceString: '$2.49',
    period: 'month',
  },
  organization: {
    price: 14.99,
    priceString: '$14.99',
    period: 'month',
  },
} as const;

export const TIER_NAMES: Record<SubscriptionTier, string> = {
  free: 'Free',
  coach: 'Coach',
  organization: 'Organization',
};

export const TIER_DESCRIPTIONS: Record<SubscriptionTier, string> = {
  free: 'Basic features for getting started',
  coach: 'Full features for individual coaches',
  organization: 'Multi-team management for schools and clubs',
};

export function formatStorageSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
