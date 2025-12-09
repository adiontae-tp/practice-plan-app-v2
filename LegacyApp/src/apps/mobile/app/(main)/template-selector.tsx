/**
 * Template Selector Modal
 * Route: /(main)/template-selector.tsx
 *
 * Allows selecting a practice template to apply to the current plan.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { X, Search, Layers, LayoutTemplate } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { Template } from '@ppa/interfaces';
import { useAppStore } from '@ppa/store';
import { TPButton, TPEmpty, TPAlert } from '@/components/tp';

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export default function TemplateSelectorScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);

  const templates = useAppStore((state) => state.templates);
  const templatesLoading = useAppStore((state) => state.templatesLoading);
  const setSelectedPeriodActivities = useAppStore((state) => state.setSelectedPeriodActivities);

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;

    const query = searchQuery.toLowerCase();
    return templates.filter((template) =>
      template.name.toLowerCase().includes(query)
    );
  }, [searchQuery, templates]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleSelectTemplate = useCallback((template: Template) => {
    setSelectedTemplate(template);
    setShowConfirmAlert(true);
  }, []);

  const handleApplyTemplate = useCallback(() => {
    if (!selectedTemplate) return;

    setSelectedPeriodActivities(selectedTemplate.activities);
    setShowConfirmAlert(false);
    router.back();
  }, [router, selectedTemplate, setSelectedPeriodActivities]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Use Template',
          headerLeft: () => (
            <TouchableOpacity onPress={handleClose} className="p-2">
              <X size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <View className="flex-1 bg-[#e0e0e0]">
        <View className="px-4 pt-4">
          <View className="bg-white rounded-xl px-4 py-3 flex-row items-center">
            <Search size={20} color={COLORS.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search templates..."
              placeholderTextColor={COLORS.textMuted}
              className="flex-1 ml-3 text-base text-gray-900"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View className="mx-4 mt-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <Text className="text-blue-700 text-sm">
            Selecting a template will add its periods to your plan.
          </Text>
        </View>

        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {templatesLoading ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : filteredTemplates.length === 0 ? (
            <TPEmpty
              icon={LayoutTemplate}
              title="No templates found"
              message={
                searchQuery
                  ? 'Try a different search'
                  : 'Create templates in Practice Templates'
              }
            />
          ) : (
            <>
              <Text className="text-xs font-semibold text-gray-500 uppercase mb-3">
                {filteredTemplates.length}{' '}
                {filteredTemplates.length === 1 ? 'Template' : 'Templates'}
              </Text>

              {filteredTemplates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  onPress={() => handleSelectTemplate(template)}
                  activeOpacity={0.7}
                >
                  <View className="bg-white rounded-xl p-4 mb-3">
                    <View className="flex-row items-start justify-between mb-2">
                      <Text className="text-lg font-semibold text-gray-900 flex-1">
                        {template.name}
                      </Text>
                      <View className="bg-primary-50 px-2 py-1 rounded">
                        <Text className="text-sm font-medium text-primary-600">
                          {formatDuration(template.duration)}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center mb-3">
                      <Layers size={14} color={COLORS.textMuted} />
                      <Text className="text-sm text-gray-600 ml-1">
                        {template.activities.length} periods
                      </Text>
                    </View>

                    <View className="border-t border-gray-100 pt-3">
                      {template.activities.slice(0, 3).map((activity) => (
                        <View
                          key={activity.id}
                          className="flex-row items-center justify-between py-1.5"
                        >
                          <Text className="text-sm text-gray-700">{activity.name}</Text>
                          <Text className="text-sm text-gray-500">
                            {activity.duration}m
                          </Text>
                        </View>
                      ))}
                      {template.activities.length > 3 && (
                        <Text className="text-sm text-gray-400 mt-1">
                          +{template.activities.length - 3} more
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          <View className="h-24" />
        </ScrollView>

        <View className="bg-white border-t border-gray-200 px-4 py-4 pb-8">
          <TPButton variant="outline" action="secondary" onPress={handleClose}>
            Cancel
          </TPButton>
        </View>

        <TPAlert
          isOpen={showConfirmAlert}
          onClose={() => setShowConfirmAlert(false)}
          title="Apply Template?"
          message={`This will add ${selectedTemplate?.activities.length} periods from "${selectedTemplate?.name}" to your plan.`}
          description="Any existing periods will be kept."
          cancelLabel="Cancel"
          confirmLabel="Apply Template"
          onConfirm={handleApplyTemplate}
        />
      </View>
    </>
  );
}
