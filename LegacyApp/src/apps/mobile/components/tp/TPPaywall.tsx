/**
 * TPPaywall - Subscription paywall component
 * Uses Stripe checkout for all new purchases
 * Displays pricing and redirects to Stripe in browser
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { Sparkles, Check, ExternalLink } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import {
  FEATURE_DISPLAY_NAMES,
  TIER_NAMES,
  TIER_DESCRIPTIONS,
  PRICING,
  type FeatureFlags,
  type SubscriptionTier,
} from '@ppa/subscription';
import { useSubscription } from '@/hooks/useSubscription';
import type { StripeProduct } from '@/services/stripe';

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

export interface TPPaywallProps {
  visible: boolean;
  onClose: () => void;
  feature?: string | null;
}

export function TPPaywall({ visible, onClose, feature }: TPPaywallProps) {
  const {
    tier: currentTier,
    purchase,
    restore,
    isLoading,
    getStripeProducts,
    openManagementPortal,
    getManagementInfo,
  } = useSubscription();

  const [restoring, setRestoring] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Load Stripe products when paywall opens
  useEffect(() => {
    if (visible) {
      setProductsLoading(true);
      getStripeProducts()
        .then(setProducts)
        .catch(console.error)
        .finally(() => setProductsLoading(false));
    }
  }, [visible, getStripeProducts]);

  const handlePurchase = useCallback(
    async (tier: 'coach' | 'organization') => {
      setPurchasing(tier);

      try {
        const result = await purchase(tier);

        if (result.success) {
          // User was redirected to Stripe checkout in browser
          // Close the paywall - they'll return via deep link
          onClose();
        } else if (result.error && !result.error.includes('cancelled')) {
          Alert.alert('Purchase Failed', result.error);
        }
      } catch (err: any) {
        if (!err.message?.includes('cancelled')) {
          Alert.alert('Error', err.message || 'Purchase failed. Please try again.');
        }
      } finally {
        setPurchasing(null);
      }
    },
    [purchase, onClose]
  );

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await restore();
      Alert.alert(
        'Purchases Restored',
        'Your previous purchases have been restored successfully.',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (err: any) {
      Alert.alert(
        'Restore Failed',
        err.message || 'Failed to restore purchases. Please try again.'
      );
    } finally {
      setRestoring(false);
    }
  };

  const handleManageSubscription = async () => {
    await openManagementPortal();
  };

  const featureDisplayName = feature
    ? FEATURE_DISPLAY_NAMES[feature as keyof FeatureFlags] || feature
    : null;

  // Get pricing from Stripe products or fallback to static pricing
  const getPackagePrice = (tier: SubscriptionTier): string => {
    const product = products?.find((p) => p.tier === tier);

    if (product?.priceString) {
      return product.priceString;
    }

    return PRICING[tier].priceString;
  };

  if (!visible) {
    return null;
  }

  // Trial periods for each tier
  const TRIAL_DAYS: Record<'coach' | 'organization', number> = {
    coach: 14,
    organization: 30,
  };

  const renderPlanCard = (tier: 'coach' | 'organization', isPopular?: boolean) => {
    const isCurrentPlan = currentTier === tier;
    const isPurchasing = purchasing === tier;
    const priceInfo = PRICING[tier];
    const trialDays = TRIAL_DAYS[tier];

    return (
      <View
        key={tier}
        className={`rounded-2xl p-5 mb-4 ${
          isPopular ? 'border-2 border-primary-500 bg-white' : 'border border-gray-200 bg-white'
        } ${isCurrentPlan ? 'bg-gray-50' : ''}`}
      >
        {isPopular && (
          <View className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 px-3 py-1 rounded-full">
            <Text className="text-xs font-semibold text-white">Most Popular</Text>
          </View>
        )}

        <View className="items-center mb-4">
          <Text className="text-xl font-bold text-gray-900">{TIER_NAMES[tier]}</Text>
          <Text className="text-sm text-gray-500 mt-1 text-center">
            {TIER_DESCRIPTIONS[tier]}
          </Text>

          <View className="flex-row items-baseline mt-3">
            {productsLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <>
                <Text className="text-3xl font-bold text-gray-900">
                  {getPackagePrice(tier)}
                </Text>
                {priceInfo.period && (
                  <Text className="text-gray-500 ml-1">/{priceInfo.period}</Text>
                )}
              </>
            )}
          </View>

          {/* Trial badge */}
          <View className="mt-2 bg-green-100 px-2.5 py-1 rounded-full">
            <Text className="text-xs font-medium text-green-700">
              {trialDays}-day free trial
            </Text>
          </View>
        </View>

        <View className="mb-4">
          {TIER_FEATURES[tier].map((featureItem, index) => (
            <View key={index} className="flex-row items-start py-1.5">
              <Check size={18} color="#22c55e" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">{featureItem}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => handlePurchase(tier)}
          disabled={isCurrentPlan || isPurchasing || isLoading}
          className={`py-3.5 rounded-xl items-center flex-row justify-center ${
            isCurrentPlan
              ? 'bg-gray-200'
              : isPopular
              ? 'bg-primary-500'
              : 'bg-gray-900'
          }`}
        >
          {isPurchasing ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-base font-semibold text-white ml-2">
                Opening checkout...
              </Text>
            </View>
          ) : isCurrentPlan ? (
            <Text className="text-base font-semibold text-gray-500">
              Current Plan
            </Text>
          ) : (
            <>
              <Text className="text-base font-semibold text-white">
                Start {trialDays}-Day Free Trial
              </Text>
              <ExternalLink size={16} color="white" style={{ marginLeft: 6 }} />
            </>
          )}
        </Pressable>
      </View>
    );
  };

  return (
    <View className="absolute inset-0 bg-black/50 justify-end">
      <View className="bg-white rounded-t-3xl max-h-[90%]">
        {/* Header */}
        <View className="p-5 border-b border-gray-100">
          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-bold text-gray-900">Upgrade Your Plan</Text>
            <Pressable onPress={onClose} className="p-2">
              <Text className="text-base text-gray-500">Close</Text>
            </Pressable>
          </View>
          <Text className="text-sm text-gray-500 mt-1">
            Unlock premium features for your coaching
          </Text>
        </View>

        <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
          {featureDisplayName && (
            <View className="bg-primary-50 rounded-xl p-4 my-4 flex-row items-center">
              <Sparkles size={24} color={COLORS.primary} />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-primary-700">
                  Unlock {featureDisplayName}
                </Text>
                <Text className="text-xs text-primary-600 mt-0.5">
                  Upgrade to access this premium feature
                </Text>
              </View>
            </View>
          )}

          <View className="py-4">
            {renderPlanCard('coach', true)}
            {renderPlanCard('organization')}
          </View>

          {/* Manage Subscription (for existing subscribers) */}
          {currentTier !== 'free' && (
            <Pressable
              onPress={handleManageSubscription}
              className="py-4 items-center"
            >
              <Text className="text-base text-primary-500 font-medium">
                {getManagementInfo().label}
              </Text>
              <Text className="text-xs text-gray-400 mt-1 text-center">
                {getManagementInfo().description}
              </Text>
            </Pressable>
          )}

          {/* Restore Purchases */}
          <Pressable
            onPress={handleRestore}
            disabled={restoring || isLoading}
            className="py-4 items-center"
          >
            {restoring ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text className="text-base text-primary-500 ml-2">Restoring...</Text>
              </View>
            ) : (
              <Text className="text-base text-primary-500 font-medium">
                Restore Purchases
              </Text>
            )}
          </Pressable>

          {/* Terms */}
          <View className="pb-8 px-4">
            <Text className="text-xs text-gray-400 text-center leading-5">
              By subscribing, you agree to our Terms of Service and Privacy Policy.
              {'\n\n'}
              You will be redirected to our secure payment page to complete your purchase.
              Subscriptions will auto-renew unless cancelled.
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

export default TPPaywall;
