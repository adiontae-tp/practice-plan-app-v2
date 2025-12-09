'use client';

import React from 'react';
import { cn } from '../utils';

// ---------------------------------------------------------------------------
// MWCard - Individual card component matching mobile app pattern
// ---------------------------------------------------------------------------

export interface MWCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Click handler */
  onPress?: () => void;
  /** Whether card is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MWCard - Individual white card with tap effect
 *
 * Matches mobile app pattern:
 * - White background with rounded corners (rounded-xl)
 * - Padding (p-4)
 * - Bottom margin (mb-3)
 * - Tap effect (active:opacity-70)
 */
export function MWCard({
  children,
  onPress,
  disabled = false,
  className,
}: MWCardProps) {
  const isInteractive = !!onPress && !disabled;

  const baseStyles = cn(
    'bg-white rounded-xl p-4 mb-3',
    isInteractive && 'cursor-pointer active:opacity-70 transition-opacity',
    disabled && 'opacity-50 pointer-events-none',
    className
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onPress}
        disabled={disabled}
        className={cn(baseStyles, 'w-full text-left')}
      >
        {children}
      </button>
    );
  }

  return <div className={baseStyles}>{children}</div>;
}

// ---------------------------------------------------------------------------
// MWCardIcon - Circular icon container for cards
// ---------------------------------------------------------------------------

export interface MWCardIconProps {
  children: React.ReactNode;
  /** Background color - defaults to gray for subtle icons */
  color?: 'gray' | 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'primary';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * MWCardIcon - Rounded circular icon container
 *
 * Matches mobile app pattern:
 * - Circular background (rounded-full)
 * - Default: w-10 h-10 with bg-gray-100
 */
export function MWCardIcon({
  children,
  color = 'gray',
  size = 'md',
  className,
}: MWCardIconProps) {
  const colorStyles = {
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
    primary: 'bg-primary-100 text-primary-600',
  };

  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full flex-shrink-0',
        colorStyles[color],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MWCardList - Container with count header
// ---------------------------------------------------------------------------

export interface MWCardListProps {
  children: React.ReactNode;
  /** Count to display in header */
  count?: number;
  /** Singular label (e.g., "Tag") */
  singularLabel?: string;
  /** Plural label (e.g., "Tags") */
  pluralLabel?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MWCardList - Container with count header for card lists
 *
 * Matches mobile app pattern:
 * - Uppercase count header (text-xs font-semibold text-typography-500 uppercase mb-3 ml-1)
 * - Format: "{count} {label}"
 */
export function MWCardList({
  children,
  count,
  singularLabel,
  pluralLabel,
  className,
}: MWCardListProps) {
  const showHeader = count !== undefined && singularLabel && pluralLabel;
  const label = count === 1 ? singularLabel : pluralLabel;

  return (
    <div className={className}>
      {showHeader && (
        <p className="text-xs font-semibold text-typography-500 uppercase mb-3 ml-1">
          {count} {label}
        </p>
      )}
      {children}
    </div>
  );
}
