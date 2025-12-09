/**
 * Mobile Web Route Configuration
 *
 * Defines route mappings between desktop and mobile web views.
 * Use this to redirect desktop routes to mobile-specific routes
 * or to define which routes show the tab bar.
 */

export interface RouteConfig {
  /** Desktop route path */
  desktop: string;
  /** Mobile route path (if different from desktop) */
  mobile: string;
  /** Page title for mobile header */
  title: string;
  /** Whether this is a main tab page (shows tab bar) */
  isTabPage?: boolean;
  /** Which tab this route belongs to */
  tabId?: string;
}

export interface MobileRouteConfig {
  /** Route configurations */
  routes: RouteConfig[];
  /** Tab bar configuration */
  tabs: TabConfig[];
  /** Default route for mobile */
  defaultRoute: string;
}

export interface TabConfig {
  /** Unique tab identifier */
  id: string;
  /** Tab label */
  label: string;
  /** Route when tab is pressed */
  route: string;
  /** Icon component name (for reference) */
  iconName: string;
}

/**
 * Default mobile route configuration
 * Can be overridden by passing custom config to MWProvider
 */
export const defaultMobileRoutes: MobileRouteConfig = {
  defaultRoute: '/practice',
  tabs: [
    { id: 'practice', label: 'Practice', route: '/practice', iconName: 'ClipboardList' },
    { id: 'calendar', label: 'Calendar', route: '/calendar', iconName: 'Calendar' },
    { id: 'menu', label: 'Menu', route: '/menu', iconName: 'LayoutGrid' },
  ],
  routes: [
    // Tab pages (show tab bar)
    { desktop: '/dashboard', mobile: '/practice', title: 'Practice', isTabPage: true, tabId: 'practice' },
    { desktop: '/practice', mobile: '/practice', title: 'Practice', isTabPage: true, tabId: 'practice' },
    { desktop: '/calendar', mobile: '/calendar', title: 'Calendar', isTabPage: true, tabId: 'calendar' },
    { desktop: '/menu', mobile: '/menu', title: 'Menu', isTabPage: true, tabId: 'menu' },

    // Detail pages (no tab bar, show back button)
    { desktop: '/periods', mobile: '/periods', title: 'Period Templates' },
    { desktop: '/templates', mobile: '/templates', title: 'Practice Templates' },
    { desktop: '/announcements', mobile: '/announcements', title: 'Announcements' },
    { desktop: '/files', mobile: '/files', title: 'Files' },
    { desktop: '/tags', mobile: '/tags', title: 'Tags' },
    { desktop: '/coaches', mobile: '/coaches', title: 'Coaches' },
    { desktop: '/reports', mobile: '/reports', title: 'Reports' },
    { desktop: '/profile', mobile: '/profile', title: 'Profile' },
    { desktop: '/team', mobile: '/team', title: 'Team Settings' },
    { desktop: '/subscription', mobile: '/subscription', title: 'Subscription' },
  ],
};

/**
 * Get mobile route for a desktop route
 */
export function getMobileRoute(desktopPath: string, config: MobileRouteConfig = defaultMobileRoutes): string {
  const route = config.routes.find(r =>
    desktopPath === r.desktop || desktopPath.startsWith(r.desktop + '/')
  );
  return route?.mobile ?? desktopPath;
}

/**
 * Get desktop route for a mobile route
 */
export function getDesktopRoute(mobilePath: string, config: MobileRouteConfig = defaultMobileRoutes): string {
  const route = config.routes.find(r =>
    mobilePath === r.mobile || mobilePath.startsWith(r.mobile + '/')
  );
  return route?.desktop ?? mobilePath;
}

/**
 * Get route config for a path
 */
export function getRouteConfig(path: string, config: MobileRouteConfig = defaultMobileRoutes): RouteConfig | undefined {
  return config.routes.find(r =>
    path === r.desktop || path === r.mobile ||
    path.startsWith(r.desktop + '/') || path.startsWith(r.mobile + '/')
  );
}

/**
 * Check if a path is a tab page
 */
export function isTabPage(path: string, config: MobileRouteConfig = defaultMobileRoutes): boolean {
  const route = getRouteConfig(path, config);
  return route?.isTabPage ?? false;
}

/**
 * Get active tab ID for a path
 */
export function getActiveTabId(path: string, config: MobileRouteConfig = defaultMobileRoutes): string {
  const route = getRouteConfig(path, config);
  return route?.tabId ?? '';
}

/**
 * Get page title for a path
 */
export function getPageTitle(path: string, config: MobileRouteConfig = defaultMobileRoutes): string {
  const route = getRouteConfig(path, config);
  return route?.title ?? 'Practice Plan';
}
