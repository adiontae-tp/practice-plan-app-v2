'use client';

import React from 'react';
import { cn } from '../utils';

export interface MWPageProps {
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Background color variant */
  variant?: 'default' | 'gray' | 'white';
  /** Whether to add safe area padding */
  safeArea?: boolean;
  /** Whether the page has a fixed header (adds top padding) */
  hasHeader?: boolean;
  /** Whether the page has a fixed footer/tab bar (adds bottom padding) */
  hasFooter?: boolean;
}

/**
 * MWPage - Mobile web page container
 *
 * Full-screen wrapper that handles:
 * - Safe area insets for notched devices
 * - Fixed header/footer spacing
 * - Background colors
 * - Viewport height management
 */
export function MWPage({
  children,
  className,
  variant = 'default',
  safeArea = true,
  hasHeader = true,
  hasFooter = false,
}: MWPageProps) {
  const bgColors = {
    default: 'bg-gray-50',
    gray: 'bg-gray-100',
    white: 'bg-white',
  };

  return (
    <div
      className={cn(
        // Base styles - full viewport height (not min-h to prevent overflow)
        'flex flex-col h-[100dvh] w-full overflow-hidden',
        // Background
        bgColors[variant],
        // Safe area padding (for notched devices)
        safeArea && 'pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]',
        // Header spacing (header height 3.5rem + safe area top)
        hasHeader && 'pt-[calc(3.5rem+env(safe-area-inset-top))]',
        // Footer spacing (tab bar height 4rem + safe area bottom)
        hasFooter && 'pb-[calc(4rem+env(safe-area-inset-bottom))]',
        className
      )}
    >
      {children}
    </div>
  );
}

export interface MWPageContentProps {
  children: React.ReactNode;
  className?: string;
  /** Padding preset */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Enable scroll */
  scroll?: boolean;
}

/**
 * MWPageContent - Scrollable content area within MWPage
 *
 * Includes extra top padding (pt-12) to account for fixed header height
 */
export function MWPageContent({
  children,
  className,
  padding = 'md',
  scroll = true,
}: MWPageContentProps) {
  const paddingStyles = {
    none: 'pt-12', // Still need top padding for header even with no other padding
    sm: 'p-2 pt-12',
    md: 'p-4 pt-12',
    lg: 'p-6 pt-12',
  };

  return (
    <div
      className={cn(
        'flex-1',
        scroll && 'overflow-y-auto',
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
