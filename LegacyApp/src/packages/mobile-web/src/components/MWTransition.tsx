'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '../utils';
import { useMobileWeb, TransitionType } from '../context/MWContext';

export interface MWTransitionProps {
  children: React.ReactNode;
  className?: string;
  /** Override the transition from context */
  transition?: TransitionType;
  /** Duration in ms (default: 300) */
  duration?: number;
}

/**
 * MWTransition - Animated page transition wrapper
 *
 * Wraps page content and applies app-like transitions based on navigation state.
 * Works with the MWProvider navigation methods (navigatePush, navigatePop, etc.)
 */
export function MWTransition({
  children,
  className,
  transition: transitionOverride,
  duration = 300,
}: MWTransitionProps) {
  const { navigation } = useMobileWeb();
  const [isVisible, setIsVisible] = useState(false);

  const activeTransition = transitionOverride ?? navigation.transition;

  // Trigger enter animation on mount
  useEffect(() => {
    // Small delay to ensure CSS transition works
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // Get transition classes based on type
  const getTransitionClasses = () => {
    const base = 'transition-all ease-out';
    const durationClass = `duration-${duration}`;

    switch (activeTransition) {
      case 'push':
        return cn(
          base,
          isVisible
            ? 'translate-x-0 opacity-100'
            : 'translate-x-full opacity-0'
        );
      case 'pop':
        return cn(
          base,
          isVisible
            ? 'translate-x-0 opacity-100'
            : '-translate-x-full opacity-0'
        );
      case 'fade':
        return cn(base, isVisible ? 'opacity-100' : 'opacity-0');
      case 'none':
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(getTransitionClasses(), className)}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}
