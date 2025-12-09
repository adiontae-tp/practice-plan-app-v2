'use client';

import React from 'react';
import { useMobileWeb } from '../context/MWContext';

export interface MWViewSwitchProps {
  /** Content to show on mobile viewports */
  mobile: React.ReactNode;
  /** Content to show on desktop viewports */
  desktop: React.ReactNode;
  /** Fallback while detecting device (prevents hydration mismatch) */
  fallback?: React.ReactNode;
}

/**
 * MWViewSwitch - Conditionally renders mobile or desktop content
 *
 * Uses the MWProvider context to determine which view to show.
 * Handles SSR by showing fallback until client-side hydration completes.
 */
export function MWViewSwitch({
  mobile,
  desktop,
  fallback,
}: MWViewSwitchProps) {
  const { isMobile } = useMobileWeb();

  return <>{isMobile ? mobile : desktop}</>;
}

// ---------------------------------------------------------------------------
// Convenience components for simpler conditional rendering
// ---------------------------------------------------------------------------

export interface MWMobileOnlyProps {
  children: React.ReactNode;
  /** Fallback for SSR (optional) */
  fallback?: React.ReactNode;
}

/**
 * MWMobileOnly - Only renders children on mobile viewports
 */
export function MWMobileOnly({ children, fallback }: MWMobileOnlyProps) {
  const { isMobile } = useMobileWeb();

  if (!isMobile) return fallback ?? null;
  return <>{children}</>;
}

export interface MWDesktopOnlyProps {
  children: React.ReactNode;
  /** Fallback for mobile (optional) */
  fallback?: React.ReactNode;
}

/**
 * MWDesktopOnly - Only renders children on desktop viewports
 */
export function MWDesktopOnly({ children, fallback }: MWDesktopOnlyProps) {
  const { isDesktop } = useMobileWeb();

  if (!isDesktop) return fallback ?? null;
  return <>{children}</>;
}
