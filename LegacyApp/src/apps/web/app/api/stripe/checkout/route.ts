import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[Stripe Checkout API] STRIPE_SECRET_KEY is not configured in environment variables');
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover',
  });
}

// Price IDs from Stripe (live mode)
const PRICE_IDS = {
  coach: 'price_1MNX0jEkGO3PThR9nSPJH3Ta', // $2.49/month
  organization: 'price_1SaQZmEkGO3PThR9LJe46XSb', // $14.99/month
};

// Trial periods in days
const TRIAL_DAYS = {
  coach: 14,
  organization: 30,
};

export async function POST(request: NextRequest) {
  const stripe = getStripe();

  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Please contact support.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { priceId, tier, userId, userEmail, successUrl, cancelUrl } = body;

    if (!priceId && !tier) {
      return NextResponse.json(
        { error: 'Price ID or tier is required' },
        { status: 400 }
      );
    }

    // Use tier to get price ID if not provided directly
    const selectedPriceId = priceId || PRICE_IDS[tier as keyof typeof PRICE_IDS];
    const trialDays = tier ? TRIAL_DAYS[tier as keyof typeof TRIAL_DAYS] : undefined;

    if (!selectedPriceId) {
      return NextResponse.json(
        { error: 'Invalid tier or price ID' },
        { status: 400 }
      );
    }

    // Check if customer already exists
    let customerId: string | undefined;
    if (userEmail) {
      const existingCustomers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      }
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${request.nextUrl.origin}/subscription?success=true`,
      cancel_url: cancelUrl || `${request.nextUrl.origin}/subscription?canceled=true`,
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      metadata: {
        userId: userId || '',
        tier: tier || '',
      },
      subscription_data: {
        metadata: {
          userId: userId || '',
          tier: tier || '',
        },
        // Add trial period if applicable
        ...(trialDays && { trial_period_days: trialDays }),
      },
      // Allow promotion codes
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
