import { ReactNode } from 'react';
import { useDevice } from '@/hooks/useDevice';

interface ViewportSwitchProps {
  mobile: ReactNode;
  desktop: ReactNode;
}

/**
 * ViewportSwitch - Renders mobile or desktop component based on viewport size
 *
 * Mobile (< 768px): Renders Framework7 components
 * Desktop (≥ 768px): Renders shadcn/ui components
 *
 * @example
 * <ViewportSwitch
 *   mobile={<PeriodsMobile />}
 *   desktop={<PeriodsDesktop />}
 * />
 */
export function ViewportSwitch({ mobile, desktop }: ViewportSwitchProps) {
  const { isMobile } = useDevice();

  return <>{isMobile ? mobile : desktop}</>;
}
