'use client';

import type { SubscriptionTier } from '@ppa/subscription';

/**
 * Stripe Payment Link URLs - no API key needed
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
 * Web Stripe service using Payment Links directly
 * No API key required - uses pre-configured Stripe Payment Links
 */
class WebStripeService {
  /**
   * Get available subscription products (static pricing)
   */
  async getProducts(): Promise<StripeProduct[]> {
    return [
      {
        tier: 'coach' as SubscriptionTier,
        productId: 'prod_coach',
        priceId: 'price_coach',
        name: 'Coach',
        description: 'Full features for individual coaches',
        price: 249,
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
        price: 1499,
        priceString: '$14.99',
        currency: 'usd',
        interval: 'month',
        images: [],
      },
    ];
  }

  /**
   * Get subscription status (returns free if we can't check)
   */
  async getSubscription(_email: string): Promise<StripeSubscriptionInfo> {
    // Without API, we can't check subscription status
    // RevenueCat handles this via useSubscription hook
    return {
      tier: 'free',
      isActive: false,
      subscription: null,
    };
  }

  /**
   * Open Stripe checkout using Payment Links
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

      // Build URL with prefilled email and client reference
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
      window.location.href = url;
      return { success: true, url };
    } catch (error: any) {
      console.error('[Stripe] Checkout failed:', error);
      return { success: false, error: error.message || 'Failed to open checkout' };
    }
  }

  /**
   * Open Stripe customer portal
   */
  async openPortal(_options: { userEmail: string }): Promise<{ success: boolean; error?: string }> {
    try {
      if (STRIPE_PORTAL_URL) {
        window.location.href = STRIPE_PORTAL_URL;
        return { success: true };
      }
      return { success: false, error: 'Portal not configured' };
    } catch (error: any) {
      console.error('[Stripe] Portal failed:', error);
      return { success: false, error: error.message || 'Failed to open portal' };
    }
  }

  /**
   * Clear cache (no-op since we use static data)
   */
  clearCache(): void {
    // No-op
  }
}

export const stripeService = new WebStripeService();
