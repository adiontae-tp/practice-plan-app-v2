import type { CustomerInfo, PackageOffering, PurchaseResult } from './types';

// Re-export types for platform implementations
export type { CustomerInfo, PackageOffering, PurchaseResult };

/**
 * RevenueCat Service Interface
 *
 * Platform-specific implementations (mobile/web) should implement this interface.
 * This allows the subscription logic to be platform-agnostic.
 */
export interface IRevenueCatService {
  /**
   * Initialize the RevenueCat SDK
   * Should be called once at app startup
   * @param apiKey - Optional API key (uses platform default if not provided)
   * @param userId - Optional user ID for web (required for web billing)
   */
  initialize(apiKey?: string, userId?: string): Promise<void>;

  /**
   * Force reinitialize to clear cache and get fresh data
   * Useful when switching users or refreshing subscription state
   */
  forceReinitialize(userId?: string): Promise<void>;

  /**
   * Check if the SDK is initialized
   */
  isInitialized(): boolean;

  /**
   * Login/identify a user with RevenueCat
   * Call this after Firebase auth
   */
  login(userId: string): Promise<CustomerInfo>;

  /**
   * Logout the current user
   * Call this on Firebase sign out
   */
  logout(): Promise<void>;

  /**
   * Get the current customer info (subscription status)
   */
  getCustomerInfo(): Promise<CustomerInfo>;

  /**
   * Get available offerings/packages for purchase
   */
  getOfferings(): Promise<PackageOffering[]>;

  /**
   * Purchase a package
   */
  purchasePackage(packageId: string): Promise<PurchaseResult>;

  /**
   * Restore previous purchases
   */
  restorePurchases(): Promise<CustomerInfo>;

  /**
   * Add a listener for customer info updates
   */
  addCustomerInfoListener(listener: (info: CustomerInfo) => void): () => void;

  /**
   * Present RevenueCat hosted paywall UI (optional - platform-specific)
   * Implementation varies by platform:
   * - Web: Takes an HTML element as target for the paywall
   * - Mobile: Presents native paywall modal
   */
  presentPaywall?(...args: any[]): Promise<PurchaseResult>;

  /**
   * Present paywall only if user doesn't have the required entitlement (optional - mobile only)
   */
  presentPaywallIfNeeded?(entitlementId?: string): Promise<PurchaseResult>;
}

/**
 * RevenueCat API Keys
 * These should be set via environment variables
 */
export const REVENUECAT_CONFIG = {
  // iOS App Store API Key
  IOS_API_KEY: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_REVENUECAT_IOS_KEY) ||
                (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_REVENUECAT_IOS_KEY) || '',

  // Web Billing API Key
  WEB_API_KEY: (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_REVENUECAT_WEB_KEY) ||
               (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_REVENUECAT_WEB_KEY) || '',

  // Test Store API Key (for development)
  TEST_API_KEY: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_REVENUECAT_TEST_KEY) ||
                (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_REVENUECAT_TEST_KEY) || '',
} as const;

/**
 * Determine which API key to use based on platform
 */
export function getApiKey(platform: 'ios' | 'web' | 'test'): string {
  switch (platform) {
    case 'ios':
      return REVENUECAT_CONFIG.IOS_API_KEY;
    case 'web':
      return REVENUECAT_CONFIG.WEB_API_KEY;
    case 'test':
      return REVENUECAT_CONFIG.TEST_API_KEY;
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}
