'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@ppa/store';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationProvider } from './NotificationProvider';
import { TeamThemeProvider } from './TeamThemeProvider';
import { TPImpersonationBanner } from '@/components/tp';
import { isAuthPage, isPublicPage, isMarketingPage } from '@/lib/constants';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // Note: initializeApp() is called in TPAppShell, not here
  // We just read the state from the store
  const isCriticalDataLoaded = useAppStore((state) => state.isCriticalDataLoaded);
  const appError = useAppStore((state) => state.appError);
  const pathname = usePathname();

  const onAuthPage = isAuthPage(pathname);
  const onPublicPage = isPublicPage(pathname);
  const onMarketingPage = isMarketingPage(pathname);

  const skipLoadingState = onAuthPage || onPublicPage || onMarketingPage;

  if (!isCriticalDataLoaded && !skipLoadingState) {
    return (
      <div className="w-full h-full p-4 space-y-4">
        {/* Dashboard Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 bg-white rounded-xl border space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Chart Skeleton */}
          <div className="col-span-4 p-6 bg-white rounded-xl border">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
          
          {/* Recent Items Skeleton */}
          <div className="col-span-3 p-6 bg-white rounded-xl border">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (appError) {
    return (
      <div className="flex h-full min-h-[50vh] w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <svg
              className="h-6 w-6 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-foreground">Something went wrong</p>
            <p className="text-sm text-muted-foreground">{appError}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <TeamThemeProvider>
      <TPImpersonationBanner />
      <NotificationProvider>{children}</NotificationProvider>
    </TeamThemeProvider>
  );
}
