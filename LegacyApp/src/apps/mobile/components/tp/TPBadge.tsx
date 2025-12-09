import React from 'react';
import { Badge, BadgeText, BadgeIcon } from '@/components/ui/badge';
import type { LucideIcon } from 'lucide-react-native';

export interface TPBadgeProps {
  /** Badge text content */
  text: string;
  /** Badge action/color variant */
  action?: 'error' | 'warning' | 'success' | 'info' | 'muted';
  /** Badge style variant */
  variant?: 'solid' | 'outline';
  /** Badge size */
  size?: 'sm' | 'md' | 'lg';
  /** Optional icon */
  icon?: LucideIcon;
  /** Additional className */
  className?: string;
}

/**
 * TPBadge - Team Parcee Badge Component
 *
 * Simplified badge wrapper with consistent props.
 *
 * Sizes:
 * - sm: Extra small text (2xs)
 * - md: Small text (xs)
 * - lg: Regular text (sm)
 */
export function TPBadge({
  text,
  action = 'muted',
  variant = 'solid',
  size = 'sm',
  icon: Icon,
  className = '',
}: TPBadgeProps) {
  return (
    <Badge action={action} variant={variant} size={size} className={className}>
      {Icon && <BadgeIcon as={Icon} />}
      <BadgeText>{text}</BadgeText>
    </Badge>
  );
}

/**
 * TPCountBadge - Team Parcee Count Badge
 *
 * Specialized badge for displaying counts (e.g., practice counts on calendar).
 */
export interface TPCountBadgeProps {
  /** Count to display */
  count: number;
  /** Whether this is highlighted (e.g., on today's date) */
  isHighlighted?: boolean;
  /** Badge size */
  size?: 'sm' | 'md' | 'lg';
}

export function TPCountBadge({
  count,
  isHighlighted = false,
  size = 'sm',
}: TPCountBadgeProps) {
  if (count === 0) return null;

  return (
    <Badge
      action={isHighlighted ? 'info' : 'info'}
      size={size}
      className={`rounded-full min-w-[20px] justify-center ${
        isHighlighted ? 'bg-white' : 'bg-primary-500'
      }`}
    >
      <BadgeText
        className={`text-center ${
          isHighlighted ? 'text-primary-500' : 'text-white'
        }`}
      >
        {count}
      </BadgeText>
    </Badge>
  );
}
