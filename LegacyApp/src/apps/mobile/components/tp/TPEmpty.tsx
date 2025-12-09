import { Text, View } from 'react-native';
import { ComponentType } from 'react';
import { Clipboard } from 'lucide-react-native';
import { TPButton } from './TPButton';

interface TPEmptyProps {
  icon?: ComponentType<{ size?: number; color?: string }>;
  title: string;
  message: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * TPEmpty - Empty state display component
 * Shows an icon, title, message, and optional action button
 *
 * @example
 * <TPEmpty
 *   icon={Clipboard}
 *   title="No items yet"
 *   message="Get started by creating your first item"
 *   action={{ label: 'Create Item', onPress: handleCreate }}
 * />
 */
export function TPEmpty({
  icon: Icon = Clipboard,
  title,
  message,
  action,
}: TPEmptyProps) {
  return (
    <View className="flex-1 items-center justify-center px-10">
      {/* Icon - 64px */}
      <View className="mb-4">
        <Icon size={64} color="#ccc" />
      </View>

      {/* Title - 18px, weight 600 */}
      <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">
        {title}
      </Text>

      {/* Message - 14px, text-secondary */}
      <Text className="text-sm text-gray-600 text-center">{message}</Text>

      {/* Action Button */}
      {action && (
        <View className="mt-4">
          <TPButton onPress={action.onPress} action="primary">
            {action.label}
          </TPButton>
        </View>
      )}
    </View>
  );
}
