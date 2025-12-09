'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { cn } from '../utils';

export interface MWActionSheetAction {
  /** Unique identifier */
  id: string;
  /** Action label */
  label: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Action handler */
  onPress: () => void;
  /** Visual style */
  variant?: 'default' | 'destructive';
  /** Whether action is disabled */
  disabled?: boolean;
}

export interface MWActionSheetProps {
  /** Whether the action sheet is visible */
  open: boolean;
  /** Called when the sheet should close */
  onClose: () => void;
  /** Optional title */
  title?: string;
  /** Optional description */
  description?: string;
  /** Action items */
  actions: MWActionSheetAction[];
  /** Whether to show cancel button */
  showCancel?: boolean;
  /** Cancel button label */
  cancelLabel?: string;
  /** Additional CSS classes for the sheet */
  className?: string;
}

/**
 * MWActionSheet - iOS-style bottom action sheet
 *
 * Features:
 * - Slide-up animation
 * - Backdrop with tap-to-close
 * - Optional title and description
 * - Destructive action styling
 * - Cancel button
 */
export function MWActionSheet({
  open,
  onClose,
  title,
  description,
  actions,
  showCancel = true,
  cancelLabel = 'Cancel',
  className,
}: MWActionSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle open/close animation
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      // Trigger animation after mount
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Handle escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleActionPress = useCallback(
    (action: MWActionSheetAction) => {
      if (action.disabled) return;
      action.onPress();
      onClose();
    },
    [onClose]
  );

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'action-sheet-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/50 transition-opacity duration-300',
          isAnimating ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0',
          'pb-[env(safe-area-inset-bottom)]',
          'transition-transform duration-300 ease-out',
          isAnimating ? 'translate-y-0' : 'translate-y-full',
          className
        )}
      >
        <div className="mx-2 mb-2 space-y-2">
          {/* Actions group */}
          <div className="bg-white rounded-xl overflow-hidden">
            {/* Header */}
            {(title || description) && (
              <div className="px-4 py-3 text-center border-b border-gray-200">
                {title && (
                  <h2
                    id="action-sheet-title"
                    className="text-sm font-semibold text-gray-500"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-xs text-gray-400 mt-1">{description}</p>
                )}
              </div>
            )}

            {/* Action buttons */}
            {actions.map((action, index) => (
              <button
                key={action.id}
                type="button"
                onClick={() => handleActionPress(action)}
                disabled={action.disabled}
                className={cn(
                  'w-full px-4 py-4 text-center text-lg',
                  'flex items-center justify-center gap-2',
                  'transition-colors active:bg-gray-100',
                  'disabled:opacity-40 disabled:pointer-events-none',
                  'focus:outline-none focus-visible:bg-gray-100',
                  index > 0 && 'border-t border-gray-200',
                  action.variant === 'destructive'
                    ? 'text-red-600'
                    : 'text-blue-600'
                )}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>

          {/* Cancel button */}
          {showCancel && (
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'w-full px-4 py-4 text-center text-lg font-semibold',
                'bg-white rounded-xl text-blue-600',
                'transition-colors active:bg-gray-100',
                'focus:outline-none focus-visible:bg-gray-100'
              )}
            >
              {cancelLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
