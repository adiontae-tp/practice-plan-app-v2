import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

export interface DeviceState {
  isMobile: boolean;
  isDesktop: boolean;
  viewportWidth: number;
}

/**
 * Hook to detect device type based on viewport width
 * Uses 768px as the breakpoint (consistent with existing app)
 */
export function useDevice(): DeviceState {
  const [state, setState] = useState<DeviceState>(() => {
    // SSR-safe initial state
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isDesktop: true,
        viewportWidth: 1024,
      };
    }

    const width = window.innerWidth;
    return {
      isMobile: width < MOBILE_BREAKPOINT,
      isDesktop: width >= MOBILE_BREAKPOINT,
      viewportWidth: width,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setState({
        isMobile: width < MOBILE_BREAKPOINT,
        isDesktop: width >= MOBILE_BREAKPOINT,
        viewportWidth: width,
      });
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
}
