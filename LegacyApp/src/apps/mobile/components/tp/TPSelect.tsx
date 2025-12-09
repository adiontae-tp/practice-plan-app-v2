import { View, Text, Pressable, ScrollView } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { ChevronDown, Check } from 'lucide-react-native';
import { useRef, useCallback, useMemo, useState } from 'react';
import { COLORS } from '@ppa/ui/branding';

export interface TPSelectOption {
  label: string;
  value: string;
}

interface TPSelectProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  placeholder?: string;
  options: TPSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  onDelete?: (values: string[]) => void | Promise<void>;
  disabled?: boolean;
  snapPoints?: string[];
  allowDelete?: boolean;
}

/**
 * TPSelect - Select/dropdown component with label, error, and hint support
 * Uses Gorhom BottomSheet for a native bottom sheet experience
 *
 * @example
 * <TPSelect
 *   label="Role"
 *   required
 *   options={[
 *     { label: 'Admin', value: 'admin' },
 *     { label: 'Editor', value: 'edit' },
 *     { label: 'Viewer', value: 'view' }
 *   ]}
 *   value={role}
 *   onValueChange={setRole}
 *   error={errors.role}
 * />
 */
export function TPSelect({
  label,
  required = false,
  error,
  hint,
  placeholder = 'Select an option...',
  options = [],
  value,
  onValueChange,
  onDelete,
  disabled = false,
  snapPoints: customSnapPoints,
  allowDelete = false,
}: TPSelectProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);

  const snapPoints = useMemo(
    () => customSnapPoints || ['85%'],
    [customSnapPoints]
  );

  const validOptions = options.filter((opt) => opt && opt.value && opt.label);
  const selectedOption = validOptions.find((opt) => opt.value === value);

  const handlePresent = useCallback(() => {
    if (!disabled) {
      bottomSheetRef.current?.present();
    }
  }, [disabled]);

  const handleDismiss = useCallback(() => {
    bottomSheetRef.current?.dismiss();
    setIsEditMode(false);
    setSelectedForDelete([]);
  }, []);

  const handleSelect = useCallback(
    (selectedValue: string) => {
      if (isEditMode) {
        setSelectedForDelete((prev) =>
          prev.includes(selectedValue)
            ? prev.filter((v) => v !== selectedValue)
            : [...prev, selectedValue]
        );
      } else {
        handleDismiss();
        setTimeout(() => {
          onValueChange?.(selectedValue);
        }, 200);
      }
    },
    [isEditMode, onValueChange, handleDismiss]
  );

  const handleToggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
    setSelectedForDelete([]);
  }, []);

  const handleDelete = useCallback(async () => {
    if (selectedForDelete.length > 0 && onDelete) {
      await onDelete(selectedForDelete);
      setSelectedForDelete([]);
      setIsEditMode(false);
    }
  }, [selectedForDelete, onDelete]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <View className="mb-6">
      <Text className="text-sm font-semibold text-gray-900 mb-2">
        {label} {required && <Text className="text-error-500">*</Text>}
      </Text>

      {/* Trigger Button */}
      <Pressable
        onPress={handlePresent}
        disabled={disabled}
        className={`bg-white rounded-lg border ${error ? 'border-error-500' : 'border-gray-200'} ${disabled ? 'opacity-60 bg-gray-50' : ''} h-12 flex-row items-center justify-between px-4`}
      >
        <Text
          className={
            selectedOption ? 'text-gray-900 text-base' : 'text-gray-400 text-base'
          }
        >
          {selectedOption?.label || placeholder}
        </Text>
        <ChevronDown
          size={18}
          color={disabled ? COLORS.textMuted : COLORS.textSecondary}
        />
      </Pressable>

      {error && <Text className="text-sm text-error-600 mt-1">{error}</Text>}
      {hint && !error && (
        <Text className="text-xs text-gray-500 mt-1">{hint}</Text>
      )}

      {/* Bottom Sheet */}
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        enableDynamicSizing={false}
        enableContentPanningGesture={true}
        handleIndicatorStyle={{
          backgroundColor: COLORS.borderLight,
          width: 40,
        }}
      >
        <BottomSheetView style={{ flex: 1 }}>
          <View className="px-6 pb-4 pt-2 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">{label}</Text>
              {hint && !isEditMode && (
                <Text className="text-sm text-gray-600 mt-1">{hint}</Text>
              )}
            </View>
            <View className="flex-row items-center gap-2">
              {isEditMode && selectedForDelete.length > 0 && (
                <Pressable
                  onPress={handleDelete}
                  className="px-3 py-2 rounded-lg bg-red-600 active:bg-red-700"
                >
                  <Text className="text-sm font-semibold text-white">
                    Delete ({selectedForDelete.length})
                  </Text>
                </Pressable>
              )}
              {allowDelete && (
                <Pressable
                  onPress={handleToggleEditMode}
                  className="px-4 py-2 rounded-lg bg-gray-100 active:bg-gray-200"
                >
                  <Text className="text-sm font-semibold text-gray-700">
                    {isEditMode ? 'Done' : 'Edit'}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 200 }}
          >
            {validOptions.map((option) => {
              const isSelected = option.value === value;
              const isSelectedForDelete = selectedForDelete.includes(
                option.value
              );
              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  className={`flex-row items-center justify-between px-6 py-4 border-b border-gray-100 ${
                    isSelectedForDelete
                      ? 'bg-red-50'
                      : isSelected && !isEditMode
                        ? 'bg-primary-50'
                        : 'bg-white'
                  } active:bg-gray-50`}
                >
                  <Text
                    className={`text-base flex-1 ${
                      isSelectedForDelete
                        ? 'text-red-600 font-semibold'
                        : isSelected && !isEditMode
                          ? 'text-primary-600 font-semibold'
                          : 'text-gray-900'
                    }`}
                  >
                    {option.label}
                  </Text>
                  {isEditMode ? (
                    <View
                      className={`w-6 h-6 rounded border-2 items-center justify-center ${
                        isSelectedForDelete
                          ? 'bg-red-600 border-red-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelectedForDelete && <Check size={16} color="#ffffff" />}
                    </View>
                  ) : (
                    isSelected && <Check size={20} color={COLORS.primary[600]} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}
