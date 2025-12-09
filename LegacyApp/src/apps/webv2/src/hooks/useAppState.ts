import { useAppStore } from '@ppa/store';

/**
 * Hook to access app-wide state
 */
export function useAppState() {
  const isAppLoading = useAppStore((state) => state.isAppLoading);
  const isAppInitialized = useAppStore((state) => state.isAppInitialized);
  const authUser = useAppStore((state) => state.authUser);
  const isAuthLoading = useAppStore((state) => state.isAuthLoading);
  const appError = useAppStore((state) => state.appError);

  return {
    isLoading: isAppLoading || isAuthLoading,
    isInitialized: isAppInitialized,
    isAuthenticated: !!authUser,
    authUser,
    appError,
  };
}
