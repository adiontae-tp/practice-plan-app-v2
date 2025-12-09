/**
 * Shared constants for the web app
 */

/**
 * Marketing page paths - single source of truth for page classification
 */
export const MARKETING_PATHS = [
  '/',
  '/features',
  '/for-coaches',
  '/directors',
  '/pricing',
  '/about',
  '/blog',
  '/contact',
  '/privacy',
  '/terms',
] as const;

/**
 * Auth page paths
 */
export const AUTH_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/auth/mobile', // Mobile-to-web auth handler
] as const;

/**
 * Public page paths (accessible without auth but not marketing pages)
 */
export const PUBLIC_PATHS = [
  '/share/',
] as const;

/**
 * Check if a pathname is a marketing page
 */
export function isMarketingPage(pathname: string | null): boolean {
  if (!pathname) return false;
  return MARKETING_PATHS.some(path =>
    path === '/' ? pathname === '/' : pathname.startsWith(path)
  );
}

/**
 * Check if a pathname is an auth page
 */
export function isAuthPage(pathname: string | null): boolean {
  if (!pathname) return false;
  return AUTH_PATHS.some(path => pathname.startsWith(path));
}

/**
 * Check if a pathname is a public page (shareable content)
 */
export function isPublicPage(pathname: string | null): boolean {
  if (!pathname) return false;
  return PUBLIC_PATHS.some(path => pathname.startsWith(path));
}
