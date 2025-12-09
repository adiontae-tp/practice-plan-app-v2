import React, { useRef, useCallback, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import {
  RichEditor,
  RichToolbar,
  actions,
} from 'react-native-pell-rich-editor';
import { COLORS } from '@ppa/ui/branding';

interface TPRichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
  label?: string;
  hint?: string;
  required?: boolean;
  error?: string;
}

/**
 * TPRichTextEditor - Rich text editor with basic formatting
 * Supports: Bold, Italic, Bullet list, Numbered list
 */
export function TPRichTextEditor({
  value,
  onChange,
  placeholder = 'Add notes...',
  disabled = false,
  minHeight = 150,
  label,
  hint,
  required = false,
  error,
}: TPRichTextEditorProps) {
  const editorRef = useRef<RichEditor>(null);

  const handleChange = useCallback(
    (html: string) => {
      // Normalize empty content
      const isEmpty = !html || html === '<br>' || html === '<div><br></div>' || html.trim() === '';
      onChange(isEmpty ? '' : html);
    },
    [onChange]
  );

  // Sync external value changes
  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      // Only set content if it differs to avoid cursor jumping
      editorRef.current.setContentHTML(value || '');
    }
  }, [value]);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <View
        style={[
          styles.editorContainer,
          error && styles.editorContainerError,
          disabled && styles.editorContainerDisabled,
        ]}
      >
        <RichToolbar
          editor={editorRef}
          disabled={disabled}
          selectedIconTint={COLORS.primary}
          iconTint={COLORS.textSecondary}
          style={styles.toolbar}
          actions={[
            actions.setBold,
            actions.setItalic,
            actions.insertBulletsList,
            actions.insertOrderedList,
          ]}
          iconMap={{
            [actions.setBold]: ({ tintColor }: { tintColor: string }) => (
              <Text style={[styles.toolbarIcon, { color: tintColor }]}>B</Text>
            ),
            [actions.setItalic]: ({ tintColor }: { tintColor: string }) => (
              <Text style={[styles.toolbarIcon, styles.toolbarIconItalic, { color: tintColor }]}>
                I
              </Text>
            ),
            [actions.insertBulletsList]: ({ tintColor }: { tintColor: string }) => (
              <Text style={[styles.toolbarIcon, { color: tintColor }]}>•</Text>
            ),
            [actions.insertOrderedList]: ({ tintColor }: { tintColor: string }) => (
              <Text style={[styles.toolbarIcon, { color: tintColor }]}>1.</Text>
            ),
          }}
        />
        <RichEditor
          ref={editorRef}
          style={[styles.editor, { minHeight }]}
          placeholder={placeholder}
          onChange={handleChange}
          disabled={disabled}
          initialContentHTML={value}
          editorStyle={{
            backgroundColor: disabled ? '#f9fafb' : '#ffffff',
            color: COLORS.textPrimary,
            placeholderColor: COLORS.textMuted,
            contentCSSText: `
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 16px;
              line-height: 1.5;
              padding: 12px;
            `,
          }}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  editorContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  editorContainerError: {
    borderColor: '#ef4444',
  },
  editorContainerDisabled: {
    opacity: 0.6,
    backgroundColor: '#f9fafb',
  },
  toolbar: {
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    height: 44,
  },
  toolbarIcon: {
    fontSize: 18,
    fontWeight: '600',
  },
  toolbarIconItalic: {
    fontStyle: 'italic',
  },
  editor: {
    backgroundColor: '#ffffff',
  },
  error: {
    fontSize: 14,
    color: '#dc2626',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});

export type { TPRichTextEditorProps };
