import React, { useMemo } from 'react';
import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import { Plan } from '@ppa/interfaces';
import { Card } from '@/components/ui/card';
import { COLORS } from '@ppa/ui/branding';
import { DateAvatar } from './DateAvatar';
import { formatFullDate, formatTime, formatDuration } from '@/utils/calendar.utils';

interface PracticeCardProps {
  plan: Plan;
  onPress: () => void;
  onMenuPress: () => void;
}

export const PracticeCard = React.memo(
  ({ plan, onPress, onMenuPress }: PracticeCardProps) => {
    const date = useMemo(() => new Date(plan.startTime), [plan.startTime]);
    const fullDate = useMemo(() => formatFullDate(date), [date]);
    const startTime = useMemo(() => formatTime(plan.startTime), [plan.startTime]);
    const endTime = useMemo(() => formatTime(plan.endTime), [plan.endTime]);
    const duration = useMemo(() => formatDuration(plan.duration), [plan.duration]);

    return (
      <Card className="mx-4 mb-3">
        <Pressable onPress={onPress} className="p-4 active:bg-gray-50">
          <View className="flex-row items-center">
            <DateAvatar date={date} />

            <View className="flex-1 ml-4">
              <Text className="text-base font-semibold" style={{ color: COLORS.textPrimary }}>
                {fullDate}
              </Text>
              <Text className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
                {startTime} - {endTime}
              </Text>
              <Text className="text-sm" style={{ color: COLORS.textSecondary }}>
                ({duration})
              </Text>
            </View>

            <TouchableOpacity
              onPress={onMenuPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MoreVertical size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Card>
    );
  }
);

PracticeCard.displayName = 'PracticeCard';
