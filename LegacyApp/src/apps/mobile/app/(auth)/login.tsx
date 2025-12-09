import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, AlertCircle, Mail } from 'lucide-react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { COLORS } from '@ppa/ui/branding';
import { TPInput, TPButton } from '@/components/tp';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const {
    signIn,
    signInWithApple,
    signInWithGoogle,
    isAppleSignInAvailable,
    isLoading,
    error,
    clearError,
    migrated,
    requiresPasswordReset,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};

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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async () => {
    clearError();
    if (!validateForm()) return;

    const result = await signIn(email, password);

    if (result.requiresPasswordReset) {
      // User was migrated, show success message
      // The error state will contain the migration message
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
        <View className="flex-1 px-6 pt-16 pb-8">
          {/* Logo */}
          <View className="items-center mb-8">
            <Image
              source={require('@/assets/images/logo-full.svg')}
              style={{ width: 200, height: 102 }}
              contentFit="contain"
            />
          </View>

          {/* Heading */}
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</Text>
            <Text className="text-sm text-gray-500 text-center">
              Let's get started by filling out the form below.
            </Text>
          </View>

          {/* Migration Success Message */}
          {requiresPasswordReset && (
            <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex-row items-start">
              <AlertCircle size={20} color="#16a34a" />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-medium text-green-800">Account Migrated!</Text>
                <Text className="text-sm text-green-700 mt-1">
                  Please check your email to reset your password and complete the migration.
                </Text>
              </View>
            </View>
          )}

          {/* Error Banner */}
          {error && !requiresPasswordReset && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex-row items-center">
              <AlertCircle size={20} color={COLORS.error} />
              <Text className="text-sm text-red-700 ml-3 flex-1">{error}</Text>
            </View>
          )}

          {/* Form */}
          <View className="mb-4">
            <TPInput
              label="Email"
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
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (formErrors.password) setFormErrors((e) => ({ ...e, password: undefined }));
                }}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
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
          </View>

          {/* Sign In Button */}
          <TPButton
            label="Sign In"
            onPress={handleSignIn}
            isDisabled={isLoading}
            isLoading={isLoading}
          />

          {/* Forgot Password */}
          <TouchableOpacity
            className="items-center py-2"
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text className="text-sm text-primary-600 font-medium">Forgot Password?</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="px-4 text-sm text-gray-400">OR</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Social Sign-In Buttons */}
          <View className="space-y-3">
            {/* Google Sign-In Button */}
            <TouchableOpacity
              onPress={signInWithGoogle}
              disabled={isLoading}
              className="flex-row items-center justify-center bg-white border border-gray-300 rounded-xl py-3.5 px-4"
              style={{ height: 50 }}
            >
              <Image
                source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }}
                style={{ width: 20, height: 20, marginRight: 12 }}
              />
              <Text className="text-base font-medium text-gray-700">
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Apple Sign-In Button (iOS only) */}
            {Platform.OS === 'ios' && isAppleSignInAvailable && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={12}
                style={{ width: '100%', height: 50 }}
                onPress={signInWithApple}
              />
            )}

            {/* Email Link (Passwordless) Sign-In Button */}
            <TouchableOpacity
              onPress={() => router.push('/(auth)/passwordless')}
              disabled={isLoading}
              className="flex-row items-center justify-center bg-white border border-gray-300 rounded-xl py-3.5 px-4"
              style={{ height: 50 }}
            >
              <Mail size={20} color={COLORS.textSecondary} style={{ marginRight: 12 }} />
              <Text className="text-base font-medium text-gray-700">
                Sign in with Email Link
              </Text>
            </TouchableOpacity>
          </View>

          {/* Create Account */}
          <View className="items-center">
            <Text className="text-sm text-gray-600">Don't have an account?</Text>
            <TouchableOpacity className="py-2" onPress={() => router.push('/(auth)/register')}>
              <Text className="text-sm text-primary-600 font-semibold">Create one</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-auto pt-8">
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
