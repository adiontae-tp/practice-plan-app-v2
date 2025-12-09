import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[Stripe Subscription API] STRIPE_SECRET_KEY is not configured in environment variables');
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover',
  });
}

// Map Stripe product IDs to tiers
const PRODUCT_TO_TIER: Record<string, string> = {
  'prod_MoC3n1zPGfPDUe': 'coach', // Head Coach Monthly
  'prod_TXVaDvv8HTviEb': 'organization', // Organization Monthly
};

export async function GET(request: NextRequest) {
  const stripe = getStripe();

  // If Stripe is not configured, return free tier (fallback)
  if (!stripe) {
    console.warn('[Stripe Subscription API] Returning free tier - Stripe not configured');
    return NextResponse.json({
      tier: 'free',
      isActive: false,
      subscription: null,
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find customer by email
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({
        tier: 'free',
        isActive: false,
        subscription: null,
      });
    }

    const customerId = customers.data[0].id;

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 10,
    });

    if (subscriptions.data.length === 0) {
      // Check for trialing subscriptions
      const trialingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'trialing',
        limit: 10,
      });

      if (trialingSubscriptions.data.length === 0) {
        return NextResponse.json({
          tier: 'free',
          isActive: false,
          subscription: null,
        });
      }

      subscriptions.data = trialingSubscriptions.data;
    }

    // Find the highest tier subscription
    let highestTier = 'free';
    let activeSubscription = null;

    for (const sub of subscriptions.data) {
      for (const item of sub.items.data) {
        const productId = item.price.product as string;
        const tier = PRODUCT_TO_TIER[productId];

        if (tier === 'organization') {
          highestTier = 'organization';
          activeSubscription = sub;
          break;
        } else if (tier === 'coach' && highestTier !== 'organization') {
          highestTier = 'coach';
          activeSubscription = sub;
        }
      }
    }

    // Get current_period_end from the first subscription item (in clover API versions, it's on items, not subscription)
    const firstItem = activeSubscription?.items?.data?.[0];
    const currentPeriodEnd = firstItem?.current_period_end;

    return NextResponse.json({
      tier: highestTier,
      isActive: true,
      subscription: activeSubscription
        ? {
            id: activeSubscription.id,
            status: activeSubscription.status,
            currentPeriodEnd: currentPeriodEnd,
            cancelAtPeriodEnd: activeSubscription.cancel_at_period_end,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Stripe subscription check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check subscription' },
      { status: 500 }
    );
  }
}
