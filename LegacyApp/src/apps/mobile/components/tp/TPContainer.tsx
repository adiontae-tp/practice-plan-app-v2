import { View, ViewProps, Text } from 'react-native';
import { ReactNode } from 'react';

interface TPContainerProps extends Omit<ViewProps, 'className'> {
  children: ReactNode;
  padding?: boolean;
  className?: string;
  title?: string;
}

/**
 * TPContainer - Standard page container with Sacred background color
 *
 * Features:
 * - Uses standard background color: #e0e0e0
 * - Always fills parent (flex-1)
 * - Optional padding (default: no padding)
 * - Supports additional className for custom styling
 *
 * @example
 * <TPContainer>
 *   <Text>Content</Text>
 * </TPContainer>
 *
 * @example
 * <TPContainer padding className="items-center justify-center">
 *   <Text>Centered Content</Text>
 * </TPContainer>
 */
export function TPContainer({
  children,
  padding = false,
  className = '',
  title,
  ...viewProps
}: TPContainerProps) {
  const baseClasses = 'flex-1 bg-[#e0e0e0]';
  const paddingClasses = padding ? 'px-4' : '';
  const combinedClasses = [baseClasses, paddingClasses, className]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    <View className={combinedClasses} {...viewProps}>
      {title && (
        <View className="px-4 py-3 bg-white border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-900">{title}</Text>
        </View>
      )}
      {children}
    </View>
  );
}
