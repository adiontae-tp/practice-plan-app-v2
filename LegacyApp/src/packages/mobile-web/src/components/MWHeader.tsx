'use client';

import React from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { cn } from '../utils';

export interface MWHeaderAction {
  /** Icon component to render */
  icon: React.ReactNode;
  /** Action handler */
  onClick: () => void;
  /** Accessibility label */
  label: string;
  /** Whether the action is disabled */
  disabled?: boolean;
}

export interface MWHeaderProps {
  /** Page title */
  title?: string;
  /** Optional subtitle below title */
  subtitle?: string;
  /** Whether to show back button */
  showBack?: boolean;
  /** Back button style */
  backStyle?: 'arrow' | 'close';
  /** Custom back handler (defaults to history.back) */
  onBack?: () => void;
  /** Right-side action buttons */
  actions?: MWHeaderAction[];
  /** Header variant */
  variant?: 'default' | 'transparent' | 'primary';
  /** Whether header is sticky/fixed */
  fixed?: boolean;
  /** Custom left content (replaces back button) */
  left?: React.ReactNode;
  /** Custom center content (replaces title) */
  center?: React.ReactNode;
  /** Custom right content (replaces actions) */
  right?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Specific route to navigate to when back button is pressed */
  backDestination?: string | null;
  /** Custom back handler (for confirmations, etc.) - takes priority over onBack and backDestination */
  customBackHandler?: (() => void) | null;
  /** Router push function (from Next.js useRouter) for programmatic navigation */
  routerPush?: (path: string) => void;
}

/**
 * MWHeader - Mobile web navigation header
 *
 * Hybrid iOS/Android style header with:
 * - Back navigation (arrow or close)
 * - Centered title with optional subtitle
 * - Right-side action buttons
 * - Multiple visual variants
 * - Fixed/sticky positioning
 */
export function MWHeader({
  title,
  subtitle,
  showBack = false,
  backStyle = 'arrow',
  onBack,
  actions = [],
  variant = 'default',
  fixed = true,
  left,
  center,
  right,
  className,
  backDestination,
  customBackHandler,
  routerPush,
}: MWHeaderProps) {
  const handleBack = () => {
    // Priority 1: Custom handler (for confirmations, validations, etc.)
    if (customBackHandler) {
      customBackHandler();
      return;
    }

    // Priority 2: onBack prop (existing behavior - for backwards compatibility)
    if (onBack) {
      onBack();
      return;
    }

    // Priority 3: Specific destination route with router
    if (backDestination && routerPush) {
      routerPush(backDestination);
      return;
    }

    // Fallback: Browser history
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const variantStyles = {
    default: 'bg-white border-b border-gray-200',
    transparent: 'bg-transparent',
    primary: 'bg-blue-600 text-white',
  };

  const textColor = variant === 'primary' ? 'text-white' : 'text-gray-900';
  const subtitleColor = variant === 'primary' ? 'text-white/80' : 'text-gray-500';
  const iconColor = variant === 'primary' ? 'text-white' : 'text-gray-700';

  const BackIcon = backStyle === 'close' ? X : ChevronLeft;

  return (
    <header
      className={cn(
        // Base styles - height includes content + safe area
        'flex items-center px-2 gap-1',
        // Content height (56px)
        'h-[calc(3.5rem+env(safe-area-inset-top))]',
        // Positioning
        fixed && 'fixed top-0 left-0 right-0 z-50',
        // Safe area padding at top
        fixed && 'pt-[env(safe-area-inset-top)]',
        // Variant styles
        variantStyles[variant],
        className
      )}
    >
      {/* Left section - back button or custom */}
      <div className="w-12 flex items-center justify-start">
        {left ? (
          left
        ) : showBack ? (
          <button
            type="button"
            onClick={handleBack}
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded-full',
              'active:bg-black/10 transition-colors',
              iconColor
            )}
            aria-label="Go back"
          >
            <BackIcon className="w-6 h-6" />
          </button>
        ) : null}
      </div>

      {/* Center section - title or custom */}
      <div className="flex-1 flex flex-col items-center justify-center min-w-0">
        {center ? (
          center
        ) : (
          <>
            {title && (
              <h1
                className={cn(
                  'text-base font-semibold truncate max-w-full',
                  textColor
                )}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p className={cn('text-xs truncate max-w-full', subtitleColor)}>
                {subtitle}
              </p>
            )}
          </>
        )}
      </div>

      {/* Right section - actions or custom */}
      <div className="w-12 flex items-center justify-end gap-1">
        {right
          ? right
          : actions.map((action, index) => (
              <button
                key={index}
                type="button"
                onClick={action.onClick}
                disabled={action.disabled}
                className={cn(
                  'w-10 h-10 flex items-center justify-center rounded-full',
                  'active:bg-black/10 transition-colors',
                  'disabled:opacity-40 disabled:pointer-events-none',
                  iconColor
                )}
                aria-label={action.label}
              >
                {action.icon}
              </button>
            ))}
      </div>
    </header>
  );
}
