'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@ppa/store';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Global impersonation banner that shows on all pages when admin is viewing as another user
 * Allows quick return to admin account from anywhere in the app
 */
export function TPImpersonationBanner() {
  const router = useRouter();
  const {
    adminIsImpersonating,
    adminImpersonatedUser,
    stopImpersonation,
    restoreOriginalUser,
  } = useAppStore();

  const handleStopImpersonation = useCallback(() => {
    // Clear admin impersonation state
    stopImpersonation();

    // Restore original user's data subscriptions
    restoreOriginalUser();

    toast.success('Returned to your account');

    // Navigate to admin page and refresh
    setTimeout(() => {
      router.push('/admin');
      router.refresh();
    }, 500);
  }, [stopImpersonation, restoreOriginalUser, router]);

  // Don't render if not impersonating
  if (!adminIsImpersonating || !adminImpersonatedUser) {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-50 bg-amber-500 border-b border-amber-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-2 text-white">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">
              Viewing as {adminImpersonatedUser.fname} {adminImpersonatedUser.lname}
            </span>
            <span className="text-xs opacity-90">({adminImpersonatedUser.email})</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStopImpersonation}
            className="text-white hover:bg-amber-600 hover:text-white h-8"
          >
            <EyeOff className="h-4 w-4 mr-2" />
            Return to Admin
          </Button>
        </div>
      </div>
    </div>
  );
}
