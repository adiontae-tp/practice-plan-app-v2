import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import Constants from 'expo-constants';
import { Lock } from 'lucide-react-native';
import { sidebarSections, type NavItem } from '@/config/navigation';
import { TPCard, TPBadge, TPSubscriptionBanner } from '@/components/tp';
import { useData } from '@/contexts/DataContext';
import { useAppStore, useLazyAnnouncements } from '@ppa/store';
import { hasFeature, type FeatureFlags } from '@ppa/subscription';

export default function MenuMobile() {
  const router = useRouter();
  const { user } = useData();
  const { subscription, showPaywall } = useAppStore();
  const { announcements } = useLazyAnnouncements();

  const unreadCount = useMemo(() => {
    if (!user?.uid || !announcements.length) return 0;
    return announcements.filter((a) => !a.readBy?.includes(user.uid)).length;
  }, [announcements, user?.uid]);

  // Check if user is admin (isAdmin is stored as string in Firestore)
  const isAdmin = user?.isAdmin === 'true';

  // Check if a feature is locked based on subscription tier
  const isFeatureLocked = (item: NavItem): boolean => {
    if (!item.requiredFeature) return false;
    const featureValue = hasFeature(subscription.tier, item.requiredFeature);
    return typeof featureValue === 'boolean' ? !featureValue : false;
  };

  const handleNavigation = (item: NavItem) => {
    const locked = isFeatureLocked(item);
    if (locked && item.requiredFeature) {
      showPaywall(item.requiredFeature);
      return;
    }
    router.push(`/(main)${item.route}` as any);
  };

  return (
    <View className="flex-1 bg-[#e0e0e0]">
      {/* Subscription Banner for free users */}
      <TPSubscriptionBanner />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {sidebarSections.map((section, sectionIndex) => {
          // Filter items based on admin status
          const visibleItems = section.items.filter(
            (item) => !item.adminOnly || isAdmin
          );

          if (visibleItems.length === 0) return null;

          return (
            <View key={sectionIndex} className="mb-6">
              <Text className="px-1 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </Text>
              {visibleItems.map((item, itemIndex) => {
                const Icon = item.icon;
                const showAdminBadge = item.adminOnly;
                const locked = isFeatureLocked(item);
                const showUnreadBadge = item.route === '/announcements' && unreadCount > 0 && !locked;

                return (
                  <TPCard
                    key={item.route}
                    onPress={() => handleNavigation(item)}
                  >
                    <View className="flex-row items-center">
                      <View
                        className={`w-10 h-10 rounded-lg items-center justify-center ${
                          locked ? 'bg-gray-200' : 'bg-gray-100'
                        }`}
                      >
                        <Icon size={20} color={locked ? '#9ca3af' : '#666666'} />
                      </View>
                      <View className="flex-1 ml-3">
                        <View className="flex-row items-center gap-2 mb-0.5">
                          <Text
                            className={`text-base font-semibold ${
                              locked ? 'text-gray-400' : 'text-gray-900'
                            }`}
                          >
                            {item.label}
                          </Text>
                          {showAdminBadge && (
                            <TPBadge text="Admin" action="muted" size="sm" />
                          )}
                          {showUnreadBadge && (
                            <TPBadge text={String(unreadCount)} action="info" size="sm" />
                          )}
                          {locked && (
                            <View className="flex-row items-center">
                              <Lock size={14} color="#9ca3af" />
                            </View>
                          )}
                        </View>
                        {item.description && (
                          <Text
                            className={`text-sm ${
                              locked ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            {item.description}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TPCard>
                );
              })}
            </View>
          );
        })}

        {/* Version Info */}
        <View className="mt-4 mb-4 px-1">
          <Text className="text-xs text-gray-400 text-center">
            Version {Constants.expoConfig?.version || '1.0.0'} ({Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '-'})
          </Text>
          <Text className="text-xs text-gray-400 text-center mt-1">
            Runtime: {typeof Constants.expoConfig?.runtimeVersion === 'string'
              ? Constants.expoConfig.runtimeVersion
              : Constants.expoConfig?.version || '-'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
