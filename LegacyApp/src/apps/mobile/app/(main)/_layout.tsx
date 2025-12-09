import { Stack } from 'expo-router';
import { HEADER_STYLE } from '@ppa/ui/branding';
import { useAppStore } from '@ppa/store';
import { TPPaywall } from '@/components/tp';

export default function MainLayout() {
  const { subscriptionShowPaywall, subscriptionPaywallFeature, hidePaywall } = useAppStore();

  return (
    <>
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: HEADER_STYLE.backgroundColor,
        },
        headerTintColor: HEADER_STYLE.tintColor,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="plan/[id]"
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="plan/new"
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="period-selector"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="activity-edit"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="notes-view"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="tag-detail"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="coach-detail"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="period-template-detail"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="practice-template-detail"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="announcement-detail"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="plan/[id]/pdf"
        options={{
          presentation: 'card',
          headerShown: true,
          title: 'Practice Plan PDF',
        }}
      />
      <Stack.Screen
        name="plan/[id]/share"
        options={{
          presentation: 'card',
          headerShown: true,
          title: 'Share Practice',
        }}
      />
      <Stack.Screen
        name="admin"
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
    </Stack>

    {/* Global Paywall Modal */}
    <TPPaywall
      visible={subscriptionShowPaywall}
      onClose={hidePaywall}
      feature={subscriptionPaywallFeature}
    />
    </>
  );
}
