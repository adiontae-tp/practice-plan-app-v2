'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../utils';

// ---------------------------------------------------------------------------
// MWList - Container for list items
// ---------------------------------------------------------------------------

export interface MWListProps {
  children: React.ReactNode;
  /** Visual style */
  variant?: 'default' | 'inset' | 'plain';
  /** Optional section header */
  header?: string;
  /** Optional section footer */
  footer?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MWList - iOS-style grouped list container
 */
export function MWList({
  children,
  variant = 'default',
  header,
  footer,
  className,
}: MWListProps) {
  const containerStyles = {
    default: 'bg-white',
    inset: 'bg-white mx-4 rounded-xl overflow-hidden',
    plain: '',
  };

  return (
    <div className={cn('mb-6', className)}>
      {header && (
        <h3 className="px-4 pb-2 text-sm font-medium text-gray-500 uppercase tracking-wide">
          {header}
        </h3>
      )}
      <div className={containerStyles[variant]}>
        {children}
      </div>
      {footer && (
        <p className="px-4 pt-2 text-sm text-gray-500">
          {footer}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MWListItem - Individual list item
// ---------------------------------------------------------------------------

export interface MWListItemProps {
  /** Primary text */
  title: string;
  /** Secondary text */
  subtitle?: string;
  /** Left icon or element */
  left?: React.ReactNode;
  /** Right element (overrides chevron) */
  right?: React.ReactNode;
  /** Whether to show chevron (for navigation items) */
  showChevron?: boolean;
  /** Click handler */
  onPress?: () => void;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Whether this is a destructive action */
  destructive?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MWListItem - iOS-style list item with optional icon, subtitle, and chevron
 */
export function MWListItem({
  title,
  subtitle,
  left,
  right,
  showChevron = false,
  onPress,
  disabled = false,
  destructive = false,
  className,
}: MWListItemProps) {
  const isInteractive = !!onPress && !disabled;

  const content = (
    <>
      {/* Left icon/element */}
      {left && (
        <div className="flex-shrink-0 mr-3">
          {left}
        </div>
      )}

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-base truncate',
            destructive ? 'text-red-600' : 'text-gray-900',
            disabled && 'text-gray-400'
          )}
        >
          {title}
        </p>
        {subtitle && (
          <p className={cn('text-sm truncate', disabled ? 'text-gray-300' : 'text-gray-500')}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right element or chevron */}
      <div className="flex-shrink-0 ml-3 flex items-center">
        {right ? (
          right
        ) : showChevron ? (
          <ChevronRight className={cn('w-5 h-5', disabled ? 'text-gray-300' : 'text-gray-400')} />
        ) : null}
      </div>
    </>
  );

  const baseStyles = cn(
    'flex items-center px-4 py-3',
    'border-b border-gray-100 last:border-b-0',
    isInteractive && 'active:bg-gray-100 transition-colors cursor-pointer',
    disabled && 'pointer-events-none',
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
        {content}
      </button>
    );
  }

  return <div className={baseStyles}>{content}</div>;
}

// ---------------------------------------------------------------------------
// MWListItemIcon - Styled icon container for list items
// ---------------------------------------------------------------------------

export interface MWListItemIconProps {
  children: React.ReactNode;
  /** Background color */
  color?: 'gray' | 'blue' | 'green' | 'red' | 'orange' | 'purple';
  /** Size variant */
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * MWListItemIcon - Rounded icon container for MWListItem left prop
 */
export function MWListItemIcon({
  children,
  color = 'gray',
  size = 'md',
  className,
}: MWListItemIconProps) {
  const colorStyles = {
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg',
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
// MWListDivider - Separator between list sections
// ---------------------------------------------------------------------------

export interface MWListDividerProps {
  className?: string;
}

export function MWListDivider({ className }: MWListDividerProps) {
  return <div className={cn('h-8 bg-gray-100', className)} />;
}
