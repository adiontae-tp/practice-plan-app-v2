import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, AlertCircle, CheckCircle, Mail } from 'lucide-react-native';
import { COLORS } from '@ppa/ui/branding';
import { TPInput, TPButton } from '@/components/tp';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Email Sign-In Completion Screen
 *
 * This screen handles completing the passwordless sign-in when the app
 * is opened via a deep link containing the email sign-in code.
 *
 * The deep link URL should be passed as a query parameter (url).
 * If the user opened the link on the same device, we can retrieve
 * their email from storage. Otherwise, they need to enter it again.
 */
export default function EmailSignInScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ url?: string }>();
  const {
    completeSignInWithLink,
    getStoredEmailForSignIn,
    clearStoredEmailForSignIn,
    isSignInWithEmailLink,
    isLoading,
    error,
    clearError,
    user,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [status, setStatus] = useState<'loading' | 'need-email' | 'signing-in' | 'success' | 'error'>('loading');
  const [signInUrl, setSignInUrl] = useState<string | null>(null);

  // Check if we have a valid sign-in link and stored email on mount
  useEffect(() => {
    const initializeSignIn = async () => {
      // Decode the URL parameter (it was encoded when passed through router)
      const url = params.url ? decodeURIComponent(params.url) : null;

      // Validate the URL is a valid email sign-in link
      if (!url || !isSignInWithEmailLink(url)) {
        setStatus('error');
        return;
      }

      setSignInUrl(url);

      // Try to get the stored email (same device sign-in)
      const storedEmail = await getStoredEmailForSignIn();

      if (storedEmail) {
        // Auto-complete sign-in with stored email
        setEmail(storedEmail);
        setStatus('signing-in');
        await handleSignIn(storedEmail, url);
      } else {
        // Different device - need user to enter email
        setStatus('need-email');
      }
    };

    initializeSignIn();
  }, [params.url]);

  // If user is already authenticated, redirect to main app
  useEffect(() => {
    if (user && status === 'success') {
      router.replace('/(main)/(tabs)');
    }
  }, [user, status]);

  const handleSignIn = async (emailToUse: string, url: string) => {
    clearError();
    setStatus('signing-in');

    const result = await completeSignInWithLink(emailToUse, url);

    if (result.success) {
      setStatus('success');
      // Router will redirect via the AuthContext
    } else {
      setStatus('error');
    }
  };

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

  const handleManualSignIn = async () => {
    if (!validateEmail() || !signInUrl) return;
    await handleSignIn(email, signInUrl);
  };

  const handleCancel = async () => {
    await clearStoredEmailForSignIn();
    router.replace('/(auth)/login');
  };

  // Loading state - checking link validity
  if (status === 'loading') {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text className="text-base text-gray-600 mt-4">Validating sign-in link...</Text>
      </View>
    );
  }

  // Signing in state
  if (status === 'signing-in') {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text className="text-base text-gray-600 mt-4">Signing you in...</Text>
        {email && (
          <Text className="text-sm text-gray-400 mt-2">{email}</Text>
        )}
      </View>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-6">
          <CheckCircle size={40} color="#16a34a" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 mb-4">Welcome!</Text>
        <Text className="text-base text-gray-600">Redirecting to the app...</Text>
      </View>
    );
  }

  // Error state - invalid or expired link
  if (status === 'error' && !signInUrl) {
    return (
      <View className="flex-1 bg-white px-6 pt-12">
        <TouchableOpacity
          className="flex-row items-center mb-8"
          onPress={handleCancel}
        >
          <ArrowLeft size={20} color={COLORS.textSecondary} />
          <Text className="text-base text-gray-600 ml-2">Back</Text>
        </TouchableOpacity>

        <View className="flex-1 items-center pt-12">
          <View className="w-20 h-20 rounded-full bg-red-100 items-center justify-center mb-6">
            <AlertCircle size={40} color={COLORS.error} />
          </View>

          <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Invalid Sign-In Link
          </Text>

          <Text className="text-sm text-gray-500 text-center mb-8 px-4">
            This sign-in link is invalid or has expired.
            Please request a new one.
          </Text>

          <TPButton
            label="Request New Link"
            onPress={() => router.replace('/(auth)/passwordless')}
          />

          <View className="h-4" />

          <TPButton
            label="Back to Sign In"
            onPress={handleCancel}
            variant="outline"
          />
        </View>
      </View>
    );
  }

  // Need email state - user opened on different device
  return (
    <View className="flex-1 bg-white px-6 pt-12">
      <TouchableOpacity
        className="flex-row items-center mb-8"
        onPress={handleCancel}
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
          Confirm Your Email
        </Text>
        <Text className="text-sm text-gray-500 text-center">
          For security, please enter the email address you used to request this sign-in link.
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

      {/* Sign In Button */}
      <TPButton
        label="Complete Sign In"
        onPress={handleManualSignIn}
        isDisabled={isLoading || !email.trim()}
        isLoading={isLoading}
      />

      <View className="h-4" />

      {/* Cancel Button */}
      <TPButton
        label="Cancel"
        onPress={handleCancel}
        variant="outline"
      />
    </View>
  );
}
