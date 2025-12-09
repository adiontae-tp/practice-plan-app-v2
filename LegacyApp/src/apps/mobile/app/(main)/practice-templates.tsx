import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Search, X, LayoutTemplate } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { useAppStore } from '@ppa/store';
import type { Template } from '@ppa/interfaces';
import { TPFooterButtons, TPUpgradeBanner } from '@/components/tp';
import { useSubscription } from '@/hooks/useSubscription';

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


interface TemplateCardProps {
  template: Template;
  onPress: () => void;
}

function TemplateCard({ template, onPress }: TemplateCardProps) {
  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3"
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-base font-semibold text-typography-900">
            {template.name}
          </Text>
          <View className="mt-2">
            <Text className="text-sm text-typography-500">
              {template.activities.length} {template.activities.length === 1 ? 'period' : 'periods'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function PracticeTemplatesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { checkFeature, features } = useSubscription();
  const canCreateTemplates = features.canCreateTemplates;

  const { setSelectedTag } = useAppStore();
  const templates = useAppStore((state) => state.templates);
  const templatesLoading = useAppStore((state) => state.templatesLoading);

  const filteredTemplates = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const filtered = templates.filter((template) =>
      template.name.toLowerCase().includes(query)
    );
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [templates, searchQuery]);

  const handleAddTemplate = useCallback(() => {
    if (!checkFeature('canCreateTemplates')) {
      return;
    }
    setSelectedTag(null);
    router.push('/practice-template-detail' as never);
  }, [router, setSelectedTag, checkFeature]);

  const handleTemplateTap = useCallback(
    (template: Template) => {
      setSelectedTag(template);
      router.push('/practice-template-detail' as never);
    },
    [router, setSelectedTag]
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Practice Templates' }} />

      {!canCreateTemplates && (
        <TPUpgradeBanner
          feature="canCreateTemplates"
          message="Upgrade to create custom templates"
        />
      )}

      <View className="flex-1 bg-background-200">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4">
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search templates..."
            />

            {templatesLoading ? (
              <View className="items-center justify-center py-20">
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : templates.length === 0 ? (
              <View className="items-center justify-center py-20">
                <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                  <LayoutTemplate size={32} color={COLORS.textMuted} />
                </View>
                <Text className="text-lg font-semibold text-typography-700">
                  No practice templates yet
                </Text>
                <Text className="text-sm text-typography-500 mt-1 text-center px-8">
                  Create your first template to quickly plan practices
                </Text>
              </View>
            ) : filteredTemplates.length === 0 ? (
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
              <>
                <Text className="text-xs font-semibold text-typography-500 uppercase mb-3 ml-1">
                  {filteredTemplates.length}{' '}
                  {filteredTemplates.length === 1 ? 'Template' : 'Templates'}
                </Text>
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onPress={() => handleTemplateTap(template)}
                  />
                ))}
              </>
            )}
          </View>
        </ScrollView>

        <TPFooterButtons
          mode="view"
          onCancel={() => router.back()}
          onEdit={handleAddTemplate}
          cancelLabel="Close"
          editLabel="Add Template"
          canEdit={true}
        />
      </View>
    </>
  );
}
