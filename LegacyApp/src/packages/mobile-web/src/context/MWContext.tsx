'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DeviceType = 'mobile' | 'desktop';
export type TransitionType = 'push' | 'pop' | 'fade' | 'none';
export type TransitionDirection = 'left' | 'right' | 'up' | 'down';

export interface NavigationState {
  /** Current transition type */
  transition: TransitionType;
  /** Transition direction for slide animations */
  direction: TransitionDirection;
  /** Whether a transition is currently in progress */
  isTransitioning: boolean;
}

export interface MWContextValue {
  /** Current device type based on viewport */
  deviceType: DeviceType;
  /** Whether the current view is mobile */
  isMobile: boolean;
  /** Whether the current view is desktop */
  isDesktop: boolean;
  /** Current viewport width */
  viewportWidth: number;
  /** Navigation state for transitions */
  navigation: NavigationState;
  /** Trigger a push transition (slide in from right) */
  navigatePush: () => void;
  /** Trigger a pop transition (slide in from left) */
  navigatePop: () => void;
  /** Trigger a fade transition */
  navigateFade: () => void;
  /** Reset navigation state after transition completes */
  resetNavigation: () => void;
  /** Mobile breakpoint in pixels */
  mobileBreakpoint: number;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const MWContext = createContext<MWContextValue | null>(null);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useMobileWeb(): MWContextValue {
  const context = useContext(MWContext);
  if (!context) {
    throw new Error('useMobileWeb must be used within a MWProvider');
  }
  return context;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface MWProviderProps {
  children: React.ReactNode;
  /** Breakpoint for mobile detection (default: 768) */
  mobileBreakpoint?: number;
  /** Force a specific device type (useful for testing) */
  forceDeviceType?: DeviceType;
  /** Transition duration in ms (default: 300) */
  transitionDuration?: number;
}

export function MWProvider({
  children,
  mobileBreakpoint = 768,
  forceDeviceType,
  transitionDuration = 300,
}: MWProviderProps) {
  // Track viewport width
  const [viewportWidth, setViewportWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1024; // Default to desktop during SSR
  });

  // Track navigation state
  const [navigation, setNavigation] = useState<NavigationState>({
    transition: 'none',
    direction: 'left',
    isTransitioning: false,
  });

  // Listen for viewport changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute device type
  const deviceType: DeviceType = useMemo(() => {
    if (forceDeviceType) return forceDeviceType;
    return viewportWidth < mobileBreakpoint ? 'mobile' : 'desktop';
  }, [viewportWidth, mobileBreakpoint, forceDeviceType]);

  // Navigation actions
  const navigatePush = useCallback(() => {
    setNavigation({
      transition: 'push',
      direction: 'left',
      isTransitioning: true,
    });

    // Auto-reset after transition
    setTimeout(() => {
      setNavigation((prev) => ({ ...prev, isTransitioning: false }));
    }, transitionDuration);
  }, [transitionDuration]);

  const navigatePop = useCallback(() => {
    setNavigation({
      transition: 'pop',
      direction: 'right',
      isTransitioning: true,
    });

    setTimeout(() => {
      setNavigation((prev) => ({ ...prev, isTransitioning: false }));
    }, transitionDuration);
  }, [transitionDuration]);

  const navigateFade = useCallback(() => {
    setNavigation({
      transition: 'fade',
      direction: 'left',
      isTransitioning: true,
    });

    setTimeout(() => {
      setNavigation((prev) => ({ ...prev, isTransitioning: false }));
    }, transitionDuration);
  }, [transitionDuration]);

  const resetNavigation = useCallback(() => {
    setNavigation({
      transition: 'none',
      direction: 'left',
      isTransitioning: false,
    });
  }, []);

  // Build context value
  const value: MWContextValue = useMemo(
    () => ({
      deviceType,
      isMobile: deviceType === 'mobile',
      isDesktop: deviceType === 'desktop',
      viewportWidth,
      navigation,
      navigatePush,
      navigatePop,
      navigateFade,
      resetNavigation,
      mobileBreakpoint,
    }),
    [
      deviceType,
      viewportWidth,
      navigation,
      navigatePush,
      navigatePop,
      navigateFade,
      resetNavigation,
      mobileBreakpoint,
    ]
  );

  return <MWContext.Provider value={value}>{children}</MWContext.Provider>;
}
