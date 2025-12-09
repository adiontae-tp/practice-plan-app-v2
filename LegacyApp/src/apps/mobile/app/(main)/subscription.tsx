import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, Linking } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ShieldCheck, ExternalLink, Check, AlertCircle, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TIER_NAMES, TIER_DESCRIPTIONS, PRICING, type SubscriptionTier } from '@ppa/subscription';
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

function ErrorBanner({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
      <View className="flex-row items-center gap-2 mb-2">
        <AlertCircle size={20} color="#d97706" />
        <Text className="font-medium text-amber-800">Connection Issue</Text>
      </View>
      <Text className="text-sm text-amber-700 mb-3">{message}</Text>
      <Pressable
        onPress={onRetry}
        disabled={retrying}
        className="flex-row items-center justify-center py-2 px-4 bg-amber-100 rounded-lg"
      >
        {retrying ? (
          <ActivityIndicator size="small" color="#d97706" />
        ) : (
          <>
            <RefreshCw size={16} color="#d97706" />
            <Text className="text-amber-800 font-medium ml-2">Retry</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

export default function SubscriptionScreen() {
  const params = useLocalSearchParams<{ success?: string; canceled?: string }>();

  const {
    tier: currentTier,
    purchase,
    restore,
    isLoading,
    initializationFailed,
    error: subscriptionError,
    refreshCustomerInfo,
    retryInitialization,
    clearError,
    getStripeProducts,
    openManagementPortal,
    getManagementInfo,
  } = useSubscription();

  const [restoring, setRestoring] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  // Handle deep link params (success/canceled from Stripe)
  useEffect(() => {
    if (params.success === 'true') {
      setSuccessMessage('Successfully subscribed! Welcome to your new plan.');
      refreshCustomerInfo();
    } else if (params.canceled === 'true') {
      setErrorMessage('Subscription was cancelled. You can try again anytime.');
    }
  }, [params.success, params.canceled, refreshCustomerInfo]);

  // Auto-dismiss messages
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

  // Load Stripe products on mount (static data, loads instantly)
  useEffect(() => {
    let mounted = true;
    getStripeProducts()
      .then((data) => {
        if (mounted) {
          setProducts(data);
          setProductsLoaded(true);
        }
      })
      .catch(console.error);
    return () => { mounted = false; };
  }, []);

  const handlePurchase = useCallback(
    async (tier: 'coach' | 'organization') => {
      setPurchasing(tier);

      try {
        const result = await purchase(tier);

        if (!result.success && result.error) {
          Alert.alert('Error', result.error);
        }
        // If successful, user was redirected to Stripe checkout
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
      } finally {
        setPurchasing(null);
      }
    },
    [purchase]
  );

  const handleRestorePurchases = async () => {
    setRestoring(true);
    try {
      await restore();
      Alert.alert(
        'Purchases Restored',
        'Your previous purchases have been restored successfully.'
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

  const handleRetryInitialization = async () => {
    setRetrying(true);
    clearError();
    try {
      await retryInitialization();
    } finally {
      setRetrying(false);
    }
  };

  const handleContactUs = () => {
    Linking.openURL('mailto:support@practiceplanapp.com?subject=Custom%20Plan%20Inquiry');
  };

  // Get pricing from Stripe products or fallback to static pricing
  const getProductPrice = (tier: 'coach' | 'organization'): string => {
    const product = products?.find((p) => p.tier === tier);
    if (product?.priceString) {
      return product.priceString;
    }
    return PRICING[tier].priceString;
  };

  const managementInfo = getManagementInfo();

  return (
    <>
      <Stack.Screen options={{ title: 'Subscription' }} />
      <View className="flex-1 bg-gray-50">
        {/* Success Banner */}
        {successMessage && (
          <View className="absolute top-4 left-4 right-4 z-50 flex-row items-center gap-2 bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
            <Check size={20} color="#16a34a" />
            <Text className="text-sm font-medium text-green-800 flex-1">{successMessage}</Text>
            <Pressable onPress={() => setSuccessMessage(null)}>
              <Text className="text-green-600 font-medium">✕</Text>
            </Pressable>
          </View>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <View className="absolute top-4 left-4 right-4 z-50 flex-row items-center gap-2 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
            <AlertCircle size={20} color="#dc2626" />
            <Text className="text-sm font-medium text-red-800 flex-1">{errorMessage}</Text>
            <Pressable onPress={() => setErrorMessage(null)}>
              <Text className="text-red-600 font-medium">✕</Text>
            </Pressable>
          </View>
        )}

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-5 pt-6 pb-8">
            {/* Current Plan Banner */}
            {currentTier !== 'free' && (
              <LinearGradient
                colors={['#356793', '#1e4a6e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl p-4 mb-6"
              >
                <View className="flex-row items-center p-2 mb-2">
                  <ShieldCheck size={24} color="white" />
                  <View className="ml-3 flex-1">
                    <Text className="text-sm text-white">Active Plan</Text>
                    <Text className="text-lg font-bold text-white">
                      {TIER_NAMES[currentTier]}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            )}

            {/* Header */}
            <View className="mt-4 mb-6">
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                Subscription Plans
              </Text>
              <Text className="text-base text-gray-600">
                Choose the plan that works best for your coaching needs
              </Text>
              <Text className="text-sm text-[#356793] mt-2">
                You are currently on the{' '}
                <Text className="font-medium">{TIER_NAMES[currentTier]}</Text> plan
              </Text>
            </View>

            {/* RevenueCat Error Banner */}
            {initializationFailed && subscriptionError && (
              <ErrorBanner
                message="Unable to connect to subscription services. You can still subscribe via our website."
                onRetry={handleRetryInitialization}
                retrying={retrying}
              />
            )}

            {/* Plan Cards */}
            {(['coach', 'organization'] as const).map((tier) => {
              const isCurrentPlan = currentTier === tier;
              const isPurchasing = purchasing === tier;
              const isPopular = tier === 'coach';

              return (
                <View
                  key={tier}
                  className={`rounded-2xl p-5 mb-4 ${
                    isPopular
                      ? 'border-2 border-primary-500 bg-white'
                      : 'border border-gray-200 bg-white'
                  } ${isCurrentPlan ? 'bg-gray-50' : ''}`}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  {isPopular && (
                    <View className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 px-3 py-1 rounded-full">
                      <Text className="text-xs font-semibold text-white">Most Popular</Text>
                    </View>
                  )}

                  <View className="items-center mb-4">
                    <Text className="text-xl font-bold text-gray-900 mt-2">
                      {TIER_NAMES[tier]}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1 text-center">
                      {TIER_DESCRIPTIONS[tier]}
                    </Text>

                    <View className="flex-row items-baseline mt-3">
                      <Text className="text-3xl font-bold text-gray-900">
                        {getProductPrice(tier)}
                      </Text>
                      <Text className="text-gray-500 ml-1">/month</Text>
                    </View>
                  </View>

                  {/* Feature List */}
                  <View className="mb-4">
                    {TIER_FEATURES[tier].map((feature, index) => (
                      <View key={index} className="flex-row items-start gap-2 mb-2">
                        <Check size={18} color="#22c55e" style={{ marginTop: 2 }} />
                        <Text className="text-sm text-gray-600 flex-1">{feature}</Text>
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
                          Subscribe
                        </Text>
                        <ExternalLink size={16} color="white" style={{ marginLeft: 6 }} />
                      </>
                    )}
                  </Pressable>
                </View>
              );
            })}

            {/* Subscription Actions */}
            <View className="mt-4 gap-3">
              {/* Manage Subscription Button - only for active subscribers */}
              {currentTier !== 'free' && (
                <Pressable
                  onPress={handleManageSubscription}
                  className="py-3 px-4 bg-gray-100 rounded-xl"
                >
                  <Text className="text-base text-gray-700 text-center font-medium">
                    {managementInfo.label}
                  </Text>
                  <Text className="text-xs text-gray-500 text-center mt-1">
                    {managementInfo.description}
                  </Text>
                </Pressable>
              )}

              {/* Restore Purchases */}
              <Pressable
                onPress={handleRestorePurchases}
                disabled={restoring || isLoading}
                className="py-3"
              >
                {restoring ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="#356793" />
                    <Text className="text-base text-[#356793] ml-2">Restoring...</Text>
                  </View>
                ) : (
                  <Text className="text-base text-[#356793] text-center font-medium">
                    Restore Purchases
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Terms */}
            <View className="mt-8 px-4">
              <Text className="text-xs text-gray-400 text-center leading-5">
                Subscriptions will auto-renew unless cancelled at least 24 hours before the
                end of the current period.
              </Text>
              <Pressable onPress={handleContactUs} className="mt-3">
                <Text className="text-xs text-[#356793] text-center">
                  Need a custom plan for your organization? Contact us
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
