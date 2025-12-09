/**
 * Notes View Modal
 * Route: /(main)/notes-view.tsx
 *
 * Modal for viewing activity notes as HTML/formatted text.
 */
import React from 'react';
import { View, ScrollView, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { X, FileText } from 'lucide-react-native';
import { useAppStore } from '@ppa/store';

// Simple HTML to text converter
function stripHtml(html: string): string {
  // Replace common HTML elements with appropriate text
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export default function NotesViewScreen() {
  const router = useRouter();

  // Get viewing notes from store
  const viewingNotes = useAppStore((state) => state.viewingNotes);
  const clearViewingNotes = useAppStore((state) => state.clearViewingNotes);

  const handleClose = () => {
    clearViewingNotes();
    router.back();
  };

  // If no notes to view, show empty state
  if (!viewingNotes) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 bg-[#e0e0e0]">
          <SafeAreaView edges={['top']} style={{ backgroundColor: '#356793' }}>
            <View className="px-5 py-4">
              <View className="flex-row items-center justify-between">
                <Pressable onPress={() => router.back()} className="p-2 -ml-2">
                  <X size={24} color="#ffffff" />
                </Pressable>
                <Text className="text-xl font-semibold text-white">Notes</Text>
                <View style={{ width: 28 }} />
              </View>
            </View>
          </SafeAreaView>
          <View className="flex-1 items-center justify-center px-6">
            <View className="bg-gray-100 rounded-full p-4 mb-4">
              <FileText size={32} color="#666666" />
            </View>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              No Notes
            </Text>
            <Text className="text-sm text-gray-600 text-center">
              This period has no notes.
            </Text>
          </View>
        </View>
      </>
    );
  }

  // Check if notes contain HTML
  const isHtml = viewingNotes.notes.includes('<') && viewingNotes.notes.includes('>');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-[#e0e0e0]">
        {/* Header with Safe Area */}
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#356793' }}>
          <View className="px-5 py-4">
            <View className="flex-row items-center justify-between">
              <Pressable onPress={handleClose} className="p-2 -ml-2">
                <X size={24} color="#ffffff" />
              </Pressable>
              <Text className="text-xl font-semibold text-white" numberOfLines={1}>
                {viewingNotes.activityName}
              </Text>
              <View style={{ width: 28 }} />
            </View>
          </View>
        </SafeAreaView>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-5">
            <View className="bg-white rounded-xl p-4">
              <View className="flex-row items-center mb-3">
                <FileText size={18} color="#666666" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">
                  Notes
                </Text>
              </View>

              <Text className="text-base text-gray-700 leading-6">
                {isHtml ? stripHtml(viewingNotes.notes) : viewingNotes.notes}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
