import { TouchableOpacity, Text, View } from 'react-native';
import { ComponentType } from 'react';
import { Plus } from 'lucide-react-native';

export interface TPFabProps {
  icon?: ComponentType<{ size?: number; color?: string }>;
  label?: string;
  onPress: () => void;
}

/**
 * TPFab - Floating action button
 * Positioned absolutely at bottom-right with primary blue background
 *
 * @example
 * <TPFab
 *   icon={Plus}
 *   label="New Period"
 *   onPress={handleCreate}
 * />
 */
export function TPFab({ icon: Icon = Plus, label, onPress }: TPFabProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="absolute bottom-5 right-5 bg-primary-500 rounded-full shadow-large"
      style={{
        paddingVertical: label ? 14 : 18,
        paddingHorizontal: label ? 20 : 18,
      }}
    >
      <View className="flex-row items-center">
        <Icon size={24} color="#fff" />
        {label && (
          <Text className="ml-2 text-base font-semibold text-white">{label}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
