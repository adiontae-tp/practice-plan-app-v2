import React, { ReactNode, useState } from 'react';
import { View, Pressable } from 'react-native';
import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetBackdrop,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import type { LucideIcon } from 'lucide-react-native';

export interface TPContextMenuItem {
  /** Unique identifier for the item */
  id: string;
  /** Display label */
  label: string;
  /** Optional Lucide icon component */
  icon?: LucideIcon;
  /** Whether the item is destructive (shown in red) */
  destructive?: boolean;
}

export interface TPContextMenuProps {
  /** The trigger element that opens the menu */
  children: ReactNode;
  /** Menu items to display */
  items: TPContextMenuItem[];
  /** Callback when an item is selected */
  onSelect: (itemId: string) => void;
  /** Activation method */
  activationMethod?: 'singlePress' | 'longPress';
  /** Whether the menu is disabled */
  disabled?: boolean;
}

export const TPContextMenu = ({
  children,
  items,
  onSelect,
  activationMethod = 'longPress',
  disabled = false,
}: TPContextMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSelect = (itemId: string) => {
    handleClose();
    onSelect(itemId);
  };

  if (disabled) {
    return <View className="opacity-50">{children}</View>;
  }

  return (
    <>
      <Pressable
        onPress={activationMethod === 'singlePress' ? handleOpen : undefined}
        onLongPress={activationMethod === 'longPress' ? handleOpen : undefined}
        delayLongPress={500}
      >
        {children}
      </Pressable>

      <Actionsheet isOpen={isOpen} onClose={handleClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          {items.map((item) => {
            const IconComponent = item.icon;
            return (
              <ActionsheetItem
                key={item.id}
                onPress={() => handleSelect(item.id)}
              >
                {IconComponent && (
                  <IconComponent
                    size={20}
                    className={item.destructive ? 'text-red-600' : 'text-typography-600'}
                  />
                )}
                <ActionsheetItemText
                  className={item.destructive ? 'text-red-600' : 'text-typography-700'}
                >
                  {item.label}
                </ActionsheetItemText>
              </ActionsheetItem>
            );
          })}
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
};
