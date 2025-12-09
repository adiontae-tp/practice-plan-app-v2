import { View, Text, TouchableOpacity } from 'react-native';

interface TPTagProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

/**
 * TPTag - Tag chip component following design tokens
 * Unselected: Gray background with gray text
 * Selected: Secondary pink background, white text
 * Always uses 16px radius (rounded-xl)
 *
 * @example
 * <TPTag label="Offense" selected={isSelected} onPress={handleToggle} />
 */
export function TPTag({ label, selected = false, onPress }: TPTagProps) {
  const baseClasses = 'px-2.5 py-1 rounded-xl';

  if (selected) {
    const selectedClasses = `${baseClasses} bg-secondary-500`;
    const content = (
      <Text className="text-xs text-white font-medium">{label}</Text>
    );

    if (onPress) {
      return (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          className={selectedClasses}
        >
          {content}
        </TouchableOpacity>
      );
    }

    return <View className={selectedClasses}>{content}</View>;
  }

  // Unselected state
  const unselectedClasses = `${baseClasses} bg-gray-200`;
  const content = (
    <Text className="text-xs text-gray-600 font-medium">{label}</Text>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className={unselectedClasses}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View className={unselectedClasses}>{content}</View>;
}
