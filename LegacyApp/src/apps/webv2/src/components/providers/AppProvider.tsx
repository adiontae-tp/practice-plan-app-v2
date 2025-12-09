import { useEffect, type ReactNode } from 'react';
import { useAppStore } from '@ppa/store';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * App provider that initializes the store and manages app state
 */
export function AppProvider({ children }: AppProviderProps) {
  const initializeApp = useAppStore((state) => state.initializeApp);
  const initializeAuth = useAppStore((state) => state.initializeAuth);

  useEffect(() => {
    // Initialize auth listener
    initializeAuth();
    // Initialize app data
    initializeApp();
  }, [initializeApp, initializeAuth]);

  return <>{children}</>;
}
