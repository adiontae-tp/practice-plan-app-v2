'use client';

import { useCallback } from 'react';
import { useMobileWeb } from '../context/MWContext';

export interface UseNavigateOptions {
  /** Custom router push function (for framework integration) */
  routerPush?: (url: string) => void;
  /** Custom router back function */
  routerBack?: () => void;
  /** Custom router replace function */
  routerReplace?: (url: string) => void;
}

/**
 * useNavigate - Navigation hook with app-like transitions
 *
 * Provides navigation methods that trigger transitions before routing.
 * Pass your framework's router methods (e.g., Next.js useRouter) for integration.
 *
 * @example
 * ```tsx
 * const router = useRouter();
 * const { push, back } = useNavigate({
 *   routerPush: router.push,
 *   routerBack: router.back,
 * });
 *
 * <button onClick={() => push('/details')}>View Details</button>
 * <button onClick={back}>Go Back</button>
 * ```
 */
export function useNavigate(options: UseNavigateOptions = {}) {
  const { navigatePush, navigatePop, navigateFade, isMobile } = useMobileWeb();
  const { routerPush, routerBack, routerReplace } = options;

  /**
   * Navigate forward with push transition (slide in from right)
   */
  const push = useCallback(
    (url: string) => {
      if (isMobile) {
        navigatePush();
      }
      routerPush?.(url);
    },
    [navigatePush, routerPush, isMobile]
  );

  /**
   * Navigate back with pop transition (slide in from left)
   */
  const back = useCallback(() => {
    if (isMobile) {
      navigatePop();
    }
    routerBack?.();
  }, [navigatePop, routerBack, isMobile]);

  /**
   * Replace current route with fade transition
   */
  const replace = useCallback(
    (url: string) => {
      if (isMobile) {
        navigateFade();
      }
      routerReplace?.(url);
    },
    [navigateFade, routerReplace, isMobile]
  );

  /**
   * Navigate with custom transition
   */
  const navigateWithTransition = useCallback(
    (
      url: string,
      transition: 'push' | 'pop' | 'fade' | 'none' = 'push'
    ) => {
      if (isMobile) {
        switch (transition) {
          case 'push':
            navigatePush();
            break;
          case 'pop':
            navigatePop();
            break;
          case 'fade':
            navigateFade();
            break;
        }
      }
      routerPush?.(url);
    },
    [navigatePush, navigatePop, navigateFade, routerPush, isMobile]
  );

  return {
    push,
    back,
    replace,
    navigateWithTransition,
  };
}
