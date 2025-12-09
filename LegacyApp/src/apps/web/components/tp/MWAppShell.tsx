'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  useMobileWeb,
  MWPage,
  MWPageContent,
  MWHeader,
  MWTabBar,
  type MWTabItem,
} from '@ppa/mobile-web';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { TPHeader } from './TPHeader';
import { TPSidebar } from './TPSidebar';
import { TPPaywall } from './TPPaywall';
import { useAppStore } from '@ppa/store';
import { isAuthPage, isPublicPage, isMarketingPage } from '@/lib/constants';
import {
  ClipboardList,
  Calendar,
  LayoutGrid,
} from 'lucide-react';

export interface MWAppShellProps {
  children: React.ReactNode;
}

// Mobile tab bar items - matches mobile app (3 tabs)
const mobileTabItems: MWTabItem[] = [
  { id: 'practice', label: 'Practice', icon: ClipboardList },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'menu', label: 'Menu', icon: LayoutGrid },
];

// Map tab IDs to routes
const tabRoutes: Record<string, string> = {
  practice: '/practice',
  calendar: '/calendar',
  menu: '/menu',
};

// Pages that should show the tab bar (main hub pages)
const tabBarPages = ['/practice', '/calendar', '/menu'];

// Get active tab from pathname
function getActiveTab(pathname: string): string {
  if (pathname === '/practice' || pathname === '/') return 'practice';
  if (pathname.startsWith('/calendar')) return 'calendar';
  if (pathname.startsWith('/menu')) return 'menu';
  return ''; // No active tab for detail pages
}

// Check if current page should show tab bar
function shouldShowTabBar(pathname: string): boolean {
  return tabBarPages.some(page => pathname === page || pathname === '/');
}

// Get page title from pathname
function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/practice': 'Practice',
    '/dashboard': 'Practice',
    '/calendar': 'Calendar',
    '/menu': 'Menu',
    '/files': 'Files',
    '/profile': 'Profile',
    '/periods': 'Period Templates',
    '/templates': 'Practice Templates',
    '/announcements': 'Announcements',
    '/tags': 'Tags',
    '/coaches': 'Coaches',
    '/reports': 'Reports',
    '/team': 'Team Settings',
    '/subscription': 'Subscription',
  };

  // Check exact match first
  if (titles[pathname]) return titles[pathname];

  // Check prefix matches
  for (const [path, title] of Object.entries(titles)) {
    if (pathname.startsWith(path)) return title;
  }

  return 'Practice Plan';
}

export function MWAppShell({ children }: MWAppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile } = useMobileWeb();

  const team = useAppStore((state) => state.team);
  const user = useAppStore((state) => state.user);
  const authUser = useAppStore((state) => state.authUser);
  const isAppLoading = useAppStore((state) => state.isAppLoading);
  const isAppInitialized = useAppStore((state) => state.isAppInitialized);
  const initializeApp = useAppStore((state) => state.initializeApp);

  // Navigation state for mobile header back button
  const backDestination = useAppStore((state) => state.backDestination);
  const customBackHandler = useAppStore((state) => state.customBackHandler);

  // Initialize app on mount
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  const onAuthPage = isAuthPage(pathname);
  const onPublicPage = isPublicPage(pathname);
  const onMarketingPage = isMarketingPage(pathname);
  const isAuthenticated = !!authUser;

  // Redirect logic - mobile goes to /practice, desktop goes to /dashboard
  useEffect(() => {
    if (pathname === '/' && isAuthenticated && !isAppLoading) {
      router.replace(isMobile ? '/practice' : '/dashboard');
    }
  }, [pathname, isAuthenticated, isAppLoading, isMobile, router]);

  useEffect(() => {
    if (isAppInitialized && isAuthenticated && onAuthPage) {
      router.replace(isMobile ? '/practice' : '/dashboard');
    }
  }, [isAppInitialized, isAuthenticated, onAuthPage, isMobile, router]);

  useEffect(() => {
    if (isAppInitialized && !isAuthenticated && !onAuthPage && !onPublicPage && !onMarketingPage) {
      router.replace('/login');
    }
  }, [isAppInitialized, isAuthenticated, onAuthPage, onPublicPage, onMarketingPage, router]);

  // Auth/public/marketing pages don't need the app shell
  if (onAuthPage || onPublicPage || onMarketingPage) {
    if (isAppInitialized && isAuthenticated && onAuthPage) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
          <div className="animate-pulse text-gray-400">Redirecting to dashboard...</div>
        </div>
      );
    }
    return <>{children}</>;
  }

  // Loading states
  if (isAppLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (isAppInitialized && !isAuthenticated && !onAuthPage && !onPublicPage && !onMarketingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="animate-pulse text-gray-400">Redirecting to login...</div>
      </div>
    );
  }

  if (pathname === '/' && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="animate-pulse text-gray-400">Redirecting...</div>
      </div>
    );
  }

  const userName = user ? `${user.fname} ${user.lname}` : undefined;
  const userEmail = user?.email;
  const teamName = team?.name;
  const teamLogoUrl = team?.logoUrl;

  // Mobile Layout
  if (isMobile) {
    const activeTab = getActiveTab(pathname);
    const pageTitle = getPageTitle(pathname);
    const showTabs = shouldShowTabBar(pathname);
    const isDetailPage = !showTabs;

    const handleTabPress = (tabId: string) => {
      const route = tabRoutes[tabId];
      if (route) {
        router.push(route);
      }
    };

    return (
      <>
        <MWPage hasHeader hasFooter={showTabs} variant="gray">
          <MWHeader
            title={pageTitle}
            subtitle={showTabs ? teamName : undefined}
            showBack={isDetailPage}
            variant="default"
            backDestination={backDestination}
            customBackHandler={customBackHandler}
            routerPush={router.push}
          />
          <MWPageContent padding="md">
            {children}
          </MWPageContent>
        </MWPage>

        {showTabs && (
          <MWTabBar
            items={mobileTabItems}
            activeId={activeTab}
            onTabPress={handleTabPress}
          />
        )}

        <TPPaywall />
      </>
    );
  }

  // Desktop Layout (existing TPAppShell structure)
  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen w-full bg-[#f5f5f5]">
        <TPHeader
          teamName={teamName}
          teamLogoUrl={teamLogoUrl}
          userName={userName}
          userEmail={userEmail}
          isLoading={isAppLoading}
        />
        <div className="flex flex-1 overflow-hidden">
          <TPSidebar />
          <SidebarInset className="bg-[#f0f0f0] overflow-y-auto">
            <div className="p-6 max-w-7xl mx-auto w-full">{children}</div>
          </SidebarInset>
        </div>
      </div>

      <TPPaywall />
    </SidebarProvider>
  );
}
