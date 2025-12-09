'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useMobileWeb, MWList, MWListItem, MWListItemIcon } from '@ppa/mobile-web';
import { useAppStore, useLazyAnnouncements } from '@ppa/store';
import { hasFeature, type FeatureFlags } from '@ppa/subscription';
import {
  ClipboardList,
  Copy,
  Megaphone,
  FolderOpen,
  Tag,
  Users,
  BarChart3,
  User,
  Settings,
  CreditCard,
  HelpCircle,
  Lock,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  description?: string;
  route: string;
  icon: React.ReactNode;
  iconColor: 'gray' | 'blue' | 'green' | 'red' | 'orange' | 'purple';
  requiredFeature?: keyof FeatureFlags;
  adminOnly?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: 'Planning',
    items: [
      {
        id: 'periods',
        label: 'Period Templates',
        description: 'Reusable drills and activities',
        route: '/periods',
        icon: <ClipboardList className="w-5 h-5" />,
        iconColor: 'blue',
      },
      {
        id: 'templates',
        label: 'Practice Templates',
        description: 'Save complete practice plans',
        route: '/templates',
        icon: <Copy className="w-5 h-5" />,
        iconColor: 'blue',
        requiredFeature: 'canCreateTemplates',
      },
    ],
  },
  {
    title: 'Communication',
    items: [
      {
        id: 'announcements',
        label: 'Announcements',
        description: 'Share updates with your team',
        route: '/announcements',
        icon: <Megaphone className="w-5 h-5" />,
        iconColor: 'orange',
        requiredFeature: 'canCreateAnnouncements',
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        id: 'files',
        label: 'Files',
        description: 'Store and organize documents',
        route: '/files',
        icon: <FolderOpen className="w-5 h-5" />,
        iconColor: 'blue',
        requiredFeature: 'canUploadFiles',
      },
      {
        id: 'tags',
        label: 'Tags',
        description: 'Track time by category',
        route: '/tags',
        icon: <Tag className="w-5 h-5" />,
        iconColor: 'purple',
        requiredFeature: 'canCreateTags',
      },
      {
        id: 'coaches',
        label: 'Assistant Coaches',
        description: 'Collaborate with your staff',
        route: '/coaches',
        icon: <Users className="w-5 h-5" />,
        iconColor: 'green',
        adminOnly: true,
      },
      {
        id: 'reports',
        label: 'Reports',
        description: 'View practice time distribution',
        route: '/reports',
        icon: <BarChart3 className="w-5 h-5" />,
        iconColor: 'blue',
        requiredFeature: 'canViewAnalytics',
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        id: 'profile',
        label: 'Profile',
        description: 'Your account settings',
        route: '/profile',
        icon: <User className="w-5 h-5" />,
        iconColor: 'gray',
      },
      {
        id: 'team',
        label: 'Team Settings',
        description: 'Manage your team',
        route: '/team',
        icon: <Settings className="w-5 h-5" />,
        iconColor: 'gray',
      },
      {
        id: 'subscription',
        label: 'Subscription',
        description: 'Manage your plan',
        route: '/subscription',
        icon: <CreditCard className="w-5 h-5" />,
        iconColor: 'gray',
      },
      {
        id: 'help',
        label: 'Help & Support',
        description: 'Get assistance',
        route: '/help',
        icon: <HelpCircle className="w-5 h-5" />,
        iconColor: 'gray',
      },
    ],
  },
];

export default function MenuPage() {
  const router = useRouter();
  const { isMobile } = useMobileWeb();
  const user = useAppStore((state) => state.user);
  const subscription = useAppStore((state) => state.subscription);
  const showPaywall = useAppStore((state) => state.showPaywall);
  const { announcements } = useLazyAnnouncements();

  // Count unread announcements
  const unreadCount = useMemo(() => {
    if (!user?.uid || !announcements.length) return 0;
    return announcements.filter((a) => !a.readBy?.includes(user.uid)).length;
  }, [announcements, user?.uid]);

  // Check if user is admin
  const isAdmin = user?.isAdmin === 'true';

  // Check if a feature is locked
  const isFeatureLocked = (requiredFeature?: keyof FeatureFlags): boolean => {
    if (!requiredFeature) return false;
    const featureValue = hasFeature(subscription.tier, requiredFeature);
    return typeof featureValue === 'boolean' ? !featureValue : false;
  };

  const handleNavigation = (item: MenuItem) => {
    const locked = isFeatureLocked(item.requiredFeature);
    if (locked && item.requiredFeature) {
      showPaywall(item.requiredFeature);
      return;
    }
    router.push(item.route);
  };

  // On desktop, redirect to dashboard
  if (!isMobile) {
    router.replace('/dashboard');
    return null;
  }

  return (
    <div className="space-y-2 -mx-4">
      {menuSections.map((section) => {
        // Filter items based on admin status
        const visibleItems = section.items.filter(
          (item) => !item.adminOnly || isAdmin
        );

        if (visibleItems.length === 0) return null;

        return (
          <MWList key={section.title} header={section.title}>
            {visibleItems.map((item) => {
              const locked = isFeatureLocked(item.requiredFeature);
              const showBadge = item.id === 'announcements' && unreadCount > 0 && !locked;

              return (
                <MWListItem
                  key={item.id}
                  title={item.label}
                  subtitle={item.description}
                  left={
                    <MWListItemIcon color={locked ? 'gray' : item.iconColor}>
                      {item.icon}
                    </MWListItemIcon>
                  }
                  right={
                    locked ? (
                      <Lock className="w-4 h-4 text-gray-400" />
                    ) : showBadge ? (
                      <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    ) : undefined
                  }
                  showChevron={!locked}
                  disabled={locked}
                  onPress={() => handleNavigation(item)}
                />
              );
            })}
          </MWList>
        );
      })}

      {/* Version Info */}
      <div className="px-4 py-6 text-center">
        <p className="text-xs text-gray-400">Practice Plan v1.0.0</p>
      </div>
    </div>
  );
}
