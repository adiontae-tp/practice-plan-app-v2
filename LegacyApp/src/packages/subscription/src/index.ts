// Types
export type {
  SubscriptionTier,
  EntitlementLevel,
  SubscriptionSource,
  SubscriptionState,
  CustomerInfo,
  PackageOffering,
  PurchaseResult,
  CachedSubscriptionState,
} from './types';

export {
  ENTITLEMENT_IDS,
  PACKAGE_IDS,
  APP_STORE_IDENTIFIERS,
  STRIPE_IDENTIFIERS,
  entitlementToTier,
  tierToEntitlement,
  getSubscriptionSource,
  SUBSCRIPTION_CACHE_KEY,
  SUBSCRIPTION_CACHE_DURATION,
  isCacheValid,
} from './types';

// Feature Gates
export type { FeatureFlags } from './featureGates';

export {
  FEATURE_GATES,
  getFeatureFlags,
  hasFeature,
  canAddAssistantCoach,
  canCreateTeam,
  canUploadFile,
  getStoragePercentUsed,
  formatStorageSize,
  getUpgradeTierForFeature,
  PRICING,
  TIER_NAMES,
  TIER_DESCRIPTIONS,
} from './featureGates';

// Hooks
export {
  useFeatureFlags,
  useHasFeature,
  useCanPerformAction,
  useCanAddCoach,
  useCanCreateTeam,
  useFeatureGate,
  FEATURE_DISPLAY_NAMES,
} from './hooks';

// Service interface
export type { IRevenueCatService } from './service';
export { REVENUECAT_CONFIG, getApiKey } from './service';

// Stripe types and base service
export type {
  StripeProduct,
  StripeSubscriptionInfo,
  CheckoutOptions,
  PortalOptions,
  IStripeService,
} from './stripe';
export { BaseStripeService } from './stripe';

// REST API client (for client-side fallback when SDK isn't available)
export {
  RevenueCatRestApi,
  RevenueCatApiError,
  getRevenueCatRestApi,
  fetchCustomerInfo,
  checkActiveSubscription,
  checkEntitlement,
} from './restApi';
export type { RevenueCatRestApiConfig } from './restApi';
