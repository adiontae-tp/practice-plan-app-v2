import { View } from 'react-native';
import { ComponentType } from 'react';
import { useIsDesktop } from '@/utils/responsive';

interface TPScreenProps {
  MobileScreen: ComponentType;
  DesktopScreen?: ComponentType;
}

/**
 * TPScreen - Responsive screen component that shows mobile or desktop
 * based on viewport width (breakpoint: 768px)
 *
 * @example
 * <TPScreen
 *   MobileScreen={ProfileMobile}
 *   DesktopScreen={ProfileDesktop}
 * />
 */
export function TPScreen({ MobileScreen, DesktopScreen }: TPScreenProps) {
  const isDesktop = useIsDesktop();

  // If no desktop screen provided, always show mobile
  const ScreenComponent =
    isDesktop && DesktopScreen ? DesktopScreen : MobileScreen;

  return (
    <View className="flex-1">
      <ScreenComponent />
    </View>
  );
}
