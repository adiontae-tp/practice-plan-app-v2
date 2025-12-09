import React from 'react';
import { View, useWindowDimensions, ViewStyle } from 'react-native';
import RenderHtml, { defaultSystemFonts } from 'react-native-render-html';
import { COLORS } from '@ppa/ui/branding';

interface TPRichTextDisplayProps {
  html: string;
  style?: ViewStyle;
}

/**
 * TPRichTextDisplay - Safely render HTML content in React Native
 * Uses react-native-render-html for consistent rendering
 */
export function TPRichTextDisplay({ html, style }: TPRichTextDisplayProps) {
  const { width } = useWindowDimensions();

  if (!html || html === '<p></p>' || html === '<br>' || html === '<div><br></div>') {
    return null;
  }

  return (
    <View style={style}>
      <RenderHtml
        contentWidth={width - 40}
        source={{ html }}
        systemFonts={[...defaultSystemFonts, 'System']}
        baseStyle={{
          color: COLORS.textSecondary as string,
          fontSize: 14,
          lineHeight: 20,
        }}
        tagsStyles={{
          p: { marginVertical: 4 },
          ul: { marginVertical: 4, paddingLeft: 16 },
          ol: { marginVertical: 4, paddingLeft: 16 },
          li: { marginVertical: 2 },
          strong: { fontWeight: '600' as const },
          em: { fontStyle: 'italic' as const },
        }}
      />
    </View>
  );
}

export type { TPRichTextDisplayProps };
