import React, { ReactNode } from 'react';
import { View } from 'react-native';
import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetBackdrop,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';

export type TPActionSheetDetent = 'medium' | 'large' | number;

export interface TPActionSheetProps {
  /** Content to display in the action sheet */
  children: ReactNode;
  /** Whether the action sheet is open */
  isOpen: boolean;
  /** Callback when open state changes */
  onOpenChange: (isOpen: boolean) => void;
  /** Heights the sheet can snap to (default: ['medium', 'large']) - currently only affects max height */
  detents?: TPActionSheetDetent[];
  /** Whether to show the drag indicator */
  showDragIndicator?: boolean;
  /** Disable swipe-to-dismiss */
  preventDismiss?: boolean;
}

/**
 * TPActionSheet - Action sheet modal using GlueStack Actionsheet
 * Used for quick actions, menus, and simple selections
 * For more complex forms or content, use TPBottomSheet (Gorhom)
 */
export const TPActionSheet = ({
  children,
  isOpen,
  onOpenChange,
  detents = ['medium', 'large'],
  showDragIndicator = true,
  preventDismiss = false,
}: TPActionSheetProps) => {
  const handleClose = () => {
    if (!preventDismiss) {
      onOpenChange(false);
    }
  };

  // Calculate max height based on detents
  const getMaxHeightClass = () => {
    const largestDetent = detents[detents.length - 1];
    if (largestDetent === 'large' || (typeof largestDetent === 'number' && largestDetent > 0.6)) {
      return 'max-h-[85%]';
    }
    if (largestDetent === 'medium' || (typeof largestDetent === 'number' && largestDetent > 0.4)) {
      return 'max-h-[60%]';
    }
    return 'max-h-[40%]';
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={handleClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className={getMaxHeightClass()}>
        {showDragIndicator && (
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
        )}
        <View className="w-full px-4 pb-4">
          {children}
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
};
