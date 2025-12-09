/**
 * Plan Share Screen
 * Route: /(main)/plan/[id]/share.tsx
 */
import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, Share, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  Share2,
  Copy,
  Mail,
  MessageCircle,
  Link as LinkIcon,
  Check,
  Loader2,
} from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { useAppStore } from '@ppa/store';
import { enablePlanSharing, disablePlanSharing } from '@ppa/firebase';
import { TPCard, TPButton } from '@/components/tp';

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

interface ShareOptionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onPress: () => void;
  disabled?: boolean;
}

function ShareOption({ icon, label, description, onPress, disabled }: ShareOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="flex-row items-center p-4 border-b border-gray-100 active:bg-gray-50"
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
        {icon}
      </View>
      <View className="flex-1 ml-3">
        <Text
          className="text-base font-medium"
          style={{ color: COLORS.textPrimary }}
        >
          {label}
        </Text>
        <Text className="text-sm" style={{ color: COLORS.textSecondary }}>
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

const WEB_BASE_URL = 'https://app.practiceplanapp.com';

export default function PlanShareScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const plans = useAppStore((state) => state.plans);
  const plansLoading = useAppStore((state) => state.plansLoading);
  const team = useAppStore((state) => state.team);

  const [isEnabling, setIsEnabling] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(() => {
    return plans.find((p) => p.id === id) || null;
  }, [plans, id]);

  React.useEffect(() => {
    if (plan?.shareToken && plan?.shareEnabled) {
      setShareUrl(`${WEB_BASE_URL}/share/${plan.shareToken}`);
    }
  }, [plan]);

  const handleEnableSharing = async () => {
    if (!plan || !team?.id) return;
    setIsEnabling(true);
    try {
      const token = await enablePlanSharing(team.id, plan.id);
      const url = `${WEB_BASE_URL}/share/${token}`;
      setShareUrl(url);
    } catch (error) {
      Alert.alert('Error', 'Failed to enable sharing. Please try again.');
    } finally {
      setIsEnabling(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) {
      await handleEnableSharing();
      return;
    }
    // Use Share API since expo-clipboard requires a development build
    try {
      await Share.share({
        message: shareUrl,
        title: 'Copy Link',
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // User cancelled
    }
  };

  const handleEmail = async () => {
    if (!plan) return;
    let url = shareUrl;
    if (!url) {
      if (!team?.id) return;
      setIsEnabling(true);
      try {
        const token = await enablePlanSharing(team.id, plan.id);
        url = `${WEB_BASE_URL}/share/${token}`;
        setShareUrl(url);
      } catch {
        Alert.alert('Error', 'Failed to enable sharing.');
        setIsEnabling(false);
        return;
      }
      setIsEnabling(false);
    }
    const subject = encodeURIComponent(`Practice Plan - ${formatDate(plan.startTime)}`);
    const body = encodeURIComponent(
      `Check out this practice plan:\n\n${formatDate(plan.startTime)} at ${formatTime(plan.startTime)}\n\n${url}`
    );
    await Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleMessage = async () => {
    if (!plan) return;
    let url = shareUrl;
    if (!url) {
      if (!team?.id) return;
      setIsEnabling(true);
      try {
        const token = await enablePlanSharing(team.id, plan.id);
        url = `${WEB_BASE_URL}/share/${token}`;
        setShareUrl(url);
      } catch {
        Alert.alert('Error', 'Failed to enable sharing.');
        setIsEnabling(false);
        return;
      }
      setIsEnabling(false);
    }
    const body = encodeURIComponent(`Practice Plan - ${formatDate(plan.startTime)}: ${url}`);
    await Linking.openURL(`sms:?body=${body}`);
  };

  const handleNativeShare = async () => {
    if (!plan) return;
    let url = shareUrl;
    if (!url) {
      if (!team?.id) return;
      setIsEnabling(true);
      try {
        const token = await enablePlanSharing(team.id, plan.id);
        url = `${WEB_BASE_URL}/share/${token}`;
        setShareUrl(url);
      } catch {
        Alert.alert('Error', 'Failed to enable sharing.');
        setIsEnabling(false);
        return;
      }
      setIsEnabling(false);
    }
    try {
      await Share.share({
        message: `Practice Plan - ${formatDate(plan.startTime)}: ${url}`,
        title: 'Practice Plan',
      });
    } catch {
      // User cancelled
    }
  };

  const handleDisableSharing = async () => {
    if (!plan || !team?.id) return;
    const teamId = team.id;
    Alert.alert(
      'Disable Sharing',
      'This will deactivate the share link. Anyone with the link will no longer be able to view the plan.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            try {
              await disablePlanSharing(teamId, plan.id);
              setShareUrl(null);
            } catch {
              Alert.alert('Error', 'Failed to disable sharing.');
            }
          },
        },
      ]
    );
  };

  if (plansLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: COLORS.background }}
      >
        <Text style={{ color: COLORS.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: COLORS.background }}
      >
        <Text style={{ color: COLORS.textSecondary }}>Practice not found</Text>
        <TPButton label="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Share Practice',
          headerBackTitle: 'Back',
        }}
      />

      <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
        <TPCard className="mx-4 mt-4">
          <View className="p-4">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-lg bg-primary-100 items-center justify-center">
                <Share2 size={24} color={COLORS.primary} />
              </View>
              <View className="flex-1 ml-3">
                <Text
                  className="text-base font-semibold"
                  style={{ color: COLORS.textPrimary }}
                >
                  {formatDate(plan.startTime)}
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: COLORS.textSecondary }}
                >
                  {formatTime(plan.startTime)} - {formatTime(plan.endTime)}
                </Text>
              </View>
            </View>
          </View>
        </TPCard>

        {!shareUrl && !isEnabling && (
          <View className="px-4 mt-4">
            <TPButton
              label="Enable Sharing"
              onPress={handleEnableSharing}
              isDisabled={isEnabling}
            />
            <Text
              className="text-sm text-center mt-3"
              style={{ color: COLORS.textMuted }}
            >
              Enable sharing to create a public link for this practice plan
            </Text>
          </View>
        )}

        {isEnabling && (
          <View className="px-4 mt-4 items-center">
            <Loader2 size={24} color={COLORS.primary} />
            <Text className="text-sm mt-2" style={{ color: COLORS.textSecondary }}>
              Creating share link...
            </Text>
          </View>
        )}

        {shareUrl && (
          <>
            <TPCard className="mx-4 mt-4">
              <ShareOption
                icon={copied ? <Check size={20} color={COLORS.success} /> : <Copy size={20} color={COLORS.textSecondary} />}
                label={copied ? 'Copied!' : 'Copy Link'}
                description={copied ? 'Link copied to clipboard' : 'Copy a shareable link to clipboard'}
                onPress={handleCopyLink}
              />
              <ShareOption
                icon={<Mail size={20} color={COLORS.textSecondary} />}
                label="Email"
                description="Send via email"
                onPress={handleEmail}
              />
              <ShareOption
                icon={<MessageCircle size={20} color={COLORS.textSecondary} />}
                label="Message"
                description="Send via text message"
                onPress={handleMessage}
              />
            </TPCard>

            <View className="px-4 mt-6">
              <TPButton
                label="More Options..."
                variant="outline"
                action="secondary"
                onPress={handleNativeShare}
              />
            </View>

            <View className="px-4 mt-6">
              <TPButton
                label="Disable Sharing"
                variant="outline"
                action="negative"
                onPress={handleDisableSharing}
              />
            </View>
          </>
        )}
      </View>
    </>
  );
}
