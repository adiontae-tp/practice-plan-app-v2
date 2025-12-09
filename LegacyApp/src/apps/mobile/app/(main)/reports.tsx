import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { TrendingUp, Clock, Calendar, Target, Lock } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { useSubscription } from '@/hooks/useSubscription';
import { TPUpgradeBanner } from '@/components/tp';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}

function StatCard({ icon, label, value, change, positive, locked }: StatCardProps & { locked?: boolean }) {
  return (
    <View className={`rounded-xl p-4 flex-1 min-w-[45%] ${locked ? 'bg-gray-50' : 'bg-white'}`}>
      <View className="flex-row items-center mb-2">
        {locked ? <Lock size={16} color={COLORS.textMuted} /> : icon}
        <Text className={`text-xs ml-2 uppercase ${locked ? 'text-gray-400' : 'text-typography-500'}`}>{label}</Text>
      </View>
      <Text className={`text-2xl font-bold ${locked ? 'text-gray-300' : 'text-typography-900'}`}>
        {locked ? '—' : value}
      </Text>
      {change && !locked && (
        <Text
          className={`text-xs mt-1 ${positive ? 'text-success-600' : 'text-error-600'}`}
        >
          {positive ? '↑' : '↓'} {change}
        </Text>
      )}
    </View>
  );
}

function ProgressBar({ label, value, max, locked }: { label: string; value: number; max: number; locked?: boolean }) {
  const percentage = Math.round((value / max) * 100);

  return (
    <View className="mb-4">
      <View className="flex-row justify-between mb-1">
        <Text className={`text-sm ${locked ? 'text-gray-400' : 'text-typography-700'}`}>{label}</Text>
        <Text className={`text-sm ${locked ? 'text-gray-300' : 'text-typography-500'}`}>
          {locked ? '—/—' : `${value}/${max}`}
        </Text>
      </View>
      <View className="h-2 bg-background-200 rounded-full overflow-hidden">
        <View
          className={`h-full rounded-full ${locked ? 'bg-gray-200' : 'bg-primary-500'}`}
          style={{ width: locked ? '30%' : `${percentage}%` }}
        />
      </View>
    </View>
  );
}

export default function ReportsScreen() {
  const { features } = useSubscription();
  const canViewAnalytics = features.canViewAnalytics;

  return (
    <>
      <Stack.Screen options={{ title: 'Reports' }} />

      {/* Upgrade Banner - shown when feature is locked */}
      {!canViewAnalytics && (
        <TPUpgradeBanner
          feature="canViewAnalytics"
          message="Upgrade to view analytics & reports"
        />
      )}

      <ScrollView className="flex-1 bg-background-200">
        <View className="p-4">
          {/* Stats Grid */}
          <Text className="text-xs font-semibold text-typography-500 uppercase mb-3 ml-1">
            This Month
          </Text>
          <View className="flex-row flex-wrap gap-3 mb-6">
            <StatCard
              icon={<Calendar size={16} color={COLORS.primary} />}
              label="Practices"
              value="12"
              change="20% vs last month"
              positive
              locked={!canViewAnalytics}
            />
            <StatCard
              icon={<Clock size={16} color={COLORS.tertiary} />}
              label="Total Hours"
              value="18h"
              change="15% vs last month"
              positive
              locked={!canViewAnalytics}
            />
            <StatCard
              icon={<Target size={16} color={COLORS.success} />}
              label="Completion"
              value="92%"
              locked={!canViewAnalytics}
            />
            <StatCard
              icon={<TrendingUp size={16} color={COLORS.secondary} />}
              label="Avg Duration"
              value="90 min"
              locked={!canViewAnalytics}
            />
          </View>

          {/* Activity Breakdown */}
          <Text className="text-xs font-semibold text-typography-500 uppercase mb-3 ml-1">
            Activity Breakdown
          </Text>
          <View className={`rounded-xl p-4 mb-6 ${canViewAnalytics ? 'bg-white' : 'bg-gray-50'}`}>
            <ProgressBar label="Offense" value={8} max={12} locked={!canViewAnalytics} />
            <ProgressBar label="Defense" value={6} max={12} locked={!canViewAnalytics} />
            <ProgressBar label="Conditioning" value={10} max={12} locked={!canViewAnalytics} />
            <ProgressBar label="Shooting" value={7} max={12} locked={!canViewAnalytics} />
          </View>

          {/* Recent Activity */}
          <Text className="text-xs font-semibold text-typography-500 uppercase mb-3 ml-1">
            Recent Practices
          </Text>
          <View className={`rounded-xl overflow-hidden ${canViewAnalytics ? 'bg-white' : 'bg-gray-50'}`}>
            {['Mon, Nov 25', 'Sat, Nov 23', 'Thu, Nov 21'].map((date, i) => (
              <View
                key={date}
                className={`p-4 flex-row justify-between ${i > 0 ? 'border-t border-outline-100' : ''}`}
              >
                <Text className={`text-sm ${canViewAnalytics ? 'text-typography-700' : 'text-gray-400'}`}>
                  {canViewAnalytics ? date : '—'}
                </Text>
                <Text className={`text-sm ${canViewAnalytics ? 'text-typography-500' : 'text-gray-300'}`}>
                  {canViewAnalytics ? '90 min' : '—'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
