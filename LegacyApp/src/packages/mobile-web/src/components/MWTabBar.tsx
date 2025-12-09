'use client';

import React from 'react';
import { cn } from '../utils';

export interface MWTabItem {
  /** Unique identifier */
  id: string;
  /** Tab label */
  label: string;
  /** Icon component (receives className prop) */
  icon: React.ComponentType<{ className?: string }>;
  /** Badge count (optional) */
  badge?: number;
  /** Whether this tab is disabled */
  disabled?: boolean;
}

export interface MWTabBarProps {
  /** Tab items to display */
  items: MWTabItem[];
  /** Currently active tab id */
  activeId: string;
  /** Called when a tab is pressed */
  onTabPress: (id: string) => void;
  /** Visual variant */
  variant?: 'default' | 'floating' | 'minimal';
  /** Additional CSS classes */
  className?: string;
  /** Whether to show labels */
  showLabels?: boolean;
}

/**
 * MWTabBar - iOS/Android style bottom tab navigation
 *
 * Features:
 * - Fixed bottom positioning with safe area
 * - Active state with color highlight
 * - Optional badge counts
 * - Multiple visual variants
 */
export function MWTabBar({
  items,
  activeId,
  onTabPress,
  variant = 'default',
  className,
  showLabels = true,
}: MWTabBarProps) {
  const variantStyles = {
    default: 'bg-white border-t border-gray-200',
    floating: 'bg-white/95 backdrop-blur-lg mx-4 mb-2 rounded-2xl shadow-lg border border-gray-200',
    minimal: 'bg-transparent',
  };

  const containerStyles = {
    default: 'fixed bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom)]',
    floating: 'fixed bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom)]',
    minimal: 'fixed bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom)]',
  };

  return (
    <nav
      className={cn(
        containerStyles[variant],
        'z-50',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-around',
          showLabels ? 'h-16' : 'h-14',
          variantStyles[variant]
        )}
      >
        {items.map((item) => {
          const isActive = item.id === activeId;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => !item.disabled && onTabPress(item.id)}
              disabled={item.disabled}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full',
                'transition-colors duration-150',
                'active:bg-gray-100',
                'disabled:opacity-40 disabled:pointer-events-none',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'w-6 h-6 transition-colors',
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  )}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={cn(
                      'absolute -top-1 -right-1 min-w-[18px] h-[18px]',
                      'flex items-center justify-center',
                      'bg-red-500 text-white text-xs font-medium',
                      'rounded-full px-1'
                    )}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              {showLabels && (
                <span
                  className={cn(
                    'text-xs mt-1 transition-colors',
                    isActive ? 'text-blue-600 font-medium' : 'text-gray-500'
                  )}
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
