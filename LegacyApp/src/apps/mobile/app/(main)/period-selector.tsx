/**
 * Period Selector Modal
 * Route: /(main)/period-selector.tsx
 *
 * Tap-to-add period selection - can add the same period multiple times.
 * Shows auto-dismissing banner when a period is added.
 */
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  Animated,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { X, Search, Plus, Check, FileText, Tag as TagIcon } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { Period, Activity } from '@ppa/interfaces';
import { TPCard, TPEmpty, TPFooterButtons } from '@/components/tp';
import { useAppStore } from '@ppa/store';

// Helper functions
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Auto-dismissing banner component
interface AddedBannerProps {
  periodName: string;
  visible: boolean;
  onHide: () => void;
}

function AddedBanner({ periodName, visible, onHide }: AddedBannerProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 2 seconds
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => onHide());
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visible, opacity, translateY, onHide]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
        position: 'absolute',
        top: 0,
        left: 16,
        right: 16,
        zIndex: 100,
      }}
    >
      <View className="bg-green-500 rounded-lg px-4 py-3 flex-row items-center shadow-lg">
        <Check size={18} color="#ffffff" />
        <Text className="text-white font-medium ml-2 flex-1">
          Added "{periodName}"
        </Text>
      </View>
    </Animated.View>
  );
}

