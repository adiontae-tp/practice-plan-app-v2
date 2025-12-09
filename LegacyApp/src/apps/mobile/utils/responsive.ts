/**
 * Responsive utility hooks
 * Desktop breakpoint: 768px
 */

import { useWindowDimensions } from 'react-native';

const DESKTOP_BREAKPOINT = 768;

/**
 * Returns true if screen width >= 768px (tablet/desktop)
 */
export function useIsDesktop(): boolean {
  const { width } = useWindowDimensions();
  return width >= DESKTOP_BREAKPOINT;
}

/**
 * Returns true if screen width < 768px (mobile)
 */
export function useIsMobile(): boolean {
  const { width } = useWindowDimensions();
  return width < DESKTOP_BREAKPOINT;
}

/**
 * Returns current screen width
 */
export function useScreenWidth(): number {
  const { width } = useWindowDimensions();
  return width;
}

/**
 * Returns current screen height
 */
export function useScreenHeight(): number {
  const { height } = useWindowDimensions();
  return height;
}
