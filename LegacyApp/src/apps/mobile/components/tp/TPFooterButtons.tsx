import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@ppa/ui/branding';

/**
 * Approximate footer height for adding bottom padding to ScrollViews
 * Footer height = paddingTop (10) + button height (56) + paddingBottom (10-34 depending on safe area)
 * Using max safe area inset (34) for worst case
 */
export const TP_FOOTER_HEIGHT = 100;

export interface TPFooterButtonsProps {
  /** Mode determines button labels and actions */
  mode?: 'view' | 'edit';
  /** Cancel/Close action */
  onCancel: () => void;
  /** Save action (edit mode only) */
  onSave?: () => void;
  /** Edit action (view mode only) */
  onEdit?: () => void;
  /** Label for save button */
  saveLabel?: string;
  /** Label for cancel button */
  cancelLabel?: string;
  /** Label for edit button */
  editLabel?: string;
  /** Shows loading spinner on primary button */
  loading?: boolean;
  /** Disables save button */
  saveDisabled?: boolean;
  /** Whether user can edit (view mode) */
  canEdit?: boolean;
}

/**
 * TPFooterButtons - Sticky footer with Cancel/Save or Close/Edit buttons
 * Required for all CRUD operations on mobile screens and modals.
 *
 * @example
 * // Edit mode (forms)
 * <TPFooterButtons
 *   mode="edit"
 *   onCancel={handleCancel}
 *   onSave={handleSave}
 *   saveLabel="Create"
 *   loading={isSubmitting}
 * />
 *
 * @example
 * // View mode (detail screens)
 * <TPFooterButtons
 *   mode="view"
 *   onCancel={handleClose}
 *   onEdit={handleEdit}
 *   cancelLabel="Close"
 * />
 */
export const TPFooterButtons = ({
  mode = 'edit',
  onCancel,
  onSave,
  onEdit,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  editLabel = 'Edit',
  loading = false,
  saveDisabled = false,
  canEdit = true,
}: TPFooterButtonsProps) => {
  const insets = useSafeAreaInsets();

  const isPrimaryDisabled =
    mode === 'edit' ? loading || saveDisabled : !canEdit;

  const handlePrimaryPress = () => {
    if (mode === 'edit') {
      onSave?.();
    } else {
      onEdit?.();
    }
  };

  return (
    <View
      style={[
        styles.footer,
        { paddingBottom: Math.max(insets.bottom, 10) }
      ]}
    >
      <View className="flex-row gap-3">
        {/* Cancel/Close Button */}
        <TouchableOpacity
          onPress={onCancel}
          disabled={loading}
          activeOpacity={0.6}
          className="flex-1 h-14 rounded-xl border border-outline-300 bg-white items-center justify-center"
        >
          <Text className="text-lg font-semibold text-typography-700">
            {cancelLabel}
          </Text>
        </TouchableOpacity>

        {/* Save/Edit Button */}
        <TouchableOpacity
          onPress={handlePrimaryPress}
          disabled={isPrimaryDisabled}
          activeOpacity={0.8}
          className={`flex-1 h-14 rounded-xl items-center justify-center ${
            isPrimaryDisabled ? 'bg-background-300' : 'bg-primary-500'
          }`}
        >
          {loading && mode === 'edit' ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text className={`text-lg font-semibold ${
              isPrimaryDisabled ? 'text-gray-600' : 'text-white'
            }`}>
              {mode === 'edit' ? saveLabel : editLabel}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
});