export default function PeriodSelectorScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [addedPeriods, setAddedPeriods] = useState<Activity[]>([]);
  const [bannerState, setBannerState] = useState<{
    visible: boolean;
    periodName: string;
  }>({ visible: false, periodName: '' });
  const [lastAddedPeriod, setLastAddedPeriod] = useState<string>('');
  const [checkingId, setCheckingId] = useState<string>('');

  // Get periods from store
  const periods = useAppStore((state) => state.periods);
  const periodsLoading = useAppStore((state) => state.periodsLoading);

  // Get store actions for passing data back
  const setSelectedPeriodActivities = useAppStore(
    (state) => state.setSelectedPeriodActivities
  );

  // Filter periods based on search
  const filteredPeriods = useMemo(() => {
    if (!searchQuery.trim()) return periods;

    const query = searchQuery.toLowerCase();
    return periods.filter(
      (period) =>
        period.name.toLowerCase().includes(query) ||
        period.notes?.toLowerCase().includes(query)
    );
  }, [searchQuery, periods]);

  // Sort periods by name
  const sortedPeriods = useMemo(() => {
    return [...filteredPeriods].sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredPeriods]);

  // Calculate total duration of added periods
  const totalDuration = useMemo(() => {
    return addedPeriods.reduce((sum, p) => sum + p.duration, 0);
  }, [addedPeriods]);

  // Count how many times each period has been added (by original period ID prefix)
  const periodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    addedPeriods.forEach((p) => {
      // Extract original period ID (before the timestamp)
      const originalId = p.id?.split('-').slice(0, 2).join('-') || '';
      counts[originalId] = (counts[originalId] || 0) + 1;
    });
    return counts;
  }, [addedPeriods]);

  // Handlers
  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleAddPeriod = useCallback((period: Period) => {
    // Create a new activity instance from the period
    const newActivity: Activity = {
      id: `${period.id}-${Date.now()}`,
      name: period.name,
      duration: period.duration,
      notes: period.notes || '',
      tags: period.tags || [],
      startTime: 0,
      endTime: 0,
    };

    setAddedPeriods((prev) => [...prev, newActivity]);
    setLastAddedPeriod(period.name);

    // Show check animation for half a second
    setCheckingId(period.id || '');
    setTimeout(() => {
      setCheckingId('');
    }, 500);

    // Show banner
    setBannerState({ visible: true, periodName: period.name });
  }, []);

  const handleHideBanner = useCallback(() => {
    setBannerState({ visible: false, periodName: '' });
  }, []);

  const handleDone = useCallback(() => {
    // Pass the added periods back via store
    if (addedPeriods.length > 0) {
      setSelectedPeriodActivities(addedPeriods);
    }
    router.back();
  }, [router, addedPeriods, setSelectedPeriodActivities]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-[#e0e0e0]">
        {/* Header with Safe Area */}
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#356793' }}>
          <View className="px-5 py-4">
            <View className="flex-row items-center justify-between">
              <Pressable onPress={handleClose} className="p-2 -ml-2">
                <X size={24} color="#ffffff" />
              </Pressable>
              <Text className="text-xl font-semibold text-white">Add Periods</Text>
              <View style={{ width: 28 }} />
            </View>
          </View>
        </SafeAreaView>

        {/* Content area with banner overlay */}
        <View className="flex-1 relative">
          {/* Auto-dismissing banner */}
          <AddedBanner
            periodName={bannerState.periodName}
            visible={bannerState.visible}
            onHide={handleHideBanner}
          />

          {/* Duration Banner */}
          <View className="mx-4 mt-4 bg-white rounded-xl px-4 py-3 border border-gray-200">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-gray-500 font-medium mb-0.5">Duration</Text>
                <Text className="text-lg font-semibold text-gray-900">
                  {formatDuration(totalDuration)}
                </Text>
              </View>
              {lastAddedPeriod && (
                <View className="flex-1 ml-4">
                  <Text className="text-xs text-gray-500 font-medium mb-0.5">Last Added</Text>
                  <Text className="text-sm font-semibold text-primary-600" numberOfLines={1}>
                    {lastAddedPeriod}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Search Bar */}
          <View className="px-4 pt-4">
            <View className="bg-white rounded-xl px-4 py-3 flex-row items-center">
              <Search size={20} color={COLORS.textMuted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search periods..."
                placeholderTextColor={COLORS.textMuted}
                className="flex-1 ml-3 text-base text-gray-900"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Periods List */}
          <ScrollView
            className="flex-1 px-4 pt-4"
            showsVerticalScrollIndicator={false}
          >
            {periodsLoading ? (
              <View className="py-8 items-center">
                <Text className="text-gray-500">Loading periods...</Text>
              </View>
            ) : sortedPeriods.length === 0 ? (
              <TPEmpty
                icon={FileText}
                title="No periods found"
                message={
                  searchQuery
                    ? 'Try a different search'
                    : 'Create periods in Period Templates'
                }
              />
            ) : (
              <View>
                {sortedPeriods.map((period) => {
                  const count = periodCounts[period.id || ''] || 0;
                  const isChecking = checkingId === period.id;

                  return (
                    <TouchableOpacity
                      key={period.id}
                      onPress={() => handleAddPeriod(period)}
                      activeOpacity={0.7}
                    >
                      <View className="bg-white rounded-xl p-4 mb-3">
                        {/* Header with name and notes button */}
                        <View className="flex-row items-center justify-between mb-3">
                          <Text className="text-base font-semibold text-gray-900 flex-1 pr-2">
                            {period.name}
                          </Text>
                          {period.notes && (
                            <TouchableOpacity
                              onPress={(e) => e.stopPropagation()}
                              className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center"
                            >
                              <FileText size={16} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* Add button and tags */}
                        <View className="flex-row items-center justify-between">
                          {/* Tags */}
                          {period.tags && period.tags.length > 0 && (
                            <View className="flex-row flex-wrap gap-1 flex-1">
                              {period.tags.map((tag, index) => (
                                <View key={index} className="bg-gray-100 rounded-full px-2 py-1">
                                  <Text className="text-xs text-gray-600 font-medium">
                                    {String(tag)}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          )}

                          {/* Add Button with animation */}
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              handleAddPeriod(period);
                            }}
                            className="ml-3 w-10 h-10 bg-primary-50 rounded-full items-center justify-center"
                          >
                            {isChecking ? (
                              <Check size={20} color="#10b981" strokeWidth={3} />
                            ) : (
                              <Plus size={20} color="#356793" />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Bottom padding */}
            <View className="h-32" />
          </ScrollView>
        </View>

        {/* Footer */}
        <TPFooterButtons
          mode="edit"
          onCancel={handleClose}
          onSave={handleDone}
          cancelLabel="Cancel"
          saveLabel={
            addedPeriods.length > 0
              ? `Done (${addedPeriods.length})`
              : 'Done'
          }
        />
      </View>
    </>
  );
}
