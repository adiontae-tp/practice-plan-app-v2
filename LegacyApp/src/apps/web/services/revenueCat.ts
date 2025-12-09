/**
 * RevenueCat Service for Web
 *
 * This service handles RevenueCat integration for subscription management.
 *
 * Uses REST API instead of Web Billing SDK to match mobile implementation.
 * Falls back to Firestore user document if REST API fails.
 *
 * Flow: Firestore -> REST API -> Free default
 */
import type {
  CustomerInfo,
  PackageOffering,
  PurchaseResult,
} from '@ppa/subscription/src/service';
import {
  RevenueCatRestApi,
  entitlementToTier,
  ENTITLEMENT_IDS,
} from '@ppa/subscription';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@ppa/firebase';

/**
 * RevenueCat Service using REST API with Firestore fallback
 * Matches the mobile implementation pattern
 */
class RevenueCatWebService {
  private initialized = false;
  private currentUserId: string | null = null;
  private listeners: Set<(info: CustomerInfo) => void> = new Set();
  private cachedCustomerInfo: CustomerInfo | null = null;
  private restApiClient: RevenueCatRestApi | null = null;

  /**
   * Initialize the service with API key
   */
  async initialize(apiKey?: string, userId?: string): Promise<void> {
    if (apiKey) {
      this.restApiClient = new RevenueCatRestApi({ apiKey });
      console.log('[RevenueCat Web] REST API client initialized with provided key');
    } else {
      // Try to use environment variable
      const envKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY ||
                     process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY;
      if (envKey) {
        this.restApiClient = new RevenueCatRestApi({ apiKey: envKey });
        console.log('[RevenueCat Web] REST API client initialized with env key');
      } else {
        // Will be initialized with default key from @ppa/subscription
        this.restApiClient = new RevenueCatRestApi();
        console.log('[RevenueCat Web] REST API client initialized with default key');
      }
    }

    if (userId) {
      this.currentUserId = userId;
    }

    this.initialized = true;
    console.log('[RevenueCat Web] Initialized with REST API mode');
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if the service is available (always true - we have Firestore fallback)
   */
  isAvailable(): boolean {
    return true;
  }

  /**
   * Force refresh customer info
   */
  async forceReinitialize(userId?: string): Promise<void> {
    if (userId) {
      this.currentUserId = userId;
    }
    this.cachedCustomerInfo = null;

    if (this.currentUserId) {
      await this.getCustomerInfo();
    }

    console.log('[RevenueCat Web] Force reinitialized for user:', this.currentUserId);
  }

  /**
   * Login user - fetches their subscription status
   */
  async login(userId: string): Promise<CustomerInfo> {
    this.currentUserId = userId;

    try {
      const customerInfo = await this.fetchCustomerInfoWithFallback(userId);
      this.cachedCustomerInfo = customerInfo;

      // Notify listeners
      this.listeners.forEach((listener) => listener(customerInfo));

      console.log('[RevenueCat Web] Logged in user:', userId);
      return customerInfo;
    } catch (error) {
      console.error('[RevenueCat Web] Login failed:', error);
      throw error;
    }
  }

  /**
   * Logout user - clears cached data
   */
  async logout(): Promise<void> {
    this.currentUserId = null;
    this.cachedCustomerInfo = null;
    console.log('[RevenueCat Web] Logged out');
  }

  /**
   * Get customer info with Firestore + REST API fallback
   */
  async getCustomerInfo(): Promise<CustomerInfo> {
    if (!this.currentUserId) {
      throw new Error('No user logged in');
    }

    try {
      const customerInfo = await this.fetchCustomerInfoWithFallback(this.currentUserId);
      this.cachedCustomerInfo = customerInfo;
      return customerInfo;
    } catch (error) {
      console.error('[RevenueCat Web] Get customer info failed:', error);
      throw error;
    }
  }

  /**
   * Fetch customer info - prioritize Firestore since it's synced by Cloud Function
   * REST API is secondary fallback if Firestore fails
   */
  private async fetchCustomerInfoWithFallback(userId: string): Promise<CustomerInfo> {
    // Prioritize Firestore since it has the entitlement data synced by Cloud Function
    try {
      console.log('[RevenueCat Web] Fetching from Firestore (primary)...');
      const info = await this.fetchFromFirestore(userId);
      console.log('[RevenueCat Web] Firestore success, entitlements:', Object.keys(info.entitlements.active));
      return info;
    } catch (firestoreError) {
      console.warn('[RevenueCat Web] Firestore failed:', firestoreError);
    }

    // Fallback to REST API if Firestore fails
    if (this.restApiClient) {
      try {
        console.log('[RevenueCat Web] Trying REST API fallback...');
        const info = await this.restApiClient.getCustomerInfo(userId);
        console.log('[RevenueCat Web] REST API success');
        return info;
      } catch (apiError) {
        console.warn('[RevenueCat Web] REST API also failed:', apiError);
      }
    }

    // Last resort - return free tier
    console.warn('[RevenueCat Web] All methods failed, returning free tier');
    return this.createFreeCustomerInfo(userId);
  }

  /**
   * Fetch subscription info from Firestore user document
   */
  private async fetchFromFirestore(userId: string): Promise<CustomerInfo> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.warn('[RevenueCat Web] User document not found, returning free tier');
        return this.createFreeCustomerInfo(userId);
      }

