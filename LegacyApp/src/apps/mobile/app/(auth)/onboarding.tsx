import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CheckSquare, Square } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { TPButton, TPInput } from '@/components/tp';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@ppa/firebase';
import { useAuth } from '@/contexts/AuthContext';

const FEATURE_OPTIONS = [
  { id: 'organization', label: 'Better organization for practice plans' },
  { id: 'time-saving', label: 'Save time on planning' },
  { id: 'team-collaboration', label: 'Collaborate with assistant coaches' },
  { id: 'templates', label: 'Reusable practice templates' },
  { id: 'activity-library', label: 'Library of drills and activities' },
  { id: 'file-storage', label: 'Store and share files with team' },
  { id: 'communication', label: 'Team communication and announcements' },
  { id: 'analytics', label: 'Track and analyze practice data' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherText, setOtherText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleFeature = (featureId: string) => {
    if (selectedFeatures.includes(featureId)) {
      setSelectedFeatures(selectedFeatures.filter(id => id !== featureId));
      if (featureId === 'other') {
        setShowOtherInput(false);
        setOtherText('');
      }
    } else {
      setSelectedFeatures([...selectedFeatures, featureId]);
      if (featureId === 'other') {
        setShowOtherInput(true);
      }
    }
    setError('');
  };

  const handleContinue = async () => {
    // Validation
    if (selectedFeatures.length === 0) {
      setError('Please select at least one feature');
      return;
    }

    if (showOtherInput && !otherText.trim()) {
      setError('Please describe what you\'re looking for in "Other"');
      return;
    }

    if (!user?.uid) {
      setError('User not found. Please try logging in again.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Prepare interests data
      const interests: string[] = selectedFeatures
        .filter(id => id !== 'other')
        .map(id => FEATURE_OPTIONS.find(opt => opt.id === id)?.label || id);

      if (showOtherInput && otherText.trim()) {
        interests.push(`Other: ${otherText.trim()}`);
      }

      // Update user document
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        interests,
        onboardingCompleted: true,
        modified: Date.now(),
      });

      // Navigate to main app
      // Note: OnboardingProvider will automatically start the welcome tour
      // after this screen since onboardingCompleted is true but welcomeTourCompleted is false
      router.replace('/(main)/(tabs)');
    } catch (err) {
      console.error('Error saving interests:', err);
      setError('Failed to save your preferences. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-12 pb-8">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Practice Plan!
          </Text>
          <Text className="text-base text-gray-600">
            Help us personalize your experience. What are you most interested in?
          </Text>
          <Text className="text-sm text-gray-500 mt-2">
            Select all that apply. This helps us improve the app for coaches like you.
          </Text>
        </View>

        {/* Error message */}
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <Text className="text-sm text-red-700">{error}</Text>
          </View>
        )}

        {/* Feature options */}
        <View className="mb-6">
          {FEATURE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => toggleFeature(option.id)}
              className="flex-row items-center py-4 border-b border-gray-200"
              activeOpacity={0.7}
            >
              {selectedFeatures.includes(option.id) ? (
                <CheckSquare size={24} color={COLORS.primary} />
              ) : (
                <Square size={24} color={COLORS.textMuted} />
              )}
              <Text className="text-base text-gray-900 ml-3 flex-1">
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Other option */}
          <TouchableOpacity
            onPress={() => toggleFeature('other')}
            className="flex-row items-center py-4 border-b border-gray-200"
            activeOpacity={0.7}
          >
            {selectedFeatures.includes('other') ? (
              <CheckSquare size={24} color={COLORS.primary} />
            ) : (
              <Square size={24} color={COLORS.textMuted} />
            )}
            <Text className="text-base text-gray-900 ml-3 flex-1">
              Other
            </Text>
          </TouchableOpacity>

          {/* Other text input */}
          {showOtherInput && (
            <View className="mt-4">
              <TPInput
                label="Please describe"
                value={otherText}
                onChangeText={setOtherText}
                placeholder="What else are you looking for?"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={{ minHeight: 80 }}
              />
            </View>
          )}
        </View>

        {/* Continue button */}
        <View className="mt-auto pt-6">
          <TPButton
            label="Continue"
            onPress={handleContinue}
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
          />
        </View>
      </View>
    </ScrollView>
  );
}
