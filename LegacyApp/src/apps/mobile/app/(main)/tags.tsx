import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Tag as TagIcon, Search, X } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { useAppStore } from '@ppa/store';
import type { Tag } from '@ppa/interfaces';
import { TPFooterButtons } from '@/components/tp';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
  return (
    <View className="bg-white rounded-xl px-4 py-3 flex-row items-center mb-4">
      <Search size={20} color={COLORS.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        className="flex-1 ml-3 text-base text-typography-900"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <X size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

interface TagItemProps {
  tag: Tag;
  onPress: () => void;
}

function TagItem({ tag, onPress }: TagItemProps) {
  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 flex-row items-center"
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
        <TagIcon size={20} color={COLORS.textSecondary} />
      </View>
      <Text className="text-base font-medium text-typography-900 ml-3 flex-1">
        {tag.name}
      </Text>
    </TouchableOpacity>
  );
}

export default function TagsScreen() {
  const router = useRouter();
  const { tags, tagsLoading, setSelectedTag } = useAppStore();
  const [searchQuery, setSearchQuery] = React.useState('');

  // Filter and sort tags
  const filteredTags = useMemo(() => {
    const filtered = tags.filter((tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [tags, searchQuery]);

  const handleAddTag = useCallback(() => {
    setSelectedTag(null);
    router.push('/tag-detail' as never);
  }, [router, setSelectedTag]);

  const handleTagTap = useCallback(
    (tag: Tag) => {
      // Pass tag to detail screen via store
      setSelectedTag(tag);
      router.push('/tag-detail' as never);
    },
    [router, setSelectedTag]
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Tags',
        }}
      />
      <View className="flex-1 bg-background-200">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4">
            {/* Search Bar */}
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search tags..."
            />

            {/* Content */}
            {tagsLoading ? (
              // Loading state
              <View className="items-center justify-center py-20">
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text className="text-sm text-typography-500 mt-4">
                  Loading tags...
                </Text>
              </View>
            ) : tags.length === 0 ? (
              // Empty state - no tags at all
              <View className="items-center justify-center py-20">
                <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                  <TagIcon size={32} color={COLORS.textMuted} />
                </View>
                <Text className="text-lg font-semibold text-typography-700">
                  No tags yet
                </Text>
                <Text className="text-sm text-typography-500 mt-1 text-center px-8">
                  Create your first tag to organize activities
                </Text>
              </View>
            ) : filteredTags.length === 0 ? (
              // Empty search results
              <View className="items-center justify-center py-20">
                <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                  <Search size={32} color={COLORS.textMuted} />
                </View>
                <Text className="text-lg font-semibold text-typography-700">
                  No results found
                </Text>
                <Text className="text-sm text-typography-500 mt-1 text-center px-8">
                  Try a different search term
                </Text>
              </View>
            ) : (
              // Tag list
              <>
                <Text className="text-xs font-semibold text-typography-500 uppercase mb-3 ml-1">
                  {filteredTags.length} {filteredTags.length === 1 ? 'Tag' : 'Tags'}
                </Text>
                {filteredTags.map((tag) => (
                  <TagItem
                    key={tag.id}
                    tag={tag}
                    onPress={() => handleTagTap(tag)}
                  />
                ))}
              </>
            )}
          </View>
        </ScrollView>

        {/* Footer Button */}
        <TPFooterButtons
          mode="view"
          onCancel={() => router.back()}
          onEdit={handleAddTag}
          cancelLabel="Close"
          editLabel="Add Tag"
          canEdit={true}
        />
      </View>
    </>
  );
}
