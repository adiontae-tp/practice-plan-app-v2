import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover',
  });
}

function getWebhookSecret() {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }
  return process.env.STRIPE_WEBHOOK_SECRET;
}

// Map Stripe product IDs to tiers
const PRODUCT_TO_TIER: Record<string, 'coach' | 'organization'> = {
  'prod_MoC3n1zPGfPDUe': 'coach',
  'prod_TXVaDvv8HTviEb': 'organization',
};

/**
 * Sync subscription status to RevenueCat
 * This ensures RevenueCat has accurate entitlement data for Stripe purchases
 */
async function syncToRevenueCat(
  customerId: string,
  customerEmail: string | null,
  subscription: Stripe.Subscription,
  eventType: string
) {
  const revenueCatApiKey = process.env.REVENUECAT_API_KEY;

  if (!revenueCatApiKey) {
    console.warn('[Stripe Webhook] REVENUECAT_API_KEY not configured, skipping sync');
    return;
  }

  // Get the user ID from subscription metadata or use customer ID
  const userId = subscription.metadata?.userId || customerId;

  // Determine the product/tier
  let productId: string | null = null;
  for (const item of subscription.items.data) {
    const stripeProdId = typeof item.price.product === 'string'
      ? item.price.product
      : item.price.product.id;
    if (PRODUCT_TO_TIER[stripeProdId]) {
      productId = stripeProdId;
      break;
    }
  }

  if (!productId) {
    console.warn('[Stripe Webhook] No matching product found in subscription');
    return;
  }

  console.log(`[Stripe Webhook] Syncing ${eventType} for user ${userId}, product ${productId}`);

  // RevenueCat will automatically sync via Stripe integration
  // This log helps with debugging
  console.log('[Stripe Webhook] RevenueCat will sync via Stripe integration');
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = getWebhookSecret();
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('[Stripe Webhook] Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('[Stripe Webhook] Signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('[Stripe Webhook] Checkout completed:', {
          sessionId: session.id,
          customerId: session.customer,
          subscriptionId: session.subscription,
          customerEmail: session.customer_email,
          metadata: session.metadata,
        });

        // Fetch subscription details if available
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          await syncToRevenueCat(
            session.customer as string,
            session.customer_email,
            subscription,
            'checkout.session.completed'
          );
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('[Stripe Webhook] Subscription created:', {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
          items: subscription.items.data.map(i => ({
            priceId: i.price.id,
            productId: i.price.product,
          })),
        });

        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const email = (customer as Stripe.Customer).email;

        await syncToRevenueCat(
          subscription.customer as string,
          email,
          subscription,
          'customer.subscription.created'
        );
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('[Stripe Webhook] Subscription updated:', {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });

        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const email = (customer as Stripe.Customer).email;

        await syncToRevenueCat(
          subscription.customer as string,
          email,
          subscription,
          'customer.subscription.updated'
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('[Stripe Webhook] Subscription deleted:', {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
        });

        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const email = (customer as Stripe.Customer).email;

        await syncToRevenueCat(
          subscription.customer as string,
          email,
          subscription,
          'customer.subscription.deleted'
        );
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('[Stripe Webhook] Invoice paid:', {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          subscriptionId: invoice.parent?.subscription_details?.subscription,
          amountPaid: invoice.amount_paid,
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('[Stripe Webhook] Invoice payment failed:', {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          subscriptionId: invoice.parent?.subscription_details?.subscription,
        });
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
