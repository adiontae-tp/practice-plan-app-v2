'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  FileText,
  Megaphone,
  FolderOpen,
  Tags,
  Users,
  BarChart3,
  User,
  Settings,
  CreditCard,
  HelpCircle,
  Lock,
  Shield,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useAppStore, useLazyAnnouncements } from '@ppa/store';
import { hasFeature, type FeatureFlags } from '@ppa/subscription';
import { isAdmin } from '@ppa/firebase';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  testId?: string;
  requiredFeature?: keyof FeatureFlags;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const baseNavSections: NavSection[] = [
  {
    title: 'Planning',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard />, testId: 'dashboard-nav' },
      { label: 'Calendar', href: '/calendar', icon: <Calendar />, testId: 'plans-nav' },
      { label: 'Period Templates', href: '/periods', icon: <Clock />, testId: 'periods-nav' },
      { label: 'Practice Templates', href: '/templates', icon: <FileText />, testId: 'templates-nav', requiredFeature: 'canCreateTemplates' },
    ],
  },
  {
    title: 'Communication',
    items: [
      { label: 'Announcements', href: '/announcements', icon: <Megaphone />, testId: 'announcements-nav', requiredFeature: 'canCreateAnnouncements' },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Files', href: '/files', icon: <FolderOpen />, testId: 'files-nav', requiredFeature: 'canUploadFiles' },
      { label: 'Tags', href: '/tags', icon: <Tags />, testId: 'tags-nav', requiredFeature: 'canCreateTags' },
      { label: 'Coaches', href: '/coaches', icon: <Users />, testId: 'coaches-nav' },
      { label: 'Reports', href: '/reports', icon: <BarChart3 />, testId: 'reports-nav', requiredFeature: 'canViewAnalytics' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'Profile', href: '/profile', icon: <User />, testId: 'profile-nav' },
      { label: 'Team Settings', href: '/team', icon: <Settings />, testId: 'team-settings-nav' },
      { label: 'Subscription', href: '/subscription', icon: <CreditCard />, testId: 'subscription-nav' },
    ],
  },
];

export function TPSidebar() {
  const pathname = usePathname();
  const subscription = useAppStore((state) => state.subscription);
  const tierOverride = useAppStore((state) => state.tierOverride);
  const showPaywall = useAppStore((state) => state.showPaywall);
  const user = useAppStore((state) => state.user);

  const { announcements } = useLazyAnnouncements();

  const unreadCount = useMemo(() => {
    if (!user?.uid || !announcements.length) return 0;
    return announcements.filter((a) => !a.readBy?.includes(user.uid)).length;
  }, [announcements, user?.uid]);

  const navSections = useMemo(() => {
    return baseNavSections.map((section) => ({
      ...section,
      items: section.items.map((item) => {
        if (item.href === '/announcements' && unreadCount > 0) {
          return { ...item, badge: String(unreadCount) };
        }
        return item;
      }),
    }));
  }, [unreadCount]);

  const effectiveTier = tierOverride ?? subscription.tier;

  const isFeatureLocked = (item: NavItem): boolean => {
    if (!item.requiredFeature) return false;
    const featureValue = hasFeature(effectiveTier, item.requiredFeature);
    return typeof featureValue === 'boolean' ? !featureValue : false;
  };

  const handleNavClick = (e: React.MouseEvent, item: NavItem) => {
    const locked = isFeatureLocked(item);
    if (locked && item.requiredFeature) {
      e.preventDefault();
      showPaywall(item.requiredFeature);
    }
  };

  return (
    <Sidebar collapsible="none" className="border-r border-gray-200 bg-white">
      <SidebarContent className="py-2">
        {navSections.map((section, sectionIndex) => (
          <SidebarGroup key={section.title} className="px-3">
            <SidebarGroupLabel className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const locked = isFeatureLocked(item);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive && !locked}
                        tooltip={locked ? `${item.label} (Upgrade to unlock)` : item.label}
                        className={cn(
                          'h-9 rounded-lg transition-all duration-150 group',
                          locked
                            ? 'text-gray-400 hover:bg-gray-50 cursor-pointer'
                            : isActive
                            ? 'bg-primary-500 text-white shadow-sm hover:bg-primary-600 hover:text-white data-[active=true]:bg-primary-500 data-[active=true]:text-white'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        )}
                      >
                        <Link 
                          href={locked ? '#' : item.href} 
                          onClick={(e) => handleNavClick(e, item)}
                          className="flex items-center gap-3" 
                          data-testid={item.testId}
                        >
                          <span className={cn(
                            'shrink-0',
                            locked
                              ? 'text-gray-400'
                              : isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                          )}>
                            {item.icon}
                          </span>
                          <span className="font-medium">{item.label}</span>
                          {locked && (
                            <Lock className="ml-auto w-4 h-4 text-gray-400" />
                          )}
                          {!locked && item.badge && (
                            <span className={cn(
                              'ml-auto text-xs font-semibold px-2 py-0.5 rounded-full',
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-secondary-500 text-white'
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
            {sectionIndex < navSections.length - 1 && (
              <SidebarSeparator className="my-3 bg-gray-200" />
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 p-3">
        <SidebarMenu>
          {/* Admin link - only visible to admin users */}
          {isAdmin(user?.email) && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/admin'}
                className={cn(
                  'h-9 rounded-lg transition-all duration-150 group',
                  pathname === '/admin'
                    ? 'bg-primary-500 text-white shadow-sm hover:bg-primary-600 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Link href="/admin" className="flex items-center gap-3">
                  <span className={cn(
                    'shrink-0',
                    pathname === '/admin' ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                  )}>
                    <Shield />
                  </span>
                  <span className="font-medium">Admin Panel</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-9 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-150 group"
            >
              <Link href="/help" className="flex items-center gap-3">
                <span className="text-gray-500 group-hover:text-gray-700 shrink-0">
                  <HelpCircle />
                </span>
                <span className="font-medium">Help & Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="mt-3 px-2">
          <p className="text-[10px] text-gray-400 text-center">
            Practice Plan v1.0.0
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