      const userData = userDoc.data();
      const entitlement = userData.entitlement || 0;
      const subscriptionTier = userData.subscriptionTier || entitlementToTier(entitlement);

      console.log('[RevenueCat Web] Firestore entitlement:', entitlement, 'tier:', subscriptionTier);

      // Build CustomerInfo from Firestore data
      const activeEntitlements: CustomerInfo['entitlements']['active'] = {};

      if (entitlement >= 2) {
        activeEntitlements[ENTITLEMENT_IDS.ORGANIZATION] = {
          identifier: ENTITLEMENT_IDS.ORGANIZATION,
          isActive: true,
          willRenew: true,
          expirationDate: null,
        };
      }

      if (entitlement >= 1) {
        activeEntitlements[ENTITLEMENT_IDS.HEAD_COACH] = {
          identifier: ENTITLEMENT_IDS.HEAD_COACH,
          isActive: true,
          willRenew: true,
          expirationDate: null,
        };
      }

      return {
        activeSubscriptions: entitlement > 0 ? [subscriptionTier] : [],
        entitlements: { active: activeEntitlements },
        originalAppUserId: userId,
      };
    } catch (error) {
      console.error('[RevenueCat Web] Firestore fallback failed:', error);
      // Return free tier as last resort
      return this.createFreeCustomerInfo(userId);
    }
  }

  /**
   * Create a free tier CustomerInfo object
   */
  private createFreeCustomerInfo(userId: string): CustomerInfo {
    return {
      activeSubscriptions: [],
      entitlements: { active: {} },
      originalAppUserId: userId,
    };
  }

  /**
   * Get offerings - not available via REST API
   * Use Stripe products instead
   */
  async getOfferings(): Promise<PackageOffering[]> {
    console.warn('[RevenueCat Web] getOfferings not available in REST API mode - use Stripe products');
    return [];
  }

  /**
   * Purchase package - not available via REST API
   * Use Stripe checkout instead
   */
  async purchasePackage(_packageIdentifier: string): Promise<PurchaseResult> {
    console.warn('[RevenueCat Web] purchasePackage not available in REST API mode - use Stripe checkout');
    return { success: false, error: 'Use Stripe checkout for purchases' };
  }

  /**
   * Restore purchases - just refreshes customer info
   */
  async restorePurchases(): Promise<CustomerInfo> {
    if (!this.currentUserId) {
      throw new Error('No user logged in');
    }

    console.log('[RevenueCat Web] Restoring purchases (refreshing subscription status)');
    return this.getCustomerInfo();
  }

  /**
   * Add listener for customer info updates
   */
  addCustomerInfoListener(listener: (info: CustomerInfo) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Manually notify listeners (call after successful purchase)
   */
  notifyListeners(info: CustomerInfo): void {
    this.listeners.forEach((listener) => listener(info));
  }

  /**
   * Get the subscription management URL
   * Returns null - management is handled via Stripe portal
   */
  async getManagementURL(): Promise<string | null> {
    console.warn('[RevenueCat Web] getManagementURL not available - use Stripe customer portal');
    return null;
  }

  /**
   * Open the subscription management portal
   * Returns false - use Stripe portal instead
   */
  async openManagementPortal(): Promise<boolean> {
    console.warn('[RevenueCat Web] openManagementPortal not available - use Stripe customer portal');
    return false;
  }

  /**
   * Present paywall - not available, use Stripe checkout
   */
  async presentPaywall(_targetElement?: HTMLElement): Promise<PurchaseResult> {
    console.warn('[RevenueCat Web] presentPaywall not available - use Stripe checkout');
    return { success: false, error: 'Use Stripe checkout instead of RevenueCat paywall' };
  }
}

// Export singleton instance
export const revenueCatService = new RevenueCatWebService();

// Export for type checking
export type { CustomerInfo, PackageOffering, PurchaseResult };
