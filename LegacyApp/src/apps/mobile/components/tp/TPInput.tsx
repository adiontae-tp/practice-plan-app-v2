import { View, Text, TextInput, TextInputProps } from 'react-native';
import { useState } from 'react';
import { COLORS } from '@ppa/ui/branding';

interface TPInputProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/**
 * TPInput - Form input component with label, error, and hint support
 * Follows design tokens for input styling
 *
 * @example
 * <TPInput
 *   label="Team Name"
 *   required
 *   value={teamName}
 *   onChangeText={setTeamName}
 *   error={errors.teamName}
 *   hint="Enter your team or organization name"
 *   placeholder="e.g., Vikings Football"
 * />
 */
export function TPInput({
  label,
  required = false,
  error,
  hint,
  accessibilityLabel,
  accessibilityHint,
  editable = true,
  ...props
}: TPInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-6">
      <Text className="text-sm font-semibold text-gray-900 mb-2">
        {label} {required && <Text className="text-error-500">*</Text>}
      </Text>
      <TextInput
        className={`bg-white rounded-lg px-4 h-12 text-base border ${
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
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint || hint}
        accessibilityRole="text"
        {...props}
      />
      {error && <Text className="text-sm text-error-600 mt-1">{error}</Text>}
      {hint && !error && (
        <Text className="text-xs text-gray-500 mt-1">{hint}</Text>
      )}
    </View>
  );
}
