import { Tabs } from 'expo-router';
import { ClipboardList, Calendar, LayoutGrid } from 'lucide-react-native';
import { HeaderTitle } from '@/components/navigation/HeaderTitle';
import { HeaderRight } from '@/components/navigation/HeaderRight';
import { useDynamicHeaderStyle, useDynamicTabBarStyle } from '@/hooks/useDynamicStyles';

export default function TabsLayout() {
  const headerStyle = useDynamicHeaderStyle();
  const tabBarStyle = useDynamicTabBarStyle();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabBarStyle.activeTintColor,
        tabBarInactiveTintColor: tabBarStyle.inactiveTintColor,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: headerStyle.backgroundColor,
        },
        headerTintColor: headerStyle.tintColor,
        headerTitle: () => <HeaderTitle />,
        headerRight: () => <HeaderRight />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color, size }) => (
            <ClipboardList color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Calendar color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, size }) => (
            <LayoutGrid color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
