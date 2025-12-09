import React from 'react';
import { View } from 'react-native';
import { Spinner } from '@/components/ui/spinner';

export const LoadingState = React.memo(() => {
  return (
    <View className="flex-1 items-center justify-center">
      <Spinner size="large" />
    </View>
  );
});

LoadingState.displayName = 'LoadingState';
