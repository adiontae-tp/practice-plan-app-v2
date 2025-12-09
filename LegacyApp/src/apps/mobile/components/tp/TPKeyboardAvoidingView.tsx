import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { TP_FOOTER_HEIGHT } from './TPFooterButtons';

export interface TPKeyboardAvoidingViewProps {
  children: ReactNode;
  /** Custom style for the container */
  style?: ViewStyle;
}

/**
 * TPKeyboardAvoidingView - Wrapper that properly handles keyboard avoidance
 *
 * Note: Footer buttons (TPFooterButtons) are positioned absolutely at the bottom
 * and will stay behind the keyboard. Users must dismiss the keyboard to interact
 * with footer buttons.
 *
 * This wrapper ensures the container has relative positioning for absolute footer.
 * ScrollViews inside should add bottom padding using TP_FOOTER_HEIGHT constant.
 *
 * @example
 * <TPKeyboardAvoidingView>
 *   <ScrollView 
 *     className="flex-1"
 *     contentContainerStyle={{ paddingBottom: TP_FOOTER_HEIGHT }}
 *   >
 *     {content}
 *   </ScrollView>
 *   <TPFooterButtons ... />
 * </TPKeyboardAvoidingView>
 */
export const TPKeyboardAvoidingView = ({
  children,
  style,
}: TPKeyboardAvoidingViewProps) => {
  // Container needs relative positioning for absolutely positioned footer
  // Footer stays at bottom behind keyboard - no keyboard avoidance padding
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative', // Required for absolutely positioned footer
  },
});
