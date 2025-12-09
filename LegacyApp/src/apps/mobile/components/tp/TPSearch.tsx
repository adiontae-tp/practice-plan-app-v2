import { View, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';

interface TPSearchProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

/**
 * TPSearch - Search input component with icon
 *
 * @example
 * <TPSearch
 *   value={searchQuery}
 *   onChangeText={setSearchQuery}
 *   placeholder="Search by name..."
 * />
 */
export function TPSearch({
  value,
  onChangeText,
  placeholder = 'Search...',
}: TPSearchProps) {
  return (
    <View className="px-5 py-3 bg-white border-b border-gray-200">
      <View className="relative">
        <View className="absolute left-3 top-3 z-10">
          <Search size={16} color="#999" />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          className="bg-gray-100 rounded-lg pl-10 pr-4 py-2.5 text-base text-gray-900 border border-gray-200"
        />
      </View>
    </View>
  );
}
