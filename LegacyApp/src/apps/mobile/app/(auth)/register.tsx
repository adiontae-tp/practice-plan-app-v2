import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { TPInput, TPButton, TPPicker } from '@/components/tp';
import { useAuth } from '@/contexts/AuthContext';

const SPORTS = [
  'Basketball',
  'Football',
  'Soccer',
  'Baseball',
  'Volleyball',
  'Hockey',
  'Lacrosse',
  'Tennis',
  'Golf',
  'Swimming',
  'Track & Field',
  'Wrestling',
  'Softball',
  'Other',
];

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, isLoading, error, clearError } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [sport, setSport] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    firstName?: string;
    lastName?: string;
    teamName?: string;
    sport?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const errors: typeof formErrors = {};

    if (!firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!teamName.trim()) {
      errors.teamName = 'Team name is required';
    }

    if (!sport) {
      errors.sport = 'Please select a sport';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async () => {
    clearError();
    if (!validateForm()) return;

    // Pass all required parameters including teamName and sport
    const result = await signUp(email, password, firstName.trim(), lastName.trim(), teamName.trim(), sport);

    if (result.success) {
      // Navigation will be handled by AuthContext
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-12 pb-8">
          {/* Logo */}
          <View className="items-center mb-6">
            <Image
              source={require('@/assets/images/logo-full.svg')}
              style={{ width: 200, height: 102 }}
              contentFit="contain"
            />
          </View>

          {/* Heading */}
          <View className="items-center mb-6">
            <Text className="text-2xl font-bold text-gray-900 mb-2">Create an account</Text>
            <Text className="text-sm text-gray-500 text-center">
              Let's get started by filling out the form below.
            </Text>
          </View>

          {/* Error Banner */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex-row items-center">
              <AlertCircle size={20} color={COLORS.error} />
              <Text className="text-sm text-red-700 ml-3 flex-1">{error}</Text>
            </View>
          )}

          {/* Form */}
          <View className="mb-4">
            <TPInput
              label="First Name"
              required
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (formErrors.firstName) setFormErrors((e) => ({ ...e, firstName: undefined }));
              }}
              placeholder="John"
              autoCapitalize="words"
              autoComplete="given-name"
              error={formErrors.firstName}
            />

            <TPInput
              label="Last Name"
              required
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (formErrors.lastName) setFormErrors((e) => ({ ...e, lastName: undefined }));
              }}
              placeholder="Smith"
              autoCapitalize="words"
              autoComplete="family-name"
              error={formErrors.lastName}
            />

            <TPInput
              label="Team Name"
              required
              value={teamName}
              onChangeText={(text) => {
                setTeamName(text);
                if (formErrors.teamName) setFormErrors((e) => ({ ...e, teamName: undefined }));
              }}
              placeholder="Warriors Basketball"
              autoCapitalize="words"
              error={formErrors.teamName}
            />

            <TPPicker
              label="Sport"
              required
              value={sport}
              onValueChange={(value) => {
                setSport(value);
                if (formErrors.sport) setFormErrors((e) => ({ ...e, sport: undefined }));
              }}
              items={SPORTS.map((s) => ({ label: s, value: s }))}
              placeholder="Select a sport"
              error={formErrors.sport}
            />

            <TPInput
              label="Email"
              required
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (formErrors.email) setFormErrors((e) => ({ ...e, email: undefined }));
              }}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={formErrors.email}
            />

            <View className="relative">
              <TPInput
                label="Password"
                required
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (formErrors.password) setFormErrors((e) => ({ ...e, password: undefined }));
                }}
                placeholder="Min. 6 characters"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="new-password"
                error={formErrors.password}
              />
              <TouchableOpacity
                className="absolute right-4 top-10"
                onPress={() => setShowPassword(!showPassword)}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff size={20} color={COLORS.textMuted} />
                ) : (
                  <Eye size={20} color={COLORS.textMuted} />
                )}
              </TouchableOpacity>
            </View>

            <View className="relative">
              <TPInput
                label="Confirm Password"
                required
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (formErrors.confirmPassword)
                    setFormErrors((e) => ({ ...e, confirmPassword: undefined }));
                }}
                placeholder="Re-enter your password"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="new-password"
                error={formErrors.confirmPassword}
              />
              <TouchableOpacity
                className="absolute right-4 top-10"
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={COLORS.textMuted} />
                ) : (
                  <Eye size={20} color={COLORS.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Create Account Button */}
          <TPButton
            label="Create Account"
            onPress={handleSignUp}
            isDisabled={isLoading}
            isLoading={isLoading}
          />

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="px-4 text-sm text-gray-400">OR</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Sign In Link */}
          <View className="items-center">
            <Text className="text-sm text-gray-600">Already have an account?</Text>
            <TouchableOpacity className="py-2" onPress={() => router.push('/(auth)/login')}>
              <Text className="text-sm text-primary-600 font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-auto pt-6">
            <TouchableOpacity>
              <Text className="text-xs text-gray-400">Terms & Conditions</Text>
            </TouchableOpacity>
            <Text className="text-xs text-gray-400 mx-2">|</Text>
            <TouchableOpacity>
              <Text className="text-xs text-gray-400">Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
