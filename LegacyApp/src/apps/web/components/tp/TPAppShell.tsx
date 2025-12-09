'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { TPHeader } from './TPHeader';
import { TPSidebar } from './TPSidebar';
import { TPPaywall } from './TPPaywall';
import { useAppStore } from '@ppa/store';
import { isAuthPage, isPublicPage, isMarketingPage } from '@/lib/constants';

export interface TPAppShellProps {
  children: React.ReactNode;
}

export function TPAppShell({ children }: TPAppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const team = useAppStore((state) => state.team);
  const user = useAppStore((state) => state.user);
  const authUser = useAppStore((state) => state.authUser);
  const isAppLoading = useAppStore((state) => state.isAppLoading);
  const isAppInitialized = useAppStore((state) => state.isAppInitialized);
  const initializeApp = useAppStore((state) => state.initializeApp);
  const adminIsImpersonating = useAppStore((state) => state.adminIsImpersonating);

  // Initialize app on mount - this must happen here (not in AppProvider)
  // because TPAppShell blocks children from rendering during loading state
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  const onAuthPage = isAuthPage(pathname);
  const onPublicPage = isPublicPage(pathname);
  const onMarketingPage = isMarketingPage(pathname);

  // Use authUser (Firebase auth) for auth checks - loads immediately
  // user (Firestore document) loads later and is used for user data
  const isAuthenticated = !!authUser;

  // Redirect authenticated users from root to dashboard
  useEffect(() => {
    if (pathname === '/' && isAuthenticated && !isAppLoading) {
      router.replace('/dashboard');
    }
  }, [pathname, isAuthenticated, isAppLoading, router]);

  // Redirect authenticated users from auth pages to dashboard
  // Wait for app to initialize before redirecting to avoid race conditions
  useEffect(() => {
    if (isAppInitialized && isAuthenticated && onAuthPage) {
      router.replace('/dashboard');
    }
  }, [isAppInitialized, isAuthenticated, onAuthPage, router]);

  // Redirect unauthenticated users from app pages to login
  useEffect(() => {
    if (isAppInitialized && !isAuthenticated && !onAuthPage && !onPublicPage && !onMarketingPage) {
      router.replace('/login');
    }
  }, [isAppInitialized, isAuthenticated, onAuthPage, onPublicPage, onMarketingPage, router]);

  // Auth pages, public pages, and marketing pages don't need the app shell
  // These should render immediately without waiting for auth state
  if (onAuthPage || onPublicPage || onMarketingPage) {
    // Show loading state while redirecting authenticated users from auth pages
    if (isAppInitialized && isAuthenticated && onAuthPage) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
          <div className="animate-pulse text-gray-400">Redirecting to dashboard...</div>
        </div>
      );
    }
    return <>{children}</>;
  }

  // Show loading state while app is initializing (only for app pages)
  if (isAppLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  // Show loading state while redirecting unauthenticated users
  if (isAppInitialized && !isAuthenticated && !onAuthPage && !onPublicPage && !onMarketingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="animate-pulse text-gray-400">Redirecting to login...</div>
      </div>
    );
  }

  // Show loading state while redirecting authenticated users from root
  if (pathname === '/' && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const userName = user ? `${user.fname} ${user.lname}` : undefined;
  const userEmail = user?.email;
  const teamName = team?.name;
  const teamLogoUrl = team?.logoUrl;

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
        <div className={`flex flex-1 overflow-hidden ${adminIsImpersonating ? 'pt-12' : ''}`}>
          <TPSidebar />
          <SidebarInset className="bg-[#f0f0f0] overflow-y-auto">
            <div className="p-6 max-w-7xl mx-auto w-full">{children}</div>
          </SidebarInset>
        </div>
      </div>

      {/* Global Paywall Modal */}
      <TPPaywall />
    </SidebarProvider>
  );
}
