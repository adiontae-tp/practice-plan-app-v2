import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { COLORS } from '@ppa/ui/branding';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user, isInitialized } = useAuth();

  // Show loading while checking auth state
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Redirect based on auth state
  if (user) {
    return <Redirect href="/(main)/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
