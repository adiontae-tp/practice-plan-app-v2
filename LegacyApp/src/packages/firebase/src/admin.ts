/**
 * Admin utilities for user impersonation and migration testing.
 * Access restricted to specific admin email.
 */

// Admin email - only this user can access admin features
export const ADMIN_EMAIL = 'adiontae.gerron@gmail.com';

/**
 * Check if the given email is an admin
 */
export const isAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

/**
 * Check if the current user is an admin based on their email
 */
export const isCurrentUserAdmin = (userEmail: string | null | undefined): boolean => {
  return isAdmin(userEmail);
};
