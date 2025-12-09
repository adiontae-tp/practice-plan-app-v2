import { Loader2 } from 'lucide-react';

/**
 * Full-screen loading indicator
 */
export function LoadingScreen() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        <p className="text-typography-600 text-sm">Loading...</p>
      </div>
    </div>
  );
}
