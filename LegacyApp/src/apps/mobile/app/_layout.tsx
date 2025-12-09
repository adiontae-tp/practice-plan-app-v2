// OTA Build: 2025-12-02-v4
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import React, { useEffect, useCallback } from 'react';
import { Slot, useRouter, usePathname } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS } from '@ppa/ui/branding';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { TeamThemeProvider } from '@/contexts/TeamThemeContext';
import { isEmailSignInLink } from '@ppa/firebase';
import { OnboardingProvider } from '@/components/tp/onboarding';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

// Custom theme for React Navigation using shared colors
const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
  },
};

/**
 * Component that handles deep links for email sign-in
 * Must be inside the router context to use navigation
 */
function DeepLinkHandler({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Handle deep links for email sign-in
  const handleDeepLink = useCallback((event: { url: string }) => {
    const url = event.url;

    // Check if this is an email sign-in link
    if (url && isEmailSignInLink(url)) {
      // Navigate to the email sign-in completion screen
      // Pass the full URL as a parameter
      router.push({
        pathname: '/(auth)/email-signin',
        params: { url: encodeURIComponent(url) },
      });
    }
  }, [router]);

  useEffect(() => {
    // Check if app was opened via a deep link
    const checkInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink({ url: initialUrl });
      }
    };

    checkInitialUrl();

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [handleDeepLink]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    // Add custom fonts here when needed
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider mode="light">
        <ThemeProvider value={AppTheme}>
          <AuthProvider>
            <DataProvider>
              <TeamThemeProvider>
                <SubscriptionProvider>
                  <NotificationProvider>
                    <OnboardingProvider>
                      <DeepLinkHandler>
                        <Slot />
                      </DeepLinkHandler>
                    </OnboardingProvider>
                  </NotificationProvider>
                </SubscriptionProvider>
              </TeamThemeProvider>
            </DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
