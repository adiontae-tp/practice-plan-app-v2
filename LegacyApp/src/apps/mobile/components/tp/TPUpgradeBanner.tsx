/**
 * TPUpgradeBanner - Subtle banner prompting users to upgrade
 * Shows at the top of screens for free tier users
 */
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Sparkles, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@ppa/ui/branding';

export interface TPUpgradeBannerProps {
  /** Custom message to display */
  message?: string;
  /** Whether to show the banner (controlled externally) */
  visible?: boolean;
}

export function TPUpgradeBanner({ message, visible = true }: TPUpgradeBannerProps) {
  const router = useRouter();

  if (!visible) return null;

  return (
    <Pressable
      onPress={() => router.push('/(main)/subscription')}
      className="bg-primary-50 border-b border-primary-100 px-4 py-3 flex-row items-center"
    >
      <Sparkles size={18} color={COLORS.primary} />
      <Text className="text-sm text-primary-700 ml-2 flex-1" numberOfLines={1}>
        {message || 'Upgrade to unlock all features'}
      </Text>
      <View className="flex-row items-center">
        <Text className="text-sm font-semibold text-primary-600 mr-1">
          Upgrade
        </Text>
        <ChevronRight size={16} color={COLORS.primary} />
      </View>
    </Pressable>
  );
}

export default TPUpgradeBanner;
