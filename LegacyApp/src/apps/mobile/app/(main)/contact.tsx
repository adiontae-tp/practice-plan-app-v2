import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { Send, MessageSquare, Bug, Lightbulb, HelpCircle } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';

type ContactType = 'feedback' | 'bug' | 'feature' | 'help';

const contactTypes: { id: ContactType; label: string; icon: React.ReactNode }[] = [
  { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={20} color={COLORS.primary} /> },
  { id: 'bug', label: 'Bug Report', icon: <Bug size={20} color={COLORS.error} /> },
  { id: 'feature', label: 'Feature Request', icon: <Lightbulb size={20} color={COLORS.warning} /> },
  { id: 'help', label: 'Help', icon: <HelpCircle size={20} color={COLORS.info} /> },
];

export default function ContactScreen() {
  const [selectedType, setSelectedType] = useState<ContactType>('feedback');
  const [message, setMessage] = useState('');

  return (
    <>
      <Stack.Screen options={{ title: 'Contact Developer' }} />
      <ScrollView className="flex-1 bg-background-200" keyboardShouldPersistTaps="handled">
        <View className="p-4">
          {/* Contact Type Selection */}
          <Text className="text-xs font-semibold text-typography-500 uppercase mb-3 ml-1">
            What can we help with?
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {contactTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                className={`flex-row items-center px-4 py-3 rounded-xl ${
                  selectedType === type.id
                    ? 'bg-primary-500'
                    : 'bg-white border border-outline-200'
                }`}
                onPress={() => setSelectedType(type.id)}
              >
                {React.cloneElement(type.icon as React.ReactElement, {
                  color: selectedType === type.id ? COLORS.white : undefined,
                })}
                <Text
                  className={`ml-2 font-medium ${
                    selectedType === type.id ? 'text-white' : 'text-typography-700'
                  }`}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Message Input */}
          <Text className="text-xs font-semibold text-typography-500 uppercase mb-3 ml-1">
            Your Message
          </Text>
          <View className="bg-white rounded-xl p-4 mb-4">
            <TextInput
              className="text-base text-typography-900 min-h-[150px]"
              placeholder="Tell us what's on your mind..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`flex-row items-center justify-center py-4 rounded-xl ${
              message.trim() ? 'bg-primary-500' : 'bg-outline-300'
            }`}
            disabled={!message.trim()}
          >
            <Send size={18} color={message.trim() ? COLORS.white : COLORS.textMuted} />
            <Text
              className={`ml-2 font-semibold ${
                message.trim() ? 'text-white' : 'text-typography-500'
              }`}
            >
              Send Message
            </Text>
          </TouchableOpacity>

          {/* Info */}
          <Text className="text-center text-sm text-typography-500 mt-4">
            We typically respond within 24 hours
          </Text>
        </View>
      </ScrollView>
    </>
  );
}
