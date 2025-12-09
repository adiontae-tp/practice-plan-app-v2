import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { TPInput, TPButton } from '@/components/tp';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { sendPasswordReset, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError(undefined);
    return true;
  };

  const handleSendReset = async () => {
    clearError();
    if (!validateEmail()) return;

    const result = await sendPasswordReset(email);

    if (result.success) {
      setEmailSent(true);
    }
  };

  const handleResend = async () => {
    clearError();
    await sendPasswordReset(email);
  };

  // Success state
  if (emailSent) {
    return (
      <View className="flex-1 bg-white px-6 pt-12">
        {/* Back Button */}
        <TouchableOpacity
          className="flex-row items-center mb-8"
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={COLORS.textSecondary} />
          <Text className="text-base text-gray-600 ml-2">Back</Text>
        </TouchableOpacity>

        <View className="flex-1 items-center pt-12">
          {/* Success Icon */}
          <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-6">
            <CheckCircle size={40} color="#16a34a" />
          </View>

          {/* Heading */}
          <Text className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</Text>

          {/* Description */}
          <Text className="text-sm text-gray-500 text-center mb-2">
            We've sent a password reset link to
          </Text>
          <Text className="text-sm font-semibold text-gray-700 mb-6">{email}</Text>

          <Text className="text-sm text-gray-500 text-center mb-8">
            Didn't receive the email?{'\n'}Check your spam folder or
          </Text>

          {/* Resend Button */}
          <TPButton
            label="Resend Email"
            onPress={handleResend}
            isDisabled={isLoading}
            isLoading={isLoading}
            variant="outline"
          />

          <View className="h-4" />

          {/* Back to Sign In */}
          <TPButton
            label="Back to Sign In"
            onPress={() => router.replace('/(auth)/login')}
          />
        </View>
      </View>
    );
  }

  // Form state
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
          {/* Back Button */}
          <TouchableOpacity
            className="flex-row items-center mb-8"
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={COLORS.textSecondary} />
            <Text className="text-base text-gray-600 ml-2">Back</Text>
          </TouchableOpacity>

          {/* Heading */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-4">Reset Password</Text>
            <Text className="text-sm text-gray-500">
              Enter your email and we'll send you a link to reset your password.
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
          <View className="mb-6">
            <TPInput
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(undefined);
              }}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoFocus
              error={emailError}
            />
          </View>

          {/* Send Button */}
          <TPButton
            label="Send Reset Link"
            onPress={handleSendReset}
            isDisabled={isLoading || !email.trim()}
            isLoading={isLoading}
          />

          {/* Sign In Link */}
          <View className="items-center">
            <Text className="text-sm text-gray-600">Remember your password?</Text>
            <TouchableOpacity className="py-2" onPress={() => router.replace('/(auth)/login')}>
              <Text className="text-sm text-primary-600 font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
