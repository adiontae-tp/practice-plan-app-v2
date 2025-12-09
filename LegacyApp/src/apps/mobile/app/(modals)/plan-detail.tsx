// mobile build test
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { X, Check } from 'lucide-react-native';
import { useSubscription } from '@/hooks/useSubscription';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Perfect for coaches evaluating the platform or with basic planning needs',
    features: [
      { text: 'Up to 3 practice plans', included: true },
      { text: 'View & use templates', included: true, detail: 'Read-only access' },
      { text: 'Basic calendar view', included: true },
      { text: 'View team announcements', included: true },
      { text: 'Activity time tracking', included: true },
      { text: 'PDF export', included: false },
      { text: 'Custom templates & periods', included: false },
      { text: 'Analytics & reports', included: false },
      { text: 'Assistant coaches', included: false },
      { text: 'File uploads', included: false },
    ],
    entitlement: 0,
  },
  {
    id: 'coach',
    name: 'Head Coach',
    price: 2.49,
    description: 'Professional tools for serious coaches who want to elevate their practice planning',
    features: [
      { text: 'Unlimited practice plans', included: true },
      { text: 'Custom templates & periods', included: true, detail: 'Build your own library' },
      { text: 'PDF export', included: true, detail: '3 professional styles' },
      { text: 'Period & tag analytics', included: true, detail: 'Visual charts & insights' },
      { text: 'Up to 5 assistant coaches', included: true, detail: '3 permission levels' },
      { text: 'File uploads & management', included: true, detail: 'Up to 10GB storage' },
      { text: 'Recurring practice scheduling', included: true },
      { text: 'Team branding', included: true, detail: 'Colors & logo' },
      { text: 'Priority support', included: true },
      { text: 'Multiple teams', included: false },
    ],
    popular: true,
    entitlement: 1,
  },
  {
    id: 'organization',
    name: 'Organization',
    price: 14.99,
    description: 'Manage multiple teams with shared resources and centralized oversight',
    features: [
      { text: 'Everything in Head Coach', included: true },
      { text: 'Multiple teams', included: true, detail: 'Switch easily between teams' },
      { text: 'Unlimited assistant coaches', included: true },
      { text: 'Shared template library', included: true, detail: 'Organization-wide' },
      { text: 'Shared period library', included: true, detail: 'Best practices across teams' },
      { text: 'Cross-team coach assignments', included: true },
      { text: 'Organization branding', included: true },
      { text: '50GB file storage', included: true },
      { text: 'Priority customer support', included: true },
    ],
    entitlement: 2,
  },
];

export default function PlanDetailModal() {
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const plan = plans.find((p) => p.id === planId);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Get real subscription state from hook
  const {
    entitlement: currentEntitlement,
    purchaseCoach,
    purchaseOrganization,
    openManagementPortal,
  } = useSubscription();

  if (!plan) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Text className="text-lg text-gray-600">Plan not found</Text>
      </View>
    );
  }

  const isCurrentPlan = plan.entitlement === currentEntitlement;
  const isUpgrade = plan.entitlement > currentEntitlement;
  const isDowngrade = plan.entitlement < currentEntitlement;

  const getButtonAction = () => {
    if (isCurrentPlan) return 'Current Plan';
    if (isUpgrade) return `Upgrade to ${plan.name}`;
    return `Downgrade to ${plan.name}`;
  };

  const handleSubscribe = useCallback(async () => {
    if (isCurrentPlan) return;

    // For downgrades or managing subscription, open portal
    if (isDowngrade) {
      await openManagementPortal();
      return;
    }

    setIsPurchasing(true);
    try {
      let result;
      if (plan.id === 'coach') {
        result = await purchaseCoach();
      } else if (plan.id === 'organization') {
        result = await purchaseOrganization();
      } else {
        // Free tier - just go back
        router.back();
        return;
      }

      if (!result.success) {
        Alert.alert('Purchase Error', result.error || 'Failed to complete purchase. Please try again.');
      }
      // On success, user will be redirected to Stripe checkout in browser
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setIsPurchasing(false);
    }
  }, [isCurrentPlan, isDowngrade, plan.id, purchaseCoach, purchaseOrganization, openManagementPortal, router]);

  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="px-5 pt-12 pb-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-gray-900">{plan.name}</Text>
            <Pressable onPress={() => router.back()} className="p-2">
              <X size={24} color="#6B7280" />
            </Pressable>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-5 py-6">
            {/* Price */}
            <View className="mb-6">
              {plan.price === 0 ? (
                <Text className="text-4xl font-bold text-gray-900">Free</Text>
              ) : (
                <View className="flex-row items-baseline">
                  <Text className="text-4xl font-bold text-gray-900">${plan.price}</Text>
                  <Text className="text-lg text-gray-500 ml-2">/month</Text>
                </View>
              )}
              <Text className="text-base text-gray-600 mt-3">{plan.description}</Text>
            </View>

            {/* Features Section */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-4">What's Included</Text>
              <View className="space-y-3">
                {plan.features.map((feature, index) => (
                  <View key={index} className="flex-row mb-3">
                    <View className="mr-3 mt-1">
                      {feature.included ? (
                        <View className="w-5 h-5 rounded-full bg-green-100 items-center justify-center">
                          <Check size={14} color="#22C55E" strokeWidth={3} />
                        </View>
                      ) : (
                        <View className="w-5 h-5 rounded-full bg-gray-100 items-center justify-center">
                          <X size={14} color="#9CA3AF" strokeWidth={2} />
                        </View>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-base ${
                          feature.included ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {feature.text}
                      </Text>
                      {feature.detail && (
                        <Text className="text-sm text-gray-500 mt-1">{feature.detail}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer Button */}
        <View className="px-5 pb-8 pt-4 border-t border-gray-200">
          <Pressable
            onPress={handleSubscribe}
            disabled={isCurrentPlan || isPurchasing}
            className={`py-4 rounded-lg flex-row items-center justify-center ${
              isCurrentPlan || isPurchasing ? 'bg-gray-200' : 'bg-[#356793]'
            }`}
          >
            {isPurchasing ? (
              <ActivityIndicator size="small" color="#6B7280" />
            ) : (
              <Text
                className={`text-center font-semibold text-base ${
                  isCurrentPlan ? 'text-gray-500' : 'text-white'
                }`}
              >
                {getButtonAction()}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </>
  );
}
