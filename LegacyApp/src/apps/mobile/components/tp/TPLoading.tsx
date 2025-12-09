import { ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { COLORS } from '@ppa/ui/branding';

type TPLoadingSize = 'sm' | 'md' | 'lg';

interface TPLoadingProps {
  loading: boolean;
  children?: ReactNode;
  message?: string;
  size?: TPLoadingSize;
}

/**
 * TPLoading - Loading state wrapper component
 * Provides consistent loading UI across the app
 *
 * @example
 * <TPLoading loading={isLoading} message="Loading data...">
 *   <Content />
 * </TPLoading>
 */
export function TPLoading({
  loading,
  children,
  message,
  size = 'md',
}: TPLoadingProps) {
  const sizeMap: Record<TPLoadingSize, 'small' | 'large'> = {
    sm: 'small',
    md: 'large',
    lg: 'large',
  };

  if (!loading) {
    return <>{children}</>;
  }

  return (
    <View className="flex-1 items-center justify-center py-10">
      <ActivityIndicator size={sizeMap[size]} color={COLORS.primary[500]} />
      {message && (
        <Text className="text-sm text-gray-600 mt-4 text-center">{message}</Text>
      )}
    </View>
  );
}
