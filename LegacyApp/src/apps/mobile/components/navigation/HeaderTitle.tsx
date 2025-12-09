import React from 'react';
import { View, Text, Image } from 'react-native';
import { useData } from '@/contexts/DataContext';
import { useTeamTheme } from '@/contexts/TeamThemeContext';

export const HeaderTitle = () => {
  const { team } = useData();
  const { colors } = useTeamTheme();

  return (
    <View className="flex-row items-center gap-2">
      {colors.logoUrl ? (
        <Image
          source={{ uri: colors.logoUrl }}
          className="w-8 h-8 rounded-lg"
          resizeMode="cover"
        />
      ) : null}
      <Text className="text-lg font-semibold text-white">
        {team?.name || 'No Team'}
      </Text>
    </View>
  );
};
