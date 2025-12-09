'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../utils';

export interface MWSearchBarProps {
  /** Current search value */
  value: string;
  /** Called when value changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Called when search is submitted */
  onSubmit?: (value: string) => void;
  /** Called when cancel is pressed */
  onCancel?: () => void;
  /** Whether to show cancel button when focused (iOS style) - defaults to false to match mobile app */
  showCancel?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MWSearchBar - iOS-style search bar with cancel button
 *
 * Features:
 * - Rounded search input with icon
 * - Clear button when has value
 * - Animated cancel button on focus
 * - Submit on enter key
 */
export function MWSearchBar({
  value,
  onChange,
  placeholder = 'Search',
  onSubmit,
  onCancel,
  showCancel = false,
  disabled = false,
  autoFocus = false,
  className,
}: MWSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    // Delay to allow cancel button click
    setTimeout(() => {
      setIsFocused(false);
    }, 100);
  }, []);

  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleCancel = useCallback(() => {
    onChange('');
    setIsFocused(false);
    inputRef.current?.blur();
    onCancel?.();
  }, [onChange, onCancel]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(value);
    inputRef.current?.blur();
  }, [value, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleCancel]);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <form onSubmit={handleSubmit} className="flex-1">
        <div className="relative">
          {/* Search icon */}
          <Search
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
              disabled ? 'text-gray-300' : 'text-gray-400'
            )}
          />

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            className={cn(
              'w-full h-10 pl-9 pr-9 rounded-xl',
              'bg-white text-gray-900 placeholder:text-gray-500',
              'focus:outline-none',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />

          {/* Clear button */}
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2',
                'w-5 h-5 flex items-center justify-center',
                'bg-gray-400 rounded-full',
                'active:bg-gray-500 transition-colors'
              )}
              aria-label="Clear search"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          )}
        </div>
      </form>

      {/* Cancel button */}
      {showCancel && (
        <button
          type="button"
          onClick={handleCancel}
          className={cn(
            'text-blue-600 font-medium whitespace-nowrap',
            'transition-all duration-200 overflow-hidden',
            isFocused || value
              ? 'opacity-100 w-auto max-w-20'
              : 'opacity-0 w-0 max-w-0'
          )}
        >
          Cancel
        </button>
      )}
    </div>
  );
}
