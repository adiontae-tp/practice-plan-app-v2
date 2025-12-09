import { View, Text } from 'react-native';
import { Divider } from '@/components/ui/divider';

type TPDividerOrientation = 'horizontal' | 'vertical';

interface TPDividerProps {
  label?: string;
  orientation?: TPDividerOrientation;
}

/**
 * TPDivider - Section divider component
 * Provides visual separation in lists and cards
 *
 * @example
 * <TPDivider />
 * <TPDivider label="Section Title" />
 * <TPDivider orientation="vertical" />
 */
export function TPDivider({
  label,
  orientation = 'horizontal',
}: TPDividerProps) {
  if (label) {
    return (
      <View
        className={`flex-row items-center my-4 ${orientation === 'vertical' ? 'flex-col' : ''}`}
      >
        <Divider orientation={orientation} className="flex-1 bg-gray-200" />
        <Text className="mx-3 text-sm font-medium text-gray-600">{label}</Text>
        <Divider orientation={orientation} className="flex-1 bg-gray-200" />
      </View>
    );
  }

  return <Divider orientation={orientation} className="bg-gray-200" />;
}
