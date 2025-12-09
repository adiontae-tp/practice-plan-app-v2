/**
 * RevenueCat REST API Client
 *
 * Provides a client-side fallback for checking subscription status
 * when the RevenueCat SDK isn't available (e.g., on web).
 *
 * Uses the REST API v1: GET /v1/subscribers/{app_user_id}
 * Docs: https://www.revenuecat.com/docs/api-v2
 */

import type { CustomerInfo } from './types';
import { REVENUECAT_CONFIG } from './service';

/**
 * RevenueCat REST API response structure
 */
interface RevenueCatSubscriberResponse {
  request_date: string;
  request_date_ms: number;
  subscriber: {
    original_app_user_id: string;
    original_application_version: string | null;
    original_purchase_date: string | null;
    first_seen: string;
    last_seen: string;
    management_url: string | null;
    non_subscriptions: Record<string, unknown[]>;
    subscriptions: Record<
      string,
      {
        expires_date: string | null;
        grace_period_expires_date: string | null;
        purchase_date: string;
        original_purchase_date: string;
        ownership_type: string;
        period_type: string;
        store: string;
        is_sandbox: boolean;
        unsubscribe_detected_at: string | null;
        billing_issues_detected_at: string | null;
        auto_resume_date: string | null;
        refunded_at: string | null;
      }
    >;
    entitlements: Record<
      string,
      {
        expires_date: string | null;
        grace_period_expires_date: string | null;
        purchase_date: string;
        product_identifier: string;
        product_plan_identifier: string | null;
      }
    >;
  };
}

/**
 * Error thrown when REST API call fails
 */
export class RevenueCatApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public responseBody?: string
  ) {
    super(message);
    this.name = 'RevenueCatApiError';
  }
}

/**
 * Configuration for the REST API client
 */
export interface RevenueCatRestApiConfig {
  /** Public API key for client-side requests */
  apiKey: string;
  /** Base URL for the API (default: https://api.revenuecat.com) */
  baseUrl?: string;
  /** Request timeout in ms (default: 10000) */
  timeout?: number;
}

/**
 * RevenueCat REST API Client
 *
 * Use this as a fallback when the SDK isn't available.
 */
export class RevenueCatRestApi {
  private config: Required<RevenueCatRestApiConfig>;

  constructor(config: Partial<RevenueCatRestApiConfig> = {}) {
    this.config = {
      apiKey: config.apiKey || REVENUECAT_CONFIG.WEB_API_KEY || REVENUECAT_CONFIG.IOS_API_KEY,
      baseUrl: config.baseUrl || 'https://api.revenuecat.com',
      timeout: config.timeout || 10000,
    };
  }

  /**
   * Get customer info (subscription status) for a user
   *
   * @param appUserId - The user's ID (typically Firebase UID)
   * @returns CustomerInfo compatible with the SDK response
   */
  async getCustomerInfo(appUserId: string): Promise<CustomerInfo> {
    if (!this.config.apiKey) {
      throw new RevenueCatApiError('API key not configured', 0);
    }

    if (!appUserId) {
      throw new RevenueCatApiError('User ID is required', 0);
    }

    const url = `${this.config.baseUrl}/v1/subscribers/${encodeURIComponent(appUserId)}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'X-Platform': 'web',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new RevenueCatApiError(
          `RevenueCat API error: ${response.status} ${response.statusText}`,
          response.status,
          errorBody
        );
      }

      const data: RevenueCatSubscriberResponse = await response.json();
      return this.transformToCustomerInfo(data);
    } catch (error) {
      if (error instanceof RevenueCatApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new RevenueCatApiError('Request timed out', 0);
        }
        throw new RevenueCatApiError(`Network error: ${error.message}`, 0);
      }

      throw new RevenueCatApiError('Unknown error occurred', 0);
    }
  }

  /**
   * Check if a user has an active subscription
   *
   * @param appUserId - The user's ID
   * @returns true if the user has any active entitlement
   */
  async hasActiveSubscription(appUserId: string): Promise<boolean> {
    const customerInfo = await this.getCustomerInfo(appUserId);
    return Object.keys(customerInfo.entitlements.active).length > 0;
  }

  /**
   * Check if a user has a specific entitlement
   *
   * @param appUserId - The user's ID
   * @param entitlementId - The entitlement identifier to check
   * @returns true if the user has the specified active entitlement
   */
  async hasEntitlement(appUserId: string, entitlementId: string): Promise<boolean> {
    const customerInfo = await this.getCustomerInfo(appUserId);
    return entitlementId in customerInfo.entitlements.active;
  }

  /**
   * Transform the REST API response to our CustomerInfo format
   */
  private transformToCustomerInfo(response: RevenueCatSubscriberResponse): CustomerInfo {
    const { subscriber } = response;
    const now = Date.now();

    // Build active subscriptions list
    const activeSubscriptions: string[] = [];
    for (const [productId, subscription] of Object.entries(subscriber.subscriptions)) {
      // Check if subscription is active (not expired)
      if (subscription.expires_date) {
        const expiresAt = new Date(subscription.expires_date).getTime();
        if (expiresAt > now && !subscription.refunded_at) {
          activeSubscriptions.push(productId);
        }
      }
    }

    // Build active entitlements
    const activeEntitlements: CustomerInfo['entitlements']['active'] = {};
    for (const [entitlementId, entitlement] of Object.entries(subscriber.entitlements)) {
      // Check if entitlement is active (not expired)
      const expiresAt = entitlement.expires_date
        ? new Date(entitlement.expires_date).getTime()
        : null;

      const isActive = expiresAt === null || expiresAt > now;

      if (isActive) {
        // Get the subscription info for willRenew status
        const subscription = subscriber.subscriptions[entitlement.product_identifier];
        const willRenew = subscription
          ? !subscription.unsubscribe_detected_at && !subscription.billing_issues_detected_at
          : false;

        activeEntitlements[entitlementId] = {
          identifier: entitlementId,
          isActive: true,
          willRenew,
          expirationDate: entitlement.expires_date,
        };
      }
    }

    return {
      activeSubscriptions,
      entitlements: {
        active: activeEntitlements,
      },
      originalAppUserId: subscriber.original_app_user_id,
    };
  }
}

/**
 * Singleton instance for convenience
 */
let defaultClient: RevenueCatRestApi | null = null;

/**
 * Get or create the default REST API client
 */
export function getRevenueCatRestApi(config?: Partial<RevenueCatRestApiConfig>): RevenueCatRestApi {
  if (!defaultClient || config) {
    defaultClient = new RevenueCatRestApi(config);
  }
  return defaultClient;
}

/**
 * Fetch customer info using the REST API
 * Convenience function that uses the default client
 */
export async function fetchCustomerInfo(appUserId: string): Promise<CustomerInfo> {
  return getRevenueCatRestApi().getCustomerInfo(appUserId);
}

/**
 * Check if user has active subscription using the REST API
 * Convenience function that uses the default client
 */
export async function checkActiveSubscription(appUserId: string): Promise<boolean> {
  return getRevenueCatRestApi().hasActiveSubscription(appUserId);
}

/**
 * Check if user has specific entitlement using the REST API
 * Convenience function that uses the default client
 */
export async function checkEntitlement(appUserId: string, entitlementId: string): Promise<boolean> {
  return getRevenueCatRestApi().hasEntitlement(appUserId, entitlementId);
}
