import React from 'react';
import { View, Text } from 'react-native';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';

export const EmptyState = React.memo(() => {
  return (
    <View className="flex-1 items-center justify-center px-10">
      <CalendarIcon size={64} color={COLORS.textMuted} />
      <Text className="text-xl font-semibold text-center mt-4" style={{ color: COLORS.textPrimary }}>
        No practices this week
      </Text>
      <Text className="text-base text-center mt-2" style={{ color: COLORS.textSecondary }}>
        Schedule a practice to see it here
      </Text>
    </View>
  );
});

EmptyState.displayName = 'EmptyState';
