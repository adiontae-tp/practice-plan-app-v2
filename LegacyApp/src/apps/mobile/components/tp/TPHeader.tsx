import { View, Text, TouchableOpacity } from 'react-native';
import { useIsDesktop } from '@/utils/responsive';
import { ComponentType } from 'react';
import { ChevronLeft } from 'lucide-react-native';
import { TPButton } from './TPButton';

interface TPHeaderProps {
  title?: string;
  subtitle?: string;
  action?: {
    label: string;
    icon?: ComponentType<{ size?: number; color?: string }>;
    onPress: () => void;
  };
  showBack?: boolean;
  onBack?: () => void;
}

/**
 * TPHeader - Page header component with title, subtitle, and optional action
 * Responsive padding: mobile uses pt-15 (60px), desktop uses pt-6 (24px)
 *
 * @example
 * <TPHeader
 *   title="Period Templates"
 *   subtitle="Reusable practice periods"
 *   action={{ label: 'New Period', icon: Plus, onPress: handleCreate }}
 * />
 */
export function TPHeader({
  title,
  subtitle,
  action,
  showBack,
  onBack,
}: TPHeaderProps) {
  const isDesktop = useIsDesktop();
  const paddingTop = isDesktop ? 'pt-6' : 'pt-15';

  return (
    <View className={`bg-white border-b border-gray-200 px-5 ${paddingTop} pb-4`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          {showBack && onBack && (
            <TouchableOpacity onPress={onBack} className="mr-3">
              <ChevronLeft size={24} color="#374151" />
            </TouchableOpacity>
          )}
          <View className="flex-1">
            {title && (
              <Text
                className={`${isDesktop ? 'text-2xl' : 'text-xl'} font-semibold text-gray-900`}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text className="text-sm text-gray-600 mt-0.5">{subtitle}</Text>
            )}
          </View>
        </View>

        {action && (
          <TPButton onPress={action.onPress} action="secondary" size="sm">
            {action.label}
          </TPButton>
        )}
      </View>
    </View>
  );
}
