import type { SubscriptionTier } from './types';

/**
 * Stripe product information
 */
export interface StripeProduct {
  tier: SubscriptionTier;
  productId: string;
  priceId: string;
  name: string;
  description: string | null;
  price: number;
  priceString: string;
  currency: string;
  interval: string | null;
  images: string[];
}

/**
 * Stripe subscription information
 */
export interface StripeSubscriptionInfo {
  tier: SubscriptionTier;
  isActive: boolean;
  subscription: {
    id: string;
    status: string;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
  } | null;
}

/**
 * Checkout options
 */
export interface CheckoutOptions {
  tier: 'coach' | 'organization';
  userEmail?: string;
  userId?: string;
  successUrl?: string;
  cancelUrl?: string;
}

/**
 * Portal options
 */
export interface PortalOptions {
  userEmail: string;
  returnUrl?: string;
}

/**
 * Base Stripe service interface
 */
export interface IStripeService {
  getProducts(): Promise<StripeProduct[]>;
  getSubscription(email: string): Promise<StripeSubscriptionInfo>;
  checkout(options: CheckoutOptions): Promise<{ success: boolean; url?: string; error?: string }>;
  openPortal(options: PortalOptions): Promise<{ success: boolean; error?: string }>;
  clearCache(): void;
}

/**
 * Shared Stripe service logic
 * Platform-specific implementations extend this with their own URL handling
 */
export abstract class BaseStripeService implements IStripeService {
  protected productsCache: StripeProduct[] | null = null;
  protected productsCacheTime: number = 0;
  protected readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get the API base URL - implemented by platform-specific services
   */
  protected abstract getApiUrl(): string;

  /**
   * Open a URL - implemented by platform-specific services
   * Web: window.location.href = url
   * Mobile: Linking.openURL(url)
   */
  protected abstract openUrl(url: string): Promise<boolean>;

  /**
   * Get the default success URL for checkout
   */
  protected abstract getDefaultSuccessUrl(): string;

  /**
   * Get the default cancel URL for checkout
   */
  protected abstract getDefaultCancelUrl(): string;

  /**
   * Get the default return URL for portal
   */
  protected abstract getDefaultReturnUrl(): string;

  /**
   * Get available subscription products from Stripe
   */
  async getProducts(): Promise<StripeProduct[]> {
    // Return cached products if still valid
    if (
      this.productsCache &&
      Date.now() - this.productsCacheTime < this.CACHE_DURATION
    ) {
      return this.productsCache;
    }

    try {
      const apiUrl = this.getApiUrl();
      const response = await fetch(`${apiUrl}/api/stripe/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      this.productsCache = data.products;
      this.productsCacheTime = Date.now();
      return data.products;
    } catch (error) {
      console.error('[Stripe] Failed to get products:', error);
      throw error;
    }
  }

  /**
   * Get subscription status for a user
   */
  async getSubscription(email: string): Promise<StripeSubscriptionInfo> {
    try {
      const apiUrl = this.getApiUrl();
      const response = await fetch(
        `${apiUrl}/api/stripe/subscription?email=${encodeURIComponent(email)}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('[Stripe] Failed to get subscription:', error);
      return {
        tier: 'free',
        isActive: false,
        subscription: null,
      };
    }
  }

  /**
   * Create a checkout session
   */
  async checkout(options: CheckoutOptions): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const apiUrl = this.getApiUrl();
      const successUrl = options.successUrl || this.getDefaultSuccessUrl();
      const cancelUrl = options.cancelUrl || this.getDefaultCancelUrl();

      // Validate API URL
      if (!apiUrl || apiUrl === 'http://localhost:3000') {
        console.warn('[Stripe] API URL not configured or using localhost. Check EXPO_PUBLIC_API_URL environment variable.');
      }

      const checkoutUrl = `${apiUrl}/api/stripe/checkout`;
      
      let response: Response;
      try {
        response = await fetch(checkoutUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tier: options.tier,
            userEmail: options.userEmail,
            userId: options.userId,
            successUrl,
            cancelUrl,
          }),
        });
      } catch (fetchError: any) {
        // Network error (connection failed, CORS, etc.)
        if (fetchError.message?.includes('Network request failed') || fetchError.name === 'TypeError') {
          const errorMessage = apiUrl.includes('localhost') 
            ? 'Cannot reach API server. Make sure the web app is running and EXPO_PUBLIC_API_URL is set to your computer\'s IP address (not localhost) for physical devices.'
            : `Network error: Cannot reach API at ${apiUrl}. Please check your internet connection and API configuration.`;
          console.error('[Stripe] Network error:', errorMessage);
          return { success: false, error: errorMessage };
        }
        throw fetchError;
      }

      if (!response.ok) {
        let errorMessage = 'Failed to create checkout session';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const url = data.url || data.sessionUrl;

      if (url) {
        const opened = await this.openUrl(url);
        if (opened) {
          return { success: true, url };
        }
        throw new Error('Cannot open checkout URL');
      }

      throw new Error('No checkout URL returned from server');
    } catch (error: any) {
      console.error('[Stripe] Checkout failed:', error);
      return { success: false, error: error.message || 'Failed to create checkout session' };
    }
  }

  /**
   * Open the Stripe customer portal
   */
  async openPortal(options: PortalOptions): Promise<{ success: boolean; error?: string }> {
    try {
      const apiUrl = this.getApiUrl();
      const returnUrl = options.returnUrl || this.getDefaultReturnUrl();

      const response = await fetch(`${apiUrl}/api/stripe/portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: options.userEmail,
          returnUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create portal session');
      }

      const { url } = await response.json();

      if (url) {
        const opened = await this.openUrl(url);
        if (opened) {
          return { success: true };
        }
        throw new Error('Cannot open portal URL');
      }

      throw new Error('No portal URL returned');
    } catch (error: any) {
      console.error('[Stripe] Portal failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear products cache
   */
  clearCache(): void {
    this.productsCache = null;
    this.productsCacheTime = 0;
  }
}
