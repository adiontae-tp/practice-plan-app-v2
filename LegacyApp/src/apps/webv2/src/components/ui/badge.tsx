import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary-500 text-white shadow hover:bg-primary-600',
        secondary:
          'border-transparent bg-secondary-100 text-secondary-900 hover:bg-secondary-200',
        destructive:
          'border-transparent bg-error-500 text-white shadow hover:bg-error-600',
        outline: 'text-typography-900',
        success:
          'border-transparent bg-success-100 text-success-700',
        warning:
          'border-transparent bg-warning-100 text-warning-700',
        info:
          'border-transparent bg-info-100 text-info-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
