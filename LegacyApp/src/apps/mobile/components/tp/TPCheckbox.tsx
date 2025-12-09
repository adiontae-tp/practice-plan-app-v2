import { View } from 'react-native';
import {
  Checkbox,
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxIcon,
} from '@/components/ui/checkbox';
import { Check } from 'lucide-react-native';

interface TPCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * TPCheckbox - Checkbox input component for forms
 * Follows TPInput pattern with label and consistent styling
 *
 * @example
 * <TPCheckbox
 *   label="Enable notifications"
 *   checked={enabled}
 *   onChange={setEnabled}
 * />
 */
export function TPCheckbox({
  label,
  checked,
  onChange,
  disabled = false,
  size = 'md',
}: TPCheckboxProps) {
  const handleChange = (value: boolean) => {
    onChange(value);
  };

  return (
    <View className="mb-6">
      <Checkbox
        value="checkbox"
        isChecked={checked}
        onChange={handleChange}
        isDisabled={disabled}
        size={size}
        className="items-start"
      >
        <CheckboxIndicator>
          {checked && <CheckboxIcon as={Check} />}
        </CheckboxIndicator>
        <CheckboxLabel className="ml-2 text-sm font-semibold text-gray-900">
          {label}
        </CheckboxLabel>
      </Checkbox>
    </View>
  );
}
