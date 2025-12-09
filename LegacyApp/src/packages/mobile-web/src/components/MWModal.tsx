'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils';

export interface MWModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Height preset */
  height?: 'auto' | 'half' | 'full';
  /** Whether to show close button */
  showClose?: boolean;
  /** Whether to show drag handle */
  showHandle?: boolean;
  /** Whether clicking backdrop closes modal */
  closeOnBackdrop?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MWModal - iOS-style slide-up modal sheet
 *
 * Features:
 * - Slide-up animation from bottom
 * - Multiple height presets (auto, half, full)
 * - Optional drag handle
 * - Close button or backdrop tap
 * - Rounded corners on top
 */
export function MWModal({
  open,
  onClose,
  title,
  children,
  height = 'auto',
  showClose = true,
  showHandle = true,
  closeOnBackdrop = true,
  className,
}: MWModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle open/close animation
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
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

  if (!isVisible) return null;

  const heightStyles = {
    auto: 'max-h-[90vh]',
    half: 'h-[50vh]',
    full: 'h-[calc(100vh-env(safe-area-inset-top)-2rem)]',
  };

  return (
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/50 transition-opacity duration-300',
          isAnimating ? 'opacity-100' : 'opacity-0'
        )}
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0',
          'bg-white rounded-t-2xl',
          'pb-[env(safe-area-inset-bottom)]',
          'flex flex-col',
          'transition-transform duration-300 ease-out',
          isAnimating ? 'translate-y-0' : 'translate-y-full',
          heightStyles[height],
          className
        )}
      >
        {/* Handle */}
        {showHandle && (
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="w-10">
              {/* Spacer for centering */}
            </div>
            {title && (
              <h2
                id="modal-title"
                className="text-base font-semibold text-gray-900 text-center flex-1"
              >
                {title}
              </h2>
            )}
            <div className="w-10 flex justify-end">
              {showClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    'w-8 h-8 flex items-center justify-center rounded-full',
                    'bg-gray-100 text-gray-600',
                    'active:bg-gray-200 transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
                  )}
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
