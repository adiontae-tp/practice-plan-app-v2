import * as WebBrowser from 'expo-web-browser';
import type { SubscriptionTier } from '@ppa/subscription';

// Re-export types for convenience
export type { StripeProduct, StripeSubscriptionInfo } from '@ppa/subscription';

/**
 * Stripe Payment Link URLs - hardcoded, no env vars needed
 * These are pre-configured payment links in Stripe Dashboard
 */
const STRIPE_PAYMENT_LINKS = {
  coach: 'https://buy.stripe.com/dRmfZhaTvgcP7T0bfDcs804',
  organization: 'https://buy.stripe.com/9B628r9Pr8Kngpw83rcs803',
};

/**
 * Stripe Customer Portal URL
 */
const STRIPE_PORTAL_URL = 'https://billing.stripe.com/p/login/00geWxfi1eFR9Dq000';

/**
 * Stripe product information (static for now since we can't call API)
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
 * Mobile Stripe service that uses Payment Links directly
 * This avoids the need for a backend API call which doesn't work on physical devices
 */
class MobileStripeService {
  /**
   * Get available subscription products
   * Returns static pricing since we can't reliably call the API from mobile
   */
  async getProducts(): Promise<StripeProduct[]> {
    // Return static product info - pricing is defined in Stripe and shown on payment page
    return [
      {
        tier: 'coach' as SubscriptionTier,
        productId: 'prod_coach',
        priceId: 'price_coach',
        name: 'Coach',
        description: 'Full features for individual coaches',
        price: 249, // $2.49 in cents
        priceString: '$2.49',
        currency: 'usd',
        interval: 'month',
        images: [],
      },
      {
        tier: 'organization' as SubscriptionTier,
        productId: 'prod_org',
        priceId: 'price_org',
        name: 'Organization',
        description: 'Multi-team management for schools and clubs',
        price: 1499, // $14.99 in cents
        priceString: '$14.99',
        currency: 'usd',
        interval: 'month',
        images: [],
      },
    ];
  }

  /**
   * Open Stripe checkout using Payment Links directly
   */
  async checkout(options: {
    tier: 'coach' | 'organization';
    userEmail?: string;
    userId?: string;
  }): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const paymentLink = STRIPE_PAYMENT_LINKS[options.tier];

      if (!paymentLink) {
        return { success: false, error: 'Invalid subscription tier' };
      }

      // Build the payment link URL with prefilled email and client reference
      let url = paymentLink;
      if (options.userEmail) {
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}prefilled_email=${encodeURIComponent(options.userEmail)}`;
      }
      if (options.userId) {
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}client_reference_id=${encodeURIComponent(options.userId)}`;
      }

      console.log('[Stripe] Opening payment link:', url);

      await WebBrowser.openBrowserAsync(url);
      return { success: true, url };
    } catch (error: any) {
      console.error('[Stripe] Checkout failed:', error);
      return { success: false, error: error.message || 'Failed to open checkout' };
    }
  }

  /**
   * Open Stripe customer portal directly
   */
  async openPortal(_options: { userEmail: string }): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[Stripe] Opening customer portal:', STRIPE_PORTAL_URL);

      await WebBrowser.openBrowserAsync(STRIPE_PORTAL_URL);
      return { success: true };
    } catch (error: any) {
      console.error('[Stripe] Portal failed:', error);
      return { success: false, error: error.message || 'Failed to open portal' };
    }
  }

  /**
   * Clear cache (no-op for mobile since we use static data)
   */
  clearCache(): void {
    // No-op
  }
}

export const stripeService = new MobileStripeService();
