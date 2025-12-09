import React from 'react';
import { View, Text } from 'react-native';
import { formatDayAbbreviation, formatDateNumber } from '@/utils/calendar.utils';

interface DateAvatarProps {
  date: Date;
}

export const DateAvatar = React.memo(({ date }: DateAvatarProps) => {
  const dayAbbr = formatDayAbbreviation(date);
  const dateNum = formatDateNumber(date);

  return (
    <View className="w-14 h-14 rounded-lg bg-gray-100 items-center justify-center">
      <Text className="text-xs text-gray-600 font-medium">{dayAbbr}</Text>
      <Text className="text-xl text-gray-900 font-bold">{dateNum}</Text>
    </View>
  );
});

DateAvatar.displayName = 'DateAvatar';
