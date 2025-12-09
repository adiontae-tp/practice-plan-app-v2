import React, { ReactNode, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import {
  BottomSheet,
  BottomSheetPortal,
  BottomSheetBackdrop,
  BottomSheetContent,
  BottomSheetDragIndicator,
  BottomSheetScrollView,
} from '@/components/ui/bottomsheet';

export type TPBottomSheetDetent = 'small' | 'medium' | 'large' | 'full' | number;

export interface TPBottomSheetProps {
  /** Content to display in the bottom sheet */
  children: ReactNode;
  /** Whether the bottom sheet is open */
  isOpen: boolean;
  /** Callback when open state changes */
  onOpenChange: (isOpen: boolean) => void;
  /** Heights the sheet can snap to (default: ['medium', 'large']) */
  detents?: TPBottomSheetDetent[];
  /** Whether to show the drag indicator (default: true) */
  showDragIndicator?: boolean;
  /** Disable swipe-to-dismiss */
  preventDismiss?: boolean;
  /** Enable scrollable content */
  scrollable?: boolean;
}

/**
 * Convert detent values to snap point percentages
 */
const detentToSnapPoint = (detent: TPBottomSheetDetent): string => {
  if (typeof detent === 'number') {
    return `${Math.round(detent * 100)}%`;
  }
  switch (detent) {
    case 'small':
      return '25%';
    case 'medium':
      return '50%';
    case 'large':
      return '75%';
    case 'full':
      return '90%';
    default:
      return '50%';
  }
};

/**
 * TPBottomSheet - Bottom sheet modal using Gorhom Bottom Sheet
 * Used for forms, complex content, and multi-step flows
 * For simple menus or quick actions, use TPActionSheet
 */
export const TPBottomSheet = ({
  children,
  isOpen,
  onOpenChange,
  detents = ['medium', 'large'],
  showDragIndicator = true,
  preventDismiss = false,
  scrollable = false,
}: TPBottomSheetProps) => {
  // Convert detents to snap points
  const snapPoints = useMemo(
    () => detents.map(detentToSnapPoint),
    [detents]
  );

  const handleOpen = useCallback(() => {
    onOpenChange(true);
  }, [onOpenChange]);

  const handleClose = useCallback(() => {
    if (!preventDismiss) {
      onOpenChange(false);
    }
  }, [onOpenChange, preventDismiss]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior={preventDismiss ? 'none' : 'close'}
      />
    ),
    [preventDismiss]
  );

  const renderHandle = useCallback(
    (props: any) =>
      showDragIndicator ? (
        <BottomSheetDragIndicator {...props}>
          <View className="w-10 h-1 bg-background-300 rounded-full my-2" />
        </BottomSheetDragIndicator>
      ) : null,
    [showDragIndicator]
  );

  const content = scrollable ? (
    <BottomSheetScrollView className="flex-1">
      <View className="px-4 pb-4">{children}</View>
    </BottomSheetScrollView>
  ) : (
    <BottomSheetContent>
      <View className="px-4 pb-4">{children}</View>
    </BottomSheetContent>
  );

  return (
    <BottomSheet onOpen={handleOpen} onClose={handleClose}>
      {isOpen && (
        <BottomSheetPortal
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          handleComponent={renderHandle}
          enablePanDownToClose={!preventDismiss}
          index={isOpen ? 0 : -1}
        >
          {content}
        </BottomSheetPortal>
      )}
    </BottomSheet>
  );
};

// Re-export scroll components for use within TPBottomSheet
export { BottomSheetScrollView, BottomSheetTextInput } from '@/components/ui/bottomsheet';
