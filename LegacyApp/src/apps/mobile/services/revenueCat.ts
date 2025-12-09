/**
 * RevenueCat Service for Mobile
 *
 * This service handles RevenueCat integration for subscription management.
 *
 * UPDATE: Native SDK usage is commented out. Using REST API instead.
 * This avoids needing a development build for subscription checks.
 * Falls back to Firestore user document if REST API fails.
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

// ============================================================================
// NATIVE SDK IMPORTS - COMMENTED OUT
// Keeping the dependency in package.json to avoid a new build
// ============================================================================

// import { Platform } from 'react-native';
// let Purchases: typeof import('react-native-purchases').default | null = null;
// let LOG_LEVEL: typeof import('react-native-purchases').LOG_LEVEL | null = null;

// try {
//   const purchasesModule = require('react-native-purchases');
//   Purchases = purchasesModule.default;
//   LOG_LEVEL = purchasesModule.LOG_LEVEL;
// } catch {
//   console.warn('[RevenueCat] react-native-purchases not available');
// }

// ============================================================================
// REST API + FIRESTORE FALLBACK IMPLEMENTATION
// ============================================================================

/**
 * RevenueCat Service using REST API with Firestore fallback
 */
class RevenueCatService {
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
      console.log('[RevenueCat] REST API client initialized with provided key');
    } else {
      // Try to use environment variable
      const envKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ||
                     process.env.EXPO_PUBLIC_REVENUECAT_TEST_STORE_KEY;
      if (envKey) {
        this.restApiClient = new RevenueCatRestApi({ apiKey: envKey });
        console.log('[RevenueCat] REST API client initialized with env key');
      } else {
        console.warn('[RevenueCat] No API key available, will use Firestore fallback only');
      }
    }

    if (userId) {
      this.currentUserId = userId;
    }

    this.initialized = true;
    console.log('[RevenueCat] Initialized with REST API mode');
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

    console.log('[RevenueCat] Force reinitialized for user:', this.currentUserId);
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

      console.log('[RevenueCat] Logged in user:', userId);
      return customerInfo;
    } catch (error) {
      console.error('[RevenueCat] Login failed:', error);
      throw error;
    }
  }

  /**
   * Logout user - clears cached data
   */
  async logout(): Promise<void> {
    this.currentUserId = null;
    this.cachedCustomerInfo = null;
    console.log('[RevenueCat] Logged out');
  }

  /**
   * Get customer info with REST API + Firestore fallback
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
      console.error('[RevenueCat] Get customer info failed:', error);
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
      console.log('[RevenueCat] Fetching from Firestore (primary)...');
      const info = await this.fetchFromFirestore(userId);
      console.log('[RevenueCat] Firestore success, entitlements:', Object.keys(info.entitlements.active));
      return info;
    } catch (firestoreError) {
      console.warn('[RevenueCat] Firestore failed:', firestoreError);
    }

    // Fallback to REST API if Firestore fails
    if (this.restApiClient) {
      try {
        console.log('[RevenueCat] Trying REST API fallback...');
        const info = await this.restApiClient.getCustomerInfo(userId);
        console.log('[RevenueCat] REST API success');
        return info;
      } catch (apiError) {
        console.warn('[RevenueCat] REST API also failed:', apiError);
      }
    }

    // Last resort - return free tier
    console.warn('[RevenueCat] All methods failed, returning free tier');
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
        console.warn('[RevenueCat] User document not found, returning free tier');
        return this.createFreeCustomerInfo(userId);
      }

      const userData = userDoc.data();
      const entitlement = userData.entitlement || 0;
      const subscriptionTier = userData.subscriptionTier || entitlementToTier(entitlement);

      console.log('[RevenueCat] Firestore entitlement:', entitlement, 'tier:', subscriptionTier);

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
      console.error('[RevenueCat] Firestore fallback failed:', error);
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
    console.warn('[RevenueCat] getOfferings not available in REST API mode - use Stripe products');
    return [];
  }

  /**
   * Purchase package - not available via REST API
   * Use Stripe checkout instead
   */
  async purchasePackage(_packageIdentifier: string): Promise<PurchaseResult> {
    console.warn('[RevenueCat] purchasePackage not available in REST API mode - use Stripe checkout');
    return { success: false, error: 'Use Stripe checkout for purchases' };
  }

  /**
   * Restore purchases - just refreshes customer info
   */
  async restorePurchases(): Promise<CustomerInfo> {
    if (!this.currentUserId) {
      throw new Error('No user logged in');
    }

    console.log('[RevenueCat] Restoring purchases (refreshing subscription status)');
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
   * Present paywall - not available, use Stripe checkout
   */
  async presentPaywall(_offering?: string): Promise<PurchaseResult> {
    console.warn('[RevenueCat] presentPaywall not available - use Stripe checkout');
    return { success: false, error: 'Use Stripe checkout instead of RevenueCat paywall' };
  }

  /**
   * Present paywall if needed - not available, use Stripe checkout
   */
  async presentPaywallIfNeeded(_entitlementId?: string): Promise<PurchaseResult> {
    console.warn('[RevenueCat] presentPaywallIfNeeded not available - use Stripe checkout');
    return { success: false, error: 'Use Stripe checkout instead of RevenueCat paywall' };
  }
}

// Export singleton instance
export const revenueCatService = new RevenueCatService();

// ============================================================================
// ORIGINAL NATIVE SDK IMPLEMENTATION - COMMENTED OUT FOR REFERENCE
// ============================================================================

/*
// Original implementation using native SDK - see git history for full code
*/
