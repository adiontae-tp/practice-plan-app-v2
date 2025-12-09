'use client';

import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';

interface TPRichTextDisplayProps {
  html: string;
  className?: string;
}

/**
 * TPRichTextDisplay - Safely render HTML content
 * Sanitizes HTML to prevent XSS attacks
 */
export function TPRichTextDisplay({ html, className }: TPRichTextDisplayProps) {
  if (!html || html === '<p></p>') {
    return null;
  }

  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'strong', 'em', 'ul', 'ol', 'li', 'br'],
    ALLOWED_ATTR: [],
  });

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none',
        '[&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1',
        '[&_li]:my-0.5',
        'text-gray-700',
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

export type { TPRichTextDisplayProps };
