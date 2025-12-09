import { useEffect } from 'react';
import { useAppStore } from '../store';

export function useAppInit() {
  const initializeApp = useAppStore((state) => state.initializeApp);
  const isAppInitialized = useAppStore((state) => state.isAppInitialized);
  const isAppLoading = useAppStore((state) => state.isAppLoading);
  const isCriticalDataLoaded = useAppStore((state) => state.isCriticalDataLoaded);
  const isBackgroundDataLoading = useAppStore((state) => state.isBackgroundDataLoading);
  const appError = useAppStore((state) => state.appError);
  const authUser = useAppStore((state) => state.authUser);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  return {
    isAppInitialized,
    isAppLoading,
    isCriticalDataLoaded,
    isBackgroundDataLoading,
    appError,
    isAuthenticated: !!authUser,
  };
}
