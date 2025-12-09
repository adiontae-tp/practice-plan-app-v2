/**
 * Subscription tier levels
 */
export type SubscriptionTier = 'free' | 'coach' | 'organization';

/**
 * Numeric entitlement values (for Firebase user document)
 */
export type EntitlementLevel = 0 | 1 | 2;

/**
 * RevenueCat entitlement identifiers
 */
export const ENTITLEMENT_IDS = {
  HEAD_COACH: 'Head Coach',
  ORGANIZATION: 'organization',
} as const;

/**
 * RevenueCat package identifiers
 */
export const PACKAGE_IDS = {
  COACH: '$rc_custom_coach',
  ORGANIZATION: '$rc_custom_organization',
} as const;

/**
 * Subscription source (where the subscription was purchased)
 * - 'app_store' = Legacy iOS App Store purchase via RevenueCat
 * - 'stripe' = Stripe purchase (new default for all platforms)
 * - 'none' = No active subscription
 */
export type SubscriptionSource = 'app_store' | 'stripe' | 'none';

/**
 * Store identifiers that indicate App Store purchase
 */
export const APP_STORE_IDENTIFIERS = [
  'headCoach_249',
  'headCoach',
  'organization_monthly',
] as const;

/**
 * Store identifiers that indicate Stripe purchase
 */
export const STRIPE_IDENTIFIERS = [
  'prod_MoC3n1zPGfPDUe', // Coach
  'prod_TXVaDvv8HTviEb', // Organization
] as const;

/**
 * Determine subscription source from active subscriptions
 */
export function getSubscriptionSource(activeSubscriptions: string[]): SubscriptionSource {
  for (const sub of activeSubscriptions) {
    // Check for Stripe products
    if (STRIPE_IDENTIFIERS.some(id => sub.includes(id))) {
      return 'stripe';
    }
    // Check for App Store products
    if (APP_STORE_IDENTIFIERS.some(id => sub.includes(id))) {
      return 'app_store';
    }
  }
  return 'none';
}

/**
 * User subscription state
 */
export interface SubscriptionState {
  tier: SubscriptionTier;
  entitlement: EntitlementLevel;
  source: SubscriptionSource;
  isActive: boolean;
  expiresAt: number | null;
  willRenew: boolean;
  lastVerified: number;
  /** The store where the subscription was purchased (for manage subscription routing) */
  store?: 'app_store' | 'play_store' | 'stripe';
}

/**
 * RevenueCat customer info (simplified)
 */
export interface CustomerInfo {
  activeSubscriptions: string[];
  entitlements: {
    active: Record<string, {
      identifier: string;
      isActive: boolean;
      willRenew: boolean;
      expirationDate: string | null;
    }>;
  };
  originalAppUserId: string;
}

/**
 * Package offering for purchase
 */
export interface PackageOffering {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    title: string;
    description: string;
    price: number;
    priceString: string;
    currencyCode: string;
  };
}

/**
 * Purchase result
 */
export interface PurchaseResult {
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}

/**
 * Map entitlement level to tier name
 */
export function entitlementToTier(entitlement: EntitlementLevel): SubscriptionTier {
  switch (entitlement) {
    case 2:
      return 'organization';
    case 1:
      return 'coach';
    default:
      return 'free';
  }
}

/**
 * Map tier name to entitlement level
 */
export function tierToEntitlement(tier: SubscriptionTier): EntitlementLevel {
  switch (tier) {
    case 'organization':
      return 2;
    case 'coach':
      return 1;
    default:
      return 0;
  }
}

/**
 * Cache key for offline subscription storage
 */
export const SUBSCRIPTION_CACHE_KEY = 'ppa_subscription_cache';

/**
 * Cache duration for offline subscription state (24 hours)
 */
export const SUBSCRIPTION_CACHE_DURATION = 24 * 60 * 60 * 1000;

/**
 * Cached subscription data structure
 */
export interface CachedSubscriptionState {
  state: SubscriptionState;
  userId: string;
  cachedAt: number;
}

/**
 * Check if cached subscription is still valid
 */
export function isCacheValid(cache: CachedSubscriptionState | null, userId: string): boolean {
  if (!cache) return false;
  if (cache.userId !== userId) return false;
  if (Date.now() - cache.cachedAt > SUBSCRIPTION_CACHE_DURATION) return false;
  return true;
}
