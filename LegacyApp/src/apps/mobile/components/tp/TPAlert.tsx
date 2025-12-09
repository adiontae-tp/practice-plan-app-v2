import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  Pressable,
  Platform
} from 'react-native';

export interface TPAlertProps {
  /** Whether the alert is visible */
  isOpen: boolean;
  /** Callback when alert is closed */
  onClose: () => void;
  /** Alert title */
  title: string;
  /** Alert message (primary text) */
  message: string;
  /** Secondary message (optional) */
  description?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Confirm button label */
  confirmLabel?: string;
  /** Callback when confirm is pressed */
  onConfirm: () => void;
  /** Whether confirm action is loading */
  isLoading?: boolean;
  /** Alert type - determines confirm button style */
  type?: 'default' | 'destructive';
}

/**
 * Custom Alert Dialog using standard React Native Modal
 * Replaces Gluestack AlertDialog for better native performance and simpler dependency
 */
export function TPAlert({
  isOpen,
  onClose,
  title,
  message,
  description,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  onConfirm,
  isLoading = false,
  type = 'default',
}: TPAlertProps) {
  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        {/* Dialog Content */}
        <View className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-xl">
          {/* Header */}
          <Text className="text-lg font-bold text-gray-900 mb-2">
            {title}
          </Text>

          {/* Body */}
          <View className="mb-6">
            <Text className="text-base text-gray-600 leading-relaxed">
              {message}
            </Text>
            {description && (
              <Text className="text-sm text-gray-500 mt-2 leading-relaxed">
                {description}
              </Text>
            )}
          </View>

          {/* Footer / Buttons */}
          <View className="flex-row justify-end items-center gap-3">
            {/* Cancel Button */}
            <TouchableOpacity
              onPress={onClose}
              disabled={isLoading}
              className="px-3 py-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text className="text-base font-medium text-gray-500">
                {cancelLabel}
              </Text>
            </TouchableOpacity>

            {/* Confirm Button */}
            <TouchableOpacity
              onPress={onConfirm}
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-lg flex-row items-center justify-center min-w-[90px] ${
                type === 'destructive' ? 'bg-red-500' : 'bg-[#356793]'
              } ${isLoading ? 'opacity-80' : ''}`}
            >
              {isLoading && (
                <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
              )}
              <Text className="text-base font-semibold text-white">
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}