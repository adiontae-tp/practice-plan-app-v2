import { View, TouchableOpacity } from 'react-native';
import { ReactNode } from 'react';

export interface TPCardProps {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  className?: string;
}

/**
 * TPCard - Standard card component with sacred styling
 * Sacred card pattern: bg-white rounded-xl p-4 mb-3 shadow-card
 *
 * @example
 * <TPCard onPress={() => router.push('/plan/123')}>
 *   <Text className="text-base font-semibold text-gray-900">Plan Name</Text>
 * </TPCard>
 */
export function TPCard({
  children,
  onPress,
  onLongPress,
  className = '',
}: TPCardProps) {
  const cardClasses = `bg-white rounded-xl p-4 mb-3 shadow-card ${className}`.trim();

  if (onPress || onLongPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
        className={cardClasses}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View className={cardClasses}>{children}</View>;
}
