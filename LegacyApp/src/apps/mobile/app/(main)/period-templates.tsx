import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Search, X, Clipboard, Lock } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { useAppStore } from '@ppa/store';
import type { Period } from '@ppa/interfaces';
import { TPFooterButtons, TPPeriodCard, TPUpgradeBanner } from '@/components/tp';
import { useSubscription } from '@/hooks/useSubscription';

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



export default function PeriodTemplatesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Subscription check
  const { checkFeature, features } = useSubscription();
  const canCreatePeriods = features.canCreatePeriods;

  // Store state - periods come from Firebase subscription
  const { periods, periodsLoading, setSelectedTag } = useAppStore();

  // Filter and sort periods
  const filteredPeriods = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const filtered = periods.filter(
      (period) =>
        period.name.toLowerCase().includes(query) ||
        period.notes?.toLowerCase().includes(query)
    );
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [periods, searchQuery]);

  // Handlers
  const handleAddPeriod = useCallback(() => {
    // Check subscription before allowing period creation
    if (!checkFeature('canCreatePeriods')) {
      return; // Paywall will be shown automatically
    }
    setSelectedTag(null);
    router.push('/period-template-detail' as never);
  }, [router, setSelectedTag, checkFeature]);

  const handlePeriodTap = useCallback(
    (period: Period) => {
      setSelectedTag(period);
      router.push('/period-template-detail' as never);
    },
    [router, setSelectedTag]
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Period Templates',
        }}
      />

      {/* Upgrade Banner - shown when feature is locked */}
      {!canCreatePeriods && (
        <TPUpgradeBanner
          feature="canCreatePeriods"
          message="Upgrade to create custom periods"
        />
      )}

      <View className="flex-1 bg-background-200">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4">
            {/* Search Bar */}
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name or notes..."
            />

            {/* Content */}
            {periodsLoading ? (
              // Loading state
              <View className="items-center justify-center py-20">
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text className="text-sm text-typography-500 mt-4">
                  Loading period templates...
                </Text>
              </View>
            ) : periods.length === 0 ? (
              // Empty state - no periods at all
              <View className="items-center justify-center py-20">
                <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                  <Clipboard size={32} color={COLORS.textMuted} />
                </View>
                <Text className="text-lg font-semibold text-typography-700">
                  No period templates yet
                </Text>
                <Text className="text-sm text-typography-500 mt-1 text-center px-8">
                  Create your first period template to reuse in practice plans
                </Text>
              </View>
            ) : filteredPeriods.length === 0 ? (
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
              // Period list
              <>
                <Text className="text-xs font-semibold text-typography-500 uppercase mb-3 ml-1">
                  {filteredPeriods.length}{' '}
                  {filteredPeriods.length === 1 ? 'Template' : 'Templates'}
                </Text>
                {filteredPeriods.map((period) => (
                  <TPPeriodCard
                    key={period.id}
                    period={period}
                    onPress={() => handlePeriodTap(period)}
                    showNotesIndicator={true}
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
          onEdit={handleAddPeriod}
          cancelLabel="Close"
          editLabel="Add Period Template"
          canEdit={true}
        />
      </View>
    </>
  );
}
