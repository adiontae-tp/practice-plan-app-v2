import React from 'react';
import { Button, ButtonText, ButtonSpinner, ButtonIcon } from '../ui/button';
import type { LucideIcon } from 'lucide-react-native';

export interface TPButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'solid' | 'outline' | 'link';
  action?: 'primary' | 'secondary' | 'positive' | 'negative';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isDisabled?: boolean;
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
}

export const TPButton = ({
  label,
  onPress,
  variant = 'solid',
  action = 'primary',
  size = 'md',
  isDisabled = false,
  isLoading = false,
  leftIcon,
  rightIcon,
}: TPButtonProps) => {
  return (
    <Button
      onPress={onPress}
      variant={variant}
      action={action}
      size={size}
      isDisabled={isDisabled || isLoading}
    >
      {isLoading && <ButtonSpinner />}
      {leftIcon && !isLoading && <ButtonIcon as={leftIcon} />}
      <ButtonText>{label}</ButtonText>
      {rightIcon && <ButtonIcon as={rightIcon} />}
    </Button>
  );
};
