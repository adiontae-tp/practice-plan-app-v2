import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Search, X, Mail, Users, Lock } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { useAppStore } from '@ppa/store';
import type { Coach, CoachPermission } from '@ppa/interfaces';
import { TPFooterButtons, TPUpgradeBanner } from '@/components/tp';
import { useSubscription } from '@/hooks/useSubscription';
import { useCanAddCoach } from '@ppa/subscription';


interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
  return (
    <View className="bg-white rounded-xl px-4 py-3 flex-row items-center mb-4">
      <Search size={20} color={COLORS.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        className="flex-1 ml-3 text-base text-typography-900"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <X size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}


function PermissionBadge({ permission }: { permission?: CoachPermission }) {
  const labels = { admin: 'Admin', edit: 'Edit', view: 'View' };

  return (
    <View className="bg-gray-300 rounded-full px-3 py-1">
      <Text className="text-xs font-semibold text-gray-800">
        {permission ? labels[permission] : 'View'}
      </Text>
    </View>
  );
}

interface CoachCardProps {
  coach: Coach;
  onPress: () => void;
}

function CoachCard({ coach, onPress }: CoachCardProps) {
  // Extract name from email for display
  const displayName = coach.email
    .split('@')[0]
    .replace(/[._]/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3"
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-start flex-1">
          <View className="w-12 h-12 rounded-full bg-primary-500 items-center justify-center">
            <Text className="text-white font-semibold text-base">{initials}</Text>
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-base font-semibold text-typography-900">
              {displayName}
            </Text>
            <View className="flex-row items-center mt-1">
              <Mail size={12} color={COLORS.textMuted} />
              <Text className="text-sm text-typography-500 ml-1">{coach.email}</Text>
            </View>
          </View>
        </View>
        {/* Permission Badge in Top-Right */}
        <View className="ml-2">
          <PermissionBadge permission={coach.permission} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CoachesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Subscription check - use tier and coach limit
  const { tier, showPaywall } = useSubscription();
  const { subscription } = useAppStore();

  // Store state - coaches come from Firebase subscription
  const { coaches, coachesLoading, setCoach } = useAppStore();

  // Check if user can add more coaches
  const { canAdd, remaining, max } = useCanAddCoach(subscription.tier, coaches.length);

  // Filter coaches
  const filteredCoaches = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return coaches.filter(
      (coach) =>
        coach.email.toLowerCase().includes(query) ||
        (coach.permission && coach.permission.toLowerCase().includes(query)) ||
        (coach.status && coach.status.toLowerCase().includes(query))
    );
  }, [coaches, searchQuery]);

  // Handlers
  const handleAddCoach = useCallback(() => {
    // Check if user can add more coaches based on their subscription
    if (!canAdd) {
      showPaywall('maxAssistantCoaches');
      return;
    }
    setCoach(null);
    router.push('/coach-detail' as never);
  }, [router, setCoach, canAdd, showPaywall]);

  const handleCoachTap = useCallback(
    (coach: Coach) => {
      setCoach(coach);
      router.push('/coach-detail' as never);
    },
    [router, setCoach]
  );

  // Build upgrade message based on tier limits
  const getUpgradeMessage = () => {
    if (max === 0) return 'Upgrade to add assistant coaches';
    if (!canAdd) return `You've reached your limit of ${max} coaches. Upgrade for more.`;
    return `${remaining} of ${max} coach slots remaining`;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Coaches',
        }}
      />

      {/* Upgrade Banner - shown when at limit or free tier */}
      {!canAdd && (
        <TPUpgradeBanner
          feature="maxAssistantCoaches"
          message={getUpgradeMessage()}
        />
      )}

      <View className="flex-1 bg-background-200">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4">
            {/* Search Bar */}
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by email or permission..."
            />

            {/* Content */}
            {coachesLoading ? (
              // Loading state
              <View className="items-center justify-center py-20">
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text className="text-sm text-typography-500 mt-4">
                  Loading coaches...
                </Text>
              </View>
            ) : coaches.length === 0 ? (
              // Empty state - no coaches at all
              <View className="items-center justify-center py-20">
                <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                  <Users size={32} color={COLORS.textMuted} />
                </View>
                <Text className="text-lg font-semibold text-typography-700">
                  No coaches yet
                </Text>
                <Text className="text-sm text-typography-500 mt-1 text-center px-8">
                  Invite coaches to help manage your team
                </Text>
              </View>
            ) : filteredCoaches.length === 0 ? (
              // Empty search results
              <View className="items-center justify-center py-20">
                <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                  <Search size={32} color={COLORS.textMuted} />
                </View>
                <Text className="text-lg font-semibold text-typography-700">
                  No results found
                </Text>
                <Text className="text-sm text-typography-500 mt-1 text-center px-8">
                  Try a different search term
                </Text>
              </View>
            ) : (
              // Coach list
              <>
                <Text className="text-xs font-semibold text-typography-500 uppercase mb-3 ml-1">
                  {filteredCoaches.length}{' '}
                  {filteredCoaches.length === 1 ? 'Coach' : 'Coaches'}
                </Text>
                {filteredCoaches.map((coach) => (
                  <CoachCard
                    key={coach.id}
                    coach={coach}
                    onPress={() => handleCoachTap(coach)}
                  />
                ))}
              </>
            )}
          </View>
        </ScrollView>

        {/* Footer Button */}
        <TPFooterButtons
          mode="view"
          onCancel={() => router.back()}
          onEdit={handleAddCoach}
          cancelLabel="Close"
          editLabel="Add Coach"
          canEdit={true}
        />
      </View>
    </>
  );
}
