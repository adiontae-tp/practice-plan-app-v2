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
import { ArrowLeft, AlertCircle, Mail, CheckCircle } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { TPInput, TPButton } from '@/components/tp';
import { useAuth } from '@/contexts/AuthContext';

export default function PasswordlessScreen() {
  const router = useRouter();
  const { sendSignInLink, isLoading, error, clearError, emailLinkSent } = useAuth();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [linkSent, setLinkSent] = useState(false);

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

  const handleSendLink = async () => {
    clearError();
    if (!validateEmail()) return;

    const result = await sendSignInLink(email);

    if (result.success) {
      setLinkSent(true);
    }
  };

  const handleResend = async () => {
    clearError();
    await sendSignInLink(email);
  };

  // Success state - link sent
  if (linkSent || emailLinkSent) {
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
          <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Check Your Email
          </Text>

          {/* Description */}
          <Text className="text-sm text-gray-500 text-center mb-2">
            We've sent a sign-in link to
          </Text>
          <Text className="text-sm font-semibold text-gray-700 mb-6">{email}</Text>

          <Text className="text-sm text-gray-500 text-center mb-2 px-4">
            Click the link in your email to sign in.{'\n'}
            No password needed!
          </Text>

          <Text className="text-sm text-gray-400 text-center mb-8 px-4">
            Didn't receive the email?{'\n'}Check your spam folder or
          </Text>

          {/* Error Banner */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex-row items-center w-full">
              <AlertCircle size={20} color={COLORS.error} />
              <Text className="text-sm text-red-700 ml-3 flex-1">{error}</Text>
            </View>
          )}

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

  // Form state - enter email
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

          {/* Icon */}
          <View className="items-center mb-6">
            <View className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center">
              <Mail size={32} color={COLORS.primary} />
            </View>
          </View>

          {/* Heading */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Sign In with Email Link
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              Enter your email and we'll send you a magic link to sign in.
              No password required!
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
            label="Send Sign-In Link"
            onPress={handleSendLink}
            isDisabled={isLoading || !email.trim()}
            isLoading={isLoading}
          />

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="px-4 text-sm text-gray-400">OR</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Sign In with Password Link */}
          <View className="items-center">
            <Text className="text-sm text-gray-600">Prefer to use a password?</Text>
            <TouchableOpacity className="py-2" onPress={() => router.replace('/(auth)/login')}>
              <Text className="text-sm text-primary-600 font-semibold">Sign In with Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
