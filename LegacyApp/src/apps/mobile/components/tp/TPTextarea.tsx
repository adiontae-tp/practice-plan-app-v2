import { View, Text, TextInput, TextInputProps } from 'react-native';
import { useState } from 'react';
import { COLORS } from '@ppa/ui/branding';

interface TPTextareaProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  rows?: number;
}

/**
 * TPTextarea - Multiline text input component with label, error, and hint
 * Follows design tokens for textarea styling
 *
 * @example
 * <TPTextarea
 *   label="Notes"
 *   value={notes}
 *   onChangeText={setNotes}
 *   hint="Add setup instructions, coaching points, or variations"
 *   rows={4}
 * />
 */
export function TPTextarea({
  label,
  required = false,
  error,
  hint,
  rows = 4,
  editable = true,
  ...props
}: TPTextareaProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-6">
      <Text className="text-sm font-semibold text-gray-900 mb-2">
        {label} {required && <Text className="text-error-500">*</Text>}
      </Text>
      <TextInput
        className={`bg-white rounded-lg p-4 text-base border min-h-[100px] ${
          error
            ? 'border-error-500'
            : isFocused
              ? 'border-primary-500'
              : 'border-gray-200'
        } ${!editable ? 'opacity-60 bg-gray-50' : ''}`}
        placeholderTextColor={COLORS.textMuted}
        editable={editable}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        multiline
        numberOfLines={rows}
        textAlignVertical="top"
        {...props}
      />
      {error && <Text className="text-sm text-error-600 mt-1">{error}</Text>}
      {hint && !error && (
        <Text className="text-xs text-gray-500 mt-1">{hint}</Text>
      )}
    </View>
  );
}
