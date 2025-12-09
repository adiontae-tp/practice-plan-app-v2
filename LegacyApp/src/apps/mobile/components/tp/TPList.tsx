import { ComponentType, useState } from 'react';
import { ActivityIndicator, FlatList, TouchableOpacity, View } from 'react-native';
import { Clipboard } from 'lucide-react-native';
import { useIsDesktop } from '@/utils/responsive';
import { COLORS } from '@ppa/ui/branding';
import { TPEmpty } from './TPEmpty';
import { TPFab } from './TPFab';
import { TPHeader } from './TPHeader';
import { TPSearch } from './TPSearch';

interface TPListProps<T> {
  // Data
  items: T[];
  loading?: boolean;

  // Display
  renderItem: (item: T) => React.ReactElement | null;
  keyExtractor: (item: T) => string;

  // Empty state
  emptyIcon?: ComponentType<{ size?: number; color?: string }>;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    onPress: () => void;
  };

  // Search
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];

  // Header
  title?: string;
  subtitle?: string;
  headerAction?: {
    label: string;
    icon?: ComponentType<{ size?: number; color?: string }>;
    onPress: () => void;
  };

  // FAB
  fab?: {
    icon: ComponentType<{ size?: number; color?: string }>;
    label?: string;
    onPress: () => void;
  };

  // Item press
  onItemPress?: (item: T) => void;

  // Permission check - if false, FAB won't show
  canEdit?: boolean;
}

/**
 * TPList - Smart list component with search, empty states, header, and FAB
 * Generic type support for any data type
 *
 * @example
 * <TPList
 *   items={periods}
 *   loading={loading}
 *   renderItem={(period) => <PeriodCard period={period} />}
 *   keyExtractor={(p) => p.id}
 *   searchable
 *   searchKeys={['name', 'notes']}
 *   title="Period Templates"
 *   emptyTitle="No periods yet"
 *   fab={{ icon: Plus, label: 'New Period', onPress: handleCreate }}
 * />
 */
export function TPList<T>({
  items,
  loading = false,
  renderItem,
  keyExtractor,
  emptyIcon = Clipboard,
  emptyTitle = 'No items',
  emptyMessage = 'Get started by creating your first item',
  emptyAction,
  searchable = false,
  searchPlaceholder = 'Search...',
  searchKeys = [],
  title,
  subtitle,
  headerAction,
  fab,
  onItemPress,
  canEdit = true,
}: TPListProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const isDesktop = useIsDesktop();

  // Search/filter logic
  const filteredItems =
    searchable && searchQuery
      ? items.filter((item) =>
          searchKeys.some((key) => {
            const value = item[key];
            return String(value).toLowerCase().includes(searchQuery.toLowerCase());
          })
        )
      : items;

  return (
    <View className="flex-1 bg-[#e0e0e0]">
      {/* Header - Only show on desktop, mobile uses Expo Router headers */}
      {isDesktop && (title || headerAction) && (
        <TPHeader title={title} subtitle={subtitle} action={headerAction} />
      )}

      {/* Search */}
      {searchable && (
        <TPSearch
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={searchPlaceholder}
        />
      )}

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary[500]} />
        </View>
      ) : filteredItems.length === 0 ? (
        <TPEmpty
          icon={emptyIcon}
          title={searchQuery ? 'No results found' : emptyTitle}
          message={searchQuery ? 'Try a different search term' : emptyMessage}
          action={!searchQuery ? emptyAction : undefined}
        />
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={({ item }) => {
            const rendered = renderItem(item);
            if (!rendered) return null;

            // If onItemPress is provided, wrap the item in a TouchableOpacity
            if (onItemPress) {
              return (
                <TouchableOpacity
                  onPress={() => onItemPress(item)}
                  activeOpacity={0.7}
                >
                  {rendered}
                </TouchableOpacity>
              );
            }

            return rendered;
          }}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        />
      )}

      {/* FAB - Only show if user has edit permission */}
      {fab && canEdit && <TPFab {...fab} />}
    </View>
  );
}
