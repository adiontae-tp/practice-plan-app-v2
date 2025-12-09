'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { cn } from '../utils';

export type SnapPoint = 'closed' | 'peek' | 'half' | 'full';

export interface MWBottomSheetProps {
  /** Whether the sheet is open */
  open: boolean;
  /** Called when the sheet should close */
  onClose: () => void;
  /** Sheet content */
  children: React.ReactNode;
  /** Available snap points */
  snapPoints?: SnapPoint[];
  /** Initial snap point when opened */
  initialSnap?: SnapPoint;
  /** Called when snap point changes */
  onSnapChange?: (snap: SnapPoint) => void;
  /** Whether the sheet can be dismissed by dragging down */
  dismissible?: boolean;
  /** Whether to show backdrop */
  showBackdrop?: boolean;
  /** Whether backdrop closes sheet */
  closeOnBackdrop?: boolean;
  /** Whether to show drag handle */
  showHandle?: boolean;
  /** Optional header content (fixed, doesn't scroll) */
  header?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

// Snap point heights as percentage of viewport
const SNAP_HEIGHTS: Record<SnapPoint, number> = {
  closed: 0,
  peek: 25,
  half: 50,
  full: 92,
};

/**
 * MWBottomSheet - Draggable bottom sheet with snap points
 *
 * Features:
 * - Multiple snap points (peek, half, full)
 * - Drag to resize or dismiss
 * - Smooth spring animations
 * - Touch and mouse support
 * - Optional fixed header
 */
export function MWBottomSheet({
  open,
  onClose,
  children,
  snapPoints = ['half', 'full'],
  initialSnap = 'half',
  onSnapChange,
  dismissible = true,
  showBackdrop = true,
  closeOnBackdrop = true,
  showHandle = true,
  header,
  className,
}: MWBottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSnap, setCurrentSnap] = useState<SnapPoint>(initialSnap);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  // Get ordered snap points including closed if dismissible
  const allSnapPoints: SnapPoint[] = dismissible
    ? ['closed', ...snapPoints]
    : snapPoints;

  // Calculate current height
  const getHeight = useCallback((snap: SnapPoint) => {
    return SNAP_HEIGHTS[snap];
  }, []);

  // Find nearest snap point
  const findNearestSnap = useCallback((heightPercent: number): SnapPoint => {
    let nearest = allSnapPoints[0];
    let minDiff = Math.abs(SNAP_HEIGHTS[nearest] - heightPercent);

    for (const snap of allSnapPoints) {
      const diff = Math.abs(SNAP_HEIGHTS[snap] - heightPercent);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = snap;
      }
    }

    return nearest;
  }, [allSnapPoints]);

  // Handle open/close
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setCurrentSnap(initialSnap);
      setDragOffset(0);
    } else {
      setCurrentSnap('closed');
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, initialSnap]);

  // Notify snap changes
  useEffect(() => {
    if (currentSnap === 'closed' && open) {
      onClose();
    }
    onSnapChange?.(currentSnap);
  }, [currentSnap, onSnapChange, onClose, open]);

  // Handle escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, dismissible, onClose]);

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

  // Drag handlers
  const handleDragStart = useCallback((clientY: number) => {
    setIsDragging(true);
    dragStartY.current = clientY;
    dragStartHeight.current = getHeight(currentSnap);
  }, [currentSnap, getHeight]);

  const handleDragMove = useCallback((clientY: number) => {
    if (!isDragging) return;

    const deltaY = dragStartY.current - clientY;
    const deltaPercent = (deltaY / window.innerHeight) * 100;
    setDragOffset(deltaPercent);
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    const newHeight = dragStartHeight.current + dragOffset;
    const nearestSnap = findNearestSnap(newHeight);
    setCurrentSnap(nearestSnap);
    setDragOffset(0);
  }, [isDragging, dragOffset, findNearestSnap]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  }, [handleDragStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  }, [handleDragMove]);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
  }, [handleDragStart]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientY);
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  if (!isVisible) return null;

  const currentHeight = getHeight(currentSnap) + dragOffset;
  const clampedHeight = Math.max(0, Math.min(95, currentHeight));
  const backdropOpacity = Math.min(1, clampedHeight / 50) * 0.5;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      {/* Backdrop */}
      {showBackdrop && (
        <div
          className="absolute inset-0 bg-black transition-opacity duration-300"
          style={{ opacity: backdropOpacity }}
          onClick={closeOnBackdrop && dismissible ? onClose : undefined}
          aria-hidden="true"
        />
      )}

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'absolute bottom-0 left-0 right-0',
          'bg-white rounded-t-2xl shadow-2xl',
          'flex flex-col',
          !isDragging && 'transition-[height] duration-300 ease-out',
          className
        )}
        style={{
          height: `${clampedHeight}vh`,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Drag handle */}
        {showHandle && (
          <div
            className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Header (fixed) */}
        {header && (
          <div className="flex-shrink-0 border-b border-gray-200">
            {header}
          </div>
        )}

        {/* Content (scrollable) */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * MWBottomSheetHeader - Pre-styled header for bottom sheets
 */
export interface MWBottomSheetHeaderProps {
  title?: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export function MWBottomSheetHeader({
  title,
  subtitle,
  left,
  right,
  className,
}: MWBottomSheetHeaderProps) {
  return (
    <div className={cn('flex items-center px-4 py-3', className)}>
      <div className="w-16 flex justify-start">{left}</div>
      <div className="flex-1 text-center">
        {title && (
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        )}
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
      <div className="w-16 flex justify-end">{right}</div>
    </div>
  );
}
