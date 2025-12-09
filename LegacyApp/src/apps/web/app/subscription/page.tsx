'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, CheckCircle, X, Loader2, Beaker, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubscriptionPageSkeleton } from '@/components/tp/subscription';
import { useSubscription } from '@/hooks/useSubscription';
import { useAppStore } from '@ppa/store';
import {
  TIER_NAMES,
  TIER_DESCRIPTIONS,
  PRICING,
  type SubscriptionTier,
} from '@ppa/subscription';

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

export default function SubscriptionPage() {
  const searchParams = useSearchParams();
  const {
    tier: currentTier,
    actualTier,
    purchase,
    refreshSubscription,
    isLoading: subscriptionLoading,
    getProducts,
    products,
    productsLoading,
    isTestUser,
    tierOverride,
    setTierOverride,
    openManagementPortal,
    getManagementInfo,
  } = useSubscription();

  const { setBackDestination, clearBackNavigation } = useAppStore();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check for success/cancel from Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      setSuccessMessage('Successfully subscribed! Syncing your subscription...');
      // Clear URL params immediately
      window.history.replaceState({}, '', '/subscription');

      // Refresh with retries - RevenueCat may take a moment to sync from Stripe
      const refreshWithRetry = async () => {
        // First attempt immediately
        await refreshSubscription();

        // Check if still on free tier, retry after delay
        // RevenueCat Stripe integration can take 5-10 seconds to sync
        setTimeout(async () => {
          await refreshSubscription();
          setSuccessMessage('Subscription synced! Welcome to your new plan.');
        }, 5000);
      };

      refreshWithRetry();
    } else if (canceled === 'true') {
      setErrorMessage('Subscription was cancelled. You can try again anytime.');
      window.history.replaceState({}, '', '/subscription');
    }
  }, [searchParams, refreshSubscription]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Configure mobile back button to always go to menu
  useEffect(() => {
    setBackDestination('/menu');
    return () => clearBackNavigation();
  }, [setBackDestination, clearBackNavigation]);

  // Load products on mount
  useEffect(() => {
    if (!isPageLoading) {
      getProducts();
    }
  }, [isPageLoading, getProducts]);

  const handlePurchase = async (tier: 'coach' | 'organization') => {
    setPurchasing(tier);
    setErrorMessage(null);

    try {
      const result = await purchase(tier);

      // If success, user will be redirected to Stripe
      if (!result.success && result.error) {
        setErrorMessage(result.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  // Get pricing from Stripe products or fallback to static pricing
  const getProductPrice = (tier: SubscriptionTier): string => {
    const product = products.find((p) => p.tier === tier);

    if (product?.priceString) {
      return product.priceString;
    }

    return PRICING[tier].priceString;
  };

  const renderPlanCard = (
    tier: 'coach' | 'organization',
    isPopular?: boolean
  ) => {
    const isCurrentPlan = currentTier === tier;
    const isPurchasing = purchasing === tier;
    const priceInfo = PRICING[tier];

    return (
      <div
        key={tier}
        className={`relative rounded-2xl border-2 p-6 transition-all ${
          isPopular
            ? 'border-[#356793] shadow-lg md:scale-105'
            : 'border-gray-200 hover:border-gray-300'
        } ${isCurrentPlan ? 'bg-gray-50' : 'bg-white'}`}
      >
        {isPopular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-[#356793] text-white text-xs font-semibold px-3 py-1 rounded-full">
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
            {productsLoading ? (
              <div className="h-10 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                <span className="text-4xl font-bold text-gray-900">
                  {getProductPrice(tier)}
                </span>
                {priceInfo.period && (
                  <span className="text-gray-500">/{priceInfo.period}</span>
                )}
              </>
            )}
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
          disabled={isCurrentPlan || isPurchasing || subscriptionLoading}
          className={`w-full ${
            isPopular
              ? 'bg-[#356793] hover:bg-[#2a5275]'
              : 'bg-gray-900 hover:bg-gray-800'
          }`}
        >
          {isPurchasing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Redirecting to checkout...
            </>
          ) : isCurrentPlan ? (
            'Current Plan'
          ) : (
            'Subscribe'
          )}
        </Button>
      </div>
    );
  };

  if (isPageLoading) {
    return <SubscriptionPageSkeleton />;
  }

  return (
    <>
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-2 text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          <X className="w-5 h-5 text-red-600" />
          <span className="text-sm font-medium">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="ml-2 text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-600 mt-2">
            Choose the plan that works best for your coaching needs
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <p className="text-sm text-[#356793]">
              You are currently on the <span className="font-medium">{TIER_NAMES[actualTier || currentTier]}</span> plan
              {tierOverride && (
                <span className="text-amber-600 ml-1">(testing as {TIER_NAMES[tierOverride]})</span>
              )}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshSubscription}
              disabled={subscriptionLoading}
              className="text-gray-400 hover:text-gray-600 p-1 h-auto"
              title="Refresh subscription status"
            >
              <RefreshCw className={`w-4 h-4 ${subscriptionLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {isTestUser && setTierOverride && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Beaker className="w-5 h-5 text-amber-600" />
              <span className="font-medium text-amber-800">Tier Testing Mode</span>
            </div>
            <p className="text-sm text-amber-700 mb-3">
              As a test user, you can simulate different subscription tiers to test feature access.
            </p>
            <div className="flex flex-wrap gap-2">
              {(['free', 'coach', 'organization'] as SubscriptionTier[]).map((tier) => (
                <Button
                  key={tier}
                  variant={tierOverride === tier ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTierOverride(tierOverride === tier ? null : tier)}
                  className={tierOverride === tier ? 'bg-amber-600 hover:bg-amber-700' : ''}
                >
                  {TIER_NAMES[tier]}
                  {tierOverride === tier && ' (Active)'}
                </Button>
              ))}
              {tierOverride && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTierOverride(null)}
                  className="text-amber-700"
                >
                  Reset to actual tier
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {renderPlanCard('coach', true)}
          {renderPlanCard('organization')}
        </div>

        {/* Subscription Actions */}
        <div className="text-center space-y-2">
          {(actualTier || currentTier) !== 'free' && (
            <div>
              <Button
                variant="outline"
                onClick={async () => {
                  const opened = await openManagementPortal();
                  if (!opened) {
                    setErrorMessage('Unable to open subscription management. Please try again.');
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
        </div>

        <div className="text-center text-sm text-gray-500 max-w-2xl mx-auto space-y-2">
          <p>
            Subscriptions will auto-renew unless cancelled at least 24 hours before the end
            of the current period.
          </p>
          <p>
            Need a custom plan for your organization?{' '}
            <a href="/help" className="text-[#356793] hover:underline">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
