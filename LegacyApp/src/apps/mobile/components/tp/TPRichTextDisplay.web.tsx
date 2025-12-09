import React from 'react';

export interface TPRichTextDisplayProps {
  html: string;
  style?: React.CSSProperties;
}

/**
 * TPRichTextDisplay - Web version using dangerouslySetInnerHTML
 * Safely render HTML content on web
 */
export function TPRichTextDisplay({ html, style }: TPRichTextDisplayProps) {
  if (!html || html === '<p></p>' || html === '<br>' || html === '<div><br></div>') {
    return null;
  }

  return (
    <div
      style={{
        color: '#6b7280',
        fontSize: '14px',
        lineHeight: '20px',
        ...style,
      }}
      className="rich-text-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export type { TPRichTextDisplayProps };
