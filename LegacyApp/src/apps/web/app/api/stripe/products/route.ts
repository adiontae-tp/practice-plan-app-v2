import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Product configuration (live mode)
const PRODUCTS = {
  coach: {
    productId: 'prod_MoC3n1zPGfPDUe',
    priceId: 'price_1MNX0jEkGO3PThR9nSPJH3Ta', // $2.49/month with 14-day trial
  },
  organization: {
    productId: 'prod_TXVaDvv8HTviEb',
    priceId: 'price_1SaQZmEkGO3PThR9LJe46XSb', // $14.99/month
  },
};

// Fallback products when Stripe is unavailable (e.g., missing API key)
const FALLBACK_PRODUCTS = [
  {
    tier: 'coach',
    productId: PRODUCTS.coach.productId,
    priceId: PRODUCTS.coach.priceId,
    name: 'Coach',
    description: 'For individual coaches and small teams',
    price: 2.49,
    priceString: '$2.49',
    currency: 'USD',
    interval: 'month',
    images: [],
  },
  {
    tier: 'organization',
    productId: PRODUCTS.organization.productId,
    priceId: PRODUCTS.organization.priceId,
    name: 'Organization',
    description: 'For sports organizations with multiple teams',
    price: 14.99,
    priceString: '$14.99',
    currency: 'USD',
    interval: 'month',
    images: [],
  },
];

// Lazy initialization to avoid build-time errors
function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[Stripe Products API] STRIPE_SECRET_KEY is not configured in environment variables');
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover',
  });
}

export async function GET() {
  const stripe = getStripe();

  // If Stripe is not configured, return fallback products
  if (!stripe) {
    console.warn('[Stripe Products API] Returning fallback products - Stripe not configured');
    return NextResponse.json({ products: FALLBACK_PRODUCTS });
  }

  try {
    const products = await Promise.all(
      Object.entries(PRODUCTS).map(async ([tier, { productId, priceId }]) => {
        const [product, price] = await Promise.all([
          stripe.products.retrieve(productId),
          stripe.prices.retrieve(priceId),
        ]);

        return {
          tier,
          productId: product.id,
          priceId: price.id,
          name: product.name,
          description: product.description,
          price: price.unit_amount ? price.unit_amount / 100 : 0,
          priceString: price.unit_amount
            ? `$${(price.unit_amount / 100).toFixed(2)}`
            : 'Free',
          currency: price.currency.toUpperCase(),
          interval: price.recurring?.interval || null,
          images: product.images,
        };
      })
    );

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('[Stripe Products API] Error fetching from Stripe:', error.message);
    // Return fallback products on error so the UI still works
    console.warn('[Stripe Products API] Returning fallback products due to error');
    return NextResponse.json({ products: FALLBACK_PRODUCTS });
  }
}
