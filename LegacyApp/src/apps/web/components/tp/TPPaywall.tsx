'use client';

import { useEffect, useState } from 'react';
import { Check, Sparkles, Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@ppa/store';
import {
  FEATURE_DISPLAY_NAMES,
  TIER_NAMES,
  TIER_DESCRIPTIONS,
  PRICING,
  type FeatureFlags,
  type SubscriptionTier,
} from '@ppa/subscription';
import { useSubscription } from '@/hooks/useSubscription';

/** Features to highlight for each tier */
const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
  free: ['1 Team', 'Basic practice planning', 'Period management'],
  coach: [
    'Everything in Free',
    'PDF Export',
    'Analytics Dashboard',
    'File Uploads (10GB)',
    'Templates Library',
    'Custom Tags',
    'Announcements',
    'Up to 5 Assistant Coaches',
  ],
  organization: [
    'Everything in Coach',
    'Unlimited Teams',
    'Unlimited Coaches',
    'Organization Dashboard',
    'Cross-team Template Sharing',
    'Team Branding',
    '50GB Storage',
    'Priority Support',
  ],
};

export function TPPaywall() {
  const {
    subscriptionShowPaywall,
    subscriptionPaywallFeature,
    hidePaywall,
  } = useAppStore();

  const {
    tier: currentTier,
    purchase,
    isLoading,
    getProducts,
    products,
    openManagementPortal,
    getManagementInfo,
  } = useSubscription();

  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load products when paywall opens
  useEffect(() => {
    if (subscriptionShowPaywall) {
      getProducts();
      setError(null);
    }
  }, [subscriptionShowPaywall, getProducts]);

  const handlePurchase = async (tier: 'coach' | 'organization') => {
    setPurchasing(tier);
    setError(null);

    try {
      const result = await purchase(tier);

      if (result.success) {
        // Stripe will redirect to checkout, so we don't need to hide paywall
        // It will be hidden when user returns from successful checkout
      } else if (result.error && !result.error.includes('cancelled')) {
        setError(result.error);
      }
    } catch (err: any) {
      if (!err.message?.includes('cancelled')) {
        setError(err.message || 'Purchase failed. Please try again.');
      }
    } finally {
      setPurchasing(null);
    }
  };

  const featureDisplayName = subscriptionPaywallFeature
    ? FEATURE_DISPLAY_NAMES[subscriptionPaywallFeature as keyof FeatureFlags] ||
      subscriptionPaywallFeature
    : null;

  // Get pricing from Stripe products or fallback to static pricing
  const getPackagePrice = (tier: SubscriptionTier): string => {
    const product = products?.find((p) => p.tier === tier);

    if (product?.priceString) {
      return product.priceString;
    }

    return PRICING[tier].priceString;
  };

  // Trial periods for each tier
  const TRIAL_DAYS: Record<'coach' | 'organization', number> = {
    coach: 14,
    organization: 30,
  };

  const renderPlanCard = (
    tier: 'coach' | 'organization',
    isPopular?: boolean
  ) => {
    const isCurrentPlan = currentTier === tier;
    const isPurchasing = purchasing === tier;
    const priceInfo = PRICING[tier];
    const trialDays = TRIAL_DAYS[tier];

    return (
      <div
        key={tier}
        className={`relative rounded-2xl border-2 p-6 transition-all ${
          isPopular
            ? 'border-primary-500 shadow-lg scale-105'
            : 'border-gray-200 hover:border-gray-300'
        } ${isCurrentPlan ? 'bg-gray-50' : 'bg-white'}`}
      >
        {isPopular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Most Popular
            </span>
          </div>
        )}

        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {TIER_NAMES[tier]}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {TIER_DESCRIPTIONS[tier]}
          </p>

          <div className="mt-4">
            <span className="text-4xl font-bold text-gray-900">
              {getPackagePrice(tier)}
            </span>
            {priceInfo.period && (
              <span className="text-gray-500">/{priceInfo.period}</span>
            )}
          </div>

          {/* Trial badge */}
          <div className="mt-2">
            <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
              {trialDays}-day free trial
            </span>
          </div>
        </div>

        <ul className="space-y-3 mb-6">
          {TIER_FEATURES[tier].map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={() => handlePurchase(tier)}
          disabled={isCurrentPlan || isPurchasing || isLoading}
          className={`w-full ${
            isPopular
              ? 'bg-primary-500 hover:bg-primary-600'
              : 'bg-gray-900 hover:bg-gray-800'
          }`}
        >
          {isPurchasing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processing...
            </>
          ) : isCurrentPlan ? (
            'Current Plan'
          ) : (
            `Start ${trialDays}-Day Free Trial`
          )}
        </Button>
      </div>
    );
  };

  return (
    <Dialog
      open={subscriptionShowPaywall}
      onOpenChange={(open) => !open && hidePaywall()}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl">Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            Unlock premium features to get the most out of Practice Plan App
          </DialogDescription>
        </DialogHeader>

        {featureDisplayName && (
          <div className="bg-primary-500/10 rounded-xl p-4 flex items-center gap-3 mx-auto max-w-md">
            <Sparkles className="w-6 h-6 text-primary-500" />
            <div>
              <p className="text-sm font-semibold text-primary-600">
                Unlock {featureDisplayName}
              </p>
              <p className="text-xs text-primary-500/80">
                Upgrade to access this premium feature
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <X className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {renderPlanCard('coach', true)}
          {renderPlanCard('organization')}
        </div>

        {/* Subscription Actions */}
        {currentTier !== 'free' && (
          <div className="text-center mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const opened = await openManagementPortal();
                if (!opened) {
                  setError('Unable to open subscription management. Please try again.');
                }
              }}
              className="text-gray-700"
            >
              {getManagementInfo().label}
            </Button>
            <p className="text-xs text-gray-400 mt-1">
              {getManagementInfo().description}
            </p>
          </div>
        )}

        {/* Terms */}
        <p className="text-xs text-gray-400 text-center mt-4">
          By subscribing, you agree to our Terms of Service and Privacy Policy.
          Subscriptions will auto-renew unless cancelled at least 24 hours
          before the end of the current period.
        </p>
      </DialogContent>
    </Dialog>
  );
}

export default TPPaywall;
