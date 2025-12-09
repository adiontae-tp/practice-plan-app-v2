import { StateCreator } from 'zustand';

/**
 * NavigationState - Store for managing mobile header back button navigation
 *
 * Allows pages to configure where the back button navigates to,
 * instead of relying on browser history.
 *
 * Usage:
 * ```typescript
 * useEffect(() => {
 *   setBackDestination('/menu');
 *   return () => clearBackNavigation();
 * }, []);
 * ```
 */
export interface NavigationState {
  /**
   * Where the back button should navigate to.
   * If null, falls back to default behavior (history.back or router.back)
   */
  backDestination: string | null;

  /**
   * Custom back handler function.
   * If provided, this takes priority over backDestination.
   * Useful for confirmations, validations, etc.
   */
  customBackHandler: (() => void) | null;

  /**
   * Set specific route for back button navigation
   * @param path - Route to navigate to (e.g., '/menu', '/templates')
   */
  setBackDestination: (path: string | null) => void;

  /**
   * Set custom handler for back button
   * @param handler - Function to call when back button is pressed
   */
  setCustomBackHandler: (handler: (() => void) | null) => void;

  /**
   * Clear all navigation configuration (reset to default)
   * Call this in useEffect cleanup to avoid lingering state
   */
  clearBackNavigation: () => void;
}

export const createNavigationSlice: StateCreator<NavigationState> = (set) => ({
  // Initial state
  backDestination: null,
  customBackHandler: null,

  // Actions
  setBackDestination: (path) =>
    set(() => ({
      backDestination: path,
    })),

  setCustomBackHandler: (handler) =>
    set(() => ({
      customBackHandler: handler,
    })),

  clearBackNavigation: () =>
    set(() => ({
      backDestination: null,
      customBackHandler: null,
    })),
});
